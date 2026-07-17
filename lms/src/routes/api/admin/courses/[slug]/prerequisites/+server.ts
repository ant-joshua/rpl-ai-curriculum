import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { slug: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const course = await db.prepare('SELECT id FROM courses WHERE slug = ?').bind(params.slug).first<any>();
    if (!course) return jsonResponse({ success: false, error: 'Course not found' }, 404);

    const { results: rows } = await db.prepare(
      `SELECT cp.id, cp.prerequisite_course_id, c.title AS prerequisite_title, c.slug AS prerequisite_slug, c.icon AS prerequisite_icon
       FROM course_prerequisites cp
       JOIN courses c ON c.id = cp.prerequisite_course_id
       WHERE cp.course_id = ?
       ORDER BY c.title ASC`
    ).bind(course.id).all<any>();

    return jsonResponse({ success: true, data: rows || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

export async function POST({ request, params, platform }: { request: Request; params: { slug: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const course = await db.prepare('SELECT id FROM courses WHERE slug = ?').bind(params.slug).first<any>();
    if (!course) return jsonResponse({ success: false, error: 'Course not found' }, 404);

    const body = await request.json();
    const { prerequisite_course_id } = body;
    if (!prerequisite_course_id) {
      return jsonResponse({ success: false, error: 'prerequisite_course_id is required' }, 400);
    }

    // Verify prerequisite course exists
    const prereqCourse = await db.prepare('SELECT id, title FROM courses WHERE id = ?').bind(prerequisite_course_id).first<any>();
    if (!prereqCourse) return jsonResponse({ success: false, error: 'Prerequisite course not found' }, 404);

    if (prerequisite_course_id === course.id) {
      return jsonResponse({ success: false, error: 'A course cannot be its own prerequisite' }, 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      'INSERT INTO course_prerequisites (id, course_id, prerequisite_course_id, created_at) VALUES (?, ?, ?, ?)'
    ).bind(id, course.id, prerequisite_course_id, now).run();

    return jsonResponse({
      success: true,
      data: { id, course_id: course.id, prerequisite_course_id, prerequisite_title: prereqCourse.title, created_at: now }
    }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('UNIQUE constraint')) {
      return jsonResponse({ success: false, error: 'Prerequisite already exists' }, 409);
    }
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

export async function DELETE({ request, params, platform }: { request: Request; params: { slug: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const course = await db.prepare('SELECT id FROM courses WHERE slug = ?').bind(params.slug).first<any>();
    if (!course) return jsonResponse({ success: false, error: 'Course not found' }, 404);

    const body = await request.json();
    const { id } = body;
    if (!id) return jsonResponse({ success: false, error: 'id is required' }, 400);

    await db.prepare('DELETE FROM course_prerequisites WHERE id = ? AND course_id = ?').bind(id, course.id).run();
    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
