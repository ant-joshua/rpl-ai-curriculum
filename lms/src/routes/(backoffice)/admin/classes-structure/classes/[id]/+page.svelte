<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let kelas: any = $state(null);
	let siswa: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let kelasId = $derived($page.params.id);

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [kelasRes, siswaRes] = await Promise.all([
				fetch(`/api/admin/classes-structure/classes/${kelasId}`),
				fetch(`/api/admin/classes-structure/classes/${kelasId}/siswa`),
			]);
			const kjson = await kelasRes.json();
			const sjson = await siswaRes.json();
			if (kjson.success) kelas = kjson.data; else error = kjson.error || 'Kelas tidak ditemukan';
			if (sjson.success) siswa = sjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	const columns: ColumnDef<any, any>[] = [
		{ header: 'NIS', accessorKey: 'nis', cell: ({ getValue }) => `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${(getValue() as string) || '—'}</code>` },
		{ header: 'NISN', accessorKey: 'nisn', cell: ({ getValue }) => `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${(getValue() as string) || '—'}</code>` },
		{ header: 'Nama', accessorKey: 'display_name', cell: ({ row }) => `<span style="font-weight:500">${row.original.display_name || row.original.username || row.original.name || row.original.user_name || '—'}</span>` },
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = (getValue() as string) || 'active';
				const styles: Record<string, string> = {
					active: 'background:rgba(16,185,129,0.1);color:#10b981',
					inactive: 'background:rgba(239,68,68,0.1);color:#ef4444',
					alumni: 'background:rgba(79,70,229,0.1);color:#4F46E5',
					mutasi: 'background:rgba(245,158,11,0.1);color:#f59e0b',
				};
				const label = s === 'active' ? 'Aktif' : s;
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;${styles[s] || 'background:var(--bg-secondary);color:var(--text-secondary)'}">${label}</span>`;
			}
		},
		{
			header: 'Bergabung', accessorKey: 'joined_at',
			cell: ({ row }) => `<span style="color:var(--text-secondary);font-size:12px">${row.original.joined_at || row.original.joinedAt ? new Date(row.original.joined_at || row.original.joinedAt).toLocaleDateString() : '—'}</span>`
		},
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<a href="/admin/classes-structure/kelas" class="btn-primary">{t('admin.kembali')}</a>
		</div>
	{:else if kelas}
		<div class="header">
			<div>
				<a href="/admin/classes-structure/kelas" class="back-link">← Kelas</a>
				<h1>{kelas.name}</h1>
				<div class="meta">
					<code>{kelas.code || '—'}</code>
					<span class="meta-item">Tingkat: {kelas.grade_level_name || kelas.gradeLevelName || '—'}</span>
					<span class="meta-item">Jurusan: {kelas.major_name || kelas.majorName || '—'}</span>
					<span class="meta-item">Shift: {kelas.shift || 'pagi'}</span>
					<span class="meta-item">Ruangan: {kelas.room || '—'}</span>
				</div>
			</div>
		</div>

		<div class="info-grid">
			<div class="info-card">
				<span class="info-label">{t('admin.wali_kelas')}</span>
				<span class="info-value">{kelas.homeroom_teacher_name || kelas.homeroomTeacherName || 'Belum ditentukan'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Jumlah Siswa</span>
				<span class="info-value">{kelas.student_count ?? siswa.length ?? '—'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Periode Akademik</span>
				<span class="info-value">{kelas.academic_period_name || kelas.academicPeriodName || '—'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">{t('common.status')}</span>
				<span class="info-value" class:active={kelas.is_active !== false}>{(kelas.is_active !== false) ? 'Aktif' : 'Nonaktif'}</span>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h2>👨‍🎓 Daftar Siswa</h2>
				<span class="badge-count">{siswa.length} siswa</span>
			</div>
			{#if siswa.length === 0}
				<div class="empty-sub">
					<p>Belum ada siswa di kelas ini</p>
				</div>
			{:else}
				<div class="table-container">
					<DataTable {columns} data={siswa} pageSize={20} showSearch={true} searchPlaceholder="Cari siswa..." />
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1000px; }
	.header { margin-bottom: 24px; }
	.back-link { color: var(--text-secondary); text-decoration: none; font-size: 13px; display: inline-block; margin-bottom: 8px; }
	.back-link:hover { color: var(--accent); }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
	.meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 13px; color: var(--text-secondary); }
	.meta-item { display: flex; align-items: center; gap: 4px; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }

	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; }
	.error-msg { color: #ef4444; margin-bottom: 16px; }
	.btn-primary { display: inline-block; padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none; }

	.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: 24px; }
	.info-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
	.info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); font-weight: 600; }
	.info-value { font-size: 16px; font-weight: 600; color: var(--text); }
	.info-value.active { color: #10b981; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.card-header h2 { margin: 0; font-size: 15px; font-weight: 600; }
	.badge-count { font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 3px 10px; border-radius: 20px; }
	.empty-sub { text-align: center; padding: 40px; color: var(--text-secondary); }

	.table-container { padding: 16px 18px; }
</style>
