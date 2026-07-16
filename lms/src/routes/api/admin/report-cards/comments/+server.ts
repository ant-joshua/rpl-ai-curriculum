import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { ReportCardRepository } from '$lib/repositories/report-card.repository';

export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin', 'teacher'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const tenantId = url.searchParams.get('tenant_id') || session.user.tenant_id || 'default';
		const studentId = url.searchParams.get('student_id') || undefined;
		const classSubjectId = url.searchParams.get('class_subject_id') || undefined;
		const academicYear = url.searchParams.get('academic_year') || undefined;
		const semesterStr = url.searchParams.get('semester');
		const semester = semesterStr ? parseInt(semesterStr) : undefined;

		const repo = new ReportCardRepository(db, tenantId);
		const comments = await repo.getComments(tenantId, {
			studentId,
			classSubjectId,
			academicYear,
			semester,
		});

		return jsonResponse({ success: true, data: comments });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin', 'teacher'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const { student_id, class_subject_id, academic_year, semester, comment } = body;

		if (!student_id || !class_subject_id || !academic_year || semester === undefined || !comment) {
			return jsonResponse({ success: false, error: 'student_id, class_subject_id, academic_year, semester, and comment required' }, 400);
		}

		const tenantId = session.user.tenant_id || 'default';
		const repo = new ReportCardRepository(db, tenantId);
		const created = await repo.createComment(tenantId, {
			studentId: student_id,
			classSubjectId: class_subject_id,
			academicYear: academic_year,
			semester,
			comment,
		}, session.user.id);

		return jsonResponse({ success: true, data: created }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
