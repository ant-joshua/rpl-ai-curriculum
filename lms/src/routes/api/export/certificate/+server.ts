import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		// Get user data
		const user = await db
			.prepare('SELECT id, username, created_at FROM users WHERE id = ?')
			.bind(deviceId)
			.first<{ id: string; username: string; created_at: string }>();

		// Get completed progress
		const { results: progressRows } = await db
			.prepare("SELECT module_slug, session_id, completed_at FROM progress WHERE user_id = ? AND completed = 1 ORDER BY completed_at ASC")
			.bind(deviceId)
			.all<{ module_slug: string; session_id: string; completed_at: string | null }>();

		// Get XP
		const xpRow = await db
			.prepare('SELECT xp, level FROM user_xp WHERE user_id = ?')
			.bind(deviceId)
			.first<{ xp: number; level: number }>();

		const totalSessions = progressRows.length;
		const modulesCompleted = new Set(progressRows.map(r => r.module_slug)).size;
		const currentXp = xpRow?.xp || 0;
		const currentLevel = xpRow?.level || 1;

		const completedAt = new Date().toISOString();

		// Styled HTML certificate
		const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sertifikat — RPL AI Curriculum</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;600&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  font-family: 'Inter', sans-serif;
  padding: 24px;
}
.certificate {
  max-width: 900px;
  width: 100%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 60px 50px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}
.certificate::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 40%, rgba(59,130,246,0.08) 0%, transparent 60%);
  pointer-events: none;
}
.badge {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.badge-icon {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 10px 30px rgba(59,130,246,0.3);
}
.header { text-align: center; margin-bottom: 30px; }
.header h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 38px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.header .subtitle {
  color: #94a3b8;
  font-size: 14px;
  letter-spacing: 6px;
  text-transform: uppercase;
  margin-top: 6px;
}
.cert-body { text-align: center; padding: 10px 0; }
.cert-body .label {
  color: #64748b;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.cert-body .name {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 42px;
  color: #f1f5f9;
  margin-bottom: 10px;
}
.cert-body .text {
  color: #cbd5e1;
  font-size: 16px;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 20px;
}
.stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
}
.stat-item { text-align: center; }
.stat-item .num {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
}
.stat-item .desc {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}
.footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  color: #475569;
  font-size: 12px;
}
.footer .id {
  font-family: monospace;
  color: #334155;
}
</style>
</head>
<body>
<div class="certificate">
  <div class="badge">
    <div class="badge-icon">🏆</div>
  </div>
  <div class="header">
    <h1>Sertifikat Prestasi</h1>
    <div class="subtitle">RPL AI Curriculum</div>
  </div>
  <div class="cert-body">
    <div class="label">Diberikan kepada</div>
    <div class="name">${user?.username ? escapeHtml(user.username) : 'Peserta'}</div>
    <div class="text">
      Telah menyelesaikan <strong>${totalSessions}</strong> sesi pembelajaran
      di <strong>${modulesCompleted}</strong> modul
      dalam program <strong>RPL AI Curriculum</strong>.
    </div>
    <div class="stats">
      <div class="stat-item">
        <div class="num">${totalSessions}</div>
        <div class="desc">Sesi Selesai</div>
      </div>
      <div class="stat-item">
        <div class="num">${modulesCompleted}</div>
        <div class="desc">Modul</div>
      </div>
      <div class="stat-item">
        <div class="num">Level ${currentLevel}</div>
        <div class="desc">XP: ${currentXp}</div>
      </div>
    </div>
    <div class="footer">
      Diterbitkan ${new Date(completedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>
</div>
</body>
</html>`;

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
