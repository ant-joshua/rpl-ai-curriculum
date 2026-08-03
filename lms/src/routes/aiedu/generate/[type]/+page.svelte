<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PageHeader, Card, CardContent, Button, Spinner, Alert } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let { data }: { data: import('./$types').PageData } = $props();

	let docType = $derived(String(($page.params as Record<string, string>).type || ''));
	let generating = $state(false);
	let output = $state('');
	let error = $state('');

	// Form
	let subject = $state('');
	let grade = $state('X');
	let topic = $state('');
	let curriculumId = $state('');
	let curricula = $state<any[]>([]);

	onMount(() => {
		if (!browser) return;
		fetch('/api/curricula')
			.then((r) => r.json())
			.then((j) => {
				if (j.success) curricula = j.data || [];
			})
			.catch(() => {});
	});

	const grades = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12'];

	const TITLES: Record<string, string> = {
		atp: 'Generate ATP',
		modul_ajar: 'Generate Modul Ajar',
		lkpd: 'Generate LKPD',
		soal: 'Generate Soal',
		rubrik: 'Generate Rubrik',
		ppt: 'Generate PPT',
	};

	async function generate() {
		if (!subject.trim() || !topic.trim()) {
			error = 'Isi mapel dan materi dulu';
			return;
		}
		generating = true;
		error = '';
		output = '';
		try {
			const res = await fetch('/api/aiedu/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ doc_type: docType, subject: subject.trim(), grade, topic: topic.trim(), curriculum_id: curriculumId || undefined }),
			});
			const json = await res.json();
			if (json.success) {
				output = json.data.output;
			} else {
				error = json.error || 'Gagal generate';
			}
		} catch {
			error = 'Gagal menghubungi AI';
		} finally {
			generating = false;
		}
	}

	function downloadMd() {
		if (!output) return;
		const blob = new Blob([output], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${docType}-${subject.toLowerCase().replace(/\s+/g, '-')}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyOutput() {
		if (!output) return;
		navigator.clipboard.writeText(output);
		alert('Tersalin ke clipboard ✅');
	}
</script>

<PageHeader title={TITLES[docType] || 'Generator'} subtitle="Isi form, AI menyusun dokumen perangkat ajar" />

<div class="gen-layout">
	<div class="gen-form">
		<Card>
			<CardContent>
				<label class="field">
					<span>Mata Pelajaran *</span>
					<input type="text" bind:value={subject} placeholder="Contoh: Informatika, Matematika, IPA..." />
				</label>
				<label class="field">
					<span>Kurikulum</span>
					<select bind:value={curriculumId}>
						<option value="">Default (Kurikulum Merdeka)</option>
						{#each curricula as c}
							<option value={c.id}>{c.name}{c.is_default ? ' (default)' : ''}</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>Kelas / Fase</span>
					<select bind:value={grade}>
						{#each grades as g}<option value={g}>{g}</option>{/each}
					</select>
				</label>
				<label class="field">
					<span>Materi / Topik *</span>
					<textarea bind:value={topic} rows={4} placeholder="Contoh: Perulangan dalam Python, Persamaan Kuadrat, Sistem Pencernaan..."></textarea>
				</label>
				<Button variant="primary" fullWidth onclick={generate} loading={generating}>
					✨ Generate
				</Button>
				{#if error}
					<Alert variant="error" class="gen-error">{error}</Alert>
				{/if}
			</CardContent>
		</Card>
	</div>

	<div class="gen-result">
		{#if generating}
			<div class="center"><Spinner /> <span class="gen-loading">AI sedang menyusun dokumen...</span></div>
		{:else if output}
			<div class="result-toolbar">
				<Button size="sm" variant="primary" onclick={downloadMd}>⬇️ Download .md</Button>
				<Button size="sm" variant="secondary" onclick={copyOutput}>📋 Salin</Button>
			</div>
			<Card>
				<CardContent>
					<div class="md-preview">{@html parseMarkdown(output)}</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent>
					<p class="placeholder">Hasil generate akan muncul di sini.<br />Isi form di kiri lalu klik Generate.</p>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

<style>
	.gen-layout { display: grid; grid-template-columns: 340px 1fr; gap: 18px; align-items: start; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; margin-bottom: 14px; }
	.field input, .field select, .field textarea {
		padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px;
		font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box;
	}
	.gen-error { margin-top: 10px; }
	.center { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; }
	.gen-loading { font-size: 13px; color: var(--text-muted); }
	.result-toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
	.md-preview { font-size: 14px; line-height: 1.7; overflow-x: auto; }
	.md-preview :global(h1) { font-size: 22px; }
	.md-preview :global(h2) { font-size: 18px; margin-top: 20px; }
	.md-preview :global(h3) { font-size: 15px; }
	.md-preview :global(table) { border-collapse: collapse; width: 100%; margin: 12px 0; }
	.md-preview :global(th), .md-preview :global(td) { border: 1px solid var(--border); padding: 8px 10px; font-size: 13px; }
	.md-preview :global(th) { background: var(--surface); }
	.md-preview :global(pre) { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 8px; overflow-x: auto; }
	.md-preview :global(code) { font-family: monospace; font-size: 13px; }
	.placeholder { text-align: center; color: var(--text-muted); font-size: 14px; padding: 50px 20px; line-height: 1.8; }

	@media (max-width: 768px) {
		.gen-layout { grid-template-columns: 1fr; }
	}
</style>
