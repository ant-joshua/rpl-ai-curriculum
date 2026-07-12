import type { D1Database } from '@cloudflare/workers-types';

export function getDB(platform: App.Platform): D1Database {
	return platform.env.DB;
}

export function getDeviceId(request: Request): string {
	return request.headers.get('x-device-id') || 'anonymous';
}
