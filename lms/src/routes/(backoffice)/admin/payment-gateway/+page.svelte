<script lang="ts">
	import { onMount } from 'svelte';
	import { StatCard, PageHeader } from '$lib/components/ui';

	let stats: any = $state(null);
	let loading = $state(true);
	let error = $state('');

	type Payment = {
		id: string;
		student_name?: string;
		invoice_number?: string;
		amount: number;
		status: string;
		payment_date: string;
		payment_method_name?: string;
		reference_number?: string;
		created_at?: string;
	};

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/payment-gateway/stats');
			const json = await res.json();
			if (json.success) {
				stats = json.data;
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function statusBadge(status: string): string {
		const map: Record<string, string> = {
			'unpaid': 'badge-unpaid',
			'partial': 'badge-partial',
			'paid': 'badge-paid',
			'overdue': 'badge-overdue',
			'cancelled': 'badge-cancelled',
			'pending': 'badge-partial',
			'verified': 'badge-paid',
			'rejected': 'badge-overdue'
		};
		return map[status] || 'badge-cancelled';
	}

	onMount(loadStats);
</script>

<div class="pg-dashboard">
	<PageHeader title="Payment Gateway" subtitle="Dashboard keuangan & pembayaran" />

	{#if loading}
		<div class="pg-loading">
			<div class="pg-spinner"></div>
			<p>Memuat data...</p>
		</div>
	{:else if error}
		<div class="pg-error">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
			<p>{error}</p>
			<button class="pg-btn pg-btn-ghost" onclick={loadStats}>Coba Lagi</button>
		</div>
	{:else if stats}
		<div class="pg-stats-grid">
			<StatCard icon="💰" value={formatCurrency(stats.totalRevenue)} label="Total Pendapatan" color="#10b981" />
			<StatCard icon="⏳" value={formatCurrency(stats.totalPending)} label="Menunggu Verifikasi" color="#f59e0b" />
			<StatCard icon="⚠️" value={formatCurrency(stats.totalOverdue)} label="Total Jatuh Tempo" color="#ef4444" />
			<StatCard icon="📄" value={stats.invoiceCount} label="Total Invoice" color="#7170ff" />
			<StatCard icon="✅" value={stats.paidCount} label="Invoice Lunas" color="#3b82f6" />
		</div>

		<div class="pg-section">
			<div class="pg-section-header">
				<h2 class="pg-section-title">Pembayaran Terbaru</h2>
				<a href="/admin/payment-gateway/invoices" class="pg-btn pg-btn-ghost pg-btn-sm">Lihat Semua</a>
			</div>

			{#if stats.recentPayments && stats.recentPayments.length > 0}
				<div class="pg-table-wrap">
					<table class="pg-table">
						<thead>
							<tr>
								<th>Tanggal</th>
								<th>Mahasiswa</th>
								<th>No. Invoice</th>
								<th>Nominal</th>
								<th>Metode</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recentPayments as payment}
								<tr>
									<td>{formatDate(payment.payment_date || payment.created_at || '')}</td>
									<td>{payment.student_name || '-'}</td>
									<td class="pg-mono">{payment.invoice_number || '-'}</td>
									<td class="pg-amount">{formatCurrency(payment.amount)}</td>
									<td>{payment.payment_method_name || '-'}</td>
									<td><span class="pg-badge {statusBadge(payment.status)}">{payment.status}</span></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="pg-empty">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
					<p>Belum ada pembayaran</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pg-dashboard {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

		/* Loading */
	.pg-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 60px 20px;
		color: var(--text-secondary, #8a8f98);
	}

	.pg-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border-color, rgba(255,255,255,0.08));
		border-top-color: var(--accent, #7170ff);
		border-radius: 50%;
		animation: pg-spin 0.7s linear infinite;
	}

	@keyframes pg-spin {
		to { transform: rotate(360deg); }
	}

	/* Error */
	.pg-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 40px;
		color: #ef4444;
		text-align: center;
		background: rgba(239, 68, 68, 0.05);
		border: 1px solid rgba(239, 68, 68, 0.15);
		border-radius: 10px;
	}

	/* Stats Grid */
	.pg-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
	}

	/* Section */
	.pg-section {
		background: var(--bg-secondary, #1a1b1e);
		border: 1px solid var(--border-color, rgba(255,255,255,0.08));
		border-radius: 10px;
		overflow: hidden;
	}

	.pg-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
	}

	.pg-section-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary, #f7f8f8);
		margin: 0;
	}

	/* Table */
	.pg-table-wrap {
		overflow-x: auto;
	}

	.pg-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.pg-table th {
		text-align: left;
		padding: 10px 20px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary, #8a8f98);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: rgba(255,255,255,0.02);
		border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
		white-space: nowrap;
	}

	.pg-table td {
		padding: 12px 20px;
		color: var(--text-primary, #d0d6e0);
		border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.04));
		white-space: nowrap;
	}

	.pg-table tbody tr:hover {
		background: rgba(255,255,255,0.02);
	}

	.pg-mono {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 12px;
	}

	.pg-amount {
		font-weight: 600;
		color: var(--text-primary, #f7f8f8);
	}

	/* Badge */
	.pg-badge {
		display: inline-block;
		padding: 3px 10px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.badge-unpaid { background: rgba(249, 115, 22, 0.12); color: #f97316; }
	.badge-partial { background: rgba(234, 179, 8, 0.12); color: #eab308; }
	.badge-paid { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
	.badge-overdue { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
	.badge-cancelled { background: rgba(156, 163, 175, 0.12); color: #9ca3af; }

	/* Empty */
	.pg-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 40px 20px;
		color: var(--text-secondary, #8a8f98);
	}

	/* Buttons */
	.pg-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		border: none;
		text-decoration: none;
	}

	.pg-btn-ghost {
		background: transparent;
		color: var(--accent, #7170ff);
		border: 1px solid var(--border-color, rgba(255,255,255,0.1));
	}

	.pg-btn-ghost:hover {
		background: rgba(255,255,255,0.04);
	}

	.pg-btn-sm {
		padding: 5px 12px;
		font-size: 12px;
	}

	@media (max-width: 640px) {
		.pg-stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
