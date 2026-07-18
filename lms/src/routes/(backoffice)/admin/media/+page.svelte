<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Modal, Input, Alert, EmptyState, Loading, SearchInput, Select } from '$lib/components/ui';

	interface MediaFile {
		id: string;
		filename: string;
		original_name: string;
		mime_type: string;
		size: number;
		url: string;
		key: string;
		uploaded_by: string | null;
		lesson_id: string | null;
		course_offering_id: string | null;
		created_at: string;
	}

	let files = $state<MediaFile[]>([]);
	let loading = $state(true);
	let error = $state('');
	let total = $state(0);
	let page = $state(1);
	let totalPages = $state(1);
	let searchQuery = $state('');
	let typeFilter = $state('');
	let uploading = $state(false);
	let uploadError = $state('');
	let uploadSuccess = $state('');
	let showUploadModal = $state(false);
	let deleteId = $state<string | null>(null);
	let deleting = $state(false);
	let previewFile = $state<MediaFile>(null!);
	let showPreviewModal = $state(false);
	let copiedId = $state<string>('');

	const limit = 20;
	const typeOptions = [
		{ value: '', label: 'Semua Tipe' },
		{ value: 'image', label: 'Gambar' },
		{ value: 'pdf', label: 'PDF' },
		{ value: 'video', label: 'Video' },
		{ value: 'document', label: 'Dokumen' },
	];

	onMount(() => {
		if (browser) loadFiles();
	});

	async function loadFiles() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			params.set('limit', String(limit));
			if (searchQuery) params.set('search', searchQuery);
			if (typeFilter) params.set('type', typeFilter);
			const res = await fetch(`/api/admin/media?${params}`);
			const json = await res.json();
			if (json.success) {
				files = json.data || [];
				total = json.total || 0;
				if (json.pagination) {
					totalPages = json.pagination.totalPages || 1;
				}
			} else {
				error = json.error || 'Gagal memuat media';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function doSearch() {
		page = 1;
		loadFiles();
	}

	function prevPage() {
		if (page > 1) { page--; loadFiles(); }
	}
	function nextPage() {
		if (page < totalPages) { page++; loadFiles(); }
	}

	function isImage(mime: string): boolean {
		return mime.startsWith('image/');
	}
	function isVideo(mime: string): boolean {
		return mime.startsWith('video/');
	}
	function isPdf(mime: string): boolean {
		return mime === 'application/pdf';
	}

	function getFileIcon(mime: string): string {
		if (isImage(mime)) return '🖼️';
		if (isVideo(mime)) return '🎬';
		if (isPdf(mime)) return '📄';
		return '📎';
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '—';
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	async function doUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const fileList = input.files;
		if (!fileList || fileList.length === 0) return;

		uploading = true;
		uploadError = '';
		uploadSuccess = '';
		try {
			const formData = new FormData();
			formData.append('file', fileList[0]);
			const res = await fetch('/api/admin/media/upload', {
				method: 'POST',
				body: formData,
			});
			const json = await res.json();
			if (json.success) {
				uploadSuccess = `File "${fileList[0].name}" berhasil diupload`;
				loadFiles();
				input.value = '';
			} else {
				uploadError = json.error || 'Gagal upload';
			}
		} catch {
			uploadError = 'Gagal terhubung ke server';
		} finally {
			uploading = false;
		}
	}

	async function confirmDelete(id: string) {
		if (!confirm('Hapus file ini? Tindakan tidak bisa dibatalkan.')) return;
		deleting = true;
		deleteId = id;
		try {
			const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				files = files.filter(f => f.id !== id);
				total--;
			} else {
				alert(json.error || 'Gagal hapus');
			}
		} catch {
			alert('Gagal terhubung ke server');
		} finally {
			deleting = false;
			deleteId = null;
		}
	}

	function openPreview(file: MediaFile) {
		previewFile = file;
		showPreviewModal = true;
	}

	async function copyUrl(url: string, id: string) {
		try {
			await navigator.clipboard.writeText(url);
			copiedId = id;
			setTimeout(() => { copiedId = ''; }, 2000);
		} catch {
			// fallback
		}
	}

	function getPreviewUrl(file: MediaFile): string {
		if (file.url.startsWith('http')) return file.url;
		return file.url;
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="media-page">
	<div class="page-header">
		<div>
			<h1>🖼️ Media Library</h1>
			<p class="page-desc">Upload dan kelola file gambar, PDF, video untuk konten pembelajaran</p>
		</div>
		<div class="header-actions">
			<Button onclick={() => document.getElementById('file-upload')?.click()} loading={uploading}>
				+ Upload File
			</Button>
<Input  />
				id="file-upload"
				type="file"
				class="hidden-input"
				onchange={doUpload}
				accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
			/>
		</div>
	</div>

	{#if uploadSuccess}
		<Alert variant="success">{uploadSuccess}</Alert>
	{/if}
	{#if uploadError}
		<Alert variant="danger">{uploadError}</Alert>
	{/if}

	<div class="filter-bar">
		<SearchInput bind:value={searchQuery} placeholder="Cari file..." oninput={doSearch} />
		<Select options={typeOptions} bind:value={typeFilter} onchange={doSearch} />
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button onclick={loadFiles}>{t('common.retry')}</Button>
		</div>
	{:else if files.length === 0}
		<EmptyState icon="📁" title="Belum ada file" description="Upload file pertama anda" />
	{:else}
		<div class="media-grid">
			{#each files as file (file.id)}
				<div class="media-card" onclick={() => openPreview(file)}>
					<div class="media-thumb">
						{#if isImage(file.mime_type)}
							<img src={getPreviewUrl(file)} alt={file.original_name} class="thumb-img" loading="lazy" />
						{:else}
							<div class="file-icon">{getFileIcon(file.mime_type)}</div>
						{/if}
					</div>
					<div class="media-info">
						<p class="media-name" title={file.original_name}>{file.original_name}</p>
						<p class="media-meta">
							<Badge variant="default">{file.mime_type.split('/')[0]}</Badge>
							<span class="media-size">{formatSize(file.size)}</span>
						</p>
						<p class="media-date">{formatDate(file.created_at)}</p>
					</div>
					<div class="media-actions" onclick={(e) => e.stopPropagation()}>
						<Button size="sm" variant="ghost" onclick={() => copyUrl(getPreviewUrl(file), file.id)}>
							{copiedId === file.id ? '✅' : '📋'}
						</Button>
						<Button size="sm" variant="danger" onclick={() => confirmDelete(file.id)} loading={deleting && deleteId === file.id}>
							🗑️
						</Button>
					</div>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<Button size="sm" onclick={prevPage} disabled={page <= 1}>{t('admin.prev')}</Button>
				<span class="page-info">Halaman {page} dari {totalPages} ({total} total)</span>
				<Button size="sm" onclick={nextPage} disabled={page >= totalPages}>{t('admin.next_page')}</Button>
			</div>
		{/if}
	{/if}
</div>

{#if showPreviewModal && previewFile}
	<Modal
		open={showPreviewModal}
		title={`📁 ${previewFile.original_name}`}
		onclose={() => showPreviewModal = false}
	>
		<div class="preview-content">
			{#if isImage(previewFile.mime_type)}
				<img src={getPreviewUrl(previewFile)} alt={previewFile.original_name} class="preview-img" />
			{:else if isVideo(previewFile.mime_type)}
				<video controls class="preview-video">
					<source src={getPreviewUrl(previewFile)} type={previewFile.mime_type} />
				</video>
			{:else if isPdf(previewFile.mime_type)}
				<iframe src={getPreviewUrl(previewFile)} class="preview-pdf"></iframe>
			{:else}
				<div class="preview-file">
					<span class="preview-icon">{getFileIcon(previewFile.mime_type)}</span>
					<p>{previewFile.original_name}</p>
				</div>
			{/if}
			<div class="preview-details">
				<div class="detail-row"><span>{t('admin.tipe')}</span><span>{previewFile.mime_type}</span></div>
				<div class="detail-row"><span>Ukuran</span><span>{formatSize(previewFile.size)}</span></div>
				<div class="detail-row"><span>Filename</span><span class="detail-code">{previewFile.filename}</span></div>
				<div class="detail-row"><span>Diupload</span><span>{formatDate(previewFile.created_at)}</span></div>
			</div>
		</div>
		{#snippet footer()}
			<Button variant="primary" onclick={() => copyUrl(getPreviewUrl(previewFile), previewFile.id)}>
				{copiedId === previewFile.id ? '✅ Tersalin!' : '📋 Salin URL'}
			</Button>
			<Button variant="secondary" onclick={() => showPreviewModal = false}>{t('common.close')}</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.media-page { max-width: 1100px; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		gap: 16px;
		flex-wrap: wrap;
	}
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.page-desc { color: #8a8f98; font-size: 14px; margin: 0; }
	.header-actions { display: flex; gap: 8px; }
	.hidden-input { display: none; }
	.filter-bar {
		display: flex;
		gap: 12px;
		margin-bottom: 20px;
		align-items: flex-end;
	}
	.error-state { text-align: center; padding: 40px; color: #ef4444; }
	.error-state p { margin-bottom: 12px; }

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
	}
	.media-card {
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 10px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		flex-direction: column;
	}
	.media-card:hover {
		border-color: rgba(94,106,210,0.3);
		background: rgba(255,255,255,0.04);
	}
	.media-thumb {
		height: 140px;
		background: rgba(0,0,0,0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.file-icon { font-size: 40px; opacity: 0.6; }
	.media-info { padding: 10px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
	.media-name {
		font-size: 13px;
		font-weight: 500;
		color: #f7f8f8;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.media-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
	.media-size { color: #8a8f98; }
	.media-date { font-size: 11px; color: #62666d; margin: 0; }
	.media-actions {
		display: flex;
		gap: 4px;
		padding: 6px 12px;
		border-top: 1px solid rgba(255,255,255,0.04);
		justify-content: flex-end;
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-top: 24px;
	}
	.page-info { font-size: 13px; color: #8a8f98; }

	.preview-content { display: flex; flex-direction: column; gap: 16px; }
	.preview-img { max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 6px; }
	.preview-video { max-width: 100%; max-height: 300px; border-radius: 6px; }
	.preview-pdf { width: 100%; height: 300px; border: none; border-radius: 6px; }
	.preview-file { text-align: center; padding: 20px; }
	.preview-icon { font-size: 48px; display: block; margin-bottom: 8px; }
	.preview-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: rgba(0,0,0,0.2);
		padding: 12px;
		border-radius: 8px;
	}
	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
	}
	.detail-row span:first-child { color: #8a8f98; }
	.detail-code {
		font-family: monospace;
		font-size: 12px;
		word-break: break-all;
		max-width: 200px;
		text-align: right;
	}
</style>
