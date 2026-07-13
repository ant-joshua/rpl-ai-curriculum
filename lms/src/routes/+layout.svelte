<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { user } from '$lib/stores/user.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { gamification } from '$lib/stores/gamification.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { t, toggleLang, getLang } from '$lib/stores/i18n.svelte';
	import { initShortcuts, destroyShortcuts, onShortcut } from '$lib/stores/shortcuts.svelte';
	import ShortcutHelp from '$lib/components/ShortcutHelp.svelte';
	import OnboardingOverlay from '$lib/components/OnboardingOverlay.svelte';
	import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';

	const navSections = [
		{ name: 'belajar', icon: '📚', label: 'Belajar', links: [
			{ href: '/', icon: '🏠', label: 'Home' },
			{ href: '/dashboard', icon: '📊', label: 'Dashboard' },
			{ href: '/path', icon: '🗺️', label: 'Path' },
			{ href: '/progress', icon: '📈', label: 'Progress' },
			{ href: '/search', icon: '🔍', label: 'Search' },
		]},
		{ name: 'tools', icon: '🛠️', label: 'Tools', links: [
			{ href: '/tutor', icon: '🤖', label: 'AI Tutor' },
			{ href: '/flashcards', icon: '🃏', label: 'Flashcards' },
			{ href: '/exercises', icon: '🏋️', label: 'Exercises' },
			{ href: '/projects', icon: '🚀', label: 'Project Studio' },
			{ href: '/quiz', icon: '📝', label: 'Quiz' },
			{ href: '/capstone', icon: '🎓', label: 'Capstone' },
		]},
		{ name: 'social', icon: '👥', label: 'Social', links: [
			{ href: '/groups', icon: '👥', label: 'Groups' },
			{ href: '/mentorship', icon: '🎯', label: 'Mentorship' },
			{ href: '/reviews', icon: '🔍', label: 'Peer Review' },
			{ href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
			{ href: '/badges', icon: '🏆', label: 'Badges' },
		]},
		{ name: 'referensi', icon: '📖', label: 'Referensi', links: [
			{ href: '/videos', icon: '🎬', label: 'Videos' },
			{ href: '/resources', icon: '📥', label: 'PDF' },
			{ href: '/cheatsheets', icon: '📝', label: 'Cheatsheets' },
			{ href: '/glossary', icon: '📖', label: 'Glossary' },
			{ href: '/case-studies', icon: '📋', label: 'Case Studies' },
			{ href: '/slides/list', icon: '🖥️', label: 'Slides' },
			{ href: '/mini-projects', icon: '🔨', label: 'Mini Projects' },
		]},
		{ name: 'akun', icon: '👤', label: 'Akun', links: [
			{ href: '/profile', icon: '👤', label: 'Profile' },
			{ href: '/planner', icon: '📅', label: 'Planner' },
			{ href: '/certificate', icon: '🎓', label: 'Certificate' },
			{ href: '/history', icon: '📜', label: 'History' },
			{ href: '/announcements', icon: '📢', label: 'Announcements' },
			{ href: '/export', icon: '📤', label: 'Export' },
			{ href: '/feed', icon: '📡', label: 'RSS' },
		]},
	] as const;

	let { children } = $props();

	let sidebarOpen = $state(false);
	let offline = $state(false);
	let showBackToTop = $state(false);
	let dismissedOffline = $state(false);
	let showShortcuts = $state(false);
	let sidebarSection = $state<Record<string, boolean>>({});

	function toggleSection(name: string) {
		sidebarSection[name] = !sidebarSection[name];
	}
	function sectionOpen(name: string) {
		return sidebarSection[name] !== false;
	}

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

	// Handle OAuth callback redirect — parse token from URL
	$effect(() => {
		if (!browser) return;
		const params = new URLSearchParams(window.location.search);
		const token = params.get('oauth_token');
		const userJson = params.get('oauth_user');
		if (token && userJson) {
			try {
				const oauthUser = JSON.parse(decodeURIComponent(userJson));
				auth.setSession(token, oauthUser);
				// Clean URL and redirect to dashboard
				window.history.replaceState({}, '', '/');
				// Also set legacy user store for backward compat
				if (oauthUser.name) {
					user.username = oauthUser.name;
				}
				setTimeout(() => {
					window.location.href = '/dashboard';
				}, 50);
			} catch {
				// ignore bad parse
			}
		}
	});

	// Validate stored session on app load
	$effect(() => {
		if (!browser) return;
		if (auth.authToken && !auth.authUser) {
			auth.validateSession();
		}
	});

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

	// Keyboard shortcuts
	$effect(() => {
		if (!browser) return;
		initShortcuts();
		const unsub = onShortcut((action) => {
			if (action === 'showHelp') {
				showShortcuts = true;
			}
		});
		return () => {
			unsub();
			destroyShortcuts();
		};
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Scroll to top on route change
	$effect(() => {
		if (!browser) return;
		$page.url.pathname;
		window.scrollTo({ top: 0, behavior: 'instant' });
	});
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
			<div class="sidebar-search">
				<span class="sidebar-search-icon">🔍</span>
				<input
					type="text"
					class="sidebar-search-input"
					placeholder="Cari..."
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							const target = e.target as HTMLInputElement;
							const q = target.value.trim();
							if (q) {
								import('$app/navigation').then(mod => mod.goto('/search?q=' + encodeURIComponent(q)));
								closeSidebar();
							}
						}
					}}
					aria-label="Cari"
				/>
			</div>
		</div>

		<nav class="sidebar-nav">
			{#each navSections as section}
				<button class="section-toggle" onclick={() => toggleSection(section.name)}>
					<span class="section-toggle-icon">{section.icon}</span>
					<span class="section-toggle-label">{section.label}</span>
					<span class="section-toggle-arrow" class:rotated={sidebarSection[section.name] !== false}>▾</span>
				</button>
				{#if sidebarSection[section.name] !== false}
					{#each section.links as link}
						<a href={link.href} onclick={closeSidebar} class:active={isActive(link.href)}>
							<span class="nav-icon">{link.icon}</span>
							<span class="nav-label">{link.label}</span>
						</a>
					{/each}
				{/if}
			{/each}
		</nav>

		<div class="sidebar-footer">
			{#if browser}
				{@const lvl = gamification.getLevelProgress()}
				<div class="sidebar-xp">
					<div class="xp-header">
						<span class="xp-level">Level {lvl.level}</span>
						<span class="xp-amount">{lvl.currentXp}/{lvl.currentXp + lvl.xpToNext} XP</span>
					</div>
					<div class="xp-bar">
						<div class="xp-bar-fill" style="width: {(lvl.level > 1 ? (lvl.currentXp / (lvl.currentXp + lvl.xpToNext)) : (lvl.currentXp / 100)) * 100}%"></div>
					</div>
				</div>
			{/if}
			{#if !user.isLoggedIn}
				<a href="/login" class="login-btn" onclick={closeSidebar}>🔑 Login / Daftar</a>
			{:else}
				<div class="sidebar-user-section">
					<NotificationBell />
				</div>
				<button onclick={() => { user.logout(); closeSidebar(); addToast('Logout berhasil', 'info'); }} class="logout-btn">🔓 Logout</button>
			{/if}
			<button onclick={() => { toggleLang(); closeSidebar(); }} class="theme-btn">
				<span class="nav-icon">🌐</span>
				<span>{getLang() === 'id' ? 'Indonesia' : 'English'}</span>
			</button>
			<button onclick={() => { themeStore.toggle(); closeSidebar(); }} class="theme-btn">
				<span class="nav-icon">{themeStore.theme === 'dark' ? '🌙' : '☀️'}</span>
				<span>{themeStore.theme === 'dark' ? 'Gelap' : 'Terang'}</span>
			</button>
		</div>
	</aside>

	<main class="main-content animate-in">
		{#key $page.url.pathname}
			<div in:fade={{ duration: 150 }}>
				{@render children()}
			</div>
		{/key}
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

<PWAInstallPrompt />

<ShortcutHelp show={showShortcuts} onclose={() => showShortcuts = false} />

<OnboardingOverlay />

<div class="toast-container">
	<Toast />
</div>

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

	.section-toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		margin-top: 4px;
	}
	.section-toggle:hover { background: var(--hover); color: var(--text); }
	.section-toggle-icon { font-size: 14px; width: 20px; text-align: center; }
	.section-toggle-label { flex: 1; text-align: left; }
	.section-toggle-arrow {
		font-size: 10px;
		transition: transform 0.2s ease;
		color: var(--muted);
	}
	.section-toggle-arrow.rotated { transform: rotate(180deg); }

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

	.sidebar-xp {
		padding: 8px 12px;
		margin-bottom: 4px;
	}

	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.xp-level {
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
	}

	.xp-amount {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.xp-bar {
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		overflow: hidden;
	}

	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 3px;
		transition: width 0.3s ease;
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

	/* Sidebar search */
	.sidebar-search {
		position: relative;
		margin-top: 10px;
	}

	.sidebar-search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 13px;
		opacity: 0.5;
		pointer-events: none;
	}

	.sidebar-search-input {
		width: 100%;
		padding: 7px 10px 7px 30px;
		font-size: 13px;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		outline: none;
		transition: border-color 0.15s ease;
	}

	.sidebar-search-input:focus {
		border-color: var(--accent);
	}

	.sidebar-search-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
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

	.toast-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}
	.toast-container > * {
		pointer-events: auto;
	}

	@media (max-width: 768px) {
		.hamburger {
			display: flex;
			min-width: 44px;
			min-height: 44px;
			align-items: center;
			justify-content: center;
		}

		.sidebar {
			position: fixed;
			left: 0;
			top: 0;
			height: 100vh;
			width: 260px;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
			z-index: 200;
			box-shadow: 4px 0 20px rgba(0,0,0,0.3);
		}

		.sidebar.sidebar--open {
			transform: translateX(0);
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.5);
			backdrop-filter: blur(4px);
			-webkit-backdrop-filter: blur(4px);
			z-index: 150;
		}

		.main-content {
			padding: 16px;
			padding-top: 60px;
			width: 100%;
			max-width: 100%;
		}
	}
</style>
