<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, Button } from '$lib/components/ui';

	const GEN_TOOLS = [
		{ type: 'atp', icon: '🗺️', title: 'Generate ATP', desc: 'Alur Tujuan Pembelajaran' },
		{ type: 'modul_ajar', icon: '📘', title: 'Generate Modul Ajar', desc: 'RPP Kurikulum Merdeka' },
		{ type: 'lkpd', icon: '📝', title: 'Generate LKPD', desc: 'Lembar Kerja Peserta Didik' },
		{ type: 'soal', icon: '🧩', title: 'Generate Soal', desc: 'Bank soal + kunci jawaban' },
		{ type: 'rubrik', icon: '📊', title: 'Generate Rubrik', desc: 'Rubrik penilaian 4 skala' },
		{ type: 'ppt', icon: '🖥️', title: 'Generate PPT', desc: 'Outline materi presentasi' },
	];

	const EXTRA_TOOLS = [
		{ href: '/aiedu/chat', icon: '💬', title: 'AI Chat Guru', desc: 'Tanya apa saja tentang mengajar' },
		{ href: '/aiedu/analisis', icon: '📈', title: 'Analisis Nilai', desc: 'AI analisis nilai + remedial' },
		{ href: '/aiedu/rapor', icon: '📄', title: 'Rapor Generator', desc: 'Rapor otomatis siap cetak' },
	];

	const BANK_CATEGORIES = [
		{ type: 'cp', icon: '🎯', title: 'Capaian Pembelajaran', desc: 'CP resmi semua fase' },
		{ type: 'atp', icon: '🗺️', title: 'Contoh ATP', desc: 'Alur tujuan pembelajaran contoh' },
		{ type: 'modul_ajar', icon: '📘', title: 'Modul Resmi', desc: 'Modul ajar siap pakai' },
		{ type: 'buku_guru', icon: '👨‍🏫', title: 'Buku Guru', desc: 'Panduan mengajar' },
		{ type: 'buku_siswa', icon: '📖', title: 'Buku Siswa', desc: 'Materi untuk siswa' },
		{ type: 'panduan_asesmen', icon: '📋', title: 'Panduan Asesmen', desc: 'Prinsip & instrumen' },
		{ type: 'panduan_projek', icon: '🚀', title: 'Panduan Projek', desc: 'Panduan P5' },
	];

	let bankDocs = $state<any[]>([]);
	let bankFilter = $state('');
	let bankMine = $state(false);

	async function loadBank() {
		try {
			const qs = bankMine ? 'mine=1' : (bankFilter ? `?type=${bankFilter}` : '');
			const res = await fetch(`/api/aiedu/bank${qs ? `?${qs}` : ''}`);
			const json = await res.json();
			if (json.success) bankDocs = json.data || [];
		} catch { /* ignore */ }
	}

	onMount(() => {
		if (browser) loadBank();
	});
</script>

<PageHeader title="AIEdu" subtitle="Generator perangkat ajar + Bank Materi Kurikulum Merdeka" />

<div class="aiedu-section">
	<h2 class="section-title">✨ Generator Perangkat Ajar</h2>
	<div class="gen-grid">
		{#each GEN_TOOLS as tool}
			<a class="gen-card" href="/aiedu/generate/{tool.type}">
				<span class="gen-icon">{tool.icon}</span>
				<span class="gen-title">{tool.title}</span>
				<span class="gen-desc">{tool.desc}</span>
			</a>
		{/each}
	</div>
</div>

<div class="aiedu-section">
	<h2 class="section-title">🤖 AI Tools Guru</h2>
	<div class="gen-grid">
		{#each EXTRA_TOOLS as tool}
			<a class="gen-card" href={tool.href}>
				<span class="gen-icon">{tool.icon}</span>
				<span class="gen-title">{tool.title}</span>
				<span class="gen-desc">{tool.desc}</span>
			</a>
		{/each}
	</div>
</div>

<div class="aiedu-section">
	<h2 class="section-title">📚 Bank Materi Kurikulum Merdeka</h2>
	<div class="bank-filters">
		<button class="bank-chip" class:active={!bankMine && !bankFilter} onclick={() => { bankMine = false; bankFilter = ''; loadBank(); }}>Semua</button>
		{#each BANK_CATEGORIES as cat}
			<button class="bank-chip" class:active={!bankMine && bankFilter === cat.type} onclick={() => { bankMine = false; bankFilter = cat.type; loadBank(); }}>
				{cat.icon} {cat.title}
			</button>
		{/each}
		<button class="bank-chip" class:active={bankMine} onclick={() => { bankMine = true; bankFilter = ''; loadBank(); }}>📁 Materiku</button>
		<a class="bank-chip bank-chip-link" href="/aiedu/riwayat">🕘 Riwayat Generasi</a>
	</div>

	<div class="bank-grid">
		{#each bankDocs as doc}
			<a class="bank-card" href="/aiedu/bank/{doc.id}">
				<div class="bank-card-top">
					<span class="bank-type">{doc.doc_type.replace(/_/g, ' ')}</span>
					<span class="bank-source">{doc.source}</span>
				</div>
				<h3 class="bank-title">{doc.title}</h3>
				<p class="bank-subject">{doc.subject}</p>
			</a>
		{:else}
			<Card><CardContent><p class="bank-empty">Belum ada dokumen. Pilih kategori di atas.</p></CardContent></Card>
		{/each}
	</div>
</div>

<style>
	.aiedu-section { margin-bottom: 32px; }
	.section-title { font-size: 17px; margin: 0 0 14px; }
	.gen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
	.gen-card {
		display: flex; flex-direction: column; gap: 4px;
		background: white; border: 1px solid var(--border); border-radius: 12px;
		padding: 18px; text-decoration: none; color: inherit;
		transition: box-shadow 0.2s, transform 0.2s;
	}
	.gen-card:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); transform: translateY(-2px); }
	.gen-icon { font-size: 26px; margin-bottom: 6px; }
	.gen-title { font-size: 14px; font-weight: 700; }
	.gen-desc { font-size: 12px; color: var(--text-muted); }
	.bank-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
	.bank-chip {
		padding: 7px 14px; border: 1px solid var(--border); border-radius: 999px;
		background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text);
	}
	.bank-chip.active { background: #2563eb; color: white; border-color: #2563eb; }
	.bank-chip-link { text-decoration: none; color: inherit; }
	.bank-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
	.bank-card {
		background: white; border: 1px solid var(--border); border-radius: 12px;
		padding: 16px; text-decoration: none; color: inherit; transition: box-shadow 0.2s;
	}
	.bank-card:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); }
	.bank-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.bank-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2563eb; }
	.bank-source { font-size: 11px; color: var(--text-muted); background: var(--surface); padding: 2px 8px; border-radius: 999px; }
	.bank-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
	.bank-subject { font-size: 12px; color: var(--text-muted); margin: 0; }
	.bank-empty { color: var(--text-muted); font-size: 13px; text-align: center; padding: 12px; margin: 0; }
</style>
