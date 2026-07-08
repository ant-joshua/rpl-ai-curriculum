# Sesi 3: Deployment & Testing — AI Study Assistant

> **Durasi:** 2 minggu (Sprint 4) | **Mode:** Kelompok 3–4 orang

---

## 📋 Ringkasan

Sesi terakhir ini berfokus pada quality assurance dan production deployment. Mahasiswa akan menyusun testing strategy (unit, integration, eval), mendeploy aplikasi ke Vercel/Cloudflare, menyiapkan monitoring, mempersiapkan demo, dan menyusun presentasi final. Output sesi ini adalah aplikasi live di domain publik dengan CI pipeline hijau dan dokumentasi lengkap.

---

## 1. Testing Strategy

### 1.1 Testing Pyramid

```
         ╱╲
        ╱ E2E ╲
       ╱  (5%)  ╲
      ╱───────────╲
     ╱ Integration ╲
    ╱    (20%)      ╲
   ╱─────────────────╲
  ╱    Unit Tests     ╲
 ╱       (75%)         ╲
╱───────────────────────╲
```

### 1.2 Unit Tests

| Area | Framework | Contoh Test | Target Coverage |
|------|-----------|-------------|-----------------|
| Auth service | pytest | Hash password, JWT encode/decode, token expiry | 90% |
| Document processor | pytest | Chunking正确, overlap calculation, text extraction | 85% |
| Retrieval service | pytest | Cosine similarity ranking, threshold filtering | 80% |
| Tools (Mastra) | pytest | Tool input validation, error handling | 80% |

```python
# tests/test_document_processor.py
import pytest
from app.services.document_processor import DocumentProcessor

class TestDocumentProcessor:
    def setup_method(self):
        self.processor = DocumentProcessor()
    
    def test_chunk_size_respected(self):
        text = "word " * 1000
        chunks = self.processor._chunk_text(text)
        for chunk in chunks:
            word_count = len(chunk.split())
            assert word_count <= 512, f"Chunk exceeds 512 words: {word_count}"
    
    def test_overlap_correct(self):
        text = "word " * 2000
        chunks = self.processor._chunk_text(text)
        if len(chunks) > 1:
            chunk1_end = " ".join(chunks[0].split()[-128:])
            chunk2_start = " ".join(chunks[1].split()[:128])
            assert chunk1_end == chunk2_start, "Overlap mismatch"
    
    def test_empty_text_returns_empty_list(self):
        chunks = self.processor._chunk_text("")
        assert chunks == []
    
    def test_pdf_extraction(self, sample_pdf_bytes):
        text = self.processor._extract_text(sample_pdf_bytes, "pdf")
        assert len(text) > 0
        assert "JOIN" in text  # Materi basis data dalam sample PDF
```

### 1.3 Integration Tests

| Area | Alat | Skenario |
|------|------|----------|
| API endpoints | pytest + httpx | Register → login → CRUD course → upload → chat |
| Database | psycopg2 | Migration up/down, seed data, query correctness |
| RAG pipeline | pytest | Upload → chunk → embed → search → verify result |

```python
# tests/test_chat_integration.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_full_chat_flow(test_db, lecturer_token, student_token):
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Lecturer creates course
        course_res = await client.post(
            "/api/courses",
            json={"title": "Basis Data", "code": "RPL401"},
            headers={"Authorization": f"Bearer {lecturer_token}"}
        )
        assert course_res.status_code == 201
        course_id = course_res.json()["id"]
        
        # 2. Student enrolls
        enroll_res = await client.post(
            f"/api/courses/{course_id}/enroll",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert enroll_res.status_code == 200
        
        # 3. Upload document
        # (mock file upload - skipped for brevity)
        
        # 4. Create chat session
        session_res = await client.post(
            f"/api/courses/{course_id}/sessions",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert session_res.status_code == 201
        session_id = session_res.json()["id"]
        
        # 5. Send message
        msg_res = await client.post(
            f"/api/sessions/{session_id}/messages",
            json={"content": "Apa itu JOIN SQL?"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert msg_res.status_code == 200
        # Verify streaming response
        assert "text/event-stream" in msg_res.headers["content-type"]
```

### 1.4 Eval Set for RAG Pipeline

Buat eval set Q&A dengan reference passage untuk mengukur kualitas RAG:

```json
// eval/eval_set.json
{
  "course_id": "RPL401",
  "questions": [
    {
      "id": "q1",
      "question": "Apa fungsi JOIN dalam SQL?",
      "reference_chunks": ["chunk_1_id", "chunk_2_id"],
      "expected_keywords": ["menggabungkan", "tabel", "kolom", "relasi"],
      "difficulty": "easy"
    },
    {
      "id": "q2", 
      "question": "Jelaskan perbedaan INNER JOIN dan LEFT JOIN dengan contoh.",
      "reference_chunks": ["chunk_5_id", "chunk_6_id"],
      "expected_keywords": ["INNER JOIN", "LEFT JOIN", "NULL", "baris"],
      "difficulty": "medium"
    }
  ]
}
```

