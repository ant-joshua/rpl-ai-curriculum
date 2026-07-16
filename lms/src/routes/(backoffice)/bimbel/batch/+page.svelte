<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, Modal } from '$lib/components/ui/index.js';

	type Batch = {
		id: string;
		name: string;
		type: string;
		studentCount: number;
		status: string;
		createdAt: string;
	};

	let loading = $state(true);
	let error = $state('');
	let batches: Batch[] = $state([]);
	let showModal = $state(false);
	let saving = $state(false);

	onMount(() => {
		if (!browser) return;
		loadBatches();
	});

	async function loadBatches() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/bimbel/batch');
			const json = await res.json();
			if (json.success) batches = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let formName = $state('');
	let formType = $state('');

	function openCreate() { showModal = true; formName = ''; formType = 'regular'; }
	function closeModal() { showModal = false; }

	async function createBatch() {
		if (!formName.trim()) return;
		saving = true;
		try {
			const res = await fetch('/api/bimbel/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: formName.trim(), type: formType }),
			});
			const json = await res.json();
			if (json.success) { closeModal(); loadBatches(); }
			else error = json.error || 'Gagal membuat batch';
		} catch { error = 'Gagal membuat batch'; }
		finally { saving = false; }
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active': return 'success';
			case 'completed': return 'info';
			case 'cancelled': return 'danger';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'active': return 'Aktif';
			case 'completed': return 'Selesai';
			case 'cancelled': return 'Dibatalkan';
			default: return status;
		}
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Batch Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel">← Bimbel Dashboard</a></div>
		<h1>📦 Batch Bimbel</h1>
		<p class="subtitle">Daftar grup bimbingan belajar</p>
	</div>

	<div class="toolbar">
		<button class="btn btn-secondary btn-sm" onclick={openCreate}>+ Buat Batch</button>
		<button class="btn btn-ghost btn-sm" onclick={loadBatches}>🔄 Refresh</button>
	</div>

	{#if loading}
		<Loading message="Memuat batch..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if batches.length === 0}
		<EmptyState icon="📦" title="Belum Ada Batch" description="Buat batch baru untuk memulai." />
	{:else}
		<div class="batch-list">
			{#each batches as b}
				<a href="/bimbel/batch/{b.id}" class="batch-card">
					<div class="batch-top">
						<span class="batch-name">{b.name}</span>
						<Badge variant={getStatusBadge(b.status)}>{getStatusLabel(b.status)}</Badge>
					</div>
					<div class="batch-meta">
						<span class="meta-item">
							<span class="meta-label">Tipe</span>
							<span class="meta-value">{b.type || '-'}</span>
						</span>
						<span class="meta-item">
							<span class="meta-label">Siswa</span>
							<span class="meta-value">{b.studentCount}</span>
						</span>
						<span class="meta-item">
							<span class="meta-label">Dibuat</span>
							<span class="meta-value">{formatDate(b.createdAt)}</span>
						</span>
					</div>
					<div class="batch-footer">
						<span class="enter-link">Detail →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showModal} title="Buat Batch Baru" onclose={closeModal}>
	<div class="form-group">
		<label for="batch-name">Nama Batch</label>
		<input id="batch-name" class="input-field" bind:value={formName} placeholder="Contoh: Bimbel Intensif IPA" />
	</div>
	<div class="form-group">
		<label for="batch-type">Tipe</label>
		<select id="batch-type" class="input-field" bind:value={formType}>
			<option value="regular">Regular</option>
			<option value="intensif">Intensif</option>
			<option value="privat">Privat</option>
		</select>
	</div>
	<div class="modal-actions">
		<button class="btn btn-ghost" onclick={closeModal}>Batal</button>
		<button class="btn btn-secondary" onclick={createBatch} disabled={saving || !formName.trim()}>
			{saving ? 'Menyimpan...' : 'Buat'}
		</button>
	</div>
</Modal>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }

	.batch-list { display: flex; flex-direction: column; gap: 8px; }
	.batch-card {
		display: flex; flex-direction: column; gap: 10px;
		padding: 16px 20px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; text-decoration: none; color: var(--text);
		transition: all 0.15s ease;
	}
	.batch-card:hover { border-color: var(--accent); background: rgba(94, 106, 210, 0.06); transform: translateX(4px); }

	.batch-top { display: flex; justify-content: space-between; align-items: center; }
	.batch-name { font-size: 16px; font-weight: 600; }

	.batch-meta { display: flex; gap: 24px; }
	.meta-item { display: flex; flex-direction: column; gap: 2px; }
	.meta-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
	.meta-value { font-size: 14px; font-weight: 500; color: var(--text-secondary); }

	.batch-footer { display: flex; justify-content: flex-end; }
	.enter-link { font-size: 13px; color: var(--accent); font-weight: 500; }

	.form-group { display: flex; flex-direction: column; gap: 4px; }
	.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.input-field {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.input-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-ghost { background: transparent; color: var(--text-secondary); }
	.btn-ghost:hover { background: rgba(255,255,255,0.05); color: var(--text); }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
