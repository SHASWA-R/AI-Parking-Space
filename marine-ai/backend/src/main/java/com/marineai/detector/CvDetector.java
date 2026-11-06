package com.marineai.detector;

import com.marineai.model.BBox;
import com.marineai.util.MatScope;
import org.opencv.core.*;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Classical candidate proposal.
 *
 * Finds bright returns that stand out from the local seabed. This
 * stage deliberately over-proposes: its job is recall, not precision.
 * The geometric signature engine does the discrimination, and the
 * count of rejected candidates is reported to the user as evidence
 * that the false-positive filter is doing real work.
 *
 * Confidence here is GEOMETRIC ONLY -- compactness and size
 * plausibility. It must never be derived from shadow or texture,
 * because those are separate terms in the anomaly score and a weighted
 * sum of correlated inputs is meaningless.
 */
@Component
public class CvDetector implements Detector {

    private static final int MIN_AREA = 120;
    private static final int MAX_CANDIDATES = 40;

    @Override
    public List<Candidate> propose(Mat enhanced) {
        List<Candidate> out = new ArrayList<>();

        try (MatScope scope = new MatScope()) {
            Mat blur = scope.track(new Mat());
            Imgproc.GaussianBlur(enhanced, blur, new Size(0, 0), 2.0);

            // adaptive threshold handles across-track intensity falloff
            Mat bin = scope.track(new Mat());
            Imgproc.adaptiveThreshold(blur, bin, 255,
                    Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY,
                    61, -12);

            Mat k = scope.track(Imgproc.getStructuringElement(
                    Imgproc.MORPH_ELLIPSE, new Size(5, 5)));
            Imgproc.morphologyEx(bin, bin, Imgproc.MORPH_OPEN, k);
            Imgproc.morphologyEx(bin, bin, Imgproc.MORPH_CLOSE, k, new Point(-1, -1), 2);

            List<MatOfPoint> contours = new ArrayList<>();
            Imgproc.findContours(bin, contours, scope.track(new Mat()),
                    Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);

            int imgArea = enhanced.rows() * enhanced.cols();

            for (MatOfPoint c : contours) {
                double area = Imgproc.contourArea(c);
                if (area < MIN_AREA || area > imgArea * 0.30) continue;

                Rect r = Imgproc.boundingRect(c);
                MatOfPoint2f c2 = new MatOfPoint2f(c.toArray());
                double perim = Imgproc.arcLength(c2, true);
                if (perim < 1e-6) continue;

                // geometric plausibility only
                double compactness = 4 * Math.PI * area / (perim * perim);
                double fill = area / (double) (r.width * r.height);
                double aspect = Math.max(r.width, r.height)
                        / (double) Math.max(Math.min(r.width, r.height), 1);

                double conf = 0.45 * clamp(fill, 0, 1)
                        + 0.30 * clamp(compactness * 1.4, 0, 1)
                        + 0.25 * clamp(1.0 - Math.abs(aspect - 3.0) / 9.0, 0, 1);

                out.add(new Candidate(
                        new BBox(r.x, r.y, r.x + r.width, r.y + r.height),
                        Math.round(conf * 1000.0) / 1000.0));
            }
        }

        out.sort((a, b) -> Double.compare(b.confidence(), a.confidence()));
        return out.size() > MAX_CANDIDATES ? out.subList(0, MAX_CANDIDATES) : out;
    }

    @Override
    public String name() { return "cv-proposal-v1"; }

    private static double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}
