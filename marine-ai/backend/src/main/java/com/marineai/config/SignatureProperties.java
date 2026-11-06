package com.marineai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "marine.signature")
public class SignatureProperties {

    private double meshPitchMinM = 0.020;
    private double meshPitchMaxM = 0.180;
    private double meshStrengthThreshold = 1.6;
    private double minSamplesPerPeriod = 2.5;
    private double shapeSmoothSigma = 1.2;
    private double periodicityOverride = 0.45;
    private double rejectMargin = 0.10;

    public double getMeshPitchMinM() { return meshPitchMinM; }
    public void setMeshPitchMinM(double v) { this.meshPitchMinM = v; }
    public double getMeshPitchMaxM() { return meshPitchMaxM; }
    public void setMeshPitchMaxM(double v) { this.meshPitchMaxM = v; }
    public double getMeshStrengthThreshold() { return meshStrengthThreshold; }
    public void setMeshStrengthThreshold(double v) { this.meshStrengthThreshold = v; }
    public double getMinSamplesPerPeriod() { return minSamplesPerPeriod; }
    public void setMinSamplesPerPeriod(double v) { this.minSamplesPerPeriod = v; }
    public double getShapeSmoothSigma() { return shapeSmoothSigma; }
    public void setShapeSmoothSigma(double v) { this.shapeSmoothSigma = v; }
    public double getPeriodicityOverride() { return periodicityOverride; }
    public void setPeriodicityOverride(double v) { this.periodicityOverride = v; }
    public double getRejectMargin() { return rejectMargin; }
    public void setRejectMargin(double v) { this.rejectMargin = v; }
}
