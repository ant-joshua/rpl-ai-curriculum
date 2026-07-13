import { browser } from '$app/environment';

const API_BASE = '';

function getDeviceId(): string {
	if (!browser) return '';
	let id = localStorage.getItem('device_id');
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem('device_id', id);
	}
	return id;
}

function getAuthToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('lms-auth-token');
}

async function api<T = any>(path: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'x-device-id': getDeviceId(),
			...options?.headers as Record<string, string> | undefined,
		};

		// Include auth token if available
		const token = getAuthToken();
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const res = await fetch(`${API_BASE}${path}`, {
			...options,
			headers,
		});
		return await res.json();
	} catch {
		return { success: false, error: 'offline' };
	}
}

export { api, getDeviceId, getAuthToken };
