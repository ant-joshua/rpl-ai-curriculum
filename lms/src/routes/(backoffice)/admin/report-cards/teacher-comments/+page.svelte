<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Modal, Input, Textarea, Select, EmptyState, Alert, Skeleton } from '$lib/components/ui/index.js';

	interface Comment {
		id: string;
		student_id: string;
		class_subject_id: string;
		academic_year: string;
		semester: number;
		comment: string;
		created_by: string;
		created_at: string;
		updated_at: string;
		student_name: string | null;
		subject_name: string | null;
	}

	let comments = $state<Comment[]>([]);
	let students: any[] = $state([]);
	let classSubjects: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');

	// Filters
	let filterStudentId = $state('');
	let filterSubjectId = $state('');
	let filterAcademicYear = $state('');
	let filterSemester = $state('');

	// Create/Edit
	let showModal = $state(false);
	let editingId = $state<string | null>(null);
	let formStudentId = $state('');
	let formSubjectId = $state('');
	let formAcademicYear = $state('');
	let formSemester = $state(1);
	let formComment = $state('');
	let submitting = $state(false);

	// Delete
	let deletingId = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [commentsRes, studentsRes, subjectsRes] = await Promise.all([
				fetch('/api/admin/report-cards/comments'),
				fetch('/api/admin/users?role=student&limit=500'),
				fetch('/api/admin/class-subjects?limit=500'),
			]);
			const commentsJson = await commentsRes.json();
			const studentsJson = await studentsRes.json();
			const subjectsJson = await subjectsRes.json();
			if (commentsJson.success) comments = commentsJson.data || [];
			else error = commentsJson.error || 'Failed';
			if (studentsJson.success) students = studentsJson.data || [];
			if (subjectsJson.success) classSubjects = subjectsJson.data || [];
		} catch { error = 'Failed to load data'; }
		finally { loading = false; }
	}

	const studentOptions = $derived(
		students.map((s: any) => ({ value: s.id, label: s.display_name || s.email || s.id.slice(0, 8) }))
	);

	const subjectOptions = $derived(
		classSubjects.map((cs: any) => ({ value: cs.id, label: cs.subject_name || cs.id.slice(0, 8) }))
	);

	const semesterOptions = [
		{ value: '1', label: 'Semester 1 (Ganjil)' },
		{ value: '2', label: 'Semester 2 (Genap)' },
	];

	const filteredComments = $derived(
		comments.filter(c => {
			if (filterStudentId && c.student_id !== filterStudentId) return false;
			if (filterSubjectId && c.class_subject_id !== filterSubjectId) return false;
			if (filterAcademicYear && c.academic_year !== filterAcademicYear) return false;
			if (filterSemester && c.semester !== parseInt(filterSemester)) return false;
			return true;
		})
	);

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});
		} catch { return d; }
	}

	function openCreate() {
		editingId = null;
		formStudentId = students.length > 0 ? students[0].id : '';
		formSubjectId = classSubjects.length > 0 ? classSubjects[0].id : '';
		formAcademicYear = new Date().getFullYear().toString();
		formSemester = 1;
		formComment = '';
		error = '';
		showModal = true;
	}

	function openEdit(comment: Comment) {
		editingId = comment.id;
		formStudentId = comment.student_id;
		formSubjectId = comment.class_subject_id;
		formAcademicYear = comment.academic_year;
		formSemester = comment.semester;
		formComment = comment.comment;
		error = '';
		showModal = true;
	}

	async function saveComment() {
		if (!formComment.trim()) {
			error = 'Comment is required';
			return;
		}
		submitting = true;
		error = '';
		success = '';
		try {
			const isUpdate = !!editingId;
			const url = isUpdate
				? `/api/admin/report-cards/comments/${editingId}`
				: '/api/admin/report-cards/comments';
			const res = await fetch(url, {
				method: isUpdate ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					student_id: formStudentId,
					class_subject_id: formSubjectId,
					academic_year: formAcademicYear,
					semester: formSemester,
					comment: formComment.trim(),
				}),
			});
			const json = await res.json();
			if (json.success) {
				success = isUpdate ? 'Comment updated' : 'Comment created';
				showModal = false;
				await loadAll();
			} else {
				error = json.error || 'Failed';
			}
		} catch {
			error = 'Failed to connect';
		}
		submitting = false;
	}

	function confirmDelete(id: string) {
		deletingId = id;
	}

	async function doDelete() {
		if (!deletingId) return;
		try {
			const res = await fetch(`/api/admin/report-cards/comments/${deletingId}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (json.success) {
				comments = comments.filter(c => c.id !== deletingId);
				success = 'Comment deleted';
			} else {
				error = json.error || 'Failed';
			}
		} catch {
			error = 'Failed to connect';
		}
		deletingId = null;
	}

	function cancelDelete() { deletingId = null; }
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="comments-page">
	<div class="page-header">
		<div>
			<h1>💬 Teacher Comments</h1>
			<p class="page-desc">Manage teacher comments/notes for student report cards</p>
		</div>
		<Button onclick={openCreate} disabled={students.length === 0 || classSubjects.length === 0}>➕ Add Comment</Button>
	</div>

	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}
	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- Filters -->
	<div class="filter-bar">
		<Select options={[{ value: '', label: 'All Students' }, ...studentOptions]} bind:value={filterStudentId} />
		<Select options={[{ value: '', label: 'All Subjects' }, ...subjectOptions]} bind:value={filterSubjectId} />
		<Input placeholder="Academic Year" bind:value={filterAcademicYear} />
		<Select options={[{ value: '', label: 'All Semesters' }, ...semesterOptions]} bind:value={filterSemester} />
		<span class="filter-count">{filteredComments.length} comments</span>
	</div>

	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if filteredComments.length === 0}
		<EmptyState icon="💬" title="No Comments" description="Add teacher comments for report cards." />
	{:else}
		<div class="comments-list">
			{#each filteredComments as comment (comment.id)}
				<div class="comment-card">
					<div class="comment-header">
						<div class="comment-info">
							<div class="comment-title-row">
								<strong>{comment.student_name || comment.student_id.slice(0, 8)}</strong>
								<Badge variant="outline">{comment.subject_name || comment.class_subject_id.slice(0, 8)}</Badge>
								<Badge variant="default">{comment.academic_year} - S{comment.semester}</Badge>
							</div>
							<div class="comment-meta">
								<span>🕐 {formatDate(comment.created_at)}</span>
							</div>
						</div>
						<div class="comment-actions">
							<Button size="sm" variant="ghost" onclick={() => openEdit(comment)}>✏️</Button>
							<Button size="sm" variant="ghost" onclick={() => confirmDelete(comment.id)}>🗑️</Button>
						</div>
					</div>
					<div class="comment-body">
						{comment.comment}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<Modal open={showModal} title={editingId ? 'Edit Comment' : 'Add Comment'} onclose={() => showModal = false}>
		<Select label="Student" options={studentOptions} bind:value={formStudentId} disabled={!!editingId} />
		<Select label="Subject" options={subjectOptions} bind:value={formSubjectId} disabled={!!editingId} />
		<Input label="Academic Year" bind:value={formAcademicYear} placeholder="e.g. 2025/2026" />
		<Select label="Semester" options={semesterOptions} bind:value={formSemester as any} />
		<Textarea label="Comment" bind:value={formComment} placeholder="Write teacher comment..." rows={5} />

		{#snippet footer()}
			<Button variant="secondary" onclick={() => showModal = false} disabled={submitting}>{t('common.cancel')}</Button>
			<Button onclick={saveComment} disabled={submitting}>
				{submitting ? 'Saving...' : editingId ? '💾 Update' : '💾 Save'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<!-- Delete Confirmation -->
{#if deletingId}
	<Modal open={!!deletingId} title="Delete Comment?" onclose={cancelDelete}>
		<p>{t('common.confirm_action')}</p>
		{#snippet footer()}
			<Button variant="secondary" onclick={cancelDelete}>{t('common.cancel')}</Button>
			<Button variant="danger" onclick={doDelete}>🗑️ Delete</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.comments-page { max-width: 900px; }

	h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.filter-bar {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}
	.filter-count { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }

	.comments-list { display: flex; flex-direction: column; gap: 12px; }
	.comment-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 8px;
	}
	.comment-info { flex: 1; }
	.comment-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 4px;
	}
	.comment-title-row strong { font-size: 15px; }
	.comment-meta { font-size: 12px; color: var(--text-secondary); }
	.comment-actions { display: flex; gap: 4px; flex-shrink: 0; }
	.comment-body {
		font-size: 14px;
		line-height: 1.6;
		color: var(--text);
		white-space: pre-wrap;
		background: rgba(0,0,0,0.1);
		border-radius: 6px;
		padding: 12px;
		margin-top: 4px;
	}
</style>
