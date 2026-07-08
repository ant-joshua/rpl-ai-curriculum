# Sesi 2: Implementasi — AI Study Assistant

> **Durasi:** 4 minggu (Sprint 2–3) | **Mode:** Kelompok 3–4 orang

---

## 📋 Ringkasan

Sesi ini mencakup implementasi inti AI Study Assistant: integrasi LLM, pipeline RAG, frontend React, desain database lengkap, dan struktur kode backend FastAPI. Mahasiswa akan membangun sistem dari auth hingga chat AI yang berfungsi penuh dengan streaming response. Fokus sesi ini adalah menulis kode production-ready dengan error handling, type safety, dan arsitektur yang bersih.

---

## 1. LLM Integration

### 1.1 Arsitektur Mastra Agent

AI Study Assistant menggunakan **Mastra Python SDK** sebagai framework agen. Mastra menyediakan abstraksi untuk agent, tools, dan memory yang terintegrasi dengan LLM.

```python
# app/agents/study_agent.py
from mastra import Agent, Tool
from mastra.memory import InMemoryMemory

study_agent = Agent(
    name="ai-study-assistant",
    instructions="""
        Kamu adalah AI Study Assistant, asisten belajar untuk mahasiswa.
        Gunakan tools yang tersedia untuk menjawab pertanyaan.
        Prioritas: retrieve_context → jika tidak cukup, baru web_search.
        Jika pengguna meminta kode, gunakan run_code untuk mengeksekusi.
        Selalu sebutkan sumber jawaban (nama dokumen).
        Jika tidak tahu, akui. Jangan halusinasi.
    """,
    model="openai:gpt-4o-mini",
    tools=[retrieve_context, run_code, web_search, get_course_info],
    memory=InMemoryMemory(last_n=10)
)
```

### 1.2 Multi-Provider LLM

Sistem mendukung switch model via environment variable:

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    llm_provider: str = "openai"  # atau "gemini"
    llm_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    openai_api_key: str = ""
    gemini_api_key: str = ""

    @property
    def mastra_model(self) -> str:
        if self.llm_provider == "gemini":
            return f"google:{self.llm_model}"
        return f"openai:{self.llm_model}"
```

### 1.3 Streaming Response (SSE)

Endpoint chat menggunakan Server-Sent Events untuk streaming jawaban token per token:

```python
# app/api/chat.py
from fastapi.responses import StreamingResponse
import json

@router.post("/sessions/{session_id}/messages")
async def send_message(session_id: UUID, message: MessageCreate, user=Depends(get_current_user)):
    async def event_stream():
        # 1. Load context & history
        context = await retrieve_context(message.content, session.course_id)
        history = await get_chat_history(session_id)
        
        # 2. Run agent
        async for chunk in study_agent.run_stream(
            message=message.content,
            context=context,
            history=history
        ):
            if chunk.type == "token":
                yield f"data: {json.dumps({'type': 'token', 'content': chunk.text})}\n\n"
            elif chunk.type == "source":
                yield f"data: {json.dumps({'type': 'source', 'sources': chunk.data})}\n\n"
        
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## 2. RAG Pipeline

### 2.1 Document Processing Pipeline

```
Upload → Extract Text (PyMuPDF) → Chunk (512 token, overlap 128)
→ Embed (text-embedding-3-small) → Store in pgvector
```

```python
# app/services/document_processor.py
import fitz  # PyMuPDF
from openai import OpenAI

class DocumentProcessor:
    CHUNK_SIZE = 512
    CHUNK_OVERLAP = 128
    
    async def process_document(self, document, file_content: bytes):
        # Extract text
        text = self._extract_text(file_content, document.file_type)
        
        # Chunk
        chunks = self._chunk_text(text)
        
        # Generate embeddings (batch)
        embeddings = await self._generate_embeddings(chunks)
        
        # Save to database
        await self._save_chunks(document.id, chunks, embeddings)
        
        return len(chunks)
    
    def _extract_text(self, content: bytes, file_type: str) -> str:
        if file_type == "pdf":
            doc = fitz.open(stream=content, filetype="pdf")
            return "\n".join(page.get_text() for page in doc)
        return content.decode("utf-8")
    
    def _chunk_text(self, text: str) -> list[str]:
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = start + self.CHUNK_SIZE
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start += self.CHUNK_SIZE - self.CHUNK_OVERLAP
        return chunks
    
    async def _generate_embeddings(self, chunks: list[str]) -> list[list[float]]:
        client = OpenAI()
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunks
        )
        return [item.embedding for item in response.data]
```

