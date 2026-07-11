<script lang="ts">
	import { notes } from '$lib/stores/notes.svelte';

	let { slug, sessionId }: { slug: string; sessionId: string | null } = $props();

	let text = $state('');
	let savedText = $state('');
	let isSaving = $state(false);
	let justSaved = $state(false);

	const MAX_CHARS = 2000;

	// Load notes when session changes
	$effect(() => {
		if (!sessionId) return;
		// read version to force reactivity
		void notes.version;
		const loaded = notes.getNotes(slug, sessionId);
		text = loaded;
		savedText = loaded;
	});

	// Debounced auto-save
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
		}, 500);
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
</script>

{#if sessionId}
	<div class="notes-panel">
		<div class="notes-header">
			<span class="notes-title">📝 Catatan</span>
			<span class="notes-indicator">
				{#if overLimit}
					<span class="limit-warn">Batas {MAX_CHARS} karakter</span>
				{:else if justSaved}
					<span class="saved">Tersimpan</span>
				{:else if isSaving}
					<span class="saving">Menyimpan...</span>
				{/if}
			</span>
		</div>
		<textarea
			bind:value={text}
			class="notes-textarea"
			placeholder="Tulis catatan di sini..."
			maxlength={MAX_CHARS + 100}
		></textarea>
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
	}

	.notes-title {
		font-weight: 600;
		font-size: 13px;
		color: var(--text);
	}

	.notes-indicator {
		font-size: 11px;
	}

	.saved {
		color: var(--success, #22c55e);
	}

	.saving {
		color: var(--text-secondary);
	}

	.limit-warn {
		color: var(--error, #ef4444);
		font-weight: 600;
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
