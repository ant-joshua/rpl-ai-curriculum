import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

// POST /api/my/attendance/check-in — student self check-in via QR code / session code
// Body: { code: string, device_info?, location_lat?, location_lng? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

    const studentId = session.user.id;
    const body = await request.json();
    const { code } = body;
    if (!code || String(code).trim().length < 4) {
      return jsonResponse({ success: false, error: 'Kode presensi wajib diisi' }, 400);
    }

    const db = getDB(platform);
    const cleanCode = String(code).trim();

    // Find active session by qr_code
    const attSession = await db.prepare(
      `SELECT * FROM attendance_sessions WHERE qr_code = ? AND status = 'active'`
    ).bind(cleanCode).first() as any;

    if (!attSession) {
      return jsonResponse({ success: false, error: 'Kode presensi tidak ditemukan atau sesi sudah ditutup' }, 404);
    }

    // Check expiry
    if (attSession.qr_expires_at) {
      const expiresAt = new Date(attSession.qr_expires_at.replace(' ', 'T') + 'Z');
      if (expiresAt.getTime() < Date.now()) {
        return jsonResponse({ success: false, error: 'Kode presensi sudah kedaluwarsa' }, 410);
      }
    }

    // Verify student has at least one active enrollment
    const anyEnrollment = await db.prepare(
      `SELECT e.id FROM enrollments e WHERE e.user_id = ? AND e.status = 'active' LIMIT 1`
    ).bind(studentId).first() as any;

    if (!anyEnrollment) {
      return jsonResponse({ success: false, error: 'Kamu belum terdaftar di kelas manapun' }, 403);
    }

    // Check-in via repository
    const repo = new AttendanceSystemRepository(platform);
    const record = await repo.checkIn(attSession.tenant_id, {
      session_id: attSession.id,
      student_id: studentId,
      method: 'qr',
      device_info: body.device_info,
      location_lat: body.location_lat,
      location_lng: body.location_lng,
    });

    if (!record) {
      return jsonResponse({ success: false, error: 'Gagal check-in' }, 500);
    }

    return jsonResponse({
      success: true,
      data: {
        record,
        session: {
          title: attSession.title,
          session_date: attSession.created_at?.slice(0, 10),
        },
        message: 'Absen berhasil! ✅',
      },
    }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}