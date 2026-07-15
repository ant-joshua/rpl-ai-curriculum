import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

const SUBTESTS = [
	{ key: 'tps', label: 'TPS', count: 60, tags: ['tps', 'sbmptn'] },
	{ key: 'literasi', label: 'Literasi', count: 30, tags: ['literasi', 'sbmptn'] },
	{ key: 'matematika', label: 'Matematika', count: 10, tags: ['matematika', 'sbmptn'] },
];

/** Query question_bank for questions matching course_offering + tags. */
async function fetchQuestions(db: any, offeringId: string, tags: string[], limit: number): Promise<any[]> {
	// Build a LIKE filter — tags is a JSON array string like '["tps","sbmptn"]'
	const conditions = tags.map(() => `tags LIKE ?`).join(' OR ');
	const sql = `SELECT * FROM question_bank
		WHERE course_offering_id = ? AND type = 'multiple_choice'
		AND (${conditions}) AND status = 'published'
		ORDER BY RANDOM() LIMIT ?`;
	const params: any[] = [offeringId, ...tags.map(t => `%` + JSON.stringify(t).slice(1, -1) + `%`), limit * 2]; // oversample
	const result = await db.prepare(sql).bind(...params).all();
	const results = (result as any).results || [];
	return results.slice(0, limit);
}

/** Parse options JSON safely. */
function parseOptions(raw: string | null): { label: string; text: string }[] {
	if (!raw) return [];
	try { return JSON.parse(raw); } catch { return []; }
}

