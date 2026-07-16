<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

	let grades: any[] = $state([]);
	let studentInfo: any = $state(null);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	onMount(() => {
		if (!browser) return;
		loadGrades();
	});

	async function loadGrades() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/nilai/rekap-siswa?semester=${selectedSemester}`);
			const json = await res.json();
			if (json.success) {
				grades = json.data?.grades || [];
				studentInfo = json.data?.student || null;
			} else error = json.error || 'Gagal memuat nilai';
		} catch { error = 'Gagal memuat data nilai'; }
		finally { loading = false; }
	}

	function gradeColor(pct: number | null): string {
		if (pct === null) return 'var(--text-secondary)';
		if (pct >= 85) return '#2ecc71';
		if (pct >= 70) return '#27ae60';
		if (pct >= 55) return '#f1c40f';
		if (pct >= 45) return '#e67e22';
		return '#e74c3c';
	}

	function formatPct(val: number | null): string {
		if (val === null || val === undefined) return '-';
		return Number(val).toFixed(1);
	}
</script>

<svelte:head>
	<title>Nilai Saya — Siswa — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>📊 Nilai Saya</h1>
			<p class="subtitle">
				{#if studentInfo}
					{studentInfo.display_name || studentInfo.name || studentInfo.username}
				{:else}
					Rekap nilai pembelajaran
				{/if}
			</p>
		</div>
		<div class="header-actions">
			<select class="sem-select" bind:value={selectedSemester} onchange={() => loadGrades()}>
				<option value="1">Semester Ganjil</option>
				<option value="2">Semester Genap</option>
			</select>
		</div>
	</div>

	{#if loading}
		<Loading message="Memuat data nilai..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if grades.length === 0}
		<EmptyState icon="📊" message="Belum ada data nilai untuk ditampilkan." description="Nilai akan muncul setelah guru menginputnya." />
	{:else}
		<div class="table-wrapper">
			<table class="grade-table">
				<thead>
					<tr>
						<th class="subject-col">Mata Pelajaran</th>
						<th class="num-col">Kelas</th>
						<th class="num-col">Rata PH</th>
						<th class="num-col">PTS</th>
						<th class="num-col">PAS</th>
						<th class="num-col">NA Pengetahuan</th>
						<th class="pred-col">Predikat</th>
						<th class="num-col">Rata Keterampilan</th>
						<th class="pred-col">Predikat</th>
					</tr>
				</thead>
				<tbody>
					{#each grades as g}
						<tr>
							<td class="subject-col">
								<span class="subject-name">{g.subject_name || g.subject}</span>
							</td>
							<td class="num-cell">{g.class_name || g.class || '-'}</td>
							<td class="num-cell" style="color: {gradeColor(g.rata_ph)}">{formatPct(g.rata_ph)}</td>
							<td class="num-cell" style="color: {gradeColor(g.pts)}">{formatPct(g.pts)}</td>
							<td class="num-cell" style="color: {gradeColor(g.pas)}">{formatPct(g.pas)}</td>
							<td class="num-cell" style="color: {gradeColor(g.na_pengetahuan)}">{formatPct(g.na_pengetahuan)}</td>
							<td class="pred-cell">
								{#if g.predikat_pengetahuan}
									<Badge variant="primary">{g.predikat_pengetahuan}</Badge>
								{:else}
									<span class="na">-</span>
								{/if}
							</td>
							<td class="num-cell" style="color: {gradeColor(g.rata_keterampilan)}">{formatPct(g.rata_keterampilan)}</td>
							<td class="pred-cell">
								{#if g.predikat_keterampilan}
									<Badge variant="primary">{g.predikat_keterampilan}</Badge>
								{:else}
									<span class="na">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.grade-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
	.grade-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.grade-table td { padding: 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.subject-col { min-width: 160px; }
	.subject-name { font-weight: 600; font-size: 13px; }
	.num-col { text-align: center; min-width: 65px; }
	.num-cell { text-align: center; font-weight: 600; font-size: 13px; }
	.pred-cell { text-align: center; }
	.pred-col { text-align: center; min-width: 55px; }
	.na { color: var(--text-quaternary); }
</style>
