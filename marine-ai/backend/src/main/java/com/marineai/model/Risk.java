package com.marineai.model;

public enum Risk {
    LOW, MEDIUM, HIGH, CRITICAL;

    public static Risk fromScore(double score01, int lowMax, int medMax, int highMax) {
        int pct = (int) Math.round(score01 * 100.0);
        if (pct <= lowMax) return LOW;
        if (pct <= medMax) return MEDIUM;
        if (pct <= highMax) return HIGH;
        return CRITICAL;
    }
}
