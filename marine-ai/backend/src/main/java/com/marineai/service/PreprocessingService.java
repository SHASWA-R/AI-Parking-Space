package com.marineai.service;

import com.marineai.util.MatScope;
import org.opencv.core.*;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Service;

/**
 * Sonar image preprocessing.
 *
 * Bilateral filtering rather than Gaussian: sonar speckle is
 * multiplicative and edge-preserving denoising keeps the object
 * boundaries the signature engine depends on.
 */
@Service
public class PreprocessingService {

    /** Returns an enhanced single-channel 8-bit image. Caller owns it. */
    public Mat enhance(Mat src) {
        try (MatScope scope = new MatScope()) {
            Mat gray = scope.track(new Mat());
            if (src.channels() > 1) Imgproc.cvtColor(src, gray, Imgproc.COLOR_BGR2GRAY);
            else src.copyTo(gray);

            Mat denoised = scope.track(new Mat());
            Imgproc.bilateralFilter(gray, denoised, 7, 45, 45);

            Mat clahe = new Mat();
            Imgproc.createCLAHE(2.0, new Size(8, 8)).apply(denoised, clahe);

            Core.normalize(clahe, clahe, 0, 255, Core.NORM_MINMAX);
            return clahe;
        }
    }
}
