<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data, children } = $props();

	let offering = $derived(data.offering);
	let course = $derived(data.course);
	let currentPath = $derived($page.url.pathname);

	// Breadcrumb tail — child pages push extra crumbs via context
	let breadcrumbTail = $state<{ label: string; href?: string }[]>([]);
	function setBreadcrumbTail(items: { label: string; href?: string }[]) {
		breadcrumbTail = items;
	}
	setContext('breadcrumb-tail', setBreadcrumbTail);

	let breadcrumbItems = $derived([
		{ label: course?.title ?? offering?.name, href: `/learn/${offering?.id}` },
		...breadcrumbTail,
	]);

	// Determine active tab
	let activeTab = $derived(
		currentPath.endsWith('/syllabus') ? 'syllabus' : 'lesson'
	);

	// Auth state — redirect to login if not enrolled
	let isEnrolled = $derived(!!data.enrollment);
</script>

<svelte:head>
	<title>{course?.title ?? 'Course'} — RPL AI Curriculum</title>
	<meta name="description" content={course?.description || offering?.name || 'Kursus RPL AI Curriculum'} />
	<meta property="og:title" content="{course?.title ?? 'Course'} — RPL AI Curriculum" />
	<meta property="og:description" content={course?.description || offering?.name || 'Kursus RPL AI Curriculum'} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{course?.title ?? 'Course'} — RPL AI Curriculum" />
	<meta name="twitter:description" content={course?.description || offering?.name || 'Kursus RPL AI Curriculum'} />
</svelte:head>

<div class="learn-layout">
	<!-- Breadcrumb -->
	<Breadcrumb items={breadcrumbItems} homeHref="/learn" homeLabel="← All Courses" />

	<!-- Header -->
	<header class="course-header">
		<div class="header-icon">{course?.icon ?? '📚'}</div>
		<div class="header-info">
			<h1 class="course-title">{course?.title ?? offering?.name}</h1>
			{#if offering?.name !== course?.title}
				<p class="offering-name">{offering?.name}</p>
			{/if}
		</div>
	</header>

	<!-- Tab Navigation -->
	<nav class="tab-nav">
		<a
			href="/learn/{offering?.id}/syllabus"
			class="tab"
			class:active={activeTab === 'syllabus'}
		>
			<span class="tab-icon">📋</span>
			<span class="tab-label">Silabus</span>
		</a>
		<a
			href="/learn/{offering?.id}"
			class="tab"
			class:active={activeTab === 'lesson'}
		>
			<span class="tab-icon">📖</span>
			<span class="tab-label">Belajar</span>
		</a>
	</nav>

	<!-- Page content -->
	<div class="page-content">
		{@render children()}
	</div>
</div>

<style>
	.learn-layout {
		max-width: 860px;
		margin: 0 auto;
		padding: 24px 16px 48px;
		animation: fadeIn 0.3s ease both;
	}

	.course-header {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 20px;
	}

	.header-icon {
		font-size: 48px;
		line-height: 1;
		flex-shrink: 0;
	}

	.header-info {
		flex: 1;
		min-width: 0;
	}

	.course-title {
		font-size: 26px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.offering-name {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Tab Navigation */
	.tab-nav {
		display: flex;
		gap: 4px;
		margin-bottom: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 4px;
	}

	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
		border: none;
		background: transparent;
	}

	.tab:hover {
		color: var(--text);
		background: var(--hover);
	}

	.tab.active {
		color: var(--accent);
		background: var(--accent-dim);
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.tab-icon {
		font-size: 16px;
		line-height: 1;
	}

	.tab-label {
		line-height: 1;
	}

	.page-content {
		animation: fadeInUp 0.3s ease both;
	}

	@media (max-width: 640px) {
		.course-title {
			font-size: 22px;
		}

		.course-header {
			flex-direction: column;
			gap: 10px;
		}

		.tab-label {
			font-size: 13px;
		}
	}
</style>
