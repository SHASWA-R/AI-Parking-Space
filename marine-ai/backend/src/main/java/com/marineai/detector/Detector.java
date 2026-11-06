package com.marineai.detector;

import com.marineai.model.BBox;
import org.opencv.core.Mat;

import java.util.List;

/**
 * Candidate proposal stage.
 *
 * Two implementations are planned:
 *   CvDetector    -- highlight/shadow blob proposal, always available
 *   OnnxDetector  -- trained segmentation model, added in Step 4
 *
 * Keeping this an interface is what makes the trained model a drop-in
 * replacement rather than a rewrite.
 */
public interface Detector {

    record Candidate(BBox bbox, double confidence) {}

    List<Candidate> propose(Mat enhanced);

    String name();
}
