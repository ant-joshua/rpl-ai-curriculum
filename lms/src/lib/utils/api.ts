import { browser } from '$app/environment';

const API_BASE = '';

export function getDeviceId(): string {
	if (!browser || typeof localStorage === 'undefined') return '';
	let id = localStorage.getItem('device_id');
	if (!id) {
		id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'device-' + Math.random().toString(36).slice(2);
		localStorage.setItem('device_id', id);
	}
	return id;
}

export function getAuthToken(): string | null {
	if (!browser || typeof localStorage === 'undefined') return null;
	return localStorage.getItem('lms-auth-token');
}

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	meta?: Record<string, unknown>;
	details?: unknown;
}

/**
 * Enhanced fetch client with auto-attached Bearer tokens, cookies, device IDs, and error safety.
 */
async function baseApi<T = any>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'x-device-id': getDeviceId(),
			...(options?.headers as Record<string, string> | undefined),
		};

		// Attach stored JWT if present
		const token = getAuthToken();
		if (token && !headers['Authorization']) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const res = await fetch(`${API_BASE}${path}`, {
			credentials: 'include',
			...options,
			headers,
		});

		const contentType = res.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const json = await res.json();
			return json;
		}

		if (!res.ok) {
			return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
		}

		return { success: true, data: (await res.text()) as unknown as T };
	} catch (e) {
		return { success: false, error: e instanceof Error ? e.message : 'offline' };
	}
}

export const api = Object.assign(baseApi, {
	get: <T = any>(path: string, options?: RequestInit) =>
		baseApi<T>(path, { ...options, method: 'GET' }),

	post: <T = any>(path: string, body?: unknown, options?: RequestInit) =>
		baseApi<T>(path, {
			...options,
			method: 'POST',
			body: body !== undefined ? JSON.stringify(body) : undefined,
		}),

	put: <T = any>(path: string, body?: unknown, options?: RequestInit) =>
		baseApi<T>(path, {
			...options,
			method: 'PUT',
			body: body !== undefined ? JSON.stringify(body) : undefined,
		}),

	patch: <T = any>(path: string, body?: unknown, options?: RequestInit) =>
		baseApi<T>(path, {
			...options,
			method: 'PATCH',
			body: body !== undefined ? JSON.stringify(body) : undefined,
		}),

	delete: <T = any>(path: string, options?: RequestInit) =>
		baseApi<T>(path, { ...options, method: 'DELETE' }),
});
