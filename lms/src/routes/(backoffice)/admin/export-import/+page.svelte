<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, Alert, Button } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');

	// Backup state
	let creatingBackup = $state(false);
	let backupResult = $state<string | null>(null);
	let backupError = $state('');

	// Restore state
	let restoring = $state(false);
	let restoreResult = $state<any>(null);
	let restoreError = $state('');

	// Backup list
	let backups = $state<any[]>([]);
	let loadingBackups = $state(false);
	let deleting = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;
		loadBackups();
		loading = false;
	});

	async function loadBackups() {
		loadingBackups = true;
		try {
			const res = await fetch('/api/admin/export-import?prefix=backups/');
			const json = await res.json();
			if (json.success) backups = json.data || [];
		} catch { error = 'Gagal memuat daftar backup'; }
		finally { loadingBackups = false; }
	}

	async function createBackup() {
		creatingBackup = true;
		backupError = '';
		backupResult = null;
		try {
			const res = await fetch('/api/admin/export-import/backup', { method: 'POST' });
			const json = await res.json();
			if (json.success) {
				backupResult = `Backup berhasil: ${json.data.tables} tabel, ${json.data.rows} baris`;
				await loadBackups();
			} else {
				backupError = json.error || 'Gagal membuat backup';
			}
		} catch { backupError = 'Gagal membuat backup'; }
		finally { creatingBackup = false; }
	}

	async function downloadBackup(key: string) {
		try {
			const res = await fetch(`/api/admin/export-import/${encodeURIComponent(key)}`);
			if (!res.ok) throw new Error('Download failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = key.split('/').pop() || 'backup.json';
			a.click();
			URL.revokeObjectURL(url);
		} catch { backupError = 'Gagal mendownload backup'; }
	}

	async function deleteBackup(key: string) {
		if (!confirm(`Hapus backup ${key.split('/').pop()}?`)) return;
		deleting = key;
		try {
			const res = await fetch(`/api/admin/export-import/${encodeURIComponent(key)}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) await loadBackups();
			else backupError = json.error || 'Gagal menghapus backup';
		} catch { backupError = 'Gagal menghapus backup'; }
		finally { deleting = null; }
	}

	async function restoreBackup(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		restoring = true;
		restoreError = '';
		restoreResult = null;

		const form = new FormData();
		form.append('file', file);
		try {
			const res = await fetch('/api/admin/export-import/restore', { method: 'POST', body: form });
			const json = await res.json();
			if (json.success) {
				restoreResult = json.data;
			} else {
				restoreError = json.error || 'Gagal restore';
			}
		} catch { restoreError = 'Gagal mengupload file restore'; }
		finally { restoring = false; input.value = ''; }
	}
</script>

<svelte:head>
	<title>Export/Import Backup — Admin</title>
</svelte:head>

<div class="page">
	<h1>💾 Backup & Restore Data</h1>
	<p class="subtitle">Buat backup seluruh data tenant, download, atau restore dari file backup</p>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- Backup Section -->
	<Card class="section-card">
		<CardContent>
			<h2>Buat Backup Baru</h2>
			<p class="desc">Ekspor semua data tenant saat ini sebagai file JSON terkompresi ke R2 storage.</p>
			<Button onclick={createBackup} disabled={creatingBackup}>
				{creatingBackup ? 'Membuat backup...' : '📦 Backup Sekarang'}
			</Button>
			{#if backupError}
				<Alert variant="danger">{backupError}</Alert>
			{/if}
			{#if backupResult}
				<Alert variant="success">{backupResult}</Alert>
			{/if}
		</CardContent>
	</Card>

	<!-- Backup List -->
	<Card class="section-card">
		<CardContent>
			<h2>Daftar Backup</h2>
			{#if loadingBackups}
				<p class="loading-text">Memuat...</p>
			{:else if backups.length === 0}
				<p class="empty-text">Belum ada backup. Buat backup baru di atas.</p>
			{:else}
				<div class="backup-list">
					{#each backups as b}
						<div class="backup-item">
							<div class="backup-info">
								<span class="backup-name">{b.key.split('/').pop()}</span>
								<span class="backup-meta">{(b.size / 1024).toFixed(1)} KB • {new Date(b.uploaded).toLocaleString('id-ID')}</span>
							</div>
							<div class="backup-actions">
								<Button size="sm" onclick={() => downloadBackup(b.key)}>⬇ Download</Button>
								<Button size="sm" variant="danger" onclick={() => deleteBackup(b.key)} disabled={deleting === b.key}>
									{deleting === b.key ? '...' : '🗑 Hapus'}
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			<Button size="sm" onclick={loadBackups} disabled={loadingBackups}>↻ Refresh</Button>
		</CardContent>
	</Card>

	<!-- Restore Section -->
	<Card class="section-card">
		<CardContent>
			<h2>Restore Data</h2>
			<p class="desc">Upload file backup JSON untuk mengembalikan data ke tenant saat ini. Data yang sudah ada akan dilewati (INSERT OR IGNORE).</p>
			<input
				type="file"
				accept=".json,.json.gz"
				onchange={restoreBackup}
				disabled={restoring}
				class="file-input"
			/>
			{#if restoring}
				<p class="loading-text">Merestore data...</p>
			{/if}
			{#if restoreError}
				<Alert variant="danger">{restoreError}</Alert>
			{/if}
			{#if restoreResult}
				<div class="restore-result">
					<Alert variant="success">Restore selesai!</Alert>
					<p class="result-text">Total tabel: {restoreResult.totalTables}</p>
					<p class="result-text">Baris diproses: {restoreResult.totalAttempted}</p>
					<p class="result-text">Baris diinsert: {restoreResult.totalInserted}</p>
					{#if restoreResult.details}
						<details>
							<summary>Detail per tabel</summary>
							{#each Object.entries(restoreResult.details) as [table, info]}
								<div class="table-detail">
									<strong>{table}</strong>: {info.inserted}/{info.attempted} inserted
									{#if info.errors?.length}
										<p class="error-detail">{info.errors.length} error</p>
									{/if}
								</div>
							{/each}
						</details>
					{/if}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<style>
	.page { max-width: 800px; }
	h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
	h2 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
	.desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

	.section-card { margin-bottom: 16px; }
	:global(.section-card) :global(.card-content) { display: flex; flex-direction: column; gap: 12px; padding: 20px; }

	.loading-text { color: var(--text-secondary); padding: 8px 0; }
	.empty-text { color: var(--text-secondary); padding: 8px 0; }

	.backup-list { display: flex; flex-direction: column; gap: 8px; }
	.backup-item {
		display: flex; justify-content: space-between; align-items: center;
		padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 6px;
		border: 1px solid rgba(255,255,255,0.06);
	}
	.backup-info { display: flex; flex-direction: column; gap: 2px; }
	.backup-name { font-size: 13px; font-weight: 500; color: var(--text); }
	.backup-meta { font-size: 11px; color: var(--text-secondary); }
	.backup-actions { display: flex; gap: 6px; }

	.file-input { padding: 8px; font-size: 13px; color: var(--text); }

	.restore-result { margin-top: 8px; }
	.result-text { font-size: 13px; margin: 2px 0; }
	.table-detail { font-size: 12px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
	.error-detail { color: #f87171; font-size: 11px; }

	@media (max-width: 768px) {
		.backup-item { flex-direction: column; align-items: flex-start; gap: 8px; }
		.backup-actions { align-self: flex-end; }
	}
</style>
