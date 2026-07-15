import { browser } from '$app/environment';

/**
 * Fire-and-forget activity logger. No await, no UI blocking.
 * Used from hooks in existing pages (lesson complete, assignment submit, etc.)
 */
export function logActivity(params: {
	activity_type: string;
	description: string;
	offering_id?: string;
	reference_type?: string;
	reference_id?: string;
	metadata?: Record<string, unknown>;
}) {
	if (!browser) return;

	const token = localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
	if (!token) return;

	const body = {
		activity_type: params.activity_type,
		description: params.description,
		...(params.offering_id ? { offering_id: params.offering_id } : {}),
		...(params.reference_type ? { reference_type: params.reference_type } : {}),
		...(params.reference_id ? { reference_id: params.reference_id } : {}),
		...(params.metadata ? { metadata: params.metadata } : {}),
	};

	fetch('/api/activity/log', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	}).catch(() => {
		// silent — fire and forget
	});
}
