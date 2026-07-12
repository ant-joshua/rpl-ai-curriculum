import { browser } from '$app/environment';

function getDeviceId(): string {
	if (!browser) return 'anonymous';
	const stored = localStorage.getItem('device_id');
	if (stored) return stored;
	const id = `device-${Math.random().toString(36).slice(2, 10)}`;
	localStorage.setItem('device_id', id);
	return id;
}

export interface Submission {
	id: string;
	user_id: string;
	exercise_slug: string;
	code: string;
	language: string;
	result: string;
	passed: number;
	submitted_at: string;
}

export interface CheckerResponse {
	success: boolean;
	passed: boolean;
	output: string;
	errors: string[];
	xpAwarded: number;
}

export interface SubmissionsResponse {
	success: boolean;
	data: Submission[];
}

export async function loadSubmissions(exerciseSlug?: string): Promise<Submission[]> {
	try {
		const url = exerciseSlug
			? `/api/submissions?exercise_slug=${encodeURIComponent(exerciseSlug)}`
			: '/api/submissions';
		const res = await fetch(url, {
			headers: { 'x-device-id': getDeviceId() },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json: SubmissionsResponse = await res.json();
		return json.data || [];
	} catch (err) {
		console.error('Failed to load submissions:', err);
		return [];
	}
}

export async function submitCode(
	exerciseSlug: string,
	code: string,
	language: string,
	output?: string,
	passed?: boolean
): Promise<CheckerResponse | null> {
	try {
		const res = await fetch('/api/checker', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-device-id': getDeviceId(),
			},
			body: JSON.stringify({
				exerciseSlug,
				code,
				language,
				output,
				passed,
			}),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json: CheckerResponse = await res.json();
		return json;
	} catch (err) {
		console.error('Failed to submit code:', err);
		return null;
	}
}
