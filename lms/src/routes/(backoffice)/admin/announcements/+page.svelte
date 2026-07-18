<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Badge, Modal, Input, Textarea, Select, EmptyState, Alert } from '$lib/components/ui';

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

	let announcements = $state<Announcement[]>(data.announcements);
	let offerings = $state<Offering[]>(data.offerings);

	let selectedOfferingId = $state('');

	let showCreateModal = $state(false);
	let createTitle = $state('');
	let createBody = $state('');
	let createPriority = $state('normal');
	let createOfferingId = $state('');
	let submitting = $state(false);
	let error = $state('');
	let success = $state('');

	let deletingId = $state<string | null>(null);

	let filteredAnnouncements = $derived(
		selectedOfferingId
			? announcements.filter(a => a.course_offering_id === selectedOfferingId)
			: announcements
	);

	const offeringOptions = $derived(
		offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` }))
	);

	const priorityOptions = [
		{ value: 'low', label: 'ℹ️ Low' },
		{ value: 'normal', label: '📌 Normal' },
		{ value: 'high', label: '🔥 High' },
		{ value: 'urgent', label: '🔴 Urgent' },
	];

	const filterOptions = $derived([
		{ value: '', label: 'Semua Kelas' },
		...offeringOptions,
	]);

	function priorityBadgeVariant(p: string): 'danger' | 'warning' | 'info' | 'default' {
		if (p === 'urgent') return 'danger';
		if (p === 'high') return 'warning';
		if (p === 'low') return 'default';
		return 'info';
	}

	function priorityLabel(p: string): string {
		if (p === 'urgent') return '🔴 Urgent';
		if (p === 'high') return '🔥 Penting';
		if (p === 'low') return 'ℹ️ Info';
		return '📌 Normal';
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

	function confirmDelete(id: string) {
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
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="admin-announcements">
	<div class="page-header">
		<div>
			<h1>📢 Pengumuman</h1>
			<p class="page-desc">{t('admin.kelola_pengumuman')}</p>
		</div>
		<Button onclick={openCreate}>➕ Buat Pengumuman</Button>
	</div>

	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}
	{#if error}
		<Alert variant="error">{error}</Alert>
	{/if}

	<!-- Filter -->
	<div class="filter-bar">
		<Select options={filterOptions} bind:value={selectedOfferingId} />
		<span class="filter-count">{filteredAnnouncements.length} pengumuman</span>
	</div>

	<!-- List -->
	<div class="announcements-list">
		{#if filteredAnnouncements.length === 0}
			<EmptyState title="Belum Ada Pengumuman" description="Belum ada pengumuman yang dibuat." />
		{:else}
			{#each filteredAnnouncements as ann (ann.id)}
				<div class="announcement-card">
					<div class="ann-header">
						<div class="ann-info">
							<div class="ann-title-row">
								<h2>{ann.title}</h2>
								<Badge variant={priorityBadgeVariant(ann.priority)}>{priorityLabel(ann.priority)}</Badge>
							</div>
							<div class="ann-meta">
								<span>📖 {offerings.find(o => o.id === ann.course_offering_id)?.name || ann.course_offering_id.slice(0, 8)}</span>
								<span>✍️ {ann.creator_name || 'Admin'}</span>
								<span>🕐 {formatDate(ann.created_at)}</span>
							</div>
						</div>
						<Button variant="ghost" onclick={() => confirmDelete(ann.id)} title={t('common.delete')}>🗑️</Button>
					</div>
					<div class="ann-body">{ann.body}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<Modal open={showCreateModal} title="Buat Pengumuman Baru" onclose={() => showCreateModal = false}>
		<Select label="Kelas" options={offeringOptions} bind:value={createOfferingId} />
		<Input label="Judul" bind:value={createTitle} placeholder="Judul pengumuman" />
		<Textarea label="Isi Pengumuman" bind:value={createBody} placeholder="Tulis pengumuman..." rows={5} />
		<Select label="Prioritas" options={priorityOptions} bind:value={createPriority} />

		{#snippet footer()}
			<Button variant="secondary" onclick={() => showCreateModal = false} disabled={submitting}>{t('common.cancel')}</Button>
			<Button onclick={createAnnouncement} disabled={submitting}>
				{submitting ? 'Menyimpan...' : '📢 Publikasikan'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<!-- Delete Confirmation -->
{#if deletingId}
	<Modal open={!!deletingId} title="Hapus Pengumuman?" onclose={cancelDelete}>
		<p>{t('common.confirm_action')}</p>

		{#snippet footer()}
			<Button variant="secondary" onclick={cancelDelete}>{t('common.cancel')}</Button>
			<Button variant="danger" onclick={doDelete}>🗑️ Hapus</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.admin-announcements { max-width: 900px; }

	h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
	}

	.filter-bar {
		display: flex;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 20px;
	}
	.filter-count { font-size: 13px; color: var(--text-secondary); }

	.announcements-list { display: flex; flex-direction: column; gap: 12px; }
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
	.ann-info { flex: 1; }
	.ann-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}
	.ann-title-row h2 { font-size: 1rem; margin: 0; font-weight: 600; }
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
</style>
