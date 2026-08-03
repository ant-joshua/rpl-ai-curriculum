<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Button, Card, CardContent, Spinner, EmptyState, Alert } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let studentName = $state('');
	let subject = $state('');
	let grade = $state('X');
	let curriculumId = $state('');
	let curricula = $state<any[]>([]);
	let attitude = $state('');

	let scoreNames = $state<string[]>(['Pengetahuan']);
	let scoreVals = $state<number[]>([0]);

	let generating = $state(false);
	let result = $state('');
	let error = $state('');
	let history = $state<any[]>([]);
	let showHistory = $state(false);

	onMount(() => {
		if (!browser) return;
		fetch('/api/curricula').then((r) => r.json()).then((j) => { if (j.success) curricula = j.data || []; }).catch(() => {});
		fetch('/api/aiedu/rapors').then((r) => r.json()).then((j) => { if (j.success) history = j.data || []; }).catch(() => {});
	});

	function addScore() { scoreNames = [...scoreNames, `Aspek ${scoreNames.length + 1}`]; scoreVals = [...scoreVals, 0]; }
	function removeScore(i: number) { scoreNames = scoreNames.filter((_, idx) => idx !== i); scoreVals = scoreVals.filter((_, idx) => idx !== i); }

	async function generate() {
		if (!studentName.trim()) { error = 'Isi nama siswa'; return; }
		generating = true;
		error = '';
		try {
			const scores = scoreNames.map((n, i) => ({ name: n, score: Number(scoreVals[i]) || 0 }));
			const res = await fetch('/api/aiedu/rapor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					student_name: studentName.trim(),
					subject: subject.trim() || 'Umum',
					grade,
					curriculum_id: curriculumId || undefined,
					scores,
					attitude: attitude.trim() || undefined,
				}),
			});
			const json = await res.json();
			if (json.success) {
				result = json.data.output;
				fetch('/api/aiedu/rapors').then((r) => r.json()).then((j) => { if (j.success) history = j.data || []; }).catch(() => {});
			} else error = json.error || 'Gagal generate';
		} catch { error = 'Gagal generate'; } finally { generating = false; }
	}

	function downloadMd() {
		const blob = new Blob([result], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `rapor-${studentName || 'siswa'}.md`; a.click();
		URL.revokeObjectURL(url);
	}

	function printMd() {
		const win = window.open('', '_blank');
		if (!win) return;
		win.document.write(`<html><head><title>Rapor ${studentName}</title><style>
			body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
			table { border-collapse: collapse; width: 100%; margin: 12px 0; }
			th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 14px; }
			th { background: #f5f5f5; }
			pre { background: #f5f5f5; padding: 10px; border-radius: 6px; white-space: pre-wrap; }
			h1, h2, h3 { margin: 16px 0 8px; }
			@media print { body { margin: 10mm; } }
		</style></head><body>${markedHtml()}</body></html>`);
		win.document.close();
		win.print();
	}

	function markedHtml(): string {
		// Lightweight markdown -> HTML (headings, bold, lists, tables, paragraphs)
		const lines = result.split('\n');
		let html = '';
		let inTable = false;
		let inList = false;
		let inCode = false;
		let codeBuf: string[] = [];
		for (const line of lines) {
			if (line.trim().startsWith('```')) {
				if (inCode) { html += `<pre>${codeBuf.join('\n')}</pre>`; codeBuf = []; inCode = false; }
				else inCode = true;
				continue;
			}
			if (inCode) { codeBuf.push(line); continue; }
			const h = line.match(/^(#{1,3})\s+(.*)/);
			if (h) {
				if (inList) { html += '</ul>'; inList = false; }
				if (inTable) { html += '</table>'; inTable = false; }
				const level = h[1].length;
				html += `<h${level}>${escapeHtml(h[2])}</h${level}>`;
				continue;
			}
			if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
				const cells = line.trim().split('|').slice(1, -1).map((c) => c.trim());
				if (!inTable) { html += '<table><thead><tr>' + cells.map((c) => `<th>${escapeHtml(c)}</th>`).join('') + '</tr></thead><tbody>'; inTable = true; }
				else if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) { html += '<tr>' + cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>'; }
				continue;
			}
			if (inTable) { html += '</tbody></table>'; inTable = false; }
			if (/^\s*[-*]\s+/.test(line)) {
				if (!inList) { html += '<ul>'; inList = true; }
				html += `<li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
				continue;
			}
			if (inList) { html += '</ul>'; inList = false; }
			if (line.trim() === '') { html += '<p></p>'; continue; }
			let t = escapeHtml(line);
			t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
			html += `<p>${t}</p>`;
		}
		if (inList) html += '</ul>';
		if (inTable) html += '</tbody></table>';
		if (inCode) html += `<pre>${codeBuf.join('\n')}</pre>`;
		return html;
	}

	function escapeHtml(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
</script>

<PageHeader title="Rapor Generator" subtitle="AI generate rapor siswa — deskripsi kompetensi otomatis, siap cetak" />

{#if error}
	<Alert variant="danger" class="mb">{error}</Alert>
{/if}

<div class="rapor-layout">
	<div class="form-col">
		<Card>
			<CardContent>
				<h3 class="section-title">Data Siswa &amp; Nilai</h3>
				<div class="form-row">
					<label class="field"><span>Nama Siswa *</span><input type="text" bind:value={studentName} placeholder="Budi Santoso" /></label>
					<label class="field"><span>Mapel</span><input type="text" bind:value={subject} placeholder="Informatika" /></label>
					<label class="field"><span>Kelas</span><input type="text" bind:value={grade} placeholder="X" /></label>
				</div>
				<label class="field"><span>Kurikulum</span>
					<select bind:value={curriculumId}>
						<option value="">Default (Merdeka)</option>
						{#each curricula as c}<option value={c.id}>{c.name}</option>{/each}
					</select>
				</label>

				<div class="scores-head">
					<strong>Aspek</strong><strong>Nilai</strong><span></span>
				</div>
				{#each scoreNames as _, i}
					<div class="score-row">
						<input type="text" bind:value={scoreNames[i]} />
						<input type="number" min="0" max="100" bind:value={scoreVals[i]} />
						<button class="del-btn" onclick={() => removeScore(i)} title="Hapus">✕</button>
					</div>
				{/each}
				<Button size="sm" variant="secondary" onclick={addScore}>+ Aspek Nilai</Button>

				<label class="field mt"><span>Catatan Sikap (opsional)</span>
					<textarea bind:value={attitude} rows={2} placeholder="Disiplin, aktif, kerja sama..."></textarea>
				</label>

				<div class="form-actions">
					<Button variant="primary" onclick={generate} loading={generating}>🤖 Generate Rapor</Button>
				</div>
			</CardContent>
		</Card>

		{#if history.length > 0}
			<Card class="mt">
				<CardContent>
					<h3 class="section-title" onclick={() => (showHistory = !showHistory)} style="cursor:pointer">Riwayat Rapor ({history.length})</h3>
					{#if showHistory}
						<div class="history-list">
							{#each history as h (h.id)}
								<div class="history-item">
									<span>{h.student_name} · {h.subject || 'Umum'} · {h.grade}</span>
									<span class="h-time">{h.created_at?.slice(0, 16)}</span>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}
	</div>

	<div class="result-col">
		<Card class="result-card">
			<CardContent>
				<div class="result-head">
					<h3 class="section-title">Hasil Rapor</h3>
					{#if result}
						<div class="result-actions">
							<Button size="sm" variant="secondary" onclick={printMd}>🖨️ Print</Button>
							<Button size="sm" variant="secondary" onclick={downloadMd}>📥 .md</Button>
						</div>
					{/if}
				</div>
				{#if generating}
					<div class="center"><Spinner /><span class="ai-note">AI menyusun rapor...</span></div>
				{:else if result}
					<div class="md">{@html parseMarkdown(result)}</div>
				{:else}
					<EmptyState icon="file-text" title="Belum ada rapor" desc="Isi data siswa lalu klik Generate" />
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.mt { margin-top: 12px; }
	.rapor-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
	.form-col, .result-col { display: flex; flex-direction: column; gap: 16px; }
	.section-title { font-size: 15px; margin: 0 0 12px; }
	.form-row { display: grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap: 10px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; margin-bottom: 10px; }
	.field input, .field select, .field textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-family: inherit; }
	.scores-head { display: grid; grid-template-columns: 1fr 100px 24px; gap: 6px; font-size: 12px; margin: 8px 0 4px; }
	.score-row { display: grid; grid-template-columns: 1fr 100px 24px; gap: 6px; margin-bottom: 6px; align-items: center; }
	.score-row input { padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; width: 100%; box-sizing: border-box; }
	.del-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 13px; }
	.del-btn:hover { color: #dc2626; }
	.form-actions { margin-top: 12px; }
	.center { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 32px; color: var(--text-secondary); font-size: 13px; }
	.result-card { min-height: 300px; }
	.result-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
	.result-actions { display: flex; gap: 6px; }
	.md { font-size: 13px; line-height: 1.6; }
	.md :global(h1), .md :global(h2), .md :global(h3) { margin: 14px 0 8px; }
	.md :global(p) { margin: 0 0 8px; }
	.md :global(pre) { background: #0f1115; color: #e6e6e6; padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
	.md :global(table) { border-collapse: collapse; margin: 8px 0; font-size: 12px; width: 100%; }
	.md :global(th), .md :global(td) { border: 1px solid var(--border); padding: 5px 8px; }
	.md :global(th) { background: var(--surface); }
	.history-list { display: flex; flex-direction: column; gap: 6px; }
	.history-item { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; }
	.h-time { color: var(--text-muted); font-size: 12px; }
</style>
