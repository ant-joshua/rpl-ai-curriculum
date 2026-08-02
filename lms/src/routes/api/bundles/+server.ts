import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/bundles — list active bundles with items + pricing */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Optional auth to know enrolled/wishlisted state
		const token = getBearerToken(request);
		let userId: string | null = null;
		if (token) {
			const session = await getSession(platform, token);
			if (session) userId = session.user.id;
		}

		const { results: bundles } = await db.prepare(`
			SELECT b.*,
			       (SELECT COUNT(*) FROM bundle_items bi WHERE bi.bundle_id = b.id) AS item_count
			FROM bundles b
			WHERE b.is_active = 1
			ORDER BY b.created_at DESC
		`).all<any>();

		if (!bundles || bundles.length === 0) return jsonResponse({ success: true, data: [] });

		const bundleIds = bundles.map((b: any) => b.id);
		const placeholders = bundleIds.map(() => '?').join(',');
		const { results: items } = await db.prepare(`
			SELECT bi.bundle_id, co.id AS offering_id, co.name AS offering_name,
			       c.title AS course_title, c.icon AS course_icon, c.slug AS course_slug
			FROM bundle_items bi
			JOIN course_offerings co ON co.id = bi.course_offering_id
			JOIN courses c ON c.id = co.course_id
			WHERE bi.bundle_id IN (${placeholders})
		`).bind(...bundleIds).all<any>();

		const itemsByBundle = new Map<string, any[]>();
		for (const it of items || []) {
			if (!itemsByBundle.has(it.bundle_id)) itemsByBundle.set(it.bundle_id, []);
			itemsByBundle.get(it.bundle_id)!.push(it);
		}

		// Check enrollment state per user
		let enrolledSet = new Set<string>();
		if (userId) {
			const offeringIds = [...new Set((items || []).map((i: any) => i.offering_id))];
			if (offeringIds.length > 0) {
				const op = offeringIds.map(() => '?').join(',');
				const { results: enr } = await db.prepare(
					`SELECT course_offering_id FROM enrollments WHERE user_id = ? AND course_offering_id IN (${op})`
				).bind(userId, ...offeringIds).all<{ course_offering_id: string }>();
				for (const r of enr || []) enrolledSet.add(r.course_offering_id);
			}
		}

		const data = bundles.map((b: any) => ({
			id: b.id,
			title: b.title,
			slug: b.slug,
			description: b.description,
			price: b.price,
			originalPrice: b.original_price,
			coverIcon: b.cover_icon || '📦',
			itemCount: b.item_count,
			items: (itemsByBundle.get(b.id) || []).map((it: any) => ({
				offeringId: it.offering_id,
				name: it.offering_name,
				courseTitle: it.course_title,
				icon: it.course_icon || '📚',
				isEnrolled: enrolledSet.has(it.offering_id),
			})),
			discountPct: b.original_price && b.original_price > b.price
				? Math.round((1 - b.price / b.original_price) * 100) : 0,
		}));

		return jsonResponse({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
