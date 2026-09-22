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
	import { t, toggleLang, getLang } from '$lib/stores/i18n';
	import { progress } from '$lib/stores/progress.svelte';
	import { initShortcuts, destroyShortcuts, onShortcut } from '$lib/stores/shortcuts.svelte';
	import ScrollProgress from '$lib/components/ui/ScrollProgress.svelte';
	import ShortcutHelp from '$lib/components/ShortcutHelp.svelte';
	import CommandPalette from '$lib/components/ui/CommandPalette.svelte';
	import OnboardingOverlay from '$lib/components/OnboardingOverlay.svelte';
	import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import {
		NotificationToast,
		startPolling,
		stopPolling,
		getSnapshot,
		subscribe,
		startDmPolling,
		stopDmPolling,
		getDmSnapshot,
		subscribeDm,
	} from '$lib/features/notifications';
	import { GamificationToasts } from '$lib/features/gamification';
	import ViewportBanner from '$lib/components/layout/ViewportBanner.svelte';
	import OfflineBadge from '$lib/components/layout/OfflineBadge.svelte';
	import FloatingActions from '$lib/components/layout/FloatingActions.svelte';
	import './layout.css';

	const roleLabel = $derived(auth.authUser?.role || '');
	// For parent role, only show a minimal parent-focused nav.
	const parentNav = $derived(roleLabel === 'parent');
	const navSections = $derived.by(() => {
		if (parentNav) {
			return [
				{
					name: 'Portal',
					links: [
						{ href: '/parent', icon: 'users', label: 'Portal Orang Tua' },
						{ href: '/my/profile', icon: 'user', label: t('nav.profile') },
						{ href: '/my/settings', icon: 'settings', label: t('nav.settings') },
					]
				},
			];
		}
		return [
			{
				name: 'utama',
				links: [
					{ href: '/', icon: 'home', label: t('nav.dashboard') },
					{ href: '/my/courses', icon: 'book', label: t('nav.courses') },
					{ href: '/planner', icon: 'calendar', label: t('nav.calendar') },
					{ href: '/announcements', icon: 'message-square', label: t('nav.messages') },
				]
			},
			{
				name: 'belajar',
				links: [
					{ href: '/catalog', icon: 'compass', label: t('nav.catalog') },
					{ href: '/ai-course', icon: 'graduation-cap', label: 'AI Course' },
					{ href: '/path', icon: 'map-pin', label: t('nav.paths') },
					{ href: '/progress', icon: 'trending-up', label: t('nav.progress') },
				]
			},
			{
				name: 'tools',
				links: [
					{ href: '/tutor', icon: 'robot', label: t('nav.tutor') },
					{ href: '/aiedu', icon: 'sparkles', label: 'AIEdu' },
					{ href: '/flashcards', icon: 'layers', label: t('nav.flashcards') },
					{ href: '/exercises', icon: 'dumbbell', label: t('nav.exercises') },
					{ href: '/projects', icon: 'rocket', label: t('nav.projects') },
					{ href: '/groups', icon: 'users', label: t('nav.groups') },
				]
			},
			{
				name: 'akun',
				links: [
					{ href: '/my/profile', icon: 'user', label: t('nav.profile') },
					{ href: '/my/messages', icon: 'message-square', label: t('nav.messages') },
					{ href: '/my/grades', icon: 'file-text', label: t('nav.grades') },
					{ href: '/my/certificates', icon: 'award', label: t('nav.certificate') },
					{ href: '/my/export', icon: 'download', label: t('nav.export') },
					{ href: '/my/settings', icon: 'settings', label: t('nav.settings') },
				]
			},
		];
	});

	let { children } = $props();

	let sidebarOpen = $state(false);
	let offline = $state(false);
	let showBackToTop = $state(false);
	let dismissedOffline = $state(false);
	let showShortcuts = $state(false);
	let showCommandPalette = $state(false);

	function closeSidebar() {
		sidebarOpen = false;
	}

	function openSidebar() {
		sidebarOpen = true;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function isActive(path: string) {
		if (path === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(path);
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
					window.location.href = (oauthUser as any).role === 'parent' ? '/parent' : '/dashboard';
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

	// Redirect parent away from student dashboard to their portal
	$effect(() => {
		if (!browser) return;
		if (roleLabel === 'parent' && $page.url.pathname === '/dashboard') {
			window.location.href = '/parent';
		}
	});

	// Register service worker for PWA offline support
	$effect(() => {
		if (!browser) return;
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});

	// Start notification polling
	$effect(() => {
		if (!browser) return;
		startPolling(30000);
		return () => stopPolling();
	});

	// DM unread badge — reactive store
	let dmUnread = $state(0);
	$effect(() => {
		if (!browser) return;
		startDmPolling();
		const unsub = subscribeDm(() => {
			dmUnread = getDmSnapshot().count;
		});
		dmUnread = getDmSnapshot().count;
		return () => {
			unsub();
			stopDmPolling();
		};
	});

	$effect(() => {
		if (!browser) return;

		function onOnline() {
			offline = false;
			dismissedOffline = false;
			// Ask service worker to replay any queued offline requests
			if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage({ type: 'REPLAY_QUEUE' });
			}
		}
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

	// Auto-open sidebar on resize to desktop breakpoint
	$effect(() => {
		if (!browser) return;

		function onResize() {
			if (window.innerWidth > 768) {
				openSidebar();
			}
		}

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// Small screen detection for viewport banner
	let isSmallScreen = $state(false);
	let isPortrait = $state(false);

	$effect(() => {
		if (!browser) return;
		function checkScreen() {
			isSmallScreen = window.innerWidth < 400;
			isPortrait = window.innerHeight > window.innerWidth;
		}
		checkScreen();
		window.addEventListener('resize', checkScreen);
		return () => window.removeEventListener('resize', checkScreen);
	});

	// Prevent body scroll when sidebar is open on mobile
	$effect(() => {
		if (!browser) return;
		if (sidebarOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
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
				if (action === 'showCommandPalette') {
					showCommandPalette = true;
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

	const overallPct = $derived(browser ? progress.getOverallProgress() : 0);

	// Scroll to top on route change
	$effect(() => {
		if (!browser) return;
		$page.url.pathname;
		window.scrollTo({ top: 0, behavior: 'instant' });
	});

	const isMinimalRoute = $derived(
		$page.route.id?.startsWith('/(auth)') ||
		$page.route.id?.startsWith('/(public)') ||
		$page.route.id?.startsWith('/(backoffice)') ||
		$page.route.id?.startsWith('/my/') ||
		$page.route.id === '/my' ||
		$page.route.id?.startsWith('/ai-course/') ||
		false
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
	<meta name="theme-color" content="var(--surface)" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
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
	<!-- Academic reading typography -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Mobile hamburger -->
{#if !isMinimalRoute}
<button class="hamburger" onclick={toggleSidebar} aria-label="Toggle navigation">
	<Icon name={sidebarOpen ? "x" : "menu"} size={20} />
</button>

<!-- Sidebar overlay (mobile) -->
{#if sidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="sidebar-overlay" onclick={closeSidebar} role="button" tabindex="-1"></div>
{/if}

<div class="layout-body" class:layout-body--minimal={isMinimalRoute}>
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
							{#if link.href === '/my/messages' && dmUnread > 0}
								<span class="nav-badge dm-badge">{dmUnread}</span>
							{/if}
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
						<div class="xp-row-left">
							<span class="xp-level-badge">Lv.{lvl.level}</span>
							{#if gamification.computeStats().streak > 0}
								<span class="xp-streak">🔥 {gamification.computeStats().streak}</span>
							{/if}
							<span class="xp-amount">{lvl.currentXp}/{lvl.currentXp + lvl.xpToNext}</span>
						</div>
						<div class="xp-progress-ring-wrap">
							<svg class="xp-progress-ring" viewBox="0 0 36 36" width="36" height="36">
								<circle class="ring-bg" cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3" />
								<circle class="ring-fg" cx="18" cy="18" r="15.5" fill="none" stroke="url(#progressGrad)" stroke-width="3"
									stroke-linecap="round"
									stroke-dasharray="97.39"
									stroke-dashoffset={97.39 - (97.39 * overallPct) / 100}
									transform="rotate(-90 18 18)"
								/>
								<defs>
									<linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stop-color="var(--accent)" />
										<stop offset="100%" stop-color="var(--text-secondary)" />
									</linearGradient>
								</defs>
							</svg>
							<span class="xp-progress-ring-label">{overallPct}%</span>
						</div>
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
			<div transition:fade={{ duration: 150 }}>
				<div transition:fly={{ duration: 200, x: 10 }}>
					{@render children()}
				</div>
			</div>
		{/key}
	</main>
</div>
{:else}
	{@render children()}
{/if}

<!-- Small screen landscape suggestion -->
{#if browser && isSmallScreen && isPortrait && !isMinimalRoute}
	<ViewportBanner ondismiss={() => { isSmallScreen = false; }} />
{/if}

{#if offline && !dismissedOffline}
	<OfflineBadge ondismiss={() => { dismissedOffline = true; }} />
{/if}

<FloatingActions show={showBackToTop} onscrolltop={scrollToTop} />

<PWAInstallPrompt />

{#key $page.url.pathname}
	<ScrollProgress />
{/key}

<CommandPalette show={showCommandPalette} onclose={() => showCommandPalette = false} />

<ShortcutHelp show={showShortcuts} onclose={() => showShortcuts = false} />

<OnboardingOverlay />

<div class="toast-container">
	<Toast />
</div>

<NotificationToast />

<GamificationToasts />

<ConfirmDialog />
