<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, Modal } from '$lib/components/ui/index.js';

	type Tryout = {
		id: string;
		title: string;
		date: string;
		participants: number;
		status: string;
	};

	let loading = $state(true);
	let error = $state('');
	let tryouts: Tryout[] = $state([]);
	let showModal = $state(false);
	let saving = $state(false);

	onMount(() => {
		if (!browser) return;
		loadTryouts();
	});

	async function loadTryouts() {
		loading = true; error = '';
		try {
						const res = await fetch('/api/bimbel/tryout');
			const json = await res.json();
			if (json.success) tryouts = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let formTitle = $state('');
	let formDate = $state('');

	function openCreate() { showModal = true; formTitle = ''; formDate = ''; }
	function closeModal() { showModal = false; }

	async function createTryout() {
		if (!formTitle.trim() || !formDate) return;
		saving = true;
		try {
						const res = await fetch('/api/bimbel/tryout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: formTitle.trim(), date: formDate }),
			});
			const json = await res.json();
			if (json.success) { closeModal(); loadTryouts(); }
			else error = json.error || 'Gagal membuat try out';
		} catch { error = 'Gagal membuat try out'; }
		finally { saving = false; }
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'upcoming': return 'primary';
			case 'ongoing': return 'warning';
			case 'completed': return 'success';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'upcoming': return 'Mendatang';
			case 'ongoing': return 'Berlangsung';
			case 'completed': return 'Selesai';
			default: return status;
		}
	}
</script>

<svelte:head>
	<title>Try Out — Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel">← Bimbel Dashboard</a></div>
		<h1>📝 Try Out</h1>
		<p class="subtitle">Daftar try out bimbingan belajar</p>
	</div>

	<div class="toolbar">
		<button class="btn btn-secondary btn-sm" onclick={openCreate}>+ Buat Try Out</button>
		<button class="btn btn-ghost btn-sm" onclick={loadTryouts}>🔄 Refresh</button>
	</div>

	{#if loading}
		<Loading message="Memuat try out..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if tryouts.length === 0}
		<EmptyState icon="📝" title="Belum Ada Try Out" description="Buat try out baru untuk memulai." />
	{:else}
		<div class="tryout-list">
			{#each tryouts as t}
				<a href="/bimbel/tryout/{t.id}" class="tryout-card">
					<div class="tryout-top">
						<span class="tryout-title">{t.title}</span>
						<Badge variant={getStatusBadge(t.status)}>{getStatusLabel(t.status)}</Badge>
					</div>
					<div class="tryout-meta">
						<span class="meta-item">
							<span class="meta-label">Tanggal</span>
							<span class="meta-value">{formatDate(t.date)}</span>
						</span>
						<span class="meta-item">
							<span class="meta-label">Peserta</span>
							<span class="meta-value">{t.participants}</span>
						</span>
					</div>
					<div class="tryout-footer">
						<span class="enter-link">Lihat Detail →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showModal} title="Buat Try Out Baru" onclose={closeModal}>
	<div class="form-group">
		<label for="to-title">Judul</label>
		<input id="to-title" class="input-field" bind:value={formTitle} placeholder="Contoh: Try Out UTBK #1" />
	</div>
	<div class="form-group">
		<label for="to-date">Tanggal</label>
		<input id="to-date" class="input-field" type="date" bind:value={formDate} />
	</div>
	<div class="modal-actions">
		<button class="btn btn-ghost" onclick={closeModal}>Batal</button>
		<button class="btn btn-secondary" onclick={createTryout} disabled={saving || !formTitle.trim() || !formDate}>
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

	.tryout-list { display: flex; flex-direction: column; gap: 8px; }
	.tryout-card {
		display: flex; flex-direction: column; gap: 10px;
		padding: 16px 20px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; text-decoration: none; color: var(--text);
		transition: all 0.15s ease;
	}
	.tryout-card:hover { border-color: var(--accent); background: rgba(94, 106, 210, 0.06); transform: translateX(4px); }

	.tryout-top { display: flex; justify-content: space-between; align-items: center; }
	.tryout-title { font-size: 16px; font-weight: 600; }

	.tryout-meta { display: flex; gap: 24px; }
	.meta-item { display: flex; flex-direction: column; gap: 2px; }
	.meta-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
	.meta-value { font-size: 14px; font-weight: 500; color: var(--text-secondary); }

	.tryout-footer { display: flex; justify-content: flex-end; }
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
