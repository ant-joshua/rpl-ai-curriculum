<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Loading, EmptyState } from '$lib/components/ui/index.js';

	let classId = $state('');
	let className = $state('');
	let students: any[] = $state([]);
	let ekstraScores: Record<string, { nilai: number | null; predikat: string; deskripsi: string }> = $state({});
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
			const idx = parts.indexOf('ekstrakurikuler');
			if (idx !== -1 && parts[idx + 1]) classId = parts[idx + 1];
		}
	});

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		if (!classId) { setTimeout(() => loadAll(), 100); return; }
		loading = true;
		error = '';
		try {
			// Get class info + students + existing scores
			const [clsRes, stRes, ekRes] = await Promise.all([
				fetch(`/api/guru/kelas/info/${classId}`),
				fetch(`/api/guru/kelas/${classId}/siswa?semester=${selectedSemester}`),
				fetch(`/api/guru/ekstrakurikuler?class_id=${classId}&semester=${selectedSemester}`),
			]);

			const cls = await clsRes.json();
			if (cls.success) className = cls.data?.name || cls.data?.class_name || 'Kelas';

			const st = await stRes.json();
			if (st.success) students = st.data || [];

			const ek = await ekRes.json();
			if (ek.success && ek.data) {
				const map: Record<string, any> = {};
				for (const row of ek.data) {
					map[row.user_id] = {
						nilai: row.nilai ?? null,
						predikat: row.predikat || '',
						deskripsi: row.deskripsi || '',
					};
				}
				ekstraScores = map;
			}
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	function getEkstra(sid: string) {
		return ekstraScores[sid] || { nilai: null, predikat: '', deskripsi: '' };
	}

	function updateNilai(sid: string, val: string) {
		const parsed = val === '' ? null : parseFloat(val);
		if (!ekstraScores[sid]) ekstraScores[sid] = { nilai: null, predikat: '', deskripsi: '' };
		ekstraScores[sid].nilai = (parsed !== null && !isNaN(parsed)) ? parsed : null;
		ekstraScores = { ...ekstraScores };
	}

	function updateField(sid: string, field: string, val: string) {
		if (!ekstraScores[sid]) ekstraScores[sid] = { nilai: null, predikat: '', deskripsi: '' };
		(ekstraScores[sid] as any)[field] = val;
		ekstraScores = { ...ekstraScores };
	}

	async function saveAll() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = {
				class_id: classId,
				semester: selectedSemester,
				data: Object.entries(ekstraScores).map(([user_id, d]) => ({
					user_id,
					nilai: d.nilai,
					predikat: d.predikat || null,
					deskripsi: d.deskripsi || null,
				})),
			};
			const res = await fetch('/api/guru/ekstrakurikuler/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = '✅ Nilai ekstrakurikuler berhasil disimpan!';
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}
</script>

<svelte:head>
	<title>Ekstrakurikuler — {className} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data ekstrakurikuler..." />
	{:else if error && !className && students.length === 0 && loading === false}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb"><a href="/guru/kelas">← Kelas Saya</a></div>
				<h1>🏅 Ekstrakurikuler</h1>
				<p class="meta">{className}</p>
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
				<table class="ekstra-table">
					<thead>
						<tr>
							<th class="sticky-col name-col">Siswa</th>
							<th class="num-col">Nilai</th>
							<th class="pred-col">Predikat</th>
							<th class="desc-col">Deskripsi</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student}
							{@const sid = student.id || student.user_id}
							{@const e = getEkstra(sid)}
							<tr>
								<td class="sticky-col name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
								</td>
								<td class="score-cell">
									<input type="number" min="0" max="100" step="0.5"
										class="score-input" class:score-input--filled={e.nilai !== null}
										value={e.nilai ?? ''}
										oninput={(ev) => updateNilai(sid, (ev.target as HTMLInputElement).value)}
										placeholder="-"
									/>
								</td>
								<td class="pred-cell">
									<select class="pred-select" value={e.predikat}
										onchange={(ev) => updateField(sid, 'predikat', (ev.target as HTMLSelectElement).value)}>
										{#each predikatOptions as p}
											<option value={p}>{p === '-' ? '-' : p}</option>
										{/each}
									</select>
								</td>
								<td class="desc-cell">
									<input type="text" class="desc-input" placeholder="Deskripsi..."
										value={e.deskripsi}
										oninput={(ev) => updateField(sid, 'deskripsi', (ev.target as HTMLInputElement).value)}
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
	.ekstra-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 400px; }
	.ekstra-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.ekstra-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 160px; }
	.student-name { font-weight: 600; font-size: 13px; }
	.num-col { text-align: center; min-width: 60px; }
	.pred-col { text-align: center; min-width: 70px; }
	.desc-col { min-width: 200px; }
	.score-cell { text-align: center; }
	.score-input { width: 64px; padding: 6px 4px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; font-weight: 600; text-align: center; font-family: inherit; outline: none; }
	.score-input:focus { border-color: var(--accent); }
	.score-input--filled { border-color: rgba(255,255,255,0.12); }
	.pred-cell { text-align: center; }
	.pred-select { padding: 4px 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
	.desc-input { width: 100%; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 12px; font-family: inherit; outline: none; box-sizing: border-box; }
	.desc-input:focus { border-color: var(--accent); }
</style>
