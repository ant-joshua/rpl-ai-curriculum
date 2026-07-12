import { getDB, getDeviceId } from '$lib/server/d1';

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
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		const { results } = await db
			.prepare('SELECT * FROM flashcards WHERE user_id = ? ORDER BY module_slug, card_id')
			.bind(deviceId)
			.all();

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const pathname = url.pathname;

		// POST /sync — batch sync
		if (pathname.endsWith('/sync') || request.headers.get('x-sync') === 'true') {
			const body: { cards?: Array<{
				card_id: string; module_slug: string; question: string; answer: string;
				ease_factor?: number; interval?: number; repetitions?: number;
				next_review?: string; last_reviewed?: string;
			}> } = await request.json();
			const deviceId = getDeviceId(request);
			const cards = body.cards || [];

			if (cards.length === 0) {
				return json({ success: true, data: { synced: 0 } });
			}

			const stmt = db.prepare(
				`INSERT INTO flashcards (id, user_id, card_id, module_slug, question, answer, ease_factor, interval, repetitions, next_review, last_reviewed)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(user_id, card_id) DO UPDATE SET
				   ease_factor = COALESCE(excluded.ease_factor, flashcards.ease_factor),
				   interval = COALESCE(excluded.interval, flashcards.interval),
				   repetitions = COALESCE(excluded.repetitions, flashcards.repetitions),
				   next_review = COALESCE(excluded.next_review, flashcards.next_review),
				   last_reviewed = COALESCE(excluded.last_reviewed, flashcards.last_reviewed)`
			);

			const batch = cards.map(c => {
				const id = `fc-${deviceId}-${c.card_id}`;
				const now = new Date().toISOString();
				return stmt.bind(
					id, deviceId, c.card_id, c.module_slug,
					c.question, c.answer,
					c.ease_factor ?? 2.5, c.interval ?? 0, c.repetitions ?? 0,
					c.next_review || now, c.last_reviewed || null
				);
			});

			await db.batch(batch);
			return json({ success: true, data: { synced: cards.length } });
		}

		// POST / — upsert single card review
		const body: { card_id?: string; module_slug?: string; question?: string; answer?: string;
			ease_factor?: number; interval?: number; repetitions?: number;
			next_review?: string; last_reviewed?: string } = await request.json();
		const deviceId = getDeviceId(request);

		if (!body.card_id) {
			return json({ success: false, error: 'card_id required' }, 400);
		}

		const id = `fc-${deviceId}-${body.card_id}`;
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO flashcards (id, user_id, card_id, module_slug, question, answer, ease_factor, interval, repetitions, next_review, last_reviewed)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(user_id, card_id) DO UPDATE SET
				   ease_factor = COALESCE(excluded.ease_factor, flashcards.ease_factor),
				   interval = COALESCE(excluded.interval, flashcards.interval),
				   repetitions = COALESCE(excluded.repetitions, flashcards.repetitions),
				   next_review = COALESCE(excluded.next_review, flashcards.next_review),
				   last_reviewed = COALESCE(excluded.last_reviewed, flashcards.last_reviewed),
				   question = COALESCE(excluded.question, flashcards.question),
				   answer = COALESCE(excluded.answer, flashcards.answer)`
			)
			.bind(
				id, deviceId, body.card_id, body.module_slug || '',
				body.question || '', body.answer || '',
				body.ease_factor ?? 2.5, body.interval ?? 0, body.repetitions ?? 0,
				body.next_review || now, body.last_reviewed || null
			)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
