<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable, Button, Loading, EmptyState, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

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
		(window as any).__updateSikap = (sid: string, field: string, val: string) => updateSikap(sid, field, val);
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
			if (json.success) successMsg = t('nilai.sikap_tersimpan');
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
	}

	function predikatSelect(sid: string, field: string, current: string): string {
		const opts = predikatOptions.map(p =>
			`<option value="${p}"${p === current ? ' selected' : ''}>${p === '-' ? '-' : p}</option>`
		).join('');
		return `<select style="padding:4px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer"
			onchange="window.__updateSikap('${esc(sid)}', '${field}', this.value)">${opts}</select>`;
	}

	function descInput(sid: string, field: string, current: string): string {
		return `<input type="text" placeholder="Deskripsi..."
			style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px;font-family:inherit;outline:none;box-sizing:border-box"
			value="${esc(current)}"
			oninput="window.__updateSikap('${esc(sid)}', '${field}', this.value)" />`;
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Siswa',
			accessorKey: 'name',
			cell: ({ getValue, row }) => {
				const name = getValue() || row.original.display_name || 'Siswa';
				return `<span style="font-weight:600;font-size:13px">${esc(name)}</span>`;
			}
		},
		{
			header: 'Spiritual Predikat',
			accessorKey: '__sp_pred',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const s = getSikap(sid);
				return predikatSelect(sid, 'spiritual_predikat', s.spiritual_predikat);
			}
		},
		{
			header: 'Spiritual Deskripsi',
			accessorKey: '__sp_desc',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const s = getSikap(sid);
				return descInput(sid, 'spiritual_desc', s.spiritual_desc);
			}
		},
		{
			header: 'Sosial Predikat',
			accessorKey: '__so_pred',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const s = getSikap(sid);
				return predikatSelect(sid, 'sosial_predikat', s.sosial_predikat);
			}
		},
		{
			header: 'Sosial Deskripsi',
			accessorKey: '__so_desc',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const s = getSikap(sid);
				return descInput(sid, 'sosial_desc', s.sosial_desc);
			}
		}
	];
</script>

<svelte:head>
	<title>Sikap — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>{t('nilai.sikap')}</h1>
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
				data={students}
				pageSize={200}
				showSearch={false}
				showPagination={false}
				emptyMessage={t('nilai.belum_ada_siswa_tabel')}
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
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
	.toast { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
	.toast--success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; }
	.toast--error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); color: #ef4444; }
</style>
