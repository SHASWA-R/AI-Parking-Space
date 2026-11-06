package com.marineai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Sonar acquisition geometry.
 *
 * All range mathematics lives here so the preprocessing, signature and
 * dimensioning code agree on one definition of slant range, ground
 * range and resolution.
 */
@ConfigurationProperties(prefix = "marine.sonar")
public class SonarProperties {

    private double altitudeM = 3.5;
    private double slantRangeMaxM = 20.0;
    private double alongTrackResM = 0.02;

    /** Metres of slant range per pixel column, given image half-width. */
    public double slantResM(int imageWidth) {
        return slantRangeMaxM / Math.max(imageWidth / 2.0, 1.0);
    }

    /** Slant range for a column index, nadir at image centre. */
    public double slantRange(int col, int imageWidth) {
        return Math.abs(col - imageWidth / 2.0) * slantResM(imageWidth);
    }

    /** Ground range from slant range; NaN inside the nadir gap. */
    public double groundRange(double slantR) {
        double d = slantR * slantR - altitudeM * altitudeM;
        return d > 0 ? Math.sqrt(d) : Double.NaN;
    }

    /**
     * Across-track ground resolution at a given ground range.
     *
     * Since R^2 = G^2 + H^2, one pixel of slant range covers
     * dG = dR * R / G metres of seabed. Near nadir G is small and the
     * seabed is heavily compressed, so a mesh pitch measured in pixels
     * must be converted using the range at which it was observed.
     */
    public double groundResAt(double groundR, int imageWidth) {
        if (groundR <= 1e-6) return Double.POSITIVE_INFINITY;
        double slantR = Math.sqrt(groundR * groundR + altitudeM * altitudeM);
        return slantResM(imageWidth) * slantR / groundR;
    }

    /**
     * Object height from acoustic shadow length.
     *
     * A ray grazing the top of an object at ground range G0 strikes the
     * seabed at G0*H/(H-h), so shadow ground length is G0*h/(H-h),
     * which inverts to the expression below. Standard sonar analysis.
     */
    public double heightFromShadow(double shadowLengthM, double groundR) {
        if (groundR <= 1e-6) return 0.0;
        return altitudeM * shadowLengthM / (groundR + shadowLengthM);
    }

    public double getAltitudeM() { return altitudeM; }
    public void setAltitudeM(double v) { this.altitudeM = v; }
    public double getSlantRangeMaxM() { return slantRangeMaxM; }
    public void setSlantRangeMaxM(double v) { this.slantRangeMaxM = v; }
    public double getAlongTrackResM() { return alongTrackResM; }
    public void setAlongTrackResM(double v) { this.alongTrackResM = v; }
}
