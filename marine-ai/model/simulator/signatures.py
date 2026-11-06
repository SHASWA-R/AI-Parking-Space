"""
ACOUSTIC GEOMETRIC REGULARITY — signature library
=================================================

Core thesis: manufactured objects are geometrically regular; nature is
not. The seabed contains no straight lines, no right angles, no perfect
circles and no repeating grids. Each of those is measurable directly
from a sonar patch.

Five tests, each returning a score in roughly 0..1 plus the physical
quantity it measured:

    periodicity   nets, mesh, grating          -> mesh pitch (m)
    linearity     cables, ropes, pipes         -> orientation, straightness
    circularity   drums, tyres, buoys          -> radius (m)
    angularity    containers, crates           -> corner count, dominant angle
    irregularity  rocks, coral  -> REJECT      -> boundary roughness

A detection is classified by whichever man-made signature scores
highest, and rejected when irregularity dominates all of them.

This is the validated Python reference. The production implementation
is Java (`SignatureService`); this exists so the method can be measured
against simulator ground truth before porting.
"""

from dataclasses import dataclass

import cv2
import numpy as np

from .mesh_signature import analyse as mesh_analyse, infer_gear_type


# Shared smoothing for every boundary-shape signature. All four must
# judge the SAME mask or their scores are not comparable to each other.
SHAPE_SMOOTH = 1.2


@dataclass
class SignatureScore:
    name: str
    score: float
    detail: dict


# ------------------------------------------------------------ preparation

def _prep(patch, smooth: float = 2.0):
    """
    Normalise a patch to 0..1 float and produce a clean object mask.

    Two clean-up steps that turned out to be essential:

      * FILL INTERNAL HOLES. A net is full of them by definition. Left
        unfilled they inflate the boundary perimeter enormously, and
        every boundary-shape measure then reports the net as maximally
        irregular -- the opposite of the truth.

      * SMOOTH AT SPECKLE SCALE. Rayleigh speckle makes every boundary
        ragged. Without smoothing, roughness measures the noise rather
        than the object, and man-made and natural become
        indistinguishable.
    """
    p = patch.astype(np.float32)
    p = (p - p.min()) / (np.ptp(p) + 1e-9)
    blur = cv2.GaussianBlur(p, (0, 0), 1.4)
    thr = float(np.percentile(blur, 72))
    mask = (blur > thr).astype(np.uint8)

    # keep the largest connected component: the object, not the speckle
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        mask = (lab == big).astype(np.uint8)

    # bridge mesh gaps, then fill the outer boundary solid
    k = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if cs:
        filled = np.zeros_like(mask)
        cv2.drawContours(filled, [max(cs, key=cv2.contourArea)], -1, 1, -1)
        mask = filled

    # smooth away speckle-scale raggedness, preserve real shape
    if smooth > 0:
        sm = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), smooth)
        cand = (sm > 0.5).astype(np.uint8)
        # never smooth an object out of existence -- thin structures such
        # as cables are only a few pixels wide and would vanish
        if cand.sum() > 0.35 * mask.sum():
            mask = cand
    return p, mask


def _contour(mask):
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cs:
        return None
    return max(cs, key=cv2.contourArea)


# ------------------------------------------------------------ periodicity

def periodicity(patch, res_across_m, res_along_m):
    """Nets and mesh. Delegates to the validated mesh detector."""
    r = mesh_analyse(patch, res_across_m, res_along_m)
    # map peak-to-baseline strength (~1.0 = nothing, ~2.0 = strong) to 0..1
    score = float(np.clip((r.strength - 1.0) / 1.2, 0.0, 1.0)) if r.detected else 0.0
    return SignatureScore("periodicity", score, {
        "mesh_pitch_cm": r.pitch_cm,
        "strength": round(r.strength, 3),
        "resolvable": r.resolvable,
        "samples_per_period": r.samples_per_period,
        "gear_type": infer_gear_type(r.pitch_m) if r.detected else None,
    })


# --------------------------------------------------------------- linearity

