<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Skeleton, EmptyState, Badge, Select, Button } from '$lib/components/ui/index.js';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	type Invoice = {
		id: string;
		invoiceNumber: string;
		studentName: string;
		amount: number;
		status: 'unpaid' | 'paid' | 'overdue';
		dueDate: string;
		paidAt?: string;
		batchName?: string;
	};

	let loading = $state(true);
	let error = $state('');
	let invoices: Invoice[] = $state([]);
	let filterStatus = $state<string>('all');

	const columns: ColumnDef<any, any>[] = [
		{ header: t('finance.col_invoice'), accessorKey: 'invoiceNumber', cell: ({ getValue }) => `<code>${getValue()}</code>` },
		{ header: t('finance.col_student'), accessorKey: 'studentName' },
		{ header: t('finance.col_batch'), accessorFn: (row) => row.batchName || '-' },
		{ header: t('finance.col_amount'), accessorKey: 'amount', cell: ({ getValue }) => formatCurrency(getValue() as number) },
		{
			header: t('finance.col_status'),
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				return `<span class="badge-inline">${getStatusLabel(s)}</span>`;
			}
		},
		{ header: t('finance.col_due_date'), accessorKey: 'dueDate', cell: ({ getValue }) => formatDate(getValue() as string) },
		{ header: t('finance.col_paid_date'), accessorFn: (row) => row.paidAt ? formatDate(row.paidAt) : '-' }
	];

	onMount(() => {
		if (!browser) return;
		loadInvoices();
	});

	async function loadInvoices() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/bimbel/keuangan');
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

	function getStatusBadge(status: string) {
		switch (status) {
			case 'paid': return 'success';
			case 'unpaid': return 'warning';
			case 'overdue': return 'danger';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'paid': return t('finance.paid');
			case 'unpaid': return t('finance.unpaid');
			case 'overdue': return t('finance.overdue');
			default: return status;
		}
	}

	const filterOptions = [
		{ value: 'all', label: t('finance.filter_all') },
		{ value: 'unpaid', label: t('finance.unpaid') },
		{ value: 'paid', label: t('finance.paid') },
		{ value: 'overdue', label: t('finance.overdue') },
	];
</script>

<svelte:head>
	<title>{t('finance.title')} — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel">← {t('finance.breadcrumb')}</a></div>
		<h1>{t('finance.heading')}</h1>
		<p class="subtitle">{t('finance.subtitle')}</p>
	</div>

	<div class="summary-grid">
		<div class="summary-card">
			<span class="summary-value">{formatCurrency(totals.total)}</span>
			<span class="summary-label">{t('finance.total_invoices')}</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--success)">{formatCurrency(totals.paid)}</span>
			<span class="summary-label">{t('finance.paid')}</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--warning)">{formatCurrency(totals.unpaid)}</span>
			<span class="summary-label">{t('finance.unpaid')}</span>
		</div>
		<div class="summary-card">
			<span class="summary-value" style="color: var(--danger)">{formatCurrency(totals.overdue)}</span>
			<span class="summary-label">{t('finance.overdue')}</span>
		</div>
	</div>

	<div class="toolbar">
		<div class="filter-group">
			<Select
				label={t('common.filter_status')}
				bind:value={filterStatus}
				options={filterOptions}
			/>
		</div>
		<Button variant="primary" size="sm" onclick={loadInvoices}>🔄 {t('common.refresh')}</Button>
	</div>

	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if invoices.length === 0}
		<EmptyState icon="💰" title={t('finance.empty_title')} description={t('finance.empty_desc')} />
	{:else if filtered.length === 0}
		<EmptyState icon="🔍" title={t('common.not_found')} description={t('finance.no_invoices_match')} />
	{:else}
		<div class="table-wrap">
			<DataTable {columns} data={filtered} pageSize={20} showSearch={true} searchPlaceholder={t('finance.search_placeholder')} />
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1000px; }
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

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; background: var(--bg-secondary);
	}
	td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid var(--border-subtle); }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(0,0,0,0.02); }

	.col-invoice { font-family: var(--font-mono); font-size: 12px; min-width: 120px; }
	.col-name { font-weight: 500; }
	.col-batch { color: var(--text-secondary); }
	.col-amount { font-weight: 600; }
	.col-date { color: var(--text-tertiary); font-size: 12px; }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
