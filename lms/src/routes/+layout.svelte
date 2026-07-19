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
	import Icon from '$lib/components/ui/Icon.svelte';
	import NotificationToast from '$lib/components/ui/NotificationToast.svelte';
	import { startPolling, stopPolling, getSnapshot, subscribe } from '$lib/stores/notifications.svelte';
	import AchievementToast from '$lib/components/toast/AchievementToast.svelte';

	const navSections = $derived.by(() => [
		{
			name: 'Main Nav',
			links: [
				{ href: '/', icon: 'home', label: t('nav.dashboard') },
				{ href: '/catalog', icon: 'book', label: t('nav.courses') },
				{ href: '/planner', icon: 'calendar', label: t('nav.calendar') },
				{ href: '/announcements', icon: 'message-square', label: t('nav.messages') },
			]
		},
		{
			name: 'Learning',
			links: [
				{ href: '/catalog', icon: 'compass', label: t('nav.catalog') },
				{ href: '/path', icon: 'map-pin', label: t('nav.paths') },
				{ href: '/progress', icon: 'trending-up', label: t('nav.progress') },
			]
		},
		{
			name: 'Tools',
			links: [
				{ href: '/tutor', icon: 'robot', label: t('nav.tutor') },
				{ href: '/flashcards', icon: 'layers', label: t('nav.flashcards') },
				{ href: '/exercises', icon: 'dumbbell', label: t('nav.exercises') },
				{ href: '/projects', icon: 'rocket', label: t('nav.projects') },
			]
		},
		{
			name: 'Account',
			links: [
				{ href: '/my/profile', icon: 'user', label: t('nav.profile') },
				{ href: '/my/grades', icon: 'file-text', label: t('nav.grades') },
				{ href: '/my/certificates', icon: 'award', label: t('nav.certificate') },
				{ href: '/my/settings', icon: 'settings', label: t('nav.settings') },
			]
		},
	]);

	let { children } = $props();

	let sidebarOpen = $state(false);
	let offline = $state(false);
	let showBackToTop = $state(false);
	let dismissedOffline = $state(false);
	let showShortcuts = $state(false);

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
				window.history.replaceState({}, '', '/');
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

	// Start notification polling
	$effect(() => {
		if (!browser) return;
		startPolling(30000);
		return () => stopPolling();
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

	const isMinimalRoute = $derived(
		$page.route.id?.startsWith('/(auth)') ||
		$page.route.id?.startsWith('/(public)') ||
		false
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#FFFFFF" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<link rel="alternate" type="application/rss+xml" title="RPL AI Curriculum RSS" href="/feed.xml" />
	<link rel="alternate" type="application/feed+json" title="RPL AI Curriculum JSON Feed" href="/feed.json" />
	<!-- SEO meta -->
	<meta name="description" content="RPL AI Curriculum — Platform pembelajaran AI untuk program Rekayasa Perangkat Lunak. Kursus interaktif, latihan, dan sertifikasi." />
	<meta property="og:title" content="RPL AI Curriculum" />
	<meta property="og:description" content="Platform pembelajaran AI untuk Rekayasa Perangkat Lunak." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://{typeof $page !== 'undefined' ? $page.url.host : 'rpl-ai-curriculum.pages.dev'}/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="RPL AI Curriculum" />
	<meta name="twitter:description" content="Platform pembelajaran AI untuk Rekayasa Perangkat Lunak." />
</svelte:head>

<!-- Mobile hamburger -->
{#if !isMinimalRoute}
<button class="hamburger" onclick={toggleSidebar} aria-label="Toggle navigation">
	<Icon name="menu" size={20} />
</button>

<!-- Sidebar overlay (mobile) -->
{#if sidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="sidebar-overlay" onclick={closeSidebar} role="button" tabindex="-1"></div>
{/if}

<div class="layout-body">
	<aside class="sidebar" class:sidebar--open={sidebarOpen}>
		<!-- Logo + Search -->
		<div class="sidebar-header">
			<a href="/" class="sidebar-logo" onclick={closeSidebar}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-svg">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				</svg>
				<span class="logo-text">RPL AI</span>
			</a>
			<div class="sidebar-search">
				<Icon name="search" size={14} class="sidebar-search-icon" />
				<input
					type="text"
					class="sidebar-search-input"
					placeholder="Search..."
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
					aria-label="Search"
				/>
				<span class="search-hint">⌘K</span>
			</div>
		</div>

		<!-- Navigation sections -->
		<nav class="sidebar-nav">
			{#each navSections as section}
				<div class="nav-section">
					<span class="nav-section-label">{section.name}</span>
					{#each section.links as link}
						<a
							href={link.href}
							onclick={closeSidebar}
							class="nav-item"
							class:active={isActive(link.href)}
						>
							<Icon name={link.icon} size={18} />
							<span class="nav-item-label">{link.label}</span>
							{#if isActive(link.href)}
								<span class="nav-active-indicator"></span>
							{/if}
						</a>
					{/each}
				</div>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="sidebar-footer">
			<!-- XP bar -->
			{#if browser}
				{@const lvl = gamification.getLevelProgress()}
				<div class="sidebar-xp">
					<div class="xp-bar-track">
						<div class="xp-bar-fill" style="width: {(lvl.level > 1 ? (lvl.currentXp / (lvl.currentXp + lvl.xpToNext)) : (lvl.currentXp / 100)) * 100}%"></div>
					</div>
					<div class="xp-row">
						<span class="xp-level-badge">Lv.{lvl.level}</span>
						{#if gamification.computeStats().streak > 0}
							<span class="xp-streak">🔥 {gamification.computeStats().streak}</span>
						{/if}
						<span class="xp-amount">{lvl.currentXp}/{lvl.currentXp + lvl.xpToNext}</span>
					</div>
				</div>
			{/if}

			<!-- User section -->
			{#if auth.isLoggedIn && auth.authUser}
				<div class="user-section">
					<div class="user-avatar">
						{#if auth.authUser.avatar}
							<img src={auth.authUser.avatar} alt={auth.authUser.name} class="user-avatar-img" />
						{:else}
							<span class="user-avatar-text">{(auth.authUser.name || 'U')[0].toUpperCase()}</span>
						{/if}
					</div>
					<div class="user-info">
						<span class="user-name">{auth.authUser.name || 'User'}</span>
						<span class="user-xp">{gamification.xp} XP</span>
					</div>
				</div>
			{:else if user.isLoggedIn}
				<div class="user-section">
					<div class="user-avatar">
						<span class="user-avatar-text">{(user.username || 'U')[0].toUpperCase()}</span>
					</div>
					<div class="user-info">
						<span class="user-name">{user.username || 'User'}</span>
						<span class="user-xp">{gamification.xp} XP</span>
					</div>
				</div>
			{:else}
				<a href="/login" class="login-btn" onclick={closeSidebar}>
					<Icon name="user-plus" size={16} />
					<span>Login / Register</span>
				</a>
			{/if}

			<!-- Action buttons: lang, theme, logout -->
			<div class="sidebar-actions">
				<button onclick={() => { toggleLang(); closeSidebar(); }} class="sidebar-action-btn" title={getLang() === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}>
					<Icon name="globe" size={16} />
				</button>
				<button onclick={() => { themeStore.toggle(); closeSidebar(); }} class="sidebar-action-btn" title={themeStore.theme === 'dark' ? 'Light mode' : 'Dark mode'}>
					<Icon name={themeStore.theme === 'dark' ? 'sun' : 'moon'} size={16} />
				</button>
				{#if auth.isLoggedIn || user.isLoggedIn}
					<button onclick={() => { auth.logout(); closeSidebar(); addToast('Logout berhasil', 'info'); }} class="sidebar-action-btn sidebar-action-btn--danger" title="Logout">
						<Icon name="log-out" size={16} />
					</button>
				{/if}
			</div>
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
{:else}
	{@render children()}
{/if}

{#if offline && !dismissedOffline}
	<div class="offline-badge" transition:fly={{ y: 20, duration: 300 }}>
		<span class="offline-dot"></span>
		<span>Offline</span>
		<button class="offline-dismiss" onclick={() => dismissedOffline = true}>
			<Icon name="x" size={12} />
		</button>
	</div>
{/if}

{#if showBackToTop}
	<button class="back-to-top" onclick={scrollToTop} aria-label="Back to top">
		<Icon name="chevron-left" size={18} style="transform: rotate(90deg);" />
	</button>
{/if}

<PWAInstallPrompt />

<ShortcutHelp show={showShortcuts} onclose={() => showShortcuts = false} />

<OnboardingOverlay />

<div class="toast-container">
	<Toast />
</div>

<NotificationToast />

<AchievementToast />

<ConfirmDialog />

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:root {
		/* Light mode primary */
		--bg: #F4F7FA;
		--surface: #FFFFFF;
		--surface-alt: #F1F5F9;
		--text: #1a1a2e;
		--text-secondary: #64748b;
		--text-muted: #94a3b8;
		--border: #E2E8F0;
		--border-light: rgba(0,0,0,0.06);
		--accent: #4F46E5;
		--accent-hover: #4338CA;
		--accent-light: rgba(79,70,229,0.08);
		--accent-rgb: 79, 70, 229;
		--success: #22C55E;
		--success-light: rgba(34,197,94,0.1);
		--warning: #F59E0B;
		--danger: #EF4444;
		--danger-light: rgba(239,68,68,0.08);
		--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
		--shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
		--shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
		--shadow-3d: 0 4px 0 #3730A3;
		--shadow-3d-success: 0 4px 0 #15803D;
		--radius: 12px;
		--radius-lg: 16px;
		--radius-sm: 8px;
		--radius-full: 9999px;
	}

	:global(html) {
		background: var(--bg);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: var(--bg);
		color: var(--text);
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	:global(a) {
		color: var(--accent);
		text-decoration: none;
	}
	:global(a:hover) {
		text-decoration: underline;
	}

	:global(button),
	:global(.btn) {
		font-family: inherit;
	}

	:global(.btn-primary),
	:global(button.btn-primary) {
		background: var(--accent);
		color: #fff;
		box-shadow: var(--shadow-3d);
		border: none;
		border-radius: var(--radius-sm);
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		top: 0;
	}
	:global(.btn-primary:hover:not(:disabled)) {
		background: var(--accent-hover);
		top: -1px;
		box-shadow: 0 5px 0 #3730A3;
		transform: scale(1.02);
	}
	:global(.btn-primary:active:not(:disabled)) {
		top: 2px;
		box-shadow: 0 2px 0 #3730A3;
		transform: scale(0.98);
	}
	:global(.btn-primary:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.btn-secondary) {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: var(--shadow-sm);
	}
	:global(.btn-secondary:hover) {
		background: var(--surface-alt);
		border-color: var(--text-muted);
	}

	:global(.btn-success) {
		background: var(--success);
		color: #fff;
		box-shadow: var(--shadow-3d-success);
		border: none;
		border-radius: var(--radius-sm);
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
		top: 0;
	}
	:global(.btn-success:hover:not(:disabled)) {
		top: -1px;
		box-shadow: 0 5px 0 #15803D;
	}
	:global(.btn-success:active:not(:disabled)) {
		top: 2px;
		box-shadow: 0 2px 0 #15803D;
	}

	:global(.card) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		padding: 20px;
		transition: box-shadow 0.15s ease, transform 0.15s ease;
	}
	:global(.card:hover) {
		box-shadow: var(--shadow-lg);
	}

	:global(.card),
	:global(.welcome-card),
	:global(.stat-card),
	:global(.feature-card),
	:global(.step-card),
	:global(.why-card),
	:global(.cta-card) {
		transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease, transform 0.2s ease;
	}

	:global(input),
	:global(textarea),
	:global(select) {
		font-family: inherit;
		font-size: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		padding: 10px 14px;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}
	:global(input:focus),
	:global(textarea:focus),
	:global(select:focus) {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-light);
	}
	:global(input::placeholder),
	:global(textarea::placeholder) {
		color: var(--text-muted);
	}

	/* ===== Hamburger (mobile only) ===== */
	.hamburger {
		display: none;
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 100;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 10px;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.15s ease;
	}
	.hamburger:hover {
		background: var(--surface-alt);
		color: var(--text);
	}

	/* ===== Overlay ===== */
	.sidebar-overlay {
		display: none;
	}

	/* ===== Layout Body ===== */
	.layout-body {
		display: flex;
		min-height: 100vh;
	}

	/* ===== Sidebar ===== */
	.sidebar {
		width: 240px;
		min-width: 240px;
		height: 100vh;
		position: sticky;
		top: 0;
		background: #FFFFFF;
		border-right: 1px solid #E2E8F0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		z-index: 50;
	}

	/* ===== Sidebar Header ===== */
	.sidebar-header {
		padding: 20px 14px 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 590;
		color: #1a1a2e !important;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.24px;
		margin-bottom: 14px;
	}

	.logo-svg {
		color: #4F46E5;
		flex-shrink: 0;
	}

	.logo-text {
		background: linear-gradient(135deg, #4F46E5, #4F46E5);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Search */
	.sidebar-search {
		position: relative;
	}

	.sidebar-search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: #64748b;
		pointer-events: none;
		opacity: 0.6;
	}

	.sidebar-search-input {
		width: 100%;
		padding: 7px 10px 7px 32px;
		font-size: 13px;
		font-family: inherit;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.02);
		color: #1a1a2e;
		outline: none;
		transition: border-color 0.15s ease;
		font-feature-settings: 'cv01', 'ss03';
	}

	.sidebar-search-input:focus {
		border-color: #4F46E5;
		box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
	}

	.sidebar-search-input::placeholder {
		color: #64748b;
		opacity: 0.6;
	}

	.search-hint {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 10px;
		color: #94a3b8;
		background: rgba(255, 255, 255, 0.04);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		pointer-events: none;
		line-height: 1.4;
	}

	/* ===== Navigation ===== */
	.sidebar-nav {
		flex: 1;
		padding: 6px 8px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
	}

	.nav-section {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nav-section-label {
		font-size: 10px;
		font-weight: 510;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 8px 12px 4px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		border-radius: 6px;
		color: #64748b;
		font-size: 13.5px;
		font-weight: 510;
		transition: all 0.15s ease;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		position: relative;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #1a1a2e;
	}

	.nav-item.active {
		background: rgba(79, 70, 229, 0.12);
		color: #4F46E5;
	}

	.nav-item-label {
		flex: 1;
	}

	.nav-active-indicator {
		width: 3px;
		height: 16px;
		background: #4F46E5;
		border-radius: 2px;
		box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
		position: absolute;
		right: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

	/* ===== Sidebar Footer ===== */
	.sidebar-footer {
		padding: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* XP bar */
	.sidebar-xp {
		padding: 6px 8px;
	}

	.xp-bar-track {
		height: 4px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 6px;
	}

	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #22C55E, #16A34A);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.xp-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.xp-streak {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 10px;
		font-weight: 600;
		color: #F59E0B;
		animation: pulse-fire 1.5s ease-in-out infinite;
	}
	@keyframes pulse-fire {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	.xp-level-badge {
		font-size: 11px;
		font-weight: 590;
		color: #22C55E;
		font-feature-settings: 'cv01', 'ss03';
	}

	.xp-amount {
		font-size: 10px;
		color: #64748b;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* User section */
	.user-section {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 6px;
		transition: background 0.15s ease;
	}

	.user-section:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #4F46E5, #4F46E5);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 600;
		flex-shrink: 0;
		overflow: hidden;
		border: 2px solid rgba(255, 255, 255, 0.06);
	}

	.user-avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-avatar-text {
		line-height: 1;
	}

	.user-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.user-name {
		font-size: 13px;
		font-weight: 510;
		color: #1a1a2e;
		font-feature-settings: 'cv01', 'ss03';
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-xp {
		font-size: 11px;
		color: #64748b;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Login button (when not authenticated) */
	.login-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 510;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		color: #64748b;
	}

	.login-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #1a1a2e;
	}

	/* Action buttons row */
	.sidebar-actions {
		display: flex;
		gap: 4px;
		padding: 4px 4px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.04);
	}

	.sidebar-action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 7px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.sidebar-action-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #1a1a2e;
	}

	.sidebar-action-btn--danger:hover {
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	/* ===== Main Content ===== */
	.main-content {
		flex: 1;
		min-width: 0;
		padding: 24px 32px 40px;
		max-width: 100%;
		background: var(--bg);
		color: var(--text);
	}

	/* ===== Offline Badge ===== */
	.offline-badge {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--surface);
		border: 1px solid var(--danger);
		border-radius: var(--radius-sm);
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 510;
		color: var(--text);
		box-shadow: var(--shadow-lg);
		font-feature-settings: 'cv01', 'ss03';
	}

	.offline-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ef4444;
	}

	.offline-dismiss {
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 2px;
		line-height: 1;
		display: flex;
		align-items: center;
	}

	.offline-dismiss:hover {
		color: var(--text);
	}

	/* ===== Back to Top ===== */
	.back-to-top {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 9999;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-lg);
	}
	.back-to-top:hover {
		background: var(--surface-alt);
		color: var(--text);
		transform: translateY(-2px);
	}

	/* ===== Toast Container ===== */
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

	/* ===== Mobile Responsive ===== */
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
			transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
			z-index: 200;
			box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
		}

		.sidebar.sidebar--open {
			transform: translateX(0);
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.5);
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

	/* ===== Tablet: compact sidebar ===== */
	@media (min-width: 769px) and (max-width: 1024px) {
		.sidebar {
			width: 68px;
			min-width: 68px;
		}

		.sidebar-logo {
			justify-content: center;
			padding: 0;
			margin-bottom: 12px;
		}
		.logo-text { display: none; }

		.sidebar-search { display: none; }
		.search-hint { display: none; }

		.nav-section-label { display: none; }

		.nav-item {
			justify-content: center;
			padding: 10px;
		}
		.nav-item-label { display: none; }
		.nav-active-indicator { display: none; }

		.sidebar-xp { display: none; }

		.user-info { display: none; }
		.user-section { justify-content: center; }

		.login-btn span { display: none; }
		.login-btn { justify-content: center; }
	}
</style>
