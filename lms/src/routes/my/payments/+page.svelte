<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Card, Alert, Badge } from '$lib/components/ui';

	let invoices: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let processingId = $state<string | null>(null);

	let clientKey = $state('');

	interface SnapWindow {
		snap?: {
			pay: (token: string, options?: any) => void;
		};
	}

	onMount(() => {
		loadInvoices();
	});

	function loadSnapScript(clientKeyVal: string) {
		if (typeof window === 'undefined') return;
		if ((window as any).snap) return;

		clientKey = clientKeyVal;
		const script = document.createElement('script');
		script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
		script.setAttribute('data-client-key', clientKeyVal);
		document.head.appendChild(script);
	}

	async function loadInvoices() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/payment/student/invoices');
			const json = await res.json();
			if (json.success) {
				invoices = json.data || [];
			} else {
				error = json.error || 'Gagal memuat data tagihan';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function loadSnap(clientKeyVal: string): Promise<void> {
		return new Promise((resolve) => {
			if ((window as any).snap) {
				resolve();
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
			script.setAttribute('data-client-key', clientKeyVal);
			script.onload = () => resolve();
			document.head.appendChild(script);
		});
	}

	async function bayar(invoice: any) {
		processingId = invoice.id;
		error = '';

		try {
			const res = await fetch('/api/payment/midtrans/snap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ invoice_id: invoice.id }),
			});

			const json = await res.json();
			if (!json.success) {
				error = json.error || 'Gagal membuat transaksi';
				return;
			}

			const { snap_token, client_key } = json.data;

			// Ensure snap.js is loaded before calling snap.pay
			await loadSnap(client_key);

			// Open Midtrans Snap popup
			(window as any).snap.pay(snap_token, {
				onSuccess: (result: any) => {
					loadInvoices();
				},
				onPending: (result: any) => {
					loadInvoices();
				},
				onError: (result: any) => {
					error = 'Pembayaran gagal: ' + (result.status_message || 'Unknown error');
					loadInvoices();
				},
				onClose: () => {
					loadInvoices();
				},
			});
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			processingId = null;
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(amount);
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
	}

	function statusLabel(status: string): string {
		const map: Record<string, string> = {
			unpaid: 'Belum Dibayar',
			partial: 'Sebagian',
			paid: 'Lunas',
			overdue: 'Jatuh Tempo',
			cancelled: 'Dibatalkan',
		};
		return map[status] || status;
	}

	function statusBadge(status: string): string {
		const map: Record<string, string> = {
			unpaid: 'badge-warning',
			partial: 'badge-info',
			paid: 'badge-success',
			overdue: 'badge-danger',
			cancelled: 'badge-secondary',
		};
		return map[status] || 'badge-default';
	}

	function canPay(status: string): boolean {
		return status === 'unpaid' || status === 'partial' || status === 'overdue';
	}
</script>

<svelte:head>
	<title>Pembayaran — LMS RPL</title>
</svelte:head>

<div class="payment-page">
	<div class="page-header">
		<h1>Pembayaran</h1>
		<p class="subtitle">Kelola tagihan dan lakukan pembayaran SPP</p>
	</div>

	{#if error}
		<Alert variant="danger">
			<p>{error}</p>
		</Alert>
	{/if}

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Memuat data tagihan...</p>
		</div>
	{:else if invoices.length === 0}
		<Card>
			<div class="empty-state">
				<span class="empty-icon">💰</span>
				<h3>Tidak Ada Tagihan</h3>
				<p>Saat ini tidak ada tagihan yang perlu dibayarkan.</p>
			</div>
		</Card>
	{:else}
		<div class="invoice-list">
			{#each invoices as inv}
				<Card>
					<div class="invoice-card">
						<div class="invoice-header">
							<div class="invoice-number">
								<strong>{inv.invoice_number}</strong>
								<span class="invoice-status" class:badge-success={inv.status === 'paid'} class:badge-warning={inv.status === 'unpaid'}>
									{statusLabel(inv.status)}
								</span>
							</div>
							<div class="invoice-amount">{formatCurrency(inv.total_amount)}</div>
						</div>

						<div class="invoice-meta">
							{#if inv.due_date}
								<div class="meta-item">
									<span class="meta-label">Jatuh Tempo</span>
									<span class="meta-value">{formatDate(inv.due_date)}</span>
								</div>
							{/if}
							<div class="meta-item">
								<span class="meta-label">Dibuat</span>
								<span class="meta-value">{formatDate(inv.created_at)}</span>
							</div>
							{#if inv.paid_at}
								<div class="meta-item">
									<span class="meta-label">Dibayar</span>
									<span class="meta-value">{formatDate(inv.paid_at)}</span>
								</div>
							{/if}
						</div>

						{#if inv.items && inv.items.length > 0}
							<div class="invoice-items">
								<h4>Rincian</h4>
								{#each inv.items as item}
									<div class="item-row">
										<span class="item-desc">{item.description}</span>
										<span class="item-qty">x{item.quantity || 1}</span>
										<span class="item-amount">{formatCurrency(item.amount)}</span>
									</div>
								{/each}
							</div>
						{/if}

						{#if canPay(inv.status)}
							<div class="invoice-actions">
								<button
									class="btn btn-primary"
									onclick={() => bayar(inv)}
									disabled={processingId === inv.id}
								>
									{processingId === inv.id ? 'Memproses...' : 'Bayar Sekarang'}
								</button>
							</div>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.payment-page {
		padding: 24px;
		max-width: 800px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	.loading-state {
		text-align: center;
		padding: 48px 24px;
		color: var(--text-secondary);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 12px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 48px 24px;
		color: var(--text-secondary);
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: 12px;
	}

	.empty-state h3 {
		font-size: 18px;
		color: var(--text);
		margin: 0 0 8px;
	}

	.empty-state p {
		margin: 0;
		color: var(--text-secondary);
	}

	.invoice-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.invoice-card {
		padding: 20px;
	}

	.invoice-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.invoice-number {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.invoice-number strong {
		font-size: 16px;
		color: var(--text);
	}

	.invoice-status {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 4px;
		font-weight: 600;
		text-transform: uppercase;
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.badge-success {
		background: rgba(34, 197, 94, 0.15);
		color: #22c55e;
	}

	.badge-warning {
		background: rgba(234, 179, 8, 0.15);
		color: #eab308;
	}

	.invoice-amount {
		font-size: 20px;
		font-weight: 700;
		color: var(--accent);
	}

	.invoice-meta {
		display: flex;
		gap: 24px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.meta-label {
		font-size: 11px;
		color: var(--text-secondary);
		text-transform: uppercase;
		font-weight: 600;
	}

	.meta-value {
		font-size: 14px;
		color: var(--text);
	}

	.invoice-items {
		margin-bottom: 16px;
		padding: 12px;
		background: var(--bg-secondary);
		border-radius: 8px;
	}

	.invoice-items h4 {
		font-size: 12px;
		text-transform: uppercase;
		color: var(--text-secondary);
		margin: 0 0 8px;
		font-weight: 600;
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		font-size: 14px;
	}

	.item-desc {
		flex: 1;
		color: var(--text);
	}

	.item-qty {
		color: var(--text-secondary);
		font-size: 12px;
	}

	.item-amount {
		font-weight: 600;
		color: var(--text);
		min-width: 100px;
		text-align: right;
	}

	.invoice-actions {
		display: flex;
		justify-content: flex-end;
	}

	.btn {
		padding: 10px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}
</style>
