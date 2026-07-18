<script lang="ts">
	import { onMount } from 'svelte';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	let invoices: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let total = $state(0);
	let page = $state(1);
	let totalPages = $state(1);
	let statusFilter = $state('');
	let showModal = $state(false);
	let showPaymentModal = $state(false);
	let selectedInvoice: any = $state(null);

	// Create form
	let formStudentId = $state('');
	let formDueDate = $state('');
	let formDiscount = $state(0);
	let formFine = $state(0);
	let formNotes = $state('');
	let formItems = $state<Array<{ description: string; amount: number; quantity: number; fee_structure_id?: string }>>([
		{ description: '', amount: 0, quantity: 1 }
	]);

	// Payment form
	let payInvoiceId = $state('');
	let payStudentId = $state('');
	let payAmount = $state(0);
	let payMethodId = $state('');
	let payDate = $state('');
	let payType = $state('transfer');
	let payRef = $state('');
	let payNotes = $state('');

	let saving = $state(false);

	async function loadInvoices() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams({ page: String(page), limit: '15' });
			if (statusFilter) params.set('status', statusFilter);
			const res = await fetch(`/api/admin/payment-gateway/invoices?${params}`);
			const json = await res.json();
			if (json.success) {
				invoices = json.invoices || [];
				total = json.total;
				totalPages = json.totalPages;
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function addItem() {
		formItems = [...formItems, { description: '', amount: 0, quantity: 1 }];
	}

	function removeItem(i: number) {
		if (formItems.length <= 1) return;
		formItems = formItems.filter((_, idx) => idx !== i);
	}

	function updateItem(i: number, field: string, value: any) {
		const copy = [...formItems];
		(copy[i] as any)[field] = field === 'description' ? value : Number(value) || 0;
		formItems = copy;
	}

	async function submitInvoice() {
		saving = true;
		try {
			const res = await fetch('/api/admin/payment-gateway/invoices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					student_id: formStudentId,
					items: formItems,
					due_date: formDueDate || undefined,
					discount: formDiscount || undefined,
					fine: formFine || undefined,
					notes: formNotes || undefined
				})
			});
			const json = await res.json();
			if (json.success) {
				showModal = false;
				resetForm();
				loadInvoices();
			} else {
				alert(json.error || 'Gagal membuat invoice');
			}
		} catch {
			alert('Gagal terhubung ke server');
		} finally {
			saving = false;
		}
	}

	function openPaymentModal(invoice: any) {
		selectedInvoice = invoice;
		payInvoiceId = invoice.id;
		payStudentId = invoice.student_id;
		payAmount = invoice.total_amount - (invoice.paid_amount || 0);
		payDate = new Date().toISOString().slice(0, 10);
		showPaymentModal = true;
	}

	async function submitPayment() {
		saving = true;
		try {
			const res = await fetch('/api/admin/payment-gateway/payments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					invoice_id: payInvoiceId,
					student_id: payStudentId,
					amount: payAmount,
					payment_method_id: payMethodId || undefined,
					payment_date: payDate,
					payment_type: payType,
					reference_number: payRef || undefined,
					notes: payNotes || undefined
				})
			});
			const json = await res.json();
			if (json.success) {
				showPaymentModal = false;
				loadInvoices();
			} else {
				alert(json.error || 'Gagal mencatat pembayaran');
			}
		} catch {
			alert('Gagal terhubung ke server');
		} finally {
			saving = false;
		}
	}

	function resetForm() {
		formStudentId = '';
		formDueDate = '';
		formDiscount = 0;
		formFine = 0;
		formNotes = '';
		formItems = [{ description: '', amount: 0, quantity: 1 }];
	}

	function formatCurrency(a: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(a);
	}

	function formatDate(d: string): string {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function statusBadge(s: string): string {
		const m: Record<string, string> = { unpaid: 'badge-unpaid', partial: 'badge-partial', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled' };
		return m[s] || 'badge-cancelled';
	}

	// Expose handlers for DataTable inline HTML buttons
	$effect(() => {
		(window as any).__openPaymentModal = (id: string) => {
			const inv = invoices.find((i: any) => i.id === id);
			if (inv) openPaymentModal(inv);
		};
		(window as any).__viewInvoice = (id: string) => {
			const inv = invoices.find((i: any) => i.id === id);
			if (inv) selectedInvoice = inv;
		};
		return () => {
			delete (window as any).__openPaymentModal;
			delete (window as any).__viewInvoice;
		};
	});

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'No. Invoice',
			accessorKey: 'invoice_number',
			cell: ({ getValue }) => `<span style="font-family:'SF Mono','Fira Code',monospace;font-size:12px">${getValue()}</span>`
		},
		{
			header: 'Mahasiswa',
			accessorKey: 'student_name',
			cell: ({ row }) => {
				const inv = row.original;
				return inv.student_name || inv.student_id;
			}
		},
		{
			header: 'Total',
			accessorKey: 'total_amount',
			cell: ({ getValue }) => `<span style="font-weight:600;color:var(--text-primary)">${formatCurrency(getValue() as number)}</span>`
		},
		{
			header: 'Dibayar',
			accessorKey: 'paid_amount',
			cell: ({ getValue }) => formatCurrency((getValue() as number) || 0)
		},
		{
			header: 'Jatuh Tempo',
			accessorKey: 'due_date',
			cell: ({ getValue }) => formatDate(getValue() as string || '')
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const colors: Record<string, { bg: string; color: string }> = {
					unpaid: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
					partial: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
					paid: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
					overdue: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
					cancelled: { bg: 'rgba(138,143,152,0.12)', color: '#8a8f98' },
				};
				const c = colors[s] || colors.cancelled;
				return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:capitalize;background:${c.bg};color:${c.color}">${s}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			enableSorting: false,
			cell: ({ row }) => {
				const inv = row.original;
				let html = '<div style="display:flex;gap:6px">';
				if (inv.status !== 'paid' && inv.status !== 'cancelled') {
					html += `<button onclick="window.__openPaymentModal('${inv.id}')" style="padding:5px 12px;background:rgba(113,112,255,0.12);color:#7170ff;border:none;border-radius:6px;font-size:12px;cursor:pointer">Bayar</button>`;
				}
				html += `<button onclick="window.__viewInvoice('${inv.id}')" style="padding:5px 12px;background:transparent;color:var(--accent);border:1px solid var(--border-color,rgba(255,255,255,0.1));border-radius:6px;font-size:12px;cursor:pointer">Detail</button>`;
				html += '</div>';
				return html;
			}
		}
	];

	onMount(loadInvoices);
