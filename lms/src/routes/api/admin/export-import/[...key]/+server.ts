import { jsonResponse } from '$lib/server/d1';

/** GET /api/admin/export-import/<key> — download a backup file */
export async function GET({ params, platform }: { params: { key: string }; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = (platform.env as any).ASSETS_BUCKET as R2Bucket;
		if (!bucket) return jsonResponse({ success: false, error: 'R2 bucket tidak dikonfigurasi' }, 500);

		const key = params.key;
		if (!key) return jsonResponse({ success: false, error: 'Key diperlukan' }, 400);

		const object = await bucket.get(key);
		if (!object) return jsonResponse({ success: false, error: 'Backup tidak ditemukan' }, 404);

		const filename = key.split('/').pop() || 'backup.json.gz';
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		headers.set('Content-Disposition', `attachment; filename="${filename.replace(/\.gz$/, '')}"`);
		headers.set('Content-Encoding', 'gzip');
		headers.set('Cache-Control', 'private, max-age=3600');

		return new Response(object.body, { headers });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** DELETE /api/admin/export-import/<key> — delete a backup */
export async function DELETE({ params, platform }: { params: { key: string }; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = (platform.env as any).ASSETS_BUCKET as R2Bucket;
		if (!bucket) return jsonResponse({ success: false, error: 'R2 bucket tidak dikonfigurasi' }, 500);

		const key = params.key;
		if (!key) return jsonResponse({ success: false, error: 'Key diperlukan' }, 400);

		await bucket.delete(key);
		return jsonResponse({ success: true, data: { deleted: key } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
