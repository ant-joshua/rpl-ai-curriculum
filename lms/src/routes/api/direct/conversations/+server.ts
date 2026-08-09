import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		// Fetch conversations: one row per partner with last message + unread count
		const conversations = await db
			.prepare(`
				SELECT
				 partner.id AS partner_id,
				 COALESCE(partner.display_name, partner.username, partner.id) AS partner_name,
				 partner.role AS partner_role,
				 (SELECT dm3.content FROM direct_messages dm3
				  WHERE (dm3.sender_id = ? AND dm3.recipient_id = sub.partner_id)
				     OR (dm3.recipient_id = ? AND dm3.sender_id = sub.partner_id)
				  ORDER BY dm3.created_at DESC LIMIT 1) AS last_message,
				 (SELECT dm4.created_at FROM direct_messages dm4
				  WHERE (dm4.sender_id = ? AND dm4.recipient_id = sub.partner_id)
				     OR (dm4.recipient_id = ? AND dm4.sender_id = sub.partner_id)
				  ORDER BY dm4.created_at DESC LIMIT 1) AS last_message_at,
				 (SELECT COUNT(*) FROM direct_messages dm2
				  WHERE dm2.sender_id = sub.partner_id
				    AND dm2.recipient_id = ?
				    AND dm2.read_at IS NULL) AS unread_count
				FROM (
				 SELECT
				   CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS partner_id,
				   MAX(created_at) AS max_created_at
				 FROM direct_messages
				 WHERE sender_id = ? OR recipient_id = ?
				 GROUP BY partner_id
				) sub
				JOIN users partner ON partner.id = sub.partner_id
				ORDER BY sub.max_created_at DESC
				`)
				.bind(userId, userId, userId, userId, userId, userId, userId, userId)
						.all();

		return jsonResponse({ success: true, data: conversations.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
