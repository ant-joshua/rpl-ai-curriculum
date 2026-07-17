<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import type { PageData } from './$types';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { children, data }: { children: import('svelte').Snippet; data: PageData } = $props();

	let sidebarOpen = $state(false);
	let tenants = $state<any[]>([]);
	let tenantLoading = $state(true);

	const userRole = $derived(data?.role || '');

	type NavItem = { path: string; icon: string; label: string; roles: string[] };

	const allNavItems: NavItem[] = [
		{ path: '/admin', icon: 'home', label: 'Dashboard', roles: ['superadmin','admin','instructor','ta'] },
		{ path: '/admin/tenants', icon: 'layers', label: 'Tenants', roles: ['superadmin','admin'] },
		{ path: '/admin/users', icon: 'users', label: 'Users', roles: ['superadmin','admin'] },
		{ path: '/admin/content', icon: 'book', label: 'Content', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/curriculum', icon: 'layers', label: 'Curriculum', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/gradebook', icon: 'file-text', label: 'Gradebook', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/enrollments', icon: 'user-plus', label: 'Enrollments', roles: ['superadmin','admin'] },
		{ path: '/admin/discussions', icon: 'message-square', label: 'Discussions', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/question-bank', icon: 'help-circle', label: 'Bank Soal', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/announcements', icon: 'megaphone', label: 'Announcements', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/gamification', icon: 'award', label: 'Gamification', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/faculties', icon: 'building', label: 'Faculties', roles: ['superadmin','admin'] },
		{ path: '/admin/classes-structure', icon: 'grid', label: 'K13 Structure', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/academic-semesters', icon: 'calendar', label: 'Academic Semesters', roles: ['superadmin','admin'] },
		{ path: '/admin/course-catalog', icon: 'book-open', label: 'Course Catalog', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/class-sessions', icon: 'users', label: 'Class Sessions', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/exam-scheduler', icon: 'clipboard', label: 'Exam Scheduler', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/payment-gateway', icon: 'credit-card', label: 'Payment Gateway', roles: ['superadmin','admin'] },
		{ path: '/admin/attendance', icon: 'check-square', label: 'Attendance', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/notifications', icon: 'bell', label: 'Notifications', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/survey', icon: 'bar-chart', label: 'Survey', roles: ['superadmin','admin','instructor'] },
		{ path: '/admin/report-cards', icon: 'printer', label: 'Report Cards', roles: ['superadmin','admin'] },
		{ path: '/admin/parent-portal', icon: 'eye', label: 'Parent Portal', roles: ['superadmin','admin'] },
		{ path: '/admin/activity-logs', icon: 'bar-chart', label: 'Activity Logs', roles: ['superadmin','admin'] },
		{ path: '/admin/error-logs', icon: 'alert-triangle', label: 'Error Logs', roles: ['superadmin','admin'] },
		{ path: '/admin/api-docs', icon: 'book-open', label: 'API Docs', roles: ['superadmin','admin','instructor','ta'] },
		{ path: '/admin/export-import', icon: 'database', label: 'Backup & Restore', roles: ['superadmin','admin'] },
		{ path: '/admin/course-migration', icon: 'refresh-cw', label: 'Migrasi Course', roles: ['superadmin','admin'] },
		{ path: '/admin/exports', icon: 'download', label: 'Exports', roles: ['superadmin','admin'] },
		{ path: '/admin/system', icon: 'settings', label: 'System', roles: ['superadmin','admin'] },
		{ path: '/admin/course-offerings', icon: 'book-open', label: 'Course Offerings', roles: ['superadmin','admin'] },
		{ path: '/admin/instructor-applications', icon: 'user-plus', label: 'Pengajuan Instruktur', roles: ['superadmin','admin'] },
	];

	const navItems = $derived(allNavItems.filter(item => item.roles.includes(userRole)));

	function isActive(path: string) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	async function loadTenants() {
		if (!browser) return;
		try {
			const res = await fetch('/api/admin/tenants');
			if (res.ok) {
				const json = await res.json();
				tenants = json.tenants || [];
			}
		} catch {} finally {
			tenantLoading = false;
		}
	}

	$effect(() => { if (browser) loadTenants(); });

	const currentTenantSlug = $derived.by(() => {
		const path = $page.url.pathname;
		const m = path.match(/^\/t\/([^\/]+)/);
		return m ? m[1] : null;
	});

	const currentTenant = $derived.by(() => {
		if (!currentTenantSlug) return null;
		return tenants.find(t => t.slug === currentTenantSlug);
	});

	function switchTenant(slug: string) {
		if (!slug) {
			// Clear cookie and reload current path
			document.cookie = 'tenant=; Path=/; Max-Age=0';
			window.location.reload();
			return;
		}
		// Navigate through /t/slug/ which sets cookie and redirects
		window.location.href = '/t/' + slug + $page.url.pathname;
	}
</script>

<svelte:head>
	<title>Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="admin-layout">
	<button class="sidebar-toggle" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar menu">
		<Icon name="menu" size={20} />
	</button>

	{#if sidebarOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="overlay" onclick={() => sidebarOpen = false} role="button" tabindex="-1"></div>
	{/if}

	<aside class="sidebar" class:sidebar--open={sidebarOpen}>
		<div class="sidebar-header">
			<a href="/admin" class="logo">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-svg">
					<circle cx="12" cy="12" r="3"/>
					<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
				</svg>
				<span class="logo-text">Admin Panel</span>
			</a>
		</div>

		{#if !tenantLoading}
			<div class="tenant-switcher">
				<label class="tenant-label">Tenant</label>
				<div class="tenant-select-wrapper">
					<select class="tenant-select" onchange={(e) => switchTenant((e.target as HTMLSelectElement).value)}>
						<option value="">Default (no prefix)</option>
						{#each tenants as t}
							<option value={t.slug} selected={currentTenantSlug === t.slug}>{t.name}</option>
						{/each}
					</select>
					<Icon name="chevron-down" size={14} class="tenant-select-chevron" />
				</div>
			</div>
		{/if}

		<nav class="sidebar-nav">
			<span class="nav-section-label">Management</span>
			{#each navItems as item}
				<a
					href={item.path}
					class="nav-item"
					class:active={isActive(item.path)}
					onclick={() => sidebarOpen = false}
				>
					<Icon name={item.icon} size={18} />
					<span class="nav-item-label">{item.label}</span>
					{#if isActive(item.path)}
						<span class="nav-active-indicator"></span>
					{/if}
				</a>
			{/each}
		</nav>
		<div class="sidebar-footer">
			<a href="/" class="back-link">
				<Icon name="chevron-left" size={14} />
				<span>Back to Site</span>
			</a>
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
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		padding: 10px;
		cursor: pointer;
		color: #d0d6e0;
		transition: all 0.15s ease;
	}
	.sidebar-toggle:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #f7f8f8;
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
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.24px;
	}
	.logo-svg { color: #7170ff; flex-shrink: 0; }
	.logo-text {
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sidebar-nav {
		flex: 1;
		padding: 8px 8px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nav-section-label {
		font-size: 10px;
		font-weight: 510;
		color: #62666d;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 8px 12px 4px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 6px;
		color: #8a8f98;
		font-size: 13.5px;
		font-weight: 510;
		transition: all 0.15s ease;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		position: relative;
	}
	.nav-item:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}
	.nav-item.active {
		background: rgba(94, 106, 210, 0.12);
		color: #7170ff;
	}
	.nav-item-label { flex: 1; }

	.nav-active-indicator {
		width: 3px;
		height: 16px;
		background: #7170ff;
		border-radius: 2px;
		box-shadow: 0 0 8px rgba(113, 112, 255, 0.4);
		position: absolute;
		right: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

		.sidebar-footer {
			padding: 12px 8px;
			border-top: 1px solid rgba(255, 255, 255, 0.05);
		}
		.tenant-switcher {
			padding: 8px 12px 4px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.05);
			margin-bottom: 4px;
		}
		.tenant-label {
			font-size: 10px;
			font-weight: 510;
			color: #62666d;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			padding: 4px 0 6px;
			display: block;
		}
		.tenant-select-wrapper {
			position: relative;
		}
		.tenant-select {
			width: 100%;
			padding: 6px 28px 6px 10px;
			font-size: 12.5px;
			background: rgba(255, 255, 255, 0.04);
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 6px;
			color: #d0d6e0;
			cursor: pointer;
			appearance: none;
			-webkit-appearance: none;
			outline: none;
		}
		.tenant-select:focus {
			border-color: #5e6ad2;
		}
		.tenant-select-chevron {
			position: absolute;
			right: 8px;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
			color: #8a8f98;
		}
		.back-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		color: #8a8f98;
		font-size: 13px;
		text-decoration: none !important;
		border-radius: 6px;
		font-feature-settings: 'cv01', 'ss03';
		transition: all 0.15s ease;
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
			transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		}
		.sidebar.sidebar--open {
			transform: translateX(0);
		}
		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.5);
			backdrop-filter: blur(4px);
			-webkit-backdrop-filter: blur(4px);
			z-index: 98;
		}
		.main-content {
			padding: 16px;
			padding-top: 60px;
		}
	}
</style>
