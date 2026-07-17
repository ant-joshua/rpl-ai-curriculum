import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

const NINE_ROUTER_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const DEFAULT_MODEL = 'ocg/deepseek-v4-flash';

interface GradeRequest {
	submission_id: string;
	rubric?: string;
}

const GRADE_SYSTEM_PROMPT = `Kamu adalah asisten penilai tugas (auto-grader) untuk kursus RPL (Rekayasa Perangkat Lunak).
Tugasmu: evaluasi jawaban esai siswa berdasarkan kriteria penilaian yang diberikan.

Kriteria penilaian:
1. **Relevansi** — Apakah jawaban sesuai dengan pertanyaan?
2. **Ketepatan** — Apakah konsep yang dijelaskan benar secara teknis?
3. **Kedalaman** — Apakah jawaban menunjukkan pemahaman mendalam?
4. **Struktur** — Apakah jawaban terorganisir dengan baik?

Berikan skor dalam bentuk JSON:
{
  "score": <angka 0-100>,
  "feedback": "<paragraf feedback dalam bahasa Indonesia>",
  "strengths": ["<poin kekuatan>", ...],
  "weaknesses": ["<poin kelemahan>", ...]
}

Jangan berikan skor maksimal (100) kecuali jawaban benar-benar sempurna.
Bersikap konstruktif dan mendidik dalam feedback.`;

/**
 * GET /api/ai/grade — List submissions needing grading
 * Query params: type (assessment|assignment), limit, offset
 */
