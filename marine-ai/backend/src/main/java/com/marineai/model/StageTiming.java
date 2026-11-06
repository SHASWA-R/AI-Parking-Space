package com.marineai.model;

/**
 * A real measured stage duration. The frontend replays these, so the
 * processing animation reflects actual computation rather than a
 * scripted sequence.
 */
public record StageTiming(String name, long ms) {}
