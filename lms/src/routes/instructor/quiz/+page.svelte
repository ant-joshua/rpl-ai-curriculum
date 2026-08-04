<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, Button, Alert, Spinner, EmptyState, Badge } from '$lib/components/ui';

	let offerings = $state<any[]>([]);
	let selectedOffering = $state('');
	let qbQuestions = $state<any[]>([]);
	let loadingQ = $state(false);
	let selectedIds = $state<Set<string>>(new Set());
	let existingAssessments = $state<any[]>([]);
	let loadingA = $state(false);

	// Form
	let title = $state('');
	let passingScore = $state('70');
	let timeLimit = $state('15');
	let maxAttempts = $state('1');
	let dueDate = $state('');
	let creating = $state(false);
	let error = $state('');
	let successMsg = $state('');

	onMount(() => {
		if (!browser) return;
		fetch('/api/instructor/courses').then((r) => r.json()).then((j) => { if (j.success) offerings = j.data || []; }).catch(() => {});
	});

	async function loadOfferingData() {
		error = '';
		successMsg = '';
		if (!selectedOffering) { qbQuestions = []; existingAssessments = []; return; }
		loadingQ = true;
		loadingA = true;
		selectedIds = new Set();
		try {
			const [qRes, aRes] = await Promise.all([
				fetch(`/api/admin/question-bank?course_offering_id=${selectedOffering}&limit=100`),
				fetch(`/api/instructor/assessments?course_offering_id=${selectedOffering}`),
			]);
			const qJson = await qRes.json();
			const aJson = await aRes.json();
			qbQuestions = qJson.success ? (qJson.data || []) : [];
			existingAssessments = aJson.success ? (aJson.data || []) : [];
		} catch { error = 'Gagal memuat data'; } finally { loadingQ = false; loadingA = false; }
	}

	function toggleQ(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id); else next.add(id);
		selectedIds = next;
	}

	const TYPE_LABELS: Record<string, string> = {
		multiple_choice: 'PG', essay: 'Esai', code: 'Kode', true_false: 'B/S', short_answer: 'Isian',
	};

	async function createQuiz() {
		if (!selectedOffering) { error = 'Pilih kelas dulu'; return; }
		if (!title.trim()) { error = 'Judul quiz wajib diisi'; return; }
		if (selectedIds.size === 0) { error = 'Pilih minimal 1 soal'; return; }
		creating = true;
		error = '';
		successMsg = '';
		try {
			const res = await fetch('/api/instructor/assessments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					course_offering_id: selectedOffering,
					title: title.trim(),
					passing_score: Number(passingScore) || 70,
					time_limit_minutes: Number(timeLimit) || null,
					max_attempts: Number(maxAttempts) || 1,
					due_date: dueDate || null,
					status: 'published',
					question_ids: [...selectedIds],
				}),
			});
			const json = await res.json();
			if (json.success) {
				successMsg = `Quiz dibuat ✅ ${json.data.question_count} soal, dikirim ke ${existingAssessments.length ? 'siswa' : 'kelas'} via notifikasi`;
				title = '';
				selectedIds = new Set();
				loadOfferingData();
			} else error = json.error || 'Gagal buat quiz';
		} catch { error = 'Gagal buat quiz'; } finally { creating = false; }
	}
</script>

<PageHeader title="Quiz Builder" subtitle="Buat quiz dari Question Bank, langsung assign ke kelas" />

