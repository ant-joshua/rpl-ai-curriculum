<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { addToast } from '$lib/stores/toast.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { browser } from '$app/environment';

	let { data }: { data: import('./$types').PageData } = $props();

	let offerings = $state(data.offerings || []);
	let isAuthenticated = $state(false);
	let enrollingId = $state<string | null>(null);

	$effect(() => {
		if (browser) {
			isAuthenticated = auth.isLoggedIn;
		}
	});

	let levelFilter = $state<string>('all');
	let categoryFilter = $state<string>('all');

	let categories = $derived([...new Set(offerings.map(o => o.category).filter(Boolean))]);

	let filteredOfferings = $derived(
		offerings.filter(o => {
			if (levelFilter !== 'all' && o.level !== levelFilter) return false;
			if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
			return true;
		})
	);

	async function handleEnroll(offeringId: string) {
		if (!isAuthenticated) {
			addToast('Silakan login terlebih dahulu untuk mendaftar', 'warning');
			return;
		}

		enrollingId = offeringId;
		try {
			const token = localStorage.getItem('lms-auth-token');
			const res = await fetch('/api/my/enroll', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { 'Authorization': `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ offeringId }),
			});
			const body = await res.json();

			if (body.success) {
				addToast('Berhasil mendaftar! Selamat belajar 🎉', 'success');
				// Update local state
				offerings = offerings.map(o =>
					o.id === offeringId
						? { ...o, isEnrolled: true, enrolledCount: o.enrolledCount + 1 }
						: o
				);
			} else {
				addToast(body.error || 'Gagal mendaftar', 'error');
			}
		} catch {
			addToast('Gagal menghubungi server', 'error');
		} finally {
			enrollingId = null;
		}
	}

	function levelColor(level: string): string {
		const colors: Record<string, string> = {
			beginner: 'var(--success)',
			intermediate: 'var(--warning)',
			advanced: 'var(--accent-secondary)',
		};
		return colors[level] || 'var(--text-secondary)';
	}

	function levelLabel(level: string): string {
		const labels: Record<string, string> = {
			beginner: 'Pemula',
			intermediate: 'Menengah',
			advanced: 'Lanjutan',
		};
		return labels[level] || level;
	}
</script>

<svelte:head>
	<title>Katalog Course — RPL AI Curriculum</title>
</svelte:head>

<div class="catalog-page">
	<header class="catalog-header">
		<div>
			<h1>📚 Katalog Course</h1>
			<p class="catalog-subtitle">Jelajahi dan daftar course yang tersedia</p>
		</div>
	</header>

	<!-- Filters -->
	<div class="catalog-filters">
		<select class="filter-select" bind:value={levelFilter}>
			<option value="all">Semua Level</option>
			<option value="beginner">Pemula</option>
			<option value="intermediate">Menengah</option>
			<option value="advanced">Lanjutan</option>
		</select>

		<select class="filter-select" bind:value={categoryFilter}>
			<option value="all">Semua Kategori</option>
			{#each categories as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>

		<span class="result-count">{filteredOfferings.length} course</span>
	</div>

	<!-- Offerings Grid -->
	{#if filteredOfferings.length === 0}
		<div class="empty-state" transition:fade>
			<span class="empty-icon">🔍</span>
			<h3>Tidak ada course ditemukan</h3>
			<p>Coba ubah filter atau cari kata kunci lain</p>
		</div>
	{:else}
		<div class="catalog-grid">
			{#each filteredOfferings as offering, i (offering.id)}
				<article
					class="offering-card"
					transition:fly={{ y: 20, duration: 300, delay: i * 40 }}
					class:enrolled={offering.isEnrolled}
				>
					<div class="card-top">
						<span class="card-icon">{offering.icon}</span>
						<div class="card-info">
							<h3 class="card-title">{offering.courseTitle}</h3>
							{#if offering.name !== offering.courseTitle}
								<p class="card-offering-name">{offering.name}</p>
							{/if}
							{#if offering.code}
								<span class="card-code">{offering.code}</span>
							{/if}
						</div>
					</div>

					<p class="card-desc">{offering.description || 'Tidak ada deskripsi'}</p>

					<div class="card-meta">
						<span class="meta-badge" style="background: {levelColor(offering.level)}20; color: {levelColor(offering.level)}">
							{levelLabel(offering.level)}
						</span>
						{#if offering.category}
							<span class="meta-tag">{offering.category}</span>
						{/if}
					</div>

					<div class="card-stats">
						<span class="stat">
							👥 {offering.enrolledCount}{offering.maxStudents ? ` / ${offering.maxStudents}` : ''} terdaftar
						</span>
						{#if offering.startDate}
							<span class="stat">📅 Mulai {new Date(offering.startDate).toLocaleDateString('id-ID')}</span>
						{/if}
					</div>

					<div class="card-action">
						{#if offering.isEnrolled}
							<a href="/learn/{offering.id}/syllabus" class="btn btn-secondary">
								Lanjut Belajar →
							</a>
						{:else if !offering.spotsAvailable}
							<button class="btn btn-disabled" disabled>Penuh</button>
						{:else}
							<button
								class="btn btn-primary"
								onclick={() => handleEnroll(offering.id)}
								disabled={enrollingId === offering.id}
							>
								{#if enrollingId === offering.id}
									<span class="spinner-sm"></span> Mendaftar...
								{:else}
									+ Daftar Course
								{/if}
							</button>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	.catalog-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 16px;
		animation: fadeIn 0.3s ease both;
	}

	.catalog-header {
		margin-bottom: 24px;
	}

	.catalog-header h1 {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.catalog-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
	}

	/* Filters */
	.catalog-filters {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 10px 14px;
		font-size: 14px;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		color: var(--text);
		outline: none;
		cursor: pointer;
		transition: border-color 0.15s ease;
		appearance: auto;
	}

	.filter-select:focus {
		border-color: var(--accent);
	}

	.result-count {
		margin-left: auto;
		font-size: 13px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Grid */
	.catalog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 14px;
	}

	/* Card */
	.offering-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 20px;
		transition: all 0.2s ease;
	}

	.offering-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.offering-card.enrolled {
		border-color: var(--success);
		background: linear-gradient(135deg, var(--surface), rgba(46, 125, 50, 0.03));
	}

	.card-top {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.card-icon {
		font-size: 32px;
		line-height: 1;
		flex-shrink: 0;
	}

	.card-info {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
	}

	.card-offering-name {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 2px 0 0;
	}

	.card-code {
		display: inline-block;
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		padding: 2px 8px;
		border-radius: 6px;
		margin-top: 4px;
	}

	.card-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 3;
		margin: 0;
	}

	.card-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.meta-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 20px;
	}

	.meta-tag {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--hover);
		padding: 3px 10px;
		border-radius: 20px;
	}

	.card-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		font-size: 12px;
		color: var(--text-secondary);
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.card-action {
		margin-top: auto;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 600;
		font-family: inherit;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none;
		width: 100%;
		justify-content: center;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: #fff;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--success);
		color: #fff;
	}

	.btn-secondary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
	}

	.btn-disabled {
		background: var(--border);
		color: var(--text-secondary);
		cursor: not-allowed;
	}

	/* Spinner */
	.spinner-sm {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.5s linear infinite;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 80px 20px;
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 8px;
	}

	.empty-state p {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Responsive */
	@media (max-width: 768px) {
		.catalog-grid {
			grid-template-columns: 1fr;
		}

		.catalog-header h1 {
			font-size: 22px;
		}

		.catalog-filters {
			flex-direction: column;
			align-items: stretch;
		}

		.result-count {
			margin-left: 0;
			text-align: right;
		}
	}
</style>
