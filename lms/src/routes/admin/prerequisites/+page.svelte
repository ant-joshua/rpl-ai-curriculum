<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Alert, Button, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '$lib/components/ui';

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

	let offeringOptions = $derived([
		{ value: '', label: 'All Offerings' },
		...data.offerings.map((o: Offering) => ({ value: o.id, label: `${o.name} (${o.code})` }))
	]);

	let lessonOptions = $derived(
		filteredLessons.map((l: Lesson) => ({ value: l.id, label: `${l.order_index}. ${l.title}` }))
	);

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
		<Alert variant="danger">{error}</Alert>
	{/if}
	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}

	<!-- Offering Selector -->
	<div class="filter-bar">
		<label class="filter-label">
			<span>Course Offering</span>
			<Select
				options={offeringOptions}
				value={selectedOfferingId}
				onchange={(e: Event) => selectedOfferingId = (e.target as HTMLSelectElement).value}
			/>
		</label>
	</div>

	<!-- Add Prerequisite Form -->
	<div class="add-form">
		<h2>Add Prerequisite</h2>
		<div class="form-row">
			<div class="form-group">
				<label>
					<span>Prerequisite Lesson (must be completed first)</span>
					<Select
						options={[{ value: '', label: 'Select lesson...' }, ...lessonOptions]}
						value={prerequisiteLessonId}
						onchange={(e: Event) => prerequisiteLessonId = (e.target as HTMLSelectElement).value}
					/>
				</label>
			</div>
			<div class="form-group">
				<label>
					<span>Dependent Lesson (requires prerequisite)</span>
					<Select
						options={[{ value: '', label: 'Select lesson...' }, ...lessonOptions]}
						value={dependentLessonId}
						onchange={(e: Event) => dependentLessonId = (e.target as HTMLSelectElement).value}
					/>
				</label>
			</div>
			<Button onclick={addPrerequisite}>➕ Add</Button>
		</div>
	</div>

	<!-- Prerequisites Table -->
	<div class="prereqs-table-wrapper">
		<h2>Existing Prerequisites</h2>
		{#if filteredPrereqs.length === 0}
			<p class="empty-state">No prerequisites defined yet.</p>
		{:else}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Prerequisite Lesson</TableHead>
						<TableHead></TableHead>
						<TableHead>Dependent Lesson</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filteredPrereqs as prereq (prereq.id)}
						<TableRow>
							<TableCell>{prereq.prereq_title || getLessonTitle(prereq.prerequisite_id)}</TableCell>
							<TableCell class="arrow">→</TableCell>
							<TableCell>{prereq.dependent_title || getLessonTitle(prereq.dependent_id)}</TableCell>
							<TableCell>
								<Button variant="danger" size="sm" onclick={() => removePrerequisite(prereq.id)}>
									🗑️ Remove
								</Button>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
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

	.filter-bar {
		margin-bottom: 24px;
	}

	.filter-label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
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

	.prereqs-table-wrapper {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	:global(.arrow) {
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
</style>
