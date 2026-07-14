<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

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

	function statusClass(status: string): string {
		const map: Record<string, string> = {
			active: 'status--active',
			draft: 'status--draft',
			archived: 'status--archived',
			completed: 'status--completed',
		};
		return map[status] || 'status--draft';
	}

	function totalSubmissions(c: any): number {
		return (c.submissions_count || 0);
	}

	function pendingGrading(c: any): number {
		return (c.ungraded_count || 0);
	}
</script>

<svelte:head>
	<title>Instructor Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="instructor-dashboard">
	<div class="page-header">
		<div>
			<h1>🧑‍🏫 Instructor Dashboard</h1>
			<p class="subtitle">Manage your courses, grade assignments, and view student progress.</p>
		</div>
		<button class="btn btn--refresh" onclick={loadCourses}>🔄 Refresh</button>
	</div>

	{#if loading}
		<div class="loading">Loading your courses...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn" onclick={loadCourses}>Retry</button>
		</div>
	{:else}
		<!-- Stats overview -->
		<div class="stats-row">
			<div class="stat-card">
				<span class="stat-icon">📚</span>
				<span class="stat-value">{courses.length}</span>
				<span class="stat-label">Active Courses</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">👥</span>
				<span class="stat-value">{courses.reduce((s, c) => s + (c.student_count || 0), 0)}</span>
				<span class="stat-label">Total Students</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📝</span>
				<span class="stat-value">{courses.reduce((s, c) => s + (c.assignment_count || 0), 0)}</span>
				<span class="stat-label">Assignments</span>
			</div>
		</div>

		<!-- Course list -->
		{#if courses.length === 0}
			<div class="empty-state">
				<p>You are not assigned as an instructor for any courses yet.</p>
				<p class="empty-hint">Contact an administrator to assign you to a course offering.</p>
			</div>
		{:else}
			<div class="course-grid">
				{#each courses as c}
					<a href="/admin/instructor/courses/{c.id}" class="course-card">
						<div class="card-top">
							<span class="card-icon">{c.course_icon || '📚'}</span>
							<span class="status-badge {statusClass(c.status)}">{c.status}</span>
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

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.page-header h1 {
		font-size: 24px;
		margin: 0 0 4px;
	}
	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.loading, .error-state, .empty-state {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error-msg { color: #e74c3c; margin-bottom: 12px; }
	.empty-hint { font-size: 13px; margin-top: 8px; }

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}
	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.stat-icon { font-size: 28px; }
	.stat-value { font-size: 28px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 12px; color: var(--text-secondary); }

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
	.status-badge {
		font-size: 11px;
		padding: 2px 10px;
		border-radius: 20px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.status--active { background: #2ecc7133; color: #2ecc71; }
	.status--draft { background: var(--bg-secondary); color: var(--text-secondary); }
	.status--archived { background: #95a5a633; color: #95a5a6; }
	.status--completed { background: #3498db33; color: #3498db; }

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

	.btn {
		display: inline-block;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
	}
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.course-grid { grid-template-columns: 1fr; }
		.stats-row { grid-template-columns: repeat(2, 1fr); }
	}
</style>
