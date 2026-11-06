package com.marineai.util;

import org.opencv.core.Mat;

import java.util.ArrayList;
import java.util.List;

/**
 * Tracks OpenCV Mats and releases them all on close.
 *
 * This exists because Mat memory is OFF-HEAP. The JVM garbage collector
 * does not reclaim it. A pipeline creating a dozen intermediate Mats
 * per request will leak steadily: heap usage looks perfectly healthy
 * while resident memory climbs until the container is killed.
 *
 * Usage:
 *   try (MatScope scope = new MatScope()) {
 *       Mat gray = scope.track(new Mat());
 *       ...
 *   }
 */
public class MatScope implements AutoCloseable {

    private final List<Mat> tracked = new ArrayList<>();

    public Mat track(Mat m) {
        tracked.add(m);
        return m;
    }

    /** Hand a Mat back to the caller without releasing it here. */
    public Mat release(Mat m) {
        tracked.remove(m);
        return m;
    }

    @Override
    public void close() {
        for (int i = tracked.size() - 1; i >= 0; i--) {
            Mat m = tracked.get(i);
            if (m != null) m.release();
        }
        tracked.clear();
    }
}
