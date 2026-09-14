<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { browser } from '$app/environment';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="var(--bg)" />
</svelte:head>

<div class="auth-layout">
	<!-- Animated background blobs -->
	<div class="auth-blob blob-1"></div>
	<div class="auth-blob blob-2"></div>
	<div class="auth-blob blob-3"></div>

	<a href="/" class="back-home" aria-label="Kembali ke beranda">
		<span class="back-arrow">←</span>
		<span>Kembali ke Beranda</span>
	</a>

	<div class="auth-container">
		{@render children()}
	</div>
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg, var(--bg));
		position: relative;
		overflow: hidden;
		/* Force light theme on auth pages */
		--bg: var(--bg) !important;
		--surface: var(--surface) !important;
		--text: var(--text) !important;
		--text-secondary: var(--text-secondary) !important;
		--text-muted: var(--text-muted) !important;
		--border: var(--border) !important;
		--accent: var(--accent) !important;
		--accent-hover: var(--accent-hover) !important;
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
		position: relative;
		z-index: 1;
		animation: auth-fade-in 0.6s ease-out;
	}

	/* Subtle indigo glow on auth cards */
	.auth-container :global(.login-card),
	.auth-container :global(.register-card),
	.auth-container :global(.reset-card) {
		box-shadow: 0 0 24px rgba(var(--accent-rgb), 0.08), 0 0 60px rgba(79, 70, 229, 0.04);
	}

	/* Animated background blobs */
	.auth-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.12;
		pointer-events: none;
	}

	.blob-1 {
		width: 400px;
		height: 400px;
		background: var(--accent);
		top: -10%;
		left: -10%;
		animation: blob-float-1 18s ease-in-out infinite;
	}

	.blob-2 {
		width: 350px;
		height: 350px;
		background: var(--accent);
		bottom: -15%;
		right: -10%;
		animation: blob-float-2 20s ease-in-out infinite;
	}

	.blob-3 {
		width: 300px;
		height: 300px;
		background: var(--accent);
		top: 50%;
		right: -5%;
		animation: blob-float-3 22s ease-in-out infinite;
	}

	@keyframes auth-fade-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes blob-float-1 {
		0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(60px, -40px) rotate(120deg) scale(1.1); }
		66% { transform: translate(-30px, 50px) rotate(240deg) scale(0.9); }
	}

	@keyframes blob-float-2 {
		0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(-50px, 30px) rotate(-120deg) scale(1.15); }
		66% { transform: translate(40px, -60px) rotate(-240deg) scale(0.85); }
	}

	@keyframes blob-float-3 {
		0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(-50px, 40px) rotate(90deg) scale(1.05); }
		66% { transform: translate(30px, -50px) rotate(180deg) scale(0.95); }
	}

	.back-home {
		position: fixed;
		top: 20px;
		left: 20px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: 8px;
		background: rgba(255,255,255,0.9);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		text-decoration: none !important;
		z-index: 10;
		transition: all 0.15s;
	}
	.back-home:hover {
		background: var(--surface);
		border-color: var(--accent);
		color: var(--accent);
		box-shadow: 0 2px 8px rgba(79,70,229,0.12);
	}
	.back-home svg {
		flex-shrink: 0;
	}
</style>