```python
# eval/eval_runner.py
from app.services.retrieval import RetrievalService

async def run_eval(eval_set: dict):
    metrics = {
        "faithfulness": 0,
        "context_recall": 0,
        "answer_relevancy": 0
    }
    
    for q in eval_set["questions"]:
        # Test retrieval
        context = await retrieval_service.search(q["question"], q["course_id"])
        retrieved_chunks = {c["chunk_id"] for c in context}
        reference_chunks = set(q["reference_chunks"])
        
        # Context recall
        overlap = len(retrieved_chunks & reference_chunks)
        metrics["context_recall"] += overlap / len(reference_chunks)
        
        # Test answer (via LLM-as-judge)
        answer = await get_ai_answer(q["question"])
        faithfulness = await judge_faithfulness(answer, context)
        metrics["faithfulness"] += faithfulness
    
    n = len(eval_set["questions"])
    return {k: v / n for k, v in metrics.items()}
```

---

## 2. Deployment (Vercel / Cloudflare)

### 2.1 Deployment Architecture

```
                    ┌──────────────────────┐
                    │   Cloudflare DNS      │
                    │   (domain.com)        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  Vercel      │  │  Railway     │  │  Neon        │
     │  (Frontend)  │  │  (Backend)   │  │  (PostgreSQL)│
     │  React SPA   │  │  FastAPI     │  │  + pgvector  │
     └──────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Backend Deployment (Railway / Render)

```dockerfile
# Dockerfile (backend)
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: studyassistant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/studyassistant
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - db

volumes:
  pgdata:
```

### 2.3 Frontend Deployment (Vercel)

```json
// vercel.json (frontend)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://backend-railway.up.railway.app/api/$1" }
  ]
}
```

### 2.4 Environment Variables

```
# .env.production
DATABASE_URL=postgresql+asyncpg://user:pass@neon-host:5432/db?sslmode=require
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
JWT_SECRET=change-this-to-random-64-chars
JWT_ACCESS_EXPIRE=15
JWT_REFRESH_EXPIRE=10080
CORS_ORIGINS=https://frontend.vercel.app
```

### 2.5 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install ruff mypy
      - run: ruff check app/
      - run: mypy app/

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: testdb
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pip install pytest-asyncio httpx
      - run: pytest tests/ -v --cov=app --cov-report=term
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/testdb
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

  deploy:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Backend
        run: |
          # Railway CLI or Render API deploy
          curl -X POST ${{ secrets.RAILWAY_DEPLOY_HOOK }}
```

---

## 3. Monitoring

### 3.1 Application Monitoring

| Aspek | Tools | Metrik |
|-------|-------|--------|
| Logging | Logfire / Sentry | Error rate, exception trace |
| Performance | OpenTelemetry + Grafana | Response time (p50, p95, p99), DB query time |
| API Usage | Prometheus + Grafana | Request rate, token usage, cost |
| Uptime | UptimeRobot / BetterStack | Health check endpoint setiap 5 menit |

### 3.2 AI-Specific Monitoring

```python
# app/utils/monitoring.py
import time
import logging

logger = logging.getLogger("ai.study_assistant")

class AIMonitor:
    def __init__(self):
        self.metrics = {
            "total_requests": 0,
            "total_tokens": 0,
            "errors": 0,
            "avg_latency_ms": 0,
        }
    
    def track_llm_call(self, func):
        async def wrapper(*args, **kwargs):
            start = time.time()
            self.metrics["total_requests"] += 1
            try:
                result = await func(*args, **kwargs)
                latency = (time.time() - start) * 1000
                self.metrics["avg_latency_ms"] = (
                    (self.metrics["avg_latency_ms"] * (self.metrics["total_requests"] - 1) + latency)
                    / self.metrics["total_requests"]
                )
                if hasattr(result, "usage"):
                    self.metrics["total_tokens"] += result.usage.total_tokens
                return result
            except Exception as e:
                self.metrics["errors"] += 1
                logger.error(f"LLM call failed: {e}", exc_info=True)
                raise
        return wrapper
```

### 3.3 Health Check Endpoint

```python
@router.get("/api/health")
async def health_check(db=Depends(get_db)):
    # Check database connectivity
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Check LLM connectivity
    try:
        llm_status = "healthy"
        # Optional: test embedding API
    except Exception:
        llm_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": "1.0.0",
        "database": db_status,
        "llm": llm_status,
        "uptime_seconds": time.time() - START_TIME
    }
```

---

## 4. Demo Preparation

### 4.1 Demo Script (5-7 menit)

| Waktu | Skenario | Aktor | Yang Ditampilkan |
|-------|----------|-------|------------------|
| 0:00–0:30 | Pembukaan | Tim | Intro masalah & solusi |
| 0:30–1:30 | Register & Login | Tim | Auth flow, role-based UI |
| 1:30–2:30 | Buat Kursus & Upload | Dosen | CRUD course, upload PDF, auto-chunking |
| 2:30–4:00 | Chat dengan AI | Mahasiswa | Tanya jawab, streaming, source citation |
| 4:00–5:00 | Run Code | Mahasiswa | Eksekusi Python di chat |
| 5:00–5:30 | Feedback | Mahasiswa | Thumb up/down |
| 5:30–6:30 | Dashboard Dosen | Dosen | Log chat, statistik, eval |
| 6:30–7:00 | Penutup | Tim | Arsitektur, tech stack, lessons learned |