/** Generate sample SBMPTN questions when DB doesn't have enough. */
function generateSampleQuestions(key: string, count: number): any[] {
	const samples: Record<string, { q: string; opts: { label: string; text: string }[]; ans: string; expl: string }[]> = {
		tps: [
			{ q: 'Jika 3x + 7 = 22, maka nilai x adalah...', opts: [{label:'A',text:'3'},{label:'B',text:'4'},{label:'C',text:'5'},{label:'D',text:'6'},{label:'E',text:'7'}], ans: 'C', expl: '3x + 7 = 22 → 3x = 15 → x = 5' },
			{ q: 'Semua siswa adalah pelajar. Sebagian pelajar rajin belajar. Kesimpulan yang tepat adalah...', opts: [{label:'A',text:'Semua siswa rajin belajar'},{label:'B',text:'Sebagian siswa rajin belajar'},{label:'C',text:'Semua pelajar adalah siswa'},{label:'D',text:'Tidak semua pelajar rajin belajar'},{label:'E',text:'Semua yang rajin belajar adalah siswa'}], ans: 'B', expl: 'Dari premis, hanya sebagian pelajar yang rajin, dan siswa termasuk pelajar.' },
			{ q: 'Jika BUKU ditulis 2-21-11-21, maka PENSIL ditulis...', opts: [{label:'A',text:'16-5-14-19-9-12'},{label:'B',text:'16-5-14-19-9-13'},{label:'C',text:'15-5-14-19-9-12'},{label:'D',text:'16-5-13-19-9-12'},{label:'E',text:'16-4-14-19-9-12'}], ans: 'A', expl: 'Kode: posisi huruf dalam alphabet (B=2, U=21, K=11, U=21)' },
			{ q: 'Andi berlari 5 km ke utara, lalu 12 km ke timur. Jarak Andi dari titik awal adalah... km', opts: [{label:'A',text:'7'},{label:'B',text:'13'},{label:'C',text:'17'},{label:'D',text:'15'},{label:'E',text:'10'}], ans: 'B', expl: 'Gunakan Pythagoras: √(5² + 12²) = √(25+144) = √169 = 13' },
			{ q: 'Sinonim dari kata "EKSISTENSI" adalah...', opts: [{label:'A',text:'Keberadaan'},{label:'B',text:'Kehancuran'},{label:'C',text:'Keistimewaan'},{label:'D',text:'Kepunahan'},{label:'E',text:'Kesenangan'}], ans: 'A', expl: 'Eksistensi berarti keberadaan atau wujud nyata.' },
		],
		literasi: [
			{ q: 'Bacalah paragraf berikut: "Pemanasan global menyebabkan es di kutub mencair. Akibatnya, permukaan air laut naik dan mengancam pesisir." Ide pokok paragraf tersebut adalah...', opts: [{label:'A',text:'Penyebab pemanasan global'},{label:'B',text:'Dampak pemanasan global terhadap es kutub dan permukaan laut'},{label:'C',text:'Cara mengatasi pemanasan global'},{label:'D',text:'Fenomena alam di kutub'},{label:'E',text:'Kehidupan di pesisir'}], ans: 'B', expl: 'Paragraf menjelaskan dampak pemanasan global: es mencair dan air laut naik.' },
			{ q: 'Kalimat yang menggunakan kata baku yang tepat adalah...', opts: [{label:'A',text:'Para aktifis demo di depan gedung.'},{label:'B',text:'Para aktivis demonstrasi di depan gedung.'},{label:'C',text:'Para aktifis demonstrasi di depan gedung.'},{label:'D',text:'Para aktivis demo di depan gedung.'},{label:'E',text:'Para aktivis demontrasi di depan gedung.'}], ans: 'B', expl: 'Bentuk baku: "aktivis" bukan "aktifis", "demonstrasi" bukan "demo" atau "demontrasi".' },
			{ q: 'Bacalah puisi: "Di ujung senja kau datang / Membawa sejuta asa / Namun fajar telah tiba / Menyisakan mimpi yang sirna." Tema puisi tersebut adalah...', opts: [{label:'A',text:'Pertemuan'},{label:'B',text:'Penantian'},{label:'C',text:'Kehilangan'},{label:'D',text:'Kesedihan'},{label:'E',text:'Kekecewaan'}], ans: 'B', expl: 'Puisi menceritakan seseorang yang menanti hingga senja namun harapannya sirna saat fajar.' },
			{ q: 'Penulisan huruf kapital yang benar terdapat pada kalimat...', opts: [{label:'A',text:'Presiden Jokowi mengunjungi pulau Kalimantan.'},{label:'B',text:'Presiden Jokowi mengunjungi Pulau Kalimantan.'},{label:'C',text:'presiden Jokowi mengunjungi pulau Kalimantan.'},{label:'D',text:'Presiden jokowi mengunjungi Pulau kalimantan.'},{label:'E',text:'presiden jokowi mengunjungi Pulau Kalimantan.'}], ans: 'B', expl: 'Presiden sebagai jabatan ditulis kapital, Pulau sebagai unsur geografi ditulis kapital.' },
			{ q: 'Makna kata "KOMPETENSI" dalam kalimat "Ia memiliki kompetensi di bidang hukum" adalah...', opts: [{label:'A',text:'Pendidikan'},{label:'B',text:'Kemampuan'},{label:'C',text:'Pengalaman'},{label:'D',text:'Gelar'},{label:'E',text:'Pekerjaan'}], ans: 'B', expl: 'Kompetensi berarti kemampuan atau kecakapan dalam suatu bidang.' },
		],
		matematika: [
			{ q: 'Nilai dari ∫(2x + 3) dx adalah...', opts: [{label:'A',text:'x² + 3x + C'},{label:'B',text:'2x² + 3x + C'},{label:'C',text:'x² + 3 + C'},{label:'D',text:'2x + 3 + C'},{label:'E',text:'x² + 3x² + C'}], ans: 'A', expl: '∫(2x + 3) dx = x² + 3x + C' },
			{ q: 'Jika f(x) = x² - 4x + 3, maka akar-akar dari f(x) = 0 adalah...', opts: [{label:'A',text:'x = 1 dan x = 3'},{label:'B',text:'x = -1 dan x = -3'},{label:'C',text:'x = 1 dan x = -3'},{label:'D',text:'x = -1 dan x = 3'},{label:'E',text:'x = 2 dan x = 2'}], ans: 'A', expl: 'x² - 4x + 3 = (x - 1)(x - 3), akar: x = 1 atau x = 3' },
			{ q: 'Nilai dari lim(x→2) (x² - 4)/(x - 2) adalah...', opts: [{label:'A',text:'0'},{label:'B',text:'2'},{label:'C',text:'4'},{label:'D',text:'6'},{label:'E',text:'∞'}], ans: 'C', expl: 'Faktorkan: (x-2)(x+2)/(x-2) = x+2, substitusi x=2 → 4' },
			{ q: 'Dalam suatu barisan aritmatika, suku ke-3 = 10 dan suku ke-7 = 22. Suku ke-10 adalah...', opts: [{label:'A',text:'28'},{label:'B',text:'30'},{label:'C',text:'31'},{label:'D',text:'32'},{label:'E',text:'34'}], ans: 'C', expl: 'b = (22-10)/(7-3) = 12/4 = 3. U1 = U3 - 2b = 10 - 6 = 4. U10 = 4 + 9(3) = 31' },
			{ q: 'Nilai sin 60° × cos 30° adalah...', opts: [{label:'A',text:'1/4'},{label:'B',text:'1/2'},{label:'C',text:'3/4'},{label:'D',text:'1'},{label:'E',text:'√3/4'}], ans: 'C', expl: 'sin 60° = √3/2, cos 30° = √3/2, hasil = 3/4' },
		],
	};

	const pool = samples[key] || samples.tps;
	const generated: any[] = [];
	for (let i = 0; i < count; i++) {
		const s = pool[i % pool.length];
		generated.push({
			id: `sample_${key}_${i}`,
			question: s.q,
			options: s.opts,
			correct_answer: s.ans,
			explanation: s.expl,
			difficulty: 'medium',
			subtest: key,
		});
	}
	return generated;
}

