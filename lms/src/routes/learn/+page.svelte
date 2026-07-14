<script lang="ts">
	import type { PageData } from './$types';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let { data }: { data: PageData } = $props();

	type Offering = {
		id: string;
		name: string;
		code: string;
		courseTitle: string;
		courseDescription: string;
		shortDescription: string;
		courseIcon: string;
		category: string;
		level: string;
		featured: boolean;
		startDate: string;
		endDate: string;
		status: string;
		isEnrolled: boolean;
		instructorName: string;
		studentCount: number;
	};

	// Category emoji map
	const CATEGORY_EMOJI: Record<string, string> = {
		'AI Development': '🤖',
		'Web Development': '🌐',
		'Mobile': '📱',
		'DevOps': '⚙️',
		'Database': '🗄️',
		'Programming Fundamentals': '💻',
		'Data Science': '📊',
		'Cloud Computing': '☁️',
		'Security': '🔒',
		'UI/UX Design': '🎨',
	};

	let allCategories = $derived(['All', ...new Set(data.offerings.map((o) => o.category).filter(Boolean))]);

	let selectedCategory = $state('All');
	let searchQuery = $state('');

	let filtered = $derived(() => {
		let items = data.offerings;
		if (selectedCategory !== 'All') {
			items = items.filter((o: Offering) => o.category === selectedCategory);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			items = items.filter(
				(o: Offering) =>
					o.courseTitle.toLowerCase().includes(q) ||
					o.courseDescription.toLowerCase().includes(q) ||
					o.name.toLowerCase().includes(q)
			);
		}
		return items;
	});

	let featured = $derived(filtered().filter((o: Offering) => o.featured));
	let nonFeatured = $derived(filtered().filter((o: Offering) => !o.featured));

	// Group non-featured by category
	let grouped = $derived(() => {
		const map = new Map<string, Offering[]>();
		for (const o of nonFeatured) {
			const cat = o.category || 'Other';
			if (!map.has(cat)) map.set(cat, []);
			map.get(cat)!.push(o);
		}
		return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	});

	let loading = $state(true);

	$effect(() => {
		// Simulate loading state — data arrives after mount
		const t = setTimeout(() => (loading = false), 400);
		return () => clearTimeout(t);
	});

	async function enroll(offeringId: string) {
		const token = new URLSearchParams(window.location.search).get('token') || '';
		await fetch(`/api/my/enroll`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			},
			body: JSON.stringify({ offeringId })
		});
		window.location.reload();
	}

	function categoryEmoji(cat: string): string {
		return CATEGORY_EMOJI[cat] || '📚';
	}
</script>

<svelte:head>
	<title>Course Catalog — LMS RPL</title>
</svelte:head>

