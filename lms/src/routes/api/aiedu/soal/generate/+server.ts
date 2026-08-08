import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { generateDoc } from '$lib/server/aiedu';

// POST /api/aiedu/soal/generate — generate quiz questions from pasted material, save to question bank
// Body: { material, subject, grade, topic, count?, course_offering_id?, difficulty? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

    const body = await request.json();
    const { material, subject = '', grade = '', topic = '', count = 10, course_offering_id, difficulty = 'medium' } = body;

    if (!material || material.trim().length < 50) {
      return jsonResponse({ success: false, error: 'Materi terlalu pendek — minimal 50 karakter' }, 400);
    }
    const qCount = Math.min(Math.max(Number(count) || 10, 3), 20);

    const db = getDB(platform);

    // 1. AI generates soal in markdown format
    const prompt = `Buatkan ${qCount} soal pilihan ganda (4 opsi a-d) beserta kunci jawaban dan penjelasan singkat, berdasarkan materi berikut.
Format setiap soal:
1. [soal]
a) [opsi a]
b) [opsi b]
c) [opsi c]
d) [opsi d]
Jawaban: [huruf yang benar]
Penjelasan: [penjelasan singkat]

Materi:
"""${material.slice(0, 8000)}"""`;

    const aiOutput = await generateDoc(platform, 'soal', subject || 'Umum', grade || 'Umum', topic || 'Materi', prompt);

    // 2. Parse markdown → questions
    const questions = parseSoalMarkdown(aiOutput);
    if (questions.length === 0) {
      return jsonResponse({ success: false, error: 'AI tidak menghasilkan soal valid. Coba lagi.' }, 422);
    }

    // 3. Insert into question_bank
    const stmts: any[] = [];
    for (const q of questions.slice(0, qCount)) {
      // Convert options + answer → JSON options; answer letter embedded in explanation
      let optionsJson: string | null = null;
      if (q.options && q.options.length >= 2) {
        optionsJson = JSON.stringify(q.options.map((o: string) => o.trim()));
      }

      const answerLetter = q.answerIndex !== null ? String.fromCharCode(97 + q.answerIndex) : null;
      const explanationWithAnswer = answerLetter
        ? `Kunci: ${answerLetter}. ${q.explanation || ''}`
        : q.explanation || null;

      stmts.push(
        db.prepare(
          `INSERT INTO question_bank (id, course_offering_id, type, question, options, difficulty, tags, explanation, points, status, imported_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, datetime('now'), datetime('now'))`
        ).bind(
          crypto.randomUUID(),
          course_offering_id || null,
          q.type,
          q.question,
          optionsJson,
          q.difficulty || difficulty,
          q.tags || '',
          explanationWithAnswer,
          q.points || 1,
          session.user.id
        )
      );
    }

    await db.batch(stmts);

    return jsonResponse({
      success: true,
      data: {
        count: stmts.length,
        questions: stmts.length,
        generated_from: 'material',
      }
    }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

function parseSoalMarkdown(content: string): Array<{
  type: string;
  question: string;
  options: string[] | null;
  answerIndex: number | null;
  difficulty: string;
  explanation: string | null;
  points: number;
  tags: string;
}> {
  const questions: ReturnType<typeof parseSoalMarkdown> = [];
  const blocks = content.split(/\n\s*\n(?=\d+[\.\)]\s)/).filter(b => /^\d+[\.\)]\s/.test(b.trim()));

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const firstLine = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    let question = firstLine;
    const options: string[] = [];
    let answerIndex: number | null = null;
    let explanation = '';
    let difficulty = 'medium';
    let points = 1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const optMatch = line.match(/^([a-dA-D])[\.\)]\s+(.+)/);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }
      if (/^[-*•]\s+/.test(line)) { options.push(line.replace(/^[-*•]\s+/, '').trim()); continue; }
      const ansMatch = line.match(/^(?:jawaban|kunci|answer)\s*[:：-]?\s*([a-dA-D])/i);
      if (ansMatch) {
        const letter = ansMatch[1].toLowerCase();
        answerIndex = letter.charCodeAt(0) - 97;
        continue;
      }
      if (/^(?:penjelasan|pembahasan)\s*[:：-]/i.test(line)) {
        explanation += line.replace(/^(?:penjelasan|pembahasan)\s*[:：-]\s*/i, '').trim() + ' ';
        continue;
      }
    }

    const type = options.length >= 2 ? 'multiple_choice' : 'essay';
    const tags = (firstLine.match(/#(\w+)/) || []).join(',');

    questions.push({
      type,
      question,
      options: options.length ? options : null,
      answerIndex: type === 'multiple_choice' ? answerIndex : null,
      difficulty,
      explanation: explanation.trim() || null,
      points,
      tags
    });
  }

  return questions;
}