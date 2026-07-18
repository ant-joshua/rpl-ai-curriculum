<script lang="ts">
	import { Button, Card, EmptyState, ProgressBar, PageHeader } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();

	let certificates = $state(data.certificates || []);
	let progressItems = $state(data.progressItems || []);
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
	<PageHeader title="Sertifikat Saya" subtitle="Sertifikat kelulusan yang telah Anda terima" />

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Memuat sertifikat...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-text">{error}</p>
			<Button onclick={loadCerts}>Coba Lagi</Button>
		</div>
	{:else}
		<!-- In-progress offerings -->
		{#if progressItems.length > 0}
			<section class="in-progress-section">
				<h2 class="section-title">📊 Dalam Progres</h2>
				<div class="progress-list">
					{#each progressItems as item (item.offeringId)}
						<a href="/learn/{item.offeringId}" class="progress-card">
							<div class="progress-card-icon">{item.courseIcon}</div>
							<div class="progress-card-info">
								<h3 class="progress-card-title">{item.courseTitle}</h3>
								<p class="progress-card-offering">{item.offeringName}</p>
								<div class="progress-bar-wrapper">
									<ProgressBar value={item.percentage} showLabel={false} />
								</div>
								<p class="progress-hint">
									{item.completedLessons} dari {item.totalLessons} pelajaran selesai
									— selesaikan semua untuk mendapatkan sertifikat
								</p>
							</div>
							<div class="progress-card-arrow">&rarr;</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Earned certificates -->
		<section class="certs-section">
			<h2 class="section-title">🏆 Sertifikat Diperoleh</h2>
			{#if certificates.length === 0}
				<EmptyState
					icon="📜"
					title="Belum Ada Sertifikat"
					description="Selesaikan semua pelajaran dalam suatu kursus untuk mendapatkan sertifikat kelulusan."
				>
					<a href="/learn" class="browse-link">Jelajahi Kursus</a>
				</EmptyState>
			{:else}
				<div class="cert-list">
					{#each certificates as cert (cert.id)}
						<a href="/certificate/{cert.id}" class="cert-card">
							<div class="cert-card-icon">{cert.course_icon || '📜'}</div>
							<div class="cert-card-info">
								<h3 class="cert-card-title">{cert.course_title}</h3>
								<p class="cert-card-offering">{cert.offering_name}</p>
								<div class="cert-card-meta">
									<span class="status-badge issued">✅ Diterbitkan</span>
									<span class="cert-card-number">{cert.certificate_number}</span>
									<span class="cert-card-date">{formatDate(cert.issued_at)}</span>
								</div>
							</div>
							<div class="cert-card-actions">
								<button class="download-btn" onclick={(e) => { e.stopPropagation(); window.open('/certificate/' + cert.id); }}>
									⬇️
								</button>
							</div>
							<div class="cert-card-arrow">&rarr;</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>
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

	.section-title {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 12px;
	}

	/* In-progress section */
	.in-progress-section {
		margin-bottom: 36px;
	}

	.progress-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.progress-card {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.progress-card:hover {
		border-color: var(--accent);
		background: var(--surface-hover);
		transform: translateX(4px);
	}

	.progress-card-icon {
		font-size: 40px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.progress-card-info {
		flex: 1;
		min-width: 0;
	}

	.progress-card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 2px;
	}

	.progress-card-offering {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 10px;
	}

	.progress-bar-wrapper {
		margin-bottom: 6px;
	}

	.progress-hint {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.progress-card-arrow {
		font-size: 20px;
		color: var(--text-secondary);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.progress-card:hover .progress-card-arrow {
		color: var(--accent);
	}

	/* Certificates section */
	.certs-section {
		margin-bottom: 36px;
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

	.status-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 10px;
		border-radius: 4px;
		background: rgba(46, 204, 113, 0.1);
		color: #2ecc71;
		border: 1px solid rgba(46, 204, 113, 0.3);
	}

	.status-badge.issued { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border-color: rgba(46, 204, 113, 0.3); }

	.download-btn {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}
	.download-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.cert-card-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
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