<div class="learn-page">
	<header class="page-header">
		<h1>Course Catalog</h1>
		<p class="subtitle">Explore our courses. Enroll to start learning.</p>

		<!-- Search -->
		<div class="search-bar">
			<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
			</svg>
			<input
				type="search"
				placeholder="Search courses by title or description..."
				bind:value={searchQuery}
			/>
		</div>

		<!-- Category filters -->
		{#if !loading}
			<div class="category-filters">
				{#each allCategories as cat}
					<button
						class="filter-chip"
						class:active={selectedCategory === cat}
						onclick={() => (selectedCategory = cat)}
					>
						{cat === 'All' ? '' : categoryEmoji(cat) + ' '}{cat}
					</button>
				{/each}
			</div>
		{/if}
	</header>

	{#if loading}
		<!-- Loading skeleton -->
		<div class="skeleton-section">
			<Skeleton variant="card" width="100%" height="200px" count={1} />
			<div style="margin-top: 32px;">
				<Skeleton variant="title" count={1} />
				<div class="course-grid" style="margin-top: 16px;">
					{#each Array(3) as _}
						<Skeleton variant="card" width="100%" height="160px" />
					{/each}
				</div>
			</div>
		</div>
	{:else if filtered().length === 0}
		<div class="empty-state">
			<p>No courses match your filters.</p>
			<button class="btn" onclick={() => { selectedCategory = 'All'; searchQuery = ''; }}>Clear filters</button>
		</div>
	{:else}
		<!-- Featured section -->
		{#if featured.length > 0}
			<section class="featured-section">
				<h2 class="section-title">⭐ Featured Courses</h2>
				<div class="featured-grid">
					{#each featured as offering}
						<div class="featured-card">
							<div class="featured-bg">
								<div class="featured-icon">{offering.courseIcon}</div>
							</div>
							<div class="featured-body">
								<div class="featured-badges">
									<span class="badge category-badge">{categoryEmoji(offering.category)} {offering.category}</span>
									<span class="badge level-badge">{offering.level}</span>
								</div>
								<h3>{offering.courseTitle}</h3>
								<p class="featured-desc">{offering.shortDescription || offering.courseDescription}</p>
								<div class="featured-meta">
									<span>👨‍🏫 {offering.instructorName}</span>
									<span>👥 {offering.studentCount} students</span>
								</div>
							</div>
							<div class="featured-action">
								{#if offering.isEnrolled}
									<a href="/learn/{offering.id}/syllabus" class="btn primary">Continue Learning</a>
								{:else}
									<button onclick={() => enroll(offering.id)} class="btn primary">Enroll Now</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Category sections -->
		{#each grouped() as [category, items]}
			<section class="category-section">
				<h2 class="section-title">{categoryEmoji(category)} {category}</h2>
				<div class="course-grid">
					{#each items as offering}
						<div class="course-card">
							<div class="card-icon-wrap">
								<div class="card-icon">{offering.courseIcon}</div>
							</div>
							<div class="card-body">
								<h3>{offering.courseTitle}</h3>
								<p class="offering-name">{offering.name}</p>
								<p class="desc">{offering.shortDescription || offering.courseDescription}</p>
								<div class="meta-row">
									<span class="badge category-badge">{categoryEmoji(offering.category)} {offering.category}</span>
									<span class="badge level-badge">{offering.level}</span>
									<span class="badge">{offering.status}</span>
								</div>
								<div class="card-meta">
									<span>👨‍🏫 {offering.instructorName}</span>
									<span>👥 {offering.studentCount}</span>
								</div>
							</div>
							<div class="card-footer">
								{#if offering.isEnrolled}
									<a href="/learn/{offering.id}/syllabus" class="btn primary">Lihat Silabus</a>
									<a href="/learn/{offering.id}" class="btn">Lanjut Belajar</a>
								{:else}
									<button onclick={() => enroll(offering.id)} class="btn primary">Enroll</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>

<style>
	.learn-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 32px 16px 64px;
	}

	.page-header {
		margin-bottom: 32px;
	}

	.page-header h1 {
		margin: 0 0 4px;
		font-size: 28px;
		color: var(--text-primary);
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0 0 20px;
	}

	/* Search */
	.search-bar {
		position: relative;
		margin-bottom: 16px;
	}

	.search-icon {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-tertiary, #666);
		pointer-events: none;
	}

	.search-bar input {
		width: 100%;
		padding: 12px 14px 12px 44px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		color: var(--text-primary);
		font-size: 14px;
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}

	.search-bar input:focus {
		border-color: var(--accent);
	}

	.search-bar input::placeholder {
		color: var(--text-tertiary, #888);
	}

	/* Category filters */
	.category-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.filter-chip {
		padding: 7px 16px;
		border-radius: 99px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.filter-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.filter-chip.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	/* Section titles */
	.section-title {
		margin: 0 0 16px;
		font-size: 20px;
		color: var(--text-primary);
	}

	.featured-section {
		margin-bottom: 40px;
	}

	.category-section {
		margin-bottom: 36px;
	}

	/* Featured card */
	.featured-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.featured-card {
		display: flex;
		gap: 24px;
		align-items: center;
		background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--accent) 6%, var(--surface)) 100%);
		border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border));
		border-radius: 20px;
		padding: 28px;
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.featured-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
	}

	.featured-bg {
		flex-shrink: 0;
	}

	.featured-icon {
		font-size: 56px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-primary);
		border-radius: 16px;
	}

	.featured-body {
		flex: 1;
		min-width: 0;
	}

	.featured-badges {
		display: flex;
		gap: 6px;
		margin-bottom: 8px;
	}

	.featured-body h3 {
		margin: 0 0 8px;
		font-size: 20px;
		color: var(--text-primary);
	}

	.featured-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 12px;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.featured-meta {
		display: flex;
		gap: 16px;
		font-size: 12px;
		color: var(--text-secondary);
	}

	.featured-action {
		flex-shrink: 0;
	}

	/* Course grid */
	.course-grid {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.course-card {
		display: flex;
		gap: 18px;
		align-items: flex-start;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px 24px;
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.course-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.card-icon-wrap {
		flex-shrink: 0;
	}

	.card-icon {
		font-size: 42px;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-primary);
		border-radius: 12px;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-body h3 {
		margin: 0 0 3px;
		font-size: 16px;
		color: var(--text-primary);
	}

	.offering-name {
		font-size: 12px;
		color: var(--text-tertiary, #888);
		margin: 0 0 6px;
	}

	.desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 10px;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 8px;
	}

	.badge {
		font-size: 11px;
		padding: 3px 8px;
		border-radius: 99px;
		background: var(--bg-primary);
		color: var(--text-secondary);
	}

	.category-badge {
		background: color-mix(in srgb, var(--accent) 12%, var(--bg-primary));
		color: var(--accent);
	}

	.level-badge {
		background: color-mix(in srgb, #4f8cff 12%, var(--bg-primary));
		color: #4f8cff;
	}

	.card-meta {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: var(--text-tertiary, #888);
	}

	.card-footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
	}

	.btn {
		display: inline-block;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		text-align: center;
		border: 1px solid var(--border);
		color: var(--text-primary);
		background: var(--bg-primary);
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}

	.btn.primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.btn:hover {
		opacity: 0.9;
	}

	.empty-state {
		text-align: center;
		padding: 64px 16px;
		color: var(--text-secondary);
	}

	.empty-state .btn {
		margin-top: 12px;
	}

	/* Skeleton section */
	.skeleton-section {
		padding: 0;
	}

	@media (max-width: 640px) {
		.learn-page {
			padding: 20px 12px 48px;
		}

		.page-header h1 {
			font-size: 22px;
		}

		.featured-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
			padding: 20px;
		}

		.featured-action {
			width: 100%;
		}

		.featured-action .btn {
			width: 100%;
			text-align: center;
		}

		.course-card {
			flex-direction: column;
			gap: 12px;
			padding: 16px;
		}

		.card-icon {
			font-size: 36px;
			width: 52px;
			height: 52px;
		}

		.card-footer {
			width: 100%;
		}

		.btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
