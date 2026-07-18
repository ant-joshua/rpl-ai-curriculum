<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, CardContent, Modal, Input, Textarea, Alert, EmptyState, Loading, SearchInput, Select } from '$lib/components/ui';

	interface Course {
		id: string;
		title: string;
		slug: string;
		description: string;
		short_description: string;
		category: string;
		level: string;
		icon: string;
		cover_image: string;
		created_by: string | null;
		created_at: string;
		updated_at: string;
	}

	let courses = $state<Course[]>([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let total = $state(0);
	let page = $state(1);
	let totalPages = $state(1);
	const limit = 20;

	// Create/Edit modal
	let showFormModal = $state(false);
	let editingCourse = $state<Course | null>(null);
	let formTitle = $state('');
	let formSlug = $state('');
	let formDescription = $state('');
	let formShortDesc = $state('');
	let formCategory = $state('');
	let formLevel = $state('');
	let formIcon = $state('');
	let formCoverImage = $state('');
	let formSaving = $state(false);
	let formError = $state('');
	let formSuccess = $state('');

	// Delete
	let deletingId = $state<string | null>(null);

	onMount(() => {
		if (browser) loadCourses();
	});

	async function loadCourses() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			params.set('limit', String(limit));
			if (searchQuery) params.set('search', searchQuery);
			const res = await fetch(`/api/admin/courses?${params}`);
			const json = await res.json();
			if (json.success) {
				courses = json.data || [];
				total = json.total || 0;
				if (json.pagination) totalPages = json.pagination.totalPages || 1;
			} else {
				error = json.error || 'Gagal memuat kursus';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function doSearch() {
		page = 1;
		loadCourses();
	}

	function prevPage() { if (page > 1) { page--; loadCourses(); } }
	function nextPage() { if (page < totalPages) { page++; loadCourses(); } }

	function openCreate() {
		editingCourse = null;
		formTitle = '';
		formSlug = '';
		formDescription = '';
		formShortDesc = '';
		formCategory = '';
		formLevel = '';
		formIcon = '';
		formCoverImage = '';
		formError = '';
		formSuccess = '';
		showFormModal = true;
	}

	function openEdit(course: Course) {
		editingCourse = course;
		formTitle = course.title;
		formSlug = course.slug;
		formDescription = course.description || '';
		formShortDesc = course.short_description || '';
		formCategory = course.category || '';
		formLevel = course.level || '';
		formIcon = course.icon || '';
		formCoverImage = course.cover_image || '';
		formError = '';
		formSuccess = '';
		showFormModal = true;
	}

	async function saveCourse() {
		if (!formTitle.trim() || !formSlug.trim()) {
			formError = 'Title dan Slug wajib diisi';
			return;
		}
		formSaving = true;
		formError = '';
		formSuccess = '';
		try {
			const body = {
				title: formTitle.trim(),
				slug: formSlug.trim(),
				description: formDescription,
				short_description: formShortDesc,
				category: formCategory,
				level: formLevel,
				icon: formIcon,
				cover_image: formCoverImage,
			};
			let res;
			if (editingCourse) {
				res = await fetch(`/api/admin/courses/${editingCourse.slug}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			} else {
				res = await fetch('/api/admin/courses', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			}
			const json = await res.json();
			if (json.success) {
				formSuccess = editingCourse ? 'Kursus berhasil diperbarui' : 'Kursus berhasil dibuat';
				loadCourses();
				setTimeout(() => { showFormModal = false; }, 800);
			} else {
				formError = json.error || 'Gagal menyimpan';
			}
		} catch {
			formError = 'Gagal terhubung ke server';
		} finally {
			formSaving = false;
		}
	}

	async function deleteCourse(course: Course) {
		if (!confirm(`Hapus kursus "${course.title}"? Semua offering dan lesson terkait akan kehilangan referensi.`)) return;
		deletingId = course.id;
		try {
			const res = await fetch(`/api/admin/courses/${course.slug}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				courses = courses.filter(c => c.id !== course.id);
				total--;
			} else {
				alert(json.error || 'Gagal hapus');
			}
		} catch {
			alert('Gagal terhubung ke server');
		} finally {
			deletingId = null;
		}
	}

	function generateSlug(title: string): string {
		return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function onTitleChange() {
		if (!editingCourse) {
			formSlug = generateSlug(formTitle);
		}
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="courses-page">
	<div class="page-header">
		<div>
			<h1>📚 Kursus</h1>
			<p class="page-desc">Kelola {total} kursus dalam platform</p>
		</div>
		<Button onclick={openCreate}>+ Kursus Baru</Button>
	</div>

	<div class="filter-bar">
		<SearchInput bind:value={searchQuery} placeholder="Cari kursus..." oninput={doSearch} />
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button onclick={loadCourses}>{t('common.retry')}</Button>
		</div>
	{:else if courses.length === 0}
		<EmptyState icon="📚" title="Belum ada kursus" description="Buat kursus pertama" />
	{:else}
		<div class="course-list">
			{#each courses as course (course.id)}
				<div class="course-card">
					<div class="course-info">
						<div class="course-icon">{course.icon || '📚'}</div>
						<div class="course-detail">
							<a href="/admin/courses/{course.slug}" class="course-title">{course.title}</a>
							<div class="course-meta">
								<code class="course-slug">{course.slug}</code>
								{#if course.category}
									<Badge variant="primary">{course.category}</Badge>
								{/if}
								{#if course.level}
									<Badge variant={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'}>{course.level}</Badge>
								{/if}
							</div>
							{#if course.short_description}
								<p class="course-desc">{course.short_description}</p>
							{/if}
						</div>
					</div>
					<div class="course-actions">
						<Button size="sm" variant="secondary" href="/admin/courses/{course.slug}">{t('admin.kelola')}</Button>
						<Button size="sm" variant="ghost" onclick={() => openEdit(course)}>✏️</Button>
						<Button size="sm" variant="danger" onclick={() => deleteCourse(course)} loading={deletingId === course.id}>🗑️</Button>
					</div>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<Button size="sm" onclick={prevPage} disabled={page <= 1}>{t('admin.prev')}</Button>
				<span class="page-info">Hal {page}/{totalPages} ({total})</span>
				<Button size="sm" onclick={nextPage} disabled={page >= totalPages}>{t('admin.next_page')}</Button>
			</div>
		{/if}
	{/if}
</div>

{#if showFormModal}
	<Modal
		open={showFormModal}
		title={editingCourse ? '✏️ Edit Kursus' : '+ Kursus Baru'}
		onclose={() => { if (!formSaving) showFormModal = false; }}
	>
		{#if formError}
			<Alert variant="danger">{formError}</Alert>
		{/if}
		{#if formSuccess}
			<Alert variant="success">{formSuccess}</Alert>
		{/if}
		<Input label="Title" bind:value={formTitle} placeholder="Nama kursus" oninput={onTitleChange} />
		<Input label="Slug" bind:value={formSlug} placeholder="nama-kursus" disabled={!!editingCourse} />
		<Input label="Kategori" bind:value={formCategory} placeholder="web-development, mobile, ai..." />
		<Input label="Level" bind:value={formLevel} placeholder="beginner, intermediate, advanced" />
		<Input label="Icon (emoji)" bind:value={formIcon} placeholder="🚀" />
		<Input label="Cover Image URL" bind:value={formCoverImage} placeholder="https://..." />
		<Textarea label="Deskripsi Pendek" bind:value={formShortDesc} rows={2} placeholder="Ringkasan singkat" />
		<Textarea label="Deskripsi" bind:value={formDescription} rows={4} placeholder="Deskripsi lengkap" />
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showFormModal = false} disabled={formSaving}>{t('common.cancel')}</Button>
			<Button onclick={saveCourse} loading={formSaving}>{editingCourse ? 'Simpan' : 'Buat'}</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.courses-page { max-width: 1100px; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		gap: 16px;
		flex-wrap: wrap;
	}
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.page-desc { color: #8a8f98; font-size: 14px; margin: 0; }
	.filter-bar { margin-bottom: 20px; }
	.error-state { text-align: center; padding: 40px; color: #ef4444; }
	.error-state p { margin-bottom: 12px; }

	.course-list { display: flex; flex-direction: column; gap: 8px; }
	.course-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 10px;
		gap: 12px;
		transition: border-color 0.15s;
	}
	.course-card:hover { border-color: rgba(94,106,210,0.2); }
	.course-info { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }
	.course-icon { font-size: 32px; flex-shrink: 0; }
	.course-detail { min-width: 0; }
	.course-title {
		font-size: 15px;
		font-weight: 600;
		color: #f7f8f8;
		text-decoration: none;
	}
	.course-title:hover { color: #7170ff; }
	.course-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
	.course-slug { font-size: 12px; color: #62666d; }
	.course-desc { font-size: 13px; color: #8a8f98; margin: 4px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400px; }
	.course-actions { display: flex; gap: 4px; flex-shrink: 0; }
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-top: 24px;
	}
	.page-info { font-size: 13px; color: #8a8f98; }
</style>
