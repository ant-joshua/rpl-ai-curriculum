<script lang="ts">
	let deferredPrompt: any = $state(null);
	let showBanner = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
				setTimeout(() => { showBanner = true; }, 30000);
			});
			window.addEventListener('appinstalled', () => {
				showBanner = false;
				deferredPrompt = null;
			});
		}
	});

	async function install() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const result = await deferredPrompt.userChoice;
		if (result.outcome === 'accepted') showBanner = false;
		deferredPrompt = null;
	}

	function dismiss() { showBanner = false; }
</script>

{#if showBanner}
	<div class="pwa-install-banner">
		<div class="pwa-install-content">
			<span class="pwa-icon">📲</span>
			<div>
				<strong>Install RPL AI LMS</strong>
				<small>Akses cepat dari layar utama</small>
			</div>
		</div>
		<div class="pwa-install-actions">
			<button onclick={install} class="install-btn">Install</button>
			<button onclick={dismiss} class="dismiss-btn">✕</button>
		</div>
	</div>
{/if}

<style>
	.pwa-install-banner {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: #0f1011;
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 12px;
		padding: 0.75rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		z-index: 1000;
		max-width: 90vw;
		animation: slideUp 0.3s ease;
	}
	@keyframes slideUp {
		from { transform: translateX(-50%) translateY(100px); opacity: 0; }
		to { transform: translateX(-50%) translateY(0); opacity: 1; }
	}
	.pwa-install-content { display: flex; align-items: center; gap: 0.75rem; }
	.pwa-icon { font-size: 1.5rem; }
	.pwa-install-content div { display: flex; flex-direction: column; }
	.pwa-install-content strong { color: #1a1a2e; font-size: 0.9rem; }
	.pwa-install-content small { color: #64748b; font-size: 0.8rem; }
	.pwa-install-actions { display: flex; align-items: center; gap: 0.5rem; }
	.install-btn {
		background: linear-gradient(135deg, #4F46E5, #4F46E5);
		color: #fff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.install-btn:hover { opacity: 0.85; }
	.dismiss-btn {
		background: none;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		font-size: 1.1rem;
		padding: 0.25rem;
		line-height: 1;
	}
	.dismiss-btn:hover { color: #64748b; }
</style>
