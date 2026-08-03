<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PageHeader, Card, CardContent, Button, Spinner, EmptyState } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let doc = $state<any>(null);
	let loading = $state(true);
	let docId = $derived(String(($page.params as Record<string, string>).id || ''));

	onMount(() => {
		if (browser) load();
	});

	async function load() {
		loading = true;
		try {
			const res = await fetch(`/api/aiedu/bank/${docId}`);
			const json = await res.json();
			if (json.success) doc = json.data;
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	function download() {
		if (!doc?.content) return;
		const blob = new Blob([doc.content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<PageHeader title={doc?.title || 'Dokumen'} subtitle={doc ? `${doc.subject} · ${doc.doc_type.replace(/_/g, ' ')}` : 'Bank Materi'} />

{#if loading}
	<div class="center"><Spinner /></div>
{:else if !doc}
	<EmptyState icon="search-x" title="Dokumen tidak ditemukan" />
{:else}
	<div class="doc-toolbar">
		<Button size="sm" variant="primary" onclick={download}>⬇️ Download .md</Button>
		<a class="back-link" href="/aiedu">← Kembali ke Bank Materi</a>
	</div>
	<Card>
		<CardContent>
			<div class="md-preview">{@html parseMarkdown(doc.content || '')}</div>
		</CardContent>
	</Card>
{/if}

<style>
	.center { display: flex; justify-content: center; padding: 40px; }
	.doc-toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
	.back-link { font-size: 13px; color: var(--text-muted); text-decoration: none; }
	.back-link:hover { text-decoration: underline; }
	.md-preview { font-size: 14px; line-height: 1.7; overflow-x: auto; }
	.md-preview :global(h1) { font-size: 22px; }
	.md-preview :global(h2) { font-size: 18px; margin-top: 20px; }
	.md-preview :global(h3) { font-size: 15px; }
	.md-preview :global(table) { border-collapse: collapse; width: 100%; margin: 12px 0; }
	.md-preview :global(th), .md-preview :global(td) { border: 1px solid var(--border); padding: 8px 10px; font-size: 13px; }
	.md-preview :global(th) { background: var(--surface); }
	.md-preview :global(pre) { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 8px; overflow-x: auto; }
	.md-preview :global(code) { font-family: monospace; font-size: 13px; }
</style>
