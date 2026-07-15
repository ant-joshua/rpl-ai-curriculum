<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#0f1011" />
</svelte:head>

<div class="layout">
	<nav class="topbar">
		<a href="/" class="logo">
			<span class="logo-icon">📘</span>
			<span class="logo-text">RPL AI</span>
		</a>
		<div class="topbar-actions">
			<a href="/login" class="login-btn">Login</a>
		</div>
	</nav>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg, #0a0b0c);
		color: var(--text, #f7f8f8);
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
		background: rgba(10, 11, 12, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 600;
		color: #f7f8f8;
		text-decoration: none;
		letter-spacing: -0.24px;
	}

	.logo-icon { font-size: 20px; }

	.logo-text {
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.login-btn {
		padding: 8px 20px;
		border-radius: 8px;
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		color: #fff;
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
		max-width: 960px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	@media (max-width: 640px) {
		.topbar { padding: 0 16px; }
		.content { padding: 20px 16px; }
	}
</style>
