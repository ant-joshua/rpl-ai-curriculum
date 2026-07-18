<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Input, Textarea, Button } from '$lib/components/ui';

  let announcements = $state<any[]>([]);
  let loading = $state(true);
  
  // Admin state
  let isAdmin = $state(false);
  let adminToken = $state('');
  let showAdmin = $state(false);
  let newTitle = $state('');
  let newContent = $state('');
  let newPathSlug = $state('');
  let submitting = $state(false);
  let message = $state('');

  onMount(async () => {
    await loadAnnouncements();
    if (browser) {
      const stored = localStorage.getItem('lms-admin');
      if (stored) {
        isAdmin = true;
        adminToken = stored;
      }
    }
  });

  async function loadAnnouncements() {
    loading = true;
    try {
      const res = await fetch('/api/announcements');
      const json = await res.json();
      if (json.success) announcements = json.data || [];
    } catch {}
    loading = false;
  }

  function toggleAdmin() {
    if (isAdmin) {
      isAdmin = false;
      adminToken = '';
      localStorage.removeItem('lms-admin');
    } else {
      const token = prompt('Admin token:');
      if (token) {
        adminToken = token;
        localStorage.setItem('lms-admin', token);
        isAdmin = true;
      }
    }
  }

  async function createAnnouncement() {
    if (!newTitle.trim() || !newContent.trim()) return;
    submitting = true;
    message = '';
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin': adminToken },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          path_slug: newPathSlug.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        announcements = [json.data, ...announcements];
        newTitle = '';
        newContent = '';
        newPathSlug = '';
        message = '✓ '+t('announcements.title')+' berhasil dibuat';
      } else {
        message = '✗ ' + (json.error || 'Gagal');
      }
    } catch {
      message = '✗ Gagal terhubung';
    }
    submitting = false;
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin': adminToken },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        announcements = announcements.filter(a => a.id !== id);
      }
    } catch {}
  }

  function priorityBadge(p: string) {
    if (p === 'high') return { class: 'badge-high', label: '🔥 Penting' };
    if (p === 'low') return { class: 'badge-low', label: 'ℹ️ Info' };
    return { class: 'badge-normal', label: '📌 Normal' };
  }

  function formatDate(d: string) {
    try {
      return new Date(d + 'Z').toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return d; }
  }
</script>

<div class="announcements-page">
  <div class="page-header">
    <h1>📢 Pengumuman</h1>
    <div class="header-actions">
      <button class="admin-toggle" onclick={toggleAdmin}>
        {isAdmin ? '🔒 Admin' : '🔑 Admin Login'}
      </button>
    </div>
  </div>

  {#if message}
    <div class="message" transition:fade={{ duration: 200 }}>{message}</div>
  {/if}

    {#if isAdmin}
    <div class="admin-form" transition:fade={{ duration: 200 }}>
      <h3>Buat Pengumuman Baru</h3>
      <Input label="Judul" bind:value={newTitle} placeholder="Judul" />
      <Textarea label="Konten" bind:value={newContent} placeholder="Konten (markdown)" rows={4} />
      <Input label="Path Slug (opsional)" bind:value={newPathSlug} placeholder="misal: /module/js-fundamentals" />
      <Button onclick={createAnnouncement} disabled={submitting}>
        {submitting ? 'Menyimpan...' : '📢 Publikasikan'}
      </Button>
    </div>
  {/if}

  <div class="announcements-list">
    {#if loading}
      <div class="empty">Memuat...</div>
    {:else if announcements.length === 0}
      <div class="empty">{t('announcements.empty')}</div>
    {:else}
      {#each announcements as ann (ann.id)}
        <div class="announcement-card" transition:fade={{ duration: 200 }}>
          <div class="ann-header">
            <div class="ann-title-row">
              <h2>{ann.title}</h2>
              <span class="priority-badge {priorityBadge(ann.priority).class}">{priorityBadge(ann.priority).label}</span>
            </div>
            {#if isAdmin}
              <button class="delete-btn" onclick={() => deleteAnnouncement(ann.id)} title="Hapus">🗑️</button>
            {/if}
          </div>
          <div class="ann-content">{ann.content}</div>
          <div class="ann-meta">
            <span>✍️ {ann.author}</span>
            <span>🕐 {formatDate(ann.created_at)}</span>
            {#if ann.path_slug}
              <span class="ann-path">📎 {ann.path_slug}</span>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .announcements-page { max-width: 720px; margin: 0 auto; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .page-header h1 { font-size: 1.4rem; }
  .header-actions { display: flex; gap: 0.5rem; }
  .admin-toggle { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.4rem 0.8rem; font-size: 0.8rem; cursor: pointer; color: var(--text); }
  .admin-toggle:hover { background: var(--hover); }
  .message { padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; }
  .admin-form { background: var(--surface); border: 1px solid var(--accent); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .admin-form h3 { font-size: 1rem; margin: 0; }
  .announcements-list { display: flex; flex-direction: column; gap: 1rem; }
  .announcement-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
  .ann-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
  .ann-title-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .ann-title-row h2 { font-size: 1.05rem; margin: 0; }
  .priority-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 12px; white-space: nowrap; }
  .badge-high { background: #fef2f2; color: #dc2626; }
  .badge-normal { background: var(--accent-dim); color: var(--accent); }
  .badge-low { background: var(--surface-hover); color: var(--text-secondary); }
  .delete-btn { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.25rem; opacity: 0.6; }
  .delete-btn:hover { opacity: 1; }
  .ann-content { font-size: 0.9rem; color: var(--text); line-height: 1.6; white-space: pre-wrap; margin-bottom: 0.75rem; }
  .ann-meta { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--text-secondary); }
  .ann-path { background: var(--accent-dim); color: var(--accent); padding: 0.1rem 0.4rem; border-radius: 4px; }
  .empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
</style>
