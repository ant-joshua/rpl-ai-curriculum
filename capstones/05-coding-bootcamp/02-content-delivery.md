# Sesi 2: Content Delivery & Code Execution

> **Durasi**: 2 minggu (Sprint 2)
> **Fokus**: CodeMirror editor, submission system, sandbox eksekusi kode, frontend integrasi

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Membangun halaman lesson interaktif dengan CodeMirror 6 editor
2. Mengimplementasikan submission system untuk kode mahasiswa
3. Membangun sandbox eksekusi kode dengan Docker container
4. Mengelola status submission (pending → executing → reviewed)
5. Membangun komponen UI untuk menampilkan output eksekusi
6. Mengintegrasikan frontend EJS/Tailwind dengan backend API
7. Menulis test untuk alur submission dan eksekusi

## 📋 Ringkasan Materi

### Arsitektur Content Delivery

Sistem content delivery memungkinkan mahasiswa mengakses materi kursus, menulis kode di browser, dan melihat hasil eksekusi secara real-time:

```
Browser (CodeMirror) → POST /api/lessons/:id/submissions → Express → Docker Sandbox
                                                              ↓
                                                         Execution Output
                                                              ↓
Browser (Output) ← Response ← Express ← Save submission + output
```

### CodeMirror 6 Integration

CodeMirror 6 adalah editor kode browser yang ringan dan dapat dikustomisasi:

```typescript
// public/js/editor.js
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

const editor = new EditorView({
  doc: starterCode || '// Tulis kodemu di sini',
  extensions: [
    basicSetup,
    language === 'javascript' ? javascript() : python(),
    EditorView.theme({
      '&': { height: '400px' },
      '.cm-scroller': { overflow: 'auto' },
    }),
  ],
  parent: document.getElementById('editor-container'),
});

function getCode() {
  return editor.state.doc.toString();
}
```

Fitur CodeMirror yang digunakan:
- **Syntax highlighting**: support JavaScript, TypeScript, Python
- **Line numbers**: untuk referensi komentar review
- **Auto-closing brackets**: meningkatkan UX coding
- **Theme**: dark mode untuk coding experience

### Submission API

Endpoint submissions mengelola pengiriman kode mahasiswa:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/lessons/:id/submissions` | Student | Submit kode untuk lesson tertentu |
| GET | `/api/lessons/:id/submissions` | Instructor/Admin | List submission per lesson |
| GET | `/api/submissions/:id` | All | Detail submission + output |

Flow submission:
1. Mahasiswa menulis kode di CodeMirror
2. Klik "Submit" → kirim `{code, language}` ke server
3. Server simpan submission dengan status `pending`
4. Server jalankan kode di Docker sandbox
5. Output ditangkap dan disimpan
6. Status berubah jadi `reviewed`
7. Response dikembalikan ke browser

### Docker Execution Sandbox

Sandbox menggunakan Docker container untuk menjalankan kode dengan aman:

```typescript
// services/sandbox.service.ts
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';

