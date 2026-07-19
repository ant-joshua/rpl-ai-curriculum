<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import type { PageData } from './$types';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { children, data }: { children: import('svelte').Snippet; data: PageData } = $props();

	let sidebarOpen = $state(false);
	let tenants = $state<any[]>([]);
	let tenantLoading = $state(true);

	const userRole = $derived(data?.role || '');

	// --- Page header context ---
	let headerTitle = $state('');
	let headerActions = $state<Snippet | undefined>(undefined);
	setContext('backoffice:headerTitle', {
		get value() { return headerTitle; },
		set value(v: string) { headerTitle = v; }
	});
	setContext('backoffice:headerActions', {
		get value() { return headerActions; },
		set value(v: Snippet | undefined) { headerActions = v; }
	});

	// --- Breadcrumb from URL ---
	const breadcrumbItems = $derived.by(() => {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		// Skip 't/{tenant}' prefix if present
		let start = 0;
		if (segments[0] === 't' && segments[1]) start = 2;
		return segments.slice(start).map((seg, i, arr) => {
			const href = '/' + segments.slice(0, start + i + 1).join('/');
			const label = seg.replace(/-/g, ' ')
				.split(' ')
				.map(w => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' ');
			return { label, href, isLast: i === arr.length - 1 };
		});
	});

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
		{ path: '/admin/courses', icon: 'book-open', label: 'Kursus', roles: ['superadmin','admin'] },
		{ path: '/admin/media', icon: 'image', label: 'Media', roles: ['superadmin','admin'] },
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
		<!-- Page header area with gradient -->
		<div class="page-header-area">
			<div class="header-breadcrumb">
				<a href="/admin" class="breadcrumb-home">
					<Icon name="home" size={14} />
				</a>
				{#each breadcrumbItems as crumb}
					<span class="breadcrumb-sep">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
					</span>
					{#if crumb.isLast}
						<span class="breadcrumb-current">{crumb.label}</span>
					{:else}
						<a href={crumb.href} class="breadcrumb-link">{crumb.label}</a>
					{/if}
				{/each}
			</div>

			<div class="header-row">
				<h1 class="page-title">
					{#if headerTitle}
						{headerTitle}
					{:else}
						{breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length - 1].label : 'Dashboard'}
					{/if}
				</h1>
				<div class="header-actions">
					{#if headerActions}
						{@render headerActions()}
					{/if}
					<NotificationBell />
				</div>
			</div>
		</div>

		<!-- Main content in Card container -->
		<Card variant="default" padding="lg">
			{@render children()}
		</Card>
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
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 6px;
		padding: 10px;
		cursor: pointer;
		color: #d0d6e0;
		transition: all 0.15s ease;
	}
	.sidebar-toggle:hover {
		background: rgba(0, 0, 0, 0.08);
		color: #1a1a2e;
	}
	.overlay { display: none; }

	.sidebar {
		width: 220px;
		min-width: 220px;
		height: 100vh;
		position: sticky;
		top: 0;
		background: #0f1011;
		border-right: 1px solid rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 20px 16px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 590;
		color: #1a1a2e !important;
		text-decoration: none !important;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.24px;
	}
	.logo-svg { color: #4F46E5; flex-shrink: 0; }
	.logo-text {
		background: linear-gradient(135deg, #4F46E5, #4F46E5);
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
		padding: 10px 12px;
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
		background: rgba(0, 0, 0, 0.04);
		color: #1a1a2e;
	}
	.nav-item.active {
		background: rgba(79, 70, 229, 0.12);
		color: #4F46E5;
	}
	.nav-item-label { flex: 1; }

	.nav-active-indicator {
		width: 3px;
		height: 16px;
		background: #4F46E5;
		border-radius: 2px;
		box-shadow: 0 0 8px rgba(113, 112, 255, 0.4);
		position: absolute;
		right: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

		.sidebar-footer {
			padding: 12px 8px;
			border-top: 1px solid rgba(0, 0, 0, 0.05);
		}
		.tenant-switcher {
			padding: 8px 12px 4px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.05);
			margin-bottom: 4px;
		}
		.tenant-label {
			font-size: 10px;
			font-weight: 510;
			color: #94a3b8;
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
			background: rgba(0, 0, 0, 0.04);
			border: 1px solid rgba(0, 0, 0, 0.06);
			border-radius: 6px;
			color: #d0d6e0;
			cursor: pointer;
			appearance: none;
			-webkit-appearance: none;
			outline: none;
		}
		.tenant-select:focus {
			border-color: #4F46E5;
		}
		.tenant-select-chevron {
			position: absolute;
			right: 8px;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
			color: #64748b;
		}
		.back-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		color: #64748b;
		font-size: 13px;
		text-decoration: none !important;
		border-radius: 6px;
		font-feature-settings: 'cv01', 'ss03';
		transition: all 0.15s ease;
	}
	.back-link:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #1a1a2e;
	}

	/* === Page header area with gradient === */
	.page-header-area {
		background: linear-gradient(135deg, #1a1a2e 0%, #2d2b55 50%, #1a1a2e 100%);
		border-radius: 12px;
		padding: 20px 24px 18px;
		margin-bottom: 20px;
		position: relative;
		overflow: hidden;
	}
	.page-header-area::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 0% 100%, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
		pointer-events: none;
	}
	.page-header-area::after {
		content: '';
		position: absolute;
		top: -50%;
		right: -10%;
		width: 300px;
		height: 300px;
		background: radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.header-breadcrumb {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 10px;
		font-size: 12px;
		position: relative;
		z-index: 1;
	}
	.breadcrumb-home {
		color: #94a3b8;
		display: flex;
		align-items: center;
		padding: 2px;
		border-radius: 4px;
		transition: color 0.15s;
		text-decoration: none !important;
	}
	.breadcrumb-home:hover { color: #e2e8f0; }
	.breadcrumb-sep {
		color: #475569;
		display: flex;
		align-items: center;
	}
	.breadcrumb-link {
		color: #94a3b8;
		text-decoration: none !important;
		transition: color 0.15s;
		padding: 2px 4px;
		border-radius: 4px;
	}
	.breadcrumb-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }
	.breadcrumb-current {
		color: #e2e8f0;
		font-weight: 510;
		padding: 2px 4px;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		position: relative;
		z-index: 1;
	}

	.page-title {
		font-size: 22px;
		font-weight: 590;
		color: #ffffff;
		margin: 0;
		letter-spacing: -0.24px;
		font-feature-settings: 'cv01', 'ss03';
		text-shadow: 0 1px 2px rgba(0,0,0,0.2);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
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
