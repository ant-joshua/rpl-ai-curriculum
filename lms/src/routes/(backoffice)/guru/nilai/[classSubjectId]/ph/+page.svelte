<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Loading, EmptyState, Select } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let kds: any[] = $state([]);
	let students: any[] = $state([]);
	let scores: Record<string, Record<string, number | null>> = $state({});
	let loading = $state(true);
	let saving = $state(false);
	let savingCell = $state(false);
	let error = $state('');
	let successMsg = $state('');
	let selectedSemester = $state('1');
	let selectedKdId = $state('');
	let autoSaveTimer: ReturnType<typeof setTimeout> | null = $state(null);

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
				fetch(`/api/guru/kelas/${classSubjectId}/kd?type=pengetahuan`),
				fetch(`/api/guru/kelas/${classSubjectId}/siswa?semester=${selectedSemester}`),
				fetch(`/api/guru/nilai/ph?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			const kd = await kdRes.json();
			const st = await stRes.json();
			const sc = await scRes.json();

			if (cs.success) classSubject = cs.data;
			if (kd.success) kds = kd.data || [];
			if (st.success) students = st.data || [];
			if (sc.success && sc.data) {
				const scoreMap: Record<string, Record<string, number | null>> = {};
				for (const row of sc.data) {
					if (!scoreMap[row.user_id]) scoreMap[row.user_id] = {};
					scoreMap[row.user_id][row.kd_id] = row.score;
				}
				scores = scoreMap;
			}

			if (kds.length > 0 && !selectedKdId) selectedKdId = kds[0].id;
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	// Filter KDs — show either selected KD or all
	const visibleKds = $derived(
		selectedKdId ? kds.filter(k => k.id === selectedKdId) : kds
	);

	function getScore(studentId: string, kdId: string): number | null {
		return scores[studentId]?.[kdId] ?? null;
	}

	function setScore(studentId: string, kdId: string, val: string) {
		const parsed = val === '' ? null : parseFloat(val);
		if (!scores[studentId]) scores[studentId] = {};
		scores[studentId][kdId] = (parsed !== null && !isNaN(parsed)) ? parsed : null;
		// Trigger reactivity
		scores = { ...scores };
		// Auto-save debounce
		if (autoSaveTimer) clearTimeout(autoSaveTimer);
		autoSaveTimer = setTimeout(() => autoSaveAll(), 2000);
	}

	function kdAverage(studentId: string): number | null {
		const vals = kds.map(kd => getScore(studentId, kd.id)).filter(v => v !== null) as number[];
		if (vals.length === 0) return null;
		const sum = vals.reduce((a, b) => a + b, 0);
		return Math.round((sum / vals.length) * 10) / 10;
	}

	async function autoSaveAll() {
		if (savingCell) return;
		savingCell = true;
		try {
			const payload: { class_subject_id: string; semester: string; scores: { user_id: string; kd_id: string; score: number | null }[] } = {
				class_subject_id: classSubjectId,
				semester: selectedSemester,
				scores: [],
			};
			for (const [userId, kdScores] of Object.entries(scores)) {
				for (const [kdId, score] of Object.entries(kdScores)) {
					payload.scores.push({ user_id: userId, kd_id: kdId, score });
				}
			}
			const res = await fetch('/api/guru/nilai/ph/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (!json.success) error = json.error || 'Gagal menyimpan';
			else successMsg = 'Tersimpan otomatis';
		} catch { error = 'Gagal menyimpan'; }
		finally {
			savingCell = false;
			setTimeout(() => { if (successMsg) successMsg = ''; }, 2000);
		}
	}

	async function manualSave() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = { class_subject_id: classSubjectId, semester: selectedSemester, scores: [] as any[] };
			for (const [userId, kdScores] of Object.entries(scores)) {
				for (const [kdId, score] of Object.entries(kdScores)) {
					payload.scores.push({ user_id: userId, kd_id: kdId, score });
				}
			}
			const res = await fetch('/api/guru/nilai/ph/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = '✅ Semua nilai berhasil disimpan!';
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}

	const nphAverage = $derived.by(() => {
		if (students.length === 0) return 0;
		let total = 0;
		let count = 0;
		for (const s of students) {
			const avg = kdAverage(s.id || s.user_id);
			if (avg !== null) { total += avg; count++; }
		}
		return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
	});

	function calcKdAvg(kdId: string): number | null {
		const vals = students.map(s => getScore(s.id || s.user_id, kdId)).filter(v => v !== null) as number[];
		return vals.length > 0 ? Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10 : null;
	}

	const totalCells = $derived(students.length * visibleKds.length);
</script>

<svelte:head>
	<title>PH — {classSubject?.subject_name || 'Nilai'} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data PH..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>📝 Pengetahuan Harian (PH)</h1>
				<p class="meta">
					{classSubject?.class_name} — {classSubject?.subject_name}
					{#if classSubject?.grade_level_name}
						<span class="meta-sep">·</span>
						{classSubject.grade_level_name}
					{/if}
				</p>
			</div>
			<div class="header-actions">
				<div class="sem-selector">
					<label class="sem-label">Semester:</label>
					<Select options={[{ value:'1', label:'Ganjil' }, { value:'2', label:'Genap' }]} bind:value={selectedSemester} onchange={() => loadAll()} />
				</div>
				<Button onclick={manualSave} disabled={saving} variant="secondary" size="sm">
					{saving ? '⏳ Menyimpan...' : '💾 Simpan Semua'}
				</Button>
			</div>
		</div>

		<!-- KD Selector -->
		<div class="kd-selector">
			<button
				class="kd-chip"
				class:kd-chip--active={!selectedKdId}
				onclick={() => selectedKdId = ''}
			>Semua KD</button>
			{#each kds as kd}
				<button
					class="kd-chip"
					class:kd-chip--active={selectedKdId === kd.id}
					onclick={() => selectedKdId = kd.id}
				>{kd.code || `KD ${kd.no}`}</button>
			{/each}
		</div>

		{#if successMsg}
			<div class="toast toast--success">{successMsg}</div>
		{/if}
		{#if error}
			<div class="toast toast--error">{error}</div>
		{/if}

		{#if kds.length === 0}
			<EmptyState icon="📝" message="Belum ada KD Pengetahuan untuk kelas ini." description="Admin perlu menambahkan KD terlebih dahulu." />
		{:else if students.length === 0}
			<EmptyState icon="👨‍🎓" message="Belum ada siswa di kelas ini." />
		{:else}
			<div class="table-wrapper">
				<table class="ph-table">
					<thead>
						<tr>
							<th class="sticky-col name-col">Siswa</th>
							{#each visibleKds as kd}
								<th class="kd-col">
									<div class="kd-header">
										<span class="kd-code">{kd.code || `KD ${kd.no}`}</span>
										{#if kd.description}
											<span class="kd-desc">{kd.description}</span>
										{/if}
									</div>
								</th>
							{/each}
							<th class="avg-col">Rata-rata (NPH)</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student}
							{@const sid = student.id || student.user_id}
							<tr>
								<td class="sticky-col name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
									{#if student.nisn}
										<span class="student-nisn">{student.nisn}</span>
									{/if}
								</td>
								{#each visibleKds as kd}
									{@const val = getScore(sid, kd.id)}
									<td class="score-cell" class:cell--empty={val === null}>
										<input
											type="number"
											step="0.5"
											min="0"
											max="100"
											class="score-input"
											class:score-input--filled={val !== null}
											value={val ?? ''}
											oninput={(e) => setScore(sid, kd.id, (e.target as HTMLInputElement).value)}
											placeholder="-"
										/>
									</td>
								{/each}
								<td class="avg-cell">
									{#if kdAverage(sid) !== null}
										<span class="avg-value">{kdAverage(sid)?.toFixed(1)}</span>
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
									{#if calcKdAvg(kd.id) !== null}
										<span class="avg-value">{calcKdAvg(kd.id)?.toFixed(1)}</span>
									{:else}
										<span class="avg-na">-</span>
									{/if}
								</td>
							{/each}
							<td class="avg-cell">
								<span class="avg-value">{nphAverage.toFixed(1)}</span>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div class="table-footer">
				<span class="cell-count">{totalCells} sel · auto-save aktif</span>
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
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; gap: 6px; align-items: center; }
	.meta-sep { color: var(--text-quaternary); }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

	.sem-selector { display: flex; align-items: center; gap: 6px; }
	.sem-label { font-size: 13px; color: var(--text-secondary); }
	.sem-select {
		padding: 6px 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
	}

	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.toast {
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 12px;
		animation: fadeInUp 0.2s ease both;
	}
	.toast--success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; }
	.toast--error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); color: #ef4444; }

	.kd-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}
	.kd-chip {
		padding: 6px 14px;
		border: 1px solid var(--border);
		border-radius: 20px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.1s;
	}
	.kd-chip:hover { border-color: var(--accent); color: var(--text); }
	.kd-chip--active { background: var(--accent); color: white; border-color: var(--accent); }

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
	}

	.ph-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; }
	.ph-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.ph-table td { padding: 4px 6px; border-bottom: 1px solid var(--border); vertical-align: middle; }

	.sticky-col { position: sticky; left: 0; background: var(--surface); z-index: 2; }
	.name-col { min-width: 160px; max-width: 200px; }
	.student-name { font-weight: 600; font-size: 13px; display: block; }
	.student-nisn { font-size: 11px; color: var(--text-quaternary); }

	.kd-col { min-width: 90px; max-width: 120px; text-align: center; }
	.kd-header { display: flex; flex-direction: column; align-items: center; gap: 2px; }
	.kd-code { font-size: 12px; }
	.kd-desc { font-size: 9px; color: var(--text-quaternary); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.score-cell { text-align: center; }
	.score-input {
		width: 56px;
		padding: 6px 4px;
		border: 1px solid transparent;
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		text-align: center;
		font-family: inherit;
		outline: none;
		transition: all 0.1s;
	}
	.score-input:hover { border-color: var(--border); background: var(--bg-secondary); }
	.score-input:focus { border-color: var(--accent); background: var(--bg-secondary); }
	.score-input--filled { border-color: rgba(255,255,255,0.06); }

	.cell--empty { opacity: 0.5; }

	.avg-cell { text-align: center; font-weight: 600; font-size: 13px; }
	.avg-value { color: var(--accent); }
	.avg-na { color: var(--text-quaternary); }

	tfoot td { border-top: 2px solid var(--border); background: rgba(94, 106, 210, 0.04); font-weight: 500; color: var(--text-secondary); }

	.table-footer { display: flex; justify-content: flex-end; padding: 8px 12px; font-size: 11px; color: var(--text-quaternary); }

	@keyframes fadeInUp { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
</style>
