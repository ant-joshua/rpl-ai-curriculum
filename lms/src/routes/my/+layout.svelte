<script lang="ts">
	import { page } from '$app/stores';
	import { Avatar, Card } from '$lib/components/ui';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getSnapshot, subscribe, stopPolling, fetchUnreadCount } from '$lib/stores/notifications.svelte';
	import ContentSearchPanel from '$lib/components/ContentSearchPanel.svelte';

	let { data, children } = $props();

	let user = $derived(data.user || {});
	let displayName = $derived(user.display_name || user.name || 'Siswa');
	let initials = $derived(
		displayName
			.split(' ')
			.map((s: string) => s[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
	let avatarUrl = $derived(user.avatar_url || '');

	type NavItem = {
		href: string;
		icon: string;
		label: string;
	};

	const navItems: NavItem[] = [
		{ href: '/my/dashboard', icon: '📊', label: 'Dashboard' },
		{ href: '/my/courses', icon: '📚', label: 'Kursus' },
		{ href: '/my/schedule', icon: '📅', label: 'Jadwal' },
		{ href: '/my/grades', icon: '📝', label: 'Nilai' },
		{ href: '/my/assessments', icon: '📋', label: 'Penilaian' },
		{ href: '/my/assignments', icon: '📂', label: 'Tugas' },
		{ href: '/flashcards', icon: '📇', label: 'Flashcards' },
		{ href: '/my/practice', icon: '🧪', label: 'Latihan Soal' },
		{ href: '/my/gamification', icon: '🏆', label: 'Gamification' },
		{ href: '/progress-quiz', icon: '🧪', label: 'Progress Quiz' },
		{ href: '/my/certificates', icon: '🎓', label: 'Sertifikat' },
		{ href: '/my/payments', icon: '💳', label: 'Pembayaran' },
		{ href: '/my/announcements', icon: '📢', label: 'Pengumuman' },
		{ href: '/my/notifications', icon: '🔔', label: 'Notifikasi' },
		{ href: '/my/chat', icon: '💬', label: 'Chat' },
		{ href: '/my/profile', icon: '👤', label: 'Profil' },
	];

	let currentPath = $derived(String($page.url.pathname));

	let sidebarOpen = $state(false);

	// Search panel
	let searchOpen = $state(false);

	function toggleSearch() {
		searchOpen = !searchOpen;
	}

	// Unread notification badge
	let unreadCount = $state(0);

	onMount(() => {
		if (!browser) return;
		fetchUnreadCount();
		const unsub = subscribe(() => {
			unreadCount = getSnapshot().unreadCount;
		});
		return unsub;
	});

	// PWA install state
	let deferredPrompt: any = $state(null);

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
			});
			window.addEventListener('appinstalled', () => {
				deferredPrompt = null;
			});
		}
	});

	async function installPwa() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const result = await deferredPrompt.userChoice;
		if (result.outcome === 'accepted') deferredPrompt = null;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function isActive(href: string): boolean {
		if (href === '/my/dashboard') return currentPath === '/my/dashboard' || currentPath === '/my';
		return currentPath.startsWith(href);
	}
</script>

<div class="my-layout">
	<!-- Mobile hamburger -->
	<button class="hamburger" onclick={toggleSidebar} aria-label="Toggle menu">
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
	</button>

	<!-- Sidebar -->
	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-header">
			<div class="user-info">
				<Avatar src={avatarUrl} {initials} alt={displayName} size="lg" />
				<div class="user-text">
					<span class="user-name">{displayName}</span>
					<span class="user-role">Siswa</span>
				</div>
			</div>
		</div>

		<nav class="sidebar-nav">
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-item"
					class:active={isActive(item.href)}
					onclick={closeSidebar}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
					{#if item.label === 'Notifikasi' && unreadCount > 0}
						<span class="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			{#if deferredPrompt}
				<button onclick={installPwa} class="nav-item pwa-install-item">
					<span class="nav-icon">📲</span>
					<span class="nav-label">Install App</span>
				</button>
			{/if}
			<a href="/" class="nav-item back-link">
				<span class="nav-icon">🏠</span>
				<span class="nav-label">Beranda</span>
			</a>
		</div>

		<!-- Mobile overlay close -->
		{#if sidebarOpen}
			<div class="sidebar-overlay" onclick={closeSidebar}></div>
		{/if}
	</aside>

	<!-- Main content -->
	<main class="main-content">
		<div class="main-toolbar">
			<button class="search-toggle-btn" onclick={toggleSearch} title="Cari materi">
				🔍
			</button>
		</div>
		{@render children()}
	</main>
</div>

<ContentSearchPanel isOpen={searchOpen} onClose={() => searchOpen = false} />

<style>
	.my-layout {
		display: flex;
		min-height: calc(100vh - 64px);
		position: relative;
	}

	/* Hamburger */
	.hamburger {
		display: none;
		position: fixed;
		top: 74px;
		left: 12px;
		z-index: 100;
		flex-direction: column;
		gap: 4px;
		padding: 8px 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.hamburger:hover {
		background: var(--hover);
	}
	.hamburger-line {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--text);
		border-radius: 2px;
	}

	/* Sidebar */
	.sidebar {
		width: 240px;
		flex-shrink: 0;
		background: var(--surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		position: sticky;
		top: 64px;
		height: calc(100vh - 64px);
		overflow-y: auto;
		z-index: 50;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar-header {
		padding: 20px 16px 16px;
		border-bottom: 1px solid var(--border);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.user-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Navigation */
	.sidebar-nav {
		flex: 1;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 10px;
		text-decoration: none;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		transition: all 0.15s ease;
	}

	.nav-item:hover {
		background: var(--hover);
		color: var(--text);
	}

	.nav-item.active {
		background: var(--accent-dim);
		color: var(--accent);
		font-weight: 600;
	}

	.nav-icon {
		font-size: 18px;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
		line-height: 1;
	}

	.nav-label {
		line-height: 1;
	}

	.nav-badge {
		background: var(--accent, #5e6ad2);
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		margin-left: auto;
	}

	/* Footer */
	.sidebar-footer {
		padding: 8px;
		border-top: 1px solid var(--border);
	}

	.back-link {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.back-link:hover {
		color: var(--text);
	}

	/* Overlay (mobile) */
	.sidebar-overlay {
		display: none;
	}

	/* Main content */
	.main-content {
		flex: 1;
		min-width: 0;
		padding: 0;
		animation: fadeIn 0.3s ease both;
	}

	.main-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: 8px 16px;
		position: sticky;
		top: 64px;
		z-index: 40;
		background: var(--bg);
	}

	.search-toggle-btn {
		background: rgba(255,255,255,0.04);
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 8px;
		padding: 6px 10px;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.15s;
		line-height: 1;
	}
	.search-toggle-btn:hover {
		background: rgba(255,255,255,0.08);
		border-color: rgba(255,255,255,0.15);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.sidebar {
			position: fixed;
			top: 64px;
			left: 0;
			height: calc(100vh - 64px);
			transform: translateX(-100%);
			z-index: 60;
			box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 55;
		}

		.main-content {
			padding-left: 0;
		}
	}
</style>
