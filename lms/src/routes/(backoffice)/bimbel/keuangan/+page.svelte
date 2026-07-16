<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

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
			case 'paid': return 'Lunas';
			case 'unpaid': return 'Belum Dibayar';
			case 'overdue': return 'Jatuh Tempo';
			default: return status;
		}
	}

	const filterOptions = [
		{ value: 'all', label: 'Semua' },
		{ value: 'unpaid', label: 'Belum Dibayar' },
		{ value: 'paid', label: 'Lunas' },
		{ value: 'overdue', label: 'Jatuh Tempo' },
	];
</script>

<svelte:head>
	<title>Keuangan Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel">← Bimbel Dashboard</a></div>
		<h1>💰 Keuangan Bimbel</h1>
		<p class="subtitle">Tagihan dan pembayaran bimbingan belajar</p>
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
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Invoice</th>
						<th>Siswa</th>
						<th>Batch</th>
						<th>Jumlah</th>
						<th>Status</th>
						<th>Jatuh Tempo</th>
						<th>Dibayar</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as inv}
						<tr>
							<td class="col-invoice">{inv.invoiceNumber}</td>
							<td class="col-name">{inv.studentName}</td>
							<td class="col-batch">{inv.batchName || '-'}</td>
							<td class="col-amount">{formatCurrency(inv.amount)}</td>
							<td class="col-status">
								<Badge variant={getStatusBadge(inv.status)}>{getStatusLabel(inv.status)}</Badge>
							</td>
							<td class="col-date">{formatDate(inv.dueDate)}</td>
							<td class="col-date">{inv.paidAt ? formatDate(inv.paidAt) : '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
	tr:hover { background: rgba(255,255,255,0.02); }

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
