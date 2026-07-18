<script lang="ts">
	import { Button, Badge, DataTable } from '$lib/components/ui';
	import type { PageData } from './$types';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: PageData } = $props();

	function formatDate(): string {
		const d = new Date();
		return d.toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function finalGradeColor(pct: number | null): string {
		if (pct === null) return 'var(--text-secondary)';
		if (pct >= 85) return '#22c55e';
		if (pct >= 70) return '#27ae60';
		if (pct >= 55) return '#f1c40f';
		if (pct >= 45) return '#f59e0b';
		return '#ef4444';
	}

	function letterGrade(pct: number | null): string {
		if (pct === null) return '-';
		if (pct >= 85) return 'A';
		if (pct >= 80) return 'AB';
		if (pct >= 70) return 'B';
		if (pct >= 65) return 'BC';
		if (pct >= 55) return 'C';
		if (pct >= 45) return 'D';
		return 'E';
	}

	function handlePrint() {
		window.print();
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	// Build dynamic columns from assessmentItems + assignmentItems
	const columns: ColumnDef<any, any>[] = [
		{
			header: 'No',
			accessorKey: '__no',
			cell: ({ row }) => `<span style="font-weight:600;font-size:12px;text-align:center;display:block">${row.original.rank}</span>`
		},
		{
			header: 'Nama Siswa',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:600">${esc(getValue() as string)}</span>`
		},
		{
			header: 'Email',
			accessorKey: 'email',
			cell: ({ getValue }) => `<span style="font-size:12px;color:var(--text-secondary)">${esc(getValue() as string)}</span>`
		},
		...data.assessmentItems.map((item: any): ColumnDef<any, any> => ({
			header: `${item.title} /${item.max_score}`,
			accessorKey: `__assess_${item.id}`,
			cell: ({ row }) => {
				const g = (row.original.assessment_grades || []).find((x: any) => x.assessment_item_id === item.id);
				const score = g?.score;
				const style = score === null ? 'opacity:0.5;color:var(--text-secondary)' : 'font-weight:600';
				return `<span style="text-align:center;display:block;${style}">${score != null ? score : '-'}</span>`;
			}
		})),
		...data.assignmentItems.map((item: any): ColumnDef<any, any> => ({
			header: `${item.title} /${item.max_score}`,
			accessorKey: `__assign_${item.id}`,
			cell: ({ row }) => {
				const g = (row.original.assignment_grades || []).find((x: any) => x.assignment_item_id === item.id);
				const score = g?.score;
				const style = score === null ? 'opacity:0.5;color:var(--text-secondary)' : 'font-weight:600';
				return `<span style="text-align:center;display:block;${style}">${score != null ? score : '-'}</span>`;
			}
		})),
		{
			header: 'Nilai Akhir',
			accessorKey: 'final_grade',
			cell: ({ getValue, row }) => {
				const pct = getValue() as number | null;
				const color = finalGradeColor(pct);
				const letter = letterGrade(pct);
				if (pct != null) {
					return `<div style="text-align:center">
						<span style="font-weight:700;font-size:14px;color:${color}">${Math.round(pct)}%</span>
						<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:var(--bg-secondary);border:1px solid ${color};color:${color};margin-left:4px">${letter}</span>
					</div>`;
				}
				return `<span style="color:var(--text-secondary);text-align:center;display:block">-</span>`;
			}
		},
		{
			header: 'Peringkat',
			accessorKey: 'rank',
			cell: ({ getValue }) => `<span style="font-weight:600;font-size:12px;text-align:center;display:block">${getValue()}</span>`
		}
	];
</script>

<svelte:head>
	<title>Rapor — {data.offering.name} — RPL AI Curriculum</title>
</svelte:head>

<div class="rapor-page">
	<!-- Header -->
	<div class="page-header">
		<div>
			<div class="breadcrumb">
				<a href="/admin/gradebook/{data.offering.id}">← Gradebook</a>
			</div>
			<h1>📄 Rapor — {data.offering.name}</h1>
			<p class="offering-meta">
				{#if data.offering.code}<span>{data.offering.code}</span>{/if}
				<span>{data.students.length} mahasiswa</span>
				<span>{data.assessmentItems.length} assessment, {data.assignmentItems.length} assignment</span>
				<Badge variant={data.offering.status === 'active' ? 'success' : data.offering.status === 'draft' ? 'warning' : data.offering.status === 'completed' ? 'primary' : 'default'}>{data.offering.status}</Badge>
			</p>
		</div>
		<Button onclick={handlePrint} variant="primary" size="sm">🖨 Cetak Rapor</Button>
	</div>

	<!-- Print Header (visible only in print) -->
	<div class="print-header">
		<div class="print-logo">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"/>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
			</svg>
			<span>RPL AI Curriculum</span>
		</div>
		<div class="print-title">
			<h2>{data.offering.name}</h2>
			{#if data.offering.code}<span class="print-code">{data.offering.code}</span>{/if}
		</div>
		<div class="print-date">Tanggal: {formatDate()}</div>
	</div>

	<!-- Table -->
	<DataTable
		{columns}
		data={data.students}
		pageSize={200}
		showSearch={false}
		showPagination={false}
		emptyMessage="Belum ada data siswa"
	/>

	<!-- Footer -->
	<div class="rapor-footer">
		<div class="footer-legend">
			<span>Total Siswa: {data.students.length}</span>
			<span>Tgl Cetak: {formatDate()}</span>
		</div>
	</div>
</div>

<style>
	.rapor-page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.breadcrumb {
		font-size: 13px;
		margin-bottom: 8px;
	}
	.breadcrumb a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
	.breadcrumb a:hover { text-decoration: underline; }

	.page-header h1 {
		margin: 0 0 4px;
		font-size: 24px;
	}

	.offering-meta {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0;
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
	}

	/* ── Print-only header ── */
	.print-header {
		display: none;
	}

	/* ── Footer ── */
	.rapor-footer {
		margin-top: 24px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		font-size: 12px;
		color: var(--text-secondary);
	}

	.footer-legend {
		display: flex;
		gap: 24px;
	}

	/* ── Print Styles ── */
	@media print {
		@page {
			size: landscape;
			margin: 12mm 8mm;
		}

		body {
			background: white !important;
			color: #111 !important;
		}

		* {
			box-shadow: none !important;
			text-shadow: none !important;
		}

		/* Hide non-print UI */
		.admin-topbar,
		.sidebar,
		.sidebar-toggle,
		.breadcrumb,
		.page-header :global(*),
		.page-header Button,
		.no-print {
			display: none !important;
		}

		.page-header {
			display: none !important;
		}

		.rapor-page {
			max-width: 100%;
			padding: 0;
			margin: 0;
		}

		/* Show print header */
		.print-header {
			display: flex !important;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 16px;
			padding-bottom: 10px;
			border-bottom: 2px solid #333;
		}

		.print-logo {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 14px;
			font-weight: 700;
			color: #333;
		}

		.print-title h2 {
			margin: 0;
			font-size: 16px;
			color: #111;
		}

		.print-code {
			font-size: 12px;
			color: #666;
		}

		.print-date {
			font-size: 11px;
			color: #555;
			text-align: right;
		}

		.rapor-table th {
			background: #f5f5f5 !important;
			color: #333 !important;
			border-bottom-color: #999 !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		.rapor-table td {
			border-bottom: 1px solid #eee;
			padding: 5px 6px;
		}

		.rapor-table tr:last-child td {
			border-bottom: none;
		}

		.letter-grade-badge {
			background: #eee;
			border-color: #999;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		.rapor-footer {
			border-top-color: #ccc;
			color: #666;
		}
	}
</style>
