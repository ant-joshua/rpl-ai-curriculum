import { jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = platform.env.ASSETS_BUCKET;
		if (!bucket) {
			return jsonResponse({ success: false, error: 'File storage not configured' }, 500);
		}

		// Accept JSON with base64-encoded file content
		const body = await request.json();
		const { fileName, fileType, fileContent } = body;

		if (!fileName || !fileContent) {
			return jsonResponse({ success: false, error: 'fileName and fileContent (base64) required' }, 400);
		}

		// Decode base64
		let binary: Uint8Array;
		try {
			const raw = atob(fileContent);
			binary = new Uint8Array(raw.length);
			for (let i = 0; i < raw.length; i++) binary[i] = raw.charCodeAt(i);
		} catch {
			return jsonResponse({ success: false, error: 'Invalid base64 fileContent' }, 400);
		}

		const maxSize = 20 * 1024 * 1024;
		if (binary.length > maxSize) {
			return jsonResponse({ success: false, error: 'File too large (max 20MB)' }, 400);
		}

		const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
		const safeName = `${crypto.randomUUID()}.${ext}`;
		const key = `assignments/${safeName}`;

		await bucket.put(key, binary.buffer, {
			httpMetadata: { contentType: fileType || 'application/octet-stream' },
		});

		const url = `/api/upload?key=${key}`;

		return jsonResponse({ success: true, data: { url, key, fileName } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const bucket = platform.env.ASSETS_BUCKET;
		if (!bucket) return new Response('File storage not configured', { status: 500 });

		const key = url.searchParams.get('key') || '';
		if (!key) return new Response('Missing key', { status: 400 });

		const object = await bucket.get(key);
		if (!object) return new Response('Not found', { status: 404 });

		const headers = new Headers();
		headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
		headers.set('Cache-Control', 'public, max-age=31536000');
		return new Response(object.body, { headers });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(msg, { status: 500 });
	}
}