def linearity(patch, res_across_m, res_along_m):
    """
    Cables, ropes, pipes, chains.

    Two independent pieces of evidence:
      * elongation  -- the minimum-area rectangle is long and thin
      * straightness -- the object hugs its own principal axis

    Elongation alone is not enough: a drifting sand ridge is elongated
    too. Straightness is what a natural feature fails.
    """
    _, mask = _prep(patch, smooth=SHAPE_SMOOTH)
    c = _contour(mask)
    if c is None or len(c) < 12:
        return SignatureScore("linearity", 0.0, {})

    (cx, cy), (w, h), angle = cv2.minAreaRect(c)
    if min(w, h) < 1e-6:
        return SignatureScore("linearity", 0.0, {})
    elong = max(w, h) / min(w, h)

    pts = c.reshape(-1, 2).astype(np.float32)
    mean = pts.mean(0)
    u, s, vt = np.linalg.svd(pts - mean, full_matrices=False)
    axis = vt[0]
    perp = np.array([-axis[1], axis[0]])
    # RMS deviation from the principal axis, relative to object length
    dev = np.abs((pts - mean) @ perp)
    span = float(np.abs((pts - mean) @ axis).max() * 2) + 1e-9
    straightness = 1.0 - np.clip(dev.mean() / (0.10 * span), 0.0, 1.0)

    e_score = np.clip((elong - 3.0) / 7.0, 0.0, 1.0)
    score = float(np.sqrt(max(e_score, 0) * max(straightness, 0)))

    length_m = max(w, h) * res_across_m
    return SignatureScore("linearity", score, {
        "elongation": round(float(elong), 2),
        "straightness": round(float(straightness), 3),
        "orientation_deg": round(float(angle), 1),
        "approx_length_m": round(float(length_m), 2),
    })


# ------------------------------------------------------------- circularity

def circularity(patch, res_across_m, res_along_m):
    """
    Drums, tyres, buoys.

    Isoperimetric ratio 4*pi*A / P^2 is 1.0 for a perfect circle and
    falls away for anything else. Combined with radial consistency:
    how little the boundary radius varies around the centroid.
    """
    _, mask = _prep(patch, smooth=SHAPE_SMOOTH)
    c = _contour(mask)
    if c is None or len(c) < 12:
        return SignatureScore("circularity", 0.0, {})

    area = float(cv2.contourArea(c))
    perim = float(cv2.arcLength(c, True))
    if perim < 1e-6 or area < 12:
        return SignatureScore("circularity", 0.0, {})

    iso = 4.0 * np.pi * area / (perim ** 2)

    pts = c.reshape(-1, 2).astype(np.float32)
    ctr = pts.mean(0)
    r = np.linalg.norm(pts - ctr, axis=1)
    consistency = 1.0 - np.clip(r.std() / (r.mean() + 1e-9), 0.0, 1.0)

    score = float(np.clip(iso, 0, 1) ** 1.5 * consistency)
    radius_m = float(r.mean()) * res_across_m

    return SignatureScore("circularity", score, {
        "isoperimetric": round(float(iso), 3),
        "radial_consistency": round(float(consistency), 3),
        "approx_radius_m": round(radius_m, 3),
    })


# -------------------------------------------------------------- angularity

