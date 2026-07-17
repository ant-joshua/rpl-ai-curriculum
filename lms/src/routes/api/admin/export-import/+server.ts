import { jsonResponse } from '$lib/server/d1';

/** GET /api/admin/export-import — list backups from R2 */
export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = (platform.env as any).ASSETS_BUCKET as R2Bucket;
		if (!bucket) return jsonResponse({ success: false, error: 'R2 bucket tidak dikonfigurasi' }, 500);

		const prefix = url.searchParams.get('prefix') || 'backups/';
		const result = await bucket.list({ prefix });
		const backups = (result.objects || []).map((obj) => ({
			key: obj.key,
			size: obj.size,
			uploaded: obj.uploaded,
		}));

		return jsonResponse({ success: true, data: backups });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** DELETE /api/admin/export-import?key=... — delete a backup */
export async function DELETE({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = (platform.env as any).ASSETS_BUCKET as R2Bucket;
		if (!bucket) return jsonResponse({ success: false, error: 'R2 bucket tidak dikonfigurasi' }, 500);

		const key = url.searchParams.get('key');
		if (!key) return jsonResponse({ success: false, error: 'Parameter key diperlukan' }, 400);

		await bucket.delete(key);
		return jsonResponse({ success: true, data: { deleted: key } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
