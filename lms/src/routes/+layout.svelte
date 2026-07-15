<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { user } from '$lib/stores/user.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { gamification } from '$lib/stores/gamification.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import 'katex/dist/katex.min.css';
	import { t, toggleLang, getLang } from '$lib/stores/i18n.svelte';
	import { initShortcuts, destroyShortcuts, onShortcut } from '$lib/stores/shortcuts.svelte';
	import ShortcutHelp from '$lib/components/ShortcutHelp.svelte';
	import OnboardingOverlay from '$lib/components/OnboardingOverlay.svelte';
	import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';

	const navSections = [
		{ name: 'belajar', icon: '📚', label: 'Belajar', links: [
			{ href: '/', icon: '🏠', label: 'Home' },
			{ href: '/dashboard', icon: '📊', label: 'Dashboard' },
			{ href: '/catalog', icon: '📋', label: 'Katalog' },
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
			{ href: '/my/dashboard', icon: '📊', label: 'My Dashboard' },
			{ href: '/my/grades', icon: '📝', label: 'My Grades' },
			{ href: '/my/profile', icon: '👤', label: 'My Profile' },
			{ href: '/my/announcements', icon: '📢', label: 'My Announcements' },
			{ href: '/my/planner', icon: '📅', label: 'Planner' },
			{ href: '/my/certificates', icon: '🎓', label: 'My Certificates' },
			{ href: '/history', icon: '📜', label: 'History' },
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

	// Register service worker for PWA offline support
	$effect(() => {
		if (!browser) return;
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js');
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
	<meta name="theme-color" content="#0f1011" />
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

<ConfirmDialog />

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.hamburger {
		display: none;
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 100;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		padding: 8px;
		cursor: pointer;
		flex-direction: column;
		gap: 4px;
	}

	.hamburger-line {
		width: 20px;
		height: 2px;
		background: #d0d6e0;
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
		background: #0f1011;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 20px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 590;
		color: #f7f8f8 !important;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.24px;
	}

	.logo-icon {
		font-size: 22px;
	}

	.logo-text {
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sidebar-nav {
		flex: 1;
		padding: 8px 6px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.sidebar-nav a {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 6px;
		color: #8a8f98;
		font-size: 14px;
		font-weight: 510;
		transition: all 0.15s ease;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
	}

	.sidebar-nav a:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}

	.sidebar-nav a.active {
		background: rgba(94, 106, 210, 0.12);
		color: #7170ff;
	}

	.sidebar-separator {
		height: 1px;
		background: rgba(255, 255, 255, 0.05);
		margin: 6px 10px;
	}

	.section-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: #62666d;
		font-size: 11px;
		font-weight: 510;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		margin-top: 2px;
		font-feature-settings: 'cv01', 'ss03';
	}
	.section-toggle:hover { background: rgba(255, 255, 255, 0.04); color: #d0d6e0; }
	.section-toggle-icon { font-size: 13px; width: 20px; text-align: center; }
	.section-toggle-label { flex: 1; text-align: left; }
	.section-toggle-arrow {
		font-size: 10px;
		transition: transform 0.2s ease;
		color: #62666d;
	}
	.section-toggle-arrow.rotated { transform: rotate(180deg); }

	.sidebar-group-label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px 4px;
		font-size: 11px;
		font-weight: 510;
		color: #62666d;
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
		padding: 8px 10px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: transparent;
		color: #8a8f98;
		font-size: 13px;
		font-weight: 510;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		font-feature-settings: 'cv01', 'ss03';
	}

	.theme-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}

	.logout-btn, .login-btn {
		display: block;
		text-align: center;
		padding: 8px 10px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 510;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
	}

	.sidebar-xp {
		padding: 8px 10px;
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
		font-weight: 590;
		color: #7170ff;
	}

	.xp-amount {
		font-size: 11px;
		color: #8a8f98;
	}

	.xp-bar {
		height: 4px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 2px;
		overflow: hidden;
	}

	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #5e6ad2, #7170ff);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.logout-btn {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.06);
		color: #8a8f98;
	}

	.logout-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #ef4444;
		border-color: rgba(239, 68, 68, 0.2);
	}

	.login-btn {
		background: #5e6ad2;
		color: #ffffff;
		border: none;
	}

	.login-btn:hover {
		background: #7170ff;
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
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.02);
		color: #f7f8f8;
		outline: none;
		transition: border-color 0.15s ease;
		font-feature-settings: 'cv01', 'ss03';
	}

	.sidebar-search-input:focus {
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}

	.sidebar-search-input::placeholder {
		color: #8a8f98;
		opacity: 0.6;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		padding: 24px 32px;
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
		background: #191a1b;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 510;
		color: #f7f8f8;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
		border: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 20px;
		font-weight: 590;
		line-height: 1;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-to-top:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-2px);
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
