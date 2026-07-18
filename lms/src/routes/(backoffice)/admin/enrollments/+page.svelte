<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Badge, Button, Card, CardContent, DataTable, EmptyState, PageHeader, SearchBar, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let enrollments: any[] = $state([]);
	let offerings: any[] = $state([]);
	let users: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	// Filters
	let searchQuery = $state('');
	let selectedOfferingId = $state('');
	let page = $state(1);
	let totalPages = $state(0);
	let totalEnrollments = $state(0);
	const limit = 20;

	// Add modal
	let showAddModal = $state(false);
	let addUserId = $state('');
	let addOfferingId = $state('');
	let submitting = $state(false);
	let submitError = $state('');

	// Delete confirmation
	let confirmDelete = $state<string | null>(null);
	let deleting = $state(false);

	onMount(() => {
		if (browser) { loadOfferings(); loadUsers(); loadData(); }
	});

	async function loadOfferings() {
		try {
			const res = await fetch('/api/admin/course-offerings');
			const json = await res.json();
			if (json.success) offerings = json.data || [];
		} catch {}
	}

	async function loadUsers() {
		try {
			const res = await fetch('/api/admin/users?limit=500');
			const json = await res.json();
			if (json.success) users = json.data || [];
		} catch {}
	}

	async function loadData() {
		loading = true; error = '';
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.set('search', searchQuery);
			if (selectedOfferingId) params.set('course_offering_id', selectedOfferingId);
			params.set('page', String(page));
			params.set('limit', String(limit));
			const res = await fetch(`/api/admin/enrollments?${params}`);
			const json = await res.json();
			if (json.success) {
				enrollments = json.data || [];
				if (json.pagination) {
					totalPages = json.pagination.totalPages;
					totalEnrollments = json.pagination.total;
				} else {
					totalEnrollments = json.total || enrollments.length;
					totalPages = 1;
				}
			} else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function doSearch() {
		page = 1;
		loadData();
	}

	function changePage(delta: number) {
		const next = page + delta;
		if (next < 1 || next > totalPages) return;
		page = next;
		loadData();
	}

	function openAddModal() {
		addUserId = '';
		addOfferingId = selectedOfferingId;
		submitError = '';
		showAddModal = true;
	}

	function closeAddModal() { showAddModal = false; }

	async function handleAddEnrollment() {
		if (!addUserId || !addOfferingId) {
			submitError = 'Pilih user dan offering';
			return;
		}
		submitting = true; submitError = '';
		try {
			const res = await fetch('/api/admin/enrollments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: addUserId, course_offering_id: addOfferingId }),
			});
			const json = await res.json();
			if (json.success) {
				closeAddModal();
				loadData();
			} else submitError = json.error || 'Gagal mendaftarkan';
		} catch { submitError = 'Network error'; }
		finally { submitting = false; }
	}

	async function handleDelete(id: string) {
		deleting = true;
		try {
			const res = await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				confirmDelete = null;
				loadData();
			} else alert(json.error || 'Gagal menghapus');
		} catch { alert('Network error'); }
		finally { deleting = false; }
	}

	function exportCsv() {
		const params = new URLSearchParams();
		if (selectedOfferingId) params.set('course_offering_id', selectedOfferingId);
		window.open(`/api/admin/enrollments/export?${params}`, '_blank');
	}

	const offeringOptions = $derived(
		offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code || '-'})` }))
	);

	// Force DataTable re-render when confirmDelete changes by tagging each row
	const tableData = $derived(enrollments.map(e => ({ ...e, _cd: confirmDelete })));

	function formatDate(d: string | null): string {
		if (!d) return '-';
		try { return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); }
		catch { return d; }
	}

	function statusBadge(s: string): string {
		const map: Record<string, string> = { active: 'success', completed: 'info', dropped: 'danger', pending: 'warning' };
		return map[s] || 'default';
	}

	function statusLabel(s: string): string {
		const map: Record<string, string> = { active: 'Aktif', completed: 'Selesai', dropped: 'Drop Out', pending: 'Menunggu' };
		return map[s] || s;
	}

	function statusBadgeHtml(s: string): string {
		const colors: Record<string, { bg: string; color: string }> = {
			active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
			completed: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
			dropped: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
			pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
		};
		const c = colors[s] || { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' };
		return `<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${c.bg};color:${c.color}">${statusLabel(s)}</span>`;
	}

	// Expose delete handler for inline HTML buttons
	$effect(() => {
		(window as any).__confirmDeleteEnrollment = (id: string) => { confirmDelete = id; };
		(window as any).__deleteEnrollment = handleDelete;
		(window as any).__cancelDelete = () => { confirmDelete = null; };
		return () => {
			delete (window as any).__confirmDeleteEnrollment;
			delete (window as any).__deleteEnrollment;
			delete (window as any).__cancelDelete;
		};
	});

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Siswa',
			accessorKey: 'user_name',
			cell: ({ row }) => {
				const e = row.original;
				return `<span style="font-weight:600">${e.user_name || e.username || '-'}</span>`;
			}
		},
		{
			header: 'Email',
			accessorKey: 'user_email',
			cell: ({ getValue }) => `<span style="color:var(--text-secondary);font-size:13px">${(getValue() as string) || '-'}</span>`
		},
		{
			header: 'Kursus',
			accessorKey: 'offering_name',
			cell: ({ row }) => {
				const e = row.original;
				let html = `<span style="font-weight:500">${e.offering_name || '-'}</span>`;
				if (e.offering_code) {
					html += `<br><span style="font-size:11px;color:var(--text-secondary)">${e.offering_code}</span>`;
				}
				return html;
			}
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => statusBadgeHtml(getValue() as string)
		},
		{
			header: 'Tanggal Daftar',
			accessorKey: 'enrolled_at',
			cell: ({ getValue }) => `<span style="color:var(--text-secondary);font-size:13px">${formatDate(getValue() as string)}</span>`
		},
		{
			header: 'Total Pendaftaran',
			accessorKey: 'user_enrollment_count',
			cell: ({ getValue }) => `<span style="text-align:center">${(getValue() as number) || 0}</span>`
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			enableSorting: false,
			cell: ({ row }) => {
				const e = row.original;
				if (confirmDelete === e.id) {
					return `<span style="display:flex;align-items:center;gap:6px;white-space:nowrap"><span style="font-size:12px;color:#ef4444;font-weight:600">Hapus?</span><button onclick="window.__deleteEnrollment('${e.id}')" style="padding:4px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer">${deleting ? '...' : 'Ya'}</button><button onclick="window.__cancelDelete()" style="padding:4px 10px;background:transparent;color:var(--text-secondary);border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer">Batal</button></span>`;
				}
				return `<button onclick="window.__confirmDeleteEnrollment('${e.id}')" style="padding:4px 10px;background:transparent;border:none;font-size:14px;cursor:pointer">🗑️</button>`;
			}
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<PageHeader title="📋 Manajemen Pendaftaran" subtitle="Total {totalEnrollments} pendaftaran">
		{#snippet action()}
			<Button variant="secondary" onclick={exportCsv}>📤 Export CSV</Button>
			<Button onclick={openAddModal}>+ Tambah Pendaftaran</Button>
		{/snippet}
	</PageHeader>

	<!-- Filters -->
	<div class="filters">
		<SearchBar bind:value={searchQuery} placeholder="Cari nama/email siswa..." onSearch={doSearch} />
		<div class="filter-selects">
<Select bind:value={selectedOfferingId} onchange={() => { page = 1; loadData(); }} options={offerings.map((o) => ({ value: o.id, label: o.name }))} />
		</div>
	</div>

	<!-- Table -->
	{#if loading}
		<Card><CardContent><div class="loading-state">Memuat data...</div></CardContent></Card>
	{:else if error}
		<Card><CardContent><div class="error-state">{error}</div></CardContent></Card>
	{:else if enrollments.length === 0}
		<EmptyState icon="📋" title="Belum ada enrollment" description="Belum ada data pendaftaran." />
	{:else}
		<div class="table-wrapper">
			<DataTable
				{columns}
				data={enrollments}
				showSearch={false}
				showPagination={false}
				emptyMessage="Tidak ada data"
			/>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="pagination">
				<Button variant="secondary" size="sm" disabled={page <= 1} onclick={() => changePage(-1)}>{t('admin.prev')}</Button>
				<span class="page-info">Halaman {page} dari {totalPages}</span>
				<Button variant="secondary" size="sm" disabled={page >= totalPages} onclick={() => changePage(1)}>{t('admin.berikutnya')}</Button>
			</div>
		{/if}
	{/if}
</div>

<!-- Add Modal -->
{#if showAddModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeAddModal} role="dialog" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="modal-header">
				<h2>Tambah Pendaftaran</h2>
				<Button class="modal-close" onclick={closeAddModal}>✕</Button>
			</div>
			<div class="modal-body">
				<div class="form-group">
<Select label="Siswa" bind:value={addUserId} options={users.map((u) => ({ value: u.id, label: `${u.display_name || u.username} (${u.email || '-'})` }))} />
				</div>
				<div class="form-group">
<Select label="Course Offering" bind:value={addOfferingId} options={offerings.map((o) => ({ value: o.id, label: `${o.name} (${o.code || '-'})` }))} />
				</div>
				{#if submitError}
					<div class="submit-error">{submitError}</div>
				{/if}
			</div>
			<div class="modal-footer">
				<Button variant="ghost" onclick={closeAddModal}>{t('common.cancel')}</Button>
				<Button onclick={handleAddEnrollment} disabled={submitting || !addUserId || !addOfferingId}>
					{submitting ? 'Mendaftarkan...' : 'Daftarkan'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1000px; }
	h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { font-size: 13px; color: var(--text-secondary); margin: 4px 0 0; }
	.page-header {
		display: flex; justify-content: space-between; align-items: flex-start;
		margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
	}
	.header-actions { display: flex; gap: 8px; }

	.filters {
		display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap;
	}
	.search-box {
		display: flex; gap: 8px; flex: 1; min-width: 200px;
	}
	.search-input, .select-input {
		padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit;
	}
	.search-input { flex: 1; }
	.search-input:focus, .select-input:focus { border-color: var(--accent); outline: none; }
	.filter-selects { display: flex; gap: 8px; }

	.table-wrapper {
		overflow-x: auto; border: 1px solid var(--border); border-radius: 10px;
	}

	.pagination {
		display: flex; justify-content: center; align-items: center;
		gap: 16px; margin-top: 16px;
	}
	.page-info { font-size: 13px; color: var(--text-secondary); }

	.loading-state, .error-state, .empty-state {
		padding: 40px 20px; text-align: center; color: var(--text-secondary); font-size: 14px;
	}
	.error-state { color: var(--danger); }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6);
		display: flex; align-items: center; justify-content: center; z-index: 100;
		backdrop-filter: blur(4px);
	}
	.modal-content {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 14px; width: 480px; max-width: 90vw; max-height: 80vh; overflow: auto;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 16px 20px; border-bottom: 1px solid var(--border);
	}
	.modal-header h2 { margin: 0; font-size: 16px; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; }
	.modal-body { padding: 20px; }
	.modal-footer {
		display: flex; justify-content: flex-end; gap: 8px;
		padding: 12px 20px; border-top: 1px solid var(--border);
	}
	.form-group { margin-bottom: 16px; }
	.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
	.form-group .select-input { width: 100%; padding: 8px 12px; }
	.submit-error { padding: 8px 12px; background: var(--danger-bg, rgba(231,76,60,0.1)); color: #ef4444; border-radius: 8px; font-size: 13px; }
</style>