/** Shuffle array in-place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/** Select questions for a subtest, filling with samples if needed. */
async function selectQuestions(
	db: any,
	offeringId: string,
	subtest: { key: string; count: number; tags: string[] }
): Promise<{ questions: any[]; fromDb: number; fromSample: number }> {
	const dbQuestions = await fetchQuestions(db, offeringId, subtest.tags, subtest.count);
	// Shuffle and take what we have
	shuffle(dbQuestions);
	const used = dbQuestions.slice(0, Math.min(dbQuestions.length, subtest.count));

	const fromDb = used.length;
	const needed = subtest.count - used.length;
	const sampleQuestions = needed > 0 ? generateSampleQuestions(subtest.key, needed) : [];

	// Merge: DB questions first, then samples
	const all = [...used.map((q: any) => ({
		id: q.id,
		question: q.question,
		options: parseOptions(q.options),
		correct_answer: q.correct_answer?.trim() || '',
		explanation: q.explanation || '',
		difficulty: q.difficulty || 'medium',
		subtest: subtest.key,
	})), ...sampleQuestions.map(q => ({
		...q,
		generated: true,
	}))];

	return { questions: all, fromDb, fromSample: sampleQuestions.length };
}

/** Compute score for a subtest. */
function computeScore(questions: any[], answers: Record<string, string>): { correct: number; total: number; score: number } {
	let correct = 0;
	for (const q of questions) {
		const userAns = answers[q.id] || '';
		if (userAns && userAns.toUpperCase() === (q.correct_answer || '').toUpperCase()) {
			correct++;
		}
	}
	return { correct, total: questions.length, score: Math.round((correct / questions.length) * 100) };
}

// ─── Routes ────────────────────────────────────────────────────────

