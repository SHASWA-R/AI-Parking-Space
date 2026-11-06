"""
Scene composition and dataset generation.

Produces, per sample:

    images/  <name>.png        slant-range waterfall, 8-bit
    labels/  <name>.txt        YOLO segmentation-friendly bbox label
    masks/   <name>_mask.png   binary target mask
    metadata/<name>.json       full ground truth, including mesh pitch

The mesh pitch in the metadata is what the Acoustic Mesh Signature
detector is validated against: run the detector, compare its estimate to
the recorded truth, report the error distribution. That is the
experiment that turns the idea into a claim you can defend.
"""

import json
from pathlib import Path

import cv2
import numpy as np

from .sss_config import SonarConfig
from .net_geometry import random_net
from .seabed import synthesise_seabed, scatter_rocks, load_real_background
from .sss_forward_model import _grid, add_target, render

CLASSES = {"MAN_MADE_OBJECT": 0, "POSSIBLE_GHOST_NET": 1}


def _target_mask(refl, valid, thresh=0.04):
    return (valid & (refl > thresh)).astype(np.uint8)


def _bbox(mask):
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def compose_sample(cfg: SonarConfig, rng: np.random.Generator,
                   background_path=None, n_nets=None):
    """Render one scene. Returns (image, mask, records)."""
    if background_path:
        reflect, relief = load_real_background(background_path, cfg)
        background_source = str(background_path)
    else:
        reflect, relief = synthesise_seabed(cfg, rng)
        background_source = "SYNTHETIC"

    reflect, relief, _ = scatter_rocks(cfg, rng, reflect, relief)

    n_nets = n_nets if n_nets is not None else int(rng.integers(1, 3))
    combined = np.zeros((cfg.height, cfg.width), np.uint8)
    records = []

    for _ in range(n_nets):
        net = random_net(rng, cfg)
        on_stb = bool(rng.integers(0, 2))

        reflect, relief, refl_t, valid_t = add_target(
            cfg, reflect, relief, net, on_stb)

        m = _target_mask(refl_t, valid_t)
        box = _bbox(m)
        if box is None:
            continue

        combined = np.maximum(combined, m)

        gres = cfg.ground_res_at(net.centre_ground_m)
        ok, s_across, s_along = cfg.resolves_pitch(
            net.mesh_pitch_m, net.centre_ground_m)
        info = net.describe()
        info.update({
            "gear_type": getattr(net, "gear_type", "unknown"),
            "channel": "starboard" if on_stb else "port",
            "bbox_xyxy": list(box),
            "ground_res_m_per_px": round(gres, 5),
            "along_res_m_per_px": cfg.along_track_res_m,
            # expected mesh pitch in pixels at this range -- what the FFT
            # detector should recover, before converting back to cm
            "expected_pitch_px_across": round(net.mesh_pitch_m / gres, 3),
            "expected_pitch_px_along": round(
                net.mesh_pitch_m / cfg.along_track_res_m, 3),
            # Nyquist ground truth: if False, the mesh is below the
            # sonar resolution limit and the detector SHOULD fail.
            # These samples are the honest negative control.
            "mesh_resolvable": bool(ok),
            "samples_per_period_across": s_across,
            "samples_per_period_along": s_along,
        })
        records.append(info)

    image = render(cfg, reflect, relief, rng)
    meta = {
        "background_source": background_source,
        "synthetic": True,
        "sonar": {
            "altitude_m": cfg.altitude_m,
            "slant_range_max_m": cfg.slant_range_max_m,
            "slant_res_m": round(cfg.slant_res_m, 5),
            "along_track_res_m": cfg.along_track_res_m,
            "width": cfg.width,
            "height": cfg.height,
        },
        "targets": records,
    }
    return image, combined, meta


def yolo_lines(meta, cfg):
    lines = []
    for t in meta["targets"]:
        x1, y1, x2, y2 = t["bbox_xyxy"]
        cx = (x1 + x2) / 2 / cfg.width
        cy = (y1 + y2) / 2 / cfg.height
        w = (x2 - x1) / cfg.width
        h = (y2 - y1) / cfg.height
        lines.append(f"{CLASSES['POSSIBLE_GHOST_NET']} "
                     f"{cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    return lines


def generate(out_dir, n_samples=200, seed=42, cfg=None, backgrounds=None):
    cfg = cfg or SonarConfig()
    rng = np.random.default_rng(seed)
    out = Path(out_dir)

    for sub in ("images", "labels", "masks", "metadata"):
        (out / sub).mkdir(parents=True, exist_ok=True)

    backgrounds = list(backgrounds or [])
    manifest = []

    for i in range(n_samples):
        bg = backgrounds[i % len(backgrounds)] if backgrounds else None
        img, mask, meta = compose_sample(cfg, rng, background_path=bg)

        name = f"sim_{i:05d}"
        cv2.imwrite(str(out / "images" / f"{name}.png"), img)
        cv2.imwrite(str(out / "masks" / f"{name}_mask.png"), mask * 255)
        (out / "labels" / f"{name}.txt").write_text(
            "\n".join(yolo_lines(meta, cfg)))
        (out / "metadata" / f"{name}.json").write_text(
            json.dumps(meta, indent=2))

        manifest.append({"name": name, "n_targets": len(meta["targets"])})

    (out / "manifest.json").write_text(json.dumps({
        "generator": "sss_forward_model",
        "synthetic": True,
        "note": "Simulated side-scan sonar. NOT real survey data. "
                "Backgrounds marked SYNTHETIC are procedural; use real "
                "SSS tiles as backgrounds for any model you intend to "
                "report results on.",
        "n_samples": n_samples,
        "seed": seed,
        "samples": manifest,
    }, indent=2))

    return out


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Generate simulated SSS ghost-net data")
    ap.add_argument("--out", default="../data/synthetic")
    ap.add_argument("--n", type=int, default=200)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--backgrounds", default=None,
                    help="directory of real SSS background tiles")
    args = ap.parse_args()

    bgs = None
    if args.backgrounds:
        bgs = sorted(Path(args.backgrounds).glob("*.[pj][pn]g"))
        print(f"using {len(bgs)} real backgrounds")

    path = generate(args.out, n_samples=args.n, seed=args.seed, backgrounds=bgs)
    print(f"wrote {args.n} samples to {path}")
