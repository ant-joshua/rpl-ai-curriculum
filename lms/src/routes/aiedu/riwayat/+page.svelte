<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Button, Card, CardContent, Spinner, EmptyState, Badge, Alert } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let items = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let selected = $state<any>(null);
	let detail = $state<any>(null);
	let loadingDetail = $state(false);

	async function load() {
		loading = true;
		try {
			const res = await fetch('/api/aiedu/generations');
			const json = await res.json();
			if (json.success) items = json.data || [];
			else error = json.error || '';
		} catch { error = 'Gagal load'; } finally { loading = false; }
	}

	async function open(id: string) {
		loadingDetail = true;
		selected = id;
		try {
			const res = await fetch(`/api/aiedu/generations/${id}`);
			const json = await res.json();
			if (json.success) detail = json.data;
		} catch { /* ignore */ } finally { loadingDetail = false; }
	}

	async function saveToBank() {
		if (!detail) return;
		try {
			const res = await fetch(`/api/aiedu/generations/${detail.id}/save-to-bank`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});
			const json = await res.json();
			if (json.success) alert('Disimpan ke Bank Materi ✅');
			else alert(json.error || 'Gagal simpan');
		} catch { alert('Gagal simpan'); }
	}

	function downloadMd() {
		if (!detail?.output) return;
		const blob = new Blob([detail.output], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `${detail.doc_type}-${detail.subject || 'dokumen'}.md`; a.click();
		URL.revokeObjectURL(url);
	}

	onMount(() => { if (browser) load(); });

	const typeLabels: Record<string, string> = {
		atp: 'ATP', modul_ajar: 'Modul Ajar', lkpd: 'LKPD', soal: 'Soal', rubrik: 'Rubrik', ppt: 'PPT',
	};
</script>

<PageHeader title="Riwayat Generasi" subtitle="Semua dokumen yang pernah kamu generate" />

{#if error}
	<Alert variant="danger" class="mb">{error}</Alert>
{/if}

<div class="hist-layout">
	<div class="hist-list">
		{#if loading}
			<div class="center"><Spinner /></div>
		{:else if items.length === 0}
			<EmptyState icon="file-text" title="Belum ada generasi" desc="Generate dokumen di Generator Perangkat Ajar" />
		{:else}
			{#each items as g (g.id)}
				<div class="hist-item" class:active={selected === g.id} onclick={() => open(g.id)}>
					<div class="hist-icon">{typeLabels[g.doc_type] || g.doc_type}</div>
					<div class="hist-main">
						<span class="hist-subject">{g.subject || 'Umum'}</span>
						<span class="hist-meta">
							{typeLabels[g.doc_type] || g.doc_type}
							{#if g.curriculum_name} · {g.curriculum_name}{/if}
						</span>
					</div>
					<span class="hist-time">{g.created_at?.slice(0, 16)}</span>
				</div>
			{/each}
		{/if}
	</div>

	<div class="hist-detail">
		{#if loadingDetail}
			<div class="center"><Spinner /></div>
		{:else if detail}
			<div class="detail-head">
				<h3>{detail.subject || 'Umum'} — {typeLabels[detail.doc_type] || detail.doc_type}</h3>
				<div class="detail-actions">
					<Button size="sm" variant={'success' as any} onclick={saveToBank}>📚 Simpan ke Bank</Button>
					<Button size="sm" variant="secondary" onclick={downloadMd}>⬇️ .md</Button>
				</div>
			</div>
			<Card>
				<CardContent>
					<div class="md">{@html parseMarkdown(detail.output || '')}</div>
				</CardContent>
			</Card>
		{:else}
			<EmptyState icon="file-text" title="Pilih generasi" desc="Klik item di kiri untuk lihat detail" />
		{/if}
	</div>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.hist-layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
	.hist-list { display: flex; flex-direction: column; gap: 8px; max-height: calc(100vh - 240px); overflow-y: auto; }
	.hist-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: white; cursor: pointer; }
	.hist-item.active { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 8%, white); }
	.hist-icon { width: 38px; height: 38px; border-radius: 10px; background: color-mix(in srgb, var(--primary) 12%, white); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
	.hist-main { flex: 1; min-width: 0; }
	.hist-subject { display: block; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.hist-meta { display: block; font-size: 11px; color: var(--text-muted); }
	.hist-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
	.hist-detail { display: flex; flex-direction: column; gap: 12px; }
	.detail-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
	.detail-head h3 { margin: 0; font-size: 16px; }
	.detail-actions { display: flex; gap: 6px; }
	.center { display: flex; justify-content: center; padding: 40px; }
	.md { font-size: 13px; line-height: 1.6; }
	.md :global(h1), .md :global(h2), .md :global(h3) { margin: 14px 0 8px; }
	.md :global(p) { margin: 0 0 8px; }
	.md :global(table) { border-collapse: collapse; margin: 8px 0; font-size: 12px; width: 100%; }
	.md :global(th), .md :global(td) { border: 1px solid var(--border); padding: 5px 8px; }
	.md :global(pre) { background: #0f1115; color: #e6e6e6; padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
</style>
