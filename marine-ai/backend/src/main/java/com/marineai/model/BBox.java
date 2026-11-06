package com.marineai.model;

public record BBox(int x1, int y1, int x2, int y2) {
    public int width()  { return x2 - x1; }
    public int height() { return y2 - y1; }
    public int cx()     { return (x1 + x2) / 2; }
    public int cy()     { return (y1 + y2) / 2; }
}
