<script lang="ts">
	import { notes } from '$lib/stores/notes.svelte';
	import { marked } from 'marked';

	let { slug, sessionId }: { slug: string; sessionId: string | null } = $props();

	let text = $state('');
	let savedText = $state('');
	let isSaving = $state(false);
	let justSaved = $state(false);
	let showPreview = $state(false);

	const MAX_CHARS = 2000;

	// Load notes when session changes
	$effect(() => {
		if (!sessionId) return;
		// read version to force reactivity
		void notes.version;
		const loaded = notes.getNotes(slug, sessionId);
		text = loaded;
		savedText = loaded;
		justSaved = false;
		isSaving = false;
	});

	// Debounced auto-save (2000ms)
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const currentText = text;
		if (!sessionId) return;
		if (currentText === savedText) return;

		clearTimeout(timer);
		isSaving = true;
		justSaved = false;

		timer = setTimeout(() => {
			notes.setNotes(slug, sessionId, currentText);
			savedText = currentText;
			isSaving = false;
			justSaved = true;
			setTimeout(() => { justSaved = false; }, 2000);
		}, 2000);
	});

	function handleSave() {
		if (!sessionId) return;
		clearTimeout(timer);
		notes.setNotes(slug, sessionId, text);
		savedText = text;
		justSaved = true;
		setTimeout(() => { justSaved = false; }, 2000);
	}

	let charCount = $derived(text.length);
	let overLimit = $derived(charCount > MAX_CHARS);

	let previewHtml = $derived.by(() => {
		if (!showPreview || !text.trim()) return '';
		try {
			return marked.parse(text);
		} catch {
			return '<p class="error">Gagal merender markdown</p>';
		}
	});
</script>

{#if sessionId}
	<div class="notes-panel">
		<div class="notes-header">
			<span class="notes-title">📝 Catatan</span>
			<div class="notes-header-right">
				{#if text.trim()}
					<button class="preview-toggle" onclick={() => showPreview = !showPreview}>
						{showPreview ? '✏️ Edit' : '👁️ Preview'}
					</button>
				{/if}
				<span class="notes-indicator">
					{#if overLimit}
						<span class="limit-warn">Batas {MAX_CHARS} karakter</span>
					{:else if justSaved}
						<span class="saved">✓ Tersimpan</span>
					{:else if isSaving}
						<span class="saving">Menyimpan...</span>
					{/if}
				</span>
			</div>
		</div>

		{#if showPreview && previewHtml}
			<div class="notes-preview markdown-content">
				{@html previewHtml}
			</div>
		{:else}
			<textarea
				bind:value={text}
				class="notes-textarea"
				placeholder="Tulis catatan di sini...&#10;&#10;Markdown supported: **bold**, *italic*, `code`, lists, etc."
				maxlength={MAX_CHARS + 100}
			></textarea>
		{/if}

		<div class="notes-footer">
			<span class="char-count" class:over={overLimit}>
				{charCount}/{MAX_CHARS}
			</span>
			<button class="save-btn" onclick={handleSave} disabled={overLimit}>
				💾 Simpan
			</button>
		</div>
	</div>
{/if}

<style>
	.notes-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px;
		margin-top: 16px;
		font-size: 13px;
	}

	.notes-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		gap: 8px;
	}

	.notes-title {
		font-weight: 600;
		font-size: 13px;
		color: var(--text);
	}

	.notes-header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.notes-indicator {
		font-size: 11px;
	}

	.saved {
		color: var(--success, #22c55e);
		font-weight: 600;
	}

	.saving {
		color: var(--text-secondary);
	}

	.limit-warn {
		color: var(--error, #ef4444);
		font-weight: 600;
	}

	.preview-toggle {
		font-size: 11px;
		padding: 2px 8px;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preview-toggle:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.notes-textarea {
		width: 100%;
		min-height: 80px;
		max-height: 200px;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font-size: 13px;
		line-height: 1.5;
		resize: vertical;
		font-family: inherit;
		box-sizing: border-box;
	}

	.notes-textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.notes-textarea::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.notes-preview {
		min-height: 80px;
		max-height: 300px;
		overflow-y: auto;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		font-size: 13px;
		line-height: 1.6;
	}

	.notes-preview :global(p) {
		margin-bottom: 8px;
	}

	.notes-preview :global(code) {
		background: var(--bg);
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 12px;
	}

	.notes-preview :global(pre) {
		background: var(--bg);
		padding: 8px;
		border-radius: 6px;
		overflow-x: auto;
		margin-bottom: 8px;
	}

	.notes-preview :global(pre code) {
		background: none;
		padding: 0;
	}

	.notes-preview :global(ul), .notes-preview :global(ol) {
		padding-left: 20px;
		margin-bottom: 8px;
	}

	.notes-preview :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding-left: 12px;
		color: var(--text-secondary);
		margin-bottom: 8px;
	}

	.notes-preview :global(h1), .notes-preview :global(h2), .notes-preview :global(h3) {
		margin-bottom: 8px;
		color: var(--text);
	}

	.notes-preview :global(h1) { font-size: 16px; }
	.notes-preview :global(h2) { font-size: 14px; }
	.notes-preview :global(h3) { font-size: 13px; }

	.notes-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 8px;
	}

	.char-count {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.char-count.over {
		color: var(--error, #ef4444);
		font-weight: 600;
	}

	.save-btn {
		padding: 4px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.save-btn:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
