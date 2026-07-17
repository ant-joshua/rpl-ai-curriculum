import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';

export async function load({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const token = getBearerToken(request);
		if (!token) return { submissions: { assessment_submissions: [], assignment_submissions: [] }, token: '' };

		const session = await getSession(platform, token);
		if (!session) return { submissions: { assessment_submissions: [], assignment_submissions: [] }, token: '' };

		return { token };
	} catch {
		return { submissions: { assessment_submissions: [], assignment_submissions: [] }, token: '' };
	}
}
