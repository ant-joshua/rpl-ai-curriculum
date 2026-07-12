<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  
  let errorMessage = $derived($page.error?.message || 'Terjadi kesalahan');
</script>

<div class="error-page">
  <div class="error-card">
    <div class="error-code">{$page.status}</div>
    <h1>{#if $page.status === 404}Halaman Tidak Ditemukan{:else}Oops!{/if}</h1>
    <p>{#if $page.status === 404}
      Halaman yang kamu cari tidak ada atau sudah dipindahkan.
    {:else}
      Terjadi kesalahan. Coba refresh halaman atau kembali.
    {/if}</p>
    <div class="error-actions">
      <a href="/" class="btn-primary">🏠 Ke Dashboard</a>
      <a href="javascript:history.back()" class="btn-secondary">⬅️ Kembali</a>
    </div>
    {#if dev && $page.error?.stack}
      <pre class="error-stack">{$page.error.stack}</pre>
    {/if}
  </div>
</div>

<style>
  .error-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg); padding: 2rem; }
  .error-card { text-align: center; max-width: 500px; background: var(--surface); border-radius: var(--radius); padding: 3rem; border: 1px solid var(--border); }
  .error-code { font-size: 5rem; font-weight: 800; color: var(--accent); line-height: 1; margin-bottom: 0.5rem; }
  h1 { font-size: 1.5rem; margin-bottom: 1rem; color: var(--text); }
  p { color: var(--muted); margin-bottom: 2rem; line-height: 1.6; }
  .error-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border-radius: var(--radius); text-decoration: none; font-weight: 600; transition: 0.2s; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-secondary { background: var(--surface-hover); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .error-stack { margin-top: 2rem; text-align: left; font-size: 0.8rem; color: var(--muted); max-height: 300px; overflow: auto; white-space: pre-wrap; }
</style>
