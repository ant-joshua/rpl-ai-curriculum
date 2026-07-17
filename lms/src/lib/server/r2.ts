import type { R2Bucket, R2Object, R2Objects } from '@cloudflare/workers-types';

/**
 * Upload a file to R2 bucket.
 */
export async function putFile(
	platform: App.Platform,
	key: string,
	body: ArrayBuffer | ReadableStream,
	contentType: string
): Promise<R2Object> {
	return platform.env.ASSETS_BUCKET.put(key, body, {
		httpMetadata: { contentType },
	});
}

/**
 * Get a file from R2 bucket.
 */
export async function getFile(
	platform: App.Platform,
	key: string
): Promise<R2Object | null> {
	return platform.env.ASSETS_BUCKET.get(key);
}

/**
 * Delete a file from R2 bucket.
 */
export async function deleteFile(
	platform: App.Platform,
	key: string
): Promise<void> {
	await platform.env.ASSETS_BUCKET.delete(key);
}

/**
 * List files in R2 bucket with optional prefix.
 */
export async function listFiles(
	platform: App.Platform,
	prefix?: string
): Promise<R2Objects> {
	return platform.env.ASSETS_BUCKET.list(prefix ? { prefix, include: ['httpMetadata'] } : { include: ['httpMetadata'] });
}

/**
 * Generate public URL for an R2 object (if bucket is publicly accessible).
 */
export function getPublicUrl(key: string): string {
	return `https://pub-${key}`;
}
