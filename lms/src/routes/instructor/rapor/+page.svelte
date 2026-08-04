<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, Button, Alert, Spinner, EmptyState, Badge } from '$lib/components/ui';

	let offerings = $state<any[]>([]);
	let selectedOffering = $state('');
	let data = $state<any>(null);
	let loading = $state(false);
	let generating = $state(false);
	let results = $state<any[]>([]);
	let error = $state('');
	let successMsg = $state('');

	onMount(() => {
		if (!browser) return;
		fetch('/api/instructor/courses').then((r) => r.json()).then((j) => { if (j.success) offerings = j.data || []; }).catch(() => {});
	});

	async function loadData() {
		error = '';
		results = [];
		successMsg = '';
		if (!selectedOffering) { data = null; return; }
		loading = true;
		try {
			const res = await fetch(`/api/instructor/rapor-batch?offering_id=${selectedOffering}`);
			const json = await res.json();
			if (json.success) data = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal memuat data'; } finally { loading = false; }
	}

	async function generateAll() {
		if (!data?.students?.length) { error = 'Tidak ada siswa aktif'; return; }
		generating = true;
		error = '';
		successMsg = '';
		try {
			const res = await fetch('/api/instructor/rapor-batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ offering_id: selectedOffering, students: data.students }),
			});
			const json = await res.json();
			if (json.success) {
				results = json.data || [];
				successMsg = `${results.length} rapor berhasil digenerate ✅`;
			} else error = json.error || 'Gagal generate';
		} catch { error = 'Gagal generate rapor'; } finally { generating = false; }
	}

	function printStudentRapor(s: any) {
		const win = window.open('', '_blank');
		if (!win) return;
		const raporHtml = (s.rapor_text || '').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		const avgColor = s.avg_pct >= 80 ? '#16a34a' : s.avg_pct >= 70 ? '#ca8a04' : '#dc2626';
		const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
		const schoolName = 'Sekolah Negeri Terbaik';
		win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapor ${s.name}</title>
<style>
@page { size: A4; margin: 20mm 18mm; }
@media print { body { margin: 0; } .page-break { page-break-after: always; } }
body { font-family: 'Times New Roman', serif; color: #1e293b; line-height: 1.5; }
.header { text-align: center; padding-bottom: 18px; border-bottom: 2px solid #1e293b; margin-bottom: 22px; }
.school { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; color: #0f172a; }
.address { font-size: 11px; color: #475569; margin: 2px 0 10px; }
.meta { display: grid; grid-template-columns: 120px 1fr; gap: 4px 12px; font-size: 13px; }
.section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #94a3b8; margin: 20px 0 10px; padding-bottom: 4px; }
.avg-box { display: inline-block; padding: 12px 24px; border-radius: 10px; background: ${avgColor}15; border: 2px solid ${avgColor}; font-size: 28px; font-weight: bold; color: ${avgColor}; margin: 10px 0; }
.rapor-text { font-size: 13px; line-height: 1.7; white-space: pre-wrap; }
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; text-align: center; font-size: 13px; }
.sig-label { font-size: 11px; color: #64748b; margin-bottom: 40px; }
</style></head><body>
<div class="header">
	<h2 class="school">${schoolName}</h2>
	<div class="address">Jl. Pendidikan No. 123 · Telp: (021) 1234567</div>
	<h3 style="margin:0;font-size:16px;">RAPOR PEMBELAJARAN</h3>
</div>
<div class="meta">
	<span>Nama Siswa</span><span><strong>${s.name}</strong></span>
	<span>Email</span><span>${s.email || '-'}</span>
	<span>Kelas</span><span>${data?.offering?.name || ''}</span>
	<span>Rata-rata</span><span class="avg-box">${s.avg_pct}%</span>
	<span>Penilaian</span><span>${s.assessment_count} asesmen</span>
	<span>Tanggal Cetak</span><span>${date}</span>
</div>
${raporHtml ? `<div class="section-title">Deskripsi Guru</div><div class="rapor-text">${raporHtml}</div>` : ''}
<div class="signatures">
	<div><div class="sig-label">Guru</div>________________________</div>
	<div><div class="sig-label">Orang Tua</div>________________________</div>
</div>
</body></html>`);
		win.document.close();
		setTimeout(() => win.print(), 300);
	}

	function printAllRapors() {
		for (const s of results) printStudentRapor(s);
	}
</script>

<PageHeader title="Rapor Batch" subtitle="Generate rapor semua siswa sekaligus dari gradebook, cetak per siswa" />

{#if error}<Alert variant="danger" class="mb">{error}</Alert>{/if}
{#if successMsg}<Alert variant="success" class="mb">{successMsg}</Alert>{/if}

<div class="rapor-layout">
	<div class="rapor-left">
		<Card>
			<CardContent>
				<h3 class="section-title">Pilih Kelas</h3>
				<div class="form-row">
					<select bind:value={selectedOffering} onchange={loadData} class="offering-select">
						<option value="">— Pilih kelas —</option>
						{#each offerings as o (o.id)}
							<option value={o.id}>{o.name || o.code || o.id}</option>
						{/each}
					</select>
				</div>
			</CardContent>
		</Card>

		{#if loading}
			<div class="center"><Spinner /></div>
		{:else if data?.students?.length}
			<Card class="mt">
				<CardContent>
					<div class="summary-bar">
						<span>👥 {data.students.length} siswa aktif</span>
						<span>📝 {data.assessments?.length || 0} asesmen</span>
						<span>📊 {data.submissions?.length || 0} submission</span>
					</div>
					<div class="student-list">
						{#each data.students as s (s.user_id)}
							<div class="student-item">
								<span class="student-name">{s.display_name || s.username || s.email}</span>
							</div>
						{/each}
					</div>
					<div class="form-actions">
						<Button variant="primary" fullWidth onclick={generateAll} loading={generating}>
							🤖 Generate Rapor Semua Siswa
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else if data}
			<EmptyState icon="users" title="Tidak ada siswa" description="Belum ada siswa aktif di kelas ini." />
		{/if}
	</div>

	<div class="rapor-right">
		{#if results.length > 0}
			<Card>
				<CardContent>
					<div class="results-header">
						<h3 class="section-title">Hasil Rapor ({results.length})</h3>
					</div>
					<div class="results-list">
						{#each results as r, i (r.user_id || i)}
							<div class="result-item">
								<div class="result-info">
									<span class="result-name">{r.name}</span>
									<span class="result-avg">{r.avg_pct}% · {r.assessment_count} asesmen</span>
									{#if r.error}<span class="result-error">{r.error}</span>{/if}
								</div>
								<Button variant="outline" size="sm" onclick={() => printStudentRapor(r)}>🖨️ Cetak</Button>
							</div>
						{/each}
					</div>
					<div class="mt">
						<Button variant="secondary" fullWidth onclick={printAllRapors}>📥 Cetak Semua Rapor</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.mt { margin-top: 16px; }
	.rapor-layout { display: grid; grid-template-columns: 1fr 380px; gap: 18px; align-items: start; }
	.section-title { font-size: 15px; margin: 0 0 12px; }
	.offering-select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; font-family: inherit; }
	.form-row { display: flex; gap: 10px; }
	.center { display: flex; justify-content: center; padding: 20px; }
	.summary-bar { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); padding-bottom: 12px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
	.student-list { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
	.student-item { padding: 8px 11px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; }
	.student-name { font-weight: 500; }
	.form-actions { margin-top: 4px; }
	.results-header { display: flex; justify-content: space-between; align-items: center; }
	.results-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
	.result-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 9px; }
	.result-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.result-name { font-size: 13px; font-weight: 600; }
	.result-avg { font-size: 11px; color: var(--text-muted); }
	.result-error { font-size: 11px; color: #dc2626; }
	@media (max-width: 900px) { .rapor-layout { grid-template-columns: 1fr; } }
</style>
