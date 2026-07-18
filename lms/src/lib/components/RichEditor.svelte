<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let {
		content = '',
		placeholder = 'Start writing...',
		onUpdate = (_html: string) => {},
	}: {
		content?: string;
		placeholder?: string;
		onUpdate?: (html: string) => void;
	} = $props();

	let editorEl = $state<HTMLDivElement>();
	let editor: any = $state(null);
	let toolbarEl = $state<HTMLDivElement>();
	let isLinkDialog = $state(false);
	let linkUrl = $state('');
	let linkRange: any = null;

	onMount(async () => {
		if (!browser || !editorEl) return;

		const mod = await Promise.all([
			import('@tiptap/core'),
			import('@tiptap/starter-kit'),
			import('@tiptap/extension-placeholder'),
			import('@tiptap/extension-image'),
			import('@tiptap/extension-link'),
			import('@tiptap/extension-code-block-lowlight'),
			import('lowlight'),
			import('$lib/utils/languages'),
		]);
		const { Editor } = mod[0];
		const StarterKit = mod[1].default;
		const Placeholder = mod[2].default;
		const ImageExt = mod[3].default;
		const LinkExt = mod[4].default;
		const CodeBlockLowlight = mod[5].default;
		const { createLowlight } = mod[6];
		const { curriculumGrammars } = mod[7];

		const lowlight = createLowlight(curriculumGrammars);

		editor = new Editor({
			element: editorEl,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] },
					codeBlock: false,
				}),
				Placeholder.configure({ placeholder }),
				ImageExt,
				LinkExt.configure({
					openOnClick: true,
					autolink: true,
					HTMLAttributes: { class: 'editor-link' },
				}),
				CodeBlockLowlight.configure({ lowlight }),
			],
			content: content || '',
			onUpdate: ({ editor: ed }: { editor: any }) => {
				onUpdate?.(ed.getHTML());
			},
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function execCmd(cmd: string, attr?: string) {
		if (!editor) return;
		if (cmd === 'heading') {
			editor.chain().focus().toggleHeading({ level: parseInt(attr || '1') }).run();
		} else if (cmd === 'link') {
			const { from, to } = editor.state.selection;
			if (from === to) return;
			linkRange = { from, to };
			linkUrl = editor.state.doc.textBetween(from, to) || '';
			isLinkDialog = true;
		} else if (cmd === 'image') {
			const url = prompt('Image URL:');
			if (url) editor.chain().focus().setImage({ src: url }).run();
		} else {
			// @ts-ignore
			editor.chain().focus()[cmd]().run();
		}
	}

	function applyLink() {
		if (!editor || !linkUrl) return;
		editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
		isLinkDialog = false;
		linkUrl = '';
	}

	function isActive(cmd: string, attr?: string): boolean {
		if (!editor) return false;
		if (cmd === 'heading' && attr) return editor.isActive('heading', { level: parseInt(attr) });
		return editor.isActive(cmd);
	}

	let toolbarButtons = $derived([
		{ cmd: 'toggleBold', label: 'B', title: 'Bold', icon: '<strong>B</strong>', check: 'bold' },
		{ cmd: 'toggleItalic', label: 'I', title: 'Italic', icon: '<em>I</em>', check: 'italic' },
		{ type: 'separator' },
		{ cmd: 'heading', attr: '1', label: 'H1', title: 'Heading 1', icon: 'H1', check: 'heading', checkAttr: '1' },
		{ cmd: 'heading', attr: '2', label: 'H2', title: 'Heading 2', icon: 'H2', check: 'heading', checkAttr: '2' },
		{ cmd: 'heading', attr: '3', label: 'H3', title: 'Heading 3', icon: 'H3', check: 'heading', checkAttr: '3' },
		{ type: 'separator' },
		{ cmd: 'toggleBulletList', label: 'UL', title: 'Bullet List', icon: '• =', check: 'bulletList' },
		{ cmd: 'toggleOrderedList', label: 'OL', title: 'Ordered List', icon: '1.', check: 'orderedList' },
		{ type: 'separator' },
		{ cmd: 'toggleBlockquote', label: '›', title: 'Blockquote', icon: '"', check: 'blockquote' },
		{ cmd: 'toggleCodeBlock', label: '<>', title: 'Code Block', icon: '<>', check: 'codeBlock' },
		{ type: 'separator' },
		{ cmd: 'link', label: '🔗', title: 'Link', icon: '🔗' },
		{ cmd: 'image', label: '🖼', title: 'Image', icon: '🖼' },
	]);
</script>

