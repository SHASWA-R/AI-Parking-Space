"""
Ghost net geometry.

A net is described in seabed (ground-plane) coordinates by two fields:

    reflectivity(u, v) -> 0..1   acoustic return strength of the twine
    height(u, v)       -> metres relief above the seabed

Everything is evaluated as a function of position rather than rasterised
up front, so the forward model can sample it directly in image space and
pick up slant-range compression for free.

`mesh_pitch_m` is the ground truth the mesh-signature detector is
validated against.
"""

from dataclasses import dataclass, field
import numpy as np


@dataclass
class NetTarget:
    """A ghost net lying on the seabed."""

    centre_along_m: float
    centre_ground_m: float
    length_m: float = 10.0
    width_m: float = 2.5
    mesh_pitch_m: float = 0.042        # gillnet ~4.2 cm
    twine_fraction: float = 0.28       # twine thickness as fraction of pitch
    orientation_rad: float = 0.0
    style: str = "draped"              # draped | bundle | rope
    max_height_m: float = 0.35
    seed: int = 0

    _rng: np.random.Generator = field(init=False, repr=False)

    def __post_init__(self):
        self._rng = np.random.default_rng(self.seed)
        self._drape_phase = self._rng.uniform(0, 2 * np.pi, size=4)

    # ---------------------------------------------------------------- local

    def _to_local(self, along_m, ground_m):
        """World (along, ground) -> net-local (u, v), rotated and centred."""
        du = along_m - self.centre_along_m
        dv = ground_m - self.centre_ground_m
        c, s = np.cos(-self.orientation_rad), np.sin(-self.orientation_rad)
        u = du * c - dv * s
        v = du * s + dv * c
        return u, v

    def _envelope(self, u, v):
        """
        Smooth 0..1 extent of the net, with a ragged edge.

        Real ghost nets are torn and irregular; a clean rectangle looks
        synthetic and teaches the model the wrong prior.
        """
        hl, hw = self.length_m / 2.0, self.width_m / 2.0
        ru = np.clip(1.0 - (np.abs(u) / hl) ** 3, 0.0, 1.0)
        rv = np.clip(1.0 - (np.abs(v) / hw) ** 3, 0.0, 1.0)

        ragged = (
            0.18 * np.sin(2.1 * u + self._drape_phase[0])
            + 0.12 * np.sin(3.7 * v + self._drape_phase[1])
        )
        return np.clip(ru * rv + ragged * ru * rv, 0.0, 1.0)

    # ------------------------------------------------------------ mesh grid

    def _mesh(self, u, v):
        """
        Periodic twine pattern -- the signal the FFT detector looks for.

        Two orthogonal families of twines at `mesh_pitch_m`, with knots
        at the intersections returning more strongly.
        """
        p = self.mesh_pitch_m
        half_twine = 0.5 * self.twine_fraction * p

        du = np.abs(((u + 0.5 * p) % p) - 0.5 * p)
        dv = np.abs(((v + 0.5 * p) % p) - 0.5 * p)

        # soft-edged twines so the pattern survives resampling
        tu = np.clip(1.0 - du / max(half_twine, 1e-6), 0.0, 1.0)
        tv = np.clip(1.0 - dv / max(half_twine, 1e-6), 0.0, 1.0)

        twine = np.maximum(tu, tv)
        knot = tu * tv                      # intersections are brighter
        return np.clip(0.72 * twine + 0.55 * knot, 0.0, 1.0)

    # --------------------------------------------------------------- fields

    def reflectivity(self, along_m, ground_m):
        u, v = self._to_local(along_m, ground_m)
        env = self._envelope(u, v)

        if self.style == "rope":
            # a trailing rope: no cross twines, just a bright line
            core = np.clip(1.0 - np.abs(v) / max(self.width_m * 0.5, 1e-6), 0, 1)
            return np.clip(core ** 2 * env, 0, 1)

        mesh = self._mesh(u, v)

        if self.style == "bundle":
            # tangled: mesh partly collapsed, periodicity degraded on purpose
            noise = 0.45 * np.sin(11.0 * u + self._drape_phase[2]) * np.sin(
                9.0 * v + self._drape_phase[3]
            )
            mesh = np.clip(0.55 * mesh + 0.45 * np.abs(noise), 0, 1)

        return np.clip(mesh * env, 0.0, 1.0)

    def height(self, along_m, ground_m):
        u, v = self._to_local(along_m, ground_m)
        env = self._envelope(u, v)

        if self.style == "bundle":
            lump = np.exp(-((u / (self.length_m * 0.22)) ** 2
                            + (v / (self.width_m * 0.42)) ** 2))
            return self.max_height_m * np.clip(0.35 * env + 0.9 * lump, 0, 1.4)

        drape = 0.5 + 0.5 * np.sin(1.4 * u + self._drape_phase[0]) * np.cos(
            2.2 * v + self._drape_phase[1]
        )
        return self.max_height_m * env * (0.45 + 0.55 * drape)

    # ----------------------------------------------------------------- meta

    def describe(self):
        return {
            "style": self.style,
            "mesh_pitch_m": round(self.mesh_pitch_m, 4),
            "mesh_pitch_cm": round(self.mesh_pitch_m * 100, 2),
            "length_m": round(self.length_m, 2),
            "width_m": round(self.width_m, 2),
            "max_height_m": round(self.max_height_m, 3),
            "orientation_deg": round(np.degrees(self.orientation_rad), 1),
            "centre_ground_m": round(self.centre_ground_m, 2),
            "centre_along_m": round(self.centre_along_m, 2),
        }


# Indicative mesh pitches by gear type.
# These are plausible prototype values for demonstration, NOT a
# regulatory reference. Real mesh regulations vary by state and fishery.
GEAR_TYPES = {
    "gillnet_small":  (0.030, 0.050),
    "gillnet_large":  (0.055, 0.090),
    "trawl_net":      (0.090, 0.150),
    "purse_seine":    (0.018, 0.030),
}


def random_net(rng: np.random.Generator, cfg, gear: str = None) -> NetTarget:
    """Sample a random but physically plausible net."""
    gear = gear or rng.choice(list(GEAR_TYPES))
    lo, hi = GEAR_TYPES[gear]
    pitch = rng.uniform(lo, hi)

    style = rng.choice(["draped", "draped", "bundle", "rope"])
    ground_max = np.sqrt(cfg.slant_range_max_m ** 2 - cfg.altitude_m ** 2)

    net = NetTarget(
        centre_along_m=rng.uniform(0.2, 0.8) * cfg.height * cfg.along_track_res_m,
        centre_ground_m=rng.uniform(0.25, 0.85) * ground_max,
        length_m=rng.uniform(4.0, 18.0),
        width_m=rng.uniform(1.2, 4.5),
        mesh_pitch_m=pitch,
        twine_fraction=rng.uniform(0.20, 0.36),
        orientation_rad=rng.uniform(0, np.pi),
        style=style,
        max_height_m=rng.uniform(0.15, 0.55) if style != "bundle"
                     else rng.uniform(0.6, 1.6),
        seed=int(rng.integers(0, 1 << 30)),
    )
    net.gear_type = gear
    return net
