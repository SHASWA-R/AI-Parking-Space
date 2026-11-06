package com.marineai.store;

import com.marineai.model.AnalysisResult;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory analysis store.
 *
 * PostgreSQL persistence arrives in Step 3. This keeps Step 2 runnable
 * without a database dependency, and the interface does not change
 * when JPA replaces it.
 */
@Component
public class AnalysisStore {

    private final Map<String, AnalysisResult> byId = new ConcurrentHashMap<>();
    private final AtomicInteger counter = new AtomicInteger(0);

    public String nextId() {
        return String.format("AN-%1$tY%1$tm%1$td-%2$03d",
                new Date(), counter.incrementAndGet());
    }

    public void save(AnalysisResult r) { byId.put(r.analysisId, r); }

    public Optional<AnalysisResult> find(String id) {
        return Optional.ofNullable(byId.get(id));
    }

    public List<AnalysisResult> all() {
        List<AnalysisResult> l = new ArrayList<>(byId.values());
        l.sort((a, b) -> b.createdAt.compareTo(a.createdAt));
        return l;
    }

    public int count() { return byId.size(); }
}
