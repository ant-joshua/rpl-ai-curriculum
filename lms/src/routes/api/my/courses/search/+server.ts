import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ request, url, platform }: { request: Request; url: URL; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const q = url.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return jsonResponse({ success: true, data: [], query: q || '' });
    }

    const userId = session.user.id;
    const db = getDB(platform);
    const likeParam = `%${q}%`;

    // Get user's enrolled offering IDs
    const { results: userOfferings } = await db.prepare(
      `SELECT course_offering_id FROM enrollments WHERE user_id = ?`
    ).bind(userId).all<{ course_offering_id: string }>();

    const offeringIds = (userOfferings || []).map(r => r.course_offering_id);
    if (offeringIds.length === 0) {
      return jsonResponse({ success: true, data: [] });
    }

    const placeholders = offeringIds.map(() => '?').join(',');

    // Search lesson titles
    const { results: lessonResults } = await db.prepare(
      `SELECT l.id, l.title AS lesson_title, l.slug AS lesson_slug,
              l.course_offering_id, co.name AS offering_name, c.title AS course_title
       FROM lessons l
       JOIN course_offerings co ON co.id = l.course_offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE l.course_offering_id IN (${placeholders})
         AND l.title LIKE ?
       ORDER BY l.title ASC
       LIMIT 20`
    ).bind(...offeringIds, likeParam).all<any>();

    // Search content_blocks body/title within user's enrolled courses
    const { results: blockResults } = await db.prepare(
      `SELECT cb.id, cb.title AS block_title, cb.body_html,
              l.id AS lesson_id, l.title AS lesson_title, l.slug AS lesson_slug,
              l.course_offering_id, co.name AS offering_name, c.title AS course_title
       FROM content_blocks cb
       JOIN lesson_content_blocks lcb ON lcb.content_block_id = cb.id
       JOIN lessons l ON l.id = lcb.lesson_id
       JOIN course_offerings co ON co.id = l.course_offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE l.course_offering_id IN (${placeholders})
         AND (cb.body LIKE ? OR cb.body_html LIKE ? OR cb.title LIKE ?)
       ORDER BY l.title ASC
       LIMIT 20`
    ).bind(...offeringIds, likeParam, likeParam, likeParam).all<any>();

    // Merge: lesson title matches first, then block content matches
    const seen = new Set<string>();
    const data: any[] = [];

    for (const r of (lessonResults || [])) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      data.push({
        id: r.id,
        blockTitle: null,
        lessonTitle: r.lesson_title,
        lessonSlug: r.lesson_slug,
        offeringId: r.course_offering_id,
        offeringName: r.offering_name,
        courseTitle: r.course_title,
        snippet: 'Pelajaran: ' + r.lesson_title,
      });
    }

    for (const r of (blockResults || [])) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      const plainText = (r.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      data.push({
        id: r.id,
        blockTitle: r.block_title,
        lessonTitle: r.lesson_title,
        lessonSlug: r.lesson_slug,
        offeringId: r.course_offering_id,
        offeringName: r.offering_name,
        courseTitle: r.course_title,
        snippet: buildSnippet(plainText || r.block_title || '', q),
      });
    }

    return jsonResponse({ success: true, data: data.slice(0, 20), query: q });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

function buildSnippet(text: string, query: string, maxLen = 120): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx < 0) return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '');
  const start = Math.max(0, idx - Math.floor((maxLen - qLower.length) / 2));
  const end = Math.min(text.length, start + maxLen);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}
