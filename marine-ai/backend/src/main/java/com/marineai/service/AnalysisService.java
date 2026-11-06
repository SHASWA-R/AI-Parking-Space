package com.marineai.service;

import com.marineai.config.SonarProperties;
import com.marineai.detector.Detector;
import com.marineai.model.*;
import com.marineai.signature.SignatureService;
import com.marineai.store.AnalysisStore;
import com.marineai.util.MatScope;
import org.opencv.core.Mat;
import org.opencv.core.Rect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates the full analysis pipeline and records real per-stage
 * timings, which the frontend replays. The processing animation then
 * reflects actual computation rather than a scripted sequence.
 */
@Service
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final PreprocessingService preprocessing;
    private final Detector detector;
    private final SignatureService signatures;
    private final ShadowService shadowService;
    private final TextureService textureService;
    private final ScoringService scoring;
    private final SonarProperties sonar;
    private final AnalysisStore store;

    public AnalysisService(PreprocessingService preprocessing, Detector detector,
                           SignatureService signatures, ShadowService shadowService,
                           TextureService textureService, ScoringService scoring,
                           SonarProperties sonar, AnalysisStore store) {
        this.preprocessing = preprocessing;
        this.detector = detector;
        this.signatures = signatures;
        this.shadowService = shadowService;
        this.textureService = textureService;
        this.scoring = scoring;
        this.sonar = sonar;
        this.store = store;
    }

    public AnalysisResult analyse(Mat source, String filename) {
        AnalysisResult result = new AnalysisResult();
        result.analysisId = store.nextId();
        result.sourceImage = filename;
        result.imageWidth = source.cols();
        result.imageHeight = source.rows();

        long t;

        try (MatScope scope = new MatScope()) {
            t = System.nanoTime();
            Mat enhanced = scope.track(preprocessing.enhance(source));
            stage(result, "Sonar preprocessing", t);

            t = System.nanoTime();
            List<Detector.Candidate> candidates = detector.propose(enhanced);
            stage(result, "Candidate proposal", t);

            t = System.nanoTime();
            List<Detection> kept = new ArrayList<>();
            int rejected = 0;

            for (Detector.Candidate cand : candidates) {
                BBox b = cand.bbox();
                Rect r = new Rect(b.x1(), b.y1(),
                        Math.max(b.width(), 1), Math.max(b.height(), 1));
                if (r.x < 0 || r.y < 0
                        || r.x + r.width > enhanced.cols()
                        || r.y + r.height > enhanced.rows()) continue;

                Mat patch = scope.track(new Mat(enhanced, r));

                double groundR = sonar.groundRange(
                        sonar.slantRange(b.cx(), enhanced.cols()));
                if (Double.isNaN(groundR) || groundR <= 0) continue;
                double resAcross = sonar.groundResAt(groundR, enhanced.cols());

                SignatureService.Verdict v = signatures.analyseAll(
                        patch, resAcross, sonar.getAlongTrackResM());

                if (!v.manmade()) { rejected++; continue; }

                Detection d = new Detection();
                d.id = "D-" + String.format("%03d", kept.size() + 1);
                d.bbox = b;
                d.confidence = cand.confidence();
                d.className = v.classification();
                d.signature = v.signature();
                d.signatureScore = v.signatureScore();
                d.naturalScore = v.naturalScore();
                d.signatureScores = v.scores();
                d.signatureDetail = v.detail();
                d.overrideReason = v.overrideReason();

                Object periodDetail = v.detail().get("periodicity");
                if (periodDetail instanceof java.util.Map<?, ?> m) {
                    Object pitch = m.get("meshPitchCm");
                    if (pitch instanceof Number num) d.meshPitchCm = num.doubleValue();
                    Object gear = m.get("gearType");
                    if (gear != null) d.inferredGearType = gear.toString();
                }

                kept.add(d);
            }
            stage(result, "Geometric signature analysis", t);

            t = System.nanoTime();
            for (Detection d : kept) {
                ShadowService.Shadow sh = shadowService.analyse(enhanced, d.bbox);
                d.shadowScore = sh.score();
                d.estimatedHeightM = sh.heightM();
                d.estimatedLengthM = sh.lengthM();
                d.estimatedWidthM = sh.widthM();
            }
            stage(result, "Acoustic shadow analysis", t);

            t = System.nanoTime();
            for (Detection d : kept) {
                d.textureScore = textureService.analyse(enhanced, d.bbox);
            }
            stage(result, "Texture analysis", t);

            t = System.nanoTime();
            for (Detection d : kept) {
                d.anomalyScore = scoring.anomalyScore(
                        d.confidence, d.signatureScore, d.shadowScore, d.textureScore);
                d.risk = scoring.risk(d.anomalyScore);
                d.evidence = buildEvidence(d);
            }
            kept.sort((a, b2) -> Double.compare(b2.anomalyScore, a.anomalyScore));
            stage(result, "Risk assessment", t);

            result.detections = kept;
            result.filteredOut = rejected;

            if (kept.isEmpty()) {
                result.warnings.add("No significant anthropogenic anomaly detected.");
            }
        } catch (Exception e) {
            log.error("analysis failed for {}", filename, e);
            result.warnings.add("Analysis error: " + e.getMessage());
        }

        store.save(result);
        return result;
    }

    private List<String> buildEvidence(Detection d) {
        List<String> ev = new ArrayList<>();

        if ("periodicity".equals(d.signature) && d.meshPitchCm != null) {
            ev.add(String.format(
                    "Regular mesh periodicity detected at %.1f cm pitch", d.meshPitchCm));
        } else if (d.signatureScore > 0.4) {
            ev.add(String.format("Geometric regularity detected: %s (%.2f)",
                    d.signature, d.signatureScore));
        }
        if (d.shadowScore > 0.35) ev.add("Acoustic shadow present away from nadir");
        if (d.estimatedLengthM != null && d.estimatedHeightM != null) {
            ev.add(String.format("Estimated %.1f m x %.1f m, height %.2f m",
                    d.estimatedLengthM, d.estimatedWidthM, d.estimatedHeightM));
        }
        if (d.textureScore > 0.3) ev.add("Significant texture deviation from seabed baseline");
        if (d.naturalScore < d.signatureScore) ev.add("Passed natural-feature rejection");
        if (d.overrideReason != null) ev.add(d.overrideReason);
        return ev;
    }

    private void stage(AnalysisResult r, String name, long startNanos) {
        r.stages.add(new StageTiming(name, (System.nanoTime() - startNanos) / 1_000_000));
    }
}
