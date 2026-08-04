<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Button, Card, CardContent, Spinner, EmptyState, Alert } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let subject = $state('');
	let grade = $state('X');
	let curriculumId = $state('');
	let curricula = $state<any[]>([]);

	// Students & assignments
	let students = $state<string[]>(['']);
	let assignments = $state<string[]>(['Asesmen 1']);
	let scores = $state<(number | null)[][]>([[null]]); // [assignmentIdx][studentIdx]

	let analyzing = $state(false);
	let result = $state('');
	let error = $state('');
	let history = $state<any[]>([]);
	let showHistory = $state(false);

	// Mode: manual grid or gradebook
	let mode = $state<'manual' | 'gradebook'>('manual');
	let offerings = $state<any[]>([]);
	let selectedOffering = $state('');
	let gbLoading = $state(false);
	let gbData = $state<any>(null);

	onMount(() => {
		if (!browser) return;
		fetch('/api/curricula').then((r) => r.json()).then((j) => { if (j.success) curricula = j.data || []; }).catch(() => {});
		fetch('/api/aiedu/analyses').then((r) => r.json()).then((j) => { if (j.success) history = j.data || []; }).catch(() => {});
		fetch('/api/instructor/courses').then((r) => r.json()).then((j) => { if (j.success) offerings = j.data || []; }).catch(() => {});
	});

	// Load gradebook data for selected offering
	async function loadGradebook() {
		if (!selectedOffering) { gbData = null; return; }
		gbLoading = true;
		try {
			const res = await fetch(`/api/aiedu/analyze-gradebook?offering_id=${selectedOffering}`);
			const json = await res.json();
			if (json.success) gbData = json.data;
			else { error = json.error || 'Gagal load gradebook'; gbData = null; }
		} catch { error = 'Gagal load gradebook'; gbData = null; } finally { gbLoading = false; }
	}

	// Analyze from gradebook (auto)
	async function analyzeFromGradebook() {
		if (!gbData || !gbData.students?.length) { error = 'Tidak ada data nilai di kelas ini'; return; }
		analyzing = true;
		error = '';
		try {
			// Group grades by student
			const studentGrades = new Map<string, (number | null)[]>();
			for (const s of gbData.students) studentGrades.set(s.id, []);
			const gradeMap = new Map<string, Map<string, number | null>>();
			for (const g of gbData.grades) {
				if (!gradeMap.has(g.user_id)) gradeMap.set(g.user_id, new Map());
				gradeMap.get(g.user_id)!.set(g.assessment || 'default', g.max_score ? Math.round((g.score / g.max_score) * 100) : g.score);
			}
			const assessKeys = [...new Set(gbData.grades.map((g: any) => g.assessment || 'default'))] as string[];
			const autoAssignments = assessKeys.map((k: string, i: number) => k === 'default' ? `Nilai ${i + 1}` : k);
			const autoStudents = gbData.students.map((s: any) => s.name);
			const autoScores = assessKeys.map((k: string) => gbData.students.map((s: any) => gradeMap.get(s.id)?.get(k) ?? null));

			const res = await fetch('/api/aiedu/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					subject: gbData.subject || subject || 'Umum',
					grade,
					curriculum_id: curriculumId || undefined,
					students: autoStudents,
					assignments: autoAssignments,
					scores: autoScores,
				}),
			});
			const json = await res.json();
			if (json.success) {
				result = json.data.output;
				fetch('/api/aiedu/analyses').then((r) => r.json()).then((j) => { if (j.success) history = j.data || []; }).catch(() => {});
			} else error = json.error || 'Gagal analisis';
		} catch { error = 'Gagal analisis dari gradebook'; } finally { analyzing = false; }
	}

	function addStudent() {
		students = [...students, ''];
		scores = scores.map((row) => [...row, null]);
	}
	function removeStudent(i: number) {
		students = students.filter((_, idx) => idx !== i);
		scores = scores.map((row) => row.filter((_, idx) => idx !== i));
	}
	function addAssignment() {
		assignments = [...assignments, `Asesmen ${assignments.length + 1}`];
		scores = [...scores, scores[0].map(() => null)];
	}
	function removeAssignment(i: number) {
		assignments = assignments.filter((_, idx) => idx !== i);
		scores = scores.filter((_, idx) => idx !== i);
	}

	async function analyze() {
		const validStudents = students.map((s) => s.trim()).filter(Boolean);
		if (validStudents.length === 0) { error = 'Isi minimal 1 nama siswa'; return; }
		analyzing = true;
		error = '';
		try {
			const res = await fetch('/api/aiedu/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					subject: subject.trim() || 'Umum',
					grade: grade,
					curriculum_id: curriculumId || undefined,
					students: validStudents,
					assignments,
					scores,
				}),
			});
			const json = await res.json();
			if (json.success) {
				result = json.data.output;
				fetch('/api/aiedu/analyses').then((r) => r.json()).then((j) => { if (j.success) history = j.data || []; }).catch(() => {});
			} else error = json.error || 'Gagal analisis';
		} catch { error = 'Gagal analisis'; } finally { analyzing = false; }
	}

	function downloadMd() {
		const blob = new Blob([result], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `analisis-nilai-${subject || 'kelas'}.md`; a.click();
		URL.revokeObjectURL(url);
	}
</script>

<PageHeader title="Analisis Nilai" subtitle="AI analisis data nilai kelas — remedial, pola kesulitan, rekomendasi" />

{#if error}
	<Alert variant="danger" class="mb">{error}</Alert>
{/if}

<div class="analisis-layout">
	<div class="form-col">
		<div class="mode-tabs">
			<button class="mode-tab" class:active={mode === 'manual'} onclick={() => mode = 'manual'}>📊 Input Manual</button>
			<button class="mode-tab" class:active={mode === 'gradebook'} onclick={() => mode = 'gradebook'}>📋 Dari Gradebook</button>
		</div>

		{#if mode === 'gradebook'}
			<Card>
				<CardContent>
					<h3 class="section-title">Ambil Nilai dari Kelas</h3>
					<label class="field">
						<span>Pilih Kelas/Kursus</span>
						<select bind:value={selectedOffering} onchange={loadGradebook}>
							<option value="">— Pilih kelas —</option>
							{#each offerings as o (o.id)}
								<option value={o.id}>{o.subject || o.code || o.id}</option>
							{/each}
						</select>
					</label>
					{#if gbLoading}
						<div class="center"><Spinner /> <span>Memuat data nilai...</span></div>
					{:else if gbData}
						<div class="gb-summary">
							<span>👩‍🎓 {gbData.students?.length || 0} siswa</span>
							<span>📝 {gbData.assessment_labels?.length || gbData.grades?.length || 0} penilaian</span>
						</div>
						{#if gbData.students?.length > 0}
							<div class="gb-preview">
								<div class="gb-row gb-header">
									<strong>Nama</strong>
									{#each gbData.assessment_labels || [] as lbl}
										<strong class="gb-cell">{lbl}</strong>
									{/each}
								</div>
								{#each gbData.students as s (s.id)}
									<div class="gb-row">
										<span class="gb-name">{s.name}</span>
										{#each gbData.assessment_labels || [] as _, i}
											<span class="gb-cell">—</span>
										{/each}
									</div>
								{/each}
							</div>
						{:else}
							<p class="gb-empty">Tidak ada siswa terdaftar di kelas ini.</p>
						{/if}
						<div class="form-actions" style="margin-top:14px">
							<Button variant="primary" onclick={analyzeFromGradebook} loading={analyzing} disabled={!gbData?.students?.length}>🤖 Analisis dari Gradebook</Button>
						</div>
					{/if}
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent>
					<h3 class="section-title">Data Nilai</h3>
				<div class="form-row">
					<label class="field"><span>Mapel</span><input type="text" bind:value={subject} placeholder="Informatika" /></label>
					<label class="field"><span>Kelas</span><input type="text" bind:value={grade} placeholder="X" /></label>
					<label class="field">
						<span>Kurikulum</span>
						<select bind:value={curriculumId}>
							<option value="">Default (Merdeka)</option>
							{#each curricula as c}<option value={c.id}>{c.name}</option>{/each}
						</select>
					</label>
				</div>

				<div class="grid-head">
					<strong>Nama Siswa</strong>
					{#each assignments as a, ai (ai)}
						<strong class="asg">{a}</strong>
					{/each}
					<span></span>
				</div>

				<div class="grid-body">
					{#each students as _, si}
						<div class="grid-row">
							<input type="text" bind:value={students[si]} placeholder={`Siswa ${si + 1}`} />
							{#each assignments as _, ai}
								<input
									type="number"
									min="0"
									max="100"
									value={scores[ai]?.[si] ?? ''}
									oninput={(e) => {
										const v = (e.currentTarget as HTMLInputElement).value;
										const num = v === '' ? null : Number(v);
										if (!scores[ai]) scores[ai] = [];
										scores[ai][si] = num;
										scores = scores;
									}}
									placeholder="—"
									class="score-input"
								/>
							{/each}
							<button class="del-btn" onclick={() => removeStudent(si)} title="Hapus">✕</button>
						</div>
					{/each}
				</div>

				<div class="grid-tools">
					<Button size="sm" variant="secondary" onclick={addStudent}>+ Siswa</Button>
					<Button size="sm" variant="secondary" onclick={addAssignment}>+ Asesmen</Button>
					{#if assignments.length > 1}
						<Button size="sm" variant="danger" onclick={() => removeAssignment(assignments.length - 1)}>− Asesmen</Button>
					{/if}
				</div>

				<div class="form-actions">
					<Button variant="primary" onclick={analyze} loading={analyzing}>🤖 Analisis dengan AI</Button>
				</div>
			</CardContent>
		</Card>
		{/if}

		{#if history.length > 0}
			<Card class="mt">
				<CardContent>
					<h3 class="section-title" onclick={() => (showHistory = !showHistory)} style="cursor:pointer">Riwayat Analisis ({history.length})</h3>
					{#if showHistory}
						<div class="history-list">
							{#each history as h (h.id)}
								<div class="history-item">
									<span>{h.subject || 'Umum'} · {h.grade}</span>
									<span class="h-time">{h.created_at?.slice(0, 16)}</span>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}
	</div>

	<div class="result-col">
		<Card class="result-card">
			<CardContent>
				<div class="result-head">
					<h3 class="section-title">Hasil Analisis</h3>
					{#if result}
						<Button size="sm" variant="secondary" onclick={downloadMd}>📥 .md</Button>
					{/if}
				</div>
				{#if analyzing}
					<div class="center"><Spinner /><span class="ai-note">AI menganalisis nilai...</span></div>
				{:else if result}
					<div class="md">{@html parseMarkdown(result)}</div>
				{:else}
					<EmptyState icon="bar-chart" title="Belum ada analisis" desc="Isi data nilai lalu klik Analisis" />
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.mt { margin-top: 16px; }
	.analisis-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
	.form-col, .result-col { display: flex; flex-direction: column; gap: 16px; }
	.section-title { font-size: 15px; margin: 0 0 12px; }
	.form-row { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 10px; margin-bottom: 14px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
	.field input, .field select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
	.grid-head { display: grid; grid-template-columns: 1.4fr repeat(auto-fit, minmax(80px, 0.8fr)) 20px; gap: 6px; align-items: center; font-size: 12px; margin-bottom: 6px; }
	.asg { font-size: 11px; }
	.grid-row { display: grid; grid-template-columns: 1.4fr repeat(auto-fit, minmax(80px, 0.8fr)) 20px; gap: 6px; margin-bottom: 6px; align-items: center; }
	.grid-row input { padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; width: 100%; box-sizing: border-box; }
	.score-input { text-align: center; }
	.del-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 13px; }
	.del-btn:hover { color: #dc2626; }
	.grid-tools { display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
	.form-actions { margin-top: 8px; }
	.center { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 32px; color: var(--text-secondary); font-size: 13px; }
	.result-card { min-height: 300px; }
	.result-head { display: flex; justify-content: space-between; align-items: center; }
	.md { font-size: 13px; line-height: 1.6; }
	.md :global(h1), .md :global(h2), .md :global(h3) { margin: 14px 0 8px; }
	.md :global(p) { margin: 0 0 8px; }
	.md :global(pre) { background: #0f1115; color: #e6e6e6; padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
	.md :global(table) { border-collapse: collapse; margin: 8px 0; font-size: 12px; width: 100%; }
	.md :global(th), .md :global(td) { border: 1px solid var(--border); padding: 5px 8px; }
	.md :global(th) { background: var(--surface); }
	.history-list { display: flex; flex-direction: column; gap: 6px; }
	.history-item { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; }
	.h-time { color: var(--text-muted); font-size: 12px; }
	.mode-tabs { display: flex; gap: 4px; margin-bottom: 14px; }
	.mode-tab { flex: 1; padding: 9px; border: 1px solid var(--border); border-radius: 10px; background: white; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; }
	.mode-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
	.gb-summary { display: flex; gap: 18px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
	.gb-preview { max-height: 260px; overflow-y: auto; border: 1px solid var(--border); border-radius: 10px; }
	.gb-row { display: grid; grid-template-columns: 1fr repeat(auto-fit, minmax(60px, 0.5fr)); gap: 4px; padding: 7px 10px; border-bottom: 1px solid var(--surface); font-size: 12px; }
	.gb-header { background: var(--surface); }
	.gb-name { font-weight: 500; }
	.gb-cell { text-align: center; color: var(--text-muted); }
	.gb-empty { font-size: 13px; color: var(--text-muted); text-align: center; padding: 16px; }
</style>
