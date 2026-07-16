<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Loading, EmptyState } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let students: any[] = $state([]);
	let kds: any[] = $state([]);
	let scores: Record<string, Record<string, number | null>> = $state({});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMsg = $state('');
	let selectedSemester = $state('1');
	let selectedType = $state('praktik');
	let selectedKdId = $state('');

	const skillTypes = [
		{ value: 'praktik', label: 'Praktik' },
		{ value: 'produk', label: 'Produk' },
		{ value: 'proyek', label: 'Proyek' },
		{ value: 'portofolio', label: 'Portofolio' },
	];

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
			const [csRes, kdRes, stRes, scRes] = await Promise.all([
				fetch(`/api/guru/kelas/${classSubjectId}`),
				fetch(`/api/guru/kelas/${classSubjectId}/kd?type=keterampilan`),
				fetch(`/api/guru/kelas/${classSubjectId}/siswa?semester=${selectedSemester}`),
				fetch(`/api/guru/nilai/keterampilan?class_subject_id=${classSubjectId}&semester=${selectedSemester}&type=${selectedType}`),
			]);
			const cs = await csRes.json();
			const kd = await kdRes.json();
			const st = await stRes.json();
			const sc = await scRes.json();

			if (cs.success) classSubject = cs.data;
			if (kd.success) kds = kd.data || [];
			if (st.success) students = st.data || [];
			if (sc.success && sc.data) {
				const map: Record<string, Record<string, number | null>> = {};
				for (const row of sc.data) {
					if (!map[row.user_id]) map[row.user_id] = {};
					map[row.user_id][row.kd_id] = row.score;
				}
				scores = map;
			}
			if (kds.length > 0 && !selectedKdId) selectedKdId = kds[0].id;
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	async function reloadScores() {
		try {
			const scRes = await fetch(`/api/guru/nilai/keterampilan?class_subject_id=${classSubjectId}&semester=${selectedSemester}&type=${selectedType}`);
			const sc = await scRes.json();
			if (sc.success && sc.data) {
				const map: Record<string, Record<string, number | null>> = {};
				for (const row of sc.data) {
					if (!map[row.user_id]) map[row.user_id] = {};
					map[row.user_id][row.kd_id] = row.score;
				}
				scores = map;
			}
		} catch { /* ignore */ }
	}

	$effect(() => {
		// Reload when type or semester changes
		if (browser && classSubjectId && selectedType && selectedSemester) {
			reloadScores();
		}
	});

	const visibleKds = $derived(
		selectedKdId ? kds.filter(k => k.id === selectedKdId) : kds
	);

	function getScore(sid: string, kdId: string): number | null {
		return scores[sid]?.[kdId] ?? null;
	}

	function setScore(sid: string, kdId: string, val: string) {
		const parsed = val === '' ? null : parseFloat(val);
		if (!scores[sid]) scores[sid] = {};
		scores[sid][kdId] = (parsed !== null && !isNaN(parsed)) ? parsed : null;
		scores = { ...scores };
	}

	function calcKdAvg(kdId: string): number | null {
		const vals = students.map(s => getScore(s.id || s.user_id, kdId)).filter(v => v !== null) as number[];
		return vals.length > 0 ? Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10 : null;
	}

	function studentAvg(sid: string): number | null {
		const vals = kds.map(kd => getScore(sid, kd.id)).filter(v => v !== null) as number[];
		if (vals.length === 0) return null;
		return Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10;
	}

	async function saveAll() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = {
				class_subject_id: classSubjectId,
				semester: selectedSemester,
				type: selectedType,
				scores: [] as any[],
			};
			for (const [uid, kdScores] of Object.entries(scores)) {
				for (const [kdId, score] of Object.entries(kdScores)) {
					payload.scores.push({ user_id: uid, kd_id: kdId, score });
				}
			}
			const res = await fetch('/api/guru/nilai/keterampilan/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = '✅ Nilai keterampilan berhasil disimpan!';
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}
</script>