### 4.2 Presentasi Tips

1. **Jangan live-code** — rekam video demo sebagai backup. Demo live bisa error.
2. **Siapkan data dummy** — isi database dengan sample course, dokumen, dan chat history sebelum demo.
3. **Highlight AI** — tunjukkan perbedaan jawaban dengan dan tanpa RAG context.
4. **Ceritakan kegagalan** — penguji suka mendengar apa yang tidak berhasil dan bagaimana kalian solved it.
5. **Slide max 7** — problem, solution, architecture, tech stack, demo, results, lessons learned.

### 4.3 Checklist Presentasi

- [ ] Slide deck siap (max 7 slide)
- [ ] Video demo direkam (3-5 menit, mp4)
- [ ] Aplikasi live (domain publik)
- [ ] README final lengkap
- [ ] Swagger docs aktif
- [ ] Repository public / accessible
- [ ] Semua anggota tim siap presentasi
- [ ] Backup plan: offline demo jika internet bermasalah

---

## 5. Latihan

> **Latihan 1:** Unit Test Suite
> Tulis minimal 10 unit test untuk service layer: auth_service (hash, verify, JWT), document_processor (chunking, overlap, empty text), retrieval_service (search, threshold, no results). Gunakan pytest fixtures untuk mock database.

> **Latihan 2:** Integration Test for Chat Flow
> Tulis integration test yang mensimulasikan flow lengkap: register lecturer → login → create course → upload document → register student → login → enroll → create session → send message → verify streaming response. Gunakan httpx AsyncClient.

> **Latihan 3:** Eval Set & Runner
> Buat eval set dengan 5 pertanyaan untuk course "Basis Data". Tulis script eval_runner.py yang mengukur context recall (persentase reference chunks yang ter-retrieve) dan faithfulness. Output: JSON report dengan skor per pertanyaan.

> **Latihan 4:** Docker Compose Setup
> Buat docker-compose.yml untuk development dengan 3 service: PostgreSQL (pgvector), backend FastAPI, dan MinIO (file storage). Pastikan semua service bisa `docker compose up` tanpa error.

> **Latihan 5:** CI Pipeline with GitHub Actions
> Setup GitHub Actions workflow: lint (ruff + mypy), test (pytest with PostgreSQL service), build (Docker image). Pastikan pipeline hijau di PR. Gunakan secrets untuk API key.

> **Latihan 6:** Deploy to Railway
> Deploy backend FastAPI ke Railway. Setup PostgreSQL + pgvector di Neon. Config environment variables. Test dari Postman bahwa semua endpoint berfungsi. Catat langkah-langkah di README.

> **Latihan 7:** Demo Script & Presentasi
> Buat script demo 7 menit untuk presentasi. Sertakan: (a) slide deck 7 slide, (b) video demo terpisah, (c) daftar potential pitfalls dan backup plan. Praktikkan dengan timer minimal 2 kali.

---

## 📊 Evaluation Rubric (Sesi 3)

| Kriteria | Bobot | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|-------|---------------|----------|----------|----------|
| **Testing Coverage** | 25% | ≥80% coverage, integration test for chat flow | ≥60% coverage, unit test coverage baik | ≥40% coverage, hanya unit test | <40% atau tidak ada test |
| **AI Evaluation** | 20% | Eval set ≥10 Q&A, context recall ≥0.8, metrics di-report | Eval set ada, metrics dihitung | Eval set minimal, tidak di-run | Tidak ada eval |
| **Deployment** | 25% | Live di domain publik, CI hijau, Swagger aktif, Docker compose jalan | Deployed, minor issue, CI jalan | Deployed tapi error, CI tidak lengkap | Tidak di-deploy |
| **Monitoring & Error Handling** | 15% | Health check, logging, error tracking, graceful degradation | Health check ada, logging minimal | Error handling basic | Tidak ada monitoring |
| **Presentasi & Demo** | 15% | Demo lancar, slide rapi, semua anggota presentasi, backup video | Demo jalan, slide cukup, ada backup | Demo tersendat, slide minimal | Tidak siap presentasi |

---

## 💡 Tips

- **Deploy early, deploy often** — jangan menunggu sprint 4 untuk deploy. Deploy backend di minggu 2.
- **Mock LLM di test** — gunakan `pytest.mark.mock_llm` agar test cepat dan tidak kena biaya.
- **Sentry for errors** — integrasi Sentry di FastAPI untuk capture error production.
- **Backup demo** — rekam video demo 2×: sekali full version, sekali version singkat 3 menit.
- **Dress rehearsal** — lakukan gladi bersih presentasi minimal 1 hari sebelum jadwal presentasi.

---

| [← Sesi 2: Implementasi](02-implementation.md) | [Kembali ke README →](README.md) |
|---|---|
