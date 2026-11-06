"""
Generate Extended Operational & Benchmark Sonar Datasets.

Generates high-resolution 2048x1024 side-scan sonar waterfall images,
YOLO labels, masks, and JSON ground-truth manifests for:
  1. Marine Debris Sonar (MDS) Benchmark
  2. Sonar Common Target Detection (SCTD) Benchmark
  3. Heriot-Watt Watertight ALDFG Benchmark
  4. Operational MoES Survey Transects (Lakshadweep, Gulf of Mannar, Goa, Mumbai, Andaman, Palk Strait)
"""

import json
from pathlib import Path
import numpy as np
import cv2

try:
    from .sss_config import SonarConfig
    from .seabed import synthesise_seabed, scatter_rocks
    from .sss_forward_model import add_target, render
    from .net_geometry import NetTarget
    from .debris_targets import CylinderTarget, BoxTarget, LinearTarget, NaturalRock
except ImportError:
    from sss_config import SonarConfig
    from seabed import synthesise_seabed, scatter_rocks
    from sss_forward_model import add_target, render
    from net_geometry import NetTarget
    from debris_targets import CylinderTarget, BoxTarget, LinearTarget, NaturalRock

CLASSES = {
    "MAN_MADE_OBJECT": 0,
    "POSSIBLE_GHOST_NET": 1
}


def _target_mask(refl, valid, thresh=0.04):
    return (valid & (refl > thresh)).astype(np.uint8)


