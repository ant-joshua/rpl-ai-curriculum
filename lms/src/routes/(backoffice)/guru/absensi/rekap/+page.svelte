<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Loading, EmptyState } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type DayRecord = {
		date: string;
		day: number;
		status: string;
		reason?: string;
	};

	type StudentRecap = {
		id: string;
		name: string;
		nis: string;
		days: DayRecord[];
		totalHadir: number;
		totalSakit: number;
		totalIzin: number;
		totalAlpha: number;
		totalDispensasi: number;
		totalTerlambat: number;
	};

	let classes: any[] = $state([]);
	let loadingClasses = $state(true);
	let loading = $state(false);
	let error = $state('');

	let selectedClassId = $state('');
	let selectedMonth = $state(String(new Date().getMonth() + 1).padStart(2, '0'));
	let selectedYear = $state(String(new Date().getFullYear()));

	let students: StudentRecap[] = $state([]);
	let calendarDays: number[] = $state([]);
	let monthName = $derived(
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

	onMount(() => {
		if (!browser) return;
		loadClasses();
	});

	async function loadClasses() {
		loadingClasses = true;
		error = '';
		try {
			const res = await fetch('/api/guru/kelas');
			const json = await res.json();
			if (json.success) classes = json.data || [];
			else error = json.error || 'Gagal memuat kelas';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loadingClasses = false; }
	}

	async function loadRecap() {
		if (!selectedClassId) return;
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/absensi/rekap?class_id=${selectedClassId}&month=${selectedMonth}&year=${selectedYear}`);
			const json = await res.json();
			if (json.success) {
				const data = json.data || [];
				students = data.map((s: any) => ({
					id: s.id,
					name: s.name || s.nama || s.student_name,
					nis: s.nis || s.nisn || '',
					days: s.days || [],
					totalHadir: s.total_hadir ?? s.totalHadir ?? 0,
					totalSakit: s.total_sakit ?? s.totalSakit ?? 0,
					totalIzin: s.total_izin ?? s.totalIzin ?? 0,
					totalAlpha: s.total_alpha ?? s.totalAlpha ?? 0,
					totalDispensasi: s.total_dispensasi ?? s.totalDispensasi ?? 0,
					totalTerlambat: s.total_terlambat ?? s.totalTerlambat ?? 0,
				}));
				generateCalendarDays();
			} else error = json.error || 'Gagal memuat rekap';
		} catch { error = 'Gagal memuat data rekap'; }
		finally { loading = false; }
	}

	function generateCalendarDays() {
		const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
		calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	}

	function getStatusForDay(student: StudentRecap, day: number): string {
		const rec = student.days.find(d => d.day === day);
		return rec?.status || '';
	}

	function getStatusLetter(status: string): string {
		switch (status) {
			case 'hadir': return 'H';
			case 'sakit': return 'S';
			case 'izin': return 'I';
			case 'alpha': return 'A';
			case 'dispensasi': return 'D';
			case 'terlambat': return 'T';
			default: return '';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'hadir': return 'var(--success)';
			case 'sakit': return 'var(--warning)';
			case 'izin': return 'var(--info)';
			case 'alpha': return 'var(--danger)';
			case 'dispensasi': return '#8b5cf6';
			case 'terlambat': return '#f97316';
			default: return 'transparent';
		}
	}

	function getStatusBg(status: string): string {
		switch (status) {
			case 'hadir': return 'rgba(16,185,129,0.06)';
			case 'sakit': return 'rgba(245,158,11,0.06)';
			case 'izin': return 'rgba(94,106,210,0.06)';
			case 'alpha': return 'rgba(239,68,68,0.06)';
			case 'dispensasi': return 'rgba(139,92,246,0.06)';
			case 'terlambat': return 'rgba(249,115,22,0.06)';
			default: return '';
		}
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	// Build columns dynamically based on calendarDays
	let columns = $derived<ColumnDef<any, any>[]>([
		{
			header: 'Nama Siswa',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:600;font-size:13px">${esc(getValue() as string)}</span>`
		},
		...calendarDays.map((day): ColumnDef<any, any> => ({
			header: String(day),
			accessorKey: `__day_${day}`,
			cell: ({ row }) => {
				const student = row.original as StudentRecap;
				const status = getStatusForDay(student, day);
				const letter = getStatusLetter(status);
				const color = getStatusColor(status);
				const bg = getStatusBg(status);
				if (!status) return '<span style="color:transparent">·</span>';
				return `<span style="color:${color};font-weight:700;font-size:11px;display:block;text-align:center;background:${bg};border-radius:4px;padding:2px 0">${letter}</span>`;
			}
		})),
		{
			header: 'H',
			accessorKey: 'totalHadir',
			cell: ({ getValue }) => `<span style="color:var(--success);font-weight:700;font-size:12px;display:block;text-align:center;border-left:1px solid var(--border);padding-left:8px">${getValue()}</span>`
		},
		{
			header: 'S',
			accessorKey: 'totalSakit',
			cell: ({ getValue }) => `<span style="color:var(--warning);font-weight:700;font-size:12px;display:block;text-align:center">${getValue()}</span>`
		},
		{
			header: 'I',
			accessorKey: 'totalIzin',
			cell: ({ getValue }) => `<span style="color:var(--info);font-weight:700;font-size:12px;display:block;text-align:center">${getValue()}</span>`
		},
		{
			header: 'A',
			accessorKey: 'totalAlpha',
			cell: ({ getValue }) => `<span style="color:var(--danger);font-weight:700;font-size:12px;display:block;text-align:center">${getValue()}</span>`
		}
	]);
