<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Spinner, Badge } from '$lib/components/ui';

	let loading = $state(true);
	let stats = $state<any>(null);
	let gens = $state<any[]>([]);
	let docs = $state<any[]>([]);
	let tab = $state<'stats' | 'gens' | 'docs'>('stats');
	let docFilter = $state('');
	let q = $state('');
	let loadingDocs = $state(false);
	let error = $state('');

	async function loadStats() {
		try {
			const res = await fetch('/api/admin/aiedu/stats');
			const json = await res.json();
			if (json.success) stats = json.data;
		} catch { /* ignore */ }
	}

	async function loadGens() {
		try {
			const res = await fetch('/api/admin/aiedu/generations?limit=100');
			const json = await res.json();
			if (json.success) gens = json.data || [];
		} catch { /* ignore */ }
	}

	async function loadDocs() {
		loadingDocs = true;
		try {
			const qs = new URLSearchParams();
			if (docFilter) qs.set('source', docFilter);
			if (q.trim()) qs.set('q', q.trim());
			const res = await fetch(`/api/admin/aiedu/documents?${qs}`);
			const json = await res.json();
			if (json.success) docs = json.data || [];
		} catch { /* ignore */ } finally { loadingDocs = false; }
	}

	async function delDoc(id: string) {
		if (!confirm('Hapus dokumen ini?')) return;
		try {
			const res = await fetch(`/api/admin/aiedu/documents/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) loadDocs();
			else alert(json.error || 'Gagal');
		} catch { alert('Gagal hapus'); }
	}

	onMount(() => {
		if (!browser) return;
		loadStats(); loadGens(); loadDocs();
	});

	const typeLabels: Record<string, string> = {
		cp: 'CP', atp: 'ATP', modul_ajar: 'Modul Ajar', lkpd: 'LKPD', soal: 'Soal', rubrik: 'Rubrik',
		ppt: 'PPT', buku_guru: 'Buku Guru', buku_siswa: 'Buku Siswa', panduan_asesmen: 'Panduan Asesmen',
		panduan_projek: 'Panduan Projek',
	};
</script>

<PageHeader title="AIEdu Admin" subtitle="Statistik, generasi, dan bank materi seluruh pengguna" />

<div class="tabs">
	<button class="tab" class:active={tab === 'stats'} onclick={() => { tab = 'stats'; }}>📊 Statistik</button>
	<button class="tab" class:active={tab === 'gens'} onclick={() => { tab = 'gens'; }}>🕘 Generasi ({gens.length})</button>
	<button class="tab" class:active={tab === 'docs'} onclick={() => { tab = 'docs'; }}>📚 Bank Materi ({docs.length})</button>
</div>

{#if tab === 'stats'}
	{#if !stats}
		<div class="center"><Spinner /></div>
	{:else}
		<div class="stat-grid">
			<Card><CardContent class="stat"><span class="stat-num">{stats.totalGens}</span><span class="stat-label">Total Generasi</span></CardContent></Card>
			<Card><CardContent class="stat"><span class="stat-num">{stats.last7d}</span><span class="stat-label">7 Hari Terakhir</span></CardContent></Card>
			<Card><CardContent class="stat"><span class="stat-num">{stats.totalDocs}</span><span class="stat-label">Dokumen Bank ({stats.seedDocs} seed / {stats.generatedDocs} generated)</span></CardContent></Card>
			<Card><CardContent class="stat"><span class="stat-num">{stats.totalChats}</span><span class="stat-label">Thread Chat ({stats.totalMessages} pesan)</span></CardContent></Card>
			<Card><CardContent class="stat"><span class="stat-num">{stats.totalAnalyses}</span><span class="stat-label">Analisis Nilai</span></CardContent></Card>
			<Card><CardContent class="stat"><span class="stat-num">{stats.totalRapors}</span><span class="stat-label">Rapor</span></CardContent></Card>
		</div>

		<div class="stat-row">
			<Card>
				<CardHeader><CardTitle>Per Jenis Dokumen</CardTitle></CardHeader>
				<CardContent>
					{#if stats.byType.length === 0}
						<p class="muted">Belum ada generasi</p>
					{:else}
						{#each stats.byType as t}
							<div class="bar-row">
								<span class="bar-label">{typeLabels[t.doc_type] || t.doc_type}</span>
								<div class="bar-track"><div class="bar-fill" style="width: {Math.min(100, (t.c / stats.byType[0].c) * 100)}%"></div></div>
								<span class="bar-num">{t.c}</span>
							</div>
						{/each}
					{/if}
				</CardContent>
			</Card>
			<Card>
				<CardHeader><CardTitle>Top Pengguna</CardTitle></CardHeader>
				<CardContent>
					{#if stats.byUser.length === 0}
						<p class="muted">Belum ada data</p>
					{:else}
						{#each stats.byUser as u}
							<div class="user-row">
								<span class="user-name">{u.name || u.email}</span>
								<span class="user-count">{u.c} gen</span>
							</div>
						{/each}
					{/if}
				</CardContent>
			</Card>
		</div>
	{/if}
{:else if tab === 'gens'}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Waktu</th><th>User</th><th>Jenis</th><th>Mapel</th><th>Status</th></tr></thead>
			<tbody>
				{#each gens as g (g.id)}
					<tr>
						<td class="muted">{g.created_at?.slice(0, 16)}</td>
						<td>{g.user_name || g.user_id?.slice(0, 8)}</td>
						<td>{typeLabels[g.doc_type] || g.doc_type}</td>
						<td>{g.subject || '-'}</td>
						<td><Badge variant={g.status === 'done' ? 'success' : 'warning'}>{g.status}</Badge></td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if gens.length === 0}<p class="muted pad">Belum ada generasi</p>{/if}
	</div>
{:else}
	<div class="doc-controls">
		<input type="search" placeholder="Cari judul / konten..." bind:value={q} oninput={() => loadDocs()} class="search-input" />
		<select bind:value={docFilter} onchange={() => loadDocs()}>
			<option value="">Semua sumber</option>
			<option value="seed">Seed</option>
			<option value="generated">Generated</option>
		</select>
	</div>
	{#if loadingDocs}
		<div class="center"><Spinner /></div>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Waktu</th><th>Judul</th><th>Mapel</th><th>Jenis</th><th>Sumber</th><th>Owner</th><th></th></tr></thead>
				<tbody>
					{#each docs as d (d.id)}
						<tr>
							<td class="muted">{d.created_at?.slice(0, 16)}</td>
							<td><a href="/aiedu/bank/{d.id}" target="_blank">{d.title}</a></td>
							<td>{d.subject}</td>
							<td>{typeLabels[d.doc_type] || d.doc_type}</td>
							<td><Badge variant={d.source === 'seed' ? 'info' : 'primary'}>{d.source}</Badge></td>
							<td>{d.owner_name || '-'}</td>
							<td><Button size="sm" variant={'danger' as any} onclick={() => delDoc(d.id)}>🗑</Button></td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if docs.length === 0}<p class="muted pad">Tidak ada dokumen</p>{/if}
		</div>
	{/if}
{/if}

<style>
	.tabs { display: flex; gap: 8px; margin-bottom: 18px; }
	.tab { padding: 8px 16px; border: 1px solid var(--border); border-radius: 10px; background: white; font-size: 13px; font-weight: 600; cursor: pointer; }
	.tab.active { background: #2563eb; color: white; border-color: #2563eb; }
	.center { display: flex; justify-content: center; padding: 40px; }
	.stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }
	.stat { display: flex; flex-direction: column; gap: 2px; }
	.stat-num { font-size: 26px; font-weight: 800; }
	.stat-label { font-size: 12px; color: var(--text-muted); }
	.stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	@media (max-width: 800px) { .stat-row { grid-template-columns: 1fr; } }
	.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
	.bar-label { font-size: 12px; font-weight: 600; width: 110px; }
	.bar-track { flex: 1; height: 8px; background: var(--surface); border-radius: 99px; overflow: hidden; }
	.bar-fill { height: 100%; background: #2563eb; border-radius: 99px; }
	.bar-num { font-size: 12px; font-weight: 700; width: 30px; text-align: right; }
	.user-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
	.user-row:last-child { border-bottom: none; }
	.user-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.user-count { font-weight: 700; color: var(--primary); flex-shrink: 0; }
	.table-wrap { background: white; border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th { text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
	td { padding: 9px 12px; border-bottom: 1px solid var(--surface); }
	tr:last-child td { border-bottom: none; }
	.muted { color: var(--text-muted); }
	.pad { padding: 16px; }
	.doc-controls { display: flex; gap: 10px; margin-bottom: 12px; }
	.search-input { flex: 1; padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
	.doc-controls select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
</style>
