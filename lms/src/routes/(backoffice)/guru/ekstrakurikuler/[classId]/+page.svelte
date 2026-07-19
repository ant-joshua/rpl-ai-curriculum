<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable, Skeleton, EmptyState, Button, Select, Input, Textarea } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

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
		(window as any).__ekstraNilai = (sid: string, val: string) => updateNilai(sid, val);
		(window as any).__ekstraField = (sid: string, field: string, val: string) => updateField(sid, field, val);
	});

	async function loadAll() {
		if (!classId) { setTimeout(() => loadAll(), 100); return; }
		loading = true;
		error = '';
		try {
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
			if (json.success) successMsg = t('ekstra.tersimpan');
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan'; }
		finally { saving = false; }
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
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
			header: 'Nilai',
			accessorKey: '__nilai',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const e = getEkstra(sid);
				const filled = e.nilai !== null ? 'border-color:var(--accent)' : '';
				return `<input type="number" min="0" max="100" step="0.5"
					style="width:64px;padding:6px 4px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;font-weight:600;text-align:center;font-family:inherit;outline:none;${filled}"
					value="${e.nilai ?? ''}" placeholder="-"
					oninput="window.__ekstraNilai('${esc(sid)}', this.value)" />`;
			}
		},
		{
			header: 'Predikat',
			accessorKey: '__predikat',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const e = getEkstra(sid);
				const opts = predikatOptions.map(p =>
					`<option value="${p}"${p === e.predikat ? ' selected' : ''}>${p === '-' ? '-' : p}</option>`
				).join('');
				return `<select style="padding:4px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer"
					onchange="window.__ekstraField('${esc(sid)}', 'predikat', this.value)">${opts}</select>`;
			}
		},
		{
			header: 'Deskripsi',
			accessorKey: '__deskripsi',
			cell: ({ row }) => {
				const sid = row.original.id || row.original.user_id;
				const e = getEkstra(sid);
				return `<input type="text" placeholder="Deskripsi..."
					style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px;font-family:inherit;outline:none;box-sizing:border-box"
					value="${esc(e.deskripsi)}"
					oninput="window.__ekstraField('${esc(sid)}', 'deskripsi', this.value)" />`;
			}
		}
	];
</script>

<svelte:head>
	<title>Ekstrakurikuler — {className} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if error && !className && students.length === 0 && loading === false}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb"><a href="/guru/kelas">← {t('ekstra.kelas_saya')}</a></div>
				<h1>{t('ekstra.judul')}</h1>
				<p class="meta">{className}</p>
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
