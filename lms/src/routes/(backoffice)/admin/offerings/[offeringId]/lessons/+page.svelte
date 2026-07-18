<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Modal, Input, Select, Textarea, Alert, EmptyState, Loading } from '$lib/components/ui';

	interface Lesson {
		id: string;
		course_offering_id: string;
		title: string;
		slug: string;
		order_index: number;
		duration_minutes: number | null;
		is_optional: number;
		status: string;
		unlock_days: number | null;
		created_at: string;
		updated_at: string;
	}

	let offering = $state<any>(null);
	let lessons = $state<Lesson[]>([]);
	let loading = $state(true);
	let error = $state('');
	let offeringId = $state('');

	// Lesson form
	let showLessonModal = $state(false);
	let editingLesson = $state<Lesson | null>(null);
	let lesTitle = $state('');
	let lesSlug = $state('');
	let lesDuration = $state('');
	let lesOptional = $state('no');
	let lesStatus = $state('draft');
	let lesSaving = $state(false);
	let lesError = $state('');
	let lesSuccess = $state('');

	let deletingId = $state<string | null>(null);

	onMount(() => {
		if (browser) {
			const pathParts = window.location.pathname.split('/');
			offeringId = pathParts[3];
			loadData();
		}
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [offRes, lesRes] = await Promise.all([
				fetch(`/api/admin/course-offerings/${offeringId}`),
				fetch(`/api/admin/lessons?course_offering_id=${offeringId}&limit=0`),
			]);
			const offJson = await offRes.json();
			if (offJson.success) offering = offJson.data;
			const lesJson = await lesRes.json();
			if (lesJson.success) {
				lessons = (lesJson.data || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
			}
		} catch {
			error = 'Gagal memuat data';
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editingLesson = null;
		lesTitle = '';
		lesSlug = '';
		lesDuration = '';
		lesOptional = 'no';
		lesStatus = 'draft';
		lesError = '';
		lesSuccess = '';
		showLessonModal = true;
	}

	function openEdit(lesson: Lesson) {
		editingLesson = lesson;
		lesTitle = lesson.title;
		lesSlug = lesson.slug;
		lesDuration = lesson.duration_minutes ? String(lesson.duration_minutes) : '';
		lesOptional = lesson.is_optional ? 'yes' : 'no';
		lesStatus = lesson.status || 'draft';
		lesError = '';
		lesSuccess = '';
		showLessonModal = true;
	}

	function generateSlug(title: string): string {
		return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function onTitleInput() {
		if (!editingLesson) lesSlug = generateSlug(lesTitle);
	}

	async function saveLesson() {
		if (!lesTitle.trim() || (!editingLesson && !lesSlug.trim())) {
			lesError = 'Title wajib diisi';
			return;
		}
		lesSaving = true;
		lesError = '';
		lesSuccess = '';
		try {
			const body = {
				course_offering_id: offeringId,
				title: lesTitle.trim(),
				slug: editingLesson ? editingLesson.slug : lesSlug.trim(),
				duration_minutes: lesDuration ? parseInt(lesDuration) : null,
				is_optional: lesOptional === 'yes' ? 1 : 0,
				status: lesStatus,
			};
			let res;
			if (editingLesson) {
				res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			} else {
				res = await fetch('/api/admin/lessons', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			}
			const json = await res.json();
			if (json.success) {
				lesSuccess = 'Berhasil disimpan';
				loadData();
				setTimeout(() => { showLessonModal = false; }, 800);
			} else {
				lesError = json.error || 'Gagal menyimpan';
			}
		} catch {
			lesError = 'Gagal terhubung';
		} finally {
			lesSaving = false;
		}
	}

	async function deleteLesson(id: string) {
		if (!confirm('Hapus lesson ini?')) return;
		deletingId = id;
		try {
			const res = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				lessons = lessons.filter(l => l.id !== id);
			} else {
				alert(json.error || 'Gagal hapus');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			deletingId = null;
		}
	}

	async function moveLesson(id: string, direction: 'up' | 'down') {
		const idx = lessons.findIndex(l => l.id === id);
		if (idx < 0) return;
		if (direction === 'up' && idx === 0) return;
		if (direction === 'down' && idx === lessons.length - 1) return;

		const newOrder = [...lessons];
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		[newOrder[idx].order_index, newOrder[swapIdx].order_index] = [newOrder[swapIdx].order_index, newOrder[idx].order_index];
		[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

		// Optimistic update
		lessons = newOrder;

		try {
			const orderPayload = newOrder.map((l, i) => ({ id: l.id, order_index: i }));
			const res = await fetch('/api/admin/lessons/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order: orderPayload }),
			});
			const json = await res.json();
			if (!json.success) {
				loadData(); // revert on fail
			}
		} catch {
			loadData(); // revert on error
		}
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="lessons-page">
	{#if loading}
		<Loading />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button href="/admin/courses">← Kembali</Button>
		</div>
	{:else}
		<div class="breadcrumb">
			<a href="/admin/courses">📚 Kursus</a>
			/ <span>{offering?.name || 'Lesson Builder'}</span>
		</div>

		<div class="page-header">
			<div>
				<h1>📖 {offering?.name || 'Lesson Builder'}</h1>
				<p class="page-desc">
					{offering?.code ? `Kode: ${offering.code}` : ''}
					{offering?.status ? `| Status: ${offering.status}` : ''}
				</p>
			</div>
			<Button onclick={openCreate}>+ Lesson Baru</Button>
		</div>

		{#if lessons.length === 0}
			<EmptyState icon="📖" title="Belum ada lesson" description="Buat lesson pertama untuk offering ini" />
		{:else}
			<div class="lesson-list">
				{#each lessons as lesson, i (lesson.id)}
					<div class="lesson-card">
						<div class="lesson-order-handle">
							<Button class="move-btn" onclick={() => moveLesson(lesson.id, 'up')} disabled={i === 0} title="Naik">↑</Button>
							<span class="order-num">{i + 1}</span>
							<Button class="move-btn" onclick={() => moveLesson(lesson.id, 'down')} disabled={i === lessons.length - 1} title="Turun">↓</Button>
						</div>
						<div class="lesson-info">
							<h3 class="lesson-title">{lesson.title}</h3>
							<div class="lesson-meta">
								<code class="lesson-slug">{lesson.slug}</code>
								<Badge variant={lesson.status === 'published' ? 'success' : lesson.status === 'draft' ? 'warning' : 'default'}>{lesson.status}</Badge>
								{#if lesson.is_optional}
									<Badge variant="info">Optional</Badge>
								{/if}
								{#if lesson.duration_minutes}
									<span class="lesson-duration">{lesson.duration_minutes} menit</span>
								{/if}
							</div>
						</div>
						<div class="lesson-actions">
							<Button size="sm" variant="secondary" href="/admin/offerings/{offeringId}/lessons/{lesson.id}/content">
								🧩 Konten
							</Button>
							<Button size="sm" variant="ghost" onclick={() => openEdit(lesson)}>✏️</Button>
							<Button size="sm" variant="danger" onclick={() => deleteLesson(lesson.id)} loading={deletingId === lesson.id}>🗑️</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

{#if showLessonModal}
	<Modal
		open={showLessonModal}
		title={editingLesson ? '✏️ Edit Lesson' : '+ Lesson Baru'}
		onclose={() => { if (!lesSaving) showLessonModal = false; }}
	>
		{#if lesError}
			<Alert variant="danger">{lesError}</Alert>
		{/if}
		{#if lesSuccess}
			<Alert variant="success">{lesSuccess}</Alert>
		{/if}
		<Input label="Title" bind:value={lesTitle} placeholder="Nama lesson" oninput={onTitleInput} />
		<Input label="Slug" bind:value={lesSlug} placeholder="nama-lesson" disabled={!!editingLesson} />
		<Input label="Durasi (menit)" bind:value={lesDuration} type="number" placeholder="45" />
		<Select label="Status" options={[
			{ value: 'draft', label: 'Draft' },
			{ value: 'published', label: 'Published' },
			{ value: 'archived', label: 'Archived' },
		]} bind:value={lesStatus} />
		<Select label="Optional" options={[
			{ value: 'no', label: 'Tidak (wajib)' },
			{ value: 'yes', label: 'Ya (opsional)' },
		]} bind:value={lesOptional} />
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showLessonModal = false} disabled={lesSaving}>{t('common.cancel')}</Button>
			<Button onclick={saveLesson} loading={lesSaving}>{editingLesson ? 'Simpan' : 'Buat'}</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.lessons-page { max-width: 1100px; }
	.breadcrumb { font-size: 13px; color: #8a8f98; margin-bottom: 16px; }
	.breadcrumb a { color: #7170ff; text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.page-desc { color: #8a8f98; font-size: 14px; margin: 0; }
	.error-state { text-align: center; padding: 40px; color: #ef4444; }

	.lesson-list { display: flex; flex-direction: column; gap: 6px; }
	.lesson-card {
		display: flex;
		align-items: center;
		padding: 12px 14px;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 10px;
		gap: 12px;
		transition: border-color 0.15s;
	}
	.lesson-card:hover { border-color: rgba(94,106,210,0.2); }
	.lesson-order-handle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}
	.move-btn {
		background: none;
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 4px;
		color: #8a8f98;
		cursor: pointer;
		font-size: 12px;
		padding: 2px 6px;
		line-height: 1;
		transition: all 0.12s;
	}
	.move-btn:hover:not(:disabled) { color: #f7f8f8; background: rgba(255,255,255,0.04); }
	.move-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.order-num { font-size: 13px; font-weight: 600; color: #62666d; min-width: 16px; text-align: center; }
	.lesson-info { flex: 1; min-width: 0; }
	.lesson-title { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: #f7f8f8; }
	.lesson-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.lesson-slug { font-size: 12px; color: #62666d; }
	.lesson-duration { font-size: 12px; color: #8a8f98; }
	.lesson-actions { display: flex; gap: 4px; flex-shrink: 0; }
</style>
