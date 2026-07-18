<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Loading, Badge, Button, DataTable } from '$lib/components/ui/index.js';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	let semester = $state('');
	let rapor: any = $state(null);
	let studentInfo: any = $state(null);
	let classInfo: any = $state(null);
	let loading = $state(true);
	let error = $state('');

	const predikatColors: Record<string, string> = {
		A: '#22c55e', 'A-': '#27ae60', 'B+': '#5dade2',
		B: '#3b82f6', 'B-': '#85c1e9', 'C+': '#f59e0b',
		C: '#f59e0b', 'C-': '#d35400', 'D+': '#ef4444',
		D: '#c0392b', E: '#922b21',
	};

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('rapor');
			if (idx !== -1 && parts[idx + 1]) semester = parts[idx + 1];
		}
	});

	onMount(() => {
		if (!browser) return;
		loadRapor();
	});

	async function loadRapor() {
		if (!semester) { setTimeout(() => loadRapor(), 100); return; }
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/siswa/rapor/${semester}`);
			const json = await res.json();
			if (json.success) {
				rapor = json.data;
				studentInfo = json.data?.student || {};
				classInfo = json.data?.class || {};
			} else error = json.error || 'Gagal memuat rapor';
		} catch { error = 'Gagal memuat data rapor'; }
		finally { loading = false; }
	}

	function handlePrint() {
		window.print();
	}

	function predikatColor(pred: string | null): string {
		if (!pred) return 'var(--text-secondary)';
		return predikatColors[pred] || 'var(--text)';
	}

	function formatNa(val: number | null | undefined): string {
		if (val === null || val === undefined) return '-';
		return Number(val).toString();
	}

	function getStatusBadgeVariant(status: string): 'success' | 'primary' | 'outline' {
		if (status === 'finalized') return 'success';
		if (status === 'printed') return 'primary';
		return 'outline';
	}

	function getStatusLabel(status: string): string {
		if (status === 'finalized') return 'Finalized';
		if (status === 'printed') return 'Printed';
		return 'Draft';
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	const pengetahuanColumns: ColumnDef<any, any>[] = [
		{ header: 'No', id: 'no', cell: ({ row }) => String(row.index + 1) },
		{ header: 'Mata Pelajaran', id: 'mapel', cell: ({ row }) => row.original.subject_name || row.original.mapel || '-' },
		{ header: 'NA', id: 'na', cell: ({ row }) => `<span style="text-align:center;font-weight:600">${formatNa(row.original.na_pengetahuan)}</span>` },
		{ header: 'Predikat', id: 'predikat', cell: ({ row }) => {
			const v = row.original.predikat_pengetahuan || '-';
			return `<span class="predikat" style="color:${predikatColor(row.original.predikat_pengetahuan)};font-weight:700;font-size:14px">${v}</span>`;
		}},
		{ header: 'KKM', id: 'kkm', cell: ({ row }) => `<span style="text-align:center;font-weight:600">${row.original.kkm || row.original.kkm_pengetahuan || '-'}</span>` },
		{ header: 'Keterangan', id: 'desc', cell: ({ row }) => `<span style="color:var(--text-secondary);font-size:12px">${row.original.deskripsi_pengetahuan || '-'}</span>` },
	];

	const keterampilanColumns: ColumnDef<any, any>[] = [
		{ header: 'No', id: 'no', cell: ({ row }) => String(row.index + 1) },
		{ header: 'Mata Pelajaran', id: 'mapel', cell: ({ row }) => row.original.subject_name || row.original.mapel || '-' },
		{ header: 'NA', id: 'na', cell: ({ row }) => `<span style="text-align:center;font-weight:600">${formatNa(row.original.na_keterampilan)}</span>` },
		{ header: 'Predikat', id: 'predikat', cell: ({ row }) => {
			const v = row.original.predikat_keterampilan || '-';
			return `<span class="predikat" style="color:${predikatColor(row.original.predikat_keterampilan)};font-weight:700;font-size:14px">${v}</span>`;
		}},
		{ header: 'KKM', id: 'kkm', cell: ({ row }) => `<span style="text-align:center;font-weight:600">${row.original.kkm || row.original.kkm_keterampilan || '-'}</span>` },
		{ header: 'Keterangan', id: 'desc', cell: ({ row }) => `<span style="color:var(--text-secondary);font-size:12px">${row.original.deskripsi_keterampilan || '-'}</span>` },
	];

	const sikapColumns: ColumnDef<any, any>[] = [
		{ header: 'Aspek', accessorKey: 'aspek' },
		{ header: 'Predikat', id: 'predikat', cell: ({ row }) => {
			const v = row.original.predikat || '-';
			return `<span class="predikat" style="color:${predikatColor(row.original.pred)};font-weight:700;font-size:14px">${v}</span>`;
		}},
		{ header: 'Deskripsi', id: 'desc', cell: ({ row }) => `<span style="color:var(--text-secondary);font-size:12px">${row.original.desc || '-'}</span>` },
	];

	const ekstraColumns: ColumnDef<any, any>[] = [
		{ header: 'No', id: 'no', cell: ({ row }) => String(row.index + 1) },
		{ header: 'Kegiatan', id: 'kegiatan', cell: ({ row }) => row.original.name || row.original.kegiatan || '-' },
		{ header: 'Predikat', id: 'predikat', cell: ({ row }) => {
			const v = row.original.predikat || '-';
			return `<span class="predikat" style="color:${predikatColor(row.original.predikat)};font-weight:700;font-size:14px">${v}</span>`;
		}},
		{ header: 'Keterangan', id: 'desc', cell: ({ row }) => `<span style="color:var(--text-secondary);font-size:12px">${row.original.keterangan || row.original.deskripsi || '-'}</span>` },
	];

	// Pre-filter data
	let pengetahuanData = $derived((rapor?.subject_grades || []).filter((sg: any) => sg.na_pengetahuan != null));
	let keterampilanData = $derived((rapor?.subject_grades || []).filter((sg: any) => sg.na_keterampilan != null));
	let sikapData = $derived([
		{ aspek: 'Spiritual', predikat: rapor?.attitude_spiritual || '-', pred: rapor?.attitude_spiritual, desc: rapor?.attitude_spiritual_desc || '-' },
		{ aspek: 'Sosial', predikat: rapor?.attitude_social || '-', pred: rapor?.attitude_social, desc: rapor?.attitude_social_desc || '-' },
	]);
</script>

<svelte:head>
	<title>Rapor Semester {getSemesterLabel(semester)} — Siswa — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat rapor..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if rapor}
		<!-- Action Bar (no-print) -->
		<div class="action-bar no-print">
			<div class="breadcrumb">
				<a href="/siswa/rapor">← Daftar Rapor</a>
			</div>
			<div class="action-bar-right">
				<span class="status-label">
					Status: <Badge variant={getStatusBadgeVariant(rapor.status)}>{getStatusLabel(rapor.status)}</Badge>
				</span>
				<Button onclick={handlePrint} variant="secondary" size="sm">🖨 Print</Button>
			</div>
		</div>

		<!-- Print Header -->
		<div class="print-header">
			<div class="print-logo">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
				</svg>
				<span>RPL AI Curriculum</span>
			</div>
			<div class="print-title">
				<h2>LAPORAN HASIL BELAJAR</h2>
				<p>Tahun Pelajaran {rapor.academic_year || rapor.tahun_ajaran || '-'}</p>
			</div>
		</div>

		<!-- Student Identity -->
		<div class="identity-section">
			<div class="identity-row">
				<span class="identity-label">Nama Siswa</span>
				<span class="identity-value">: {studentInfo?.name || studentInfo?.display_name || '-'}</span>
			</div>
			<div class="identity-row">
				<span class="identity-label">Kelas</span>
				<span class="identity-value">: {classInfo?.name || classInfo?.class_name || '-'}</span>
			</div>
			<div class="identity-row">
				<span class="identity-label">Semester</span>
				<span class="identity-value">: {getSemesterLabel(semester)}</span>
			</div>
		</div>

		<!-- A. PENGETAHUAN -->
		<div class="section">
			<h3 class="section-title">A. PENGETAHUAN</h3>
			{#if pengetahuanData.length > 0}
				<DataTable columns={pengetahuanColumns} data={pengetahuanData} pageSize={20} showSearch={false} showPagination={false} />
			{:else}
				<div class="empty-table">Belum ada data pengetahuan</div>
			{/if}
		</div>

		<!-- B. KETERAMPILAN -->
		<div class="section">
			<h3 class="section-title">B. KETERAMPILAN</h3>
			{#if keterampilanData.length > 0}
				<DataTable columns={keterampilanColumns} data={keterampilanData} pageSize={20} showSearch={false} showPagination={false} />
			{:else}
				<div class="empty-table">Belum ada data keterampilan</div>
			{/if}
		</div>

		<!-- C. SIKAP -->
		<div class="section">
			<h3 class="section-title">C. SIKAP</h3>
			<DataTable columns={sikapColumns} data={sikapData} pageSize={20} showSearch={false} showPagination={false} />
		</div>

		<!-- D. EKSTRAKURIKULER -->
		<div class="section">
			<h3 class="section-title">D. EKSTRAKURIKULER</h3>
			{#if (rapor.extracurriculars || []).length > 0}
				<DataTable columns={ekstraColumns} data={rapor.extracurriculars || []} pageSize={20} showSearch={false} showPagination={false} />
			{:else}
				<div class="empty-table">Tidak ada data ekstrakurikuler</div>
			{/if}
		</div>

		<!-- E. ABSENSI -->
		<div class="section">
			<h3 class="section-title">E. ABSENSI</h3>
			<div class="absensi-grid">
				<div class="absensi-item">
					<span class="absensi-label">Sakit</span>
					<span class="absensi-value">{rapor.attendance_sick ?? 0}</span>
				</div>
				<div class="absensi-item">
					<span class="absensi-label">Izin</span>
					<span class="absensi-value">{rapor.attendance_permit ?? 0}</span>
				</div>
				<div class="absensi-item">
					<span class="absensi-label">Alpha</span>
					<span class="absensi-value">{rapor.attendance_absent ?? 0}</span>
				</div>
			</div>
		</div>

		<!-- F. CATATAN WALI KELAS -->
		<div class="section">
			<h3 class="section-title">F. CATATAN WALI KELAS</h3>
			<p class="notes-display">{rapor.homeroom_notes || '—'}</p>
		</div>

		<!-- Signature Area (print only) -->
		<div class="signature-area">
			<div class="signature-box">
				<p>Mengetahui,</p>
				<p class="signature-title">Kepala Sekolah</p>
				<div class="signature-space"></div>
				<p class="signature-name">_________________________</p>
				<p class="signature-nip">NIP. ____________________</p>
			</div>
			<div class="signature-box">
				<p>{classInfo?.city || ''}, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
				<p class="signature-title">Wali Kelas</p>
				<div class="signature-space"></div>
				<p class="signature-name">{classInfo?.homeroom_teacher_name || '_________________________'}</p>
				<p class="signature-nip">NIP. ____________________</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1000px; }

	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 8px;
	}
	.breadcrumb { font-size: 13px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.action-bar-right { display: flex; align-items: center; gap: 8px; }
	.status-label { font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

	.print-header { display: none; }

	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.identity-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px 20px;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.identity-row {
		font-size: 14px;
		display: flex;
		gap: 8px;
	}
	.identity-label {
		font-weight: 600;
		min-width: 120px;
		color: var(--text-secondary);
	}
	.identity-value { color: var(--text); font-weight: 500; }

	.section { margin-bottom: 24px; }
	.section-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0 0 8px;
		padding-bottom: 4px;
		border-bottom: 2px solid var(--accent);
		display: inline-block;
	}

	.empty-table {
		text-align: center;
		color: var(--text-quaternary);
		padding: 24px;
		font-style: italic;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
	}

	.absensi-grid {
		display: flex;
		gap: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px 20px;
	}
	.absensi-item {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.absensi-label {
		font-size: 13px;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.absensi-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text);
		min-width: 24px;
		text-align: center;
	}

	.notes-display {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		font-size: 13px;
		color: var(--text);
		line-height: 1.6;
		margin: 0;
	}

	.signature-area { display: none; }

	@media print {
		@page { size: A4 portrait; margin: 15mm 12mm; }
		:global(body) { background: white !important; color: #111 !important; }
		* { box-shadow: none !important; text-shadow: none !important; }
		.no-print { display: none !important; }
		.page { max-width: 100%; padding: 0; margin: 0; }

		.print-header {
			display: flex !important;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 2px solid #222;
		}
		.print-logo { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #333; }
		.print-title h2 { margin: 0; font-size: 16px; color: #111; }
		.print-title p { margin: 4px 0 0; font-size: 12px; color: #555; }

		.identity-section { background: #fafafa; border-color: #ccc; border-radius: 4px; }
		.identity-label { color: #555; }
		.identity-value { color: #111; }
		.section-title { border-bottom-color: #555; }
		.absensi-grid { background: #fafafa; border-color: #ccc; border-radius: 4px; }
		.notes-display { background: #fafafa; border-color: #ccc; border-radius: 4px; }

		.signature-area {
			display: flex !important;
			justify-content: space-between;
			margin-top: 40px;
			padding-top: 10px;
		}
	}
</style>
