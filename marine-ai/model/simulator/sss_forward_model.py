"""
Side-scan sonar acoustic forward model.

Renders a seabed scene into a slant-range waterfall image the way a
towfish would see it. Modelled effects:

  highlight       reflectivity modulated by local grazing angle
  shadow          ray-traced horizon sweep in ground range
  speckle         Rayleigh-distributed multiplicative noise
  falloff         residual across-track intensity loss after TVG
  nadir gap       water column, no seabed return inside R < H
  slant distortion  implicit: the image is rendered in slant range,
                    so the seabed is compressed near nadir

The shadow sweep is the important part. A point on the seabed is
visible only if no closer point subtends a shallower depression angle
from the towfish:

    r(G) = (H - z(G)) / G          depression ratio
    visible  <=>  r(G) < min r(G') for all G' < G

which is a running minimum along each ping. Nets are low, so their
shadows are short -- that is precisely why they are hard to detect on
shadow evidence alone, and why the mesh signature matters.
"""

import numpy as np
import cv2

from .sss_config import SonarConfig


SUBSAMPLE = ((0.25, 0.25), (0.25, 0.75), (0.75, 0.25), (0.75, 0.75))


def _grid(cfg: SonarConfig, drow: float = 0.0, dcol: float = 0.0):
    rows = (np.arange(cfg.height, dtype=np.float32) + drow)[:, None]
    cols = (np.arange(cfg.width, dtype=np.float32) + dcol)[None, :]

    along = rows * cfg.along_track_res_m
    slant = cfg.slant_range(cols)
    ground = cfg.ground_range(slant)          # NaN inside nadir gap
    starboard = cols >= cfg.half_width

    return (np.broadcast_to(along, (cfg.height, cfg.width)).astype(np.float32),
            np.broadcast_to(slant, (cfg.height, cfg.width)).astype(np.float32),
            np.broadcast_to(ground, (cfg.height, cfg.width)).astype(np.float32),
            np.broadcast_to(starboard, (cfg.height, cfg.width)))


def sample_target(cfg, target, on_starboard: bool):
    """
    Integrate the net fields over each pixel by 2x2 supersampling.

    Point-sampling a mesh finer than the pixel grid aliases it into
    noise and destroys the very periodicity the detector is meant to
    find. Averaging sub-pixel samples reproduces what a real sonar does:
    it measures the mean backscatter over the footprint, so a mesh below
    the resolution limit smears into uniform brightness -- correctly,
    rather than into a false pattern.

    Returns (reflectivity, height, valid_mask).
    """
    acc_r = np.zeros((cfg.height, cfg.width), np.float32)
    acc_h = np.zeros((cfg.height, cfg.width), np.float32)
    valid_any = np.zeros((cfg.height, cfg.width), bool)

    for drow, dcol in SUBSAMPLE:
        along, _, ground, starboard_mask = _grid(cfg, drow, dcol)
        channel = starboard_mask if on_starboard else ~starboard_mask
        valid = channel & np.isfinite(ground)
        g = np.where(valid, ground, 0.0)

        acc_r += np.where(valid, target.reflectivity(along, g), 0.0)
        acc_h += np.where(valid, target.height(along, g), 0.0)
        valid_any |= valid

    n = len(SUBSAMPLE)
    return acc_r / n, acc_h / n, valid_any


def add_target(cfg, reflect, relief, target, on_starboard: bool):
    """Composite a NetTarget into the scene on one channel."""
    r, h, valid = sample_target(cfg, target, on_starboard)
    reflect = np.where(valid, np.clip(reflect + 1.15 * r, 0, 1.6), reflect)
    relief = np.where(valid, np.maximum(relief, h), relief)
    return reflect, relief, r, valid


def _shadow_mask(cfg, ground, relief, starboard_mask):
    """
    Ray-traced shadowing, swept outward from nadir on each channel.
    Returns 1.0 where lit, ~0.05 where fully shadowed.
    """
    H = cfg.altitude_m
    g = np.where(np.isfinite(ground), ground, 1e-6)
    g = np.maximum(g, 1e-3)

    ratio = (H - relief) / g                     # depression ratio
    ratio = np.where(np.isfinite(ground), ratio, np.inf)

    lit = np.ones_like(ratio, dtype=np.float32)

    # starboard: ground range increases with column index
    stb = ratio[:, cfg.half_width:]
    run_min = np.minimum.accumulate(stb, axis=1)
    prev = np.concatenate([np.full((stb.shape[0], 1), np.inf, np.float32),
                           run_min[:, :-1]], axis=1)
    lit[:, cfg.half_width:] = (stb < prev).astype(np.float32)

    # port: ground range increases with decreasing column index
    prt = ratio[:, :cfg.half_width][:, ::-1]
    run_min = np.minimum.accumulate(prt, axis=1)
    prev = np.concatenate([np.full((prt.shape[0], 1), np.inf, np.float32),
                           run_min[:, :-1]], axis=1)
    lit[:, :cfg.half_width] = (prt < prev).astype(np.float32)[:, ::-1]

    # finite beam width softens the shadow edge
    lit = cv2.GaussianBlur(lit, (0, 0), 1.2)
    return 0.05 + 0.95 * lit


def render(cfg: SonarConfig, reflect, relief, rng: np.random.Generator,
           speckle_strength: float = 0.55,
           falloff_exp: float = 0.85):
    """Reflectivity + relief -> 8-bit slant-range waterfall image."""
    _, slant, ground, starboard_mask = _grid(cfg)

    shadow = _shadow_mask(cfg, ground, relief, starboard_mask)

    # local grazing angle brightens relief facing the towfish
    grad = np.gradient(relief, axis=1).astype(np.float32)
    facing = np.clip(1.0 + 2.2 * np.where(starboard_mask, -grad, grad), 0.4, 2.2)

    signal = reflect * facing * shadow

    # residual across-track falloff after imperfect TVG
    r_norm = np.clip(slant / cfg.slant_range_max_m, 1e-3, 1.0)
    signal = signal * (r_norm ** -0.0) * (1.0 - falloff_exp * 0.35 * r_norm)

    # Rayleigh speckle, multiplicative
    speckle = rng.rayleigh(scale=1.0 / np.sqrt(2.0),
                           size=signal.shape).astype(np.float32)
    signal = signal * (1.0 - speckle_strength + speckle_strength * speckle)

    # nadir gap: water column returns almost nothing
    water = ~np.isfinite(ground)
    signal = np.where(water, rng.uniform(0.0, 0.05, size=signal.shape), signal)

    # bright first-return line at the seabed intercept
    first_return = np.abs(slant - cfg.altitude_m) < (1.5 * cfg.slant_res_m)
    signal = np.where(first_return, np.clip(signal + 0.75, 0, 2.0), signal)

    signal = np.clip(signal, 0.0, None)
    hi = np.percentile(signal, 99.5)
    img = np.clip(signal / (hi + 1e-9), 0, 1)
    img = (img ** 0.85 * 255.0).astype(np.uint8)
    return img