{#if error}<Alert variant="danger" class="mb">{error}</Alert>{/if}
{#if successMsg}<Alert variant="success" class="mb">{successMsg}</Alert>{/if}

<div class="qb-layout">
	<div class="qb-left">
		<Card>
			<CardContent>
				<h3 class="section-title">1. Pilih Kelas</h3>
				<select bind:value={selectedOffering} onchange={loadOfferingData} class="offering-select">
					<option value="">— Pilih kelas —</option>
					{#each offerings as o (o.id)}
						<option value={o.id}>{o.name || o.code || o.id}</option>
					{/each}
				</select>

				<h3 class="section-title mt2">2. Soal dari Question Bank</h3>
				{#if loadingQ}
					<div class="center"><Spinner /></div>
				{:else if qbQuestions.length === 0}
					<EmptyState icon="help-circle" title="Belum ada soal" description="Generate soal di AIEdu → Import ke QBank, atau tambah manual di Admin QBank." />
				{:else}
					<div class="q-list">
						{#each qbQuestions as q (q.id)}
							<label class="q-item">
								<input type="checkbox" checked={selectedIds.has(q.id)} onchange={() => toggleQ(q.id)} />
								<span class="q-type">{TYPE_LABELS[q.type] || q.type}</span>
								<span class="q-text">{q.question}</span>
								<span class="q-diff">{q.difficulty}</span>
							</label>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<div class="qb-right">
		<Card>
			<CardContent>
				<h3 class="section-title">3. Konfigurasi Quiz</h3>
				<label class="field">
					<span>Judul Quiz *</span>
					<input type="text" bind:value={title} placeholder="Contoh: Kuis Perulangan Python" />
				</label>
				<div class="form-row">
					<label class="field">
						<span>KKM / Passing</span>
						<input type="number" bind:value={passingScore} min="0" max="100" />
					</label>
					<label class="field">
						<span>Batas Waktu (menit)</span>
						<input type="number" bind:value={timeLimit} min="0" placeholder="0 = tanpa batas" />
					</label>
				</div>
				<div class="form-row">
					<label class="field">
						<span>Max Attempts</span>
						<input type="number" bind:value={maxAttempts} min="1" />
					</label>
					<label class="field">
						<span>Tenggat (opsional)</span>
						<input type="datetime-local" bind:value={dueDate} />
					</label>
				</div>
				<div class="summary">
					<span>Terpilih: <strong>{selectedIds.size}</strong> soal</span>
				</div>
				<div class="form-actions">
					<Button variant="primary" fullWidth onclick={createQuiz} loading={creating} disabled={!selectedOffering || selectedIds.size === 0}>
						🚀 Buat &amp; Assign Quiz
					</Button>
				</div>
			</CardContent>
		</Card>

		{#if existingAssessments.length > 0}
			<Card class="mt">
				<CardContent>
					<h3 class="section-title">Quiz di Kelas Ini ({existingAssessments.length})</h3>
					<div class="assess-list">
						{#each existingAssessments as a (a.id)}
							<div class="assess-item">
								<div class="assess-main">
									<span class="assess-title">{a.title}</span>
									<span class="assess-sub">{a.question_count} soal · {a.status} · passing {a.passing_score}</span>
								</div>
								<Badge variant={a.status === 'published' ? 'success' : 'secondary'}>{a.status}</Badge>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.mt { margin-top: 16px; }
	.mt2 { margin-top: 20px; }
	.qb-layout { display: grid; grid-template-columns: 1fr 360px; gap: 18px; align-items: start; }
	.section-title { font-size: 15px; margin: 0 0 12px; }
	.offering-select, .field input { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; font-family: inherit; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; margin-bottom: 12px; }
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	.center { display: flex; justify-content: center; padding: 20px; }
	.q-list { max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
	.q-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 11px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; cursor: pointer; background: white; }
	.q-item:hover { border-color: var(--primary); }
	.q-item input { margin-top: 2px; }
	.q-type { font-size: 10px; font-weight: 700; background: var(--surface); padding: 2px 7px; border-radius: 6px; color: var(--primary); flex-shrink: 0; margin-top: 1px; }
	.q-text { flex: 1; }
	.q-diff { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
	.summary { font-size: 13px; color: var(--text-secondary); margin: 12px 0; }
	.form-actions { margin-top: 4px; }
	.assess-list { display: flex; flex-direction: column; gap: 8px; }
	.assess-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 9px; }
	.assess-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.assess-title { font-size: 13px; font-weight: 600; }
	.assess-sub { font-size: 11px; color: var(--text-muted); }
	@media (max-width: 900px) { .qb-layout { grid-template-columns: 1fr; } }
</style>
