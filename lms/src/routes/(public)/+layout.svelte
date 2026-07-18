<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#0a0b0c" />
</svelte:head>

<div class="layout">
	<nav class="topbar">
		<a href="/" class="logo">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #5e6ad2; flex-shrink: 0;">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
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
		background: linear-gradient(135deg, #5e6ad2, #5e6ad2);
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
		background: linear-gradient(135deg, #5e6ad2, #5e6ad2);
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
