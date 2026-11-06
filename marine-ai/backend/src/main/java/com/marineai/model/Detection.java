package com.marineai.model;

import java.util.List;
import java.util.Map;

public class Detection {

    public String id;
    public String className;
    public BBox bbox;

    // Acoustic Geometric Regularity
    public String signature;
    public double signatureScore;
    public double naturalScore;
    public Map<String, Double> signatureScores;
    public Map<String, Object> signatureDetail;
    public String overrideReason;

    // Mesh identification, when the periodicity channel fires
    public Double meshPitchCm;
    public String inferredGearType;

    // Independent evidence
    public double confidence;
    public double shadowScore;
    public double textureScore;
    public double anomalyScore;
    public Risk risk;

    // Physical dimensioning from shadow geometry
    public Double estimatedLengthM;
    public Double estimatedWidthM;
    public Double estimatedHeightM;

    // Position. Never present a simulated coordinate as a real one:
    // positionSource is always populated.
    public Double latitude;
    public Double longitude;
    public String positionSource = "NONE";
    public Double depthM;

    public List<String> evidence;
}
