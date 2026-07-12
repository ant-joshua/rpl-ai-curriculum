<script lang="ts">
	import { modules } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { certificate } from '$lib/stores/certificate.svelte';
	import { user } from '$lib/stores/user.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		certificate.checkAndMark();
	});

	let eligible = $derived(certificate.isEligible);
	let completedMods = $derived(progress.completedCount);
	let totalMods = $derived(progress.totalModules);
	let pct = $derived(progress.getOverallProgress());
	let studentName = $derived(user.isLoggedIn ? user.username : 'Teman');
	let completedDate = $derived(certificate.completedDate ?? new Date().toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}));

	function handlePrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Sertifikat — RPL AI Curriculum</title>
</svelte:head>

<div class="cert-page">
	{#if !eligible}
		<!-- Not eligible: show progress -->
		<div class="not-eligible">
			<div class="not-eligible-icon">🎓</div>
			<h1>Sertifikat Belum Tersedia</h1>
			<p class="not-eligible-desc">
				Selesaikan semua <strong>{totalMods} modul</strong> untuk mendapatkan sertifikat kelulusan RPL AI Curriculum.
			</p>

			<div class="progress-summary">
				<div class="progress-ring">
					<svg viewBox="0 0 120 120">
						<circle cx="60" cy="60" r="52" class="ring-bg" />
						<circle
							cx="60" cy="60" r="52"
							class="ring-fill"
							stroke-dasharray="326.7"
							stroke-dashoffset={326.7 - (326.7 * pct) / 100}
						/>
					</svg>
					<span class="ring-text">{pct}%</span>
				</div>
				<div class="progress-stats">
					<div class="stat">
						<span class="stat-value">{completedMods}</span>
						<span class="stat-label">Modul Selesai</span>
					</div>
					<div class="stat-divider"></div>
					<div class="stat">
						<span class="stat-value">{totalMods - completedMods}</span>
						<span class="stat-label">Modul Tersisa</span>
					</div>
				</div>
			</div>

			<a href="/progress" class="progress-link">📈 Lihat Progres Belajar</a>
		</div>
	{:else}
		<!-- Eligible: show beautiful certificate -->
		<div class="cert-actions no-print">
			<button onclick={handlePrint} class="print-btn">
				⬇️ Download / Cetak Sertifikat
			</button>
		</div>

		<div class="certificate" id="certificate">
			<!-- Decorative border -->
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
						<p class="cert-label">SERTIFIKAT KELULUSAN</p>

						<div class="cert-divider">
							<span class="divider-line"></span>
							<span class="divider-diamond">◆</span>
							<span class="divider-line"></span>
						</div>

						<p class="cert-subtitle">Diberikan kepada</p>

						<h1 class="cert-name">{studentName}</h1>

						<p class="cert-body">
							Telah menyelesaikan <strong>57 modul</strong> RPL AI Curriculum
							dengan nilai kelulusan dan berhak atas sertifikat ini.
						</p>

						<div class="cert-divider">
							<span class="divider-line"></span>
							<span class="divider-diamond">◆</span>
							<span class="divider-line"></span>
						</div>

						<div class="cert-footer">
							<div class="cert-date">
								<span class="footer-label">Tanggal Kelulusan</span>
								<span class="footer-value">{completedDate}</span>
							</div>
							<div class="cert-seal">🏅</div>
							<div class="cert-signature">
								<span class="footer-label">RPL AI Curriculum</span>
								<div class="signature-line"></div>
								<span class="footer-sub">Authorized Certificate</span>
							</div>
						</div>
					</div>

					<!-- Bottom decorative gradient bar -->
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

	/* ===== Not eligible state ===== */
	.not-eligible {
		text-align: center;
		padding: 60px 20px;
	}

	.not-eligible-icon {
		font-size: 64px;
		margin-bottom: 20px;
	}

	.not-eligible h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 12px;
	}

	.not-eligible-desc {
		color: var(--text-secondary);
		font-size: 16px;
		line-height: 1.6;
		max-width: 480px;
		margin: 0 auto 40px;
	}

	.progress-summary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 40px;
		margin-bottom: 40px;
	}

	.progress-ring {
		position: relative;
		width: 120px;
		height: 120px;
	}

	.progress-ring svg {
		width: 120px;
		height: 120px;
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: var(--border);
		stroke-width: 8;
	}

	.ring-fill {
		fill: none;
		stroke: var(--accent);
		stroke-width: 8;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.5s ease;
	}

	.ring-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 700;
		color: var(--accent);
	}

	.progress-stats {
		display: flex;
		align-items: center;
		gap: 30px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 32px;
		font-weight: 700;
		color: var(--text);
	}

	.stat-label {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 4px;
	}

	.stat-divider {
		width: 1px;
		height: 48px;
		background: var(--border);
	}

	.progress-link {
		display: inline-block;
		padding: 12px 28px;
		border-radius: 10px;
		background: var(--accent);
		color: #fff;
		font-size: 15px;
		font-weight: 600;
		text-decoration: none !important;
		transition: opacity 0.15s;
	}

	.progress-link:hover {
		opacity: 0.9;
	}

	/* ===== Certificate actions ===== */
	.cert-actions {
		display: flex;
		justify-content: center;
		margin-bottom: 24px;
	}

	.print-btn {
		padding: 14px 32px;
		border-radius: 10px;
		border: none;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.print-btn:hover {
		opacity: 0.9;
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
		margin: 0 auto 8px;
	}

	.cert-body strong {
		color: #d4a017;
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

	.cert-seal {
		font-size: 48px;
		flex: 0 0 auto;
		padding: 0 20px;
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
	}

	/* Bottom decorative gradient bar */
	.cert-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, transparent, #d4a017, #f0d060, #d4a017, transparent);
	}

	/* ===== Print styles ===== */
	@media print {
		:global(.no-print) {
			display: none !important;
		}

		:global(body) {
			background: #fff !important;
		}

		.cert-page {
			max-width: 100%;
			padding: 0;
		}

		.certificate {
			padding: 0;
			page-break-inside: avoid;
		}

		.cert-border-outer {
			box-shadow: none;
			border-radius: 0;
			padding: 3px;
		}

		.cert-border-inner {
			border-radius: 0;
			padding: 60px 40px 50px;
		}

		.corner {
			opacity: 0.8;
		}

		.star {
			animation: none !important;
		}
	}
</style>
