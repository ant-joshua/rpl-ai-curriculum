<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#F4F7FA" />
</svelte:head>

<div class="auth-layout">
	<!-- Animated background blobs -->
	<div class="auth-blob blob-1"></div>
	<div class="auth-blob blob-2"></div>
	<div class="auth-blob blob-3"></div>

	<a href="/" class="back-home" aria-label="Kembali ke beranda">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
			<polyline points="9 22 9 12 15 12 15 22"/>
		</svg>
		<span>Beranda</span>
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
		background: var(--bg, #F4F7FA);
		background-image:
			radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.08) 0%, transparent 60%),
			radial-gradient(ellipse at 80% 80%, rgba(79, 70, 229, 0.04) 0%, transparent 50%);
		padding: 1rem;
		position: relative;
		overflow: hidden;
		/* Force light theme on auth pages */
		--bg: #F4F7FA !important;
		--surface: #FFFFFF !important;
		--text: #1a1a2e !important;
		--text-secondary: #64748b !important;
		--text-muted: #94a3b8 !important;
		--border: #E2E8F0 !important;
		--accent: #4F46E5 !important;
		--accent-hover: #4338CA !important;
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
		box-shadow: 0 0 24px rgba(79, 70, 229, 0.08), 0 0 60px rgba(79, 70, 229, 0.04);
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
		background: #4F46E5;
		top: -10%;
		left: -10%;
		animation: blob-float-1 18s ease-in-out infinite;
	}

	.blob-2 {
		width: 350px;
		height: 350px;
		background: #3B82F6;
		bottom: -15%;
		right: -10%;
		animation: blob-float-2 20s ease-in-out infinite;
	}

	.blob-3 {
		width: 300px;
		height: 300px;
		background: #8B5CF6;
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
		border: 1px solid #E2E8F0;
		color: #64748b;
		font-size: 13px;
		font-weight: 500;
		text-decoration: none !important;
		z-index: 10;
		transition: all 0.15s;
	}
	.back-home:hover {
		background: #FFFFFF;
		border-color: #4F46E5;
		color: #4F46E5;
		box-shadow: 0 2px 8px rgba(79,70,229,0.12);
	}
	.back-home svg {
		flex-shrink: 0;
	}
</style>