<svelte:head>
	<title>Keterampilan — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data keterampilan..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>🔧 Nilai Keterampilan</h1>
				<p class="meta">{classSubject?.class_name} — {classSubject?.subject_name}</p>
			</div>
			<div class="header-actions">
				<select class="sem-select" bind:value={selectedSemester} onchange={() => { selectedKdId = ''; loadAll(); }}>
					<option value="1">Semester Ganjil</option>
					<option value="2">Semester Genap</option>
				</select>
				<Button onclick={saveAll} disabled={saving} variant="secondary" size="sm">
					{saving ? '⏳ Menyimpan...' : '💾 Simpan'}
				</Button>
			</div>
		</div>

		<!-- Type Selector -->
		<div class="type-selector">
			{#each skillTypes as st}
				<button
					class="type-chip"
					class:type-chip--active={selectedType === st.value}
					onclick={() => { selectedType = st.value; selectedKdId = ''; reloadScores(); }}
				>{st.label}</button>
			{/each}
		</div>

		<!-- KD Selector -->
		{#if kds.length > 0}
			<div class="kd-selector">
				<button class="kd-chip" class:kd-chip--active={!selectedKdId} onclick={() => selectedKdId = ''}>Semua KD</button>
				{#each kds as kd}
					<button class="kd-chip" class:kd-chip--active={selectedKdId === kd.id} onclick={() => selectedKdId = kd.id}>
						{kd.code || `KD ${kd.no}`}
					</button>
				{/each}
			</div>
		{/if}

		{#if successMsg}
			<div class="toast toast--success">{successMsg}</div>
		{/if}
		{#if error}
			<div class="toast toast--error">{error}</div>
		{/if}

		{#if kds.length === 0}
			<EmptyState icon="🔧" message="Belum ada KD Keterampilan untuk kelas ini." />
		{:else if students.length === 0}
			<EmptyState icon="👨‍🎓" message="Belum ada siswa di kelas ini." />
		{:else}
			<div class="table-wrapper">
				<table class="skill-table">
					<thead>
						<tr>
							<th class="sticky-col name-col">Siswa</th>
							{#each visibleKds as kd}
								<th class="kd-col">{kd.code || `KD ${kd.no}`}</th>
							{/each}
							<th class="avg-col">Rata-rata</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student}
							{@const sid = student.id || student.user_id}
							<tr>
								<td class="sticky-col name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
								</td>
								{#each visibleKds as kd}
									{@const val = getScore(sid, kd.id)}
									<td class="score-cell">
										<input type="number" step="0.5" min="0" max="100"
											class="score-input" class:score-input--filled={val !== null}
											value={val ?? ''}
											oninput={(e) => setScore(sid, kd.id, (e.target as HTMLInputElement).value)}
											placeholder="-"
										/>
									</td>
								{/each}
								<td class="avg-cell">
									{#if studentAvg(sid) !== null}
										{studentAvg(sid)?.toFixed(1)}
									{:else}
										<span class="avg-na">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td class="sticky-col name-col">Rata-rata Kelas</td>
							{#each visibleKds as kd}
								<td class="avg-cell">
									{#if calcKdAvg(kd.id) !== null}{calcKdAvg(kd.id)?.toFixed(1)}{:else}<span class="avg-na">-</span>{/if}
								</td>
							{/each}
							<td class="avg-cell">-</td>
						</tr>
					</tfoot>
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
	.toast { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
	.toast--success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; }
	.toast--error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); color: #ef4444; }

	.type-selector { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
	.type-chip { padding: 6px 16px; border: 1px solid var(--border); border-radius: 20px; background: transparent; color: var(--text-secondary); font-size: 12px; font-family: inherit; cursor: pointer; transition: all 0.1s; }
	.type-chip:hover { border-color: var(--accent); color: var(--text); }
	.type-chip--active { background: var(--accent); color: white; border-color: var(--accent); }

	.kd-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
	.kd-chip { padding: 6px 14px; border: 1px solid var(--border); border-radius: 20px; background: transparent; color: var(--text-secondary); font-size: 12px; font-family: inherit; cursor: pointer; transition: all 0.1s; }
	.kd-chip:hover { border-color: var(--accent); color: var(--text); }
	.kd-chip--active { background: var(--accent); color: white; border-color: var(--accent); }

	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.skill-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 400px; }
	.skill-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.skill-table td { padding: 4px 6px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 160px; }
	.student-name { font-weight: 600; font-size: 13px; }
	.kd-col { min-width: 90px; text-align: center; }
	.score-cell { text-align: center; }
	.score-input { width: 56px; padding: 6px 4px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--text); font-size: 13px; font-weight: 500; text-align: center; font-family: inherit; outline: none; transition: all 0.1s; }
	.score-input:hover { border-color: var(--border); background: var(--bg-secondary); }
	.score-input:focus { border-color: var(--accent); background: var(--bg-secondary); }
	.score-input--filled { border-color: rgba(255,255,255,0.06); }
	.avg-cell { text-align: center; font-weight: 600; font-size: 13px; }
	.avg-na { color: var(--text-quaternary); }
	tfoot td { border-top: 2px solid var(--border); background: rgba(94, 106, 210, 0.04); font-weight: 500; color: var(--text-secondary); }
</style>
