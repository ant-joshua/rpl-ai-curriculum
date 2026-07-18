<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	let status = $derived($page.status ?? 500);
	let message = $derived($page.error?.message || '');
	let is404 = $derived(status === 404);
</script>

<div class="error-page">
	<div class="error-card">
		<div class="error-icon">{is404 ? '🔍' : '⚠️'}</div>

		<div class="error-code">{status}</div>

		<h1 class="error-title">
			{is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}
		</h1>

		<p class="error-message">
			{#if is404}
				Halaman admin yang kamu cari tidak ada atau sudah dipindahkan.
			{:else if message}
				{message}
			{:else}
				Terjadi kesalahan di panel admin. Silakan coba lagi.
			{/if}
		</p>

		<a href="/admin" class="btn-accent">Kembali ke beranda</a>

		{#if dev && message}
			<details class="error-details">
				<summary>Detail teknis</summary>
				<pre class="error-stack">{#if $page.error && 'stack' in $page.error}{$page.error.stack}{:else}{message}{/if}</pre>
			</details>
		{/if}
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.error-card {
		text-align: center;
		max-width: 480px;
		width: 100%;
	}

	.error-icon {
		font-size: 48px;
		margin-bottom: 20px;
		line-height: 1;
	}

	.error-code {
		font-size: 28px;
		font-weight: 590;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		color: #f7f8f8;
		line-height: 1;
		letter-spacing: -0.5px;
		margin-bottom: 8px;
	}

	.error-title {
		font-size: 20px;
		font-weight: 590;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		color: #f7f8f8;
		margin: 0 0 8px;
		letter-spacing: -0.24px;
	}

	.error-message {
		font-size: 14px;
		font-weight: 400;
		font-family: inherit;
		color: #8a8f98;
		line-height: 1.6;
		margin: 0 0 32px;
		max-width: 360px;
		margin-left: auto;
		margin-right: auto;
	}

	.btn-accent {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		background: #5e6ad2;
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 510;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		text-decoration: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-accent:hover {
		background: #4f5bc4;
	}

	.error-details {
		margin-top: 32px;
		text-align: left;
	}

	.error-details summary {
		font-size: 12px;
		color: #8a8f98;
		cursor: pointer;
		user-select: none;
		transition: color 0.15s ease;
	}

	.error-details summary:hover {
		color: #f7f8f8;
	}

	.error-stack {
		margin-top: 8px;
		padding: 12px;
		font-size: 11px;
		font-family: 'SF Mono', SFMono-Regular, ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
		color: #8a8f98;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		white-space: pre-wrap;
		word-break: break-all;
		max-height: 240px;
		overflow: auto;
	}
</style>
