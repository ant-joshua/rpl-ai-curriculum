<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	interface Offering {
		id: string;
		name: string;
		code: string;
	}

	interface Lesson {
		id: string;
		title: string;
		slug: string;
		course_offering_id: string;
		order_index: number;
	}

	interface Prerequisite {
		id: string;
		course_offering_id: string;
		prerequisite_id: string;
		dependent_id: string;
		prereq_title: string | null;
		dependent_title: string | null;
	}

	let { data }: { data: { offerings: Offering[]; lessons: Lesson[]; prerequisites: Prerequisite[] } } = $props();

	let selectedOfferingId = $state('');
	let prerequisiteLessonId = $state('');
	let dependentLessonId = $state('');
	let error = $state('');
	let success = $state('');

	let filteredLessons = $derived(
		selectedOfferingId
			? data.lessons.filter((l: Lesson) => l.course_offering_id === selectedOfferingId)
			: []
	);

	let filteredPrereqs = $derived(
		selectedOfferingId
			? data.prerequisites.filter((p: Prerequisite) => p.course_offering_id === selectedOfferingId)
			: data.prerequisites
	);

	function getLessonTitle(id: string): string {
		const lesson = data.lessons.find((l: Lesson) => l.id === id);
		return lesson ? lesson.title : id;
	}

	async function addPrerequisite() {
		error = '';
		success = '';

		if (!selectedOfferingId || !prerequisiteLessonId || !dependentLessonId) {
			error = 'Please select offering, prerequisite lesson, and dependent lesson.';
			return;
		}
		if (prerequisiteLessonId === dependentLessonId) {
			error = 'Prerequisite and dependent lesson cannot be the same.';
			return;
		}

		try {
			const res = await fetch('/api/admin/prerequisites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					course_offering_id: selectedOfferingId,
					prerequisite_id: prerequisiteLessonId,
					dependent_id: dependentLessonId
				})
			});

			const json = await res.json();
			if (json.success) {
				success = 'Prerequisite added successfully.';
				prerequisiteLessonId = '';
				dependentLessonId = '';
				setTimeout(() => window.location.reload(), 500);
			} else {
				error = json.error || 'Failed to add prerequisite.';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Network error.';
		}
	}

	async function removePrerequisite(id: string) {
		if (!confirm('Remove this prerequisite relationship?')) return;

		try {
			const res = await fetch(`/api/admin/prerequisites/${id}`, {
				method: 'DELETE'
			});
			const json = await res.json();
			if (json.success) {
				window.location.reload();
			} else {
				error = json.error || 'Failed to remove prerequisite.';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Network error.';
		}
	}
</script>

<svelte:head>
	<title>Prerequisites — Admin</title>
</svelte:head>

<div class="prereqs-page">
	<h1>📋 Prerequisites</h1>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	<!-- Offering Selector -->
	<div class="filter-bar">
		<label>
			<span>Course Offering</span>
			<select bind:value={selectedOfferingId}>
				<option value="">All Offerings</option>
				{#each data.offerings as offering (offering.id)}
					<option value={offering.id}>{offering.name} ({offering.code})</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Add Prerequisite Form -->
	<div class="add-form">
		<h2>Add Prerequisite</h2>
		<div class="form-row">
			<div class="form-group">
				<label>
					<span>Prerequisite Lesson (must be completed first)</span>
					<select bind:value={prerequisiteLessonId}>
						<option value="">Select lesson...</option>
						{#each filteredLessons as lesson (lesson.id)}
							<option value={lesson.id}>
								{lesson.order_index}. {lesson.title}
							</option>
						{/each}
					</select>
				</label>
			</div>
			<div class="form-group">
				<label>
					<span>Dependent Lesson (requires prerequisite)</span>
					<select bind:value={dependentLessonId}>
						<option value="">Select lesson...</option>
						{#each filteredLessons as lesson (lesson.id)}
							<option value={lesson.id}>
								{lesson.order_index}. {lesson.title}
							</option>
						{/each}
					</select>
				</label>
			</div>
			<button onclick={addPrerequisite} class="btn-primary">➕ Add</button>
		</div>
	</div>

	<!-- Prerequisites Table -->
	<div class="prereqs-table-wrapper">
		<h2>Existing Prerequisites</h2>
		{#if filteredPrereqs.length === 0}
			<p class="empty-state">No prerequisites defined yet.</p>
		{:else}
			<table class="prereqs-table">
				<thead>
					<tr>
						<th>Prerequisite Lesson</th>
						<th></th>
						<th>Dependent Lesson</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredPrereqs as prereq (prereq.id)}
						<tr>
							<td>{prereq.prereq_title || getLessonTitle(prereq.prerequisite_id)}</td>
							<td class="arrow">→</td>
							<td>{prereq.dependent_title || getLessonTitle(prereq.dependent_id)}</td>
							<td>
								<button
									class="btn-danger"
									onclick={() => removePrerequisite(prereq.id)}
								>
									🗑️ Remove
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.prereqs-page {
		max-width: 900px;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
		color: var(--text);
	}

	h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		color: var(--text);
	}

	.alert {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
	}
	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}
	.alert-success {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.filter-bar {
		margin-bottom: 24px;
	}
	.filter-bar select {
		width: 100%;
		max-width: 400px;
	}

	.add-form {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
	}
	.form-row {
		display: flex;
		gap: 16px;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.form-group {
		flex: 1;
		min-width: 200px;
	}
	.form-group label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}
	.form-group select {
		width: 100%;
	}

	.prereqs-table-wrapper {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.prereqs-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.prereqs-table th,
	.prereqs-table td {
		padding: 10px 12px;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}
	.prereqs-table th {
		font-weight: 600;
		color: var(--text-secondary);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.arrow {
		text-align: center;
		font-size: 18px;
		color: var(--text-secondary);
		width: 40px;
	}

	.empty-state {
		color: var(--text-secondary);
		font-size: 14px;
		padding: 20px 0;
		text-align: center;
	}

	.btn-primary {
		background: var(--accent);
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-danger {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
	}
	.btn-danger:hover {
		background: rgba(239, 68, 68, 0.2);
	}
</style>
