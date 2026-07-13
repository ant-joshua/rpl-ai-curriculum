<script lang="ts">
	import { browser } from '$app/environment';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { html } from '@codemirror/lang-html';
	import { css } from '@codemirror/lang-css';
	import { javascript } from '@codemirror/lang-javascript';
	import { keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';

	let {
		value = $bindable(''),
		lang = 'html',
		onchange,
	}: {
		value?: string;
		lang?: string;
		onchange?: (value: string) => void;
	} = $props();

	let container = $state<HTMLDivElement | null>(null);
	let view = $state<EditorView | null>(null);

	function getLanguageExtension(l: string) {
		switch (l) {
			case 'html':
			case 'htm':
				return html();
			case 'css':
				return css();
			case 'javascript':
			case 'js':
				return javascript();
			case 'typescript':
			case 'ts':
				return javascript({ typescript: true });
			case 'jsx':
				return javascript({ jsx: true });
			case 'tsx':
				return javascript({ jsx: true, typescript: true });
			default:
				return html();
		}
	}

	$effect(() => {
		if (!browser || !container) return;

		const langExt = getLanguageExtension(lang);

		const state = EditorState.create({
			doc: value,
			extensions: [
				basicSetup,
				oneDark,
				langExt,
				keymap.of([indentWithTab]),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						value = update.state.doc.toString();
						onchange?.(value);
					}
				}),
				EditorView.theme({
					'&': { height: '100%' },
					'.cm-scroller': { overflow: 'auto' },
				}),
			],
		});

		view = new EditorView({
			state,
			parent: container,
		});

		return () => {
			view?.destroy();
			view = null;
		};
	});

	// Sync external value changes into editor (e.g. step change resets code)
	$effect(() => {
		if (!view || !browser) return;
		const current = view.state.doc.toString();
		if (value !== current) {
			view.dispatch({
				changes: { from: 0, to: current.length, insert: value },
			});
		}
	});
</script>

<div class="code-editor-wrapper" class:hydrated={browser && view !== null}>
	<div bind:this={container} class="cm-host"></div>
</div>

<style>
	.code-editor-wrapper {
		flex: 1;
		display: flex;
		overflow: hidden;
		background: #1e1e1e;
		position: relative;
	}

	.cm-host {
		flex: 1;
		display: flex;
		overflow: hidden;
		min-height: 0;
	}

	/* Ensure CM fills the host */
	.cm-host :global(.cm-editor) {
		height: 100%;
	}

	.cm-host :global(.cm-scroller) {
		font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
		font-size: 14px;
		line-height: 1.6;
	}

	/* Loading placeholder before CM hydrates */
	.code-editor-wrapper:not(.hydrated) {
		background: #1e1e1e;
		color: #555;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: monospace;
		font-size: 14px;
	}

	.code-editor-wrapper:not(.hydrated)::after {
		content: 'Loading editor...';
		color: #555;
	}
</style>
