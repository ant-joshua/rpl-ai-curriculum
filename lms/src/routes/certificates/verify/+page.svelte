<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { Card, CardContent, Spinner } from '$lib/components/ui';

	let cert = $state<any>(null);
	let loading = $state(true);
	let error = $state('');

	let code = $derived(page.url.searchParams.get('code') || '');

	onMount(async () => {
		if (!browser || !code) { loading = false; error = 'Kode sertifikat tidak ada'; return; }
		try {
			const res = await fetch(`/api/certificates/verify?code=${encodeURIComponent(code)}`);
			const json = await res.json();
			if (json.success) cert = json.data;
			else error = json.error || 'Sertifikat tidak ditemukan';
		} catch {
			error = 'Gagal verifikasi';
		} finally {
			loading = false;
		}
	});

	function formatDate(d: string): string {
		if (!d) return '';
		return d.replace('T', ' ').slice(0, 10);
	}
</script>

<svelte:head>
	<title>Verifikasi Sertifikat — RPL AI Curriculum</title>
</svelte:head>

<div class="verify-page">
	<header class="page-header">
		<h1>🔍 Verifikasi Sertifikat</h1>
		<p class="page-subtitle">Masukkan kode sertifikat untuk verifikasi publik</p>
	</header>

	<form class="verify-form" onsubmit={(e) => { e.preventDefault(); window.location.href = `/certificates/verify?code=${encodeURIComponent(code)}`; }}>
		<input
			class="verify-input"
			placeholder="Contoh: RPL-2026-ABC123"
			bind:value={code}
		/>
		<button class="verify-btn" type="submit">Verifikasi</button>
	</form>

	{#if loading}
		<div class="status"><Spinner /> Memeriksa...</div>
	{:else if error}
		<Card>
			<CardContent>
				<div class="result-invalid">
					<span class="result-icon">❌</span>
					<strong>Sertifikat Tidak Ditemukan</strong>
					<p>{error}</p>
				</div>
			</CardContent>
		</Card>
	{:else if cert}
		<Card class="verify-card">
			<CardContent>
				<div class="result-valid">
					<span class="result-icon">✅</span>
					<strong>Sertifikat Valid</strong>
				</div>
				<div class="cert-detail">
					<span class="detail-icon">{cert.courseIcon}</span>
					<div class="detail-info">
						<h2>{cert.courseTitle}</h2>
						<p>diberikan kepada <strong>{cert.userName}</strong></p>
						{#if cert.instructorName}<p>Pengajar: {cert.instructorName}</p>{/if}
						<p class="detail-meta">📅 Diterbitkan {formatDate(cert.issuedAt)}</p>
						<p class="detail-meta">No. <span class="mono">{cert.certNumber}</span></p>
						<a class="cert-view-link" href="/certificates/{cert.id}" target="_blank">🏆 Lihat Sertifikat (Print/PDF)</a>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	.verify-page { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
	.page-header { margin-bottom: 20px; }
	.page-header h1 { margin: 0 0 4px; font-size: 24px; }
	.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
	.verify-form { display: flex; gap: 8px; margin-bottom: 20px; }
	.verify-input {
		flex: 1; padding: 10px 14px; border: 1px solid var(--border);
		border-radius: 8px; font-size: 14px; font-family: monospace;
		text-transform: uppercase; background: white;
	}
	.verify-btn {
		padding: 10px 20px; background: #2563eb; color: white; border: none;
		border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
	}
	.verify-btn:hover { background: #1d4ed8; }
	.status { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.verify-card { margin-top: 8px; }
	.result-valid {
		display: flex; align-items: center; gap: 10px; padding: 12px 14px;
		background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
		color: #16a34a; font-size: 16px; margin-bottom: 16px;
	}
	.result-invalid {
		display: flex; flex-direction: column; align-items: center; gap: 8px;
		padding: 24px; text-align: center; color: #dc2626;
	}
	.result-invalid p { color: var(--text-muted); margin: 0; font-size: 13px; }
	.result-icon { font-size: 34px; }
	.cert-detail { display: flex; gap: 16px; align-items: flex-start; }
	.detail-icon { font-size: 40px; }
	.detail-info h2 { margin: 0 0 8px; font-size: 18px; }
	.detail-info p { margin: 0 0 4px; font-size: 13px; color: var(--text-muted); }
	.detail-info strong { color: var(--text); }
	.detail-meta { font-size: 12px !important; }
	.mono { font-family: monospace; font-size: 12px; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; }
	.cert-view-link { display: inline-block; margin-top: 10px; font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none; }
	.cert-view-link:hover { text-decoration: underline; }
</style>
