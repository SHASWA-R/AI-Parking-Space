"""
Side-scan sonar acquisition geometry.

All the range mathematics for the forward model lives here so that the
renderer and the mesh-signature detector agree on one definition of
slant range, ground range and resolution.
"""

from dataclasses import dataclass
import numpy as np


@dataclass
class SonarConfig:
    """Acquisition parameters for a dual-channel side-scan sonar."""

    # Defaults model a HIGH-FREQUENCY, SHORT-RANGE survey (roughly a
    # 900 kHz - 1.6 MHz system run at 20 m range). This is a deliberate
    # choice, not an arbitrary one: see `resolves_pitch` below. A
    # standard 100 m range survey samples the seabed at 10-15 cm per
    # pixel, which cannot resolve any fishing net mesh at all.
    width: int = 2048               # samples per ping (both channels)
    height: int = 1024              # number of pings (along-track)
    altitude_m: float = 3.5         # towfish height above seabed
    slant_range_max_m: float = 20.0 # max slant range per channel
    along_track_res_m: float = 0.02 # metres between successive pings

    @property
    def half_width(self) -> int:
        return self.width // 2

    @property
    def slant_res_m(self) -> float:
        """Metres of slant range per pixel column."""
        return self.slant_range_max_m / self.half_width

    def slant_range(self, col: np.ndarray) -> np.ndarray:
        """Slant range in metres for a column index (nadir at image centre)."""
        return np.abs(col - self.half_width) * self.slant_res_m

    def ground_range(self, slant_r: np.ndarray) -> np.ndarray:
        """
        Slant range -> ground range.

            G = sqrt(R^2 - H^2)

        Returns NaN inside the nadir gap where R < H and there is no
        seabed return, only water column.
        """
        d = slant_r ** 2 - self.altitude_m ** 2
        with np.errstate(invalid="ignore"):
            g = np.where(d > 0.0, np.sqrt(np.clip(d, 0.0, None)), np.nan)
        return g

    def slant_from_ground(self, ground_r: np.ndarray) -> np.ndarray:
        """Ground range -> slant range."""
        return np.sqrt(ground_r ** 2 + self.altitude_m ** 2)

    def col_from_ground(self, ground_r: np.ndarray, starboard: bool) -> np.ndarray:
        """Ground range -> column index on the chosen channel."""
        slant_r = self.slant_from_ground(ground_r)
        offset = slant_r / self.slant_res_m
        return self.half_width + offset if starboard else self.half_width - offset

    def ground_res_at(self, ground_r: float) -> float:
        """
        Across-track ground resolution at a given ground range.

        Because R^2 = G^2 + H^2, one pixel of slant range covers

            dG = dR * R / G

        metres of seabed. Near nadir G is small, so the seabed is
        heavily compressed; at long range dG approaches dR.

        This is why a mesh pitch measured in pixels must be converted
        back to centimetres using the range at which it was observed.
        """
        slant_r = float(self.slant_from_ground(np.array(ground_r)))
        if ground_r <= 1e-6:
            return float("inf")
        return self.slant_res_m * slant_r / ground_r

    def along_track_m(self, row: np.ndarray) -> np.ndarray:
        return row * self.along_track_res_m

    # ------------------------------------------------------------- Nyquist

    def resolves_pitch(self, pitch_m: float, ground_r: float,
                       min_samples: float = 2.5):
        """
        Can a mesh of this pitch be recovered at this range?

        The FFT can only find a periodicity it is sampling above the
        Nyquist limit. Two samples per period is the theoretical floor;
        under speckle you want at least 2.5-3.

        Returns (bool, samples_across, samples_along).
        """
        across = pitch_m / max(self.ground_res_at(ground_r), 1e-9)
        along = pitch_m / self.along_track_res_m
        return (max(across, along) >= min_samples,
                round(float(across), 2), round(float(along), 2))


# 20 m range, high frequency. Resolves trawl and larger gillnet mesh.
DEFAULT = SonarConfig()

# Typical survey configuration: 100 m range, ~10 cm per pixel.
# Included so the resolution limit can be demonstrated rather than
# asserted -- run the mesh detector on both and show it fail here.
STANDARD_SURVEY = SonarConfig(
    width=2048, height=1024, altitude_m=15.0,
    slant_range_max_m=100.0, along_track_res_m=0.10,
)
