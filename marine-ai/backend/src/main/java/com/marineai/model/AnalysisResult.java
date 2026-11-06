package com.marineai.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AnalysisResult {

    public String analysisId;
    public String sourceImage;
    public Instant createdAt = Instant.now();

    public String modelVersion = "geometric-signature-v1.0";
    public boolean demoMode = true;

    public int imageWidth;
    public int imageHeight;

    public List<StageTiming> stages = new ArrayList<>();
    public List<Detection> detections = new ArrayList<>();

    /** Candidates rejected as natural seabed features. Surfaced in the
     *  UI because it demonstrates the false-positive filter working. */
    public int filteredOut;

    public List<String> warnings = new ArrayList<>();
}
