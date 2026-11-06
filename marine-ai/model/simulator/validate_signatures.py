"""
Signature validation harness.

Renders each target type into a realistic seabed scene, extracts the
patch, and asks the signature library to classify it with no prior
knowledge of the answer. Prints a confusion summary.

Run:  python3 -m simulator.validate_signatures
"""

import numpy as np

from .sss_config import SonarConfig
from .net_geometry import NetTarget
from .debris_targets import CylinderTarget, BoxTarget, LinearTarget, NaturalRock
from .seabed import synthesise_seabed, scatter_rocks
from .sss_forward_model import add_target, render
from . import signatures as sig

G = 12.0
PAD = 14


def build_scene(cfg, target, seed, rocks=3):
    rng = np.random.default_rng(seed)
    refl, rel = synthesise_seabed(cfg, rng)
    refl, rel, _ = scatter_rocks(cfg, rng, refl, rel, n_rocks=rocks)
    refl, rel, tmask, _ = add_target(cfg, refl, rel, target, True)
    img = render(cfg, refl, rel, rng)
    ys, xs = np.nonzero(tmask > 0.04)
    if len(xs) == 0:
        return None, None
    y1, y2 = max(int(ys.min()) - PAD, 0), min(int(ys.max()) + PAD, cfg.height)
    x1, x2 = max(int(xs.min()) - PAD, 0), min(int(xs.max()) + PAD, cfg.width)
    return img[y1:y2, x1:x2], (x1, y1, x2, y2)


def cases(cfg):
    A = dict(centre_along_m=10.0, centre_ground_m=G)
    return [
        ("Ghost net, trawl mesh", "periodicity",
         NetTarget(**A, length_m=9.0, width_m=4.0, mesh_pitch_m=0.12,
                   orientation_rad=0.35, style="draped", max_height_m=0.30, seed=5)),
        ("Ghost net, gillnet mesh", "periodicity",
         NetTarget(**A, length_m=7.0, width_m=3.0, mesh_pitch_m=0.075,
                   orientation_rad=1.1, style="draped", max_height_m=0.25, seed=9)),
        ("Cable, straight", "linearity",
         LinearTarget(**A, length_m=9.0, thickness_m=0.14,
                      orientation_rad=0.4, sag=0.02, seed=2)),
        ("Pipe, long", "linearity",
         LinearTarget(**A, length_m=12.0, thickness_m=0.28,
                      orientation_rad=1.3, sag=0.0, seed=4)),
        ("Drum, upright", "circularity",
         CylinderTarget(**A, radius_m=0.42, length_m=0.95,
                        upright=True, seed=3)),
        ("Tyre, flat", "circularity",
         CylinderTarget(**A, radius_m=0.55, length_m=0.25,
                        upright=True, seed=8)),
        ("Container, large", "angularity",
         BoxTarget(**A, length_m=3.2, width_m=1.6, height_m=1.4,
                   orientation_rad=0.25, seed=6)),
        ("Crate, small", "angularity",
         BoxTarget(**A, length_m=1.4, width_m=1.1, height_m=0.8,
                   orientation_rad=0.9, seed=7)),
        ("Natural rock A", "irregularity",
         NaturalRock(**A, radius_m=0.95, height_m=0.75, roughness=0.5, seed=11)),
        ("Natural rock B", "irregularity",
         NaturalRock(**A, radius_m=1.4, height_m=1.0, roughness=0.65, seed=13)),
        ("Coral head", "irregularity",
         NaturalRock(**A, radius_m=1.1, height_m=1.2, roughness=0.8, seed=17)),
    ]


def main():
    cfg = SonarConfig()
    gres, ares = cfg.ground_res_at(G), cfg.along_track_res_m
    print(f"resolution: across {gres:.4f} m/px   along {ares:.4f} m/px\n")

    hdr = f"{'TARGET':<24}{'EXPECTED':<14}{'DETECTED':<14}{'MARGIN':>7}  {'RESULT':<8} SCORES"
    print(hdr)
    print("-" * 118)

    correct = 0
    for i, (label, expected, target) in enumerate(cases(cfg)):
        patch, _ = build_scene(cfg, target, seed=100 + i)
        if patch is None:
            print(f"{label:<24}render failed")
            continue
        r = sig.analyse_all(patch, gres, ares)
        got = r["signature"]
        ok = (got == expected)
        correct += ok
        s = r["scores"]
        scores = (f"per {s['periodicity']:.2f} lin {s['linearity']:.2f} "
                  f"cir {s['circularity']:.2f} ang {s['angularity']:.2f} "
                  f"irr {s['irregularity']:.2f}")
        print(f"{label:<24}{expected:<14}{got:<14}{r['margin']:>7.2f}  "
              f"{'OK' if ok else 'MISS':<8} {scores}")

    total = len(cases(cfg))
    print("-" * 118)
    print(f"correct: {correct}/{total}  ({100*correct/total:.0f}%)")


if __name__ == "__main__":
    main()
