package com.marineai.model;

import java.util.Map;

public record SignatureResult(String name, double score, Map<String, Object> detail) {}
