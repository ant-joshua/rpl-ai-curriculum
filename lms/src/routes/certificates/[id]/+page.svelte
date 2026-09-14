<script lang="ts">
	import { browser } from '$app/environment';
	import { EmptyState, Button } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();
	let cert = $derived(data.cert);
	let error = $derived(data.error);

	function formatDate(d: string): string {
		if (!d) return '';
		const dt = new Date(d);
		return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function print() {
		if (browser) window.print();
	}
</script>

<svelte:head>
	<title>{cert ? `Sertifikat — ${cert.courseTitle}` : 'Sertifikat'} — RPL AI Curriculum</title>
	{#if cert}
		<style>
			@media print {
				@page { size: A4 landscape; margin: 0; }
				body * { visibility: hidden; }
				.certificate-sheet, .certificate-sheet * { visibility: visible; }
				.certificate-sheet { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
				.print-actions { display: none !important; }
			}
		</style>
	{/if}
</svelte:head>

<div class="cert-page">
	{#if error === 'not-found'}
		<EmptyState icon="search-x" title="Sertifikat tidak ditemukan" description="Periksa kembali link sertifikat." />
	{:else if !cert}
		<EmptyState icon="loader" title="Memuat..." description="Mengambil data sertifikat." />
	{:else}
		<div class="print-actions">
			<Button onclick={print}>🖨️ Cetak / Simpan PDF</Button>
			<a class="back-link" href="/my/certificates">← Kembali</a>
		</div>

		<div class="certificate-sheet">
			<div class="cert-border">
				<div class="cert-body">
					<p class="cert-org">RPL AI CURRICULUM</p>
					<p class="cert-org-sub">Certificate of Completion</p>

					<p class="cert-line">Sertifikat ini diberikan kepada</p>
					<h1 class="cert-name">{cert.userName}</h1>
					<p class="cert-line">atas keberhasilan menyelesaikan kursus</p>
					<h2 class="cert-course">{cert.courseIcon} {cert.courseTitle}</h2>

					{#if cert.instructorName}
						<p class="cert-line">dibimbing oleh <strong>{cert.instructorName}</strong></p>
					{/if}

					<div class="cert-footer">
						<div class="cert-date-block">
							<p class="cert-date-label">Diterbitkan</p>
							<p class="cert-date-value">{formatDate(cert.issuedAt)}</p>
						</div>
						<div class="cert-sign-block">
							<div class="sign-line"></div>
							<p class="sign-role">Kepala Program RPL</p>
						</div>
					</div>

					<p class="cert-number">No. {cert.certNumber}</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.cert-page { max-width: 1100px; margin: 0 auto; padding: 20px 16px 40px; }
	.print-actions { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
	.back-link { font-size: 13px; color: var(--text-muted); text-decoration: none; }
	.back-link:hover { text-decoration: underline; }

	.certificate-sheet {
		aspect-ratio: 1.414;
		background: white;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
	}
	.cert-border {
		height: 100%;
		border: 3px solid var(--accent);
		border-radius: 4px;
	}
	.cert-body {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30px 60px;
		text-align: center;
		position: relative;
	}
	.cert-org {
		font-family: 'Inter', sans-serif;
		font-size: 20px; font-weight: 800; letter-spacing: 4px; color: var(--accent);
		margin: 0 0 2px;
	}
	.cert-org-sub {
		font-family: 'Inter', sans-serif;
		font-size: 13px; font-weight: 600; letter-spacing: 3px; color: var(--text-muted);
		text-transform: uppercase; margin: 0 0 18px;
	}
	.cert-line { font-size: 15px; color: var(--text-secondary); margin: 4px 0; }
	.cert-name {
		font-family: 'Source Serif 4', Georgia, serif;
		font-size: 40px; font-weight: 700; color: var(--text);
		margin: 6px 0 4px; letter-spacing: 0.5px;
	}
	.cert-course {
		font-family: 'Source Serif 4', Georgia, serif;
		font-size: 22px; font-weight: 600; color: var(--accent);
		margin: 4px 0 12px; padding-bottom: 16px;
		border-bottom: 1px solid var(--border); max-width: 80%;
	}
	.cert-footer {
		width: 100%; display: flex; justify-content: space-between; align-items: flex-end;
		margin-top: 26px; padding: 0 20px;
	}
	.cert-date-block { text-align: left; }
	.cert-date-label { font-family: 'Inter', sans-serif; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin: 0; }
	.cert-date-value { font-family: 'Inter', sans-serif; font-size: 15px; color: var(--text); font-weight: 600; margin: 2px 0 0; }
	.cert-sign-block { text-align: center; }
	.sign-line { width: 180px; border-top: 1px solid var(--text); margin-bottom: 6px; }
	.sign-role { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-secondary); margin: 0; }
	.cert-number {
		position: absolute; bottom: 16px; right: 28px;
		font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted);
	}
</style>
