<script lang="ts">
	import { onMount } from 'svelte';

	let feeStructures: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingId = $state('');
	let typeFilter = $state('');
	let saving = $state(false);

	let formName = $state('');
	let formCode = $state('');
	let formDescription = $state('');
	let formAmount = $state(0);
	let formFeeType = $state('spp');
	let formAcademicYear = $state('');
	let formSemester = $state('');
	let formIsActive = $state(true);

	const feeTypes = [
		{ value: 'spp', label: 'SPP' },
		{ value: 'uang_gedung', label: 'Uang Gedung' },
		{ value: 'praktikum', label: 'Praktikum' },
		{ value: 'skripsi', label: 'Skripsi' },
		{ value: 'lainnya', label: 'Lainnya' }
	];

	async function loadFeeStructures() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (typeFilter) params.set('fee_type', typeFilter);
			const res = await fetch(`/api/admin/payment-gateway/fee-structures?${params}`);
			const json = await res.json();
			if (json.success) {
				feeStructures = json.data || [];
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editingId = '';
		formName = '';
		formCode = '';
		formDescription = '';
		formAmount = 0;
		formFeeType = 'spp';
		formAcademicYear = '';
		formSemester = '';
		formIsActive = 1;
		showModal = true;
	}

	function openEdit(fee: any) {
		editingId = fee.id;
		formName = fee.name;
		formCode = fee.code || '';
		formDescription = fee.description || '';
		formAmount = fee.amount;
		formFeeType = fee.fee_type;
		formAcademicYear = fee.academic_year || '';
		formSemester = fee.semester || '';
		formIsActive = fee.is_active === 1 || fee.is_active === true;
		showModal = true;
	}

	async function submitFee() {
		saving = true;
		try {
			const payload = {
				name: formName,
				code: formCode || undefined,
				description: formDescription || undefined,
				amount: formAmount,
				fee_type: formFeeType,
				academic_year: formAcademicYear || undefined,
				semester: formSemester || undefined,
				is_active: formIsActive ? 1 : 0
			};
			const url = editingId
				? `/api/admin/payment-gateway/fee-structures/${editingId}`
				: '/api/admin/payment-gateway/fee-structures';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const json = await res.json();
			if (json.success) {
				showModal = false;
				loadFeeStructures();
			} else {
				alert(json.error || 'Gagal menyimpan');
			}
		} catch {
			alert('Gagal terhubung ke server');
		} finally {
			saving = false;
		}
	}

	function formatCurrency(a: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(a);
	}

	function feeTypeLabel(t: string): string {
		return feeTypes.find(f => f.value === t)?.label || t;
	}

	onMount(loadFeeStructures);
  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="pg-page">
	<div class="pg-header">
		<div>
			<h1 class="pg-title">Fee Structure</h1>
			<p class="pg-subtitle">Pengaturan biaya: SPP, gedung, praktikum, dll.</p>
		</div>
		<button class="pg-btn pg-btn-primary" onclick={openCreate}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Tambah Fee
		</button>
	</div>

	<!-- Filters -->
	<div class="pg-filters">
		<select class="pg-select" bind:value={typeFilter} onchange={loadFeeStructures}>
			<option value="">Semua Tipe</option>
			{#each feeTypes as ft}
				<option value={ft.value}>{ft.label}</option>
			{/each}
		</select>
		<span class="pg-filter-count">{feeStructures.length} fee structure</span>
	</div>

	{#if loading}
		<div class="pg-loading"><div class="pg-spinner"></div><p>Memuat data...</p></div>
	{:else if error}
		<div class="pg-error-block">
			<p>{error}</p>
			<button class="pg-btn pg-btn-ghost" onclick={loadFeeStructures}>{t('common.retry')}</button>
		</div>
	{:else if feeStructures.length === 0}
		<div class="pg-empty">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
			<p>Belum ada fee structure</p>
			<button class="pg-btn pg-btn-primary pg-btn-sm" onclick={openCreate}>Tambah Fee Pertama</button>
		</div>
	{:else}
		<div class="pg-cards">
			{#each feeStructures as fee}
				<div class="pg-fee-card" class:pg-fee-inactive={fee.is_active === 0}>
					<div class="pg-fee-header">
						<div>
							<span class="pg-badge pg-badge-type">{feeTypeLabel(fee.fee_type)}</span>
							{#if fee.is_active === 0}
								<span class="pg-badge pg-badge-off">{t('common.inactive')}</span>
							{/if}
						</div>
						<div class="pg-fee-actions">
							<button class="pg-btn-icon" onclick={() => openEdit(fee)} title={t('common.edit')}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
							</button>
						</div>
					</div>
					<h3 class="pg-fee-name">{fee.name}</h3>
					{#if fee.code}
						<span class="pg-fee-code">{fee.code}</span>
					{/if}
					<div class="pg-fee-amount">{formatCurrency(fee.amount)}</div>
					{#if fee.description}
						<p class="pg-fee-desc">{fee.description}</p>
					{/if}
					<div class="pg-fee-meta">
						{#if fee.academic_year}
							<span>Tahun {fee.academic_year}</span>
						{/if}
						{#if fee.semester}
							<span>Semester {fee.semester}</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Modal -->
	{#if showModal}
		<div class="pg-modal-overlay" onclick={() => showModal = false} role="presentation">
			<div class="pg-modal" onclick={(e) => e.stopPropagation()} role="document">
				<div class="pg-modal-header">
					<h2>{editingId ? 'Edit Fee Structure' : 'Tambah Fee Structure'}</h2>
					<button class="pg-btn-icon" onclick={() => showModal = false}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<div class="pg-modal-body">
					<div class="pg-form-grid">
						<div class="pg-field">
							<label class="pg-label">Nama <span class="pg-required">*</span></label>
							<input class="pg-input" bind:value={formName} placeholder="Contoh: SPP Semester 1" />
						</div>
						<div class="pg-field">
							<label class="pg-label">{t('common.code')}</label>
							<input class="pg-input" bind:value={formCode} placeholder="Contoh: SPP-01" />
						</div>
						<div class="pg-field">
							<label class="pg-label">Tipe <span class="pg-required">*</span></label>
							<select class="pg-input" bind:value={formFeeType}>
								{#each feeTypes as ft}
									<option value={ft.value}>{ft.label}</option>
								{/each}
							</select>
						</div>
						<div class="pg-field">
							<label class="pg-label">Nominal <span class="pg-required">*</span></label>
							<input class="pg-input" type="number" bind:value={formAmount} min="0" />
						</div>
						<div class="pg-field">
							<label class="pg-label">Tahun Akademik</label>
							<input class="pg-input" bind:value={formAcademicYear} placeholder="Contoh: 2025/2026" />
						</div>
						<div class="pg-field">
							<label class="pg-label">{t('admin.semester')}</label>
							<input class="pg-input" bind:value={formSemester} placeholder="Contoh: 1" />
						</div>
						<div class="pg-field pg-field-full">
							<label class="pg-label">{t('common.description')}</label>
							<input class="pg-input" bind:value={formDescription} placeholder="Deskripsi opsional" />
						</div>
						<div class="pg-field pg-field-full">
							<label class="pg-label">{t('common.status')}</label>
							<label class="pg-toggle-label">
								<input type="checkbox" bind:checked={formIsActive} class="pg-toggle-input" />
								<span>{formIsActive ? 'Aktif' : 'Non-aktif'}</span>
							</label>
						</div>
					</div>
				</div>
				<div class="pg-modal-footer">
					<button class="pg-btn pg-btn-ghost" onclick={() => showModal = false}>{t('common.cancel')}</button>
					<button class="pg-btn pg-btn-primary" onclick={submitFee} disabled={saving || !formName || formAmount <= 0}>
						{saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Fee')}
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

	.pg-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }
	.pg-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, rgba(255,255,255,0.08)); border-top-color: var(--accent, #7170ff); border-radius: 50%; animation: pg-spin 0.7s linear infinite; }
	@keyframes pg-spin { to { transform: rotate(360deg); } }

	.pg-error-block { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #ef4444; text-align: center; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; }
	.pg-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }

	/* Cards */
	.pg-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

	.pg-fee-card {
		background: var(--bg-secondary, #1a1b1e);
		border: 1px solid var(--border-color, rgba(255,255,255,0.08));
		border-radius: 10px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: border-color 0.15s;
	}
	.pg-fee-card:hover { border-color: rgba(255,255,255,0.12); }
	.pg-fee-inactive { opacity: 0.6; }

	.pg-fee-header { display: flex; justify-content: space-between; align-items: center; }

	.pg-fee-name { font-size: 15px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 4px 0 0; }
	.pg-fee-code { font-size: 12px; font-family: 'SF Mono', 'Fira Code', monospace; color: var(--text-secondary, #8a8f98); }
	.pg-fee-amount { font-size: 22px; font-weight: 700; color: var(--accent, #7170ff); letter-spacing: -0.5px; margin: 4px 0; }
	.pg-fee-desc { font-size: 12px; color: var(--text-secondary, #8a8f98); margin: 0; line-height: 1.4; }
	.pg-fee-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
	.pg-fee-meta span { font-size: 11px; color: var(--text-secondary, #8a8f98); background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 4px; }

	.pg-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
	.pg-badge-type { background: rgba(113,112,255,0.12); color: #7170ff; }
	.pg-badge-off { background: rgba(156,163,175,0.12); color: #9ca3af; margin-left: 4px; }

	.pg-fee-actions { display: flex; gap: 4px; }

	/* Modal */
	.pg-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
	.pg-modal { background: #1a1b1e; border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; }
	.pg-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); }
	.pg-modal-header h2 { font-size: 16px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }
	.pg-modal-body { padding: 20px; overflow-y: auto; flex: 1; }
	.pg-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.08)); }

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
	.pg-toggle-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary, #d0d6e0); cursor: pointer; }
	.pg-toggle-input { accent-color: var(--accent, #7170ff); }

	/* Buttons */
	.pg-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
	.pg-btn-primary { background: var(--accent, #7170ff); color: #fff; }
	.pg-btn-primary:hover { opacity: 0.9; }
	.pg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.pg-btn-ghost { background: transparent; color: var(--accent, #7170ff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
	.pg-btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.pg-btn-sm { padding: 5px 12px; font-size: 12px; }
	.pg-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: transparent; border: none; color: var(--text-secondary, #8a8f98); cursor: pointer; transition: all 0.15s; }
	.pg-btn-icon:hover { background: rgba(255,255,255,0.06); color: var(--text-primary, #f7f8f8); }
</style>
