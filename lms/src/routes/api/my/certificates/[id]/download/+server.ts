import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/my/certificates/[id]/download — printable A4 certificate page (print CSS → save as PDF) */
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const db = getDB(platform);
    const cert = await db.prepare(
      `SELECT c.id, c.cert_number, c.issued_at, c.completed_at, c.metadata,
              u.display_name AS user_name, co.name AS offering_name,
              co.icon_emoji AS offering_icon
       FROM certificates c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN course_offerings co ON co.id = c.course_offering_id
       WHERE c.id = ? AND c.user_id = ?`
    ).bind(params.id, session.user.id).first<any>();

    if (!cert) return jsonResponse({ success: false, error: 'Sertifikat tidak ditemukan' }, 404);

    let meta: any = {};
    try { meta = JSON.parse(cert.metadata || '{}'); } catch { /* ignore */ }

    const name = cert.user_name || meta.user_name || 'Peserta';
    const courseTitle = cert.offering_name || meta.course_title || 'Kursus';
    const icon = cert.offering_icon || meta.course_icon || '🎓';
    const issuedDate = new Date(cert.issued_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Sertifikat — ${escapeHtml(name)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@300;400;600&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #fff; display: flex; justify-content: center; padding: 24px; }
.certificate {
  width: 210mm;
  min-height: 148mm;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border: 3px solid #e0e7ff;
  border-radius: 16px;
  padding: 48px 56px;
  position: relative;
  overflow: hidden;
}
.certificate::before {
  content: '';
  position: absolute;
  top: -60%; left: -40%;
  width: 180%; height: 180%;
  background: radial-gradient(circle at 30% 40%, rgba(99,102,241,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.badge { display: flex; justify-content: center; margin-bottom: 16px; }
.badge-icon {
  width: 88px; height: 88px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 42px;
  box-shadow: 0 10px 30px rgba(99,102,241,0.35);
}
.header { text-align: center; margin-bottom: 24px; }
.header h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 34px;
  color: #4338ca;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.header .subtitle {
  color: #94a3b8;
  font-size: 13px;
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-top: 4px;
}
.cert-body { text-align: center; padding: 8px 0; }
.cert-body .label {
  color: #64748b;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 4px;
}
.cert-body .name {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 38px;
  color: #0f172a;
  margin-bottom: 10px;
}
.cert-body .text {
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto;
}
.cert-body .course-name {
  font-weight: 700;
  color: #4338ca;
}
.stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin: 24px 0;
}
.stat-item { text-align: center; }
.stat-item .num { font-size: 24px; font-weight: 700; color: #4338ca; }
.stat-item .desc { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
.footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 11px;
}
.footer .id { font-family: monospace; color: #64748b; font-weight: 600; }
.signature {
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
  padding: 0 24px;
}
.signature .sig-item { text-align: center; }
.signature .sig-line { width: 160px; border-top: 1.5px solid #cbd5e1; margin-bottom: 6px; }
.signature .sig-name { font-size: 12px; font-weight: 600; color: #334155; }
.signature .sig-role { font-size: 10px; color: #94a3b8; }
@media print {
  body { padding: 0; background: #fff; }
  .certificate { border-radius: 0; }
}
</style>
</head>
<body>
<div class="certificate">
  <div class="badge"><div class="badge-icon">${icon}</div></div>
  <div class="header">
    <h1>Sertifikat Penyelesaian</h1>
    <div class="subtitle">RPL AI Learning</div>
  </div>
  <div class="cert-body">
    <div class="label">Diberikan kepada</div>
    <div class="name">${escapeHtml(name)}</div>
    <div class="text">
      telah berhasil menyelesaikan kursus<br />
      <span class="course-name">${escapeHtml(courseTitle)}</span>
    </div>
    <div class="stats">
      <div class="stat-item">
        <div class="num">100%</div>
        <div class="desc">Kursus Selesai</div>
      </div>
      <div class="stat-item">
        <div class="num">${escapeHtml(issuedDate)}</div>
        <div class="desc">Tanggal</div>
      </div>
      <div class="stat-item">
        <div class="num">${escapeHtml(cert.cert_number)}</div>
        <div class="desc">No. Sertifikat</div>
      </div>
    </div>
    <div class="signature">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">Sistem</div>
        <div class="sig-role">Diterbitkan otomatis</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">RPL AI</div>
        <div class="sig-role">Kurikulum &amp; LMS</div>
      </div>
    </div>
  </div>
  <div class="footer">
    Sertifikat dapat diverifikasi di /certificates/verify — Kode: <span class="id">${escapeHtml(cert.cert_number)}</span>
  </div>
</div>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}