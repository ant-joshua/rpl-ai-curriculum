<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Modal, Input, Textarea, Select, Alert, Skeleton } from '$lib/components/ui';

	interface ContentBlock {
		id: string;
		type: string;
		title: string;
		body: string | null;
		body_html: string | null;
		meta: string;
		order_index: number;
		visibility: string;
		created_at: string;
		updated_at: string;
	}

	interface LessonContentBlock {
		id: string;
		lesson_id: string;
		content_block_id: string;
		order_index: number;
		type_override: string | null;
		content_type: string;
		content_title: string;
	}

	let lesson = $state<any>(null);
	let blocks = $state<ContentBlock[]>([]);
	let loading = $state(true);
	let error = $state('');
	let offeringId = $state('');
	let lessonId = $state('');

	// Content block form
	let showBlockModal = $state(false);
	let editingBlock = $state<ContentBlock | null>(null);
	let blTitle = $state('');
	let blType = $state('text');
	let blBody = $state('');
	let blSaving = $state(false);
	let blError = $state('');
	let blSuccess = $state('');

	let deletingBlId = $state<string | null>(null);
	let showPreview = $state(false);

	// Media picker modal
	let showMediaModal = $state(false);
	let mediaFiles = $state<any[]>([]);
	let mediaLoading = $state(false);

	onMount(() => {
		if (browser) {
			const pathParts = window.location.pathname.split('/');
			offeringId = pathParts[3];
			lessonId = pathParts[5];
			loadData();
		}
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [lessonRes, cbRes] = await Promise.all([
				fetch(`/api/admin/lessons/${lessonId}`),
				fetch(`/api/admin/lesson-content-blocks?lessonId=${lessonId}`),
			]);
			const lessonJson = await lessonRes.json();
			if (lessonJson.success) lesson = lessonJson.data;
			const cbJson = await cbRes.json();
			if (cbJson.success) {
				const lcbs: LessonContentBlock[] = cbJson.data || [];
				// Fetch the actual blocks
				const blockPromises = lcbs.map(lcb =>
					fetch(`/api/admin/content-blocks/${lcb.content_block_id}`).then(r => r.json())
				);
				const blockResults = await Promise.all(blockPromises);
				blocks = blockResults
					.filter((r: any) => r.success)
					.map((r: any) => r.data)
					.sort((a: ContentBlock, b: ContentBlock) => {
						const aOrder = lcbs.find(lcb => lcb.content_block_id === a.id)?.order_index ?? a.order_index;
						const bOrder = lcbs.find(lcb => lcb.content_block_id === b.id)?.order_index ?? b.order_index;
						return aOrder - bOrder;
					});
			}
		} catch {
			error = 'Gagal memuat data';
		} finally {
			loading = false;
		}
	}

	function openCreateBlock() {
		editingBlock = null;
		blTitle = '';
		blType = 'text';
		blBody = '';
		blError = '';
		blSuccess = '';
		showPreview = false;
		showBlockModal = true;
	}

	function openEditBlock(block: ContentBlock) {
		editingBlock = block;
		blTitle = block.title;
		blType = block.type;
		blBody = block.body || '';
		blError = '';
		blSuccess = '';
		showPreview = false;
		showBlockModal = true;
	}

	async function saveBlock() {
		if (!blTitle.trim()) {
			blError = 'Title wajib diisi';
			return;
		}
		blSaving = true;
		blError = '';
		blSuccess = '';
		try {
			const body = {
				type: blType,
				title: blTitle.trim(),
				body: blBody,
			};
			let res;
			let blockId;
			if (editingBlock) {
				res = await fetch(`/api/admin/content-blocks/${editingBlock.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
				blockId = editingBlock.id;
			} else {
				// Create content block first
				res = await fetch('/api/admin/content-blocks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
				const json = await res.json();
				if (!json.success) {
					blError = json.error || 'Gagal membuat content block';
					blSaving = false;
					return;
				}
				blockId = json.data.id;
				// Link to lesson
				res = await fetch('/api/admin/lesson-content-blocks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						lessonId: lessonId,
						contentBlockId: blockId,
						orderIndex: blocks.length,
					}),
				});
			}
			const json = await res.json();
			if (json.success) {
				blSuccess = 'Content block berhasil disimpan';
				loadData();
				setTimeout(() => { showBlockModal = false; }, 800);
			} else {
				blError = json.error || 'Gagal menyimpan';
			}
		} catch {
			blError = 'Gagal terhubung';
		} finally {
			blSaving = false;
		}
	}

	async function deleteBlock(block: ContentBlock) {
		if (!confirm(`Hapus content block "${block.title}"?`)) return;
		deletingBlId = block.id;
		try {
			// Unlink from lesson first
			await fetch('/api/admin/lesson-content-blocks', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId, contentBlockId: block.id }),
			});
			// Delete content block
			const res = await fetch(`/api/admin/content-blocks/${block.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				blocks = blocks.filter(b => b.id !== block.id);
			} else {
				alert(json.error || 'Gagal hapus');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			deletingBlId = null;
		}
	}

	async function moveBlock(block: ContentBlock, direction: 'up' | 'down') {
		const idx = blocks.findIndex(b => b.id === block.id);
		if (idx < 0) return;
		if (direction === 'up' && idx === 0) return;
		if (direction === 'down' && idx === blocks.length - 1) return;

		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		const newBlocks = [...blocks];
		[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
		blocks = newBlocks;

		// Update order via API
		try {
			const orderPayload = newBlocks.map((b, i) => ({ id: b.id, order_index: i }));
			await Promise.all(
				orderPayload.map(item =>
					fetch(`/api/admin/content-blocks/${item.id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ order_index: item.order_index }),
					})
				)
			);
		} catch {
			loadData(); // revert on error
		}
	}

	function getTypeIcon(t: string): string {
		const icons: Record<string, string> = {
			text: '📝', video: '🎬', image: '🖼️', embed: '🔗', code: '💻', quiz: '❓',
		};
		return icons[t] || '📄';
	}

	function renderMarkdown(body: string): string {
		// Simple inline markdown rendering
		return body
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/###### (.*)/g, '<h6>$1</h6>')
			.replace(/##### (.*)/g, '<h5>$1</h5>')
			.replace(/#### (.*)/g, '<h4>$1</h4>')
			.replace(/### (.*)/g, '<h3>$1</h3>')
			.replace(/## (.*)/g, '<h2>$1</h2>')
			.replace(/# (.*)/g, '<h1>$1</h1>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
			.replace(/\n/g, '<br>');
	}

	function insertMediaToBody(url: string) {
		blBody += `\n![Media](${url})`;
		showMediaModal = false;
	}

	async function loadMediaFiles() {
		mediaLoading = true;
		try {
			const res = await fetch('/api/admin/media?limit=50');
			const json = await res.json();
			if (json.success) mediaFiles = json.data || [];
		} catch {} finally {
			mediaLoading = false;
		}
	}

	function openMediaPicker() {
		if (mediaFiles.length === 0) loadMediaFiles();
		showMediaModal = true;
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="content-editor-page">
	{#if loading}
		<Skeleton variant="card" count={3} />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button href="/admin/offerings/{offeringId}/lessons">{t('admin.kembali')}</Button>
		</div>
	{:else}
		<div class="breadcrumb">
			<a href="/admin/courses">📚 Kursus</a>
			/ <a href="/admin/offerings/{offeringId}/lessons">{lesson?.course_offering_id ? 'Lesson' : ''}</a>
			/ <span>{lesson?.title || 'Content Editor'}</span>
		</div>

		<div class="page-header">
			<div>
				<h1>🧩 Content Blocks — {lesson?.title}</h1>
				<p class="page-desc">Atur konten pembelajaran untuk lesson ini</p>
			</div>
			<div class="header-actions">
				<Button variant="secondary" href="/admin/offerings/{offeringId}/lessons">{t('admin.kembali')}</Button>
				<Button onclick={openCreateBlock}>+ Content Block</Button>
			</div>
		</div>

		{#if blocks.length === 0}
			<div class="empty-state">
				<p>Belum ada content block. Tambahkan content block pertama.</p>
			</div>
		{:else}
			<div class="blocks-list">
				{#each blocks as block, i (block.id)}
					<div class="block-card">
						<div class="block-header">
							<div class="block-order">
								<Button class="move-btn" onclick={() => moveBlock(block, 'up')} disabled={i === 0}>↑</Button>
								<span class="order-badge">{i + 1}</span>
								<Button class="move-btn" onclick={() => moveBlock(block, 'down')} disabled={i === blocks.length - 1}>↓</Button>
							</div>
							<div class="block-type-badge">{getTypeIcon(block.type)} {block.type}</div>
							<h3 class="block-title">{block.title}</h3>
							<div class="block-actions">
								<Button size="sm" variant="ghost" onclick={() => openEditBlock(block)}>✏️</Button>
								<Button size="sm" variant="danger" onclick={() => deleteBlock(block)} loading={deletingBlId === block.id}>🗑️</Button>
							</div>
						</div>
						{#if block.body}
							<div class="block-body-preview">
								{@html renderMarkdown(block.body.slice(0, 300))}
								{block.body.length > 300 ? '...' : ''}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

{#if showBlockModal}
	<Modal
		open={showBlockModal}
		title={editingBlock ? '✏️ Edit Content Block' : '+ Content Block Baru'}
		onclose={() => { if (!blSaving) showBlockModal = false; }}
		class="wide-modal"
	>
		{#if blError}
			<Alert variant="danger">{blError}</Alert>
		{/if}
		{#if blSuccess}
			<Alert variant="success">{blSuccess}</Alert>
		{/if}
		<Input label="Title" bind:value={blTitle} placeholder="Judul blok konten" />
		<div class="form-row">
			<Select label="Tipe" options={[
				{ value: 'text', label: '📝 Text / Markdown' },
				{ value: 'video', label: '🎬 Video' },
				{ value: 'image', label: '🖼️ Image' },
				{ value: 'embed', label: '🔗 Embed' },
				{ value: 'code', label: '💻 Code' },
			]} bind:value={blType} />
			<div class="preview-toggle">
				<Button size="sm" variant="ghost" onclick={() => showPreview = !showPreview}>
					{showPreview ? '✏️ Edit' : '👁️ Preview'}
				</Button>
				<Button size="sm" variant="ghost" onclick={openMediaPicker}>🖼️ Media</Button>
			</div>
		</div>

		{#if showPreview}
			<div class="preview-area">
				<h4>Preview:</h4>
				<div class="markdown-preview">{@html renderMarkdown(blBody)}</div>
			</div>
		{:else}
			<Textarea label="Konten (Markdown)" bind:value={blBody} rows={10} placeholder="Tulis konten disini...&#10;&#10;Dukung: **bold**, *italic*, `code`, [link](url), ![gambar](url)" />
		{/if}

		{#snippet footer()}
			<Button variant="secondary" onclick={() => showBlockModal = false} disabled={blSaving}>{t('common.cancel')}</Button>
			<Button onclick={saveBlock} loading={blSaving}>{editingBlock ? 'Simpan' : 'Buat'}</Button>
		{/snippet}
	</Modal>
{/if}

{#if showMediaModal}
	<Modal
		open={showMediaModal}
		title="🖼️ Pilih Media"
		onclose={() => showMediaModal = false}
	>
		{#if mediaLoading}
			<p>Memuat media...</p>
		{:else if mediaFiles.length === 0}
			<p>Belum ada file media. Upload dulu di halaman Media.</p>
		{:else}
			<div class="media-picker-grid">
				{#each mediaFiles as mf}
					<Button class="media-picker-item" onclick={() => insertMediaToBody(mf.url)}>
						{#if mf.mime_type.startsWith('image/')}
							<img src={mf.url} alt={mf.original_name} class="picker-thumb" />
						{:else}
							<div class="picker-icon">📄</div>
						{/if}
						<span class="picker-name">{mf.original_name}</span>
					</Button>
				{/each}
			</div>
		{/if}
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showMediaModal = false}>{t('common.close')}</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.content-editor-page { max-width: 1100px; }
	.breadcrumb { font-size: 13px; color: #64748b; margin-bottom: 16px; }
	.breadcrumb a { color: #4F46E5; text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.page-desc { color: #64748b; font-size: 14px; margin: 0; }
	.header-actions { display: flex; gap: 8px; }
	.error-state { text-align: center; padding: 40px; color: #ef4444; }
	.empty-state { text-align: center; padding: 40px; color: #64748b; }

	.blocks-list { display: flex; flex-direction: column; gap: 8px; }
	.block-card {
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 10px;
		padding: 14px;
	}
	.block-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.block-order { display: flex; flex-direction: column; align-items: center; gap: 2px; }
	.move-btn {
		background: none;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 4px;
		color: #64748b;
		cursor: pointer;
		font-size: 11px;
		padding: 1px 5px;
		line-height: 1;
	}
	.move-btn:hover:not(:disabled) { color: #1a1a2e; }
	.move-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.order-badge {
		font-size: 12px;
		font-weight: 600;
		color: #94a3b8;
		background: rgba(0,0,0,0.04);
		padding: 1px 6px;
		border-radius: 4px;
	}
	.block-type-badge {
		font-size: 12px;
		color: #4F46E5;
		background: rgba(79,70,229,0.1);
		padding: 2px 8px;
		border-radius: 4px;
		flex-shrink: 0;
		font-weight: 500;
	}
	.block-title { font-size: 15px; font-weight: 600; margin: 0; flex: 1; color: #1a1a2e; }
	.block-actions { display: flex; gap: 4px; flex-shrink: 0; }
	.block-body-preview {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(0,0,0,0.04);
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
	}
	.form-row {
		display: flex;
		gap: 12px;
		align-items: flex-end;
	}
	.preview-toggle { display: flex; gap: 4px; margin-bottom: 4px; }
	.preview-area {
		background: rgba(0,0,0,0.15);
		padding: 16px;
		border-radius: 8px;
		border: 1px solid rgba(0,0,0,0.08);
	}
	.preview-area h4 { margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; }
	.markdown-preview { line-height: 1.7; font-size: 14px; color: #64748b; }
	.markdown-preview :global(h1), .markdown-preview :global(h2), .markdown-preview :global(h3) { margin: 8px 0; color: #1a1a2e; }
	.markdown-preview :global(code) { background: rgba(0,0,0,0.08); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
	.markdown-preview :global(pre) { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; overflow-x: auto; }
	.markdown-preview :global(img) { max-width: 100%; border-radius: 6px; margin: 8px 0; }
	.markdown-preview :global(a) { color: #4F46E5; }

	.media-picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 8px;
		max-height: 300px;
		overflow-y: auto;
	}
	.media-picker-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px;
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.12s;
		text-align: center;
	}
	.media-picker-item:hover { border-color: #4F46E5; }
	.picker-thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 4px; }
	.picker-icon { font-size: 28px; padding: 10px 0; }
	.picker-name { font-size: 11px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
</style>