export async function GET({ url, request, platform }: { url: URL; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);
		const filterType = url.searchParams.get('type'); // 'assessment' | 'assignment' | null (both)
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Assessment submissions needing grading: submitted status, no score yet (or null score)
		let assessmentSubs: any[] = [];
		if (!filterType || filterType === 'assessment') {
			const { results } = await db.prepare(
				`SELECT asub.id, asub.assessment_id, asub.user_id, asub.answers, asub.status, asub.submitted_at,
				        u.display_name AS user_name, a.title AS assessment_title, a.questions
				 FROM assessment_submissions asub
				 JOIN users u ON u.id = asub.user_id
				 JOIN assessments a ON a.id = asub.assessment_id
				 WHERE asub.status = 'submitted' AND asub.score IS NULL
				 ORDER BY asub.submitted_at ASC
				 LIMIT ? OFFSET ?`
			).bind(limit, offset).all<any>();
			assessmentSubs = results || [];
		}

		// Assignment submissions needing grading
		let assignmentSubs: any[] = [];
		if (!filterType || filterType === 'assignment') {
			const { results } = await db.prepare(
				`SELECT assub.id, assub.assignment_id, assub.user_id, assub.submission_text, assub.status, assub.submitted_at,
				        u.display_name AS user_name, a.title AS assignment_title, a.description, a.rubric, a.max_score
				 FROM assignment_submissions assub
				 JOIN users u ON u.id = assub.user_id
				 JOIN assignments a ON a.id = assub.assignment_id
				 WHERE assub.status = 'submitted' AND assub.score IS NULL
				 ORDER BY assub.submitted_at ASC
				 LIMIT ? OFFSET ?`
			).bind(limit, offset).all<any>();
			assignmentSubs = results || [];
		}

		return jsonResponse({
			success: true,
			data: {
				assessment_submissions: assessmentSubs,
				assignment_submissions: assignmentSubs,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * POST /api/ai/grade — Grade a specific submission
 * Body: { submission_id, rubric? }
 * Auto-detects if submission_id belongs to assessment_submissions or assignment_submissions
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const body = (await request.json()) as GradeRequest;
		const { submission_id, rubric } = body;

		if (!submission_id) {
			return jsonResponse({ success: false, error: 'submission_id required' }, 400);
		}

		const db = getDB(platform);

		// Try assessment_submissions first, then assignment_submissions
		let sub: any = await db.prepare(
			`SELECT asub.*, a.title AS assessment_title, a.questions, a.passing_score,
			        u.display_name AS user_name
			 FROM assessment_submissions asub
			 JOIN assessments a ON a.id = asub.assessment_id
			 JOIN users u ON u.id = asub.user_id
			 WHERE asub.id = ?`
		).bind(submission_id).first<any>();

		let isAssignment = false;
		if (!sub) {
			// Try assignment_submissions
			sub = await db.prepare(
				`SELECT assub.*, a.title AS assignment_title, a.description, a.rubric, a.max_score,
				        u.display_name AS user_name
				 FROM assignment_submissions assub
				 JOIN assignments a ON a.id = assub.assignment_id
				 JOIN users u ON u.id = assub.user_id
				 WHERE assub.id = ?`
			).bind(submission_id).first<any>();
			isAssignment = true;
		}

		if (!sub) {
			return jsonResponse({ success: false, error: 'Submission not found' }, 404);
		}

		if (sub.status !== 'submitted') {
			return jsonResponse({ success: false, error: `Submission status is '${sub.status}', not 'submitted'` }, 400);
		}

		// Build the grading prompt
		let essayText = '';
		let questionText = '';
		let maxScore = 100;

		if (isAssignment) {
			essayText = sub.submission_text || '';
			questionText = sub.description || sub.assignment_title || '';
			maxScore = sub.max_score || 100;
		} else {
			// Parse answers JSON — find essay-type answers
			const answers = typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers;
			const questions = typeof sub.questions === 'string' ? JSON.parse(sub.questions) : sub.questions;

			if (Array.isArray(answers)) {
				// Fetch question details from question_bank for essay questions
				const qIds = answers.map((a: any) => a.question_id).filter(Boolean);
				let essayQuestions: Map<string, any> = new Map();

				if (qIds.length > 0) {
					const placeholders = qIds.map(() => '?').join(',');
					const { results: qRows } = await db.prepare(
						`SELECT id, question, type, points FROM question_bank WHERE id IN (${placeholders}) AND type = 'essay'`
					).bind(...qIds).all<any>();

					for (const q of (qRows || [])) {
						essayQuestions.set(q.id, q);
					}
				}

				// Collect essay answers
				const essayParts: string[] = [];
				for (const ans of answers) {
					const q = essayQuestions.get(ans.question_id);
					if (q && ans.answer) {
						essayParts.push(`Pertanyaan: ${q.question}\nJawaban: ${ans.answer}`);
					} else if (!q && ans.answer && typeof ans.answer === 'string' && ans.answer.length > 50) {
						// Long text answer without matching question — treat as essay
						essayParts.push(`Pertanyaan: ${sub.assessment_title}\nJawaban: ${ans.answer}`);
					}
				}

				essayText = essayParts.join('\n\n---\n\n');
				// Aggregate max points
				maxScore = Array.from(essayQuestions.values()).reduce((sum, q) => sum + (q.points || 1), 0);
				if (maxScore === 0) maxScore = sub.max_score || 100;
			}

			if (!essayText && sub.answers) {
				// Fallback: just show the raw answers
				essayText = typeof sub.answers === 'string' ? sub.answers : JSON.stringify(sub.answers);
			}

			questionText = sub.assessment_title || '';
		}

		if (!essayText || essayText.trim().length < 10) {
			return jsonResponse({ success: false, error: 'No essay content found in submission' }, 400);
		}

		// Build user prompt for AI grading
		const rubricText = rubric || (isAssignment ? sub.rubric || '' : '');
		const rubricSection = rubricText ? `\nRubrik penilaian:\n${rubricText}\n` : '';

		const userPrompt = `Tugas: ${questionText}\n${rubricSection}\nSkor maksimal: ${maxScore}\n\n--- Jawaban siswa ---\n${essayText}\n\n---\nEvaluasi jawaban di atas dan berikan skor 0-${maxScore} serta feedback konstruktif dalam bahasa Indonesia.`;

		// Call 9router AI
		let gradeResult: { score: number; feedback: string; strengths: string[]; weaknesses: string[] };
		let aiFailed = false;

		try {
			const apiKey = platform.env?.AI_API_KEY || '';

			const payload = {
				model: DEFAULT_MODEL,
				messages: [
					{ role: 'system', content: GRADE_SYSTEM_PROMPT },
					{ role: 'user', content: userPrompt },
				],
				temperature: 0.3,
				max_tokens: 2048,
				response_format: { type: 'json_object' },
			};

			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

			const aiRes = await fetch(NINE_ROUTER_URL, {
				method: 'POST',
				headers,
				body: JSON.stringify(payload),
			});

			if (!aiRes.ok) {
				const errText = await aiRes.text();
				throw new Error(`9router API error ${aiRes.status}: ${errText}`);
			}

			const aiData = await aiRes.json();
			const content = aiData?.choices?.[0]?.message?.content || '{}';
			gradeResult = JSON.parse(content);
		} catch (aiErr) {
			console.error('AI Grading API call failed:', aiErr);
			aiFailed = true;
			gradeResult = {
				score: Math.round(maxScore * 0.7),
				feedback: 'Maaf, penilaian AI sedang mengalami gangguan. Skor diberikan berdasarkan estimasi sementara. Silakan review manual.',
				strengths: [],
				weaknesses: ['Penilaian otomatis gagal, perlu review manual'],
			};
		}

		// Normalize score to 0-maxScore range
		const finalScore = Math.max(0, Math.min(maxScore, Math.round(gradeResult.score)));
		const feedbackText = gradeResult.feedback || '';

		// Update the submission record
		const now = new Date().toISOString();

		if (isAssignment) {
			await db.prepare(
				`UPDATE assignment_submissions SET score = ?, max_score = ?, graded_by = ?, graded_at = ?, feedback = ?, status = 'graded', updated_at = ? WHERE id = ?`
			).bind(finalScore, maxScore, session.user.id, now, feedbackText, now, submission_id).run();
		} else {
			await db.prepare(
				`UPDATE assessment_submissions SET score = ?, max_score = ?, graded_by = ?, graded_at = ?, feedback = ?, status = 'graded', updated_at = ? WHERE id = ?`
			).bind(finalScore, maxScore, session.user.id, now, feedbackText, now, submission_id).run();
		}

		// Log activity
		try {
			await db.prepare(
				`INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, metadata, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`
			).bind(
				crypto.randomUUID(),
				session.user.id,
				'ai_grade',
				isAssignment ? 'assignment_submission' : 'assessment_submission',
				submission_id,
				JSON.stringify({
					score: finalScore,
					maxScore,
					aiFailed,
					strengths: gradeResult.strengths || [],
					weaknesses: gradeResult.weaknesses || [],
				}),
				now
			).run();
		} catch (logErr) {
			console.error('Failed to log grading activity:', logErr);
		}

		return jsonResponse({
			success: true,
			data: {
				submission_id,
				score: finalScore,
				max_score: maxScore,
				feedback: feedbackText,
				strengths: gradeResult.strengths || [],
				weaknesses: gradeResult.weaknesses || [],
				ai_failed: aiFailed,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
