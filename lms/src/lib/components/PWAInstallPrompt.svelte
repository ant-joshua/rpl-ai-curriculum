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
    position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1.5rem;
    box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.2)); z-index: 1000;
    max-width: 90vw; animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
  .pwa-install-content { display: flex; align-items: center; gap: 0.75rem; }
  .pwa-icon { font-size: 1.5rem; }
  .pwa-install-content div { display: flex; flex-direction: column; }
  .pwa-install-content strong { color: var(--text); font-size: 0.9rem; }
  .pwa-install-content small { color: var(--muted); font-size: 0.8rem; }
  .pwa-install-actions { display: flex; align-items: center; gap: 0.5rem; }
  .install-btn { background: var(--accent); color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
  .dismiss-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.2rem; padding: 0.25rem; }
</style>
