<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	let name = $state('');
</script>

<svelte:head>
	<title>RPL AI Curriculum — Platform Pembelajaran AI untuk Rekayasa Perangkat Lunak</title>
	<meta name="description" content="Kurikulum RPL dari dasar hingga mahir — belajar coding, AI, dan software engineering dengan pendekatan praktis berbasis AI." />
</svelte:head>

<!-- HERO -->
<section class="hero">
	<div class="hero-bg" />
	<div class="hero-content">
		<div class="hero-icon">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				<text x="7" y="16" font-size="9" fill="currentColor" font-weight="700">VOL 3</text>
			</svg>
		</div>

		<h1 class="hero-title">
			<span class="hero-title-main">RPL AI Curriculum</span>
			<span class="hero-title-sub">Platform Belajar AI untuk Rekayasa Perangkat Lunak</span>
		</h1>

		<p class="hero-desc">
			Kurikulum RPL dari dasar hingga mahir — belajar coding, AI, dan software engineering dengan pendekatan praktis berbasis AI.
		</p>

		<form class="hero-form" action="/login" method="GET">
			<div class="hero-input-group">
				<input
					type="text"
					class="hero-input"
					placeholder="Masukkan nama kamu"
					bind:value={name}
					aria-label="Nama"
				/>
				<button type="submit" class="hero-cta" disabled={!name.trim()}>
					Mulai Belajar
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
					</svg>
				</button>
			</div>
		</form>

		<div class="hero-divider">
			<span>atau</span>
		</div>

		<div class="oauth-buttons">
			<a href="/api/auth/oauth/redirect/google" class="oauth-btn google">
				<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
				<span>Login dengan Google</span>
			</a>
			<a href="/api/auth/oauth/redirect/github" class="oauth-btn github">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
				<span>Login dengan GitHub</span>
			</a>
		</div>

		<a href="/register" class="hero-register-link">
			Belum punya akun? <strong>Daftar di sini</strong>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
		</a>

		<p class="hero-disclaimer">
			Login via OAuth akan mengirim kamu ke Google/GitHub untuk verifikasi. Data kamu aman dan tidak dibagikan.
		</p>
	</div>
</section>

<!-- STATS -->
<section class="stats">
	<div class="stats-grid">
		<div class="stat-item">
			<span class="stat-value">57+</span>
			<span class="stat-label">Modul Pembelajaran</span>
		</div>
		<div class="stat-divider" />
		<div class="stat-item">
			<span class="stat-value">1.200+</span>
			<span class="stat-label">Latihan & Kuis</span>
		</div>
		<div class="stat-divider" />
		<div class="stat-item">
			<span class="stat-value">24/7</span>
			<span class="stat-label">AI Tutor</span>
		</div>
		<div class="stat-divider" />
		<div class="stat-item">
			<span class="stat-value">5.000+</span>
			<span class="stat-label">Siswa Aktif</span>
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="how-it-works">
	<h2 class="section-title">Bagaimana Cara Kerjanya</h2>
	<p class="section-subtitle">Mulai belajar dalam 3 langkah mudah</p>

	<div class="steps-grid">
		<div class="step-card">
			<div class="step-number">1</div>
			<div class="step-icon">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
					<circle cx="9" cy="7" r="4"/>
					<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
				</svg>
			</div>
			<h3 class="step-title">Daftar Akun</h3>
			<p class="step-desc">Buat akun gratis dengan email atau login via Google/GitHub. Proses cepat & mudah.</p>
		</div>

		<div class="step-arrow">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
			</svg>
		</div>

		<div class="step-card">
			<div class="step-number">2</div>
			<div class="step-icon">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				</svg>
			</div>
			<h3 class="step-title">Pilih Learning Path</h3>
			<p class="step-desc">Pilih jalur belajar sesuai minat — dari Web Dev, AI/ML, Mobile, sampai Full Stack.</p>
		</div>

		<div class="step-arrow">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
			</svg>
		</div>

		<div class="step-card">
			<div class="step-number">3</div>
			<div class="step-icon">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<path d="M12 6v6l4 2"/>
				</svg>
			</div>
			<h3 class="step-title">Belajar dengan AI</h3>
			<p class="step-desc">Akses modul, latihan interaktif, dan AI Tutor yang siap membantu 24/7.</p>
		</div>
	</div>
</section>

