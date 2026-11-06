package com.marineai.controller;

import com.marineai.model.AnalysisResult;
import com.marineai.service.AnalysisService;
import com.marineai.store.AnalysisStore;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.imgcodecs.Imgcodecs;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private final AnalysisService analysis;
    private final AnalysisStore store;

    public AnalysisController(AnalysisService analysis, AnalysisStore store) {
        this.analysis = analysis;
        this.store = store;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestParam("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image supplied"));
        }
        String name = image.getOriginalFilename() == null ? "upload" : image.getOriginalFilename();
        String lower = name.toLowerCase();
        if (!(lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unsupported format. Upload PNG or JPG sonar imagery."));
        }

        Mat src = null;
        try {
            byte[] bytes = image.getBytes();
            src = Imgcodecs.imdecode(new MatOfByte(bytes), Imgcodecs.IMREAD_GRAYSCALE);
            if (src.empty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Could not decode image. The file may be corrupt."));
            }
            return ResponseEntity.ok(analysis.analyse(src, name));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to read upload: " + e.getMessage()));
        } finally {
            if (src != null) src.release();
        }
    }

    @GetMapping("/detections")
    public List<AnalysisResult> detections() { return store.all(); }

    @GetMapping("/detections/{id}")
    public ResponseEntity<?> detection(@PathVariable String id) {
        return store.find(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Unknown analysis id: " + id)));
    }

    @GetMapping("/statistics")
    public Map<String, Object> statistics() {
        List<AnalysisResult> all = store.all();
        long detections = all.stream().mapToLong(a -> a.detections.size()).sum();
        long highRisk = all.stream().flatMap(a -> a.detections.stream())
                .filter(d -> d.risk != null && d.risk.ordinal() >= 2).count();
        long filtered = all.stream().mapToLong(a -> a.filteredOut).sum();
        double avgConf = all.stream().flatMap(a -> a.detections.stream())
                .mapToDouble(d -> d.confidence).average().orElse(0);

        return Map.of(
                "totalImages", all.size(),
                "totalDetections", detections,
                "highRiskCount", highRisk,
                "naturalFeaturesFiltered", filtered,
                "averageConfidence", Math.round(avgConf * 1000.0) / 10.0);
    }
}
