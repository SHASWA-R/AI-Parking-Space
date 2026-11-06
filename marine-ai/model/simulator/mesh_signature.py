"""
ACOUSTIC MESH SIGNATURE
=======================

Reference implementation of the project's primary novel claim.

A fishing net is the only marine object with regular periodic
sub-structure at centimetre scale. Rocks, coral and wrecks have none.
Sand ripples do, but at 0.3-2.0 m -- an order of magnitude coarser than
any net mesh -- so the two separate cleanly on scale.

Algorithm
---------
1. Resample the patch to isotropic metric pixels, because across-track
   and along-track resolution differ.
2. 2D FFT -> magnitude -> radial average. Radial averaging makes the
   result orientation-invariant, which matters because a ghost net lies
   at an arbitrary angle to the track.
3. WHITEN the profile against a smoothed baseline. Sonar spectra are
   red -- energy falls as 1/f -- so a raw argmax always returns the
   lowest frequency available and tells you nothing. Dividing by a
   smoothed continuum turns "which frequency is strongest" into "which
   frequency stands above its neighbours", which is the actual question.
4. Peak-pick inside the physically plausible mesh band, subject to
   Nyquist.

Step 3 is not cosmetic. Without it the detector returns the band edge
for every input, and a bare rock scores higher than a net.

This module is the Python reference. The production implementation is
Java (`MeshSignatureService`) using Core.dft(); this exists to validate
the method against simulator ground truth before porting.
"""

from dataclasses import dataclass

import cv2
import numpy as np

# Plausible fishing-net mesh pitches. Indicative prototype values for
# demonstration, NOT a regulatory reference.
MESH_PITCH_MIN_M = 0.020
MESH_PITCH_MAX_M = 0.180

# Below this peak-to-baseline ratio the periodicity is not considered
# real. Tuned on simulator data; re-tune on real imagery.
STRENGTH_THRESHOLD = 1.6


@dataclass
class MeshResult:
    pitch_m: float | None
    strength: float
    resolvable: bool
    samples_per_period: float
    profile: np.ndarray | None = None
    freqs: np.ndarray | None = None

    @property
    def detected(self) -> bool:
        return (self.pitch_m is not None
                and self.resolvable
                and self.strength >= STRENGTH_THRESHOLD)

    @property
    def pitch_cm(self):
        return None if self.pitch_m is None else round(self.pitch_m * 100, 2)


def _isotropic(patch, res_across_m, res_along_m):
    """Resample so one pixel is the same number of metres on both axes."""
    target = min(res_across_m, res_along_m)
    fx = res_across_m / target
    fy = res_along_m / target
    if abs(fx - 1) < 1e-3 and abs(fy - 1) < 1e-3:
        return patch.astype(np.float32), target
    h, w = patch.shape
    out = cv2.resize(patch.astype(np.float32),
                     (max(8, int(round(w * fx))), max(8, int(round(h * fy)))),
                     interpolation=cv2.INTER_LINEAR)
    return out, target


def _radial_profile(mag):
    """Rotationally averaged magnitude spectrum."""
    h, w = mag.shape
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    # normalise radius so both axes span the same frequency range
    r = np.sqrt(((y - cy) / h) ** 2 + ((x - cx) / w) ** 2)

    n_bins = min(h, w) // 2
    freqs = np.linspace(0, 0.5, n_bins, endpoint=False)
    idx = np.clip((r / 0.5 * n_bins).astype(int), 0, n_bins - 1)

    total = np.bincount(idx.ravel(), weights=mag.ravel(), minlength=n_bins)
    count = np.bincount(idx.ravel(), minlength=n_bins)
    return freqs, total / np.maximum(count, 1)


def _whiten(profile, smooth_bins=9):
    """
    Divide out the red-noise continuum.

    Returns profile / smoothed(profile), so a value of 2.0 means "twice
    the energy its neighbouring frequencies would predict".
    """
    k = smooth_bins | 1
    pad = np.pad(profile, k // 2, mode="edge")
    baseline = np.convolve(pad, np.ones(k) / k, mode="valid")
    return profile / (baseline + 1e-9)


def analyse(patch: np.ndarray,
            res_across_m: float,
            res_along_m: float,
            pitch_min_m: float = MESH_PITCH_MIN_M,
            pitch_max_m: float = MESH_PITCH_MAX_M) -> MeshResult:
    """Estimate mesh pitch from a detection patch."""
    if patch.ndim != 2 or min(patch.shape) < 16:
        return MeshResult(None, 0.0, False, 0.0)

    iso, res_m = _isotropic(patch, res_across_m, res_along_m)

    p = iso - iso.mean()
    win = np.outer(np.hanning(p.shape[0]), np.hanning(p.shape[1]))
    mag = np.abs(np.fft.fftshift(np.fft.fft2(p * win)))

    freqs, prof = _radial_profile(mag)
    white = _whiten(prof)

    # Nyquist floor: need at least 2.5 samples per period
    nyquist_pitch = 2.5 * res_m
    lo = max(pitch_min_m, nyquist_pitch)
    hi = pitch_max_m
    if lo >= hi:
        return MeshResult(None, 0.0, False, 0.0, white, freqs)

    with np.errstate(divide="ignore"):
        period_px = np.where(freqs > 0, 1.0 / np.maximum(freqs, 1e-9), np.inf)
    pitch_m = period_px * res_m

    band = (pitch_m >= lo) & (pitch_m <= hi) & (freqs > 0) & (freqs < 0.5)
    if band.sum() < 3:
        return MeshResult(None, 0.0, False, 0.0, white, freqs)

    vals = np.where(band, white, 0.0)
    k = int(np.argmax(vals))
    pitch = float(pitch_m[k])
    strength = float(white[k])
    spp = pitch / res_m

    return MeshResult(pitch_m=pitch, strength=strength,
                      resolvable=spp >= 2.5, samples_per_period=round(spp, 2),
                      profile=white, freqs=freqs)


def infer_gear_type(pitch_m: float | None) -> str:
    """
    Indicative gear class from mesh pitch.

    This is a demonstration heuristic, NOT forensic identification.
    Real mesh regulations vary by state, fishery and species.
    """
    if pitch_m is None:
        return "unknown"
    cm = pitch_m * 100
    if cm < 3.0:
        return "Purse seine / fine mesh (indicative)"
    if cm < 5.5:
        return "Small-mesh gillnet (indicative)"
    if cm < 9.0:
        return "Large-mesh gillnet (indicative)"
    if cm < 16.0:
        return "Trawl net (indicative)"
    return "Coarse netting / unknown gear (indicative)"
