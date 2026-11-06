package com.marineai.service;

import com.marineai.config.ScoringProperties;
import com.marineai.model.Risk;
import org.springframework.stereotype.Service;

/**
 * Weighted anomaly score over INDEPENDENT evidence.
 *
 * Independence is the whole point. If confidence were derived from
 * shadow or texture, the weighted sum would be adding a number to
 * itself with different weights and would carry no information.
 *   confidence -> geometry only
 *   signature  -> regularity peak strength
 *   shadow     -> darkness ratio and extent
 *   texture    -> deviation from seabed baseline
 */
@Service
public class ScoringService {

    private final ScoringProperties props;

    public ScoringService(ScoringProperties props) { this.props = props; }

    public double anomalyScore(double confidence, double signature,
                               double shadow, double texture) {
        double s = props.getWeightConfidence() * confidence
                 + props.getWeightSignature() * signature
                 + props.getWeightShadow() * shadow
                 + props.getWeightTexture() * texture;
        double total = props.getWeightConfidence() + props.getWeightSignature()
                     + props.getWeightShadow() + props.getWeightTexture();
        return Math.max(0, Math.min(1, s / (total < 1e-9 ? 1 : total)));
    }

    public Risk risk(double anomalyScore) {
        return Risk.fromScore(anomalyScore, props.getRiskLowMax(),
                props.getRiskMediumMax(), props.getRiskHighMax());
    }
}
