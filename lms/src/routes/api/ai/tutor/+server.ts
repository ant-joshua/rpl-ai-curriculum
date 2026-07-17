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
	history?: Array<{ role: 'user' | 'assistant'; content: string }>;
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
		const { message, courseOfferingId, lessonId, history } = body;

		if (!message || !message.trim()) {
			return jsonResponse({ success: false, error: 'Message is required' }, 400);
		}

		const db = getDB(platform);
		let contextInfo = '';

		// If courseOfferingId provided, fetch rich course context
		if (courseOfferingId) {
			const offering = await db
				.prepare(
					`SELECT co.*, c.title AS course_title, c.description AS course_description, c.category, c.level
					 FROM course_offerings co
					 JOIN courses c ON c.id = co.course_id
					 WHERE co.id = ?`
				)
				.bind(courseOfferingId)
				.first<any>();

			if (offering) {
				contextInfo = `Konteks kursus: ${offering.name} - ${offering.course_title}. ${offering.course_description ?? ''}
Kategori: ${offering.category || '-'}, Level: ${offering.level || '-'}`;

				// Fetch content_blocks for this offering (course material context)
				const { results: contentBlocks } = await db
					.prepare(
						`SELECT id, type, title, body_html
						 FROM content_blocks
						 WHERE course_offering_id = ? AND visibility = 'published'
						 ORDER BY order_index ASC
						 LIMIT 30`
					)
					.bind(courseOfferingId)
					.all<any>();

				if (contentBlocks && contentBlocks.length > 0) {
					contextInfo += '\n\nMateri kursus yang tersedia:\n';
					const blockSummary = contentBlocks.map((cb: any) => {
						let snippet = '';
						if (cb.body_html) {
							snippet = cb.body_html.replace(/<[^>]*>/g, '').substring(0, 200).trim();
						}
						return `- ${cb.title || 'Untitled'} (${cb.type})${snippet ? ': ' + snippet : ''}`;
					});
					contextInfo += blockSummary.join('\n');
				}

				// Also fetch recent lessons for this offering
				const { results: lessons } = await db
					.prepare(
						`SELECT l.id, l.title, l.slug, l.order_index
						 FROM lessons l
						 WHERE l.course_offering_id = ? AND l.status = 'published'
						 ORDER BY l.order_index ASC
						 LIMIT 20`
					)
					.bind(courseOfferingId)
					.all<any>();

				if (lessons && lessons.length > 0) {
					contextInfo += '\n\nDaftar pelajaran:\n';
					contextInfo += lessons.map((l: any) => `- ${l.title}`).join('\n');
				}

				// If lessonId also provided, add specific lesson/content context
				if (lessonId) {
					const lesson = await db
						.prepare(
							`SELECT l.title, l.slug, l.duration_minutes
							 FROM lessons l
							 WHERE l.id = ? AND l.course_offering_id = ?`
						)
						.bind(lessonId, courseOfferingId)
						.first<any>();

					if (lesson) {
						contextInfo += `\n\nPertanyaan terkait pelajaran: ${lesson.title}`;

						// Find the content_block for this lesson (via source_id)
						const lessonBlock = await db
							.prepare(
								`SELECT id FROM content_blocks
								 WHERE source_id = ? AND course_offering_id = ? AND type = 'lesson'
								 LIMIT 1`
							)
							.bind(lessonId, courseOfferingId)
							.first<any>();

						if (lessonBlock) {
							const { results: lessonBlocks } = await db
								.prepare(
									`SELECT type, title, body_html
									 FROM content_blocks
									 WHERE parent_id = ? AND visibility = 'published'
									 ORDER BY order_index ASC`
								)
								.bind(lessonBlock.id)
								.all<any>();

							if (lessonBlocks && lessonBlocks.length > 0) {
								contextInfo += '\n\nKonten pelajaran ini:\n';
								const blockTexts = lessonBlocks.map((cb: any) => {
									let text = '';
									if (cb.body_html) {
										text = cb.body_html.replace(/<[^>]*>/g, '').substring(0, 500).trim();
									}
									return `[${cb.type}] ${cb.title}${text ? ': ' + text : ''}`;
								});
								contextInfo += blockTexts.join('\n\n');
							}
						}
					}
				}
			}
		}

		// Build messages array with history for context-aware conversation
		const messages: { role: string; content: string }[] = [
			{ role: 'system', content: SYSTEM_PROMPT + (contextInfo ? `\n\n${contextInfo}` : '') },
		];

		// Append conversation history if provided
		if (history && Array.isArray(history)) {
			// Limit to last 10 turns for context window
			const recentHistory = history.slice(-10);
			for (const turn of recentHistory) {
				if (turn.role === 'user' || turn.role === 'assistant') {
					messages.push({ role: turn.role, content: turn.content });
				}
			}
		}

		// Add current user message
		messages.push({ role: 'user', content: message });

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
			replyText = 'Maaf, layanan AI tutor sedang mengalami gangguan. Silakan coba lagi nanti.';
		}

		// Log activity
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
						hasHistory: history ? history.length : 0,
					}),
					new Date().toISOString()
				)
				.run();
		} catch (logErr) {
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
