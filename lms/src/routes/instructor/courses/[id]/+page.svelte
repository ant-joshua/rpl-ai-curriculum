<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Button, Card, CardContent, EmptyState, PageHeader, Spinner, Badge } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();
	let courseId = $derived($page.params.id);

	let course = $state<any>(null);
	let lessons = $state<any[]>([]);
	let loading = $state(true);
	let saving = $state(false);

	// Course form
	let courseName = $state('');
	let courseStatus = $state('draft');
	let courseStart = $state('');
	let courseEnd = $state('');
	let curriculumId = $state('');
	let curricula = $state<any[]>([]);

	onMount(() => {
		if (browser) {
			load();
			fetch('/api/curricula')
				.then((r) => r.json())
				.then((j) => {
					if (j.success) curricula = j.data || [];
				})
				.catch(() => {});
		}
	});
	// Lesson form
	let showLessonForm = $state(false);
	let editingLesson = $state<any>(null);
	let lessonTitle = $state('');
	let lessonContent = $state('');
	let lessonDuration = $state('30');
	let lessonOptional = $state(false);
	let lessonStatus = $state('draft');
	let savingLesson = $state(false);

	// AIEdu docs attached to current lesson
	let aieduDocs = $state<any[]>([]);
	let availableDocs = $state<any[]>([]);
	let showAttachDoc = $state(false);
	let attachingDoc = $state('');

	onMount(() => {
		if (browser) load();
	});

	async function load() {
		loading = true;
		try {
			const res = await fetch(`/api/instructor/courses/${courseId}`);
			const json = await res.json();
			if (json.success) {
				course = json.data.offering || json.data;
				courseName = course.name || '';
				courseStatus = course.status || 'draft';
				courseStart = course.start_date || '';
				courseEnd = course.end_date || '';
				curriculumId = course.curriculum_id || '';
				lessons = json.data.lessons || course.lessons || [];
			}
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function saveCourse() {
		saving = true;
		try {
			const res = await fetch(`/api/instructor/courses/${courseId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: courseName.trim() || undefined,
					status: courseStatus,
					start_date: courseStart || null,
					end_date: courseEnd || null,
					curriculum_id: curriculumId || undefined,
				}),
			});
			const json = await res.json();
			if (json.success) {
				load();
				alert('Perubahan tersimpan ✅');
			} else {
				alert(json.error || 'Gagal menyimpan');
			}
		} catch { alert('Gagal menyimpan'); } finally {
			saving = false;
		}
	}

	function openNewLesson() {
		editingLesson = null;
		lessonTitle = ''; lessonContent = ''; lessonDuration = '30';
		lessonOptional = false; lessonStatus = 'draft';
		aieduDocs = [];
		showLessonForm = true;
	}

	function openEditLesson(l: any) {
		editingLesson = l;
		lessonTitle = l.title || '';
		lessonContent = l.content || '';
		lessonDuration = String(l.duration_minutes || 30);
		lessonOptional = l.is_optional == 1;
		lessonStatus = l.status || 'draft';
		showLessonForm = true;
		loadLessonDocs();
	}

	

	async function loadLessonDocs() {
		if (!editingLesson?.id) return;
		try {
			const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${editingLesson.id}/docs`);
			const json = await res.json();
			if (json.success) aieduDocs = json.data || [];
		} catch { aieduDocs = []; }
	}

	async function loadAvailableDocs() {
		try {
			const res = await fetch('/api/aiedu/bank?mine=1');
			const json = await res.json();
			availableDocs = json.success ? (json.data || []) : [];
		} catch { availableDocs = []; }
	}

	async function attachDoc(docId: string) {
		if (!editingLesson?.id) return;
		attachingDoc = docId;
		try {
			const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${editingLesson.id}/docs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ document_id: docId }),
			});
			const json = await res.json();
			if (json.success) { loadLessonDocs(); showAttachDoc = false; }
			else alert(json.error || 'Gagal attach');
		} catch { alert('Gagal attach'); } finally { attachingDoc = ''; }
	}

	async function detachDoc(linkId: string) {
		if (!editingLesson?.id) return;
		try {
			const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${editingLesson.id}/docs/${linkId}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (json.success) loadLessonDocs();
			else alert(json.error || 'Gagal detach');
		} catch { alert('Gagal detach'); }
	}

	const DOC_TYPE_LABELS: Record<string, string> = {
		cp: 'CP', atp: 'ATP', modul_ajar: 'Modul Ajar', lkpd: 'LKPD', soal: 'Soal', rubrik: 'Rubrik',
		ppt: 'PPT', buku_guru: 'Buku Guru', buku_siswa: 'Buku Siswa', panduan_asesmen: 'Panduan Asesmen',
		panduan_projek: 'Panduan Projek',
	};

	async function saveLesson() {
		if (!lessonTitle.trim()) return;
		savingLesson = true;
		try {
			const url = editingLesson
				? `/api/instructor/courses/${courseId}/lessons/${editingLesson.id}`
				: `/api/instructor/courses/${courseId}/lessons`;
			const res = await fetch(url, {
				method: editingLesson ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: lessonTitle.trim(),
					content: lessonContent,
					duration_minutes: Number(lessonDuration) || 30,
					is_optional: lessonOptional,
					...(editingLesson ? { status: lessonStatus } : {}),
				}),
			});
			const json = await res.json();
			if (json.success) {
				showLessonForm = false;
				load();
			} else {
				alert(json.error || 'Gagal menyimpan lesson');
			}
		} catch { alert('Gagal menyimpan lesson'); } finally {
			savingLesson = false;
		}
	}

	async function deleteLesson(l: any) {
		if (!confirm(`Hapus lesson "${l.title}"?`)) return;
		try {
			await fetch(`/api/instructor/courses/${courseId}/lessons/${l.id}`, { method: 'DELETE' });
			load();
		} catch { alert('Gagal menghapus'); }
	}

	async function togglePublish() {
		const next = courseStatus === 'active' ? 'draft' : 'active';
		courseStatus = next;
		await saveCourse();
	}
