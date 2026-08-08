<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Button, Card, CardContent, EmptyState, PageHeader, Spinner, Badge } from '$lib/components/ui';

	let courses = $state<any[]>([]);
	let loading = $state(true);
	let showCreate = $state(false);
	let creating = $state(false);

	// Create form
	let newName = $state('');
	let newCode = $state('');
	let newStart = $state('');
	let newEnd = $state('');
	let newClassId = $state('');
	let classes = $state<any[]>([]);

	// Bind offering to a class (K13 path) — auto-enroll class members
	async function loadClasses() {
		try {
			const res = await fetch('/api/admin/classes-structure/classes');
			const json = await res.json();
			if (json.success) classes = json.data || [];
		} catch { classes = []; }
	}

	const statusMap: Record<string, { label: string; variant: 'secondary' | 'success' | 'warning' | 'info' | 'danger' | 'primary' }> = {
		draft: { label: 'Draft', variant: 'secondary' },
		active: { label: 'Aktif', variant: 'success' },
		archived: { label: 'Arsip', variant: 'warning' },
		completed: { label: 'Selesai', variant: 'info' },
	};

	onMount(() => {
		if (browser) { load(); loadClasses(); }
	});

	async function load() {
		loading = true;
		try {
			const res = await fetch('/api/instructor/courses');
			const json = await res.json();
			if (json.success) courses = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function createCourse() {
		if (!newName.trim()) return;
		creating = true;
		try {
			const res = await fetch('/api/instructor/courses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newName.trim(),
					code: newCode.trim() || undefined,
					start_date: newStart || undefined,
					end_date: newEnd || undefined,
					class_id: newClassId || undefined,
				}),
			});
			const json = await res.json();
			if (json.success) {
				showCreate = false;
				newName = ''; newCode = ''; newStart = ''; newEnd = ''; newClassId = '';
				load();
				location.href = `/instructor/courses/${json.data.id}`;
			} else {
				alert(json.error || 'Gagal membuat kursus');
			}
		} catch { alert('Gagal membuat kursus'); } finally {
			creating = false;
		}
	}
</script>

<PageHeader title="Course Builder" subtitle="Kelola kursus yang kamu ajar — buat, edit, publish" />

<div class="builder-toolbar">
	<Button variant="primary" onclick={() => (showCreate = !showCreate)}>+ Kursus Baru</Button>
</div>

{#if showCreate}
	<Card>
		<CardContent>
			<h3 class="form-title">Kursus Baru</h3>
			<div class="form-grid">
				<label class="field">
					<span>Nama Kursus *</span>
					<input type="text" bind:value={newName} placeholder="Contoh: Dasar Pemrograman Web" />
				</label>
				<label class="field">
					<span>Kode (opsional)</span>
					<input type="text" bind:value={newCode} placeholder="RPL-101" />
				</label>
				<label class="field">
					<span>Tanggal Mulai</span>
					<input type="date" bind:value={newStart} />
				</label>
				<label class="field">
					<span>Tanggal Selesai</span>
					<input type="date" bind:value={newEnd} />
				</label>
				<label class="field">
					<span>Terikat Kelas (opsional)</span>
					<select bind:value={newClassId}>
						<option value="">— Mandiri / Self-paced —</option>
						{#each classes as c}
							<option value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
						{/each}
					</select>
					{#if newClassId}
						<span class="field-hint">✨ Anggota kelas otomatis di-enroll saat kursus dibuat</span>
					{/if}
				</label>
			</div>
			<div class="form-actions">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Batal</Button>
				<Button variant="primary" onclick={createCourse} loading={creating}>Buat Kursus</Button>
			</div>
		</CardContent>
	</Card>
{/if}

{#if loading}
	<div class="center"><Spinner /></div>
{:else if courses.length === 0}
	<EmptyState icon="book-open" title="Belum ada kursus" description="Buat kursus pertamamu dan mulai bangun materi." />
{:else}
	<div class="course-list">
		{#each courses as c}
			<a class="course-card" href="/instructor/courses/{c.id}">
				<div class="course-card-main">
					<h3>{c.name}</h3>
					<p class="course-code">{c.code || 'Tanpa kode'}</p>
					<div class="course-meta">
						<span>👥 {c.enrolled_count ?? 0} siswa</span>
						<span>📄 {c.lesson_count ?? 0} lesson</span>
						{#if c.class_name}
							<span class="class-tag">🏫 {c.class_name}</span>
						{/if}
					</div>
				</div>
				<div class="course-card-side">
					<Badge variant={(statusMap[c.status]?.variant || 'secondary') as any}>{statusMap[c.status]?.label || c.status}</Badge>
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	.builder-toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
	.form-title { margin: 0 0 14px; font-size: 16px; }
	.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
	.field input, .field select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-family: inherit; background: var(--bg-secondary); color: var(--text); }
	.field-hint { font-size: 12px; font-weight: 400; color: var(--info); }
	.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
	.center { display: flex; justify-content: center; padding: 40px; }
	.course-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
	.course-card {
		display: flex; justify-content: space-between; align-items: flex-start;
		background: white; border: 1px solid var(--border); border-radius: 12px;
		padding: 16px; text-decoration: none; color: inherit;
		transition: box-shadow 0.2s, transform 0.2s;
	}
	.course-card:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); transform: translateY(-2px); }
	.course-card h3 { margin: 0 0 4px; font-size: 15px; }
	.course-code { font-size: 12px; color: var(--text-muted); margin: 0 0 10px; }
	.course-meta { display: flex; gap: 14px; font-size: 12px; color: var(--text-secondary); }
	.class-tag { padding: 2px 8px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 600; }
	.course-card-side { flex-shrink: 0; }
</style>
