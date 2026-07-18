<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { StatCard } from '$lib/components/ui';

	let stats: any = $state(null);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/classes-structure/stats');
			const json = await res.json();
			if (json.success) stats = json.data;
			else error = json.error || 'Gagal memuat statistik';
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	const sections = [
		{ path: '/admin/classes-structure/tingkat', icon: '🏫', title: 'Tingkat', desc: 'Kelola jenjang & tingkat kelas (X, XI, XII)' },
		{ path: '/admin/classes-structure/jurusan', icon: '📐', title: 'Jurusan', desc: 'Kelola program keahlian & jurusan' },
		{ path: '/admin/classes-structure/kelas', icon: '🏠', title: 'Kelas', desc: 'Kelola rombongan belajar per tingkat' },
		{ path: '/admin/classes-structure/mapel', icon: '📖', title: 'Mata Pelajaran', desc: 'Kelola mata pelajaran' },
		{ path: '/admin/classes-structure/kd', icon: '📋', title: 'Kompetensi Dasar', desc: 'Kelola KD per mata pelajaran' },
		{ path: '/admin/classes-structure/guru-mapel', icon: '👨‍🏫', title: 'Guru Mapel', desc: 'Atur penugasan guru per kelas-mapel' },
		{ path: '/admin/classes-structure/import-siswa', icon: '📥', title: 'Import Siswa', desc: 'Import data siswa dari CSV' },
	];
</script>

<svelte:head>
	<title>Struktur Kurikulum — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🏗️ Struktur Kurikulum</h1>
			<p class="subtitle">K13 — Kelola data master struktur sekolah</p>
		</div>
		<button class="btn-refresh" onclick={loadStats}>🔄 Refresh</button>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadStats}>Coba Lagi</button>
		</div>
	{:else if stats}
		<div class="stats-grid">
			<StatCard icon="🏫" value={stats.tingkat ?? '—'} label="Tingkat" />
			<StatCard icon="📐" value={stats.jurusan ?? '—'} label="Jurusan" />
			<StatCard icon="🏠" value={stats.kelas ?? '—'} label="Kelas" />
			<StatCard icon="📖" value={stats.mapel ?? '—'} label="Mapel" />
			<StatCard icon="👨‍🏫" value={stats.guru_mapel ?? '—'} label="Guru Mapel" />
			<StatCard icon="👨‍🎓" value={stats.siswa ?? '—'} label="Siswa" />
		</div>
	{/if}

	<div class="section-grid">
		{#each sections as s}
			<a href={s.path} class="section-card">
				<span class="sec-icon">{s.icon}</span>
				<div class="sec-body">
					<span class="sec-title">{s.title}</span>
					<span class="sec-desc">{s.desc}</span>
				</div>
				<span class="sec-arrow">→</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.page { max-width: 1000px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--hover); }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }

	.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }

	.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
	.section-card {
		display: flex; align-items: center; gap: 14px;
		padding: 18px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; text-decoration: none !important;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.section-card:hover { border-color: var(--accent); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
	.sec-icon { font-size: 28px; flex-shrink: 0; }
	.sec-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
	.sec-title { font-weight: 600; font-size: 14px; color: var(--text); }
	.sec-desc { font-size: 12px; color: var(--text-secondary); }
	.sec-arrow { color: var(--text-secondary); font-size: 16px; }
</style>
