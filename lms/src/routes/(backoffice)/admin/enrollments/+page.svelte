<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, CardContent } from '$lib/components/ui';

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
</script>

<svelte:head>
	<title>Manajemen Pendaftaran — Admin</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>📋 Manajemen Pendaftaran</h1>
			<p class="subtitle">Total {totalEnrollments} pendaftaran</p>
		</div>
		<div class="header-actions">
			<Button variant="secondary" onclick={exportCsv}>📤 Export CSV</Button>
			<Button onclick={openAddModal}>+ Tambah Pendaftaran</Button>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="search-box">
			<input
				type="text"
				placeholder="Cari nama/email siswa..."
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && doSearch()}
				class="search-input"
			/>
			<Button variant="secondary" size="sm" onclick={doSearch}>🔍 Cari</Button>
		</div>
		<div class="filter-selects">
			<select bind:value={selectedOfferingId} onchange={() => { page = 1; loadData(); }} class="select-input">
				<option value="">Semua Offering</option>
				{#each offerings as o}
					<option value={o.id}>{o.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Table -->
	{#if loading}
		<Card><CardContent><div class="loading-state">Memuat data...</div></CardContent></Card>
	{:else if error}
		<Card><CardContent><div class="error-state">{error}</div></CardContent></Card>
	{:else if enrollments.length === 0}
		<Card><CardContent><div class="empty-state">Belum ada pendaftaran.</div></CardContent></Card>
	{:else}
		<div class="table-wrapper">
			<table class="enroll-table">
				<thead>
					<tr>
						<th>Siswa</th>
						<th>Email</th>
						<th>Kursus</th>
						<th>Status</th>
						<th>Tanggal Daftar</th>
						<th>Total Pendaftaran</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each enrollments as e}
						<tr>
							<td class="user-cell">
								<span class="user-name">{e.user_name || e.username || '-'}</span>
							</td>
							<td class="email-cell">{e.user_email || '-'}</td>
							<td>
								<span class="course-name">{e.offering_name || '-'}</span>
								{#if e.offering_code}
									<span class="course-code">{e.offering_code}</span>
								{/if}
							</td>
							<td>
								<Badge variant={statusBadge(e.status)}>{statusLabel(e.status)}</Badge>
							</td>
							<td class="date-cell">{formatDate(e.enrolled_at)}</td>
							<td class="center-cell">{e.user_enrollment_count || 0}</td>
							<td class="actions-cell">
								{#if confirmDelete === e.id}
									<div class="confirm-delete">
										<span class="confirm-text">Hapus?</span>
										<Button variant="danger" size="sm" onclick={() => handleDelete(e.id)} disabled={deleting}>
											{deleting ? '...' : 'Ya'}
										</Button>
										<Button variant="ghost" size="sm" onclick={() => confirmDelete = null}>Batal</Button>
									</div>
								{:else}
									<Button variant="ghost" size="sm" onclick={() => confirmDelete = e.id}>🗑️</Button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="pagination">
				<Button variant="secondary" size="sm" disabled={page <= 1} onclick={() => changePage(-1)}>← Sebelumnya</Button>
				<span class="page-info">Halaman {page} dari {totalPages}</span>
				<Button variant="secondary" size="sm" disabled={page >= totalPages} onclick={() => changePage(1)}>Berikutnya →</Button>
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
				<button class="modal-close" onclick={closeAddModal}>✕</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="add-user">Siswa</label>
					<select id="add-user" bind:value={addUserId} class="select-input">
						<option value="">— Pilih Siswa —</option>
						{#each users as u}
							<option value={u.id}>{u.display_name || u.username} ({u.email || '-'})</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="add-offering">Course Offering</label>
					<select id="add-offering" bind:value={addOfferingId} class="select-input">
						<option value="">— Pilih Offering —</option>
						{#each offerings as o}
							<option value={o.id}>{o.name} ({o.code || '-'})</option>
						{/each}
					</select>
				</div>
				{#if submitError}
					<div class="submit-error">{submitError}</div>
				{/if}
			</div>
			<div class="modal-footer">
				<Button variant="ghost" onclick={closeAddModal}>Batal</Button>
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
	.enroll-table {
		width: 100%; border-collapse: collapse; font-size: 14px;
	}
	.enroll-table th {
		padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600;
		color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;
		background: var(--surface); border-bottom: 1px solid var(--border);
	}
	.enroll-table td {
		padding: 10px 12px; border-bottom: 1px solid var(--border);
	}
	.enroll-table tr:last-child td { border-bottom: none; }
	.enroll-table tr:hover { background: rgba(255,255,255,0.02); }

	.user-name { font-weight: 600; }
	.email-cell { color: var(--text-secondary); font-size: 13px; }
	.course-name { font-weight: 500; }
	.course-code { display: block; font-size: 11px; color: var(--text-secondary); }
	.date-cell { color: var(--text-secondary); font-size: 13px; }
	.center-cell { text-align: center; }
	.actions-cell { white-space: nowrap; }
	.confirm-delete { display: flex; align-items: center; gap: 6px; }
	.confirm-text { font-size: 12px; color: var(--danger); font-weight: 600; }

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
	.submit-error { padding: 8px 12px; background: var(--danger-bg, rgba(231,76,60,0.1)); color: #e74c3c; border-radius: 8px; font-size: 13px; }
</style>
