<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import type { PageData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: PageData } = $props();

	let sidebarOpen = $state(false);

	function isActive(path: string) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	const navItems = [
		{ path: '/admin', icon: '📊', label: 'Dashboard' },
		{ path: '/admin/users', icon: '👥', label: 'Users' },
		{ path: '/admin/content', icon: '📚', label: 'Content' },
		{ path: '/admin/curriculum', icon: '📋', label: 'Curriculum' },
		{ path: '/admin/gradebook', icon: '📝', label: 'Gradebook' },
		{ path: '/admin/enrollments', icon: '📋', label: 'Enrollments' },
		{ path: '/admin/discussions', icon: '💬', label: 'Discussions' },
		{ path: '/admin/announcements', icon: '📢', label: 'Announcements' },
		{ path: '/admin/gamification', icon: '🏆', label: 'Gamification' },
	];
</script>

<svelte:head>
	<title>Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="admin-layout">
	<button class="sidebar-toggle" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar menu">
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
	</button>

	{#if sidebarOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="overlay" onclick={() => sidebarOpen = false} role="button" tabindex="-1"></div>
	{/if}

	<aside class="sidebar" class:sidebar--open={sidebarOpen}>
		<div class="sidebar-header">
			<a href="/admin" class="logo">
				<span class="logo-icon">⚙️</span>
				<span class="logo-text">Admin Panel</span>
			</a>
		</div>
		<nav class="sidebar-nav">
			{#each navItems as item}
				<a
					href={item.path}
					class:active={isActive(item.path)}
					onclick={() => sidebarOpen = false}
				>
					<span class="nav-icon">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		<div class="sidebar-footer">
			<a href="/" class="back-link">← Back to Site</a>
		</div>
	</aside>

	<main class="main-content">
		<div class="admin-topbar">
			<div class="admin-topbar-spacer"></div>
			<NotificationBell />
		</div>
		{@render children()}
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sidebar-toggle {
		display: none;
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 100;
		background: #0f1011;
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
		display: block;
	}
	.overlay { display: none; }

	.sidebar {
		width: 220px;
		min-width: 220px;
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
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 590;
		color: #f7f8f8 !important;
		text-decoration: none !important;
		letter-spacing: -0.24px;
	}
	.logo-icon { font-size: 22px; }
	.logo-text {
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
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
		border-radius: 6px;
		color: #8a8f98;
		font-size: 14px;
		font-weight: 510;
		transition: all 0.15s ease;
		text-decoration: none !important;
	}
	.sidebar-nav a:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}
	.sidebar-nav a.active {
		background: rgba(94, 106, 210, 0.12);
		color: #7170ff;
	}
	.nav-icon { font-size: 18px; width: 24px; text-align: center; }

	.sidebar-footer {
		padding: 12px 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}
	.back-link {
		display: block;
		padding: 8px 12px;
		color: #8a8f98;
		font-size: 13px;
		text-decoration: none !important;
		border-radius: 6px;
	}
	.back-link:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}

	.admin-topbar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		margin-bottom: 16px;
		gap: 8px;
	}
	.admin-topbar-spacer {
		flex: 1;
	}

	.main-content {
		flex: 1;
		padding: 24px;
		max-width: 1200px;
	}

	@media (max-width: 768px) {
		.sidebar-toggle {
			display: flex;
		}
		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 99;
			transform: translateX(-100%);
			transition: transform 0.2s ease;
		}
		.sidebar.sidebar--open {
			transform: translateX(0);
		}
		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.4);
			z-index: 98;
		}
		.main-content {
			padding: 16px;
			padding-top: 60px;
		}
	}
</style>
