import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';
import { putFile, deleteFile } from '$lib/server/r2';

/**
 * POST /api/admin/media/upload — Upload file to R2 + record in DB
 * Accepts multipart/form-data with field "file"
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		if (!file) {
			return jsonResponse({ success: false, error: 'File diperlukan' }, 400);
		}

		const lessonId = formData.get('lesson_id') as string | null;
		const courseOfferingId = formData.get('course_offering_id') as string | null;
		const uploadedBy = formData.get('uploaded_by') as string | null;

		// Generate unique key
		const ext = file.name.split('.').pop() || 'bin';
		const key = `uploads/${crypto.randomUUID()}.${ext}`;
		const arrayBuffer = await file.arrayBuffer();

		// Upload to R2
		await putFile(platform, key, arrayBuffer, file.type);

		// Build URL
		const url = `/media/${key}`;

		// Record in DB
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO media_files (id, filename, original_name, mime_type, size, url, key, uploaded_by, lesson_id, course_offering_id, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			key.split('/').pop() || file.name,
			file.name,
			file.type,
			file.size,
			url,
			key,
			uploadedBy || null,
			lessonId || null,
			courseOfferingId || null,
			now
		).run();

		const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').bind(id).first<any>();

		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * GET /api/admin/media — List media files
 * Query: page, limit, search, type (image/pdf/video), sort
 */
export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const typeFilter = url.searchParams.get('type') || '';
		const sort = url.searchParams.get('sort') || 'desc';

		const params: unknown[] = [];
		let where = 'WHERE 1=1';

		// Filter by mime type group
		if (typeFilter === 'image') {
			where += " AND mime_type LIKE 'image/%'";
		} else if (typeFilter === 'pdf') {
			where += " AND mime_type = 'application/pdf'";
		} else if (typeFilter === 'video') {
			where += " AND mime_type LIKE 'video/%'";
		} else if (typeFilter === 'document') {
			where += " AND (mime_type LIKE 'application/%' AND mime_type != 'application/pdf')";
		}

		// Search by original name
		if (pag.search) {
			where += ' AND original_name LIKE ?';
			params.push(`%${pag.search}%`);
		}

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM media_files ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const orderDir = sort === 'asc' ? 'ASC' : 'DESC';

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare(`SELECT * FROM media_files ${where} ORDER BY created_at ${orderDir}`).bind(...params).all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const sql = `SELECT * FROM media_files ${where} ORDER BY created_at ${orderDir} LIMIT ? OFFSET ?`;
		const result = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: result.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
