<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Loading, EmptyState } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let students: any[] = $state([]);
	let sikapData: Record<string, { spiritual_predikat: string; spiritual_desc: string; sosial_predikat: string; sosial_desc: string }> = $state({});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMsg = $state('');
	let selectedSemester = $state('1');

	const predikatOptions = ['-', 'SB', 'B', 'C', 'K'];

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
			const [csRes, stRes, siRes] = await Promise.all([
				fetch(`/api/guru/kelas/${classSubjectId}`),
				fetch(`/api/guru/kelas/${classSubjectId}/siswa?semester=${selectedSemester}`),
				fetch(`/api/guru/nilai/sikap?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			const st = await stRes.json();
			const si = await siRes.json();

			if (cs.success) classSubject = cs.data;
			if (st.success) students = st.data || [];
			if (si.success && si.data) {
				const map: Record<string, any> = {};
				for (const row of si.data) {
					map[row.user_id] = {
						spiritual_predikat: row.spiritual_predikat || '',
						spiritual_desc: row.spiritual_desc || '',
						sosial_predikat: row.sosial_predikat || '',
						sosial_desc: row.sosial_desc || '',
					};
				}
				sikapData = map;
			}
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	function getSikap(sid: string) {
		return sikapData[sid] || { spiritual_predikat: '', spiritual_desc: '', sosial_predikat: '', sosial_desc: '' };
	}

	function updateSikap(sid: string, field: string, val: string) {
		if (!sikapData[sid]) sikapData[sid] = { spiritual_predikat: '', spiritual_desc: '', sosial_predikat: '', sosial_desc: '' };
		(sikapData[sid] as any)[field] = val;
		sikapData = { ...sikapData };
	}

	async function saveAll() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = {
				class_subject_id: classSubjectId,
				semester: selectedSemester,
				data: Object.entries(sikapData).map(([user_id, d]) => ({
					user_id,
					spiritual_predikat: d.spiritual_predikat || null,
					spiritual_desc: d.spiritual_desc || null,
					sosial_predikat: d.sosial_predikat || null,
					sosial_desc: d.sosial_desc || null,
				})),
			};
			const res = await fetch('/api/guru/nilai/sikap/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = '✅ Nilai sikap berhasil disimpan!';
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}
</script>

<svelte:head>
	<title>Sikap — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data sikap..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>🌟 Nilai Sikap</h1>
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
				<table class="sikap-table">
					<thead>
						<tr>
							<th class="sticky-col name-col" rowspan="2">Siswa</th>
							<th colspan="2" class="section-header">Spiritual</th>
							<th colspan="2" class="section-header">Sosial</th>
						</tr>
						<tr>
							<th class="pred-col">Predikat</th>
							<th class="desc-col">Deskripsi</th>
							<th class="pred-col">Predikat</th>
							<th class="desc-col">Deskripsi</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student}
							{@const sid = student.id || student.user_id}
							{@const s = getSikap(sid)}
							<tr>
								<td class="sticky-col name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
								</td>
								<td class="pred-cell">
									<select class="pred-select" value={s.spiritual_predikat}
										onchange={(e) => updateSikap(sid, 'spiritual_predikat', (e.target as HTMLSelectElement).value)}>
										{#each predikatOptions as p}
											<option value={p}>{p === '-' ? '-' : p}</option>
										{/each}
									</select>
								</td>
								<td class="desc-cell">
									<input type="text" class="desc-input" placeholder="Deskripsi spiritual..."
										value={s.spiritual_desc}
										oninput={(e) => updateSikap(sid, 'spiritual_desc', (e.target as HTMLInputElement).value)} />
								</td>
								<td class="pred-cell">
									<select class="pred-select" value={s.sosial_predikat}
										onchange={(e) => updateSikap(sid, 'sosial_predikat', (e.target as HTMLSelectElement).value)}>
										{#each predikatOptions as p}
											<option value={p}>{p === '-' ? '-' : p}</option>
										{/each}
									</select>
								</td>
								<td class="desc-cell">
									<input type="text" class="desc-input" placeholder="Deskripsi sosial..."
										value={s.sosial_desc}
										oninput={(e) => updateSikap(sid, 'sosial_desc', (e.target as HTMLInputElement).value)} />
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
	.page { max-width: 900px; }
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
	.sikap-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; }
	.sikap-table th { padding: 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); text-align: center; }
	.sikap-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.section-header { background: rgba(94, 106, 210, 0.04); }
	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 150px; }
	.student-name { font-weight: 600; font-size: 13px; }
	.pred-col { min-width: 80px; text-align: center; }
	.desc-col { min-width: 180px; }
	.pred-cell { text-align: center; }
	.pred-select { padding: 4px 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
	.desc-input { width: 100%; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 12px; font-family: inherit; outline: none; box-sizing: border-box; }
	.desc-input:focus { border-color: var(--accent); }
</style>
