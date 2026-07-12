<script lang="ts">
	import { fly } from 'svelte/transition';
	import { user } from '$lib/stores/user.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { children } = $props();

	let sidebarOpen = $state(false);
	let offline = $state(false);
	let showBackToTop = $state(false);
	let dismissedOffline = $state(false);

	function closeSidebar() {
		sidebarOpen = false;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function isActive(path: string) {
		return $page.url.pathname === path;
	}

	if (browser) {
		offline = !navigator.onLine;
	}

	$effect(() => {
		if (!browser) return;

		function onOnline() { offline = false; dismissedOffline = false; }
		function onOffline() { offline = true; dismissedOffline = false; }

		window.addEventListener('online', onOnline);
		window.addEventListener('offline', onOffline);

		return () => {
			window.removeEventListener('online', onOnline);
			window.removeEventListener('offline', onOffline);
		};
	});

	$effect(() => {
		if (!browser) return;

		function onScroll() {
			showBackToTop = window.scrollY > 300;
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#6c5ce7" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<link rel="alternate" type="application/rss+xml" title="RPL AI Curriculum RSS" href="/feed.xml" />
	<link rel="alternate" type="application/feed+json" title="RPL AI Curriculum JSON Feed" href="/feed.json" />
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

<div class="layout-body">
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
			<a href="/path" onclick={closeSidebar} class:active={isActive('/path')}>
				<span class="nav-icon">📚</span>
				<span>Learning Paths</span>
			</a>
			<a href="/progress" onclick={closeSidebar} class:active={isActive('/progress')}>
				<span class="nav-icon">📈</span>
				<span>Progres</span>
			</a>
			<a href="/search" onclick={closeSidebar} class:active={isActive('/search')}>
				<span class="nav-icon">🔍</span>
				<span>Cari</span>
			</a>
			<a href="/tutor" onclick={closeSidebar} class:active={isActive('/tutor')}>
				<span class="nav-icon">🤖</span>
				<span>AI Tutor</span>
			</a>
			<a href="/flashcards" onclick={closeSidebar} class:active={isActive('/flashcards')}>
				<span class="nav-icon">🃏</span>
				<span>Flashcards</span>
			</a>
			<a href="/history" onclick={closeSidebar} class:active={isActive('/history')}>
				<span class="nav-icon">📜</span>
				<span>Riwayat</span>
			</a>
			<a href="/certificate" onclick={closeSidebar} class:active={isActive('/certificate')}>
				<span class="nav-icon">🎓</span>
				<span>Sertifikat</span>
			</a>
			<div class="sidebar-separator"></div>
			<div class="sidebar-group-label">📚 Referensi</div>
			<a href="/challenges" onclick={closeSidebar}>
				<span class="nav-icon">🏋️</span>
				<span>Challenges</span>
			</a>
			<a href="/glossary" onclick={closeSidebar}>
				<span class="nav-icon">📖</span>
				<span>Glossary</span>
			</a>
			<a href="/cheatsheets" onclick={closeSidebar}>
				<span class="nav-icon">📝</span>
				<span>Cheatsheets</span>
			</a>
			<a href="/resources" onclick={closeSidebar}>
				<span class="nav-icon">📥</span>
				<span>PDF</span>
			</a>
			<a href="/case-studies" onclick={closeSidebar} class:active={isActive('/case-studies')}>
				<span class="nav-icon">📋</span>
				<span>Case Studies</span>
			</a>
			<a href="/mini-projects" onclick={closeSidebar}>
				<span class="nav-icon">🔨</span>
				<span>Mini Projects</span>
			</a>
			<a href="/videos" onclick={closeSidebar} class:active={isActive('/videos')}>
				<span class="nav-icon">🎬</span>
				<span>Video</span>
			</a>
			<a href="/feed" onclick={closeSidebar} class:active={isActive('/feed')}>
				<span class="nav-icon">📡</span>
				<span>RSS</span>
			</a>
			<a href="/slides/list" onclick={closeSidebar} class:active={isActive('/slides')}>
				<span class="nav-icon">🖥️</span>
				<span>Slides</span>
			</a>
		</nav>

		<div class="sidebar-footer">
			{#if !user.isLoggedIn}
				<a href="/login" class="login-btn" onclick={closeSidebar}>🔑 Login / Daftar</a>
			{/if}
			<button onclick={() => { themeStore.toggle(); closeSidebar(); }} class="theme-btn">
				<span class="nav-icon">{themeStore.theme === 'dark' ? '☀️' : '🌙'}</span>
				<span>{themeStore.theme === 'dark' ? 'Terang' : 'Gelap'}</span>
			</button>
		</div>
	</aside>

	<main class="main-content">
		{@render children()}
	</main>
</div>

{#if offline && !dismissedOffline}
	<div class="offline-badge" transition:fly={{ y: 20, duration: 300 }}>
		<span>🔴 Luring</span>
		<button class="offline-dismiss" onclick={() => dismissedOffline = true}>✕</button>
	</div>
{/if}

{#if showBackToTop}
	<button class="back-to-top" onclick={scrollToTop} aria-label="Kembali ke atas">↑</button>
{/if}

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

	.layout-body {
		display: flex;
		min-height: 100vh;
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

	.sidebar-separator {
		height: 1px;
		background: var(--border);
		margin: 8px 12px;
	}

	.sidebar-group-label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px 4px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	.theme-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
	}

	.theme-btn:hover {
		background: var(--hover);
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
		padding: 20px 24px;
		max-width: 100%;
	}

	.offline-badge {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--surface, #1e1e2e);
		border: 1px solid var(--danger, #e74c3c);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text, #e0e0e0);
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
	}

	.offline-dismiss {
		background: none;
		border: none;
		color: var(--text-secondary, #888);
		cursor: pointer;
		font-size: 14px;
		padding: 0 2px;
		line-height: 1;
	}

	.offline-dismiss:hover {
		color: var(--text, #e0e0e0);
	}

	.back-to-top {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 9999;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent, #6c5ce7);
		color: #fff;
		border: none;
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-to-top:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(108, 92, 231, 0.5);
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
