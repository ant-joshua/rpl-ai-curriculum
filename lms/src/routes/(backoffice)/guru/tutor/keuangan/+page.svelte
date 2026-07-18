<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, DataTable } from '$lib/components/ui/index.js';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type Invoice = {
		id: string;
		studentName: string;
		amount: number;
		status: 'unpaid' | 'paid' | 'overdue';
		dueDate: string;
		invoiceNumber: string;
		paidAt?: string;
	};

	let loading = $state(true);
	let error = $state('');
	let invoices: Invoice[] = $state([]);
	let filterStatus = $state<string>('all');

	onMount(() => {
		if (!browser) return;
		loadInvoices();
	});

	async function loadInvoices() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/tutor/keuangan');
			const json = await res.json();
			if (json.success) invoices = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	const filtered = $derived(
		filterStatus === 'all' ? invoices : invoices.filter(i => i.status === filterStatus)
	);

	const totals = $derived({
		total: invoices.reduce((s, i) => s + i.amount, 0),
		paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
		unpaid: invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0),
		overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
	});

	function formatCurrency(n: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	const filterOptions = [
		{ value: 'all', label: 'Semua' },
		{ value: 'unpaid', label: 'Belum Dibayar' },
		{ value: 'paid', label: 'Lunas' },
		{ value: 'overdue', label: 'Jatuh Tempo' },
	];

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Invoice', accessorKey: 'invoiceNumber', cell: ({ getValue }) => `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${getValue()}</code>` },
		{ header: 'Siswa', accessorKey: 'studentName', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
		{ header: 'Jumlah', accessorKey: 'amount', cell: ({ getValue }) => `<span style="font-weight:600">${formatCurrency(getValue() as number)}</span>` },
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const colors: Record<string, string> = { paid: '#10b981', unpaid: '#f59e0b', overdue: '#ef4444' };
				const labels: Record<string, string> = { paid: 'Lunas', unpaid: 'Belum Dibayar', overdue: 'Jatuh Tempo' };
				const c = colors[s] || '#888';
				return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;background:${c}20;color:${c}">${labels[s] || s}</span>`;
			}
		},
		{ header: 'Jatuh Tempo', accessorKey: 'dueDate', cell: ({ getValue }) => `<span style="color:var(--text-tertiary);font-size:12px">${formatDate(getValue() as string)}</span>` },
		{ header: 'Dibayar', accessorKey: 'paidAt', cell: ({ getValue }) => `<span style="color:var(--text-tertiary);font-size:12px">${getValue() ? formatDate(getValue() as string) : '-'}</span>` },
	];
</script>

<svelte:head>
	<title>Keuangan — Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/tutor">← Tutor Dashboard</a></div>
		<h1>💰 Keuangan Privat</h1>
		<p class="subtitle">Tagihan, pembayaran, dan status invoice</p>
	</div>

	<div class="summary-grid">
		<div class="summary-card">
			<span class="summary-value">{formatCurrency(totals.total)}</span>
			<span class="summary-label">Total Tagihan</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--success)">{formatCurrency(totals.paid)}</span>
			<span class="summary-label">Sudah Dibayar</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--warning)">{formatCurrency(totals.unpaid)}</span>
			<span class="summary-label">Belum Dibayar</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--danger)">{formatCurrency(totals.overdue)}</span>
			<span class="summary-label">Jatuh Tempo</span>
		</div>
	</div>

	<div class="toolbar">
		<div class="filter-group">
			<label for="filter-status">Filter Status</label>
			<select id="filter-status" class="filter-select" bind:value={filterStatus}>
				{#each filterOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
		<button class="btn btn-secondary btn-sm" onclick={loadInvoices}>🔄 Refresh</button>
	</div>

	{#if loading}
		<Loading message="Memuat data keuangan..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if invoices.length === 0}
		<EmptyState icon="💰" title="Belum Ada Tagihan" description="Belum ada invoice yang tercatat." />
	{:else if filtered.length === 0}
		<EmptyState icon="🔍" title="Tidak Ditemukan" description="Tidak ada invoice dengan filter ini." />
	{:else}
		<DataTable {columns} data={filtered} pageSize={15} showSearch={true} searchPlaceholder="Cari invoice..." />
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; margin-bottom: 24px; }
	.summary-card {
		display: flex; flex-direction: column; gap: 4px;
		padding: 18px 16px; border-radius: 12px; border: 1px solid var(--border);
		background: var(--surface);
	}
	.summary-value { font-size: 20px; font-weight: 700; color: var(--text); }
	.summary-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.03em; }

	.toolbar { display: flex; gap: 12px; margin-bottom: 16px; align-items: end; flex-wrap: wrap; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; }
	.filter-group label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-select {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
