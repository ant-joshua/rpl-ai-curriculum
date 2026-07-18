<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Alert, Button, Card, CardContent, Input } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');

	// Offerings list
	let offerings = $state<any[]>([]);
	let loadingOfferings = $state(false);

	// Export state
	let exporting = $state<string | null>(null);
	let exportError = $state('');

	// Import state
	let importFile = $state<File | null>(null);
	let importing = $state(false);
	let importResult = $state<any>(null);
	let importError = $state('');

	onMount(() => {
		if (!browser) return;
		loadOfferings();
		loading = false;
	});

	async function loadOfferings() {
		loadingOfferings = true;
		try {
			const res = await fetch('/api/admin/course-migration/offerings');
			const json = await res.json();
			if (json.success) offerings = json.data || [];
		} catch { error = 'Gagal memuat daftar course'; }
		finally { loadingOfferings = false; }
	}

	async function exportOffering(offeringId: string) {
		exporting = offeringId;
		exportError = '';
		try {
			const res = await fetch(`/api/admin/course-migration/export/offering/${offeringId}`, { method: 'POST' });
			if (!res.ok) {
				const err = await res.json().catch(() => ({ error: 'Export gagal' }));
				exportError = err.error || `HTTP ${res.status}`;
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `course-${offeringId.substring(0, 8)}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch { exportError = 'Gagal mengexport course'; }
		finally { exporting = null; }
	}

	async function importCourse(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importing = true;
		importError = '';
		importResult = null;

		const form = new FormData();
		form.append('file', file);
		try {
			const res = await fetch('/api/admin/course-migration/import', { method: 'POST', body: form });
			const json = await res.json();
			if (json.success) {
				importResult = json.data;
			} else {
				importError = json.error || 'Gagal import course';
			}
		} catch { importError = 'Gagal mengupload file'; }
		finally { importing = false; input.value = ''; }
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="page">
	<h1>📚 Migrasi Course</h1>
	<p class="subtitle">Ekspor course beserta seluruh kontennya atau impor ke tenant lain</p>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- Export Section -->
	<Card class="section-card">
		<CardContent>
			<h2>Ekspor Course</h2>
			<p class="desc">Pilih course offering untuk diekspor beserta lessons, content blocks, assessments, assignments, dan question bank.</p>

			{#if loadingOfferings}
				<p class="loading-text">Memuat daftar course...</p>
			{:else if offerings.length === 0}
				<p class="empty-text">Belum ada course offering.</p>
			{:else}
				<div class="offering-list">
					{#each offerings as o}
						<div class="offering-item">
							<div class="offering-info">
								<span class="offering-name">{o.name || o.course_title}</span>
								<span class="offering-meta">
									{o.course_title ? `${o.course_title} • ` : ''}
									{o.code || 'tanpa kode'} • {o.status}
								</span>
							</div>
							<Button size="sm" onclick={() => exportOffering(o.id)} disabled={exporting !== null}>
								{exporting === o.id ? 'Mengexport...' : '📥 Export'}
							</Button>
						</div>
					{/each}
				</div>
			{/if}
			{#if exportError}
				<Alert variant="danger">{exportError}</Alert>
			{/if}
		</CardContent>
	</Card>

	<!-- Import Section -->
	<Card class="section-card">
		<CardContent>
			<h2>Impor Course</h2>
			<p class="desc">Upload file JSON hasil ekspor course untuk diimpor ke tenant saat ini. ID akan digenerate baru, data lama tidak akan ditimpa.</p>
<Input  />
				type="file"
				accept=".json"
				onchange={importCourse}
				disabled={importing}
				class="file-input"
			/>
			{#if importing}
				<p class="loading-text">Mengimpor course...</p>
			{/if}
			{#if importError}
				<Alert variant="danger">{importError}</Alert>
			{/if}
			{#if importResult}
				<div class="import-result">
					<Alert variant="success">Import selesai!</Alert>
					<p class="result-text">Total baris diproses: {importResult.totalAttempted}</p>
					<p class="result-text">Baris diinsert: {importResult.totalInserted}</p>
					{#if importResult.offeringNewId}
						<p class="result-text">ID offering baru: <code>{importResult.offeringNewId}</code></p>
					{/if}
					{#if importResult.details}
						<details>
							<summary>Detail per tabel</summary>
							{#each Object.entries(importResult.details) as [table, info]}
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

	.offering-list { display: flex; flex-direction: column; gap: 8px; }
	.offering-item {
		display: flex; justify-content: space-between; align-items: center;
		padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 6px;
		border: 1px solid rgba(255,255,255,0.06);
	}
	.offering-info { display: flex; flex-direction: column; gap: 2px; }
	.offering-name { font-size: 13px; font-weight: 500; color: var(--text); }
	.offering-meta { font-size: 11px; color: var(--text-secondary); }

	.file-input { padding: 8px; font-size: 13px; }

	.import-result { margin-top: 8px; }
	.result-text { font-size: 13px; margin: 2px 0; }
	.result-text code { font-size: 11px; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 3px; }
	.table-detail { font-size: 12px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
	.error-detail { color: #f87171; font-size: 11px; }

	@media (max-width: 768px) {
		.offering-item { flex-direction: column; align-items: flex-start; gap: 8px; }
	}
</style>