<!-- FEATURES -->
<section class="features">
	<h2 class="section-title">Kenapa Belajar di RPL AI?</h2>
	<p class="section-subtitle">Platform belajar modern dengan teknologi AI</p>

	<div class="features-grid">
		<div class="feature-card">
			<div class="feature-icon accent">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				</svg>
			</div>
			<h3>Modul Terstruktur</h3>
			<p>57+ modul dari dasar hingga mahir, disusun dalam learning path bertahap dengan level Beginner→Advanced.</p>
		</div>

		<div class="feature-card">
			<div class="feature-icon accent">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<path d="M12 6v6l4 2"/>
				</svg>
			</div>
			<h3>AI Tutor 24/7</h3>
			<p>Asisten AI siap membantu kapan saja. Tanya langsung, dapatkan penjelasan instan, dan koreksi kode real-time.</p>
		</div>

		<div class="feature-card">
			<div class="feature-icon accent">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 11l3 3L22 4"/>
					<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
				</svg>
			</div>
			<h3>Latihan Interaktif</h3>
			<p>1.200+ latihan, kuis, flashcards, dan coding challenge untuk menguji pemahaman setiap modul.</p>
		</div>

		<div class="feature-card">
			<div class="feature-icon accent">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 12h14"/>
					<path d="M12 5l7 7-7 7"/>
				</svg>
			</div>
			<h3>Proyek Nyata</h3>
			<p>Bangun portofolio dengan proyek hands-on: dari API sederhana sampai full-stack aplikasi production-ready.</p>
		</div>
	</div>
</section>

<!-- WHY RPL AI -->
<section class="why">
	<h2 class="section-title">Belajar Lebih Efektif dengan AI</h2>
	<p class="section-subtitle">3 keunggulan yang bikin belajar makin cepat</p>

	<div class="why-grid">
		<div class="why-card">
			<div class="why-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
				</svg>
			</div>
			<h3>Kurikulum Industri</h3>
			<p>Disusun bersama praktisi software engineering dari perusahaan teknologi terkemuka. Materi selalu update mengikuti tren industri.</p>
		</div>

		<div class="why-card">
			<div class="why-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
				</svg>
			</div>
			<h3>Belajar Fleksibel</h3>
			<p>Akses materi kapan saja, di mana saja. Progress tersimpan otomatis, lanjutkan belajar dari perangkat mana pun.</p>
		</div>

		<div class="why-card">
			<div class="why-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
					<path d="M12 17h.01"/>
				</svg>
			</div>
			<h3>Dibimbing AI</h3>
			<p>AI Tutor memahami progress dan kesulitan kamu. Rekomendasi personal, koreksi instant, dan penjelasan mendalam.</p>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="cta-section">
	<div class="cta-card">
		<h2>Siap Memulai Perjalanan Belajar?</h2>
		<p>Gabung dengan 5.000+ siswa yang sudah belajar di RPL AI Curriculum. Gratis, tanpa kartu kredit.</p>
		<div class="cta-actions">
			<a href="/register" class="cta-primary">
				Daftar Gratis
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
				</svg>
			</a>
			<a href="/login" class="cta-secondary">Sudah punya akun? Login</a>
		</div>
	</div>
</section>

<!-- FOOTER -->
<footer class="footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
			<span>RPL AI Curriculum</span>
		</div>
		<div class="footer-links">
			<a href="/feed">Blog</a>
			<a href="/certificate">Sertifikat</a>
			<a href="/announcements">Pengumuman</a>
		</div>
		<p class="footer-copy">© 2026 RPL AI Curriculum. Platform pembelajaran berbasis AI untuk Rekayasa Perangkat Lunak.</p>
	</div>
</footer>