def angularity(patch, res_across_m, res_along_m):
    """
    Containers, crates, machinery.

    Polygonal approximation of the boundary, then count interior angles
    close to 90 degrees. Nature does not produce right angles; a rock
    approximated to a polygon yields angles scattered across the range.
    """
    _, mask = _prep(patch, smooth=SHAPE_SMOOTH)
    c = _contour(mask)
    if c is None or len(c) < 12:
        return SignatureScore("angularity", 0.0, {})

    peri = cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, 0.02 * peri, True).reshape(-1, 2).astype(np.float32)
    n = len(approx)
    if n < 3:
        return SignatureScore("angularity", 0.0, {})

    angles = []
    for i in range(n):
        a, b, cc = approx[i - 1], approx[i], approx[(i + 1) % n]
        v1, v2 = a - b, cc - b
        n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
        if n1 < 1e-6 or n2 < 1e-6:
            continue
        cosang = np.clip(np.dot(v1, v2) / (n1 * n2), -1, 1)
        angles.append(float(np.degrees(np.arccos(cosang))))
    if not angles:
        return SignatureScore("angularity", 0.0, {})

    angles = np.array(angles)
    right = np.abs(angles - 90.0) < 15.0
    n_right = int(right.sum())

    # rectangle-ness: how well the shape fills its own bounding rect
    (_, _), (w, h), _ = cv2.minAreaRect(c)
    rect_fill = float(cv2.contourArea(c)) / (w * h + 1e-9)

    hull = cv2.convexHull(c)
    convexity = float(cv2.contourArea(c)) / (float(cv2.contourArea(hull)) + 1e-9)

    # Edge straightness: how far the real contour strays from the straight
    # chord joining consecutive polygon vertices.
    #
    # This must walk the contour ARC between the two vertices. Selecting
    # points by projection onto the edge axis also picks up the opposite
    # side of the object, which measures the object's width instead of
    # the edge's deviation and makes every shape look curved.
    cpts = c.reshape(-1, 2).astype(np.float32)
    idx = [int(np.argmin(np.linalg.norm(cpts - v, axis=1))) for v in approx]
    devs = []
    for i in range(n):
        i0, i1 = idx[i], idx[(i + 1) % n]
        arc = (cpts[i0:i1 + 1] if i1 > i0
               else np.vstack([cpts[i0:], cpts[:i1 + 1]]))
        if len(arc) < 4:
            continue
        a, b = approx[i], approx[(i + 1) % n]
        ab = b - a
        L = float(np.linalg.norm(ab))
        if L < 1e-6:
            continue
        nrm = np.array([-ab[1], ab[0]], dtype=np.float32) / L
        devs.append(float(np.abs((arc - a) @ nrm).mean()) / L)
    edge_straight = 1.0 - np.clip((np.mean(devs) if devs else 0.5) / 0.08, 0, 1)

    corner_score = np.clip(n_right / 4.0, 0.0, 1.0)
    score = float((corner_score * np.clip(rect_fill, 0, 1)
                   * np.clip(convexity, 0, 1) ** 2
                   * max(edge_straight, 0.0)) ** (1 / 4))

    return SignatureScore("angularity", score, {
        "vertices": n,
        "right_angles": n_right,
        "rect_fill": round(rect_fill, 3),
        "convexity": round(convexity, 3),
        "edge_straightness": round(float(edge_straight), 3),
        "mean_angle_dev": round(float(np.abs(angles - 90).mean()), 1),
    })


# ------------------------------------------------------------ irregularity