### 2.2 Vector Search (pgvector)

```python
# app/services/retrieval.py
from sqlalchemy import text

class RetrievalService:
    async def search(self, query: str, course_id: UUID, top_k: int = 5, min_score: float = 0.7):
        # Embed query
        query_embedding = await self._embed_query(query)
        
        # Cosine similarity search
        sql = text("""
            SELECT 
                dc.content,
                d.title as doc_title,
                dc.chunk_index,
                1 - (dc.embedding <=> :query_embedding) AS score
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE d.course_id = :course_id
            ORDER BY dc.embedding <=> :query_embedding
            LIMIT :top_k
        """)
        
        results = await db.execute(sql, {
            "query_embedding": query_embedding,
            "course_id": course_id,
            "top_k": top_k
        })
        
        rows = results.fetchall()
        filtered = [r for r in rows if r.score >= min_score]
        
        return filtered
```

### 2.3 Hybrid Search Enhancement

Untuk meningkatkan akurasi retrieval, implementasikan hybrid search (keyword + vector):

```python
async def hybrid_search(query: str, course_id: UUID):
    # Vector search
    vector_results = await vector_search(query, course_id)
    
    # Full-text search (PostgreSQL tsvector)
    fts_results = await fts_search(query, course_id)
    
    # Combine with weighted scoring
    combined = {}
    for r in vector_results:
        combined[r['chunk_id']] = {'chunk': r, 'score': r['score'] * 0.7}
    for r in fts_results:
        if r['chunk_id'] in combined:
            combined[r['chunk_id']]['score'] += r['score'] * 0.3
        else:
            combined[r['chunk_id']] = {'chunk': r, 'score': r['score'] * 0.3}
    
    return sorted(combined.values(), key=lambda x: x['score'], reverse=True)[:5]
```

---

## 3. Frontend Implementation

### 3.1 Struktur Halaman

| Halaman | Route | Komponen Utama | Status |
|---------|-------|---------------|--------|
| Login/Register | `/login`, `/register` | AuthForm | S1 |
| Dashboard | `/dashboard` | CourseCard, ProgressBar | S1 |
| Daftar Kursus | `/courses` | CourseGrid, SearchBar | S2 |
| Detail Kursus | `/courses/:id` | CourseDetail, DocumentList | S2 |
| Upload Dokumen | `/courses/:id/upload` | UploadForm, FilePreview | S2 |
| Chat | `/courses/:id/chat/:sessionId?` | ChatWindow, MessageBubble, SourcePanel | S3 |

### 3.2 Chat Component

```jsx
// frontend/src/components/Chat/ChatWindow.jsx
import { useState, useRef, useEffect } from 'react';

export default function ChatWindow({ courseId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const eventSourceRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Create session if needed
    if (!sessionId) {
      const res = await fetch(`/api/courses/${courseId}/sessions`, { method: 'POST' });
      const { id } = await res.json();
      setSessionId(id);
    }

    // SSE stream
    const response = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMsg = { role: 'assistant', content: '', sources: [] };

    setMessages(prev => [...prev, assistantMsg]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      
      for (const line of lines) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'token') {
          assistantMsg.content += data.content;
          setMessages(prev => [...prev.slice(0, -1), { ...assistantMsg }]);
        } else if (data.type === 'source') {
          assistantMsg.sources = data.sources;
          setMessages(prev => [...prev.slice(0, -1), { ...assistantMsg }]);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <TypingIndicator />}
      </div>
      <div className="border-t p-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Tanya tentang materi kuliah..."
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  );
}
```

### 3.3 State Management

Gunakan React Context untuk auth state dan SWR/React Query untuk data fetching:

```typescript
// frontend/src/hooks/useAuth.ts
import { createContext, useContext } from 'react';

interface AuthContext {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContext>({} as AuthContext);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
}
```

---

## 4. Database Design

### 4.1 Complete Schema

```sql
-- Enable pgvector
CREATE EXTENSION vector;

-- Users table (Sprint 1)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'lecturer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses table (Sprint 2)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    lecturer_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(20) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Documents (Sprint 2)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(10),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Document chunks with vector embeddings (Sprint 2)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector index (IVFFlat)
CREATE INDEX idx_chunks_embedding ON document_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Chat sessions (Sprint 3)
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages (Sprint 3)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    feedback SMALLINT CHECK (feedback IN (-1, 0, 1)),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_session ON chat_messages(session_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_chunks_document ON document_chunks(document_id);
```

---

