<script lang="ts">
	let { data }: { data: import('./$types').PageData } = $props();

	let cert = $state(data.cert);
	let pageError = $state(data.error);

	// Fallback: client-side fetch if server didn't have platform (client nav)
	$effect(() => {
		if (!cert && !pageError) {
			loadCert();
		}
	});

	async function loadCert() {
		try {
			const path = window.location.pathname;
			const id = path.split('/').pop();
			const res = await fetch(`/api/certificates/${id}`);
			const json = await res.json();
			if (json.success && json.data) {
				cert = json.data;
			} else {
				pageError = json.error || 'Certificate not found';
			}
		} catch {
			pageError = 'Failed to load certificate';
		}
	}

	function handlePrint() {
		window.print();
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
	<title>Certificate — RPL AI Curriculum</title>
</svelte:head>

<div class="cert-page">
	{#if !cert && !pageError}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading certificate...</p>
		</div>
	{:else if pageError}
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<h2>Certificate Not Found</h2>
			<p>{pageError}</p>
			<a href="/my/dashboard" class="back-link">&larr; Back to Dashboard</a>
		</div>
	{:else if cert}
		<div class="cert-actions no-print">
			<button onclick={handlePrint} class="print-btn">
				⬇️ Download / Cetak Sertifikat
			</button>
			<a href="/my/dashboard" class="dashboard-link">&larr; Dashboard</a>
		</div>

		<div class="certificate" id="certificate">
			<div class="cert-border-outer">
				<div class="cert-border-inner">
					<!-- Decorative corners -->
					<div class="corner corner-tl"></div>
					<div class="corner corner-tr"></div>
					<div class="corner corner-bl"></div>
					<div class="corner corner-br"></div>

					<!-- Top decorative stars -->
					<div class="cert-stars">
						<span class="star star-1">✦</span>
						<span class="star star-2">★</span>
						<span class="star star-3">✦</span>
						<span class="star star-4">★</span>
						<span class="star star-5">✦</span>
					</div>

					<div class="cert-content">
						<p class="cert-label">SERTIFIKAT PENYELESAIAN</p>

						<div class="cert-divider">
							<span class="divider-line"></span>
							<span class="divider-diamond">◆</span>
							<span class="divider-line"></span>
						</div>

						<p class="cert-subtitle">Diberikan kepada</p>

						<h1 class="cert-name">{cert.student_name}</h1>

						<p class="cert-body">
							Telah menyelesaikan <strong>{cert.course_title}</strong>
						</p>

						{#if cert.course_description}
							<p class="cert-desc">{cert.course_description}</p>
						{/if}

						<p class="cert-meta">{cert.offering_name}</p>

						<div class="cert-divider">
							<span class="divider-line"></span>
							<span class="divider-diamond">◆</span>
							<span class="divider-line"></span>
						</div>

						<div class="cert-footer">
							<div class="cert-date">
								<span class="footer-label">Tanggal Kelulusan</span>
								<span class="footer-value">{formatDate(cert.issued_at)}</span>
							</div>
							<div class="cert-number">
								<span class="footer-label">Nomor Sertifikat</span>
								<span class="footer-value cert-num">{cert.certificate_number}</span>
							</div>
							<div class="cert-signature">
								<span class="footer-label">RPL AI Curriculum</span>
								<div class="signature-line"></div>
								<span class="footer-sub">Tanda Tangan Digital</span>
							</div>
						</div>
					</div>

					<!-- Bottom decorative bar -->
					<div class="cert-bar"></div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.cert-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		margin: 0 auto 16px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-state {
		text-align: center;
		padding: 60px 20px;
	}

	.error-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.error-state h2 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.error-state p {
		color: var(--text-secondary);
		margin-bottom: 24px;
	}

	.back-link {
		display: inline-block;
		padding: 10px 24px;
		border-radius: 8px;
		background: var(--accent);
		color: #fff;
		font-weight: 600;
		text-decoration: none;
	}

	.back-link:hover {
		opacity: 0.9;
	}

	/* ===== Certificate actions ===== */
	.cert-actions {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.print-btn {
		padding: 14px 32px;
		border-radius: 10px;
		border: none;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary, #7c3aed));
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.print-btn:hover {
		opacity: 0.9;
	}

	.dashboard-link {
		padding: 14px 24px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.15s;
	}

	.dashboard-link:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* ===== Certificate design ===== */
	.certificate {
		padding: 20px;
	}

	.cert-border-outer {
		background: linear-gradient(135deg, #d4a017, #f0d060, #d4a017);
		border-radius: 20px;
		padding: 4px;
		box-shadow:
			0 0 40px rgba(212, 160, 23, 0.15),
			0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.cert-border-inner {
		background: linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e);
		border-radius: 17px;
		padding: 48px 40px 40px;
		position: relative;
		overflow: hidden;
	}

	/* Decorative corners */
	.corner {
		position: absolute;
		width: 40px;
		height: 40px;
		border-color: #d4a017;
		border-style: solid;
		opacity: 0.6;
	}

	.corner-tl {
		top: 16px;
		left: 16px;
		border-width: 2px 0 0 2px;
		border-radius: 4px 0 0 0;
	}

	.corner-tr {
		top: 16px;
		right: 16px;
		border-width: 2px 2px 0 0;
		border-radius: 0 4px 0 0;
	}

	.corner-bl {
		bottom: 16px;
		left: 16px;
		border-width: 0 0 2px 2px;
		border-radius: 0 0 0 4px;
	}

	.corner-br {
		bottom: 16px;
		right: 16px;
		border-width: 0 2px 2px 0;
		border-radius: 0 0 4px 0;
	}

	/* Top decorative stars */
	.cert-stars {
		text-align: center;
		margin-bottom: 24px;
	}

	.star {
		color: #d4a017;
		margin: 0 4px;
		display: inline-block;
		animation: twinkle 2s ease-in-out infinite;
	}

	.star-1 { font-size: 16px; animation-delay: 0s; }
	.star-2 { font-size: 22px; animation-delay: 0.3s; }
	.star-3 { font-size: 18px; animation-delay: 0.6s; }
	.star-4 { font-size: 24px; animation-delay: 0.9s; }
	.star-5 { font-size: 16px; animation-delay: 1.2s; }

	@keyframes twinkle {
		0%, 100% { opacity: 0.6; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.15); }
	}

	.cert-content {
		text-align: center;
		padding: 20px 10px;
	}

	.cert-label {
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.25em;
		color: #d4a017;
		text-transform: uppercase;
		margin-bottom: 12px;
	}

	.cert-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin: 16px 0;
	}

	.divider-line {
		display: block;
		width: 80px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #d4a017, transparent);
	}

	.divider-diamond {
		color: #d4a017;
		font-size: 10px;
	}

	.cert-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 8px;
		letter-spacing: 0.1em;
	}

	.cert-name {
		font-size: 36px;
		font-weight: 800;
		background: linear-gradient(135deg, #d4a017, #f0d060, #d4a017);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 16px;
		line-height: 1.2;
	}

	.cert-body {
		font-size: 15px;
		color: var(--text-secondary);
		line-height: 1.7;
		max-width: 460px;
		margin: 0 auto 4px;
	}

	.cert-body strong {
		color: #d4a017;
	}

	.cert-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
		max-width: 420px;
		margin: 0 auto 8px;
		opacity: 0.8;
	}

	.cert-meta {
		font-size: 12px;
		color: var(--text-secondary);
		margin-top: 8px;
		margin-bottom: 8px;
		opacity: 0.7;
		letter-spacing: 0.05em;
	}

	.cert-footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid rgba(212, 160, 23, 0.2);
		text-align: center;
	}

	.cert-date {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.cert-number {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.cert-signature {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.footer-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--text-secondary);
		font-weight: 600;
	}

	.footer-value {
		font-size: 14px;
		color: #d4a017;
		font-weight: 600;
	}

	.cert-num {
		font-size: 12px;
		font-family: monospace;
		letter-spacing: 0.05em;
	}

	.signature-line {
		width: 140px;
		height: 2px;
		background: #d4a017;
		margin: 6px 0 4px;
		border-radius: 1px;
	}

	.footer-sub {
		font-size: 10px;
		color: var(--text-secondary);
		letter-spacing: 0.05em;
	}

	/* Bottom decorative bar */
	.cert-bar {
		margin-top: 28px;
		height: 3px;
		background: linear-gradient(90deg, transparent, #d4a017, #f0d060, #d4a017, transparent);
		border-radius: 2px;
	}

	/* ===== Print styles ===== */
	@media print {
		.no-print {
			display: none !important;
		}

		.cert-page {
			padding: 0;
			max-width: 100%;
		}

		.certificate {
			padding: 0;
			page-break-inside: avoid;
		}

		.cert-border-outer {
			box-shadow: none;
		}

		.star {
			animation: none !important;
		}
	}
</style>
