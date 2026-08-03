<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Button, Card, CardContent, Badge, EmptyState, Spinner, Alert } from '$lib/components/ui';

	let curricula = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Form
	let showForm = $state(false);
	let formName = $state('');
	let formType = $state('custom');
	let formAuthority = $state('sekolah');
	let formDesc = $state('');
	let formDefault = $state(false);
	let saving = $state(false);

	async function load() {
		loading = true;
		try {
			const res = await fetch('/api/curricula');
			const json = await res.json();
			if (json.success) curricula = json.data || [];
			else error = json.error || 'Gagal load';
		} catch { error = 'Gagal load'; } finally { loading = false; }
	}

	onMount(() => { if (browser) load(); });

	async function create() {
		if (!formName.trim()) return;
		saving = true;
		try {
			const res = await fetch('/api/curricula', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName.trim(), type: formType, authority: formAuthority,
					description: formDesc, is_default: formDefault,
				}),
			});
			const json = await res.json();
			if (json.success) {
				showForm = false; formName = ''; formDesc = ''; formDefault = false;
				load();
			} else error = json.error || 'Gagal simpan';
		} catch { error = 'Gagal simpan'; } finally { saving = false; }
	}

	async function setActive(c: any) {
		try {
			await fetch(`/api/curricula/${c.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ is_active: c.is_active ? 0 : 1 }),
			});
			load();
		} catch { /* ignore */ }
	}

	async function setDefault(c: any) {
		try {
			await fetch(`/api/curricula/${c.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ is_default: true }),
			});
			load();
		} catch { /* ignore */ }
	}

	async function remove(c: any) {
		if (!confirm(`Hapus kurikulum "${c.name}"?`)) return;
		try {
			const res = await fetch(`/api/curricula/${c.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (!json.success) error = json.error || 'Gagal hapus';
			else load();
		} catch { error = 'Gagal hapus'; }
	}

	const typeLabels: Record<string, string> = {
		merdeka: 'Merdeka', k13: 'K13', ib: 'IB', cambridge: 'Cambridge',
		sekolah: 'Sekolah', institusi: 'Institusi', custom: 'Custom',
	};
	const authLabels: Record<string, string> = {
		kemdikbud: 'Kemendikbud', sekolah: 'Sekolah', institusi: 'Institusi', internasional: 'Internasional',
	};
</script>

<div class="page-head">
	<h1>Kurikulum Mapel</h1>
	<p>Daftar kurikulum untuk membedakan course &amp; hasil generate AIEdu.</p>
</div>

{#if error}
	<Alert variant="danger" class="mb">{error}</Alert>
{/if}

<div class="toolbar">
	<Button variant="primary" size="sm" onclick={() => (showForm = !showForm)}>
		{showForm ? 'Batal' : '+ Kurikulum Baru'}
	</Button>
</div>

{#if showForm}
	<Card class="mb">
		<CardContent>
			<h3 class="form-title">Kurikulum Baru</h3>
			<div class="form-grid">
				<label class="field"><span>Nama *</span><input type="text" bind:value={formName} placeholder="Contoh: Kurikulum Yayasan Harapan" /></label>
				<label class="field">
					<span>Tipe</span>
					<select bind:value={formType}>
						<option value="merdeka">Merdeka</option>
						<option value="k13">K13</option>
						<option value="ib">IB</option>
						<option value="cambridge">Cambridge</option>
						<option value="sekolah">Sekolah</option>
						<option value="institusi">Institusi</option>
						<option value="custom">Custom</option>
					</select>
				</label>
				<label class="field">
					<span>Authority</span>
					<select bind:value={formAuthority}>
						<option value="kemdikbud">Kemendikbud</option>
						<option value="sekolah">Sekolah</option>
						<option value="institusi">Institusi</option>
						<option value="internasional">Internasional</option>
					</select>
				</label>
				<label class="field"><span>Deskripsi</span><input type="text" bind:value={formDesc} placeholder="Deskripsi singkat" /></label>
			</div>
			<label class="checkbox"><input type="checkbox" bind:checked={formDefault} /> Jadikan default</label>
			<div class="form-actions">
				<Button variant="primary" onclick={create} loading={saving}>Simpan</Button>
			</div>
		</CardContent>
	</Card>
{/if}

{#if loading}
	<div class="center"><Spinner /></div>
{:else if curricula.length === 0}
	<EmptyState icon="layers" title="Belum ada kurikulum" />
{:else}
	<div class="cur-list">
		{#each curricula as c (c.id)}
			<Card>
				<CardContent>
					<div class="cur-row">
						<div class="cur-main">
							<div class="cur-title">
								{c.name}
								{#if c.is_default}<Badge variant="primary" as any>Default</Badge>{/if}
								<Badge variant={(c.is_active ? 'success' : 'secondary') as any}>{c.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
							</div>
							<p class="cur-desc">{c.description || '—'}</p>
							<p class="cur-meta">
								Tipe: <strong>{typeLabels[c.type] || c.type}</strong> ·
								Authority: <strong>{authLabels[c.authority] || c.authority}</strong>
							</p>
						</div>
						<div class="cur-actions">
							{#if !c.is_default}
								<Button size="sm" variant="secondary" onclick={() => setDefault(c)}>Set Default</Button>
							{/if}
							<Button size="sm" variant="secondary" onclick={() => setActive(c)}>
								{c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
							</Button>
							{#if !c.is_default}
								<Button size="sm" variant="danger" onclick={() => remove(c)}>Hapus</Button>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{/if}

<style>
	.page-head { margin-bottom: 20px; }
	.page-head h1 { font-size: 20px; margin: 0 0 4px; }
	.page-head p { color: var(--text-secondary); font-size: 13px; margin: 0; }
	.toolbar { margin-bottom: 16px; }
	.mb { margin-bottom: 16px; }
	.form-title { font-size: 15px; margin: 0 0 12px; }
	.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
	.field input, .field select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
	.checkbox { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 12px; }
	.form-actions { display: flex; gap: 8px; }
	.center { display: flex; justify-content: center; padding: 40px; }
	.cur-list { display: flex; flex-direction: column; gap: 10px; }
	.cur-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
	.cur-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; }
	.cur-desc { color: var(--text-secondary); font-size: 13px; margin: 4px 0; }
	.cur-meta { color: var(--text-muted); font-size: 12px; margin: 0; }
	.cur-actions { display: flex; gap: 6px; flex-shrink: 0; }
</style>
