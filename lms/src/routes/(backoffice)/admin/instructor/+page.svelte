<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, Loading, EmptyState, StatCard, PageHeader } from '$lib/components/ui';

	let courses: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadCourses();
	});

	async function loadCourses() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/instructor/courses');
			const json = await res.json();
			if (json.success) courses = json.data || [];
			else error = json.error || 'Failed to load courses';
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	const totalStudents = $derived(courses.reduce((s, c) => s + (c.student_count || 0), 0));
	const totalAssignments = $derived(courses.reduce((s, c) => s + (c.assignment_count || 0), 0));
</script>

<svelte:head>
	<title>Instructor Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="instructor-dashboard">
	<PageHeader title="🧑‍🏫 Manajemen Guru" subtitle="Kelola kursus, beri nilai tugas, dan pantau perkembangan siswa">
		<svelte:fragment slot="action">
			<Button variant="secondary" onclick={loadCourses}>🔄 Refresh</Button>
		</svelte:fragment>
	</PageHeader>

	{#if loading}
		<Loading />
	{:else if error}
		<EmptyState title="Error" description={error}>
			<Button onclick={loadCourses}>Retry</Button>
		</EmptyState>
	{:else}
		<!-- Stats overview -->
		<div class="stats-row">
			<StatCard icon="📚" value={courses.length} label="Kursus Aktif" />
			<StatCard icon="👥" value={totalStudents} label="Total Siswa" />
			<StatCard icon="📝" value={totalAssignments} label="Tugas" />
		</div>

		<!-- Course list -->
		{#if courses.length === 0}
			<EmptyState
				icon="📚"
				title="No Courses Yet"
				description="You are not assigned as an instructor for any courses yet."
			>
				<p class="empty-hint">Contact an administrator to assign you to a course offering.</p>
			</EmptyState>
		{:else}
			<div class="course-grid">
				{#each courses as c}
					<a href="/admin/instructor/courses/{c.id}" class="course-card">
						<div class="card-top">
							<span class="card-icon">{c.course_icon || '📚'}</span>
							<Badge variant={c.status === 'active' ? 'success' : c.status === 'completed' ? 'info' : c.status === 'archived' ? 'default' : 'warning'}>{c.status}</Badge>
						</div>
						<h3 class="card-title">{c.name}</h3>
						<p class="card-course">{c.course_title || ''}</p>
						<p class="card-code">{c.code || ''}</p>
						<div class="card-meta">
							<span class="meta-item">👥 {c.student_count || 0} students</span>
							<span class="meta-item">📝 {c.assignment_count || 0} assignments</span>
						</div>
						<div class="card-footer">
							<span class="footer-link">Open Course →</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.instructor-dashboard {
		max-width: 1100px;
	}

	.empty-hint { font-size: 13px; margin-top: 8px; }

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}

	.course-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 14px;
	}

	.course-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-decoration: none;
		color: var(--text);
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.course-card:hover {
		border-color: var(--accent);
		box-shadow: 0 2px 12px rgba(0,0,0,0.1);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.card-icon { font-size: 32px; }

	.card-title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}
	.card-course {
		margin: 0;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.card-code {
		margin: 0;
		font-size: 12px;
		color: var(--text-secondary);
		font-family: monospace;
	}

	.card-meta {
		display: flex;
		gap: 16px;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.meta-item { white-space: nowrap; }

	.card-footer {
		margin-top: auto;
		padding-top: 8px;
	}
	.footer-link {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
	}

	@media (max-width: 768px) {
		.course-grid { grid-template-columns: 1fr; }
		.stats-row { grid-template-columns: repeat(2, 1fr); }
	}
</style>
