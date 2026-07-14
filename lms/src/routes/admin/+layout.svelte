<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';

	let { children } = $props();

	let isAdmin = $state(false);
	let sidebarOpen = $state(false);

	onMount(() => {
		if (!browser) return;
		isAdmin = localStorage.getItem('lms-admin') === 'true';
	});

	function isActive(path: string) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	const navItems = [
		{ path: '/admin', icon: '📊', label: 'Dashboard' },
		{ path: '/admin/instructor', icon: '🧑‍🏫', label: 'Instructor' },
		{ path: '/admin/content', icon: '📚', label: 'Content' },
		{ path: '/admin/projects', icon: '🚀', label: 'Projects' },
		{ path: '/admin/users', icon: '👥', label: 'Users' },
		{ path: '/admin/analytics', icon: '📈', label: 'Analytics' },
		{ path: '/admin/courses', icon: '📖', label: 'Courses' },
		{ path: '/admin/question-bank', icon: '❓', label: 'Question Bank' },
		{ path: '/admin/assignments', icon: '📝', label: 'Assignments' },
		{ path: '/admin/gradebook', icon: '📋', label: 'Gradebook' },
		{ path: '/admin/prerequisites', icon: '📋', label: 'Prerequisites' },
		{ path: '/admin/badges', icon: '🏆', label: 'Badges' },
		{ path: '/admin/announcements', icon: '📢', label: 'Announcements' },
	];
</script>

<svelte:head>
	<title>Admin — RPL AI Curriculum</title>
</svelte:head>

{#if !isAdmin}
	<div class="access-denied">
		<span class="denied-icon">🔒</span>
		<h1>Akses Ditolak</h1>
		<p>Halaman ini hanya untuk admin. Set <code>lms-admin</code> ke <code>true</code> di localStorage untuk mengakses.</p>
	</div>
{:else}
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
{/if}

<style>
	.access-denied {
		text-align: center;
		padding: 80px 20px;
	}
	.denied-icon { font-size: 48px; display: block; margin-bottom: 16px; }
	.access-denied h1 { font-size: 24px; margin-bottom: 12px; }
	.access-denied p { color: var(--text-secondary); font-size: 14px; }
	.access-denied code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; }

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
		display: block;
	}
	.overlay { display: none; }

	.sidebar {
		width: 220px;
		min-width: 220px;
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
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 700;
		color: var(--text) !important;
		text-decoration: none !important;
	}
	.logo-icon { font-size: 22px; }

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
	.nav-icon { font-size: 18px; width: 24px; text-align: center; }

	.sidebar-footer {
		padding: 12px 8px;
		border-top: 1px solid var(--border);
	}
	.back-link {
		display: block;
		padding: 8px 12px;
		color: var(--text-secondary);
		font-size: 13px;
		text-decoration: none !important;
		border-radius: 8px;
	}
	.back-link:hover {
		background: var(--hover);
		color: var(--text);
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
