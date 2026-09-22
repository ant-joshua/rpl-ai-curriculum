<script lang="ts">
	import { Button } from '$lib/components/ui';
	let { children } = $props();
	let mobileNavOpen = $state(false);
</script>

<svelte:head>
	<meta name="theme-color" content="var(--bg)" />
</svelte:head>

<div class="layout">
	<nav class="topbar">
		<a href="/" class="logo">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent); flex-shrink: 0;">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
			<span class="logo-text">RPL AI</span>
		</a>
		<Button class="mobile-hamburger" variant="ghost" onclick={() => mobileNavOpen = !mobileNavOpen} aria-label="Toggle menu">
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</Button>
		<nav class="topbar-nav" aria-label="Main navigation">
			<a href="/catalog">Modul</a>
			<a href="/path">Path</a>
			<a href="/ai">AI Tutor</a>
			<a href="/feed">Blog</a>
		</nav>
		<div class="topbar-actions">
			<a href="/login" class="login-link">Login</a>
			<a href="/register" class="login-btn">Daftar Gratis</a>
		</div>
	</nav>

	{#if mobileNavOpen}
		<div class="mobile-nav-overlay" onclick={() => mobileNavOpen = false}></div>
		<div class="mobile-nav-panel">
			<a href="/catalog" onclick={() => mobileNavOpen = false}>📚 Modul</a>
			<a href="/path" onclick={() => mobileNavOpen = false}>🗺️ Path</a>
			<a href="/ai" onclick={() => mobileNavOpen = false}>🤖 AI Tutor</a>
			<a href="/feed" onclick={() => mobileNavOpen = false}>📝 Blog</a>
			<hr class="mobile-nav-divider" />
			<a href="/login" class="mobile-nav-login" onclick={() => mobileNavOpen = false}>Login</a>
			<a href="/register" class="mobile-nav-cta" onclick={() => mobileNavOpen = false}>Daftar Gratis</a>
		</div>
	{/if}

	<main class="content">
		<div class="public-container">
			{@render children()}
		</div>
	</main>
</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg, var(--bg));
		color: var(--text, var(--text));
		/* Force light theme on public pages */
		--bg: var(--bg) !important;
		--surface: var(--surface) !important;
		--text: var(--text) !important;
		--text-secondary: var(--text-secondary) !important;
		--text-muted: var(--text-muted) !important;
		--border: var(--border) !important;
		--accent: var(--accent) !important;
		--accent-hover: var(--accent-hover) !important;
		--success: var(--success) !important;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		height: 56px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border, var(--border));
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.24px;
	}

	.logo-icon { font-size: 20px; }

	.logo-text {
		background: var(--accent);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.topbar-nav {
		display: flex;
		align-items: center;
		gap: 26px;
	}

	.topbar-nav a {
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.topbar-nav a:hover {
		color: var(--accent);
	}

	.login-link {
		padding: 8px 16px;
		border-radius: 8px;
		color: var(--accent);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: background 0.15s ease;
	}

	.login-link:hover {
		background: var(--accent-light);
	}

	.login-btn {
		padding: 8px 20px;
		border-radius: 8px;
		background: var(--accent);
		color: white;
		font-size: 14px;
		font-weight: 590;
		text-decoration: none;
		transition: opacity 0.15s ease;
		cursor: pointer;
		border: none;
		font-family: inherit;
	}

	.login-btn:hover {
		opacity: 0.85;
	}

	.content {
		flex: 1;
		width: 100%;
		margin: 0 auto;
		padding: 0;
	}

	.public-container {
		max-width: 1180px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	@media (max-width: 640px) {
		.topbar { padding: 0 16px; }
		.topbar-nav { display: none; }
		.topbar-actions { display: none; }
		.content { padding: 20px 16px; }

		.mobile-hamburger {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 8px;
			background: none;
			border: none;
			cursor: pointer;
		}
		.hamburger-line {
			display: block;
			width: 20px;
			height: 2px;
			background: var(--text);
			border-radius: 2px;
		}
	}

	/* Mobile nav panel */
	.mobile-hamburger {
		display: none;
	}

	.mobile-nav-overlay {
		display: none;
	}

	.mobile-nav-panel {
		display: none;
	}

	@media (max-width: 640px) {
		.mobile-nav-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(26, 26, 46, 0.6);
			z-index: 90;
		}
		.mobile-nav-panel {
			display: flex;
			flex-direction: column;
			position: fixed;
			top: 56px;
			left: 0;
			right: 0;
			background: var(--surface, white);
			border-bottom: 1px solid var(--border);
			padding: 12px 16px;
			z-index: 91;
			box-shadow: none;
			gap: 4px;
		}
		.mobile-nav-panel a {
			display: block;
			padding: 12px 14px;
			border-radius: 8px;
			font-size: 15px;
			font-weight: 500;
			color: var(--text, #1a1a2e);
			text-decoration: none;
			transition: background 0.15s;
		}
		.mobile-nav-panel a:hover {
			background: rgba(0,0,0,0.04);
		}
		.mobile-nav-divider {
			border: none;
			border-top: 1px solid var(--border);
			margin: 6px 0;
		}
		.mobile-nav-login {
			color: var(--accent) !important;
			font-weight: 600 !important;
		}
		.mobile-nav-cta {
			background: var(--accent) !important;
			color: white !important;
			text-align: center;
			font-weight: 600 !important;
			border-radius: 8px !important;
			padding: 12px 20px !important;
		}
	}
</style>
