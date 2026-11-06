package com.marineai.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Loads the OpenCV native library once at startup.
 *
 * IMPORTANT for deployment: these natives are glibc-linked. An Alpine
 * base image will fail here at runtime with an UnsatisfiedLinkError.
 * Use eclipse-temurin:21-jre-jammy plus libgl1 and libglib2.0-0.
 */
@Configuration
public class OpenCvConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenCvConfig.class);

    @PostConstruct
    public void load() {
        nu.pattern.OpenCV.loadLocally();
        log.info("OpenCV native library loaded: {}", org.opencv.core.Core.VERSION);
    }
}
