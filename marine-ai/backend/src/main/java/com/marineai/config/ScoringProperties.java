package com.marineai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Anomaly score weights, bound at runtime so they can be retuned live
 * during evaluation without a rebuild.
 */
@ConfigurationProperties(prefix = "marine.scoring")
public class ScoringProperties {

    private double weightConfidence = 0.35;
    private double weightSignature = 0.25;
    private double weightShadow = 0.25;
    private double weightTexture = 0.15;
    private int riskLowMax = 30;
    private int riskMediumMax = 60;
    private int riskHighMax = 80;

    public double getWeightConfidence() { return weightConfidence; }
    public void setWeightConfidence(double v) { this.weightConfidence = v; }
    public double getWeightSignature() { return weightSignature; }
    public void setWeightSignature(double v) { this.weightSignature = v; }
    public double getWeightShadow() { return weightShadow; }
    public void setWeightShadow(double v) { this.weightShadow = v; }
    public double getWeightTexture() { return weightTexture; }
    public void setWeightTexture(double v) { this.weightTexture = v; }
    public int getRiskLowMax() { return riskLowMax; }
    public void setRiskLowMax(int v) { this.riskLowMax = v; }
    public int getRiskMediumMax() { return riskMediumMax; }
    public void setRiskMediumMax(int v) { this.riskMediumMax = v; }
    public int getRiskHighMax() { return riskHighMax; }
    public void setRiskHighMax(int v) { this.riskHighMax = v; }
}
