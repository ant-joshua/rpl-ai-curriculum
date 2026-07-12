import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ url, platform }: RequestEvent) {
  const db = platform?.env?.DB as D1Database | undefined;
  if (!db) {
    return json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  const pathSlug = url.searchParams.get('path_slug');
  let rows: any[];
  
  if (pathSlug) {
    rows = await db.prepare(
      'SELECT * FROM announcements WHERE active = 1 AND (path_slug IS NULL OR path_slug = ?) ORDER BY created_at DESC'
    ).bind(pathSlug).all();
  } else {
    rows = await db.prepare(
      'SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC'
    ).all();
  }

  return json({ success: true, data: rows.results || rows });
}

export async function POST({ request, platform }: RequestEvent) {
  const db = platform?.env?.DB as D1Database | undefined;
  if (!db) {
    return json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  const admin = request.headers.get('x-admin');
  if (!admin) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, path_slug } = body;

  if (!title || !content) {
    return json({ success: false, error: 'title and content required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const author = admin;

  await db.prepare(
    `INSERT INTO announcements (id, title, content, author, path_slug) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, title, content, author, path_slug || null).run();

  const row = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first();
  return json({ success: true, data: row }, { status: 201 });
}

export async function DELETE({ request, platform }: RequestEvent) {
  const db = platform?.env?.DB as D1Database | undefined;
  if (!db) {
    return json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  const admin = request.headers.get('x-admin');
  if (!admin) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;
  if (!id) {
    return json({ success: false, error: 'id required' }, { status: 400 });
  }

  await db.prepare('UPDATE announcements SET active = 0 WHERE id = ?').bind(id).run();
  return json({ success: true });
}
