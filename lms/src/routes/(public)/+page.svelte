<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	let name = $state('');
</script>

<svelte:head>
	<title>RPL AI Curriculum — Platform Pembelajaran AI</title>
	<meta name="description" content="Platform pembelajaran interaktif untuk Rekayasa Perangkat Lunak dengan AI." />
</svelte:head>

<div class="landing">
	<!-- Topbar -->
	<nav class="topbar">
		<a href="/" class="logo">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
			<span class="logo-text">RPL AI</span>
		</a>
		<div class="topbar-actions">
			<a href="/login" class="login-btn">Login</a>
		</div>
	</nav>

	<!-- Hero -->
	<section class="hero">
		<div class="hero-content">
			<div class="hero-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #5e6ad2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
					<text x="7" y="16" font-size="9" fill="var(--accent, #5e6ad2)" font-weight="700">VOL 3</text>
				</svg>
			</div>

			<h1 class="hero-title">{t('landing.title')}</h1>
			<p class="hero-subtitle">{t('landing.subtitle')}</p>

			<form class="hero-form" action="/login" method="GET">
				<input
					type="text"
					class="hero-input"
					placeholder="Masukkan nama kamu"
					bind:value={name}
					aria-label="Nama"
				/>
				<button type="submit" class="hero-cta" disabled={!name.trim()}>
					Mulai Belajar
				</button>
			</form>

			<div class="divider">
				<span>atau</span>
			</div>

			<div class="oauth-buttons">
				<a href="/api/auth/google" class="oauth-btn google">
					<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
					Login dengan Google
				</a>
				<a href="/api/auth/github" class="oauth-btn github">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="#f7f8f8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
					Login dengan GitHub
				</a>
			</div>

			<a href="/reset-password" class="forgot-link">Lupa Password?</a>

			<p class="disclaimer">Login via OAuth akan mengirim kamu ke Google/GitHub untuk verifikasi. Data kamu aman dan tidak dibagikan.</p>
		</div>
	</section>

	<!-- Features -->
	<section class="features">
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">📚</div>
				<h3>Modul Terstruktur</h3>
				<p>Kurikulum RPL dari dasar hingga mahir, disusun dalam jalur belajar bertahap.</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🤖</div>
				<h3>AI Tutor</h3>
				<p>Asisten AI siap membantu kapan saja. Tanya langsung di chat, dapatkan penjelasan instan.</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📝</div>
				<h3>Latihan & Proyek</h3>
				<p>Praktik langsung dengan latihan interaktif, kuis, dan proyek dunia nyata.</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<p>&copy; 2026 RPL AI Curriculum. Platform pembelajaran untuk program Rekayasa Perangkat Lunak.</p>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
		background: var(--bg, #0a0b0c);
		background-image:
			radial-gradient(ellipse at 50% 0%, rgba(94, 106, 210, 0.06) 0%, transparent 60%);
		color: var(--text, #f7f8f8);
		font-family: var(--font, 'Inter', system-ui, -apple-system, sans-serif);
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		background: rgba(10, 11, 12, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255,255,255,0.06);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--text, #f7f8f8);
	}

	.logo svg {
		color: var(--accent, #5e6ad2);
	}

	.logo-text {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.login-btn {
		padding: 0.5rem 1.25rem;
		border-radius: 6px;
		background: var(--accent, #5e6ad2);
		color: #fff;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		transition: background 0.15s;
	}

	.login-btn:hover {
		background: #6b77e0;
	}

	.hero {
		padding: 4rem 1.5rem;
		display: flex;
		justify-content: center;
	}

	.hero-content {
		max-width: 440px;
		width: 100%;
		text-align: center;
	}

	.hero-icon {
		margin-bottom: 1.5rem;
	}

	.hero-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		letter-spacing: -0.03em;
	}

	.hero-subtitle {
		color: var(--text-secondary, #8a8f98);
		font-size: 0.95rem;
		line-height: 1.5;
		margin-bottom: 2rem;
	}

	.hero-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.hero-input {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid rgba(255,255,255,0.1);
		background: rgba(255,255,255,0.04);
		color: #f7f8f8;
		font-size: 0.95rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.hero-input:focus {
		border-color: var(--accent, #5e6ad2);
	}

	.hero-cta {
		padding: 0.875rem 1rem;
		border-radius: 8px;
		border: none;
		background: var(--accent, #5e6ad2);
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s, opacity 0.15s;
	}

	.hero-cta:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.hero-cta:hover:not(:disabled) {
		background: #6b77e0;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
		color: var(--text-secondary, #62666d);
		font-size: 0.825rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(255,255,255,0.08);
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin-bottom: 1rem;
	}

	.oauth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid rgba(255,255,255,0.1);
		background: rgba(255,255,255,0.04);
		color: var(--text, #f7f8f8);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: background 0.15s;
	}

	.oauth-btn:hover {
		background: rgba(255,255,255,0.08);
	}

	.oauth-btn.google svg { flex-shrink: 0; }
	.oauth-btn.github svg { flex-shrink: 0; }

	.forgot-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--accent, #5e6ad2);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.forgot-link:hover {
		text-decoration: underline;
	}

	.disclaimer {
		color: var(--text-secondary, #62666d);
		font-size: 0.75rem;
		line-height: 1.5;
	}

	.features {
		padding: 2rem 1.5rem 4rem;
	}

	.features-grid {
		max-width: 960px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.feature-card {
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(255,255,255,0.06);
		background: rgba(255,255,255,0.02);
	}

	.feature-icon {
		font-size: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.feature-card h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text, #f7f8f8);
	}

	.feature-card p {
		font-size: 0.875rem;
		color: var(--text-secondary, #8a8f98);
		line-height: 1.5;
	}

	.footer {
		text-align: center;
		padding: 2rem 1.5rem;
		border-top: 1px solid rgba(255,255,255,0.06);
		color: var(--text-secondary, #62666d);
		font-size: 0.8rem;
	}
</style>
