<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let sidebarOpen = $state(false);

	let currentPath = $derived($page.url.pathname);

	function isActive(path: string): boolean {
		return currentPath === path || currentPath.startsWith(path + '/');
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<button class="hamburger" onclick={toggleSidebar} aria-label="Toggle navigasi">
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
</button>

{#if sidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="sidebar-overlay" onclick={closeSidebar} role="button" tabindex="-1"></div>
{/if}

<aside class="sidebar" class:sidebar--open={sidebarOpen}>
	<div class="sidebar-header">
		<a href="/" class="sidebar-logo" onclick={closeSidebar}>
			<span class="logo-icon">📘</span>
			<span class="logo-text">RPL AI</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		<a href="/" onclick={closeSidebar} class:active={isActive('/')}>
			<span class="nav-icon">🏠</span>
			<span>Beranda</span>
		</a>
		<a href="/dashboard" onclick={closeSidebar} class:active={isActive('/dashboard')}>
			<span class="nav-icon">📊</span>
			<span>Dashboard</span>
		</a>
		<a href="/progress" onclick={closeSidebar} class:active={isActive('/progress')}>
			<span class="nav-icon">📈</span>
			<span>Progres</span>
		</a>
	</nav>

	<div class="sidebar-footer">
		{#if user.isLoggedIn}
			<div class="user-info">
				<span class="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
				<span class="user-name">{user.username}</span>
			</div>
			<button onclick={() => { user.logout(); closeSidebar(); }} class="logout-btn">
				Keluar
			</button>
		{:else}
			<a href="/login" onclick={closeSidebar} class="login-btn">
				Masuk
			</a>
		{/if}
	</div>
</aside>

<main class="main-content">
	{@render children()}
</main>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: var(--bg);
		color: var(--text);
		line-height: 1.6;
		min-height: 100vh;
	}

	:global(a) {
		color: var(--accent);
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: var(--bg-secondary);
	}

	:global(::-webkit-scrollbar-thumb) {
		background: var(--border);
		border-radius: 3px;
	}

	.hamburger {
		display: none;
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 100;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 8px;
		cursor: pointer;
		flex-direction: column;
		gap: 4px;
	}

	.hamburger-line {
		width: 20px;
		height: 2px;
		background: var(--text);
		border-radius: 1px;
	}

	.sidebar-overlay {
		display: none;
	}

	.sidebar {
		width: 240px;
		min-width: 240px;
		height: 100vh;
		position: sticky;
		top: 0;
		background: var(--surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 20px 16px;
		border-bottom: 1px solid var(--border);
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: 700;
		color: var(--text) !important;
		text-decoration: none !important;
	}

	.logo-icon {
		font-size: 24px;
	}

	.logo-text {
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sidebar-nav {
		flex: 1;
		padding: 12px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sidebar-nav a {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		transition: all 0.15s ease;
		text-decoration: none !important;
	}

	.sidebar-nav a:hover {
		background: var(--hover);
		color: var(--text);
	}

	.sidebar-nav a.active {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.nav-icon {
		font-size: 18px;
		width: 24px;
		text-align: center;
	}

	.sidebar-footer {
		padding: 12px 8px;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 600;
	}

	.user-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--text);
	}

	.logout-btn, .login-btn {
		display: block;
		text-align: center;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none !important;
	}

	.logout-btn {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}

	.logout-btn:hover {
		background: var(--hover);
		color: var(--danger);
		border-color: var(--danger);
	}

	.login-btn {
		background: var(--accent);
		color: #fff;
	}

	.login-btn:hover {
		opacity: 0.9;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		padding: 24px 32px;
		max-width: 100%;
	}

	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: -280px;
			z-index: 200;
			transition: left 0.25s ease;
			box-shadow: 4px 0 20px rgba(0,0,0,0.3);
		}

		.sidebar.sidebar--open {
			left: 0;
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.5);
			z-index: 150;
		}

		.main-content {
			padding: 16px;
			padding-top: 60px;
		}
	}
</style>