export async function GET({ params, request, platform }: {
	params: { offeringId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const { offeringId } = params;

		// Load offering
		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(userId, offeringId, 'active').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Not enrolled' }, 403);

		// Find any active session
		const activeSession = await db.prepare(
			`SELECT * FROM tryout_sessions
			 WHERE user_id = ? AND course_offering_id = ? AND status = 'active'
			 ORDER BY created_at DESC LIMIT 1`
		).bind(userId, offeringId).first<any>();

		// Previous finished sessions
		const { results: prevSessions } = await db.prepare(
			`SELECT id, submitted_at, score_total, score_tps, score_literasi, score_matematika
			 FROM tryout_sessions
			 WHERE user_id = ? AND course_offering_id = ? AND status != 'active'
			 ORDER BY created_at DESC LIMIT 10`
		).bind(userId, offeringId).all<any>();

		return jsonResponse({
			success: true,
			data: {
				offering: { id: offering.id, name: offering.name },
				activeSession: activeSession || null,
				previousSessions: prevSessions || [],
				subtests: SUBTESTS.map(s => ({ key: s.key, label: s.label, count: s.count })),
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: {
	params: { offeringId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const { offeringId } = params;
		const body = await request.json();
		const action = body.action || '';

		if (action === 'start') {
			// ── Start new session ──
			// Check enrollment
			const enrollment = await db.prepare(
				'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
			).bind(userId, offeringId, 'active').first<any>();
			if (!enrollment) return jsonResponse({ success: false, error: 'Not enrolled' }, 403);

			// Mark any existing active sessions as expired
			await db.prepare(
				`UPDATE tryout_sessions SET status = 'expired'
				 WHERE user_id = ? AND course_offering_id = ? AND status = 'active'`
			).bind(userId, offeringId).run();

			// Select questions per subtest
			const allQuestions: any[] = [];
			let totalFromDb = 0, totalFromSample = 0;
			for (const subtest of SUBTESTS) {
				const { questions, fromDb, fromSample } = await selectQuestions(db, offeringId, subtest);
				allQuestions.push(...questions);
				totalFromDb += fromDb;
				totalFromSample += fromSample;
			}

			// Create session
			const sessionId = crypto.randomUUID();
			const now = new Date().toISOString();
			const timeLimit = body.timeLimitMinutes || 180;

			// Strip correct_answer from questions stored in session (for display purposes)
			const questionsForStorage = allQuestions.map((q: any) => ({
				id: q.id,
				question: q.question,
				options: q.options,
				subtest: q.subtest,
				difficulty: q.difficulty,
				generated: q.generated || false,
			}));

			await db.prepare(
				`INSERT INTO tryout_sessions (id, user_id, course_offering_id, started_at, time_limit_minutes, status, questions_json, total_questions, created_at)
				 VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`
			).bind(
				sessionId, userId, offeringId, now, timeLimit,
				JSON.stringify(questionsForStorage), allQuestions.length, now
			).run();

			// Return questions WITHOUT correct_answer to client
			const clientQuestions = allQuestions.map((q: any) => ({
				id: q.id,
				question: q.question,
				options: q.options,
				subtest: q.subtest,
				difficulty: q.difficulty,
			}));

			return jsonResponse({
				success: true,
				data: {
					sessionId,
					startedAt: now,
					timeLimitMinutes: timeLimit,
					questions: clientQuestions,
					questionsBySubtest: SUBTESTS.map(s => ({
						key: s.key,
						label: s.label,
						count: s.count,
						startIndex: 0, // client computes from questions array
					})),
					fromDb: totalFromDb,
					fromSample: totalFromSample,
				}
			}, 201);

		} else if (action === 'submit') {
			// ── Submit answers ──
			const { sessionId, answers } = body as { sessionId: string; answers: Record<string, string> };
			const timeSpent: Record<string, number> = body.timeSpent || {};

			if (!sessionId) return jsonResponse({ success: false, error: 'sessionId required' }, 400);

			// Load session
			const tryoutSession = await db.prepare(
				'SELECT * FROM tryout_sessions WHERE id = ? AND user_id = ?'
			).bind(sessionId, userId).first<any>();
			if (!tryoutSession) return jsonResponse({ success: false, error: 'Session not found' }, 404);
			if (tryoutSession.status !== 'active') return jsonResponse({ success: false, error: 'Session already submitted' }, 400);

			let questions: any[] = [];
			try { questions = JSON.parse(tryoutSession.questions_json || '[]'); } catch {}

			// Re-fetch questions with correct answers from DB (or use embedded generated answers)
			const questionIds = questions.filter((q: any) => !q.generated).map((q: any) => q.id);
			const generatedQuestions = questions.filter((q: any) => q.generated);

			const correctAnswers: Record<string, string> = {};

			// Fetch from DB
			if (questionIds.length > 0) {
				const placeholders = questionIds.map(() => '?').join(',');
				const { results: dbQuestions } = await db.prepare(
					`SELECT id, correct_answer, explanation FROM question_bank WHERE id IN (${placeholders})`
				).bind(...questionIds).all<any>();
				for (const q of dbQuestions || []) {
					correctAnswers[q.id] = (q.correct_answer || '').trim();
				}
			}

			// For generated questions, we need to reconstruct from the sample data
			const allGeneratedQuestions: any[] = [];
			for (const subtest of SUBTESTS) {
				const gen = generateSampleQuestions(subtest.key, subtest.count);
				allGeneratedQuestions.push(...gen);
			}
			// Match generated questions by their id pattern
			for (const q of generatedQuestions) {
				if (q.id.startsWith('sample_')) {
					// Find matching generated question
					for (const gq of allGeneratedQuestions) {
						if (gq.id === q.id) {
							correctAnswers[q.id] = gq.correct_answer;
							break;
						}
					}
				}
			}

			// Reconstruct full question list with correct answers for scoring
			const questionsWithAnswers = questions.map((q: any) => {
				const correct = correctAnswers[q.id] || '';
				// Find explanation from generated pool if needed
				let expl = '';
				if (q.generated) {
					for (const gq of allGeneratedQuestions) {
						if (gq.id === q.id) { expl = gq.explanation || ''; break; }
					}
				}
				return { ...q, correct_answer: correct, explanation: expl };
			});

			// Save individual answers
			const now = new Date().toISOString();
			const inserts: any[] = [];
			let answersCount = 0;

			for (const q of questionsWithAnswers) {
				const userAns = (answers[q.id] || '').toUpperCase();
				const isCorrect = userAns !== '' && userAns === (q.correct_answer || '').toUpperCase();
				if (userAns !== '') answersCount++;

				const answerId = crypto.randomUUID();
				const spent = timeSpent[q.id] || 0;
				inserts.push(db.prepare(
					`INSERT INTO tryout_answers (id, session_id, question_id, selected_answer, is_correct, answered_at, time_spent_seconds)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`
				).bind(answerId, sessionId, q.id, userAns, isCorrect ? 1 : 0, now, spent));
			}

			await db.batch(inserts);

			// Compute scores per subtest
			const subtestScores: Record<string, { correct: number; total: number; score: number }> = {};
			for (const subtest of SUBTESTS) {
				const subQ = questionsWithAnswers.filter((q: any) => q.subtest === subtest.key);
				subtestScores[subtest.key] = computeScore(subQ, answers);
			}

			const scoreTps = subtestScores.tps?.score ?? 0;
			const scoreLiterasi = subtestScores.literasi?.score ?? 0;
			const scoreMatematika = subtestScores.matematika?.score ?? 0;
			const total = Math.round((scoreTps + scoreLiterasi + scoreMatematika) / 3);

			// Check if time expired
			const startedMs = new Date(tryoutSession.started_at).getTime();
			const elapsed = (Date.now() - startedMs) / 1000;
			const limitSecs = tryoutSession.time_limit_minutes * 60;
			const timeExpired = elapsed > limitSecs + 30;

			// Update session
			await db.prepare(
				`UPDATE tryout_sessions
				 SET status = ?, submitted_at = ?, score_total = ?, score_tps = ?, score_literasi = ?,
				     score_matematika = ?, answers_count = ?
				 WHERE id = ?`
			).bind(
				timeExpired ? 'expired' : 'submitted', now, total, scoreTps, scoreLiterasi,
				scoreMatematika, answersCount, sessionId
			).run();

			// Build results for client
			const results = questionsWithAnswers.map((q: any) => {
				const userAns = (answers[q.id] || '').toUpperCase();
				const correct = userAns !== '' && userAns === (q.correct_answer || '').toUpperCase();
				return {
					questionId: q.id,
					question: q.question,
					options: q.options,
					userAnswer: userAns || '',
					correctAnswer: q.correct_answer || '',
					correct,
					subtest: q.subtest,
					explanation: q.explanation || '',
				};
			});

			return jsonResponse({
				success: true,
				data: {
					results,
					scores: {
						total,
						tps: scoreTps,
						literasi: scoreLiterasi,
						matematika: scoreMatematika,
					},
					subtestScores,
					answersCount,
					totalQuestions: questions.length,
					timeExpired,
				}
			});

		} else {
			return jsonResponse({ success: false, error: 'Unknown action. Use "start" or "submit".' }, 400);
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
