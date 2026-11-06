package com.marineai.service;

import com.marineai.model.BBox;
import com.marineai.util.MatScope;
import org.opencv.core.*;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Service;

/**
 * Texture deviation of the object patch from the surrounding seabed.
 *
 * Uses Laplacian energy and local variance rather than a GLCM: OpenCV
 * has no GLCM implementation for Java, and these cheaper statistics
 * separate object from sediment adequately at prototype scale.
 */
@Service
public class TextureService {

    public double analyse(Mat image, BBox box) {
        try (MatScope scope = new MatScope()) {
            Rect inner = clamp(new Rect(box.x1(), box.y1(),
                    Math.max(box.width(), 2), Math.max(box.height(), 2)), image);

            int pad = Math.max(box.width(), box.height()) / 2 + 4;
            Rect outer = clamp(new Rect(box.x1() - pad, box.y1() - pad,
                    box.width() + 2 * pad, box.height() + 2 * pad), image);

            if (inner.width < 2 || outer.width < 4) return 0.0;

            double objE = energy(new Mat(image, inner), scope);
            double bgE = energy(new Mat(image, outer), scope);
            if (bgE < 1e-6) return 0.0;

            double ratio = Math.abs(objE - bgE) / bgE;
            return Math.max(0, Math.min(1, ratio / 1.5));
        }
    }

    private double energy(Mat m, MatScope scope) {
        Mat src = scope.track(m);
        Mat lap = scope.track(new Mat());
        Imgproc.Laplacian(src, lap, CvType.CV_32F);
        MatOfDouble mean = new MatOfDouble(), sd = new MatOfDouble();
        Core.meanStdDev(lap, mean, sd);
        return sd.toArray()[0];
    }

    private static Rect clamp(Rect r, Mat img) {
        int x = Math.max(0, r.x), y = Math.max(0, r.y);
        int w = Math.min(r.width, img.cols() - x);
        int h = Math.min(r.height, img.rows() - y);
        return new Rect(x, y, Math.max(w, 1), Math.max(h, 1));
    }
}
