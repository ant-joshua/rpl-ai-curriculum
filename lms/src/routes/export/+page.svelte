<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules } from '$lib/stores/modules';
	import { api, getDeviceId } from '$lib/utils/api';

	let lastExportDate = $state<string | null>(null);
	let exportStats = $state<{ totalSessionsCompleted: number; modulesCompleted: number } | null>(null);
	let loading = $state(true);

	let totalCompleted = $derived(progress.getOverallProgress() > 0);
	let modulesDone = $derived(progress.completedCount);
	let allDone = $derived(modulesDone >= modules.length);

	onMount(async () => {
		try {
			const res = await api<{ exportedAt: string; stats: { totalSessionsCompleted: number; modulesCompleted: number }; lastExport: string | null }>('/api/export/progress');
			if (res.success && res.data) {
				lastExportDate = res.data.lastExport || res.data.exportedAt;
				exportStats = {
					totalSessionsCompleted: res.data.stats.totalSessionsCompleted,
					modulesCompleted: res.data.stats.modulesCompleted,
				};
			}
		} catch {
			// offline
		}
		loading = false;
	});

	function formatDate(iso: string): string {
		try {
			const d = new Date(iso + 'Z');
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
		} catch {
			return iso;
		}
	}

	function downloadCsv() {
		window.open('/api/export/progress?format=csv', '_blank');
	}

	function downloadJson() {
		window.open('/api/export/progress', '_blank');
	}

	function openCertificate() {
		window.open('/api/export/certificate', '_blank');
	}

	function printPlan() {
		window.print();
	}
</script>

<div class="export-page">
	<h1>📤 Export Data</h1>

	{#if !loading}
		<div class="info-card">
			<h2>Ringkasan</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Total Sesi Terselesaikan</span>
					<span class="info-value">{exportStats?.totalSessionsCompleted ?? progress.getOverallProgress()} / {modules.reduce((acc, m) => acc + m.sessions.length, 0)}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Modul Selesai</span>
					<span class="info-value">{exportStats?.modulesCompleted ?? progress.completedCount} / {modules.length}</span>
				</div>
				{#if lastExportDate}
					<div class="info-item">
						<span class="info-label">Terakhir Export</span>
						<span class="info-value">{formatDate(lastExportDate)}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="info-label">Eligible Sertifikat</span>
					<span class="info-value">{allDone ? '✅ Ya' : '❌ Belum'}</span>
				</div>
			</div>
		</div>
	{/if}

	<div class="actions-card">
		<h2>Opsi Export</h2>
		<div class="export-actions">
			<button class="export-btn csv" onclick={downloadCsv}>
				<span class="btn-icon">📊</span>
				<span>Download Progress CSV</span>
				<small>.csv</small>
			</button>
			<button class="export-btn json" onclick={downloadJson}>
				<span class="btn-icon">📄</span>
				<span>Download Progress JSON</span>
				<small>.json</small>
			</button>
			<button class="export-btn certificate" onclick={openCertificate} disabled={!allDone}>
				<span class="btn-icon">🎓</span>
				<span>Sertifikat</span>
				<small>{allDone ? 'Cetak' : 'Belum tersedia'}</small>
			</button>
			<button class="export-btn plan" onclick={printPlan}>
				<span class="btn-icon">📅</span>
				<span>Rencana Belajar</span>
				<small>Cetak</small>
			</button>
		</div>
	</div>

	{#if !allDone}
		<div class="note-card">
			<p>💡 Selesaikan semua <strong>{modules.length} modul</strong> untuk mendapatkan sertifikat kelulusan.</p>
			<div class="progress-mini">
				<div class="bar">
					<div class="fill" style="width: {Math.round((modulesDone / modules.length) * 100)}%"></div>
				</div>
				<span>{modulesDone}/{modules.length} modul</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.export-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
	}

	h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.info-card, .actions-card, .note-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.info-item {
		padding: 12px;
		background: var(--bg-secondary);
		border-radius: 10px;
	}

	.info-label {
		display: block;
		font-size: 11px;
		color: var(--text-secondary);
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.info-value {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
	}

	.export-actions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.export-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 20px 12px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.export-btn:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
		transform: translateY(-2px);
	}
	.export-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
	}
	.export-btn:disabled:hover {
		border-color: var(--border);
		background: var(--bg-secondary);
	}
	.btn-icon { font-size: 28px; }
	.export-btn small {
		font-size: 10px;
		font-weight: 400;
		color: var(--text-secondary);
	}

	.note-card {
		background: var(--accent-dim);
		border-color: var(--accent);
	}

	.note-card p {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}

	.progress-mini {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.progress-mini .bar {
		flex: 1;
		height: 8px;
		background: var(--bg-secondary);
		border-radius: 4px;
		overflow: hidden;
	}
	.progress-mini .fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 4px;
		transition: width 0.3s ease;
	}
	.progress-mini span {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: nowrap;
	}
</style>
