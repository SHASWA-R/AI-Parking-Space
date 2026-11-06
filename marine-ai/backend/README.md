# Marine AI Intelligence — Backend

Spring Boot 3 (Java 21) implementation of the Acoustic Geometric
Regularity pipeline.

## Run

```bash
mvn spring-boot:run          # http://localhost:8080
```

Or with Docker:

```bash
docker build -t marine-ai-backend .
docker run -p 8080:8080 marine-ai-backend
```

## Test the pipeline

```bash
curl -F "image=@sonar_001.png" http://localhost:8080/api/analyze | jq
curl http://localhost:8080/api/statistics | jq
curl http://localhost:8080/actuator/health
```

Sample sonar images can be generated with the simulator:

```bash
cd ../model && python3 -m simulator.compose --out ../data/synthetic --n 20
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/analyze` | Upload and analyse sonar imagery |
| GET | `/api/detections` | Analysis history |
| GET | `/api/detections/{id}` | One analysis |
| GET | `/api/statistics` | Dashboard aggregates |
| GET | `/actuator/health` | Health check |

## Tuning without a rebuild

Everything in `application.yml` under `marine.*` binds at runtime via
`@ConfigurationProperties`. Signature thresholds and anomaly score
weights can be changed and the app restarted in seconds — useful when
demonstrating how the scoring model behaves.

## Two things that will bite you

**Alpine base images do not work.** OpenCV natives are glibc-linked.
Use `eclipse-temurin:21-jre-jammy` with `libgl1` and `libglib2.0-0`,
as the Dockerfile does.

**`Mat` memory is off-heap.** The JVM will not reclaim it. Every
pipeline stage wraps its Mats in `MatScope`, which releases them on
close. If you add a stage, use `MatScope` — otherwise resident memory
climbs while the heap looks perfectly healthy, and the container is
eventually killed mid-demo.

## Status

Implemented and validated: the five geometric signatures, ported from
the Python reference in `../model/simulator/signatures.py` which scores
10/11 against simulator ground truth with zero false positives on
natural objects.

Not yet implemented: ONNX model inference (the `Detector` interface is
in place for it), PostgreSQL persistence, JWT auth, XTF geotagging,
report generation, drift forecasting.
