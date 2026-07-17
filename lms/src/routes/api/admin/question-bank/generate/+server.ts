import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

const NINE_ROUTER_URL_DEFAULT = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const DEFAULT_MODEL = 'ocg/deepseek-v4-flash';

interface GenerateRequest {
	course_offering_id: string;
	count: number;
	type?: string;
	difficulty?: string;
}

interface GeneratedQuestion {
	type: 'multiple_choice' | 'essay' | 'coding';
	question: string;
	options?: string[];
	code_template?: string;
	test_cases?: { input: string; expected: string }[];
	difficulty: string;
	explanation: string;
	points: number;
	tags: string;
}

function buildSystemPrompt(type?: string, difficulty?: string, context?: string): string {
	let prompt = `Kamu adalah generator soal untuk kurikulum RPL (Rekayasa Perangkat Lunak) tingkat SMK.`;
	if (context) {
		prompt += `\n\nKonteks mata pelajaran:\n${context}`;
	}
	prompt += `\n\nBuat soal yang relevan, sesuai Kurikulum Merdeka, dan memiliki kualitas baik.`;
	prompt += `\nGunakan bahasa Indonesia yang baik dan benar untuk soal dan penjelasan.`;

	if (type && type !== 'all') {
		prompt += `\nTipe soal: ${type}`;
	}
	if (difficulty && difficulty !== 'all') {
		prompt += `\nTingkat kesulitan: ${difficulty}`;
	}

	prompt += `\n\nOutput HARUS berupa JSON array of objects dengan format berikut:

UNTUK MULTIPLE_CHOICE:
{
  "type": "multiple_choice",
  "question": "teks soal?",
  "options": ["jawaban benar", "jawaban salah 1", "jawaban salah 2", "jawaban salah 3"],
  "difficulty": "easy|medium|hard",
  "explanation": "penjelasan mengapa jawaban benar",
  "points": 10,
  "tags": "tag1,tag2"
}

UNTUK ESSAY:
{
  "type": "essay",
  "question": "teks soal essay?",
  "options": null,
  "difficulty": "easy|medium|hard",
  "explanation": "kriteria jawaban yang benar / rubrik penilaian",
  "points": 10,
  "tags": "tag1,tag2"
}

UNTUK CODING:
{
  "type": "coding",
  "question": "deskripsi soal coding?",
  "options": null,
  "code_template": "def solution():\\n    # tulis kode di sini\\n    pass",
  "test_cases": [{"input": "arg1", "expected": "output1"}],
  "difficulty": "easy|medium|hard",
  "explanation": "solusi dan penjelasan",
  "points": 10,
  "tags": "tag1,tag2"
}

PASTIKAN output adalah array JSON (bukan object dengan wrapper).
JANGAN tambahkan teks lain di luar array JSON.
Untuk multiple_choice, opsi pertama HARUS jawaban benar.`;

	return prompt;
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		// Auth check
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}
		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const body = (await request.json()) as GenerateRequest;
		const { course_offering_id, count, type, difficulty } = body;

		// Validate
		if (!course_offering_id) {
			return jsonResponse({ success: false, error: 'course_offering_id wajib diisi' }, 400);
		}
		const qty = Math.min(Math.max(count || 5, 1), 20);

		const db = getDB(platform);

		// Fetch course offering context
		const offering = await db.prepare(
			`SELECT co.name, co.code, c.title AS course_title, c.description AS course_description
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 WHERE co.id = ?`
		).bind(course_offering_id).first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering tidak ditemukan' }, 404);
		}

		const contextStr = `${offering.name} (${offering.code}) - ${offering.course_title}. ${offering.course_description || ''}`;

		// Call 9router AI
		const apiKey = platform.env?.AI_API_KEY || '';
		const apiUrl = platform.env?.AI_API_URL || NINE_ROUTER_URL_DEFAULT;

		const systemPrompt = buildSystemPrompt(type, difficulty, contextStr);
		const userPrompt = `Buatkan ${qty} soal ${type && type !== 'all' ? 'tipe ' + type : 'berbagai tipe'} ${difficulty && difficulty !== 'all' ? 'dengan tingkat kesulitan ' + difficulty : ''} untuk mata pelajaran: ${offering.name} (${offering.course_title}).\n\nTopik: ${offering.course_description || offering.name}\n\nOutput array JSON dengan tepat ${qty} soal.`;

		const payload = {
			model: DEFAULT_MODEL,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			temperature: 0.7,
			max_tokens: 4096,
			response_format: { type: 'json_object' },
		};

		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

		const aiRes = await fetch(apiUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		});

		if (!aiRes.ok) {
			const errText = await aiRes.text();
			throw new Error(`9router API error ${aiRes.status}: ${errText}`);
		}

		const aiData = await aiRes.json();
		const content = aiData?.choices?.[0]?.message?.content || '{"questions":[]}';

		// Parse response — could be { questions: [...] } or raw array
		let parsed: any = JSON.parse(content);
		let questions: GeneratedQuestion[] = [];

		if (Array.isArray(parsed)) {
			questions = parsed.slice(0, qty);
		} else if (parsed.questions && Array.isArray(parsed.questions)) {
			questions = parsed.questions.slice(0, qty);
		}

		if (questions.length === 0) {
			return jsonResponse({ success: false, error: 'AI gagal menghasilkan soal. Coba lagi.' }, 500);
		}

		// Save each question to DB
		const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
		const saved: any[] = [];

		for (const q of questions) {
			const id = crypto.randomUUID();
			const qType = q.type || type || 'multiple_choice';
			const opts = qType === 'multiple_choice' && q.options ? JSON.stringify(q.options) : null;
			const codeTmpl = qType === 'coding' ? (q.code_template || null) : null;
			const testCases = qType === 'coding' && q.test_cases ? JSON.stringify(q.test_cases) : null;
			const difficultyVal = q.difficulty || difficulty || 'medium';
			const points = q.points || 10;
			const tags = q.tags || null;
			const explanation = q.explanation || null;

			await db.prepare(
				`INSERT INTO question_bank (id, course_offering_id, type, question, options, code_template, test_cases, difficulty, tags, explanation, points, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`
			).bind(
				id,
				course_offering_id,
				qType,
				q.question || '',
				opts,
				codeTmpl,
				testCases,
				difficultyVal,
				tags,
				explanation,
				points,
				now,
				now
			).run();

			saved.push({
				id,
				type: qType,
				question: q.question,
				difficulty: difficultyVal,
				points,
			});
		}

		return jsonResponse({
			success: true,
			data: {
				count: saved.length,
				questions: saved,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