</script>

<PageHeader title={course?.name || 'Course Editor'} subtitle="Builder — atur materi dan publish" />

{#if loading}
	<div class="center"><Spinner /></div>
{:else if !course}
	<EmptyState icon="search-x" title="Kursus tidak ditemukan" />
{:else}
	<div class="editor-layout">
		<!-- Left: course settings -->
		<div class="editor-left">
			<Card>
				<CardContent>
					<h3 class="section-title">Pengaturan Kursus</h3>
					<label class="field">
						<span>Nama Kursus</span>
						<input type="text" bind:value={courseName} />
					</label>
					<div class="form-row">
						<label class="field">
							<span>Mulai</span>
							<input type="date" bind:value={courseStart} />
						</label>
						<label class="field">
							<span>Selesai</span>
							<input type="date" bind:value={courseEnd} />
						</label>
					</div>
					<label class="field">
						<span>Kurikulum</span>
						<select bind:value={curriculumId}>
							<option value="">Default (Kurikulum Merdeka)</option>
							{#each curricula as c}
								<option value={c.id}>{c.name}{c.is_default ? ' (default)' : ''}</option>
							{/each}
						</select>
					</label>
					<label class="field">
						<span>Status</span>
						<select bind:value={courseStatus}>
							<option value="draft">Draft</option>
							<option value="active">Aktif</option>
							<option value="archived">Arsip</option>
						</select>
					</label>
					<div class="form-actions">
						<Button variant="primary" onclick={saveCourse} loading={saving}>Simpan</Button>
						<Button variant={(courseStatus === 'active' ? 'secondary' : 'success') as any} onclick={togglePublish}>
						{courseStatus === 'active' ? 'Unpublish' : 'Publish'}
					</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h3 class="section-title">Info</h3>
					<p class="info-line">Kode: <strong>{course.code || '-'}</strong></p>
					<p class="info-line">Kurikulum: <strong>{course.curriculum_name || 'Kurikulum Merdeka (default)'}</strong></p>
					<p class="info-line">Siswa terdaftar: <strong>{course.enrolled_count ?? 0}</strong></p>
					<p class="info-line">Status saat ini: <Badge variant="secondary" as any>{course.status}</Badge></p>
				</CardContent>
			</Card>
		</div>

		<!-- Right: lessons -->
		<div class="editor-right">
			<div class="lessons-header">
				<h3 class="section-title">Materi ({lessons.length})</h3>
				<div class="header-actions">
					<a href={`/instructor/courses/${courseId}/submissions`}>
						<Button size="sm" variant="secondary">📋 Review Tugas</Button>
					</a>
					<a href={`/api/instructor/courses/${courseId}/export`} download>
						<Button size="sm" variant="secondary">📥 Export Markdown</Button>
					</a>
					<Button size="sm" variant="primary" onclick={openNewLesson}>+ Lesson</Button>
				</div>
			</div>

			{#if showLessonForm}
				<Card>
					<CardContent>
						<h4 class="form-title">{editingLesson ? 'Edit Lesson' : 'Lesson Baru'}</h4>
						<label class="field">
							<span>Judul *</span>
							<input type="text" bind:value={lessonTitle} placeholder="Contoh: Pengenalan HTML" />
						</label>
						<label class="field">
							<span>Konten (Markdown/HTML)</span>
							<textarea bind:value={lessonContent} rows={8} placeholder="Tulis materi di sini..."></textarea>
						</label>
						<div class="form-row">
							<label class="field">
								<span>Durasi (menit)</span>
								<input type="number" bind:value={lessonDuration} min="1" />
							</label>
							{#if editingLesson}
								<label class="field">
									<span>Status</span>
									<select bind:value={lessonStatus}>
										<option value="draft">Draft</option>
										<option value="published">Published</option>
										<option value="archived">Archived</option>
									</select>
								</label>
							{/if}
						</div>
						<label class="checkbox">
							<input type="checkbox" bind:checked={lessonOptional} />
							<span>Materi opsional</span>
						</label>
						<div class="form-actions">
							<Button variant="secondary" onclick={() => (showLessonForm = false)}>Batal</Button>
							<Button variant="primary" onclick={saveLesson} loading={savingLesson}>Simpan Lesson</Button>
						</div>

						{#if editingLesson}
							<div class="aiedu-attach">
								<h4 class="form-title">📚 Materi AIEdu Terkait</h4>
								{#if aieduDocs.length === 0}
									<p class="attach-empty">Belum ada materi ter-attach.</p>
								{:else}
									{#each aieduDocs as d (d.link_id)}
										<div class="attach-row">
											<span class="attach-type">{DOC_TYPE_LABELS[d.doc_type] || d.doc_type}</span>
											<span class="attach-title">{d.title}</span>
											<button class="attach-del" onclick={() => detachDoc(d.link_id)} title="Lepas">✕</button>
										</div>
									{/each}
								{/if}
								{#if showAttachDoc}
									<button class="attach-toggle" onclick={loadAvailableDocs}>+ Pilih dari Materiku</button>
									<div class="attach-pick">
										{#each availableDocs as d (d.id)}
											<button class="attach-option" onclick={() => attachDoc(d.id)} disabled={attachingDoc === d.id}>
												{DOC_TYPE_LABELS[d.doc_type] || d.doc_type} — {d.title}
											</button>
										{:else}
											<p class="attach-empty">Tidak ada materi di bank. Generate dulu di AIEdu.</p>
										{/each}
									</div>
								{:else}
									<button class="attach-toggle" onclick={() => { showAttachDoc = true; loadAvailableDocs(); }}>+ Attach Materi AIEdu</button>
								{/if}
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			{#if lessons.length === 0}
				<EmptyState icon="file-text" title="Belum ada lesson" description="Klik + Lesson untuk menambah materi pertama." />
			{:else}
				<div class="lesson-list">
					{#each lessons as l, i}
						<div class="lesson-row">
							<span class="lesson-order">{i + 1}</span>
							<div class="lesson-main">
								<span class="lesson-title">{l.title}</span>
								<span class="lesson-sub">
									{l.duration_minutes ? `${l.duration_minutes} menit` : '—'}
									{l.is_optional == 1 ? ' · opsional' : ''}
								</span>
							</div>
							<Badge variant={(l.status === 'published' ? 'success' : 'secondary') as any}>{l.status}</Badge>
							<div class="lesson-actions">
								<Button size="sm" variant="secondary" onclick={() => openEditLesson(l)}>Edit</Button>
								<Button size="sm" variant="danger" onclick={() => deleteLesson(l)}>Hapus</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.center { display: flex; justify-content: center; padding: 40px; }
	.editor-layout { display: grid; grid-template-columns: 320px 1fr; gap: 18px; align-items: start; }
	.section-title { margin: 0 0 14px; font-size: 15px; }
	.form-title { margin: 0 0 12px; font-size: 14px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; margin-bottom: 12px; }
	.field input, .field select, .field textarea {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box;
	}
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	.form-actions { display: flex; gap: 8px; margin-top: 8px; }
	.checkbox { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 12px; }
	.info-line { font-size: 13px; color: var(--text-secondary); margin: 4px 0; }
	.info-line strong { color: var(--text); }
	.lessons-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; }
	.header-actions { display: flex; align-items: center; gap: 8px; }
	.lesson-list { display: flex; flex-direction: column; gap: 8px; }
	.lesson-row {
		display: flex; align-items: center; gap: 12px;
		background: white; border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px;
	}
	.lesson-order {
		width: 26px; height: 26px; border-radius: 8px; background: var(--surface);
		display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
		color: var(--text-secondary); flex-shrink: 0;
	}
	.lesson-main { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.lesson-title { font-size: 14px; font-weight: 600; }
	.lesson-sub { font-size: 12px; color: var(--text-muted); }
	.lesson-actions { display: flex; gap: 6px; flex-shrink: 0; }
	.aiedu-attach { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); }
	.aiedu-attach .form-title { margin-bottom: 10px; }
	.attach-empty { font-size: 12px; color: var(--text-muted); margin: 0 0 8px; }
	.attach-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--surface); font-size: 12px; }
	.attach-type { font-size: 10px; font-weight: 700; background: var(--surface); padding: 2px 7px; border-radius: 6px; color: var(--primary); flex-shrink: 0; }
	.attach-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.attach-del { background: none; border: none; cursor: pointer; font-size: 11px; color: var(--text-muted); }
	.attach-del:hover { color: #ef4444; }
	.attach-toggle { background: none; border: none; cursor: pointer; font-size: 12px; color: var(--primary); font-weight: 600; padding: 6px 0; }
	.attach-pick { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; margin-top: 8px; }
	.attach-option { text-align: left; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: white; font-size: 12px; cursor: pointer; }
	.attach-option:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, white); }

	@media (max-width: 768px) {
		.editor-layout { grid-template-columns: 1fr; }
		.lesson-row { flex-wrap: wrap; }
	}
</style>
