<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	type SemesterTranskrip = {
		semester: string;
		tahun_ajaran: string;
		courses: {
			kode: string;
			nama: string;
			sks: number;
			nilai_angka: number | null;
			nilai_huruf: string | null;
			mutu: number | null;
		}[];
		ip: number;
		total_sks: number;
	};

	let transkrip: SemesterTranskrip[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let ipk = $state(0);
	let totalSksKumulatif = $state(0);

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/mahasiswa/transkrip');
			const json = await res.json();
			if (json.success) {
				transkrip = json.data.semesters || json.data || [];
				ipk = json.data.ipk ?? 0;
				totalSksKumulatif = json.data.total_sks ?? 0;
			} else error = json.error || 'Gagal memuat transkrip';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function nilaiHuruf(nilai: number | null): string {
		if (nilai === null || nilai === undefined) return '—';
		if (nilai >= 85) return 'A';
		if (nilai >= 80) return 'A-';
		if (nilai >= 75) return 'B+';
		if (nilai >= 70) return 'B';
		if (nilai >= 65) return 'B-';
		if (nilai >= 60) return 'C+';
		if (nilai >= 55) return 'C';
		if (nilai >= 45) return 'D';
		return 'E';
	}

	function nilaiWarna(nilaiHuruf: string | null): string {
		switch (nilaiHuruf) {
			case 'A': case 'A-': return 'rgba(16,185,129,0.1); color: #10b981';
			case 'B+': case 'B': case 'B-': return 'rgba(94,106,210,0.1); color: #5e6ad2';
			case 'C+': case 'C': return 'rgba(245,158,11,0.1); color: #f59e0b';
			case 'D': return 'rgba(239,68,68,0.1); color: #ef4444';
			case 'E': return 'rgba(239,68,68,0.2); color: #dc2626';
			default: return 'transparent; color: var(--text-quaternary)';
		}
	}

	const courseColumns: ColumnDef<any, any>[] = [
		{
			header: t('transkrip.col_code'),
			accessorKey: 'kode',
			cell: ({ getValue }) => {
				const v = getValue();
				return v ? `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${v}</code>` : '<span>—</span>';
			}
		},
		{
			header: t('transkrip.col_course'),
			accessorKey: 'nama',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue() || '—'}</span>`
		},
		{
			header: t('transkrip.col_sks'),
			accessorKey: 'sks',
			cell: ({ getValue }) => `<span style="text-align:center">${getValue() ?? '—'}</span>`
		},
		{
			header: t('transkrip.col_grade'),
			accessorKey: 'nilai_huruf',
			cell: ({ getValue, row }) => {
				const nh = getValue() as string || nilaiHuruf(row.original.nilai_angka);
				const style = nilaiWarna(nh);
				return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:700;min-width:32px;text-align:center;background:${style}">${nh}</span>`;
			}
		},
		{
			header: t('transkrip.col_quality'),
			accessorKey: 'mutu',
			cell: ({ getValue }) => `<span style="text-align:center">${getValue() ?? '—'}</span>`
		},
	];
</script>

<svelte:head>
	<title>{t('transkrip.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>{t('transkrip.heading')}</h1>
			<p class="subtitle">{t('transkrip.subtitle')}</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
		</div>
	</div>

	<div class="ipk-card">
		<div class="ipk-row">
			<div class="ipk-item">
				<span class="ipk-label">{t('transkrip.gpa')}</span>
				<span class="ipk-value">{ipk.toFixed(2)}</span>
			</div>
			<div class="ipk-item">
				<span class="ipk-label">{t('transkrip.total_credits')}</span>
				<span class="ipk-value sks-value">{totalSksKumulatif}</span>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading">{t('common.loading')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>{t('common.retry')}</button>
		</div>
	{:else if transkrip.length === 0}
		<div class="empty-state">
			<p>{t('transkrip.no_data')}</p>
		</div>
	{:else}
		{#each transkrip as sem}
			<div class="semester-section">
				<div class="semester-header">
					<div>
						<h2>{sem.semester}</h2>
						<span class="semester-tahun">{sem.tahun_ajaran || ''}</span>
					</div>
					<div class="semester-ip">
						<span class="ip-label">{t('transkrip.gpa_semester')}</span>
						<span class="ip-value">{(sem.ip ?? 0).toFixed(2)}</span>
					</div>
				</div>
				<DataTable
					columns={courseColumns}
					data={sem.courses}
					showSearch={false}
					showPagination={false}
					emptyMessage={t('transkrip.empty_courses')}
				/>
			</div>
		{/each}
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.ipk-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
	.ipk-row { display: flex; gap: 32px; }
	.ipk-item { display: flex; flex-direction: column; gap: 4px; }
	.ipk-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
	.ipk-value { font-size: 32px; font-weight: 700; color: var(--accent); }
	.sks-value { color: var(--text); }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }

	.semester-section { margin-bottom: 24px; }
	.semester-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.semester-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.semester-tahun { font-size: 13px; color: var(--text-tertiary); margin-left: 8px; }
	.semester-ip { display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); }
	.ip-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
	.ip-value { font-size: 16px; font-weight: 700; color: var(--accent); }
</style>