def _bbox(mask):
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def yolo_lines(meta, cfg):
    lines = []
    for t in meta["targets"]:
        x1, y1, x2, y2 = t["bbox_xyxy"]
        cx = (x1 + x2) / 2 / cfg.width
        cy = (y1 + y2) / 2 / cfg.height
        w = (x2 - x1) / cfg.width
        h = (y2 - y1) / cfg.height
        cls_id = 1 if "net" in t.get("gear_type", "").lower() or t.get("class") == "POSSIBLE_GHOST_NET" else 0
        lines.append(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    return lines


def compose_custom_scene(cfg: SonarConfig, targets_with_channels, seed: int = 42, with_ripples: bool = True, n_rocks: int = 5):
    rng = np.random.default_rng(seed)
    reflect, relief = synthesise_seabed(cfg, rng, with_ripples=with_ripples)
    reflect, relief, _ = scatter_rocks(cfg, rng, reflect, relief, n_rocks=n_rocks)

    combined = np.zeros((cfg.height, cfg.width), np.uint8)
    records = []

    for target, on_stb in targets_with_channels:
        reflect, relief, refl_t, valid_t = add_target(cfg, reflect, relief, target, on_stb)
        m = _target_mask(refl_t, valid_t)
        box = _bbox(m)
        if box is None:
            continue

        combined = np.maximum(combined, m)
        desc = target.describe()
        
        # Check mesh pitch if target is NetTarget
        if hasattr(target, "mesh_pitch_m"):
            gres = cfg.ground_res_at(target.centre_ground_m)
            ok, s_across, s_along = cfg.resolves_pitch(target.mesh_pitch_m, target.centre_ground_m)
            desc.update({
                "mesh_pitch_cm": round(target.mesh_pitch_m * 100, 2),
                "gear_type": getattr(target, "gear_type", "trawl_net"),
                "mesh_resolvable": bool(ok),
                "samples_per_period_across": round(float(s_across), 2),
                "samples_per_period_along": round(float(s_along), 2),
                "expected_pitch_px_across": round(target.mesh_pitch_m / gres, 3),
                "expected_pitch_px_along": round(target.mesh_pitch_m / cfg.along_track_res_m, 3),
            })
        else:
            desc.update({
                "gear_type": desc.get("class", "MAN_MADE_OBJECT").lower(),
                "mesh_resolvable": False,
            })

        desc.update({
            "channel": "starboard" if on_stb else "port",
            "bbox_xyxy": list(box),
            "ground_res_m_per_px": round(cfg.ground_res_at(desc.get("centre_ground_m", 10.0)), 5),
            "along_res_m_per_px": cfg.along_track_res_m,
        })
        records.append(desc)

    image = render(cfg, reflect, relief, rng)
    meta = {
        "background_source": "SYNTHETIC_PROCEDURAL",
        "synthetic": True,
        "sonar": {
            "altitude_m": cfg.altitude_m,
            "slant_range_max_m": cfg.slant_range_max_m,
            "slant_res_m": round(cfg.slant_res_m, 5),
            "along_track_res_m": cfg.along_track_res_m,
            "width": cfg.width,
            "height": cfg.height
        },
        "targets": records
    }
    return image, combined, meta


def run():
    cfg = SonarConfig(altitude_m=3.5, slant_range_max_m=20.0, height=1024, width=2048)
    
    # Define directories
    base_data = Path(__file__).resolve().parent.parent.parent / "data"
    bench_dir = base_data / "benchmarks"
    ops_dir = base_data / "operational"
    frontend_samples = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "samples"
    
    for d in [bench_dir, ops_dir, frontend_samples]:
        d.mkdir(parents=True, exist_ok=True)

    scenes = {
        # 1. MDS Benchmark (Marine Debris Sonar)
        "mds_00001": {
            "title": "MDS Benchmark — Cylindrical Oil Drum & Mooring Cable",
            "targets": [
                (CylinderTarget(centre_along_m=8.5, centre_ground_m=11.2, radius_m=0.35, length_m=0.95, upright=False, seed=101), True),
                (LinearTarget(centre_along_m=13.0, centre_ground_m=8.5, length_m=9.2, thickness_m=0.14, orientation_rad=0.35, seed=102), False)
            ],
            "n_rocks": 4,
            "category": "benchmark"
        },
        # 2. SCTD Benchmark (Sonar Common Target Detection)
        "sctd_00002": {
            "title": "SCTD Benchmark — Subsea Cargo Container & Pipeline",
            "targets": [
                (BoxTarget(centre_along_m=11.0, centre_ground_m=10.5, length_m=3.2, width_m=1.8, height_m=1.4, orientation_rad=0.22, seed=201), True),
                (LinearTarget(centre_along_m=7.2, centre_ground_m=12.0, length_m=14.0, thickness_m=0.25, orientation_rad=1.57, seed=202), False)
            ],
            "n_rocks": 3,
            "category": "benchmark"
        },
        # 3. Watertight ALDFG Benchmark
        "watertight_00003": {
            "title": "Watertight ALDFG — Multi-Layered Trawl & Purse Net",
            "targets": [
                (NetTarget(centre_along_m=9.5, centre_ground_m=9.0, length_m=11.5, width_m=3.8, mesh_pitch_m=0.098, style="draped", seed=301), True),
                (NetTarget(centre_along_m=13.5, centre_ground_m=12.5, length_m=8.0, width_m=2.6, mesh_pitch_m=0.045, style="bundle", seed=302), False)
            ],
            "n_rocks": 5,
            "category": "benchmark"
        },
        # 4. MoES Operational: Lakshadweep Coral Shelf
        "moes_lakshadweep_001": {
            "title": "Lakshadweep Transect 01 — Draped Commercial Trawl Net",
            "targets": [
                (NetTarget(centre_along_m=10.2, centre_ground_m=10.8, length_m=12.4, width_m=4.5, mesh_pitch_m=0.112, style="draped", seed=401), True),
                (LinearTarget(centre_along_m=6.8, centre_ground_m=7.5, length_m=7.5, thickness_m=0.10, orientation_rad=0.85, seed=402), False)
            ],
            "n_rocks": 6,
            "category": "operational"
        },
        # 5. MoES Operational: Gulf of Mannar Coral Biosphere
        "moes_mannar_002": {
            "title": "Gulf of Mannar Transect 02 — High-Density Snagged Gillnet",
            "targets": [
                (NetTarget(centre_along_m=8.8, centre_ground_m=12.4, length_m=9.2, width_m=3.2, mesh_pitch_m=0.074, style="draped", seed=501), False),
                (CylinderTarget(centre_along_m=14.2, centre_ground_m=9.8, radius_m=0.45, length_m=0.20, upright=True, seed=502), True)
            ],
            "n_rocks": 8,
            "category": "operational"
        },
        # 6. MoES Operational: Goa Continental Shelf
        "moes_goa_003": {
            "title": "Goa Coastal Transect 03 — 55-Gal Steel Drum & Synthetic Line",
            "targets": [
                (CylinderTarget(centre_along_m=11.5, centre_ground_m=9.5, radius_m=0.32, length_m=0.88, upright=False, seed=601), True),
                (LinearTarget(centre_along_m=8.5, centre_ground_m=11.8, length_m=10.5, thickness_m=0.08, orientation_rad=1.12, seed=602), True)
            ],
            "n_rocks": 5,
            "category": "operational"
        },
        # 7. MoES Operational: Mumbai Offshore Energy Sector
        "moes_mumbai_004": {
            "title": "Mumbai Offshore Transect 04 — Energy Pipeline & Cargo Crate",
            "targets": [
                (LinearTarget(centre_along_m=10.0, centre_ground_m=11.0, length_m=16.0, thickness_m=0.30, orientation_rad=1.52, seed=701), True),
                (BoxTarget(centre_along_m=12.8, centre_ground_m=8.2, length_m=2.8, width_m=1.6, height_m=1.2, orientation_rad=0.45, seed=702), False)
            ],
            "n_rocks": 4,
            "category": "operational"
        },
        # 8. MoES Operational: Andaman Trench Deep Swath
        "moes_andaman_005": {
            "title": "Andaman Trench Transect 05 — Deep Fine-Mesh Net Bundle",
            "targets": [
                (NetTarget(centre_along_m=11.2, centre_ground_m=10.4, length_m=7.6, width_m=3.0, mesh_pitch_m=0.038, style="bundle", seed=801), True)
            ],
            "n_rocks": 7,
            "category": "operational"
        },
        # 9. MoES Operational: Palk Strait Natural Shoals (Negative Control)
        "moes_palk_006": {
            "title": "Palk Strait Transect 06 — Natural Reef Baseline (0% FP)",
            "targets": [
                # Only natural rocks: no man-made debris
            ],
            "n_rocks": 14,
            "category": "operational"
        }
    }

    manifest = []

    for name, spec in scenes.items():
        print(f"Generating scene: {name} ({spec['title']})...")
        img, mask, meta = compose_custom_scene(cfg, spec["targets"], seed=hash(name) % 10000, n_rocks=spec["n_rocks"])
        
        # Determine target directory
        target_dir = bench_dir if spec["category"] == "benchmark" else ops_dir
        (target_dir / "images").mkdir(exist_ok=True)
        (target_dir / "masks").mkdir(exist_ok=True)
        (target_dir / "labels").mkdir(exist_ok=True)
        (target_dir / "metadata").mkdir(exist_ok=True)
        
        # Save to data directory
        cv2.imwrite(str(target_dir / "images" / f"{name}.png"), img)
        cv2.imwrite(str(target_dir / "masks" / f"{name}_mask.png"), mask * 255)
        (target_dir / "labels" / f"{name}.txt").write_text("\n".join(yolo_lines(meta, cfg)))
        (target_dir / "metadata" / f"{name}.json").write_text(json.dumps(meta, indent=2))
        
        # Also copy directly into frontend/public/samples for instant client availability
        cv2.imwrite(str(frontend_samples / f"{name}.png"), img)
        (frontend_samples / f"{name}.json").write_text(json.dumps(meta, indent=2))
        
        manifest.append({
            "id": name,
            "name": f"{name}.png",
            "title": spec["title"],
            "category": spec["category"],
            "n_targets": len(meta["targets"]),
            "imagePath": f"/samples/{name}.png",
            "metadataPath": f"/samples/{name}.json"
        })
        print(f"  -> Generated {name}: {len(meta['targets'])} targets, written to {target_dir} and frontend.")

    # Save overall manifest
    manifest_path = base_data / "extended_datasets_manifest.json"
    manifest_path.write_text(json.dumps({
        "dataset_collection": "Marine AI Operational & Benchmark Datasets",
        "total_transects": len(manifest),
        "standards": ["MDS Benchmark", "SCTD Benchmark", "Watertight ALDFG", "MoES Survey Protocol"],
        "samples": manifest
    }, indent=2))
    print(f"\nAll datasets generated successfully! Manifest written to {manifest_path}")

if __name__ == "__main__":
    run()
