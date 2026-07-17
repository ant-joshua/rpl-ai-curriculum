<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Badge, Button, Card, CardContent, EmptyState, Loading } from '$lib/components/ui';

	let applications: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let filterStatus = $state('pending');
	let processingApp = $state<string | null>(null);

	onMount(() => {
		if (browser) loadApplications();
	});

	async function loadApplications() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/admin/instructor-applications?status=${filterStatus}`);
			const json = await res.json();
			if (json.success) applications = json.data || [];
			else error = json.error || 'Gagal memuat';
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function handleFilterChange(e: Event) {
		filterStatus = (e.target as HTMLSelectElement).value;
		loadApplications();
	}

	async function approveApplication(id: string) {
		processingApp = id;
		try {
			const res = await fetch('/api/admin/instructors/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ application_id: id, action: 'approved' }),
			});
			const json = await res.json();
			if (json.success) {
				applications = applications.filter(a => a.id !== id);
			} else {
				alert(json.error || 'Gagal menyetujui');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			processingApp = null;
		}
	}

	async function rejectApplication(id: string) {
		processingApp = id;
		try {
			const res = await fetch('/api/admin/instructors/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ application_id: id, action: 'rejected' }),
			});
			const json = await res.json();
			if (json.success) {
				applications = applications.filter(a => a.id !== id);
			} else {
				alert(json.error || 'Gagal menolak');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			processingApp = null;
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Pengajuan Instruktur — Admin</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Pengajuan Instruktur</h1>
			<p class="subtitle">Kelola pendaftaran instruktur baru</p>
		</div>
		<div class="filter-row">
			<select class="filter-select" value={filterStatus} onchange={handleFilterChange}>
				<option value="pending">Menunggu</option>
				<option value="approved">Disetujui</option>
				<option value="rejected">Ditolak</option>
			</select>
			<Button variant="secondary" onclick={loadApplications}>🔄 Refresh</Button>
		</div>
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Card>
			<CardContent>
				<div class="error-state">
					<p class="error-text">{error}</p>
					<Button onclick={loadApplications}>Coba Lagi</Button>
				</div>
			</CardContent>
		</Card>
	{:else if applications.length === 0}
		<EmptyState
			icon="📋"
			title="Tidak ada pengajuan"
			description={filterStatus === 'pending' ? 'Belum ada instruktur yang mendaftar.' : 'Tidak ada pengajuan dengan status ini.'}
		/>
	{:else}
		<div class="app-list">
			{#each applications as app}
				<Card>
					<CardContent>
						<div class="app-item">
							<div class="app-main">
								<div class="app-header">
									<span class="app-name">{app.user_name || app.user_email}</span>
									<span class="app-email">{app.user_email}</span>
								</div>
								<div class="app-meta">
									<span class="meta-date">📅 {formatDate(app.created_at)}</span>
								</div>
								{#if app.bio}
									<div class="app-bio">
										<strong>Bio:</strong>
										<p>{app.bio}</p>
									</div>
								{/if}
								{#if app.course_interests}
									<div class="app-interests">
										<strong>Minat Kursus:</strong>
										<p>{app.course_interests}</p>
									</div>
								{/if}
							</div>
							{#if app.status === 'pending'}
								<div class="app-actions">
									<Button
										variant="primary"
										disabled={processingApp === app.id}
										onclick={() => approveApplication(app.id)}
									>
										{processingApp === app.id ? 'Memproses...' : '✓ Setujui'}
									</Button>
									<Button
										variant="danger"
										disabled={processingApp === app.id}
										onclick={() => rejectApplication(app.id)}
									>
										✕ Tolak
									</Button>
								</div>
							{:else}
								<Badge variant={app.status === 'approved' ? 'success' : 'danger'}>
									{app.status === 'approved' ? 'Disetujui' : 'Ditolak'}
								</Badge>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 860px; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
		flex-wrap: wrap;
	}

	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.filter-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.filter-select {
		padding: 8px 12px;
		font-size: 13px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		outline: none;
	}

	.app-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.app-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.app-main { flex: 1; }

	.app-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 6px;
	}

	.app-name {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
	}

	.app-email {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.app-meta { margin-bottom: 8px; }

	.meta-date {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.app-bio, .app-interests {
		margin-bottom: 8px;
		font-size: 14px;
	}

	.app-bio strong, .app-interests strong {
		font-size: 12px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: 2px;
	}

	.app-bio p, .app-interests p {
		margin: 0;
		color: var(--text);
		line-height: 1.5;
	}

	.app-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
	}

	.error-state {
		text-align: center;
		padding: 20px;
	}

	.error-text {
		color: #ef4444;
		margin-bottom: 12px;
		font-size: 14px;
	}

	@media (max-width: 640px) {
		.app-item {
			flex-direction: column;
		}
		.app-actions {
			flex-direction: row;
			width: 100%;
		}
	}
</style>