<style>
	/* ── HERO ── */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 20px 60px;
		overflow: hidden;
	}
	.hero-bg {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.12), transparent);
		pointer-events: none;
	}
	.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0;
		width: 100%;
		max-width: 520px;
	}
	.hero-icon {
		color: #4F46E5;
		margin-bottom: 24px;
		opacity: 0.9;
	}
	.hero-title {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0 0 16px;
	}
	.hero-title-main {
		font-size: 36px;
		font-weight: 800;
		letter-spacing: -0.03em;
		color: #1a1a2e;
		line-height: 1.1;
	}
	.hero-title-sub {
		font-size: 18px;
		font-weight: 500;
		color: #64748b;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}
	.hero-desc {
		font-size: 15px;
		line-height: 1.6;
		color: #94a3b8;
		margin: 0 0 28px;
		max-width: 440px;
	}

	.hero-form {
		width: 100%;
		margin-bottom: 20px;
	}
	.hero-input-group {
		display: flex;
		gap: 8px;
		width: 100%;
	}
	.hero-input {
		flex: 1;
		padding: 12px 16px;
		font-size: 15px;
		font-family: inherit;
		background: #FFFFFF;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 8px;
		color: #1a1a2e;
		outline: none;
		transition: border-color 0.15s;
	}
	.hero-input:focus {
		border-color: #4F46E5;
		box-shadow: 0 0 0 2px rgba(79,70,229,0.15);
	}
	.hero-input::placeholder {
		color: #94a3b8;
	}
	.hero-cta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 12px 20px;
		font-size: 15px;
		font-weight: 600;
		font-family: inherit;
		color: #fff;
		background: #4F46E5;
		border: none;
		border-radius: 8px;
		box-shadow: 0 4px 0 #3730A3;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		position: relative;
		top: 0;
	}
	.hero-cta:hover:not(:disabled) {
		background: #4338CA;
		top: -1px;
		box-shadow: 0 5px 0 #3730A3;
	}
	.hero-cta:active:not(:disabled) {
		top: 2px;
		box-shadow: 0 2px 0 #3730A3;
	}
	.hero-cta:disabled {
		opacity: 0.35;
		cursor: not-allowed;
		transform: none;
	}

	.hero-divider {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		margin-bottom: 16px;
	}
	.hero-divider::before,
	.hero-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(0,0,0,0.08);
	}
	.hero-divider span {
		font-size: 12px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		margin-bottom: 16px;
	}
	.oauth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 11px 16px;
		font-size: 14px;
		font-weight: 500;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s;
		cursor: pointer;
	}
	.oauth-btn.google {
		background: #fff;
		color: #1f2937;
		border: 1px solid #e5e7eb;
	}
	.oauth-btn.google:hover {
		background: #f9fafb;
	}
	.oauth-btn.github {
		background: #24292f;
		color: #1a1a2e;
		border: 1px solid #32383f;
	}
	.oauth-btn.github:hover {
		background: #2d333b;
	}

	.hero-register-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 14px;
		color: #64748b;
		text-decoration: none;
		margin-bottom: 12px;
		transition: color 0.15s;
	}
	.hero-register-link:hover {
		color: #1a1a2e;
	}
	.hero-register-link strong {
		color: #4F46E5;
	}

	.hero-disclaimer {
		font-size: 11px;
		color: #94a3b8;
		line-height: 1.5;
		margin: 0;
		max-width: 380px;
	}

	/* ── STATS ── */
	.stats {
		padding: 40px 20px;
		background: #FFFFFF;
	}
	.stats-grid {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		max-width: 800px;
		margin: 0 auto;
	}
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}
	.stat-value {
		font-size: 28px;
		font-weight: 800;
		color: #4F46E5;
		letter-spacing: -0.02em;
	}
	.stat-label {
		font-size: 12px;
		color: #64748b;
		text-align: center;
	}
	.stat-divider {
		width: 1px;
		height: 40px;
		background: rgba(0,0,0,0.08);
		margin: 0 12px;
	}

	/* ── SECTION SHARED ── */
	.section-title {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a2e;
		text-align: center;
		margin: 0 0 8px;
		letter-spacing: -0.02em;
	}
	.section-subtitle {
		font-size: 15px;
		color: #94a3b8;
		text-align: center;
		margin: 0 0 48px;
	}

	/* ── HOW IT WORKS ── */
	.how-it-works {
		padding: 80px 20px;
		max-width: 900px;
		margin: 0 auto;
	}
	.steps-grid {
		display: flex;
		align-items: flex-start;
		gap: 0;
	}
	.step-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 32px 20px;
		background: #FFFFFF;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 12px;
		transition: border-color 0.2s;
	}
	.step-card:hover {
		border-color: rgba(79,70,229,0.3);
	}
	.step-number {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 700;
		color: #fff;
		background: #4F46E5;
		border-radius: 50%;
		margin-bottom: 16px;
	}
	.step-icon {
		color: #4F46E5;
		margin-bottom: 12px;
	}
	.step-title {
		font-size: 17px;
		font-weight: 600;
		color: #1a1a2e;
		margin: 0 0 8px;
	}
	.step-desc {
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
		max-width: 220px;
	}
	.step-arrow {
		display: flex;
		align-items: center;
		padding: 0 4px;
		color: #4F46E5;
		margin-top: 60px;
		flex-shrink: 0;
	}

	/* ── FEATURES ── */
	.features {
		padding: 80px 20px;
		background: #FFFFFF;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		max-width: 720px;
		margin: 0 auto;
	}
	.feature-card {
		padding: 28px 24px;
		background: #F4F7FA;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 10px;
		transition: border-color 0.2s;
	}
	.feature-card:hover {
		border-color: rgba(79,70,229,0.3);
	}
	.feature-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		margin-bottom: 14px;
	}
	.feature-icon.accent {
		background: rgba(79,70,229,0.1);
		color: #4F46E5;
	}
	.feature-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a2e;
		margin: 0 0 6px;
	}
	.feature-card p {
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	/* ── WHY ── */
	.why {
		padding: 80px 20px;
		max-width: 960px;
		margin: 0 auto;
	}
	.why-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.why-card {
		padding: 32px 24px;
		background: #FFFFFF;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 12px;
		text-align: center;
		transition: border-color 0.2s;
	}
	.why-card:hover {
		border-color: rgba(79,70,229,0.3);
	}
	.why-icon {
		color: #4F46E5;
		margin-bottom: 16px;
	}
	.why-card h3 {
		font-size: 17px;
		font-weight: 600;
		color: #1a1a2e;
		margin: 0 0 10px;
	}
	.why-card p {
		font-size: 13px;
		color: #64748b;
		line-height: 1.7;
		margin: 0;
	}

	/* ── CTA ── */
	.cta-section {
		padding: 60px 20px 80px;
	}
	.cta-card {
		max-width: 520px;
		margin: 0 auto;
		padding: 48px 36px;
		background: linear-gradient(135deg, rgba(79,70,229,0.08), rgba(79,70,229,0.02));
		border: 1px solid rgba(79,70,229,0.15);
		border-radius: 16px;
		text-align: center;
	}
	.cta-card h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a2e;
		margin: 0 0 12px;
		letter-spacing: -0.02em;
	}
	.cta-card p {
		font-size: 14px;
		color: #64748b;
		margin: 0 0 28px;
		line-height: 1.6;
	}
	.cta-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 32px;
		font-size: 16px;
		font-weight: 600;
		color: #fff;
		background: var(--accent, #4F46E5);
		border: none;
		border-radius: 10px;
		box-shadow: 0 4px 0 #3730A3;
		text-decoration: none;
		transition: all 0.15s ease;
		position: relative;
		top: 0;
	}
	.cta-primary:hover {
		background: var(--accent-hover, #4338CA);
		top: -1px;
		box-shadow: 0 5px 0 #3730A3;
		text-decoration: none;
	}
	.cta-primary:active {
		top: 2px;
		box-shadow: 0 2px 0 #3730A3;
	}
	.cta-secondary {
		font-size: 14px;
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s;
	}
	.cta-secondary:hover {
		color: #1a1a2e;
	}

	/* ── FOOTER ── */
	.footer {
		padding: 40px 20px;
		border-top: 1px solid rgba(0,0,0,0.08);
	}
	.footer-inner {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.footer-brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: #1a1a2e;
	}
	.footer-links {
		display: flex;
		gap: 20px;
	}
	.footer-links a {
		font-size: 13px;
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s;
	}
	.footer-links a:hover {
		color: #1a1a2e;
	}
	.footer-copy {
		font-size: 12px;
		color: #94a3b8;
		margin: 0;
		text-align: center;
	}

	/* ── RESPONSIVE ── */
	@media (max-width: 768px) {
		.hero-title-main { font-size: 28px; }
		.hero-title-sub { font-size: 15px; }
		.hero-input-group { flex-direction: column; }
		.hero-cta { width: 100%; justify-content: center; padding: 12px 16px; }

		.steps-grid { flex-direction: column; align-items: center; }
		.step-arrow { transform: rotate(90deg); margin: 8px 0; padding: 0; }

		.features-grid { grid-template-columns: 1fr; }
		.why-grid { grid-template-columns: 1fr; }

		.stats-grid { flex-wrap: wrap; gap: 16px; }
		.stat-item { flex: 1 1 40%; }
		.stat-divider { display: none; }

		.hero { min-height: auto; padding: 60px 16px 40px; }
		.how-it-works { padding: 60px 16px; }
		.features { padding: 60px 16px; }
		.why { padding: 60px 16px; }
		.cta-card { padding: 36px 20px; }
	}

	@media (max-width: 480px) {
		.hero-title-main { font-size: 24px; }
		.stat-value { font-size: 22px; }
		.section-title { font-size: 22px; }
	}
</style>
