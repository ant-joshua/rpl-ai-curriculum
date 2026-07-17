import { getDB, jsonResponse } from '$lib/server/d1';
import { deleteFile } from '$lib/server/r2';

/**
 * GET /api/admin/media/[id] — Get single media file details
 */
export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * DELETE /api/admin/media/[id] — Delete media file from R2 + DB
 */
export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);

		// Delete from R2
		try {
			await deleteFile(platform, row.key);
		} catch {
			// R2 delete may fail if object doesn't exist, still remove DB record
		}

		// Delete from DB
		await db.prepare('DELETE FROM media_files WHERE id = ?').bind(params.id).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
