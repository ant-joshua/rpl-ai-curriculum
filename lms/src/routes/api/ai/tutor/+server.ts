import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

const NINE_ROUTER_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const DEFAULT_MODEL = 'ocg/deepseek-v4-flash';

const SYSTEM_PROMPT =
	'Kamu adalah asisten belajar untuk kursus RPL (Rekayasa Perangkat Lunak). Jawab pertanyaan tentang materi dengan bahasa Indonesia. Jika ditanya di luar konteks, arahkan kembali ke materi. Berikan penjelasan yang mendidik, contoh kode jika relevan, dan dorong pemahaman konsep.';

interface TutorRequest {
	message: string;
	courseOfferingId?: string;
	lessonId?: string;
}

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

		const body = (await request.json()) as TutorRequest;
		const { message, courseOfferingId, lessonId } = body;

		if (!message || !message.trim()) {
			return jsonResponse({ success: false, error: 'Message is required' }, 400);
		}

		const db = getDB(platform);
		let contextInfo = '';

		// If courseOfferingId provided, fetch course info for context
		if (courseOfferingId) {
			const offering = await db
				.prepare(
					`SELECT co.*, c.title AS course_title, c.description AS course_description
					 FROM course_offerings co
					 JOIN courses c ON c.id = co.course_id
					 WHERE co.id = ?`
				)
				.bind(courseOfferingId)
				.first<any>();

			if (offering) {
				contextInfo = `Konteks kursus: ${offering.name} - ${offering.course_title}. ${offering.course_description ?? ''}`;

				// If lessonId also provided, add lesson context
				if (lessonId) {
					const lesson = await db
						.prepare('SELECT title FROM lessons WHERE id = ? AND course_offering_id = ?')
						.bind(lessonId, courseOfferingId)
						.first<any>();

					if (lesson) {
						contextInfo += `\nPertanyaan terkait pelajaran: ${lesson.title}`;
					}
				}
			}
		}

		// Build messages array for 9router
		const messages: { role: string; content: string }[] = [
			{ role: 'system', content: SYSTEM_PROMPT + (contextInfo ? `\n\n${contextInfo}` : '') },
			{ role: 'user', content: message },
		];

		// Call 9router API
		let replyText: string;

		try {
			const apiKey = platform.env?.AI_API_KEY || '';

			const payload = {
				model: DEFAULT_MODEL,
				messages,
				temperature: 0.7,
				max_tokens: 2048,
			};

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			if (apiKey) {
				headers['Authorization'] = `Bearer ${apiKey}`;
			}

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
			replyText = aiData?.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memberikan jawaban saat ini.';
		} catch (aiErr) {
			console.error('AI Tutor API call failed:', aiErr);
			replyText =
				'Maaf, layanan AI tutor sedang mengalami gangguan. Silakan coba lagi nanti.';
		}

		// Log activity to user_activity_log
		try {
			await db
				.prepare(
					`INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, metadata, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					crypto.randomUUID(),
					session.user.id,
					'ai_tutor_message',
					courseOfferingId ? 'course_offering' : null,
					courseOfferingId ?? null,
					JSON.stringify({
						messageLength: message.length,
						replyLength: replyText.length,
						lessonId: lessonId ?? null,
					}),
					new Date().toISOString()
				)
				.run();
		} catch (logErr) {
			// Non-fatal — don't fail the request if logging fails
			console.error('Failed to log activity:', logErr);
		}

		return jsonResponse({
			success: true,
			data: {
				reply: replyText,
				sources: [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
