<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Badge, Button, EmptyState, Loading, Select } from '$lib/components/ui/index.js';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	type StudentRow = {
		id: string;
		name: string;
		nis: string;
		class_name: string;
		sakit: number;
		izin: number;
		alpha: number;
		dispensasi: number;
		terlambat: number;
		hadir: number;
		total: number;
		attendancePercent: number;
	};

	let allClasses: any[] = $state([]);
	let students: StudentRow[] = $state([]);
	let loadingClasses = $state(true);
	let loading = $state(false);
	let error = $state('');

	let selectedClassId = $state('');
	let selectedMonth = $state(String(new Date().getMonth() + 1).padStart(2, '0'));
	let selectedYear = $state(String(new Date().getFullYear()));

	const monthName = $derived(
		new Date(Number(selectedYear), Number(selectedMonth) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
	);

	const months = [
		{ value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
		{ value: '03', label: 'Maret' }, { value: '04', label: 'April' },
		{ value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
		{ value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
		{ value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
		{ value: '11', label: 'November' }, { value: '12', label: 'Desember' },
	];

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

	const filteredStudents = $derived(
		selectedClassId ? students.filter(s => s.class_name === selectedClassId || s.id === selectedClassId) : students
	);

	const totalAll = $derived({
		hadir: students.reduce((sum, s) => sum + s.hadir, 0),
		sakit: students.reduce((sum, s) => sum + s.sakit, 0),
		izin: students.reduce((sum, s) => sum + s.izin, 0),
		alpha: students.reduce((sum, s) => sum + s.alpha, 0),
		dispensasi: students.reduce((sum, s) => sum + s.dispensasi, 0),
		terlambat: students.reduce((sum, s) => sum + s.terlambat, 0),
	});

	onMount(() => {
		if (!browser) return;
		loadClasses();
	});

	async function loadClasses() {
		loadingClasses = true;
		error = '';
		try {
			const res = await fetch('/api/admin/classes-structure/classes');
			const json = await res.json();
			if (json.success) allClasses = json.data || [];
			else error = json.error || 'Gagal memuat kelas';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loadingClasses = false; }
	}

	async function loadRecap() {
		loading = true;
		error = '';
		try {
			let url = `/api/admin/attendance/rekap?month=${selectedMonth}&year=${selectedYear}`;
			if (selectedClassId) url += `&class_id=${selectedClassId}`;
			const res = await fetch(url);
			const json = await res.json();
			if (json.success) {
				const data = json.data || [];
				students = data.map((s: any) => {
					const hadir = s.total_hadir ?? s.hadir ?? 0;
					const sakit = s.total_sakit ?? s.sakit ?? 0;
					const izin = s.total_izin ?? s.izin ?? 0;
					const alpha = s.total_alpha ?? s.alpha ?? 0;
					const dispensasi = s.total_dispensasi ?? s.dispensasi ?? 0;
					const terlambat = s.total_terlambat ?? s.terlambat ?? 0;
					const total = hadir + sakit + izin + alpha + dispensasi + terlambat;
					return {
						id: s.id,
						name: s.name || s.nama || s.student_name,
						nis: s.nis || s.nisn || '',
						class_name: s.class_name || s.kelas || '',
						sakit,
						izin,
						alpha,
						dispensasi,
						terlambat,
						hadir,
						total,
						attendancePercent: total > 0 ? Math.round(((hadir + sakit + izin + dispensasi) / total) * 100) : 0,
					};
				});
			} else error = json.error || 'Gagal memuat rekap';
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	function getPercentColor(pct: number): string {
		if (pct >= 90) return 'var(--success)';
		if (pct >= 75) return 'var(--warning)';
		return 'var(--danger)';
	}

	function getUniqueClasses(): string[] {
		return [...new Set(students.map(s => s.class_name).filter(Boolean))];
	}

	function exportCsv() {
		const rows = [['Nama', 'NIS', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Dispensasi', 'Terlambat', '% Kehadiran'].join(',')];
		for (const s of students) {
			rows.push([s.name, s.nis, s.class_name, s.hadir, s.sakit, s.izin, s.alpha, s.dispensasi, s.terlambat, s.attendancePercent].join(','));
		}
		const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `rekap-absensi-${selectedMonth}-${selectedYear}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

const recapColumns: ColumnDef<any, any>[] = [
	{
		header: 'Nama Siswa',
		accessorKey: 'name',
		cell: ({ getValue }) => `<span style="font-weight:500;min-width:160px;display:inline-block">${getValue()}</span>`
	},
	{
		header: 'NIS',
		accessorKey: 'nis',
		cell: ({ getValue }) => `<code>${(getValue() as string) || '—'}</code>`
	},
	{
		header: 'Kelas',
		accessorKey: 'class_name',
		cell: ({ getValue }) => (getValue() as string) || '—'
	},
	{
		header: 'Sakit',
		accessorKey: 'sakit',
		cell: ({ getValue }) => `<span style="text-align:center;font-weight:600;color:var(--warning);display:block">${getValue()}</span>`
	},
	{
		header: 'Izin',
		accessorKey: 'izin',
		cell: ({ getValue }) => `<span style="text-align:center;font-weight:600;color:var(--info);display:block">${getValue()}</span>`
	},
	{
		header: 'Alpha',
		accessorKey: 'alpha',
		cell: ({ getValue }) => `<span style="text-align:center;font-weight:700;color:var(--danger);display:block">${getValue()}</span>`
	},
	{
		header: 'Dispensasi',
		accessorKey: 'dispensasi',
		cell: ({ getValue }) => `<span style="text-align:center;font-weight:600;color:#8b5cf6;display:block">${getValue()}</span>`
	},
	{
		header: 'Telat',
		accessorKey: 'terlambat',
		cell: ({ getValue }) => `<span style="text-align:center;font-weight:600;color:#f97316;display:block">${getValue()}</span>`
	},
	{
		header: '%',
		accessorKey: 'attendancePercent',
		cell: ({ getValue }) => {
			const pct = getValue() as number;
			const color = getPercentColor(pct);
			return `<span class="pct-badge" style="color: ${color}; border-color: ${color}40; background: ${color}10">${pct}%</span>`;
		}
	},
];

  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>Rekap Absensi — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/admin">← Dashboard Admin</a></div>
			<h1>📊 Rekap Absensi</h1>
			<p class="subtitle">Rekapitulasi absensi semua kelas</p>
		</div>
		<Button class="btn-outline" onclick={exportCsv} disabled={students.length === 0}>📥 Export CSV</Button>
	</div>

	<div class="filters">
		<div class="filter-group">
<Select label="Filter Kelas" bind:value={selectedClassId} options={allClasses.map((c) => ({ value: c.id, label: c.name }))} />
		</div>
		<div class="filter-group">
<Select label="Bulan" bind:value={selectedMonth} options={months.map((m) => ({ value: m.value, label: m.label }))} />
		</div>
		<div class="filter-group">
<Select label="Tahun" bind:value={selectedYear} options={years.map((y) => ({ value: y, label: y }))} />
		</div>
		<div class="filter-action">
			<Button variant="secondary" onclick={loadRecap}>🔍 Tampilkan</Button>
		</div>
	</div>

	{#if loadingClasses}
		<Loading message="Memuat data..." />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button variant="secondary" onclick={loadRecap}>{t('common.retry')}</Button>
		</div>
	{:else}
		<div class="month-label">{monthName}</div>

		{#if loading}
			<Loading message="Memuat rekap absensi..." />
		{:else if students.length === 0}
			<EmptyState icon="📋" title="Belum Ada Data" description="Belum ada data absensi untuk periode ini." />
		{:else}
			<div class="summary-bar">
				<span class="summary-item">👥 {students.length} siswa</span>
				<span class="summary-item">H: <strong style="color:var(--success)">{totalAll.hadir}</strong></span>
				<span class="summary-item">S: <strong style="color:var(--warning)">{totalAll.sakit}</strong></span>
				<span class="summary-item">I: <strong style="color:var(--info)">{totalAll.izin}</strong></span>
				<span class="summary-item">A: <strong style="color:var(--danger)">{totalAll.alpha}</strong></span>
				<span class="summary-item">D: <strong style="color:#8b5cf6">{totalAll.dispensasi}</strong></span>
				<span class="summary-item">T: <strong style="color:#f97316">{totalAll.terlambat}</strong></span>
			</div>

			<DataTable columns={recapColumns} data={filteredStudents} pageSize={20} showSearch={true} searchPlaceholder="Cari nama siswa..." emptyMessage="Belum ada data absensi" emptyIcon="📋" />
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
	.error-state p { margin-bottom: 12px; }

	.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
	.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-group select {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-group select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.filter-action { padding-top: 18px; }

	.month-label { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--text); }

	.summary-bar { display: flex; gap: 16px; padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; }
	.summary-item { font-size: 13px; color: var(--text-secondary); }
	.summary-item strong { font-size: 15px; }

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
	table { width: 100%; border-collapse: collapse; min-width: 700px; }
	th {
		text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; white-space: nowrap; background: var(--bg-secondary);
	}
	td { padding: 10px 12px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-subtle); }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(255,255,255,0.02); }

	.col-num { text-align: center; }
	.cell-name { font-weight: 500; min-width: 160px; }
	.cell-num { text-align: center; font-weight: 600; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }

	.cell-sakit { color: var(--warning); }
	.cell-izin { color: var(--info); }
	.cell-alpha { color: var(--danger); font-weight: 700; }
	.cell-dispensasi { color: #8b5cf6; }
	.cell-terlambat { color: #f97316; }

	.pct-badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 12px; font-weight: 700; border: 1px solid;
	}

	.btn-secondary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-outline { padding: 8px 14px; background: transparent; color: var(--accent); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
	.btn-outline:hover { border-color: var(--accent); background: var(--accent-dim); }
	.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
