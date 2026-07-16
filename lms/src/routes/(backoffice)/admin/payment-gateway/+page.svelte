<script lang="ts">
	import { onMount } from 'svelte';

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
	<div class="pg-header">
		<h1 class="pg-title">Payment Gateway</h1>
		<p class="pg-subtitle">Dashboard keuangan & pembayaran</p>
	</div>

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
			<div class="pg-stat-card pg-stat-revenue">
				<div class="pg-stat-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
				</div>
				<div class="pg-stat-info">
					<span class="pg-stat-label">Total Pendapatan</span>
					<span class="pg-stat-value">{formatCurrency(stats.totalRevenue)}</span>
				</div>
			</div>

			<div class="pg-stat-card pg-stat-pending">
				<div class="pg-stat-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
				</div>
				<div class="pg-stat-info">
					<span class="pg-stat-label">Menunggu Verifikasi</span>
					<span class="pg-stat-value">{formatCurrency(stats.totalPending)}</span>
				</div>
			</div>

			<div class="pg-stat-card pg-stat-overdue">
				<div class="pg-stat-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
				</div>
				<div class="pg-stat-info">
					<span class="pg-stat-label">Total Jatuh Tempo</span>
					<span class="pg-stat-value">{formatCurrency(stats.totalOverdue)}</span>
				</div>
			</div>

			<div class="pg-stat-card pg-stat-invoices">
				<div class="pg-stat-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
				</div>
				<div class="pg-stat-info">
					<span class="pg-stat-label">Total Invoice</span>
					<span class="pg-stat-value">{stats.invoiceCount}</span>
				</div>
			</div>

			<div class="pg-stat-card pg-stat-paid">
				<div class="pg-stat-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
				</div>
				<div class="pg-stat-info">
					<span class="pg-stat-label">Invoice Lunas</span>
					<span class="pg-stat-value">{stats.paidCount}</span>
				</div>
			</div>
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

	.pg-header {
		margin-bottom: 8px;
	}

	.pg-title {
		font-size: 24px;
		font-weight: 600;
		color: var(--text-primary, #f7f8f8);
		margin: 0;
		letter-spacing: -0.3px;
	}

	.pg-subtitle {
		font-size: 13px;
		color: var(--text-secondary, #8a8f98);
		margin: 4px 0 0;
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

	.pg-stat-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 20px;
		background: var(--bg-secondary, #1a1b1e);
		border: 1px solid var(--border-color, rgba(255,255,255,0.08));
		border-radius: 10px;
		transition: border-color 0.15s;
	}

	.pg-stat-card:hover {
		border-color: rgba(255,255,255,0.12);
	}

	.pg-stat-icon {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.pg-stat-revenue .pg-stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
	.pg-stat-pending .pg-stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
	.pg-stat-overdue .pg-stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
	.pg-stat-invoices .pg-stat-icon { background: rgba(113, 112, 255, 0.1); color: #7170ff; }
	.pg-stat-paid .pg-stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

	.pg-stat-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.pg-stat-label {
		font-size: 12px;
		color: var(--text-secondary, #8a8f98);
		font-weight: 500;
	}

	.pg-stat-value {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-primary, #f7f8f8);
		letter-spacing: -0.3px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
