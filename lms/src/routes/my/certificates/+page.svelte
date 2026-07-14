<script lang="ts">
	let { data }: { data: import('./$types').PageData } = $props();

	let certificates = $state(data.certificates || []);
	let error = $state(data.error || null);
	let loading = $state(!data.certificates && !data.error);

	$effect(() => {
		if (!data.certificates && !data.error && !loading) {
			loadCerts();
		}
	});

	async function loadCerts() {
		loading = true;
		try {
			const res = await fetch('/api/my/certificates', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('lms-auth-token') || ''}`
				}
			});
			const json = await res.json();
			if (json.success) {
				certificates = json.data || [];
			} else {
				error = json.error || 'Failed to load certificates';
			}
		} catch {
			error = 'Failed to load certificates';
		} finally {
			loading = false;
		}
	}

	function formatDate(iso: string): string {
		if (!iso) return '';
		try {
			return new Date(iso + 'T00:00:00Z').toLocaleDateString('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch {
			return iso;
		}
	}
</script>

<svelte:head>
	<title>My Certificates — RPL AI Curriculum</title>
</svelte:head>

<div class="certs-page">
	<header class="page-header">
		<h1>🎓 Sertifikat Saya</h1>
		<p class="subtitle">Sertifikat kelulusan yang telah Anda terima</p>
	</header>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Memuat sertifikat...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-text">{error}</p>
			<button onclick={loadCerts} class="retry-btn">Coba Lagi</button>
		</div>
	{:else if certificates.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📜</div>
			<h2>Belum Ada Sertifikat</h2>
			<p>Selesaikan semua pelajaran dalam suatu kursus untuk mendapatkan sertifikat kelulusan.</p>
			<a href="/learn" class="browse-link">Jelajahi Kursus</a>
		</div>
	{:else}
		<div class="cert-list">
			{#each certificates as cert (cert.id)}
				<a href="/certificate/{cert.id}" class="cert-card">
					<div class="cert-card-icon">{cert.course_icon || '📜'}</div>
					<div class="cert-card-info">
						<h3 class="cert-card-title">{cert.course_title}</h3>
						<p class="cert-card-offering">{cert.offering_name}</p>
						<div class="cert-card-meta">
							<span class="cert-card-number">{cert.certificate_number}</span>
							<span class="cert-card-date">{formatDate(cert.issued_at)}</span>
						</div>
					</div>
					<div class="cert-card-arrow">&rarr;</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.certs-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px 48px;
	}

	.page-header {
		margin-bottom: 28px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 700;
		margin: 0 0 6px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.loading {
		text-align: center;
		padding: 40px 20px;
		color: var(--text-secondary);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		margin: 0 auto 12px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-state {
		text-align: center;
		padding: 40px 20px;
	}

	.error-text {
		color: var(--danger);
		margin-bottom: 16px;
	}

	.retry-btn {
		padding: 10px 24px;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: #fff;
		font-weight: 600;
		cursor: pointer;
	}

	.retry-btn:hover {
		opacity: 0.9;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 8px;
	}

	.empty-state p {
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.6;
		max-width: 400px;
		margin: 0 auto 24px;
	}

	.browse-link {
		display: inline-block;
		padding: 12px 28px;
		border-radius: 10px;
		background: var(--accent);
		color: #fff;
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
	}

	.browse-link:hover {
		opacity: 0.9;
	}

	/* Certificate list */
	.cert-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.cert-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.cert-card:hover {
		border-color: #d4a017;
		background: var(--surface-hover);
		transform: translateX(4px);
	}

	.cert-card-icon {
		font-size: 40px;
		flex-shrink: 0;
	}

	.cert-card-info {
		flex: 1;
		min-width: 0;
	}

	.cert-card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 2px;
	}

	.cert-card-offering {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 6px;
	}

	.cert-card-meta {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.cert-card-number {
		font-size: 11px;
		font-family: monospace;
		color: #d4a017;
		background: rgba(212, 160, 23, 0.1);
		padding: 2px 8px;
		border-radius: 4px;
		font-weight: 600;
	}

	.cert-card-date {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.cert-card-arrow {
		font-size: 20px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.cert-card:hover .cert-card-arrow {
		color: #d4a017;
	}
</style>
