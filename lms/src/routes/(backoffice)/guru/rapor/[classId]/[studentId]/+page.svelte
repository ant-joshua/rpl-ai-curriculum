<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Loading, Badge, Button, DataTable } from '$lib/components/ui/index.js';
import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	let classId = $state('');
	let studentId = $state('');
	let rapor: any = $state(null);
	let studentInfo: any = $state(null);
	let classInfo: any = $state(null);
	let loading = $state(true);
	let savingNote = $state(false);
	let error = $state('');
	let selectedSemester = $state('1');

	let homeroomNotes = $state('');

	const predikatColors: Record<string, string> = {
		A: '#22c55e', 'A-': '#27ae60', 'B+': '#5dade2',
		B: '#3b82f6', 'B-': '#85c1e9', 'C+': '#f59e0b',
		C: '#f59e0b', 'C-': '#d35400', 'D+': '#ef4444',
		D: '#c0392b', E: '#922b21',
	};

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('rapor');
			if (idx !== -1) {
				if (parts[idx + 1]) classId = parts[idx + 1];
				if (parts[idx + 2]) studentId = parts[idx + 2];
			}
			const sem = $page.url.searchParams.get('semester');
			if (sem) selectedSemester = sem;
		}
	});

	onMount(() => {
		if (!browser) return;
		loadRapor();
	});

	async function loadRapor() {
		if (!classId || !studentId) { setTimeout(() => loadRapor(), 100); return; }
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/rapor/${classId}/${studentId}?semester=${selectedSemester}`);
			const json = await res.json();
			if (json.success) {
				rapor = json.data;
				studentInfo = json.data?.student || {};
				classInfo = json.data?.class || {};
				homeroomNotes = json.data?.homeroom_notes || '';
			} else error = json.error || 'Gagal memuat rapor';
		} catch { error = 'Gagal memuat data rapor'; }
		finally { loading = false; }
	}

	async function saveNotes() {
		savingNote = true;
		try {
			const res = await fetch('/api/guru/rapor/notes', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					rapor_id: rapor.id,
					homeroom_notes: homeroomNotes,
				}),
			});
			const json = await res.json();
			if (!json.success) alert(json.error || 'Gagal menyimpan catatan');
		} catch { alert('Gagal menyimpan catatan'); }
		finally { savingNote = false; }
	}

	async function finalizeRapor() {
		if (!confirm('Finalize rapor ini? Setelah difinalize, rapor tidak dapat diedit tanpa unlock.')) return;
		try {
			const res = await fetch('/api/guru/rapor/finalize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rapor_id: rapor.id }),
			});
			const json = await res.json();
			if (json.success) loadRapor();
			else alert(json.error || 'Gagal finalize');
		} catch { alert('Gagal finalize rapor'); }
	}

	async function unlockRapor() {
		if (!confirm('Unlock rapor ini? Status akan kembali menjadi draft.')) return;
		try {
			const res = await fetch('/api/guru/rapor/unlock', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rapor_id: rapor.id }),
			});
			const json = await res.json();
			if (json.success) loadRapor();
			else alert(json.error || 'Gagal unlock');
		} catch { alert('Gagal unlock rapor'); }
	}

	function handlePrint() {
		window.print();
	}

	function predikatColor(pred: string | null): string {
		if (!pred) return 'var(--text-secondary)';
		return predikatColors[pred] || 'var(--text)';
	}

	function formatNa(val: number | null | undefined): string {
		if (val === null || val === undefined) return '-';
		return Number(val).toString();
	}

	function getStatusBadgeVariant(status: string): 'success' | 'primary' | 'outline' {
		if (status === 'finalized') return 'success';
		if (status === 'printed') return 'primary';
		return 'outline';
	}

	function getStatusLabel(status: string): string {
		if (status === 'finalized') return 'Finalized';
		if (status === 'printed') return 'Printed';
		return 'Draft';
	}
</script>

<svelte:head>
	<title>Rapor — {studentInfo?.name || studentInfo?.display_name || 'Siswa'} — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if rapor}
		<!-- Action Bar (no-print) -->
		<div class="action-bar no-print">
			<div class="breadcrumb">
				<a href="/guru/rapor/{classId}">← {t('rapor.daftar')}</a>
			</div>
			<div class="action-bar-right">
				<span class="status-label">
					{t('common.status')}: <Badge variant={getStatusBadgeVariant(rapor.status)}>{getStatusLabel(rapor.status)}</Badge>
				</span>
				{#if rapor.status === 'draft'}
					<Button onclick={finalizeRapor} variant="primary" size="sm">{t('rapor.finalize')}</Button>
				{/if}
				{#if rapor.status !== 'draft'}
					<Button onclick={unlockRapor} variant="secondary" size="sm">{t('rapor.unlock')}</Button>
				{/if}
				<Button onclick={handlePrint} variant="secondary" size="sm">{t('common.print')}</Button>
			</div>
		</div>

		<!-- Print Header -->
		<div class="print-header">
			<div class="print-logo">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
				</svg>
				<span>RPL AI Curriculum</span>
			</div>
			<div class="print-title">
				<h2>{t('rapor.laporan')}</h2>
				<p>{t('rapor.tahun_pelajaran')} {rapor.academic_year || rapor.tahun_ajaran || '-'}</p>
			</div>
		</div>

		<!-- Student Identity -->
		<div class="identity-section">
			<div class="identity-row">
				<span class="identity-label">{t('rapor.nama_siswa')}</span>
				<span class="identity-value">: {studentInfo?.name || studentInfo?.display_name || '-'}</span>
			</div>
			<div class="identity-row">
				<span class="identity-label">{t('rapor.kelas')}</span>
				<span class="identity-value">: {classInfo?.name || classInfo?.class_name || '-'}</span>
			</div>
			<div class="identity-row">
				<span class="identity-label">{t('rapor.semester')}</span>
				<span class="identity-value">: {selectedSemester === '1' ? t('rapor.ganjil') : t('rapor.genap')}</span>
			</div>
		</div>

		<!-- A. PENGETAHUAN -->
		<div class="section">
			<h3 class="section-title">{t('rapor.pengetahuan')}</h3>
			<div class="table-wrapper">
				<table class="grade-detail-table">
					<thead>
						<tr>
							<th class="no-col">{t('rapor.no')}</th>
							<th class="mapel-col">{t('rapor.mapel')}</th>
							<th class="score-col">{t('rapor.na')}</th>
							<th class="pred-col">{t('rapor.predikat')}</th>
							<th class="score-col">{t('rapor.kkm')}</th>
							<th class="desc-col">{t('rapor.keterangan')}</th>
						</tr>
					</thead>
					<tbody>
						{#each (rapor.subject_grades || []) as sg, i}
							{#if sg.na_pengetahuan != null}
								<tr>
									<td class="no-col">{i + 1}</td>
									<td class="mapel-col">{sg.subject_name || sg.mapel || '-'}</td>
									<td class="score-col">{formatNa(sg.na_pengetahuan)}</td>
									<td class="pred-col">
										<span class="predikat" style="color: {predikatColor(sg.predikat_pengetahuan)}">
											{sg.predikat_pengetahuan || '-'}
										</span>
									</td>
									<td class="score-col">{sg.kkm || sg.kkm_pengetahuan || '-'}</td>
									<td class="desc-col">{sg.deskripsi_pengetahuan || '-'}</td>
								</tr>
							{/if}
						{/each}
						{#if !(rapor.subject_grades || []).some((s: any) => s.na_pengetahuan != null)}
							<tr>
								<td class="empty-col" colspan="6">{t('rapor.belum_ada_pengetahuan')}</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- B. KETERAMPILAN -->
		<div class="section">
			<h3 class="section-title">{t('rapor.keterampilan')}</h3>
			<div class="table-wrapper">
				<table class="grade-detail-table">
					<thead>
						<tr>
							<th class="no-col">{t('rapor.no')}</th>
							<th class="mapel-col">{t('rapor.mapel')}</th>
							<th class="score-col">{t('rapor.na')}</th>
							<th class="pred-col">{t('rapor.predikat')}</th>
							<th class="score-col">{t('rapor.kkm')}</th>
							<th class="desc-col">{t('rapor.keterangan')}</th>
						</tr>
					</thead>
					<tbody>
						{#each (rapor.subject_grades || []) as sg, i}
							{#if sg.na_keterampilan != null}
								<tr>
									<td class="no-col">{i + 1}</td>
									<td class="mapel-col">{sg.subject_name || sg.mapel || '-'}</td>
									<td class="score-col">{formatNa(sg.na_keterampilan)}</td>
									<td class="pred-col">
										<span class="predikat" style="color: {predikatColor(sg.predikat_keterampilan)}">
											{sg.predikat_keterampilan || '-'}
										</span>
									</td>
									<td class="score-col">{sg.kkm || sg.kkm_keterampilan || '-'}</td>
									<td class="desc-col">{sg.deskripsi_keterampilan || '-'}</td>
								</tr>
							{/if}
						{/each}
						{#if !(rapor.subject_grades || []).some((s: any) => s.na_keterampilan != null)}
							<tr>
								<td class="empty-col" colspan="6">{t('rapor.belum_ada_keterampilan')}</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- C. SIKAP -->
		<div class="section">
			<h3 class="section-title">{t('rapor.sikap')}</h3>
			<div class="table-wrapper">
				<table class="sikap-table">
					<thead>
						<tr>
							<th class="aspek-col">{t('rapor.aspek')}</th>
							<th class="pred-col">{t('rapor.predikat')}</th>
							<th class="desc-col-wide">{t('rapor.deskripsi')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="aspek-col">{t('rapor.spiritual')}</td>
							<td class="pred-col">
								<span class="predikat" style="color: {predikatColor(rapor.attitude_spiritual)}">
									{rapor.attitude_spiritual || '-'}
								</span>
							</td>
							<td class="desc-col-wide">{rapor.attitude_spiritual_desc || '-'}</td>
						</tr>
						<tr>
							<td class="aspek-col">{t('rapor.sosial')}</td>
							<td class="pred-col">
								<span class="predikat" style="color: {predikatColor(rapor.attitude_social)}">
									{rapor.attitude_social || '-'}
								</span>
							</td>
							<td class="desc-col-wide">{rapor.attitude_social_desc || '-'}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- D. EKSTRAKURIKULER -->
		<div class="section">
			<h3 class="section-title">{t('rapor.ekstrakurikuler')}</h3>
			<div class="table-wrapper">
				<table class="ekstra-table">
					<thead>
						<tr>
							<th class="no-col">{t('rapor.no')}</th>
							<th class="mapel-col">{t('rapor.kegiatan')}</th>
							<th class="pred-col">{t('rapor.predikat')}</th>
							<th class="desc-col-wide">{t('rapor.keterangan')}</th>
						</tr>
					</thead>
					<tbody>
						{#each (rapor.extracurriculars || []) as ek, i}
							<tr>
								<td class="no-col">{i + 1}</td>
								<td class="mapel-col">{ek.name || ek.kegiatan || '-'}</td>
								<td class="pred-col">
									<span class="predikat" style="color: {predikatColor(ek.predikat)}">
										{ek.predikat || '-'}
									</span>
								</td>
								<td class="desc-col-wide">{ek.keterangan || ek.deskripsi || '-'}</td>
							</tr>
						{/each}
						{#if !(rapor.extracurriculars || []).length}
							<tr>
								<td class="empty-col" colspan="4">{t('rapor.tidak_ada_ekstra')}</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- E. ABSENSI -->
		<div class="section">
			<h3 class="section-title">{t('rapor.absensi')}</h3>
			<div class="absensi-grid">
				<div class="absensi-item">
					<span class="absensi-label">{t('rapor.sakit')}</span>
					<span class="absensi-value">{rapor.attendance_sick ?? 0}</span>
				</div>
				<div class="absensi-item">
					<span class="absensi-label">{t('rapor.izin')}</span>
					<span class="absensi-value">{rapor.attendance_permit ?? 0}</span>
				</div>
				<div class="absensi-item">
					<span class="absensi-label">{t('rapor.alpha')}</span>
					<span class="absensi-value">{rapor.attendance_absent ?? 0}</span>
				</div>
			</div>
		</div>

		<!-- F. CATATAN WALI KELAS -->
		<div class="section">
			<h3 class="section-title">{t('rapor.catatan_wali')}</h3>
			{#if rapor.status === 'draft'}
				<textarea
					class="notes-textarea"
					bind:value={homeroomNotes}
					placeholder={t('rapor.catatan_placeholder')}
					rows="4"
				></textarea>
				<div class="notes-actions">
					<Button onclick={saveNotes} disabled={savingNote} variant="secondary" size="sm">
						{savingNote ? t('nilai.menyimpan') : t('rapor.simpan_catatan')}
					</Button>
				</div>
			{:else}
				<p class="notes-display">{homeroomNotes || '—'}</p>
			{/if}
		</div>

		<!-- Signature Area (print only) -->
		<div class="signature-area">
			<div class="signature-box">
				<p>{t('rapor.mengetahui')}</p>
				<p class="signature-title">{t('rapor.kepala_sekolah')}</p>
				<div class="signature-space"></div>
				<p class="signature-name">_________________________</p>
				<p class="signature-nip">{t('rapor.nip')}</p>
			</div>
			<div class="signature-box">
				<p>{classInfo?.city || ''}, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
				<p class="signature-title">{t('rapor.wali_kelas')}</p>
				<div class="signature-space"></div>
				<p class="signature-name">{classInfo?.homeroom_teacher_name || '_________________________'}</p>
				<p class="signature-nip">{t('rapor.nip')}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1000px; }

	/* ── Action Bar (hidden on print) ── */
	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 8px;
	}
	.breadcrumb { font-size: 13px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.action-bar-right { display: flex; align-items: center; gap: 8px; }
	.status-label { font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

	/* ── Print Header ── */
	.print-header { display: none; }

	/* ── Identity ── */
	.identity-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px 20px;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.identity-row {
		font-size: 14px;
		display: flex;
		gap: 8px;
	}
	.identity-label {
		font-weight: 600;
		min-width: 120px;
		color: var(--text-secondary);
	}
	.identity-value { color: var(--text); font-weight: 500; }

	/* ── Sections ── */
	.section { margin-bottom: 24px; }
	.section-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0 0 8px;
		padding-bottom: 4px;
		border-bottom: 2px solid var(--accent);
		display: inline-block;
	}

	/* ── Tables ── */
	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
	.grade-detail-table,
	.sikap-table,
	.ekstra-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		min-width: 500px;
	}
	th {
		text-align: left;
		padding: 8px 10px;
		border-bottom: 2px solid var(--border);
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		white-space: nowrap;
		background: var(--surface);
	}
	td {
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}
	tr:last-child td { border-bottom: none; }

	.no-col { text-align: center; min-width: 32px; width: 32px; color: var(--text-secondary); font-weight: 500; }
	.mapel-col { min-width: 180px; }
	.score-col { text-align: center; font-weight: 600; min-width: 50px; }
	.pred-col { text-align: center; min-width: 70px; font-weight: 600; }
	.desc-col { min-width: 200px; color: var(--text-secondary); font-size: 12px; }
	.desc-col-wide { min-width: 250px; color: var(--text-secondary); font-size: 12px; }
	.aspek-col { min-width: 120px; font-weight: 600; }
	.empty-col { text-align: center; color: var(--text-quaternary); padding: 24px; font-style: italic; }
	.predikat { font-weight: 700; font-size: 14px; }

	/* ── Absensi ── */
	.absensi-grid {
		display: flex;
		gap: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px 20px;
	}
	.absensi-item {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.absensi-label {
		font-size: 13px;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.absensi-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text);
		min-width: 24px;
		text-align: center;
	}

	/* ── Notes ── */
	.notes-textarea {
		width: 100%;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		line-height: 1.5;
		resize: vertical;
		outline: none;
		box-sizing: border-box;
	}
	.notes-textarea:focus { border-color: var(--accent); }
	.notes-actions { margin-top: 8px; display: flex; gap: 8px; }
	.notes-display {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		font-size: 13px;
		color: var(--text);
		line-height: 1.6;
		margin: 0;
	}

	/* ── Signature ── */
	.signature-area { display: none; }

	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	/* ── Print Styles ── */
	@media print {
		@page { size: A4 portrait; margin: 15mm 12mm; }

		:global(body) { background: white !important; color: #111 !important; }
		* { box-shadow: none !important; text-shadow: none !important; }
		.no-print { display: none !important; }

		.page { max-width: 100%; padding: 0; margin: 0; }

		.print-header {
			display: flex !important;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 2px solid #222;
		}
		.print-logo { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #333; }
		.print-title h2 { margin: 0; font-size: 16px; color: #111; }
		.print-title p { margin: 4px 0 0; font-size: 12px; color: #555; }

		.identity-section { background: #fafafa; border-color: #ccc; border-radius: 4px; }
		.identity-label { color: #555; }
		.identity-value { color: #111; }

		.section-title { border-bottom-color: #555; }

		.table-wrapper { border-color: #ccc; border-radius: 4px; }
		th { background: #f5f5f5 !important; color: #333 !important; border-bottom-color: #999 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		td { border-bottom-color: #eee; }

		.absensi-grid { background: #fafafa; border-color: #ccc; border-radius: 4px; }
		.notes-display { background: #fafafa; border-color: #ccc; border-radius: 4px; }

		.signature-area {
			display: flex !important;
			justify-content: space-between;
			margin-top: 40px;
			padding-top: 10px;
		}
		.signature-box {
			text-align: center;
			font-size: 12px;
			color: #333;
			min-width: 200px;
		}
		.signature-title { font-weight: 700; margin-top: 4px; font-size: 12px; }
		.signature-space { height: 60px; }
		.signature-name { font-size: 12px; margin-top: 4px; font-weight: 600; }
		.signature-nip { font-size: 11px; color: #666; margin-top: 2px; }
	}
</style>