export class SandboxService {
  async execute(code: string, language: string): Promise<string> {
    const runId = uuid();
    const tempDir = path.join('/tmp/sandbox', runId);
    await fs.mkdir(tempDir, { recursive: true });

    // Tentukan file dan command berdasarkan bahasa
    const configs = {
      javascript: { file: 'script.js', image: 'node:20-alpine', cmd: 'node script.js' },
      python: { file: 'script.py', image: 'python:3.11-alpine', cmd: 'python script.py' },
      typescript: { file: 'script.ts', image: 'node:20-alpine', cmd: 'npx tsx script.ts' },
    };

    const config = configs[language];
    await fs.writeFile(path.join(tempDir, config.file), code);

    try {
      const output = execSync(
        `docker run --rm --memory=256m --cpus=0.5 ` +
        `-v ${tempDir}:/code:ro ${config.image} ${config.cmd}`,
        { timeout: 10000 }
      );
      return output.toString();
    } catch (err) {
      return err.stderr?.toString() || err.message;
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
```

Keamanan sandbox:
- **Resource limits**: memory 256MB, CPU 0.5 core, timeout 10 detik
- **Read-only mount**: kode container tidak bisa menulis ke host
- **No network**: container tidak punya akses internet
- **Auto-cleanup**: direktori temporary dihapus setelah eksekusi
- **User namespace**: container jalan sebagai non-root user

### Frontend Integration dengan EJS + Tailwind

Gunakan EJS template engine dan Tailwind CSS untuk frontend:

```html
<!-- views/lesson.ejs -->
<div class="flex h-screen">
  <!-- Lesson content panel -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <h1 class="text-2xl font-bold"><%= lesson.title %></h1>
    <div class="prose mt-4"><%= lesson.content %></div>
  </div>

  <!-- Code editor panel -->
  <div class="w-1/2 border-l">
    <div class="flex items-center justify-between p-4 bg-gray-100">
      <span class="text-sm font-medium">Editor <%= lesson.language %></span>
      <button id="submitBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit
      </button>
    </div>
    <div id="editor-container"></div>
    <div id="output-container" class="hidden p-4 bg-gray-900 text-green-400 font-mono text-sm">
      <h3 class="text-white font-semibold mb-2">Output:</h3>
      <pre id="output" class="whitespace-pre-wrap"></pre>
    </div>
  </div>
</div>
```

### Frontend JavaScript Logic

```javascript
// public/js/lesson.js
document.getElementById('submitBtn').addEventListener('click', async () => {
  const code = getCode();
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Menjalankan...';

  try {
    const res = await fetch(`/api/lessons/${lessonId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ code, language: lesson.language }),
    });
    const data = await res.json();

    document.getElementById('output-container').classList.remove('hidden');
    document.getElementById('output').textContent = data.data.execution_output;
  } catch (err) {
    alert('Gagal submit: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});
```

### Status Tracking Submission

Setiap submission memiliki status yang dilacak:

| Status | Deskripsi |
|--------|-----------|
| `pending` | Baru disubmit, menunggu eksekusi |
| `reviewed` | Kode sudah dieksekusi dan direview |

UI menampilkan badge status dengan warna berbeda: kuning untuk pending, hijau untuk reviewed.

## 🛠️ Latihan

### Latihan 1: Halaman Lesson dengan CodeMirror

Buat halaman detail lesson dengan editor kode:

1. Setup EJS template untuk halaman lesson
2. Integrasi CodeMirror 6 dengan CDN atau npm
3. Pilih bahasa programming sesuai lesson (JavaScript/Python/TypeScript)
4. Tampilkan starter code dari database di editor
5. Tambahkan tombol "Run" yang menjalankan kode tanpa submit

**Kriteria sukses**: Halaman lesson tampil dengan editor, starter code muncul, syntax highlighting bekerja.

### Latihan 2: Submission API

Bangun API submission:

1. `POST /api/lessons/:id/submissions` — simpan kode baru, status `pending`
2. `GET /api/lessons/:id/submissions` — list submission per lesson (instructor only)
3. `GET /api/submissions/:id` — detail submission + execution output
4. Validasi: pastikan lesson dengan `type: 'code'` bisa disubmit
5. Cegah submission jika lesson type `text`

**Kriteria sukses**: Submission tersimpan, status tracking berfungsi.

### Latihan 3: Docker Sandbox

Bangun sandbox eksekusi kode:

1. Setup Docker image untuk JavaScript (node:20-alpine)
2. Setup Docker image untuk Python (python:3.11-alpine)
3. Implementasi fungsi `execute(code, language)` yang return output
4. Tangani error: syntax error, runtime error, timeout
5. Resource limits: memory 256MB, timeout 10 detik

**Kriteria sukses**: Kode JavaScript dan Python bisa dieksekusi, output tertangkap, error ditampilkan.

### Latihan 4: Integrasi Submit Flow

Hubungkan frontend → API → sandbox:

1. Saat klik Submit, kirim kode ke API
2. API simpan submission, jalankan sandbox, simpan output
3. Tampilkan output di panel bawah editor
4. Tampilkan loading state selama eksekusi
5. Tampilkan error jika eksekusi gagal

**Kriteria sukses**: Alur submit → eksekusi → tampil output berfungsi end-to-end.

### Latihan 5: Submission History

Tampilkan riwayat submission mahasiswa:

1. Dropdown/accordion di bawah editor menampilkan submission sebelumnya
2. Setiap item menampilkan: timestamp, status badge, score (jika sudah direview)
3. Klik item → tampilkan kode + output submission tersebut
4. Highlight perbedaan kode antar submission (diff view)
5. Pagination jika submission > 10

**Kriteria sukses**: Riwayat submission tampil, navigasi antar submission berfungsi.

### Latihan 6: Instructor View Submissions

Buat halaman instruktur untuk melihat submission:

1. List semua submission per lesson dengan filter by student
2. Tampilkan kode + output + status review
3. Kolom pencarian by nama mahasiswa
4. Export submission ke CSV
5. Tandai submission yang belum direview

**Kriteria sukses**: Instruktur bisa melihat, mencari, dan mengekspor submission.

### Latihan 7: Test Submission Flow

Tulis test untuk alur submission:

1. Test submit kode valid → status 201, submission tersimpan
2. Test submit tanpa auth → status 401
3. Test submit ke lesson type 'text' → status 400
4. Test get submission by student → hanya submission miliknya
5. Test instructor lihat semua submission → semua submission lesson
6. Mock sandbox execution untuk test tanpa Docker

**Kriteria sukses**: Semua test passing, sandbox mock bekerja.

## 📚 Referensi

- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [Docker Node.js Images](https://hub.docker.com/_/node)
- [EJS Template Engine](https://ejs.co)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---
**Capstone 5 — Sesi 2: Content Delivery & Code Execution.** Lanjut ke [Sesi 3: AI Tutor & Review System](03-ai-tutor.md).
