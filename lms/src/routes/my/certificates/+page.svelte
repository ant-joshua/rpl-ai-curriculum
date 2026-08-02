<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { EmptyState, Spinner, Card, CardContent } from '$lib/components/ui';

	let certificates = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		if (!browser) return;
		try {
			const res = await fetch('/api/my/certificates');
			const json = await res.json();
			if (json.success) certificates = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	});

	function formatDate(d: string): string {
		if (!d) return '';
		return d.replace('T', ' ').slice(0, 10);
	}
</script>

<svelte:head>
	<title>Sertifikat Saya — RPL AI Curriculum</title>
</svelte:head>

<div class="certs-page">
	<header class="page-header">
		<h1>🏆 Sertifikat Saya</h1>
		<p class="page-subtitle">Sertifikat kelulusan kursus yang sudah kamu selesaikan</p>
	</header>

	{#if loading}
		<div class="loading"><Spinner /> Memuat...</div>
	{:else if certificates.length === 0}
		<EmptyState icon="award" title="Belum ada sertifikat" description="Selesaikan kursus untuk mendapatkan sertifikat." />
	{:else}
		<div class="cert-grid">
			{#each certificates as cert}
				<Card class="cert-card">
					<CardContent>
						<div class="cert-head">
							<span class="cert-icon">{cert.courseIcon}</span>
							<span class="cert-valid">✓ Valid</span>
						</div>
						<h2 class="cert-title">{cert.courseTitle}</h2>
						<p class="cert-name">diberikan kepada<br /><strong>{cert.userName}</strong></p>
						{#if cert.instructorName}
							<p class="cert-instructor">Pengajar: {cert.instructorName}</p>
						{/if}
						<p class="cert-date">📅 {formatDate(cert.issuedAt)}</p>
						<p class="cert-number">No. {cert.certNumber}</p>
						<div class="cert-actions">
							<a class="cert-verify-link" href="/certificates/verify?code={cert.certNumber}" target="_blank">🔍 Verifikasi Publik</a>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.certs-page { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
	.page-header { margin-bottom: 24px; }
	.page-header h1 { margin: 0 0 4px; font-size: 24px; }
	.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.cert-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
	.cert-card { position: relative; overflow: hidden; }
	.cert-card::before {
		content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
		background: linear-gradient(90deg, #f59e0b, #2563eb, #16a34a);
	}
	.cert-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.cert-icon { font-size: 34px; }
	.cert-valid { font-size: 11px; font-weight: 700; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 999px; }
	.cert-title { font-size: 17px; margin: 0 0 10px; line-height: 1.3; }
	.cert-name { font-size: 13px; color: var(--text-muted); margin: 0 0 8px; line-height: 1.5; }
	.cert-name strong { color: var(--text); }
	.cert-instructor, .cert-date { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; }
	.cert-number { font-size: 11px; color: #94a3b8; margin: 10px 0 0; font-family: monospace; }
	.cert-actions { margin-top: 12px; }
	.cert-verify-link {
		font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none;
	}
	.cert-verify-link:hover { text-decoration: underline; }
</style>
