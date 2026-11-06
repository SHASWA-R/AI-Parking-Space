"""
Seabed background generation.

Two ways to get a background:

  1. `load_real_background()` -- a real SSS tile with no target in it.
     THIS IS WHAT TRAINING SHOULD USE. Real seabed texture is the whole
     reason the model generalises.

  2. `synthesise_seabed()` -- a procedural fallback so the pipeline is
     runnable and testable before the real corpus is assembled.

The procedural seabed deliberately includes the two confounders the
problem statement names:

  * sand ripples -- periodic, and therefore the direct adversary of the
    mesh-signature detector. Ripple wavelength is 0.3-2.0 m against a
    net mesh pitch of 0.02-0.15 m, so the two separate cleanly by scale.
  * rock clusters -- compact, high-relief, strong shadow, no periodicity.
"""

import numpy as np
import cv2

from .sss_config import SonarConfig


def _correlated_noise(shape, sigma, rng):
    n = rng.standard_normal(shape).astype(np.float32)
    k = max(3, int(sigma * 4) | 1)
    return cv2.GaussianBlur(n, (k, k), sigma)


def _normalise(a):
    lo, hi = float(a.min()), float(a.max())
    return (a - lo) / (hi - lo + 1e-9)


def synthesise_seabed(cfg: SonarConfig, rng: np.random.Generator,
                      with_ripples: bool = True):
    """
    Procedural seabed reflectivity and relief.

    Returns (reflectivity 0..1, height_m) both shaped (height, width).
    """
    h, w = cfg.height, cfg.width

    # base sediment texture at two scales
    base = 0.55 * _normalise(_correlated_noise((h, w), 9.0, rng))
    base += 0.30 * _normalise(_correlated_noise((h, w), 2.5, rng))
    relief = np.zeros((h, w), np.float32)

    if with_ripples:
        # Sand ripples: periodic, but an order of magnitude coarser than
        # any fishing net mesh. This is the confounder the detector must
        # reject on scale, not on presence of periodicity.
        wavelength_m = rng.uniform(0.30, 2.00)
        angle = rng.uniform(0, np.pi)
        amp = rng.uniform(0.03, 0.10)

        rows = np.arange(h)[:, None]
        cols = np.arange(w)[None, :]

        along = rows * cfg.along_track_res_m
        slant = cfg.slant_range(cols)
        ground = np.nan_to_num(cfg.ground_range(slant))

        phase = (np.cos(angle) * along + np.sin(angle) * ground) \
            * (2 * np.pi / wavelength_m)
        ripple = np.sin(phase).astype(np.float32)

        base += amp * ripple
        relief += (amp * 0.35) * ripple

    return np.clip(base, 0.0, 1.0).astype(np.float32), relief


def scatter_rocks(cfg: SonarConfig, rng: np.random.Generator,
                  reflect, relief, n_rocks=None):
    """
    Add rock clusters: compact, high relief, aperiodic.

    These are the negative class. A rock produces a strong highlight and
    a long shadow, so shadow evidence alone cannot separate rock from
    net -- which is exactly why the mesh signature is needed.
    """
    n_rocks = n_rocks if n_rocks is not None else int(rng.integers(3, 12))
    ground_max = np.sqrt(cfg.slant_range_max_m ** 2 - cfg.altitude_m ** 2)
    boxes = []

    for _ in range(n_rocks):
        g = rng.uniform(0.15, 0.95) * ground_max
        starboard = bool(rng.integers(0, 2))
        col = float(cfg.col_from_ground(np.array(g), starboard))
        row = float(rng.uniform(0.05, 0.95) * cfg.height)

        radius_m = rng.uniform(0.3, 1.6)
        height_m = radius_m * rng.uniform(0.5, 1.3)

        gres = cfg.ground_res_at(g)
        rx = max(2.0, radius_m / max(gres, 1e-6))
        ry = max(2.0, radius_m / cfg.along_track_res_m)

        yy, xx = np.ogrid[:cfg.height, :cfg.width]
        d = ((xx - col) / rx) ** 2 + ((yy - row) / ry) ** 2
        mask = np.clip(1.0 - d, 0.0, 1.0) ** 0.6

        reflect += 0.55 * mask
        relief += height_m * mask
        boxes.append((col, row, rx, ry))

    return np.clip(reflect, 0, 1.4), relief, boxes


def load_real_background(path, cfg: SonarConfig):
    """Load and letterbox a real SSS tile to the configured geometry."""
    img = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"could not read background: {path}")
    img = cv2.resize(img, (cfg.width, cfg.height), interpolation=cv2.INTER_AREA)
    return (img.astype(np.float32) / 255.0), np.zeros_like(img, np.float32)
