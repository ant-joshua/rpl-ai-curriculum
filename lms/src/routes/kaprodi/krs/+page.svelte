<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Button } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	let pendingList: any[] = $state([]);
	let riwayatList: any[] = $state([]);
	let semesterList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterSemester = $state('');
	let showRiwayat = $state(false);

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [pendingRes, semRes] = await Promise.all([
				fetch('/api/kaprodi/krs/pending'),
				fetch('/api/admin/academic-semesters'),
			]);
			const pjson = await pendingRes.json();
			const sjson = await semRes.json();
			if (pjson.success) pendingList = pjson.data || [];
			else error = pjson.error || 'Gagal memuat data';
			if (sjson.success) semesterList = sjson.data || [];
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	async function loadRiwayat() {
		showRiwayat = true;
		try {
			const params = new URLSearchParams();
			if (filterSemester) params.set('semester_id', filterSemester);
			const res = await fetch(`/api/kaprodi/krs/riwayat?${params}`);
			const json = await res.json();
			if (json.success) riwayatList = json.data || [];
		} catch { /* ignore */ }
	}

	async function approveKrs(krsId: string) {
		if (!confirm('Setujui KRS ini?')) return;
		try {
			const res = await fetch(`/api/kaprodi/krs/${krsId}/approve`, { method: 'PUT' });
			const json = await res.json();
			if (json.success) {
				pendingList = pendingList.filter(k => k.id !== krsId);
			} else alert(json.error || 'Gagal menyetujui');
		} catch { alert('Terjadi kesalahan'); }
	}

	async function rejectKrs(krsId: string) {
		const alasan = prompt('Alasan penolakan (opsional):');
		try {
			const res = await fetch(`/api/kaprodi/krs/${krsId}/reject`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ alasan: alasan || '' }),
			});
			const json = await res.json();
			if (json.success) {
				pendingList = pendingList.filter(k => k.id !== krsId);
			} else alert(json.error || 'Gagal menolak');
		} catch { alert('Terjadi kesalahan'); }
	}

	function getSemesterName(id: string) {
		return semesterList.find(s => s.id === id)?.name || '—';
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	const riwayatColumns: ColumnDef<any, any>[] = [
		{
			header: t('kaprodi.col_student'),
			accessorKey: 'mahasiswa_name',
			cell: ({ getValue, row }) => {
				const name = getValue() || row.original.student_name || '—';
				return `<span style="font-weight:500">${esc(name)}</span>`;
			}
		},
		{
			header: t('kaprodi.col_nim'),
			accessorKey: 'nim',
			cell: ({ getValue, row }) => {
				const nim = getValue() || row.original.student_nim || '—';
				return `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${esc(nim)}</code>`;
			}
		},
		{
			header: t('kaprodi.col_semester'),
			accessorKey: 'semester_id',
			cell: ({ getValue, row }) => {
				const id = getValue() || row.original.semesterId;
				return esc(getSemesterName(id));
			}
		},
		{
			header: t('kaprodi.col_sks'),
			accessorKey: 'total_sks',
			cell: ({ getValue, row }) => {
				const v = getValue() ?? row.original.totalSks ?? 0;
				return `<span style="text-align:center;display:block">${v}</span>`;
			}
		},
		{
			header: t('kaprodi.col_status'),
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const status = (getValue() as string) || '—';
				const approved = status === 'disetujui' || status === 'approved';
				const rejected = status === 'ditolak' || status === 'rejected';
				let bg = 'rgba(98,102,109,0.1)';
				let color = 'var(--text-quaternary)';
				let label = status;
				if (approved) { bg = 'rgba(16,185,129,0.1)'; color = '#10b981'; label = t('kaprodi.status_approved'); }
				else if (rejected) { bg = 'rgba(239,68,68,0.1)'; color = '#ef4444'; label = t('kaprodi.status_rejected'); }
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color}">${label}</span>`;
			}
		},
		{
			header: t('kaprodi.col_date'),
			accessorKey: 'updated_at',
			cell: ({ getValue }) => {
				const d = getValue() as string;
				if (!d) return '<span style="color:var(--text-tertiary);font-size:12px">—</span>';
				const date = new Date(d).toLocaleDateString('id-ID');
				return `<span style="color:var(--text-tertiary);font-size:12px">${esc(date)}</span>`;
			}
		}
	];
