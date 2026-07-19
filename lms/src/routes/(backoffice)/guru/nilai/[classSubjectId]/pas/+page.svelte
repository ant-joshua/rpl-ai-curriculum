<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable, Button, Skeleton, EmptyState, Select } from '$lib/components/ui/index.js';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let students: any[] = $state([]);
	let pasScores: Record<string, number | null> = $state({});
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
				fetch(`/api/guru/nilai/pas?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			const st = await stRes.json();
			const sc = await scRes.json();
			if (cs.success) classSubject = cs.data;
			if (st.success) students = st.data || [];
			if (sc.success && sc.data) {
				const map: Record<string, number | null> = {};
				for (const row of sc.data) map[row.user_id] = row.score;
				pasScores = map;
			}
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	function getScore(sid: string): number | null {
		return pasScores[sid] ?? null;
	}

	function setScore(sid: string, val: string) {
		const parsed = val === '' ? null : parseFloat(val);
		pasScores[sid] = (parsed !== null && !isNaN(parsed)) ? parsed : null;
		pasScores = { ...pasScores };
	}

	async function saveAll() {
		saving = true;
		error = '';
		successMsg = '';
		try {
			const payload = {
				class_subject_id: classSubjectId,
				semester: selectedSemester,
				scores: Object.entries(pasScores).map(([user_id, score]) => ({ user_id, score })),
			};
			const res = await fetch('/api/guru/nilai/pas/save', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) successMsg = t('nilai.pas_tersimpan');
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}

	const mergedData = $derived(
		students.map(s => {
			const sid = s.id || s.user_id;
			return { ...s, _sid: sid, _score: getScore(sid) };
		})
	);

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.matches('.dt-pas-input')) return;
		const sid = input.dataset.sid;
		if (sid) setScore(sid, input.value);
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'No',
			accessorKey: '_sid',
			cell: ({ row }) => `<span style="color:var(--text-quaternary);font-size:13px">${row.index + 1}</span>`
		},
		{
			header: 'Siswa',
			accessorKey: 'name',
			cell: ({ getValue, row }) => `<span style="font-weight:600;font-size:13px">${getValue() || row.original.display_name || 'Siswa'}</span>`
		},
		{
			header: 'Nilai PAS',
			accessorKey: '_score',
			cell: ({ getValue, row }) => {
				const score = getValue();
				const sid = row.original._sid;
				const filled = score !== null && score !== undefined;
				return `<input
					type="number"
					step="0.5"
					min="0"
					max="100"
					class="dt-pas-input"
					data-sid="${sid}"
					value="${score ?? ''}"
					placeholder="-"
					style="width:72px;padding:6px 8px;border:1px solid ${filled ? 'rgba(255,255,255,0.12)' : 'var(--border)'};border-radius:6px;background:var(--bg);color:var(--text);font-size:14px;font-weight:600;text-align:center;font-family:inherit;outline:none"
				/>`;
			}
		},
	];
</script>

<svelte:head>
	<title>PAS — {classSubject?.subject_name || 'Nilai'} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page" oninput={handleInput}>
	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>{t('nilai.pas')}</h1>
				<p class="meta">{classSubject?.class_name} — {classSubject?.subject_name}</p>
			</div>
			<div class="header-actions">
				<Select options={[{ value:'1', label: t('nilai.semester_ganjil') }, { value:'2', label: t('nilai.semester_genap') }]} bind:value={selectedSemester} onchange={() => loadAll()} />
				<Button onclick={saveAll} disabled={saving} variant="secondary" size="sm">
					{saving ? t('nilai.menyimpan') : t('nilai.simpan')}
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
			<EmptyState icon="👨‍🎓" message={t('nilai.belum_ada_siswa')} />
		{:else}
			<DataTable
				{columns}
				data={mergedData}
				showSearch={false}
				showPagination={false}
				emptyMessage={t('nilai.belum_ada_siswa_tabel')}
			/>
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
</style>
