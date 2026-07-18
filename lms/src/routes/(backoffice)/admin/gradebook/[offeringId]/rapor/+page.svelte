<script lang="ts">
	import { Button, Badge, Card } from '$lib/components/ui/index.js';
	import type { PageData } from './$types';

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
	<div class="table-wrapper">
		<table class="rapor-table">
			<thead>
				<tr>
					<th class="rank-col">No</th>
					<th class="name-col">Nama Siswa</th>
					<th class="email-col">Email</th>
					{#each data.assessmentItems as item}
						<th class="score-col" title="{item.title} (max: {item.max_score})">
							<span class="item-title">{item.title}</span>
							<span class="item-max">/{item.max_score}</span>
						</th>
					{/each}
					{#each data.assignmentItems as item}
						<th class="score-col" title="{item.title} (max: {item.max_score})">
							<span class="item-title">{item.title}</span>
							<span class="item-max">/{item.max_score}</span>
						</th>
					{/each}
					<th class="final-col">Nilai Akhir</th>
					<th class="rank-col">Peringkat</th>
				</tr>
			</thead>
			<tbody>
				{#each data.students as student}
					<tr>
						<td class="rank-col">{student.rank}</td>
						<td class="name-col">{student.name}</td>
						<td class="email-col">{student.email}</td>
						{#each student.assessment_grades as g}
							<td class="score-col" class:score-null={g.score === null}>
								{g.score != null ? g.score : '-'}
							</td>
						{/each}
						{#each student.assignment_grades as g}
							<td class="score-col" class:score-null={g.score === null}>
								{g.score != null ? g.score : '-'}
							</td>
						{/each}
						<td class="final-col" style="color: {finalGradeColor(student.final_grade)}">
							{#if student.final_grade != null}
								<span class="final-value">{Math.round(student.final_grade)}%</span>
								<span class="letter-grade-badge">{letterGrade(student.final_grade)}</span>
							{:else}
								<span class="final-na">-</span>
							{/if}
						</td>
						<td class="rank-col">{student.rank}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

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

	/* ── Table ── */
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		-webkit-overflow-scrolling: touch;
	}

	.rapor-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		min-width: 600px;
	}

	.rapor-table th {
		text-align: left;
		padding: 10px 8px;
		border-bottom: 2px solid var(--border);
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		background: var(--surface);
	}

	.rapor-table th.score-col {
		min-width: 80px;
		max-width: 120px;
		text-align: center;
	}

	.rapor-table th .item-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
		max-width: 90px;
	}

	.rapor-table th .item-max {
		font-weight: 400;
		font-size: 10px;
		color: var(--text-secondary);
	}

	.rapor-table td {
		padding: 8px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	.rank-col {
		text-align: center;
		min-width: 40px;
		width: 40px;
		font-weight: 600;
		font-size: 12px;
	}

	.name-col {
		min-width: 160px;
		font-weight: 600;
	}

	.email-col {
		min-width: 140px;
		font-size: 12px;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.score-col {
		text-align: center;
		font-weight: 600;
		font-size: 12px;
		min-width: 60px;
	}

	.score-null {
		color: var(--text-secondary) !important;
		opacity: 0.5;
	}

	.final-col {
		text-align: center;
		font-weight: 700;
		font-size: 14px;
		min-width: 80px;
		padding: 8px 12px;
	}

	.final-value {
		display: inline-block;
		margin-right: 4px;
	}

	.letter-grade-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 700;
		background: var(--bg-secondary);
		border: 1px solid currentColor;
	}

	.final-na {
		color: var(--text-secondary);
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

		.table-wrapper {
			border: 1px solid #ccc;
			border-radius: 4px;
			background: white;
			overflow: visible;
		}

		.rapor-table {
			font-size: 10px;
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

		.email-col {
			color: #666 !important;
		}

		.score-null {
			color: #aaa !important;
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

		.final-value {
			font-weight: 700;
		}
	}
</style>
