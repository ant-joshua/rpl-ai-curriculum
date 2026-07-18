<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui';

	let kelasList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadKelas();
	});

	async function loadKelas() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/dosen/kelas');
			const json = await res.json();
			if (json.success) kelasList = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal memuat data kelas'; }
		finally { loading = false; }
	}

	function getSemesterLabel(s: string | null): string {
		if (!s) return '-';
		if (s === '1') return 'Ganjil';
		if (s === '2') return 'Genap';
		return s;
	}
</script>

<svelte:head>
	<title>Kelas Saya — Dosen</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>📚 Kelas Saya</h1>
			<p class="subtitle">Daftar kelas perkuliahan yang Anda ampu</p>
		</div>
		<div class="header-actions">
			<Button variant="ghost" size="sm" onclick={loadKelas}>🔄</Button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if kelasList.length === 0}
		<div class="empty-state">
			<p>Belum ada kelas yang ditugaskan</p>
			<p class="empty-hint">Hubungi admin untuk penugasan kelas</p>
		</div>
	{:else}
		<div class="class-grid">
			{#each kelasList as k}
				<a href="/dosen/nilai/{k.id}" class="class-card">
					<div class="card-top">
						<span class="card-kode"><code>{k.kode || k.code || '—'}</code></span>
						<span class="card-semester-badge">{getSemesterLabel(k.semester)}</span>
					</div>
					<div class="card-name">{k.nama || k.name || k.matkul_name || '—'}</div>
					<div class="card-meta">
						<span class="meta-prodi">{k.prodi_name || k.major_name || '—'}</span>
						<span class="meta-count">{k.mahasiswa_count ?? k.student_count ?? 0} mahasiswa</span>
					</div>
					{#if k.hari || k.jam_mulai}
						<div class="card-schedule">
							{k.hari || '—'}, {k.jam_mulai || '—'} – {k.jam_selesai || '—'}
							{#if k.ruangan}
								<span class="card-ruangan">• {k.ruangan}</span>
							{/if}
						</div>
					{/if}
					<div class="card-footer">
						<span class="enter-link">Input Nilai →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; color: #ef4444; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 8px; }
	.empty-hint { font-size: 13px; color: var(--text-tertiary); }

	.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
	.class-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit; transition: border-color 0.15s; }
	.class-card:hover { border-color: rgba(255,255,255,0.12); }
	.card-top { display: flex; justify-content: space-between; align-items: center; }
	.card-kode code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 11px; }
	.card-semester-badge { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; background: rgba(94,106,210,0.1); color: #5e6ad2; }
	.card-name { font-size: 15px; font-weight: 600; color: var(--text); }
	.card-meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary); }
	.card-schedule { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
	.card-ruangan { color: var(--text-tertiary); }
	.card-footer { margin-top: auto; padding-top: 8px; }
	.enter-link { font-size: 12px; font-weight: 500; color: var(--accent); }
</style>