</script>

<svelte:head>
	<title>{t('kaprodi.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>{t('kaprodi.heading')}</h1>
			<p class="subtitle">{t('kaprodi.subtitle')}</p>
		</div>
		<div class="header-actions">
			<Button variant="ghost" size="sm" onclick={loadData}>🔄</Button>
		</div>
	</div>

	{#if loading}
		<div class="loading">{t('common.loading')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if pendingList.length === 0 && !showRiwayat}
		<div class="empty-state">
			<p>{t('kaprodi.no_pending')}</p>
			<Button variant="secondary" onclick={loadRiwayat}>{t('kaprodi.view_history')}</Button>
		</div>
	{:else}
		<section class="section">
			<div class="section-header">
				<h2>{t('kaprodi.pending_approval')} ({pendingList.length})</h2>
			</div>
			{#if pendingList.length === 0}
				<div class="empty-subtle">{t('kaprodi.all_processed')}</div>
			{:else}
				{#each pendingList as krs}
					<div class="krs-card">
						<div class="krs-info">
							<div class="krs-mahasiswa">
								<span class="krs-nama">{krs.mahasiswa_name || krs.student_name || '—'}</span>
								<span class="krs-nim"><code>{krs.nim || krs.student_nim || '—'}</code></span>
							</div>
							<div class="krs-meta">
								<span class="krs-semester">{getSemesterName(krs.semester_id || krs.semesterId)}</span>
								<span class="krs-sks">{krs.total_sks ?? krs.totalSks ?? 0} {t('kaprodi.col_sks')}</span>
								<span class="krs-matkul">{krs.jumlah_matkul ?? krs.course_count ?? 0} mata kuliah</span>
							</div>
							{#if krs.catatan || krs.notes}
								<div class="krs-catatan">{krs.catatan || krs.notes}</div>
							{/if}
						</div>
						<div class="krs-courses">
							{#each (krs.kelas_list || krs.courses || []) as c}
								<span class="course-chip">{c.kode || c.code} — {c.nama || c.name}</span>
							{/each}
						</div>
						<div class="krs-actions">
							<Button variant="primary" size="sm" onclick={() => approveKrs(krs.id)}>{t('kaprodi.approve')}</Button>
							<Button variant="danger" size="sm" onclick={() => rejectKrs(krs.id)}>{t('kaprodi.reject')}</Button>
						</div>
					</div>
				{/each}
			{/if}
		</section>

		<section class="section">
			<div class="section-header">
				<h2>{t('common.history')}</h2>
				<Button variant="secondary" onclick={loadRiwayat}>{t('kaprodi.load_history')}</Button>
			</div>
			{#if showRiwayat}
				{#if riwayatList.length === 0}
					<div class="empty-subtle">{t('kaprodi.no_history')}</div>
				{:else}
					<DataTable
						columns={riwayatColumns}
						data={riwayatList}
						pageSize={50}
						showSearch={false}
						showPagination={false}
						emptyMessage={t('kaprodi.no_history')}
					/>
				{/if}
			{/if}
		</section>
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-secondary:hover { background: var(--surface-hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-approve { padding: 6px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.btn-approve:hover { background: rgba(16,185,129,0.2); }
	.btn-reject { padding: 6px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.btn-reject:hover { background: rgba(239,68,68,0.2); }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
	.empty-subtle { text-align: center; padding: 30px; color: var(--text-tertiary); font-size: 13px; }

	.section { margin-bottom: 32px; }
	.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
	.section-header h2 { margin: 0; font-size: 16px; font-weight: 600; }

	.krs-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
	.krs-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
	.krs-mahasiswa { display: flex; align-items: center; gap: 10px; }
	.krs-nama { font-size: 15px; font-weight: 600; }
	.krs-nim code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.krs-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); }
	.krs-catatan { font-size: 12px; color: var(--text-tertiary); font-style: italic; padding: 6px 8px; background: var(--bg-secondary); border-radius: 6px; }
	.krs-courses { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
	.course-chip { padding: 3px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; font-size: 11px; color: var(--text-secondary); }
	.krs-actions { display: flex; gap: 8px; }

	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
