<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Loading, EmptyState, StatCard } from '$lib/components/ui';
import { t } from '$lib/stores/i18n.svelte';

	type DayRec = {
		date: string;
		day: number;
		status: string;
		reason?: string;
		subject_name?: string;
	};

	let loading = $state(true);
	let error = $state('');

	let selectedMonth = $state(String(new Date().getMonth() + 1).padStart(2, '0'));
	let selectedYear = $state(String(new Date().getFullYear()));

	let days: DayRec[] = $state([]);
	let stats = $state({ hadir: 0, sakit: 0, izin: 0, alpha: 0, dispensasi: 0, terlambat: 0, total: 0 });

	let loadingData = $state(false);

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

	const totalDays = $derived(stats.hadir + stats.sakit + stats.izin + stats.alpha + stats.dispensasi + stats.terlambat);
	const attendancePercent = $derived(totalDays > 0 ? Math.round((stats.hadir / totalDays) * 100) : 0);
	const overallPercent = $derived(totalDays > 0 ? Math.round(((stats.hadir + stats.sakit + stats.izin + stats.dispensasi) / totalDays) * 100) : 0);

	onMount(() => {
		if (!browser) return;
		loadAttendance();
	});

	async function loadAttendance() {
		loadingData = true;
		error = '';
		try {
			const res = await fetch(`/api/siswa/absensi?month=${selectedMonth}&year=${selectedYear}`);
			const json = await res.json();
			if (json.success) {
				const data = json.data || {};
				days = (data.days || data.entries || []).map((d: any) => ({
					date: d.date || '',
					day: d.day ?? (d.date ? new Date(d.date).getDate() : 0),
					status: d.status || '-',
					reason: d.reason || '',
					subject_name: d.subject_name || '',
				}));
				stats = {
					hadir: data.total_hadir ?? data.hadir ?? 0,
					sakit: data.total_sakit ?? data.sakit ?? 0,
					izin: data.total_izin ?? data.izin ?? 0,
					alpha: data.total_alpha ?? data.alpha ?? 0,
					dispensasi: data.total_dispensasi ?? data.dispensasi ?? 0,
					terlambat: data.total_terlambat ?? data.terlambat ?? 0,
					total: data.total ?? 0,
				};
			} else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loadingData = false; loading = false; }
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'hadir': return 'var(--success)';
			case 'sakit': return 'var(--warning)';
			case 'izin': return 'var(--info)';
			case 'alpha': return 'var(--danger)';
			case 'dispensasi': return '#8b5cf6';
			case 'terlambat': return '#f97316';
			default: return 'var(--text-tertiary)';
		}
	}

	function getStatusLetter(status: string): string {
		switch (status) {
			case 'hadir': return 'H';
			case 'sakit': return 'S';
			case 'izin': return 'I';
			case 'alpha': return 'A';
			case 'dispensasi': return 'D';
			case 'terlambat': return 'T';
			default: return '—';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'hadir': return 'Hadir';
			case 'sakit': return 'Sakit';
			case 'izin': return 'Izin';
			case 'alpha': return 'Alpha';
			case 'dispensasi': return 'Dispensasi';
			case 'terlambat': return 'Terlambat';
			default: return '—';
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
	}
const dayColumns: ColumnDef<any, any>[] = [
	{
		header: 'Tanggal',
		accessorKey: 'date',
		cell: ({ getValue }) => `<span style="font-weight:500">${formatDate(getValue() as string)}</span>`
	},
	{
		header: 'Status',
		accessorKey: 'status',
		cell: ({ getValue }) => {
			const s = getValue() as string;
			const color = getStatusColor(s);
			return `<span class="status-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40;">${getStatusLetter(s)} ${getStatusLabel(s)}</span>`;
		}
	},
	{
		header: 'Keterangan',
		id: 'reason',
		cell: ({ row }) => row.original.reason || row.original.subject_name || '—',
	},
];

</script>

<svelte:head>
	<title>Absensi Saya — Siswa — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>{t('siswa.absensi_saya')}</h1>
			<p class="subtitle">{t('siswa.absensi_subtitle')}</p>
		</div>
	</div>

	<div class="filters">
		<div class="filter-group">
			<label for="month-select">{t('absensi.bulan')}</label>
			<select id="month-select" bind:value={selectedMonth}>
				{#each months as m}
					<option value={m.value}>{m.label}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="year-select">{t('absensi.tahun')}</label>
			<select id="year-select" bind:value={selectedYear}>
				{#each years as y}
					<option value={y}>{y}</option>
				{/each}
			</select>
		</div>
		<div class="filter-action">
			<button class="btn-secondary" onclick={loadAttendance}>{t('absensi.tampilkan')}</button>
		</div>
	</div>

	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else}
		<div class="month-label">{monthName}</div>

		<div class="stats-cards">
			<StatCard value={stats.hadir} label="Hadir" color="#22c55e" />
			<StatCard value={stats.sakit} label="Sakit" color="#f59e0b" />
			<StatCard value={stats.izin} label="Izin" color="#3b82f6" />
			<StatCard value={stats.alpha} label="Alpha" color="#ef4444" />
			<StatCard value={stats.dispensasi} label="Dispensasi" color="#8b5cf6" />
			<StatCard value={stats.terlambat} label="Terlambat" color="#f97316" />
		</div>

		<div class="percent-cards">
			<div class="percent-card">
				<div class="percent-value" style="color: var(--success)">{attendancePercent}%</div>
				<div class="percent-label">{t('siswa.kehadiran_hadir')}</div>
			</div>
			<div class="percent-card">
				<div class="percent-value" style="color: var(--info)">{overallPercent}%</div>
				<div class="percent-label">{t('siswa.kehadiran_hsipd')}</div>
			</div>
		</div>

		{#if days.length === 0}
			<EmptyState icon="📋" title={t('absensi.belum_ada_data')} description={t('siswa.belum_ada_absensi_desc')} />
		{:else}
			<DataTable columns={dayColumns} data={days} pageSize={20} showSearch={false} showPagination={false} emptyMessage={t('siswa.belum_ada_absensi_tabel')} emptyIcon="📋" />
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 20px; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 150px; }
	.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-group select {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-group select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.filter-action { padding-top: 18px; }

	.month-label { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--text); }

	.stats-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-bottom: 16px; }

	.percent-cards { display: flex; gap: 12px; margin-bottom: 20px; }
	.percent-card {
		flex: 1; padding: 16px 20px; border-radius: 10px;
		border: 1px solid var(--border); background: var(--surface); text-align: center;
	}
	.percent-value { font-size: 32px; font-weight: 700; }
	.percent-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }

	.btn-secondary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary:hover { background: var(--accent-hover); }
</style>
