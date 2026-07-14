<script lang="ts">
	import { page } from '$app/stores';

	interface Announcement {
		id: string;
		title: string;
		body: string;
		priority: string;
		created_by: string;
		creator_name: string | null;
		course_offering_id: string;
		created_at: string;
		updated_at: string;
	}

	interface Offering {
		id: string;
		name: string;
		code: string;
	}

	let { data }: {
		data: {
			announcements: Announcement[];
			offerings: Offering[];
		}
	} = $props();

	// Load data passed from server
	let announcements = $state<Announcement[]>(data.announcements);
	let offerings = $state<Offering[]>(data.offerings);

	// Filter state
	let selectedOfferingId = $state('');

	// Create modal state
	let showCreateModal = $state(false);
	let createTitle = $state('');
	let createBody = $state('');
	let createPriority = $state('normal');
	let createOfferingId = $state('');
	let submitting = $state(false);
	let error = $state('');
	let success = $state('');

	// Delete state
	let deletingId = $state<string | null>(null);

	let filteredAnnouncements = $derived(
		selectedOfferingId
			? announcements.filter(a => a.course_offering_id === selectedOfferingId)
			: announcements
	);

	function priorityConfig(p: string) {
		if (p === 'urgent') return { cls: 'badge-urgent', label: '🔴 Urgent' };
		if (p === 'high') return { cls: 'badge-high', label: '🔥 Penting' };
		if (p === 'low') return { cls: 'badge-low', label: 'ℹ️ Info' };
		return { cls: 'badge-normal', label: '📌 Normal' };
	}

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});
		} catch { return d; }
	}

	function openCreate() {
		createTitle = '';
		createBody = '';
		createPriority = 'normal';
		createOfferingId = offerings.length > 0 ? offerings[0].id : '';
		error = '';
		success = '';
		showCreateModal = true;
	}

	async function createAnnouncement() {
		if (!createTitle.trim() || !createBody.trim() || !createOfferingId) {
			error = 'Title, body, and offering are required';
			return;
		}
		submitting = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/api/admin/announcements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: createTitle.trim(),
					body: createBody.trim(),
					priority: createPriority,
					course_offering_id: createOfferingId,
				}),
			});
			const json = await res.json();
			if (json.success) {
				announcements = [json.data, ...announcements];
				success = 'Pengumuman berhasil dibuat';
				showCreateModal = false;
			} else {
				error = json.error || 'Gagal membuat pengumuman';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
		submitting = false;
	}

	async function confirmDelete(id: string) {
		deletingId = id;
	}

	async function doDelete() {
		if (!deletingId) return;
		try {
			const res = await fetch(`/api/admin/announcements/${deletingId}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (json.success) {
				announcements = announcements.filter(a => a.id !== deletingId);
				success = 'Pengumuman berhasil dihapus';
			} else {
				error = json.error || 'Gagal menghapus';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
		deletingId = null;
	}

	function cancelDelete() {
		deletingId = null;
	}
</script>

<svelte:head>
	<title>Pengumuman — Admin</title>
</svelte:head>

<div class="admin-announcements">
	<div class="page-header">
		<div>
			<h1>📢 Pengumuman</h1>
			<p class="page-desc">Kelola pengumuman untuk semua kelas</p>
		</div>
		<button class="btn-primary" onclick={openCreate}>➕ Buat Pengumuman</button>
	</div>

	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}
	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	<!-- Filter -->
	<div class="filter-bar">
		<label>
			<span>Filter Kelas</span>
			<select bind:value={selectedOfferingId}>
				<option value="">Semua Kelas</option>
				{#each offerings as offering (offering.id)}
					<option value={offering.id}>{offering.name} ({offering.code})</option>
				{/each}
			</select>
		</label>
		<span class="filter-count">{filteredAnnouncements.length} pengumuman</span>
	</div>

	<!-- List -->
	<div class="announcements-list">
		{#if filteredAnnouncements.length === 0}
			<div class="empty">Belum ada pengumuman</div>
		{:else}
			{#each filteredAnnouncements as ann (ann.id)}
				<div class="announcement-card">
					<div class="ann-header">
						<div class="ann-info">
							<div class="ann-title-row">
								<h2>{ann.title}</h2>
								<span class="priority-badge {priorityConfig(ann.priority).cls}">{priorityConfig(ann.priority).label}</span>
							</div>
							<div class="ann-meta">
								<span>📖 {offerings.find(o => o.id === ann.course_offering_id)?.name || ann.course_offering_id.slice(0, 8)}</span>
								<span>✍️ {ann.creator_name || 'Admin'}</span>
								<span>🕐 {formatDate(ann.created_at)}</span>
							</div>
						</div>
						<button class="btn-delete" onclick={() => confirmDelete(ann.id)} title="Hapus">🗑️</button>
					</div>
					<div class="ann-body">{ann.body}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div class="modal-overlay" onclick={() => !submitting && (showCreateModal = false)} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Buat Pengumuman Baru</h2>
				<button class="modal-close" onclick={() => showCreateModal = false}>✕</button>
			</div>
			<div class="modal-body">
				<label class="form-group">
					<span>Kelas</span>
					<select bind:value={createOfferingId}>
						{#each offerings as offering (offering.id)}
							<option value={offering.id}>{offering.name} ({offering.code})</option>
						{/each}
					</select>
				</label>
				<label class="form-group">
					<span>Judul</span>
					<input type="text" bind:value={createTitle} placeholder="Judul pengumuman" />
				</label>
				<label class="form-group">
					<span>Isi Pengumuman</span>
					<textarea bind:value={createBody} placeholder="Tulis pengumuman..." rows="5"></textarea>
				</label>
				<label class="form-group">
					<span>Prioritas</span>
					<select bind:value={createPriority}>
						<option value="low">ℹ️ Low</option>
						<option value="normal">📌 Normal</option>
						<option value="high">🔥 High</option>
						<option value="urgent">🔴 Urgent</option>
					</select>
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => showCreateModal = false} disabled={submitting}>Batal</button>
				<button class="btn-primary" onclick={createAnnouncement} disabled={submitting}>
					{submitting ? 'Menyimpan...' : '📢 Publikasikan'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation -->
{#if deletingId}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div class="modal-overlay" onclick={cancelDelete} role="dialog">
		<div class="modal modal-confirm" onclick={(e) => e.stopPropagation()}>
			<h2>Hapus Pengumuman?</h2>
			<p>Tindakan ini tidak dapat dibatalkan.</p>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={cancelDelete}>Batal</button>
				<button class="btn-danger" onclick={doDelete}>🗑️ Hapus</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.admin-announcements {
		max-width: 900px;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.page-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
	}

	.alert {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
	}

	.alert-success {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.filter-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
	}

	.filter-bar label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.filter-bar select {
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 0.85rem;
		min-width: 280px;
	}

	.filter-count {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 16px;
	}

	.announcements-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.announcement-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}

	.ann-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.ann-info {
		flex: 1;
	}

	.ann-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	.ann-title-row h2 {
		font-size: 1rem;
		margin: 0;
		font-weight: 600;
	}

	.priority-badge {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
		white-space: nowrap;
	}

	.badge-urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
	.badge-high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
	.badge-normal { background: var(--accent-dim); color: var(--accent); }
	.badge-low { background: var(--surface-hover); color: var(--text-secondary); }

	.ann-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.ann-body {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: var(--text);
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.btn-delete {
		background: none;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		opacity: 0.5;
		padding: 4px;
		transition: opacity 0.15s;
		flex-shrink: 0;
	}

	.btn-delete:hover {
		opacity: 1;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
		border: none;
		padding: 0.5rem 1.2rem;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-primary:disabled {
		opacity: 0.5;
	}

	.btn-cancel {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		padding: 0.5rem 1.2rem;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-danger {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
		padding: 0.5rem 1.2rem;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: var(--surface);
		border-radius: 16px;
		width: 100%;
		max-width: 520px;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0,0,0,0.3);
	}

	.modal-confirm {
		max-width: 400px;
		padding: 24px;
	}

	.modal-confirm h2 {
		font-size: 18px;
		margin-bottom: 8px;
	}

	.modal-confirm p {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 20px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px 0;
	}

	.modal-header h2 {
		font-size: 18px;
		margin: 0;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 18px;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 4px;
	}

	.modal-body {
		padding: 16px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.6rem 0.8rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-family: inherit;
		font-size: 0.85rem;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 24px;
		border-top: 1px solid var(--border);
	}
</style>
