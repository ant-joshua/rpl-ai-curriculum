<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Loading, EmptyState } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let students: any[] = $state([]);
	let ptsScores: Record<string, number | null> = $state({});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMsg = $state('');
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
		loadAll();
	});

	async function loadAll() {
		if (!classSubjectId) { setTimeout(() => loadAll(), 100); return; }
		loading = true;
		error = '';
		try {
			const [csRes, stRes, scRes] = await Promise.all([
				fetch(`/api/guru/kelas/${classSubjectId}`),
				fetch(`/api/guru/kelas/${classSubjectId}/siswa?semester=${selectedSemester}`),
				fetch(`/api/guru/nilai/pts?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			const st = await stRes.json();
			const sc = await scRes.json();

			if (cs.success) classSubject = cs.data;
			if (st.success) students = st.data || [];
			if (sc.success && sc.data) {
				const map: Record<string, number | null> = {};
				for (const row of sc.data) map[row.user_id] = row.score;
				ptsScores = map;
			}
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	function getScore(sid: string): number | null {
		return ptsScores[sid] ?? null;
	}

	function setScore(sid: string, val: string) {
		const parsed = val === '' ? null : parseFloat(val);
		ptsScores[sid] = (parsed !== null && !isNaN(parsed)) ? parsed : null;
		ptsScores = { ...ptsScores };
	}

	async function saveAll() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = {
				class_subject_id: classSubjectId,
				semester: selectedSemester,
				scores: Object.entries(ptsScores).map(([user_id, score]) => ({ user_id, score })),
			};
			const res = await fetch('/api/guru/nilai/pts/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = '✅ Nilai PTS berhasil disimpan!';
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}
</script>

<svelte:head>
	<title>PTS — {classSubject?.subject_name || 'Nilai'} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data PTS..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>📄 Penilaian Tengah Semester (PTS)</h1>
				<p class="meta">{classSubject?.class_name} — {classSubject?.subject_name}</p>
			</div>
			<div class="header-actions">
				<select class="sem-select" bind:value={selectedSemester} onchange={() => loadAll()}>
					<option value="1">Semester Ganjil</option>
					<option value="2">Semester Genap</option>
				</select>
				<Button onclick={saveAll} disabled={saving} variant="secondary" size="sm">
					{saving ? '⏳ Menyimpan...' : '💾 Simpan'}
				</Button>
			</div>
		</div>

		{#if successMsg}
			<div class="toast toast--success">{successMsg}</div>
		{/if}
		{#if error}
			<div class="toast toast--error">{error}</div>
		{/if}

		{#if students.length === 0}
			<EmptyState icon="👨‍🎓" message="Belum ada siswa di kelas ini." />
		{:else}
			<div class="table-wrapper">
				<table class="pts-table">
					<thead>
						<tr>
							<th class="sticky-col">No</th>
							<th class="sticky-col name-col">Siswa</th>
							<th>Nilai PTS</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student, i}
							{@const sid = student.id || student.user_id}
							<tr>
								<td class="sticky-col num-col">{i + 1}</td>
								<td class="sticky-col name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
								</td>
								<td class="score-col">
									<input
										type="number"
										step="0.5"
										min="0"
										max="100"
										class="score-input"
										class:score-input--filled={getScore(sid) !== null}
										value={getScore(sid) ?? ''}
										oninput={(e) => setScore(sid, (e.target as HTMLInputElement).value)}
										placeholder="-"
									/>
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
	.page { max-width: 600px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 22px; margin: 0 0 4px; }
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
	.toast { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
	.toast--success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; }
	.toast--error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); color: #ef4444; }
	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.pts-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.pts-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.pts-table td { padding: 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 160px; }
	.num-col { width: 40px; text-align: center; color: var(--text-quaternary); }
	.student-name { font-weight: 600; font-size: 13px; }
	.score-col { text-align: center; }
	.score-input { width: 72px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 14px; font-weight: 600; text-align: center; font-family: inherit; outline: none; transition: all 0.1s; }
	.score-input:focus { border-color: var(--accent); }
	.score-input--filled { border-color: rgba(255,255,255,0.12); }
</style>
