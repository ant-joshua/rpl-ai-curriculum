import { describe, it, expect } from 'vitest';
import { putFile, getFile, deleteFile, listFiles, getPublicUrl } from '../src/lib/server/r2';

function makeBucket() {
	const calls: string[] = [];
	const bucket = {
		put: async (key: string, body: unknown, opts: unknown) => {
			calls.push(`put:${key}`);
			return { key, body, httpMetadata: opts };
		},
		get: async (key: string) => {
			calls.push(`get:${key}`);
			return { key };
		},
		delete: async (key: string) => {
			calls.push(`delete:${key}`);
			return undefined;
		},
		list: async (opts: unknown) => {
			calls.push(`list:${JSON.stringify(opts)}`);
			return { objects: [], truncated: false };
		},
	};
	return { bucket, calls };
}

const body = new ArrayBuffer(4);

describe('r2 file ops', () => {
	it('putFile stores with content type', async () => {
		const { bucket, calls } = makeBucket();
		const platform = { env: { ASSETS_BUCKET: bucket } } as any;
		const obj = await putFile(platform, 'a/b.txt', body, 'text/plain');
		expect(obj.key).toBe('a/b.txt');
		expect(calls).toEqual(['put:a/b.txt']);
	});

	it('getFile returns object', async () => {
		const { bucket, calls } = makeBucket();
		const platform = { env: { ASSETS_BUCKET: bucket } } as any;
		const obj = await getFile(platform, 'k');
		expect(obj).toEqual({ key: 'k' });
		expect(calls).toEqual(['get:k']);
	});

	it('deleteFile calls bucket.delete', async () => {
		const { bucket, calls } = makeBucket();
		const platform = { env: { ASSETS_BUCKET: bucket } } as any;
		await deleteFile(platform, 'del');
		expect(calls).toEqual(['delete:del']);
	});

	it('listFiles with prefix passes include', async () => {
		const { bucket, calls } = makeBucket();
		const platform = { env: { ASSETS_BUCKET: bucket } } as any;
		const res = await listFiles(platform, 'docs/');
		expect(res.objects).toEqual([]);
		expect(calls[0]).toContain('"prefix":"docs/"');
	});

	it('listFiles without prefix omits prefix option', async () => {
		const { bucket, calls } = makeBucket();
		const platform = { env: { ASSETS_BUCKET: bucket } } as any;
		await listFiles(platform);
		expect(calls[0]).not.toContain('prefix');
	});

	it('getPublicUrl builds pub URL', () => {
		expect(getPublicUrl('img/x.png')).toBe('https://pub-img/x.png');
	});
});