</script>

<div class="pg-page">
	<div class="pg-header">
		<div>
			<h1 class="pg-title">Invoice</h1>
			<p class="pg-subtitle">Daftar invoice & pencatatan pembayaran</p>
		</div>
		<button class="pg-btn pg-btn-primary" onclick={() => { resetForm(); showModal = true; }}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Buat Invoice
		</button>
	</div>

	<!-- Filters -->
	<div class="pg-filters">
		<select class="pg-select" bind:value={statusFilter} onchange={() => { page = 1; loadInvoices(); }}>
			<option value="">Semua Status</option>
			<option value="unpaid">Belum Dibayar</option>
			<option value="partial">Sebagian</option>
			<option value="paid">Lunas</option>
			<option value="overdue">Jatuh Tempo</option>
			<option value="cancelled">Dibatalkan</option>
		</select>
		<span class="pg-filter-count">{total} invoice</span>
	</div>

	{#if loading}
		<div class="pg-loading"><div class="pg-spinner"></div><p>Memuat data...</p></div>
	{:else if error}
		<div class="pg-error-block">
			<p>{error}</p>
			<button class="pg-btn pg-btn-ghost" onclick={loadInvoices}>Coba Lagi</button>
		</div>
	{:else if invoices.length === 0}
		<div class="pg-empty">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
			<p>Belum ada invoice</p>
			<button class="pg-btn pg-btn-primary pg-btn-sm" onclick={() => { resetForm(); showModal = true; }}>Buat Invoice Baru</button>
		</div>
	{:else}
		<div class="pg-table-wrap">
			<DataTable {columns} data={invoices} pageSize={100} showSearch={false} showPagination={false} />
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="pg-pagination">
				<button class="pg-btn pg-btn-ghost pg-btn-sm" disabled={page <= 1} onclick={() => { page--; loadInvoices(); }}>Prev</button>
				<span class="pg-page-info">Hal {page} / {totalPages}</span>
				<button class="pg-btn pg-btn-ghost pg-btn-sm" disabled={page >= totalPages} onclick={() => { page++; loadInvoices(); }}>Next</button>
			</div>
		{/if}
	{/if}

	<!-- Detail Panel -->
	{#if selectedInvoice && !showPaymentModal}
		<div class="pg-modal-overlay" onclick={() => selectedInvoice = null} role="presentation">
			<div class="pg-modal pg-modal-detail" onclick={(e) => e.stopPropagation()} role="document">
				<div class="pg-modal-header">
					<h2>Detail Invoice</h2>
					<button class="pg-btn-icon" onclick={() => selectedInvoice = null}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<div class="pg-modal-body">
					<div class="pg-detail-grid">
						<div class="pg-detail-item">
							<span class="pg-detail-label">No. Invoice</span>
							<span class="pg-detail-value pg-mono">{selectedInvoice.invoice_number}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Mahasiswa</span>
							<span class="pg-detail-value">{selectedInvoice.student_name || selectedInvoice.student_id}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Subtotal</span>
							<span class="pg-detail-value">{formatCurrency(selectedInvoice.amount)}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Diskon</span>
							<span class="pg-detail-value">-{formatCurrency(selectedInvoice.discount || 0)}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Denda</span>
							<span class="pg-detail-value">{formatCurrency(selectedInvoice.fine || 0)}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Total</span>
							<span class="pg-detail-value pg-bold">{formatCurrency(selectedInvoice.total_amount)}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Dibayar</span>
							<span class="pg-detail-value">{formatCurrency(selectedInvoice.paid_amount || 0)}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Status</span>
							<span class="pg-badge {statusBadge(selectedInvoice.status)}">{selectedInvoice.status}</span>
						</div>
						<div class="pg-detail-item">
							<span class="pg-detail-label">Jatuh Tempo</span>
							<span class="pg-detail-value">{formatDate(selectedInvoice.due_date || '')}</span>
						</div>
					</div>

					{#if selectedInvoice.items && selectedInvoice.items.length > 0}
						<h3 class="pg-subsection">Item Invoice</h3>
						<table class="pg-table pg-table-mini">
							<thead>
								<tr><th>Deskripsi</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr>
							</thead>
							<tbody>
								{#each selectedInvoice.items as item}
									<tr>
										<td>{item.description}</td>
										<td>{formatCurrency(item.amount)}</td>
										<td>{item.quantity}</td>
										<td class="pg-amount">{formatCurrency(item.amount * item.quantity)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}

					{#if selectedInvoice.notes}
						<p class="pg-notes">Catatan: {selectedInvoice.notes}</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Create Invoice Modal -->
	{#if showModal}
		<div class="pg-modal-overlay" onclick={() => showModal = false} role="presentation">
			<div class="pg-modal" onclick={(e) => e.stopPropagation()} role="document">
				<div class="pg-modal-header">
					<h2>Buat Invoice Baru</h2>
					<button class="pg-btn-icon" onclick={() => showModal = false}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<div class="pg-modal-body">
					<div class="pg-form-grid">
						<div class="pg-field pg-field-full">
							<label class="pg-label">Student ID <span class="pg-required">*</span></label>
							<input class="pg-input" bind:value={formStudentId} placeholder="ID mahasiswa" />
						</div>
						<div class="pg-field">
							<label class="pg-label">Jatuh Tempo</label>
							<input class="pg-input" type="date" bind:value={formDueDate} />
						</div>
						<div class="pg-field">
							<label class="pg-label">Diskon</label>
							<input class="pg-input" type="number" bind:value={formDiscount} min="0" />
						</div>
						<div class="pg-field">
							<label class="pg-label">Denda</label>
							<input class="pg-input" type="number" bind:value={formFine} min="0" />
						</div>
						<div class="pg-field pg-field-full">
							<label class="pg-label">Catatan</label>
							<input class="pg-input" bind:value={formNotes} placeholder="Catatan opsional" />
						</div>
					</div>

					<h3 class="pg-subsection">Item Invoice</h3>
					<div class="pg-items">
						{#each formItems as item, i}
							<div class="pg-item-row">
								<input class="pg-input pg-input-grow" bind:value={item.description} placeholder="Deskripsi item" />
								<input class="pg-input pg-input-num" type="number" bind:value={item.amount} min="0" placeholder="Harga" />
								<input class="pg-input pg-input-num-sm" type="number" bind:value={item.quantity} min="1" placeholder="Qty" />
								<button class="pg-btn-icon pg-btn-danger" onclick={() => removeItem(i)} disabled={formItems.length <= 1}>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
								</button>
							</div>
						{/each}
						<button class="pg-btn pg-btn-ghost pg-btn-sm" onclick={addItem}>+ Tambah Item</button>
					</div>
				</div>
				<div class="pg-modal-footer">
					<button class="pg-btn pg-btn-ghost" onclick={() => showModal = false}>Batal</button>
					<button class="pg-btn pg-btn-primary" onclick={submitInvoice} disabled={saving || !formStudentId || formItems.length === 0}>
						{saving ? 'Menyimpan...' : 'Buat Invoice'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Payment Modal -->
	{#if showPaymentModal}
		<div class="pg-modal-overlay" onclick={() => showPaymentModal = false} role="presentation">
			<div class="pg-modal" onclick={(e) => e.stopPropagation()} role="document">
				<div class="pg-modal-header">
					<h2>Catat Pembayaran</h2>
					<button class="pg-btn-icon" onclick={() => showPaymentModal = false}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<div class="pg-modal-body">
					{#if selectedInvoice}
						<div class="pg-pay-summary">
							<span>Sisa tagihan: <strong>{formatCurrency(selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0))}</strong></span>
						</div>
					{/if}
					<div class="pg-form-grid">
						<div class="pg-field">
							<label class="pg-label">Nominal <span class="pg-required">*</span></label>
							<input class="pg-input" type="number" bind:value={payAmount} min="1" />
						</div>
						<div class="pg-field">
							<label class="pg-label">Tanggal Bayar <span class="pg-required">*</span></label>
							<input class="pg-input" type="date" bind:value={payDate} />
						</div>
						<div class="pg-field">
							<label class="pg-label">Metode Pembayaran</label>
							<select class="pg-input" bind:value={payType}>
								<option value="transfer">Transfer Bank</option>
								<option value="cash">Tunai</option>
								<option value="credit_card">Kartu Kredit</option>
								<option value="e_wallet">E-Wallet</option>
								<option value="virtual_account">Virtual Account</option>
							</select>
						</div>
						<div class="pg-field">
							<label class="pg-label">No. Referensi</label>
							<input class="pg-input" bind:value={payRef} placeholder="No. referensi" />
						</div>
						<div class="pg-field pg-field-full">
							<label class="pg-label">Catatan</label>
							<input class="pg-input" bind:value={payNotes} placeholder="Catatan opsional" />
						</div>
					</div>
				</div>
				<div class="pg-modal-footer">
					<button class="pg-btn pg-btn-ghost" onclick={() => showPaymentModal = false}>Batal</button>
					<button class="pg-btn pg-btn-primary" onclick={submitPayment} disabled={saving || payAmount <= 0}>
						{saving ? 'Menyimpan...' : 'Catat Pembayaran'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.pg-page { display: flex; flex-direction: column; gap: 20px; }
	.pg-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
	.pg-title { font-size: 24px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; letter-spacing: -0.3px; }
	.pg-subtitle { font-size: 13px; color: var(--text-secondary, #8a8f98); margin: 4px 0 0; }

	/* Filters */
	.pg-filters { display: flex; align-items: center; gap: 12px; }
	.pg-filter-count { font-size: 13px; color: var(--text-secondary, #8a8f98); }
	.pg-select {
		padding: 7px 32px 7px 12px;
		font-size: 13px;
		background: var(--bg-secondary, #1a1b1e);
		border: 1px solid var(--border-color, rgba(255,255,255,0.08));
		border-radius: 8px;
		color: var(--text-primary, #d0d6e0);
		appearance: none;
		cursor: pointer;
		outline: none;
		background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8f98' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 10px center;
	}

	/* Loading/Error/Empty */
	.pg-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }
	.pg-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, rgba(255,255,255,0.08)); border-top-color: var(--accent, #7170ff); border-radius: 50%; animation: pg-spin 0.7s linear infinite; }
	@keyframes pg-spin { to { transform: rotate(360deg); } }

	.pg-error-block { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #ef4444; text-align: center; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; }
	.pg-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }

	/* Table */
	.pg-table-wrap { overflow-x: auto; background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; }
	.pg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.pg-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; color: var(--text-secondary, #8a8f98); text-transform: uppercase; letter-spacing: 0.04em; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); white-space: nowrap; }
	.pg-table td { padding: 12px 16px; color: var(--text-primary, #d0d6e0); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.04)); white-space: nowrap; }
	.pg-table tbody tr:hover { background: rgba(255,255,255,0.02); }
	.pg-table-mini th { padding: 8px 12px; font-size: 10px; }
	.pg-table-mini td { padding: 8px 12px; font-size: 12px; }
	.pg-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
	.pg-amount { font-weight: 600; color: var(--text-primary, #f7f8f8); }
	.pg-bold { font-weight: 700; }

	/* Badge */
	.pg-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
	.badge-unpaid { background: rgba(245,158,11,0.12); color: #f59e0b; }
	.badge-partial { background: rgba(245,158,11,0.12); color: #f59e0b; }
	.badge-paid { background: rgba(34,197,94,0.12); color: #22c55e; }
	.badge-overdue { background: rgba(239,68,68,0.12); color: #ef4444; }
	.badge-cancelled { background: rgba(138,143,152,0.12); color: #8a8f98; }

	/* Actions */
	.pg-actions { display: flex; gap: 6px; }

	/* Pagination */
	.pg-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 0; }
	.pg-page-info { font-size: 13px; color: var(--text-secondary, #8a8f98); }

	/* Modal */
	.pg-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
	.pg-modal { background: #1a1b1e; border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; }
	.pg-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); }
	.pg-modal-header h2 { font-size: 16px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }
	.pg-modal-body { padding: 20px; overflow-y: auto; flex: 1; }
	.pg-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.08)); }

	.pg-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.pg-detail-item { display: flex; flex-direction: column; gap: 2px; }
	.pg-detail-label { font-size: 11px; color: var(--text-secondary, #8a8f98); font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; }
	.pg-detail-value { font-size: 14px; color: var(--text-primary, #d0d6e0); }

	.pg-subsection { font-size: 14px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 20px 0 10px; }
	.pg-notes { font-size: 13px; color: var(--text-secondary, #8a8f98); margin-top: 16px; }

	/* Form */
	.pg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.pg-field-full { grid-column: 1 / -1; }
	.pg-label { display: block; font-size: 12px; font-weight: 500; color: var(--text-secondary, #8a8f98); margin-bottom: 5px; }
	.pg-required { color: #ef4444; }
	.pg-input {
		width: 100%;
		padding: 8px 12px;
		font-size: 13px;
		background: rgba(255,255,255,0.04);
		border: 1px solid var(--border-color, rgba(255,255,255,0.1));
		border-radius: 8px;
		color: var(--text-primary, #d0d6e0);
		outline: none;
		box-sizing: border-box;
	}
	.pg-input:focus { border-color: var(--accent, #7170ff); }

	/* Items */
	.pg-items { display: flex; flex-direction: column; gap: 8px; }
	.pg-item-row { display: flex; gap: 8px; align-items: center; }
	.pg-input-grow { flex: 1; min-width: 0; }
	.pg-input-num { width: 120px; }
	.pg-input-num-sm { width: 70px; }

	/* Payment Summary */
	.pg-pay-summary { padding: 12px 16px; background: rgba(113,112,255,0.08); border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: var(--text-primary, #d0d6e0); }

	/* Buttons */
	.pg-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
	.pg-btn-primary { background: var(--accent, #7170ff); color: #fff; }
	.pg-btn-primary:hover { opacity: 0.9; }
	.pg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.pg-btn-ghost { background: transparent; color: var(--accent, #7170ff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
	.pg-btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.pg-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
	.pg-btn-accent { background: rgba(113,112,255,0.12); color: #7170ff; }
	.pg-btn-accent:hover { background: rgba(113,112,255,0.2); }
	.pg-btn-sm { padding: 5px 12px; font-size: 12px; }
	.pg-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; background: transparent; border: none; color: var(--text-secondary, #8a8f98); cursor: pointer; transition: all 0.15s; }
	.pg-btn-icon:hover { background: rgba(255,255,255,0.06); color: var(--text-primary, #f7f8f8); }
	.pg-btn-danger:hover { color: #ef4444; }
</style>