## 5. Code Structure (Backend)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, lifespan, CORS
│   ├── core/
│   │   ├── config.py            # Pydantic Settings
│   │   ├── security.py          # JWT encode/decode, password hash
│   │   └── database.py          # SQLAlchemy async engine + session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # SQLAlchemy model
│   │   ├── course.py
│   │   ├── document.py
│   │   ├── document_chunk.py
│   │   ├── enrollment.py
│   │   ├── chat_session.py
│   │   └── chat_message.py
│   ├── schemas/
│   │   ├── auth.py              # Pydantic request/response
│   │   ├── course.py
│   │   ├── document.py
│   │   └── chat.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependency injection (get_db, get_current_user)
│   │   ├── auth.py              # /api/auth/*
│   │   ├── courses.py           # /api/courses/*
│   │   ├── documents.py         # /api/documents/*
│   │   ├── chat.py              # /api/sessions/*, streaming
│   │   └── lecturer.py          # /api/lecturer/* (dashboard dosen)
│   ├── services/
│   │   ├── auth_service.py      # Business logic auth
│   │   ├── course_service.py
│   │   ├── document_processor.py # Chunking + embedding
│   │   ├── retrieval.py         # Vector search
│   │   └── eval_service.py      # Evaluation runner
│   ├── agents/
│   │   ├── study_agent.py       # Mastra agent definition
│   │   └── tools/
│   │       ├── retrieve_context.py
│   │       ├── run_code.py
│   │       ├── web_search.py
│   │       └── get_course_info.py
│   └── utils/
│       ├── file_handler.py      # Upload/download files
│       └── streaming.py         # SSE helpers
├── migrations/                  # Alembic
│   ├── env.py
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_courses.py
│   └── test_chat.py
├── eval/
│   ├── eval_set.json
│   ├── eval_runner.py
│   └── metrics.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## 6. Latihan

> **Latihan 1:** Implementasi Auth
> Buat endpoint register dan login di FastAPI. Gunakan bcrypt untuk hash password, JWT dengan access token (15 menit) dan refresh token (7 hari). Buat middleware `get_current_user` yang memvalidasi token. Tulis test untuk: register sukses, register email duplikat, login wrong password, akses protected route tanpa token.

> **Latihan 2:** Document Chunking Pipeline
> Buat fungsi `process_document` yang menerima bytes file PDF, mengekstrak teks dengan PyMuPDF, melakukan chunking dengan ukuran 512 token dan overlap 128, lalu menyimpan chunk ke database. Tampilkan log jumlah chunk yang dihasilkan.

> **Latihan 3:** Vector Search Endpoint
> Implementasi endpoint `POST /api/courses/{id}/search` yang menerima query string, melakukan embedding, mencari cosine similarity di pgvector, dan mengembalikan top 5 chunk dengan skor. Tambahkan threshold minimum 0.7.

> **Latihan 4:** Mastra Agent with Tools
> Definisikan Mastra agent dengan minimal 2 tools: `retrieve_context` dan `run_code`. Implementasi tool `retrieve_context` yang memanggil vector search. Tool `run_code` yang mengeksekusi Python di sandbox dengan timeout 10 detik.

> **Latihan 5:** Chat UI dengan SSE Streaming
> Buat komponen React `ChatWindow` yang: (a) mengirim pesan ke endpoint streaming, (b) membaca SSE event stream, (c) menampilkan token satu per satu, (d) menampilkan source citations di panel terpisah. Handle error dan loading state.

> **Latihan 6:** Chat History & Memory
> Implementasi penyimpanan riwayat chat ke tabel `chat_messages`. Saat agent start, muat 10 pesan terakhir dari database sebagai konteks. Pastikan setiap sesi chat memiliki konteks yang terisolasi.

> **Latihan 7:** Feedback System
> Tambahkan tombol thumb up/down di setiap jawaban AI. Implementasi endpoint `POST /api/messages/{id}/feedback` yang menyimpan nilai feedback (-1, 0, 1) ke database. Tampilkan persentase feedback positif di dashboard dosen.

---

## 💡 Tips

- **Type safety**: Gunakan Pydantic schemas untuk semua request/response. Jangan kirim raw dict.
- **Error handling**: Semua endpoint harus punya try/except dengan HTTPException yang informatif.
- **Testing**: Mock OpenAI API panggilan di test agar tidak kena biaya dan lebih cepat.
- **Git hygiene**: Commit tiap fitur selesai. Gunakan branch `feat/*` dan merge via PR.

---

| [← Sesi 1: Perencanaan](01-project-plan.md) | [Lanjut ke Sesi 3: Deployment & Testing →](03-deployment-testing.md) |
|---|---|
