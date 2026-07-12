<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-page">
	<h1 class="error-code">{$page.status}</h1>
	<p class="error-message">Halaman tidak ditemukan</p>
	{#if $page.error?.message}
		<p class="error-description">{$page.error.message}</p>
	{/if}
	<div class="error-actions">
		<a href="/" class="btn btn-primary">🏠 Beranda</a>
		<a href="/dashboard" class="btn btn-secondary">📚 Dashboard</a>
		<a href="/search" class="btn btn-secondary">🔍 Cari</a>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
		text-align: center;
		padding: 2rem;
	}

	.error-code {
		font-size: clamp(5rem, 20vw, 10rem);
		font-weight: 900;
		background: linear-gradient(135deg, var(--accent, #6c5ce7), var(--accent-secondary, #a29bfe));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.error-message {
		font-size: clamp(1.2rem, 4vw, 2rem);
		font-weight: 700;
		color: var(--text, #e0e0e0);
		margin-bottom: 0.5rem;
	}

	.error-description {
		color: var(--text-secondary, #888);
		font-size: 1rem;
		margin-bottom: 2rem;
		max-width: 480px;
	}

	.error-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s ease;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--accent, #6c5ce7);
		color: #fff !important;
	}

	.btn-primary:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: var(--surface, #1e1e2e);
		color: var(--text, #e0e0e0) !important;
		border: 1px solid var(--border, #333);
	}

	.btn-secondary:hover {
		background: var(--hover, #2a2a3e);
		transform: translateY(-1px);
	}
</style>
