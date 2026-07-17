<script lang="ts">
	import { page } from '$app/stores';
	import { Avatar } from '$lib/components/ui';

	let { data, children }: {
		data: import('./$types').PageData;
		children: import('svelte').Snippet;
	} = $props();

	let user = $derived(data.user || {});
	let displayName = $derived(user.name || 'Instruktur');
	let initials = $derived(
		displayName.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2)
	);
	let avatarUrl = $derived(user.avatar_url || '');

	let sidebarOpen = $state(false);

	const navItems = [
		{ href: '/instructor', icon: '📊', label: 'Dashboard' },
		{ href: '/instructor/courses', icon: '📚', label: 'Kursus' },
		{ href: '/instructor/submissions', icon: '📝', label: 'Tugas' },
		{ href: '/instructor/students', icon: '👥', label: 'Siswa' },
		{ href: '/admin/analytics', icon: '📈', label: 'Analytics' },
		{ href: '/admin/gradebook', icon: '🎓', label: 'Nilai' },
	];

	let currentPath = $derived(String($page.url.pathname));

	function isActive(href: string): boolean {
		if (href === '/instructor') return currentPath === '/instructor';
		return currentPath.startsWith(href);
	}
</script>

<div class="instructor-layout">
	<!-- Mobile toggle -->
	<button class="hamburger" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle menu">
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
	</button>

	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-header">
			<div class="user-info">
				<Avatar src={avatarUrl} {initials} alt={displayName} size="lg" />
				<div class="user-text">
					<span class="user-name">{displayName}</span>
					<span class="user-role">Instruktur</span>
				</div>
			</div>
		</div>

		<nav class="sidebar-nav">
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-item"
					class:active={isActive(item.href)}
					onclick={() => sidebarOpen = false}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<a href="/admin" class="nav-item back-link">
				<span class="nav-icon">⚙️</span>
				<span class="nav-label">Admin Panel</span>
			</a>
			<a href="/" class="nav-item back-link">
				<span class="nav-icon">🏠</span>
				<span class="nav-label">Beranda</span>
			</a>
		</div>

		{#if sidebarOpen}
			<div class="sidebar-overlay" onclick={() => sidebarOpen = false}></div>
		{/if}
	</aside>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.instructor-layout {
		display: flex;
		min-height: calc(100vh - 64px);
		position: relative;
	}

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
	.hamburger:hover { background: var(--hover); }
	.hamburger-line {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--text);
		border-radius: 2px;
	}

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
	.nav-label { line-height: 1; }

	.sidebar-footer {
		padding: 8px;
		border-top: 1px solid var(--border);
	}
	.back-link { font-size: 13px; }

	.sidebar-overlay { display: none; }

	.main-content {
		flex: 1;
		min-width: 0;
		padding: 0;
		animation: fadeIn 0.3s ease both;
	}

	@media (max-width: 768px) {
		.hamburger { display: flex; }
		.sidebar {
			position: fixed;
			top: 64px;
			left: 0;
			height: calc(100vh - 64px);
			transform: translateX(-100%);
			z-index: 60;
			box-shadow: 4px 0 24px rgba(0,0,0,0.3);
		}
		.sidebar.open { transform: translateX(0); }
		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.5);
			z-index: 55;
		}
	}
</style>
