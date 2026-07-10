<script lang="ts">
	import { user } from '$lib/stores/user.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules } from '$lib/stores/modules';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let lastReadSlug = $state<string | null>(null);

	onMount(() => {
		lastReadSlug = progress.getLastRead();
	});

	let lastReadModule = $derived(
		lastReadSlug ? modules.find(m => m.slug === lastReadSlug) : null
	);
</script>

<div class="landing">
	<section class="hero">
		<div class="hero-content">
			<span class="hero-badge">📘 RPL AI Curriculum v1.0</span>
			<h1>Kurikulum AI untuk <span class="gradient">Rekayasa Perangkat Lunak</span></h1>
			<p class="hero-desc">
				57 modul dari fundamental hingga advanced AI development.
				Dirancang untuk siswa SMK jurusan RPL yang ingin menguasai
				pengembangan software modern berbasis AI.
			</p>
			<div class="hero-actions">
				{#if user.isLoggedIn}
					<a href="/dashboard" class="btn btn-primary">Lanjut Belajar</a>
					<a href="/progress" class="btn btn-secondary">Lihat Progres</a>
				{:else}
					<a href="/login" class="btn btn-primary">Mulai Belajar</a>
					<a href="/dashboard" class="btn btn-secondary">Coba Lihat</a>
				{/if}
			</div>
		</div>
		<div class="hero-stats">
			<div class="stat">
				<span class="stat-value">57</span>
				<span class="stat-label">Modul</span>
			</div>
			<div class="stat">
				<span class="stat-value">200+</span>
				<span class="stat-label">Sesi Belajar</span>
			</div>
			<div class="stat">
				<span class="stat-value">12</span>
				<span class="stat-label">Bulan Kurikulum</span>
			</div>
		</div>
	</section>

	{#if lastReadModule}
		<section class="continue-section">
			<h2>Lanjutkan Belajar</h2>
			<a href="/module/{lastReadModule.slug}" class="continue-link">
				<span>{lastReadModule.title}</span>
				<span class="continue-arrow">&rarr;</span>
			</a>
		</section>
	{/if}

	<section class="overview">
		<h2>Ringkasan Modul</h2>
		<p class="section-desc">
			Kurikulum terbagi dalam beberapa kategori utama
		</p>
		<div class="category-grid">
			<div class="category-card">
				<span class="cat-icon">🌱</span>
				<h3>Fundamental (00-09)</h3>
				<p>Dasar pemrograman, web, git, Node.js, TypeScript, testing</p>
			</div>
			<div class="category-card">
				<span class="cat-icon">🏗️</span>
				<h3>Engineering (10-29)</h3>
				<p>Design patterns, system design, arsitektur, Docker, cloud</p>
			</div>
			<div class="category-card">
				<span class="cat-icon">🚀</span>
				<h3>Production (30-49)</h3>
				<p>Auth, performa, PWA, monitoring, payment, microservices</p>
			</div>
			<div class="category-card">
				<span class="cat-icon">🤖</span>
				<h3>AI & Advanced (50-56)</h3>
				<p>AI coding agents, prompt engineering, docs, advanced AI dev</p>
			</div>
		</div>
	</section>

	<footer class="landing-footer">
		<p>RPL AI Curriculum — Open source learning for SMK RPL students</p>
	</footer>
</div>

<style>
	.landing {
		max-width: 960px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		padding: 48px 0 32px;
	}

	.hero-badge {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		padding: 4px 14px;
		border-radius: 20px;
		margin-bottom: 16px;
	}

	h1 {
		font-size: 38px;
		font-weight: 800;
		line-height: 1.2;
		margin-bottom: 16px;
	}

	.gradient {
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-desc {
		font-size: 16px;
		color: var(--text-secondary);
		max-width: 600px;
		margin: 0 auto 28px;
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 40px;
	}

	.btn {
		padding: 12px 28px;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-secondary {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		border-color: var(--accent);
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		gap: 40px;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 32px;
		font-weight: 800;
		color: var(--text);
	}

	.stat-label {
		font-size: 13px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.continue-section {
		margin: 32px 0;
	}

	.continue-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.continue-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
		text-decoration: none !important;
		transition: all 0.2s ease;
	}

	.continue-link:hover {
		border-color: var(--accent);
	}

	.continue-arrow {
		font-size: 18px;
		color: var(--accent);
	}

	.overview {
		margin: 40px 0;
	}

	.overview h2 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.section-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 20px;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	.category-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
	}

	.cat-icon {
		font-size: 28px;
		display: block;
		margin-bottom: 10px;
	}

	.category-card h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 6px;
	}

	.category-card p {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.landing-footer {
		text-align: center;
		padding: 40px 0;
		color: var(--text-secondary);
		font-size: 13px;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 28px;
		}

		.hero-actions {
			flex-direction: column;
			align-items: center;
		}

		.hero-stats {
			gap: 20px;
		}

		.stat-value {
			font-size: 24px;
		}

		.category-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