def irregularity(patch, res_across_m, res_along_m):
    """
    Rocks, coral, sediment mounds. This is the REJECTION channel.

    Two measures of natural disorder:
      * boundary roughness -- perimeter far exceeds that of its convex
        hull, meaning a lumpy, re-entrant outline
      * spectral flatness of the boundary radius -- energy spread across
        many angular modes with no dominant one, which is what a random
        natural outline looks like
    """
    _, mask = _prep(patch, smooth=SHAPE_SMOOTH)
    c = _contour(mask)
    if c is None or len(c) < 16:
        return SignatureScore("irregularity", 0.0, {})

    hull = cv2.convexHull(c)
    p_c = float(cv2.arcLength(c, True))
    p_h = float(cv2.arcLength(hull, True))
    # convexity defect ratio: 0 for a convex shape, grows with lumpiness
    roughness = float(np.clip((p_c / (p_h + 1e-9)) - 1.0, 0.0, 0.6)) / 0.6

    pts = c.reshape(-1, 2).astype(np.float32)
    ctr = pts.mean(0)
    theta = np.arctan2(pts[:, 1] - ctr[1], pts[:, 0] - ctr[0])
    r = np.linalg.norm(pts - ctr, axis=1)
    order = np.argsort(theta)
    rs = np.interp(np.linspace(-np.pi, np.pi, 128), theta[order], r[order])
    rs = rs - rs.mean()

    spec = np.abs(np.fft.rfft(rs))[1:32] + 1e-9
    # geometric mean / arithmetic mean: 1.0 = energy spread evenly across
    # all angular modes (random natural outline); near 0 = one dominant
    # mode, which is what a manufactured shape produces
    flatness = float(np.exp(np.log(spec).mean()) / spec.mean())

    # Calibrated on simulator data. Earlier multipliers of 3.0 and 1.8
    # saturated this score at 1.0 for every input, which made the
    # rejection channel useless.
    (_, _), (bw, bh), _ = cv2.minAreaRect(c)
    elong = max(bw, bh) / max(min(bw, bh), 1e-6)

    if elong > 4.0:
        # Radial profile is meaningless for a long thin object: it is
        # dominated by elongation rather than by natural disorder, and
        # would score a clean straight cable as maximally irregular.
        # Fall back to boundary roughness alone.
        score = float(np.clip(roughness, 0.0, 1.0))
    else:
        score = float(np.clip(0.5 * roughness
                              + 0.5 * np.clip(flatness / 0.45, 0, 1), 0.0, 1.0))

    return SignatureScore("irregularity", score, {
        "boundary_roughness": round(float(roughness), 3),
        "spectral_flatness": round(flatness, 3),
        "elongation": round(float(elong), 2),
    })


# ---------------------------------------------------------------- combined

MANMADE = ("periodicity", "linearity", "circularity", "angularity")

CLASS_OF = {
    "periodicity": "Possible Ghost Net / Netting",
    "linearity":   "Linear structure — cable, rope or pipe",
    "circularity": "Cylindrical object — drum, tyre or buoy",
    "angularity":  "Angular structure — container or crate",
}


def analyse_all(patch, res_across_m, res_along_m, reject_margin: float = 0.10):
    """
    Run every signature and decide.

    Returns a dict with the winning man-made signature, the rejection
    score, the classification, and every individual result for the
    explanation panel.
    """
    results = {
        "periodicity":  periodicity(patch, res_across_m, res_along_m),
        "linearity":    linearity(patch, res_across_m, res_along_m),
        "circularity":  circularity(patch, res_across_m, res_along_m),
        "angularity":   angularity(patch, res_across_m, res_along_m),
        "irregularity": irregularity(patch, res_across_m, res_along_m),
    }

    best = max(MANMADE, key=lambda k: results[k].score)
    best_score = results[best].score
    natural = results["irregularity"].score

    # PERIODICITY OVERRIDE.
    # The other four signatures describe boundary SHAPE, so comparing
    # them against boundary irregularity is like for like. Periodicity
    # does not: it measures TEXTURE inside the object. A ghost net has a
    # ragged, irregular outline and a perfectly regular interior, so on
    # boundary evidence alone it looks natural.
    #
    # No natural seabed process produces a centimetre-scale repeating
    # grid, so strong periodicity is decisive on its own.
    periodic = results["periodicity"].score
    if periodic >= 0.45:
        return {
            "classification": CLASS_OF["periodicity"],
            "manmade": True,
            "signature": "periodicity",
            "signature_score": round(periodic, 3),
            "natural_score": round(natural, 3),
            "margin": round(periodic - natural, 3),
            "override": "periodicity is decisive: no natural process "
                        "produces centimetre-scale repeating structure",
            "scores": {k: round(v.score, 3) for k, v in results.items()},
            "detail": {k: v.detail for k, v in results.items()},
        }

    is_manmade = best_score > (natural + reject_margin)

    return {
        "classification": CLASS_OF[best] if is_manmade else "Natural seabed feature",
        "manmade": is_manmade,
        "signature": best if is_manmade else "irregularity",
        "signature_score": round(best_score, 3),
        "natural_score": round(natural, 3),
        "margin": round(best_score - natural, 3),
        "scores": {k: round(v.score, 3) for k, v in results.items()},
        "detail": {k: v.detail for k, v in results.items()},
    }
