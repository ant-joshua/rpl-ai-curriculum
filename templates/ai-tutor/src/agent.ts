import { Agent } from '@mastra/core';
import { z } from 'zod';

// === Tool: cek waktu ===
const timeTool = {
  name: 'getCurrentTime',
  description: 'Ambil waktu & tanggal saat ini',
  parameters: z.object({}),
  execute: async () => ({
    timestamp: new Date().toISOString(),
    waktuIndonesia: new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    }),
  }),
};

// === Tool: hitung nilai ===
const gradeTool = {
  name: 'calculateGrade',
  description: 'Hitung nilai akhir berdasarkan komponen tugas, UTS, UAS',
  parameters: z.object({
    tugas: z.number().min(0).max(100),
    uts: z.number().min(0).max(100),
    uas: z.number().min(0).max(100),
  }),
  execute: async ({ tugas, uts, uas }) => {
    const akhir = tugas * 0.2 + uts * 0.3 + uas * 0.5;
    let grade = 'E';
    if (akhir >= 85) grade = 'A';
    else if (akhir >= 70) grade = 'B';
    else if (akhir >= 55) grade = 'C';
    else if (akhir >= 40) grade = 'D';
    return { nilaiAkhir: akhir.toFixed(1), grade };
  },
};

// === Agent Tutor ===
export const tutorAgent = new Agent({
  name: 'RPL-AI-Tutor',
  instructions: `Kamu adalah asisten tutor SMK jurusan RPL AI.

  **Identitas:**
  - Nama: RPL AI Tutor
  - Bahasa: Bahasa Indonesia
  - Target: Siswa SMK kelas 10–12
  
  **Cara Mengajar:**
  - Jelaskan konsep dengan bahasa sederhana
  - Beri contoh kode yang relevan (TypeScript/JavaScript)
  - Jika siswa bingung, breakdown ke langkah kecil
  - Gunakan analogi kehidupan sehari-hari
  - Berikan latihan soal di akhir penjelasan
  
  **Materi yang dikuasai:**
  - Dasar pemrograman (TS/JS)
  - Web development (HTML, CSS, React, Next.js)
  - Backend API (Express, Prisma, SQL)
  - AI & Machine Learning (konsep dasar)
  - Docker & deployment
  
  **Tools yang tersedia:**
  - getCurrentTime: cek waktu sekarang
  - calculateGrade: hitung nilai akhir siswa
  `,
  model: {
    provider: 'OPEN_AI',
    name: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
  },
  tools: [timeTool, gradeTool],
});

export default tutorAgent;
