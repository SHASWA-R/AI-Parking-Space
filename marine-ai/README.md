# Marine AI Intelligence

SIH 2026 · Ministry of Earth Sciences
Automated marine debris detection from side-scan sonar imagery.

## What is here

```
marine-ai/
├── model/                  Python: sonar simulator + signature reference
│   ├── simulator/          the physics forward model and 5 signatures
│   └── requirements.txt
└── backend/                Spring Boot 3 (Java 21) REST API
    ├── src/main/java/com/marineai/
    ├── pom.xml
    └── Dockerfile
```

## Quick start

### 1. Generate test sonar images

```bash
cd model
pip install -r requirements.txt
python3 -m simulator.compose --out ../data/synthetic --n 20
```

Writes images, YOLO labels, masks and ground-truth metadata
(including true mesh pitch) to `data/synthetic/`.

### 2. Check the signature engine works

```bash
python3 -m simulator.validate_signatures
```

Expected: 10/11 correct, zero false positives on natural objects.

### 3. Run the backend

```bash
cd ../backend
mvn spring-boot:run
```

### 4. Analyse an image

```bash
curl -F "image=@../data/synthetic/images/sim_00000.png" \
     http://localhost:8080/api/analyze | jq
```

## Requirements

| Tool | Version | Check |
|---|---|---|
| Java JDK | 21 | `javac -version` |
| Maven | 3.8+ | `mvn -v` |
| Python | 3.10+ | `python3 --version` |
| Node (Step 3) | 18+ | `node -v` |

Note: the JDK, not just the JRE. `java -version` succeeding is not
enough — Maven needs `javac`.

## Status

| Component | State |
|---|---|
| Sonar forward-model simulator | Working, validated |
| 5 geometric signatures (Python) | 10/11 against ground truth |
| Signature engine (Java port) | Written, parses clean, not yet run |
| Spring Boot pipeline + REST API | Written, not yet run |
| ONNX model inference | Interface in place, model not trained |
| PostgreSQL, auth, XTF, reports | Not started |
| React dashboard | Not started |

## Known limitations

- Mesh detection needs high-frequency short-range survey geometry
  (~2 cm/pixel). At standard 100 m range survey resolution no net mesh
  is resolvable, and the system says so instead of guessing.
- Linearity currently mis-rejects sagging cables; straight pipes pass.
- Ghost-net training data is physics-simulated, because no labelled
  real corpus exists. This is disclosed, not concealed.
