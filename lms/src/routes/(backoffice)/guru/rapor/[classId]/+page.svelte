<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable, Loading, EmptyState, Button, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	let classId = $state('');
	let classInfo: any = $state(null);
	let students: any[] = $state([]);
	let loading = $state(true);
	let generating = $state(false);
	let error = $state('');
	let selectedSemester = $state('1');

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('rapor');
			if (idx !== -1 && parts[idx + 1]) classId = parts[idx + 1];
			const sem = $page.url.searchParams.get('semester');
			if (sem) selectedSemester = sem;
		}
	});

	onMount(() => {
		if (!browser) return;
		loadAll();
		if (browser) (window as any).__genRapor = generateRapor;
	});

	async function loadAll() {
		if (!classId) { setTimeout(() => loadAll(), 100); return; }
		loading = true;
		error = '';
		try {
			const [clsRes, stRes] = await Promise.all([
				fetch(`/api/guru/rapor/kelas/${classId}?semester=${selectedSemester}`),
				fetch(`/api/guru/rapor/kelas/${classId}/siswa?semester=${selectedSemester}`),
			]);
			const cls = await clsRes.json();
			const st = await stRes.json();
			if (cls.success) classInfo = cls.data;
			if (st.success) students = st.data || [];
			else error = st.error || 'Gagal memuat data siswa';
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	async function generateRapor(studentId: string) {
		try {
			const res = await fetch('/api/guru/rapor/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					class_id: classId,
					user_id: studentId,
					semester: parseInt(selectedSemester),
				}),
			});
			const json = await res.json();
			if (json.success) {
				loadAll();
			} else {
				alert(json.error || 'Gagal generate rapor');
			}
		} catch { alert('Gagal generate rapor'); }
	}

	async function generateAll() {
		if (!students.length) return;
		generating = true;
		try {
			const promises = students.map(s => 
				fetch('/api/guru/rapor/generate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						class_id: classId,
						user_id: s.id || s.user_id,
						semester: parseInt(selectedSemester),
					}),
				}).then(r => r.json())
			);
			await Promise.all(promises);
			loadAll();
		} catch { /* best-effort */ }
		finally { generating = false; }
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'No',
			accessorKey: '__no',
			cell: ({ row }) => `<span style="font-weight:600;font-size:12px;color:var(--text-secondary);text-align:center;display:block">${row.index + 1}</span>`
		},
		{
			header: 'Nama Siswa',
			accessorKey: 'name',
			cell: ({ getValue, row }) => {
				const name = getValue() || row.original.display_name || 'Siswa';
				return `<span style="font-weight:600;font-size:13px">${esc(name)}</span>`;
			}
		},
		{
			header: 'Status',
			accessorKey: 'rapor_status',
			cell: ({ getValue }) => {
				const status = (getValue() as string) || 'draft';
				const isFinalized = status === 'finalized';
				const isPrinted = status === 'printed';
				const bg = isFinalized ? 'rgba(16,185,129,0.1)' : isPrinted ? 'rgba(94,106,210,0.1)' : 'rgba(98,102,109,0.1)';
				const color = isFinalized ? '#10b981' : isPrinted ? '#5e6ad2' : 'var(--text-quaternary)';
				const label = isFinalized ? 'Finalized' : isPrinted ? 'Printed' : 'Draft';
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color}">${label}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ getValue, row }) => {
				const studentId = getValue() || row.original.user_id;
				const isDraft = !row.original.rapor_status || row.original.rapor_status === 'draft';
				const genBtn = isDraft
					? `<button onclick="window.__genRapor('${studentId}')" style="padding:4px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:6px;background:rgba(255,255,255,0.04);color:#d0d6e0;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit">Generate</button>`
					: '';
				const prevHref = `/guru/rapor/${classId}/${studentId}?semester=${selectedSemester}`;
				const prevStyle = isDraft
					? 'padding:4px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:6px;background:transparent;color:#d0d6e0;font-size:12px;font-weight:500;cursor:pointer;text-decoration:none;font-family:inherit'
					: 'padding:4px 12px;border:1px solid rgba(94,106,210,0.3);border-radius:6px;background:rgba(94,106,210,0.1);color:#5e6ad2;font-size:12px;font-weight:500;cursor:pointer;text-decoration:none;font-family:inherit';
				return `<div style="display:flex;gap:6px;justify-content:flex-end">${genBtn}<a href="${prevHref}" style="${prevStyle}">Preview</a></div>`;
			}
		}
	];
</script>

<svelte:head>
	<title>Rapor — {classInfo?.name || classInfo?.class_name || 'Loading'} — Wali Kelas — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error && !classInfo}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/rapor">← {t('rapor.daftar_kelas')}</a>
				</div>
				<h1>{t('rapor.rapor_siswa')}</h1>
				<p class="meta">
					{classInfo?.name || classInfo?.class_name}
					{#if classInfo?.grade_level_name}
						<span class="meta-sep">·</span>
						<span>{classInfo.grade_level_name}</span>
					{/if}
				</p>
			</div>
			<div class="header-actions">
				<Select options={[{ value:'1', label: t('nilai.semester_ganjil') }, { value:'2', label: t('nilai.semester_genap') }]} bind:value={selectedSemester} onchange={() => loadAll()} />
				<Button onclick={generateAll} disabled={generating || students.length === 0} variant="secondary">
					{generating ? t('rapor.generating') : t('rapor.generate_all')}
				</Button>
			</div>
		</div>

		{#if students.length === 0}
			<EmptyState icon="👨‍🎓" message={t('rapor.belum_ada_siswa')} description={t('rapor.belum_ada_siswa_desc')} />
		{:else}
			<DataTable
				{columns}
				data={students}
				pageSize={200}
				showSearch={false}
				showPagination={false}
				emptyMessage={t('rapor.belum_ada_siswa_tabel')}
			/>
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
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; gap: 6px; }
	.meta-sep { color: var(--text-quaternary); }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; font-family: inherit; }
	.btn-secondary:hover { background: var(--surface-hover); }
	.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
