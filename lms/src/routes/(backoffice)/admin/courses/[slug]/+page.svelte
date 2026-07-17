<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, CardHeader, CardContent, Modal, Input, Select, Alert, EmptyState, Loading } from '$lib/components/ui';

	let course = $state<any>(null);
	let offerings = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Offering form modal
	let showOfferingModal = $state(false);
	let editingOffering = $state<any>(null);
	let ofName = $state('');
	let ofCode = $state('');
	let ofStatus = $state('draft');
	let ofMaxStudents = $state('');
	let ofSaving = $state(false);
	let ofError = $state('');
	let ofSuccess = $state('');

	let deletingOfId = $state<string | null>(null);

	// Prerequisite management
	let prerequisites = $state<any[]>([]);
	let allCourses = $state<any[]>([]);
	let showPrereqModal = $state(false);
	let selectedPrereqCourseId = $state('');
	let prereqLoading = $state(false);

	let slug = $state('');

	onMount(() => {
		if (browser) {
			slug = window.location.pathname.split('/').pop() || '';
			loadData();
		}
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [courseRes, offRes] = await Promise.all([
				fetch(`/api/admin/courses/${slug}`),
				fetch(`/api/admin/course-offerings`),
			]);
			const courseJson = await courseRes.json();
			if (courseJson.success) {
				course = courseJson.data;
				// Load prerequisites
				const prereqRes = await fetch(`/api/admin/courses/${slug}/prerequisites`);
				const prereqJson = await prereqRes.json();
				if (prereqJson.success) prerequisites = prereqJson.data;

				// Load all courses for prerequisite selection
				const coursesRes = await fetch('/api/admin/courses?limit=0');
				const coursesJson = await coursesRes.json();
				if (coursesJson.success) allCourses = (coursesJson.data || []).filter((c: any) => c.id !== course.id);
			} else {
				error = 'Kursus tidak ditemukan';
				return;
			}
			const offJson = await offRes.json();
			if (offJson.success) {
				offerings = (offJson.data || []).filter((o: any) => o.course_id === course.id);
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function openCreateOffering() {
		editingOffering = null;
		ofName = '';
		ofCode = '';
		ofStatus = 'draft';
		ofMaxStudents = '';
		ofError = '';
		ofSuccess = '';
		showOfferingModal = true;
	}

	function openEditOffering(o: any) {
		editingOffering = o;
		ofName = o.name || '';
		ofCode = o.code || '';
		ofStatus = o.status || 'draft';
		ofMaxStudents = o.max_students ? String(o.max_students) : '';
		ofError = '';
		ofSuccess = '';
		showOfferingModal = true;
	}

	async function saveOffering() {
		if (!ofName.trim() || !ofCode.trim()) {
			ofError = 'Nama dan kode wajib diisi';
			return;
		}
		ofSaving = true;
		ofError = '';
		ofSuccess = '';
		try {
			const body = {
				course_id: course.id,
				name: ofName.trim(),
				code: ofCode.trim(),
				status: ofStatus,
				max_students: ofMaxStudents ? parseInt(ofMaxStudents) : null,
			};
			let res;
			if (editingOffering) {
				res = await fetch(`/api/admin/course-offerings/${editingOffering.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			} else {
				res = await fetch('/api/admin/course-offerings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			}
			const json = await res.json();
			if (json.success) {
				ofSuccess = 'Berhasil disimpan';
				loadData();
				setTimeout(() => { showOfferingModal = false; }, 800);
			} else {
				ofError = json.error || 'Gagal menyimpan';
			}
		} catch {
			ofError = 'Gagal terhubung ke server';
		} finally {
			ofSaving = false;
		}
	}

	async function deleteOffering(id: string) {
		if (!confirm('Hapus offering ini? Semua lesson terkait akan kehilangan referensi.')) return;
		deletingOfId = id;
		try {
			const res = await fetch(`/api/admin/course-offerings/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				offerings = offerings.filter(o => o.id !== id);
			} else {
				alert(json.error || 'Gagal hapus');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			deletingOfId = null;
		}
	}
</script>

<svelte:head>
	<title>{course?.title || 'Kursus'} — Admin</title>
</svelte:head>

<div class="course-detail-page">
	{#if loading}
		<Loading />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button href="/admin/courses">← Kembali</Button>
		</div>
	{:else if course}
		<div class="breadcrumb">
			<a href="/admin/courses">📚 Kursus</a> / <span>{course.title}</span>
		</div>

		<div class="detail-header">
			<div>
				<h1>{course.icon || '📚'} {course.title}</h1>
				<div class="detail-meta">
					<code>{course.slug}</code>
					{#if course.category}<Badge variant="primary">{course.category}</Badge>{/if}
					{#if course.level}<Badge variant="info">{course.level}</Badge>{/if}
				</div>
				{#if course.short_description}
					<p class="detail-desc">{course.short_description}</p>
				{/if}
			</div>
			<div class="detail-actions">
				<Button size="sm" onclick={() => {}}>✏️ Edit Metadata</Button>
			</div>
		</div>

		<section class="section">
			<div class="section-header">
				<h2>📦 Course Offerings ({offerings.length})</h2>
				<Button size="sm" onclick={openCreateOffering}>+ Offering Baru</Button>
			</div>

			{#if offerings.length === 0}
				<EmptyState icon="📦" title="Belum ada offering" description="Buat offering untuk kursus ini" />
			{:else}
				<div class="offering-list">
					{#each offerings as offering}
						<div class="offering-card">
							<div class="offering-info">
								<h3 class="offering-name">{offering.name}</h3>
								<div class="offering-meta">
									<code>{offering.code}</code>
									<Badge variant={offering.status === 'active' ? 'success' : offering.status === 'draft' ? 'warning' : 'default'}>{offering.status || 'draft'}</Badge>
									{#if offering.max_students}
										<span class="offering-cap">Max: {offering.max_students} siswa</span>
									{/if}
								</div>
							</div>
							<div class="offering-actions">
								<Button size="sm" variant="secondary" href="/admin/schedules/{offering.id}">
								📅 Jadwal
							</Button>
							<Button size="sm" variant="secondary" href="/admin/offerings/{offering.id}/lessons">
									📖 Kelola Lesson
								</Button>
								<Button size="sm" variant="ghost" onclick={() => openEditOffering(offering)}>✏️</Button>
								<Button size="sm" variant="danger" onclick={() => deleteOffering(offering.id)} loading={deletingOfId === offering.id}>🗑️</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<section class="section">
			<div class="section-header">
				<h2>🔗 Prasyarat Kursus</h2>
				<Button size="sm" onclick={() => {
					selectedPrereqCourseId = '';
					showPrereqModal = true;
				}}>+ Tambah Prasyarat</Button>
			</div>

			{#if prerequisites.length === 0}
				<EmptyState icon="🔗" title="Tidak ada prasyarat" description="Kursus ini tidak memiliki prasyarat" />
			{:else}
				<div class="prereq-list">
					{#each prerequisites as prereq}
						<div class="prereq-row">
							<div class="prereq-info">
								<span class="prereq-icon">{prereq.prerequisite_icon || '📚'}</span>
								<div>
									<span class="prereq-title">{prereq.prerequisite_title}</span>
									<span class="prereq-slug">/{prereq.prerequisite_slug}</span>
								</div>
							</div>
							<Button size="sm" variant="danger" onclick={async () => {
								if (!confirm('Hapus prasyarat ini?')) return;
								const res = await fetch(`/api/admin/courses/${slug}/prerequisites`, {
									method: 'DELETE',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: prereq.id }),
								});
								const json = await res.json();
								if (json.success) {
									prerequisites = prerequisites.filter((p: any) => p.id !== prereq.id);
								}
							}}>🗑️</Button>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

{#if showOfferingModal}
	<Modal
		open={showOfferingModal}
		title={editingOffering ? '✏️ Edit Offering' : '+ Offering Baru'}
		onclose={() => { if (!ofSaving) showOfferingModal = false; }}
	>
		{#if ofError}
			<Alert variant="danger">{ofError}</Alert>
		{/if}
		{#if ofSuccess}
			<Alert variant="success">{ofSuccess}</Alert>
		{/if}
		<Input label="Nama" bind:value={ofName} placeholder="e.g. RPL AI - Kelas A" />
		<Input label="Kode" bind:value={ofCode} placeholder="e.g. RPL-AI-A" />
		<Input label="Max Students" bind:value={ofMaxStudents} type="number" placeholder="30" />
		<Select label="Status" options={[
			{ value: 'draft', label: 'Draft' },
			{ value: 'active', label: 'Active' },
			{ value: 'archived', label: 'Archived' },
		]} bind:value={ofStatus} />
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showOfferingModal = false} disabled={ofSaving}>Batal</Button>
			<Button onclick={saveOffering} loading={ofSaving}>{editingOffering ? 'Simpan' : 'Buat'}</Button>
		{/snippet}
	</Modal>
{/if}

{#if showPrereqModal}
	<Modal
		open={showPrereqModal}
		title="+ Tambah Prasyarat"
		onclose={() => showPrereqModal = false}
	>
		<Select label="Pilih Kursus Prasyarat" options={allCourses.map((c: any) => ({
			value: c.id,
			label: `${c.icon || '📚'} ${c.title} (/${c.slug})`,
		}))} bind:value={selectedPrereqCourseId} />
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showPrereqModal = false}>Batal</Button>
			<Button loading={prereqLoading} onclick={async () => {
				if (!selectedPrereqCourseId) return;
				prereqLoading = true;
				try {
					const res = await fetch(`/api/admin/courses/${slug}/prerequisites`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ prerequisite_course_id: selectedPrereqCourseId }),
					});
					const json = await res.json();
					if (json.success) {
						prerequisites = [...prerequisites, json.data];
						showPrereqModal = false;
					} else {
						alert(json.error || 'Gagal');
					}
				} catch {
					alert('Gagal terhubung');
				} finally {
					prereqLoading = false;
				}
			}}>Simpan</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.course-detail-page { max-width: 1100px; }
	.breadcrumb { font-size: 13px; color: #8a8f98; margin-bottom: 16px; }
	.breadcrumb a { color: #7170ff; text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.error-state { text-align: center; padding: 40px; }
	.error-state p { color: #ef4444; margin-bottom: 12px; }
	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.detail-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
	.detail-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
	.detail-meta code { font-size: 12px; color: #62666d; }
	.detail-desc { color: #8a8f98; font-size: 14px; margin: 8px 0 0; }
	.detail-actions { flex-shrink: 0; }
	.section { margin-top: 24px; }
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}
	.section-header h2 { font-size: 18px; font-weight: 600; margin: 0; }
	.offering-list { display: flex; flex-direction: column; gap: 8px; }
	.offering-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 10px;
		gap: 12px;
	}
	.offering-info { min-width: 0; }
	.offering-name { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: #f7f8f8; }
	.offering-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.offering-meta code { font-size: 12px; color: #62666d; }
	.offering-cap { font-size: 12px; color: #8a8f98; }
	.offering-actions { display: flex; gap: 4px; flex-shrink: 0; }
	.prereq-list { display: flex; flex-direction: column; gap: 6px; }
	.prereq-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 8px;
		gap: 12px;
	}
	.prereq-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
	.prereq-icon { font-size: 20px; }
	.prereq-title { font-size: 14px; font-weight: 600; color: #f7f8f8; display: block; }
	.prereq-slug { font-size: 12px; color: #62666d; }
</style>
