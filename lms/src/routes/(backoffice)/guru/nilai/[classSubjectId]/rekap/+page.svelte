<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let rekap: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('nilai');
			if (idx !== -1 && parts[idx + 1]) classSubjectId = parts[idx + 1];
			const sem = $page.url.searchParams.get('semester');
			if (sem) selectedSemester = sem;
		}
	});

	onMount(() => {
		if (!browser) return;
		loadRekap();
	});

	async function loadRekap() {
		if (!classSubjectId) { setTimeout(() => loadRekap(), 100); return; }
		loading = true;
		error = '';
		try {
			const [csRes, rkRes] = await Promise.all([
				fetch(`/api/guru/kelas/${classSubjectId}`),
				fetch(`/api/guru/nilai/rekap?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			if (cs.success) classSubject = cs.data;

			const rk = await rkRes.json();
			if (rk.success) rekap = rk.data || [];
			else error = rk.error || 'Gagal memuat rekap';
		} catch { error = 'Gagal memuat rekap'; }
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
	<title>Rekap Nilai — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat rekap nilai..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>📊 Rekap Nilai</h1>
				<p class="meta">{classSubject?.class_name} — {classSubject?.subject_name}</p>
			</div>
			<div class="header-actions">
				<select class="sem-select" bind:value={selectedSemester} onchange={() => loadRekap()}>
					<option value="1">Semester Ganjil</option>
					<option value="2">Semester Genap</option>
				</select>
			</div>
		</div>

		{#if rekap.length === 0}
			<EmptyState icon="📊" message="Belum ada data rekap. Input nilai terlebih dahulu." />
		{:else}
			<div class="table-wrapper">
				<table class="rekap-table">
					<thead>
						<tr>
							<th class="sticky-col name-col">Siswa</th>
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
						{#each rekap as row}
							<tr>
								<td class="sticky-col name-col">
									<span class="student-name">{row.name || row.display_name || 'Siswa'}</span>
								</td>
								<td class="num-cell" style="color: {gradeColor(row.rata_ph)}">{formatPct(row.rata_ph)}</td>
								<td class="num-cell" style="color: {gradeColor(row.pts)}">{formatPct(row.pts)}</td>
								<td class="num-cell" style="color: {gradeColor(row.pas)}">{formatPct(row.pas)}</td>
								<td class="num-cell" style="color: {gradeColor(row.na_pengetahuan)}">{formatPct(row.na_pengetahuan)}</td>
								<td class="pred-cell">
									{#if row.predikat_pengetahuan}
										<Badge variant="primary">{row.predikat_pengetahuan}</Badge>
									{:else}
										<span class="na">-</span>
									{/if}
								</td>
								<td class="num-cell" style="color: {gradeColor(row.rata_keterampilan)}">{formatPct(row.rata_keterampilan)}</td>
								<td class="pred-cell">
									{#if row.predikat_keterampilan}
										<Badge variant="primary">{row.predikat_keterampilan}</Badge>
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
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 22px; margin: 0 0 4px; }
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.rekap-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
	.rekap-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.rekap-table td { padding: 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 160px; }
	.student-name { font-weight: 600; font-size: 13px; }
	.num-col { text-align: center; min-width: 70px; font-weight: 600; }
	.num-cell { text-align: center; font-weight: 600; font-size: 13px; }
	.pred-cell { text-align: center; }
	.pred-col { text-align: center; min-width: 60px; }
	.na { color: var(--text-quaternary); }
</style>