</script>

<svelte:head>
	<title>Rekap Absensi — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/guru/absensi">← Input Absensi</a></div>
			<h1>📊 Rekap Absensi Bulanan</h1>
			<p class="subtitle">Rekapitulasi kehadiran siswa per bulan</p>
		</div>
	</div>

	<div class="filters">
		<div class="filter-group">
			<label for="class-select">Kelas</label>
			<select id="class-select" bind:value={selectedClassId} disabled={loadingClasses}>
				<option value="">— Pilih Kelas —</option>
				{#each classes as c}
					<option value={c.id}>{c.class_name || c.name}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="month-select">Bulan</label>
			<select id="month-select" bind:value={selectedMonth}>
				{#each months as m}
					<option value={m.value}>{m.label}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="year-select">Tahun</label>
			<select id="year-select" bind:value={selectedYear}>
				{#each years as y}
					<option value={y}>{y}</option>
				{/each}
			</select>
		</div>
		<div class="filter-action">
			<button class="btn-secondary" onclick={loadRecap}>🔍 Tampilkan</button>
		</div>
	</div>

	{#if loadingClasses}
		<Loading message="Memuat kelas..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if !selectedClassId}
		<EmptyState icon="📊" title="Pilih Kelas" description="Pilih kelas dan bulan untuk melihat rekap absensi." />
	{:else if loading}
		<Loading message="Memuat rekap absensi..." />
	{:else if students.length === 0}
		<EmptyState icon="📋" title="Belum Ada Data" description="Belum ada data absensi untuk kelas dan bulan ini." />
	{:else}
		<div class="month-label">{monthName}</div>

		<div class="legend">
			<span class="legend-item"><span class="legend-dot" style="background:var(--success)"></span> Hadir (H)</span>
			<span class="legend-item"><span class="legend-dot" style="background:var(--warning)"></span> Sakit (S)</span>
			<span class="legend-item"><span class="legend-dot" style="background:var(--info)"></span> Izin (I)</span>
			<span class="legend-item"><span class="legend-dot" style="background:var(--danger)"></span> Alpha (A)</span>
			<span class="legend-item"><span class="legend-dot" style="background:#8b5cf6"></span> Dispensasi (D)</span>
			<span class="legend-item"><span class="legend-dot" style="background:#f97316"></span> Terlambat (T)</span>
		</div>

		<DataTable
			{columns}
			data={students}
			pageSize={200}
			showSearch={false}
			showPagination={false}
			emptyMessage="Belum ada data absensi"
		/>
	{/if}
</div>

<style>
	.page { max-width: 1200px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
	.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-group select {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-group select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.filter-action { padding-top: 18px; }

	.month-label { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: var(--text); }

	.legend { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
	.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); }
	.legend-dot { width: 10px; height: 10px; border-radius: 3px; }

	.btn-secondary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary:hover { background: var(--accent-hover); }
</style>