<div class="rich-editor-wrapper">
	<div class="editor-toolbar" bind:this={toolbarEl} role="toolbar" aria-label="Text formatting">
		{#each toolbarButtons as btn}
			{#if btn.type === 'separator'}
				<span class="separator"></span>
			{:else}
				<button
					class="toolbar-btn"
					class:active={btn.check && isActive(btn.check, (btn as any).checkAttr)}
					onclick={() => execCmd((btn as any).cmd, (btn as any).attr)}
					title={btn.title}
					aria-label={btn.title}
				>{@html btn.icon}</button>
			{/if}
		{/each}
	</div>

	<div class="editor-content" bind:this={editorEl}></div>

	{#if isLinkDialog}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="link-dialog-overlay" onclick={() => isLinkDialog = false} role="button" tabindex="-1">
			<div class="link-dialog" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" aria-label="Insert link">
				<div class="link-dialog-header">
					<span>Insert Link</span>
					<button onclick={() => isLinkDialog = false} class="link-dialog-close">✕</button>
				</div>
				<input
					type="url"
					bind:value={linkUrl}
					placeholder="https://example.com"
					onkeydown={(e) => { if (e.key === 'Enter') applyLink(); }}
					autofocus
				/>
				<div class="link-dialog-actions">
					<button onclick={() => isLinkDialog = false} class="btn btn-sm">Cancel</button>
					<button onclick={applyLink} class="btn btn-sm btn-primary">Apply</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.rich-editor-wrapper {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg);
	}

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 6px 8px;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		align-items: center;
		user-select: none;
	}

	.toolbar-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		border-radius: 4px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		padding: 0;
		transition: all 0.12s;
		font-family: inherit;
	}

	.toolbar-btn:hover {
		background: var(--hover);
		color: var(--text);
	}

	.toolbar-btn.active {
		background: var(--accent-dim);
		color: var(--accent-secondary);
	}

	.toolbar-btn :global(strong),
	.toolbar-btn :global(em) {
		font-style: normal;
	}

	.separator {
		width: 1px;
		height: 20px;
		background: var(--border);
		margin: 0 4px;
		flex-shrink: 0;
	}

	.editor-content {
		padding: 12px 14px;
		min-height: 120px;
		cursor: text;
	}

	/* TipTap ProseMirror styles */
	.editor-content :global(.ProseMirror) {
		outline: none;
		min-height: 100px;
		color: var(--text);
		font-size: 14px;
		line-height: 1.7;
	}

	.editor-content :global(.ProseMirror p) {
		margin: 0.4em 0;
	}

	.editor-content :global(.ProseMirror h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0.6em 0 0.3em;
		color: var(--text);
	}

	.editor-content :global(.ProseMirror h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.5em 0 0.25em;
		color: var(--text);
	}

	.editor-content :global(.ProseMirror h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0.4em 0 0.2em;
		color: var(--text);
	}

	.editor-content :global(.ProseMirror ul),
	.editor-content :global(.ProseMirror ol) {
		padding-left: 1.5em;
		margin: 0.4em 0;
	}

	.editor-content :global(.ProseMirror li) {
		margin: 0.2em 0;
	}

	.editor-content :global(.ProseMirror blockquote) {
		border-left: 3px solid var(--accent);
		padding: 0.3em 1em;
		margin: 0.5em 0;
		color: var(--text-secondary);
		background: var(--accent-dim);
		border-radius: 0 4px 4px 0;
	}

	.editor-content :global(.ProseMirror pre) {
		background: #0d0e17;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.75em 1em;
		margin: 0.6em 0;
		overflow-x: auto;
		font-size: 0.85em;
		line-height: 1.5;
	}

	.editor-content :global(.ProseMirror pre code) {
		background: none;
		padding: 0;
		color: inherit;
		font-size: inherit;
	}

	.editor-content :global(.ProseMirror code) {
		background: var(--accent-dim);
		color: var(--accent-secondary);
		padding: 0.15em 0.4em;
		border-radius: 3px;
		font-size: 0.85em;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}

	.editor-content :global(.ProseMirror img) {
		max-width: 100%;
		border-radius: 4px;
		margin: 0.5em 0;
		height: auto;
	}

	.editor-content :global(.ProseMirror a) {
		color: var(--accent-secondary);
		text-decoration: underline;
		cursor: pointer;
	}

	.editor-content :global(.ProseMirror a:hover) {
		color: var(--accent);
	}

	.editor-content :global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: var(--text-secondary);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		opacity: 0.5;
	}

	.editor-content :global(.ProseMirror hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 1em 0;
	}

	/* Link dialog */
	.link-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1100;
	}

	.link-dialog {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		width: 340px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.link-dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		font-weight: 600;
	}

	.link-dialog-close {
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 16px;
		padding: 2px;
	}

	.link-dialog input {
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		width: 100%;
		box-sizing: border-box;
	}

	.link-dialog-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}

	.btn {
		display: inline-block;
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.btn-sm {
		padding: 5px 10px;
		font-size: 12px;
	}

	.btn:hover {
		opacity: 0.85;
	}
</style>
