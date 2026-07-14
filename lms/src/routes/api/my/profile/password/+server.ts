import { jsonResponse } from '$lib/server/d1';

/**
 * PUT /api/my/profile/password
 * Password management is not available for OAuth accounts.
 */
export async function PUT(): Promise<Response> {
	return jsonResponse({
		success: false,
		error: 'Password management not available for OAuth accounts',
	}, 400);
}
