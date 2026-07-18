import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	const filename = params.filename;
	const key = `pdfs/${filename}`;

	const r2 = platform!.env.ASSETS_BUCKET;
	const object = await r2.get(key);

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(object.body, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${filename}"`,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
