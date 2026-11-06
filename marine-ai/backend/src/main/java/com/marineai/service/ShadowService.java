package com.marineai.service;

import com.marineai.config.SonarProperties;
import com.marineai.model.BBox;
import com.marineai.util.MatScope;
import org.opencv.core.*;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Service;

/**
 * Acoustic shadow analysis and physical dimensioning.
 *
 * An object standing above the seabed blocks the beam and casts a dark
 * region on the side away from nadir. Shadow length is proportional to
 * object height, which lets real dimensions be measured rather than
 * guessed -- "estimated 11.4 m x 2.8 m, height 0.4 m" is far more
 * useful to a survey team than "shadow score 82%".
 */
@Service
public class ShadowService {

    private final SonarProperties sonar;

    public ShadowService(SonarProperties sonar) { this.sonar = sonar; }

    public record Shadow(double score, double shadowLengthPx,
                         Double heightM, Double lengthM, Double widthM) {}

    public Shadow analyse(Mat image, BBox box) {
        try (MatScope scope = new MatScope()) {
            int w = image.cols();
            boolean starboard = box.cx() >= w / 2;

            // sample a strip immediately away from nadir
            int len = Math.max(box.width(), 12) * 2;
            int sx1 = starboard ? box.x2() : Math.max(box.x1() - len, 0);
            int sx2 = starboard ? Math.min(box.x2() + len, w) : box.x1();
            if (sx2 - sx1 < 4) return new Shadow(0, 0, null, null, null);

            Rect shadowRect = new Rect(sx1, box.y1(), sx2 - sx1, Math.max(box.height(), 1));
            Mat strip = scope.track(new Mat(image, shadowRect));

            // local seabed baseline: a band above the detection
            int by1 = Math.max(box.y1() - box.height(), 0);
            Rect baseRect = new Rect(sx1, by1, sx2 - sx1,
                    Math.max(Math.min(box.height(), box.y1() - by1), 1));
            Mat base = scope.track(new Mat(image, baseRect));

            double stripMean = Core.mean(strip).val[0];
            double baseMean = Core.mean(base).val[0];
            if (baseMean < 1e-6) return new Shadow(0, 0, null, null, null);

            double darkness = 1.0 - (stripMean / baseMean);
            double score = Math.max(0, Math.min(1, darkness * 1.6));

            // shadow extent: columns darker than 55% of the baseline
            Mat colMean = scope.track(new Mat());
            Core.reduce(strip, colMean, 0, Core.REDUCE_AVG, CvType.CV_32F);
            float[] cols = new float[colMean.cols()];
            colMean.get(0, 0, cols);

            int shadowPx = 0;
            double thr = 0.55 * baseMean;
            if (starboard) {
                for (float v : cols) { if (v < thr) shadowPx++; else break; }
            } else {
                for (int i = cols.length - 1; i >= 0; i--) {
                    if (cols[i] < thr) shadowPx++; else break;
                }
            }

            double slantRes = sonar.slantResM(w);
            double groundR = sonar.groundRange(sonar.slantRange(box.cx(), w));
            if (Double.isNaN(groundR) || groundR <= 0) {
                return new Shadow(score, shadowPx, null, null, null);
            }

            double groundRes = sonar.groundResAt(groundR, w);
            double shadowLenM = shadowPx * groundRes;
            double heightM = sonar.heightFromShadow(shadowLenM, groundR);

            double lengthM = box.height() * sonar.getAlongTrackResM();
            double widthM = box.width() * groundRes;

            return new Shadow(score, shadowPx,
                    round(heightM), round(lengthM), round(widthM));
        }
    }

    private static Double round(double v) { return Math.round(v * 100.0) / 100.0; }
}
