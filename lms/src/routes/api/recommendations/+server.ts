import { getDB, getDeviceId } from '$lib/server/d1';

const NINE_ROUTER_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const MODEL = 'ocg/deepseek-v4-flash';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);

		// Get latest cached recommendation
		const cached = await db
			.prepare('SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
			.bind(deviceId)
			.first<{ id: string; content: string; created_at: string }>();

		if (cached) {
			try {
				const content = JSON.parse(cached.content);
				return json({ success: true, data: content });
			} catch {
				return json({ success: true, data: { recommendations: [cached.content], weak_topics: [], suggestion: '' } });
			}
		}

		return json({ success: true, data: { recommendations: [], weak_topics: [], suggestion: '' } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);

		const body: {
			progress?: Array<{ slug: string; title: string; pct: number }>;
			streak?: number;
			total_sessions?: number;
		} = await request.json();

		const completedModules = body.progress || [];
		const streak = body.streak || 0;
		const totalSessions = body.total_sessions || 0;
		const completedCount = completedModules.length;

		// Find weak topics (modules with <50%)
		const weakTopics = completedModules.filter(m => m.pct < 50 && m.pct > 0);

		// Build AI prompt
		const moduleList = completedModules.map(m => `- ${m.title} (${m.pct}%)`).join('\n');
		const weakList = weakTopics.map(m => `- ${m.title} (${m.pct}%)`).join('\n');

		const systemPrompt = `Anda adalah asisten rekomendasi belajar untuk RPL AI Curriculum.
Anda memberikan rekomendasi belajar dalam bahasa Indonesia.
Berdasarkan data progres siswa, berikan 3-5 rekomendasi prioritas belajar selanjutnya.
Format: bullet points dalam bahasa Indonesia.`;

		const userPrompt = `Seorang siswa telah menyelesaikan ${completedCount} modul dengan detail:

${moduleList || 'Belum ada modul yang dikerjakan.'}

${weakTopics.length > 0 ? `Topik yang masih lemah (<50%):\n${weakList}` : ''}
Streak: ${streak} hari
Total sesi: ${totalSessions}

Berdasarkan data ini, berikan 3-5 rekomendasi prioritas belajar selanjutnya untuk kurikulum RPL AI. Respond in Indonesian. Format: bullet points.`;

		let aiRecommendations: string[] = [];
		let aiSuggestion = '';

		try {
			const aiRes = await fetch(NINE_ROUTER_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: MODEL,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt },
					],
					max_tokens: 1024,
					temperature: 0.7,
				}),
			});

			if (aiRes.ok) {
				const aiData = await aiRes.json();
				const aiText = aiData.choices?.[0]?.message?.content || '';
				// Parse bullet points
				aiRecommendations = aiText
					.split('\n')
					.filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+[\.\)]/.test(line.trim()))
					.map((line: string) => line.replace(/^[-*\d\.\)\s]+/, '').trim())
					.filter((l: string) => l.length > 0);

				// First line or remaining text as suggestion
				const nonBullet = aiText
					.split('\n')
					.filter((line: string) => !line.trim().startsWith('-') && !line.trim().startsWith('*') && !/^\d+[\.\)]/.test(line.trim()))
					.filter((l: string) => l.trim().length > 0)
					.join(' ')
					.trim();
				if (nonBullet) aiSuggestion = nonBullet;

				if (aiRecommendations.length === 0) {
					aiRecommendations = [aiText];
				}
			}
		} catch {
			// AI API failed — fallback to local heuristic
		}

		// Fallback: local heuristic if AI fails
		if (aiRecommendations.length === 0) {
			if (weakTopics.length > 0) {
				aiRecommendations = weakTopics.slice(0, 3).map(w =>
					`Pelajari ulang **${w.title}** — progress baru ${w.pct}%`
				);
			}
			if (aiRecommendations.length === 0) {
				aiRecommendations = ['Lanjutkan ke modul berikutnya yang belum dikerjakan'];
			}
			aiSuggestion = `Konsistensi adalah kunci! Pertahankan streak ${streak} hari-mu.`;
		}

		const result = {
			recommendations: aiRecommendations,
			weak_topics: weakTopics.map(w => w.slug),
			suggestion: aiSuggestion,
		};

		// Cache to D1
		try {
			const id = `rec-${deviceId}-${Date.now()}`;
			await db
				.prepare('INSERT INTO recommendations (id, user_id, content) VALUES (?, ?, ?)')
				.bind(id, deviceId, JSON.stringify(result))
				.run();
		} catch {
			// cache failure is non-fatal
		}

		return json({ success: true, data: result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
