<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { Button, EmptyState, Badge, Alert, PageHeader } from '$lib/components/ui';

  interface Announcement {
    id: string;
    title: string;
    body: string;
    priority: string;
    created_at: string;
    creator_name: string | null;
    offering_name: string;
    offering_code: string;
    is_read: number;
  }

  let announcements = $state<Announcement[]>([]);
  let loading = $state(true);
  let error = $state('');
  let readIds = $state<Set<string>>(new Set());

  $effect(() => {
    loadAnnouncements();
  });

  async function loadAnnouncements() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/my/announcements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('lms-auth-token') || ''}` }
      });
      const json = await res.json();
      if (json.success) {
        announcements = json.data || [];
        // Pre-mark already read
        for (const a of announcements) {
          if (a.is_read > 0) readIds.add(a.id);
        }
        readIds = new Set(readIds);
      } else {
        error = json.error || 'Gagal memuat pengumuman';
      }
    } catch {
      error = 'Gagal terhubung ke server';
    } finally {
      loading = false;
    }
  }

  async function markRead(id: string) {
    if (readIds.has(id)) return;
    try {
      await fetch(`/api/my/announcements/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('lms-auth-token') || ''}` }
      });
      readIds.add(id);
      readIds = new Set(readIds);
    } catch { /* silent */ }
  }

  function priorityBadgeVariant(p: string): 'danger' | 'warning' | 'info' | 'default' {
    if (p === 'urgent') return 'danger';
    if (p === 'high') return 'warning';
    if (p === 'low') return 'default';
    return 'info';
  }

  function priorityLabel(p: string): string {
    if (p === 'urgent') return '🔴 Urgent';
    if (p === 'high') return '🔥 Penting';
    if (p === 'low') return 'ℹ️ Info';
    return '📌 Normal';
  }

  function formatDate(d: string) {
    try {
      return new Date(d + 'Z').toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return d; }
  }

  let unreadCount = $derived(announcements.filter(a => !readIds.has(a.id)).length);
</script>

<svelte:head>
  <title>Pengumuman Saya — LMS RPL</title>
</svelte:head>

<div class="page">
  <PageHeader title="Pengumuman" subtitle="Pengumuman terbaru dari kursus yang kamu ikuti">
    {#snippet action()}
      {#if !loading}
        <Badge variant="info">{unreadCount} belum dibaca</Badge>
      {/if}
    {/snippet}
  </PageHeader>

  {#if loading}
    <div class="loading"><div class="spinner"></div><p>Memuat pengumuman...</p></div>
  {:else if error}
    <Alert variant="danger">{error}</Alert>
  {:else if announcements.length === 0}
    <EmptyState icon="📢" title="Belum Ada Pengumuman" description="Belum ada pengumuman untuk kursus yang kamu ikuti." />
  {:else}
    <div class="announcements-list">
      {#each announcements as ann (ann.id)}
        <div
          class="announcement-card"
          class:unread={!readIds.has(ann.id)}
          onclick={() => markRead(ann.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter') markRead(ann.id); }}
        >
          <div class="ann-indicator"></div>
          <div class="ann-content">
            <div class="ann-header">
              <div class="ann-title-row">
                <h2>{ann.title}</h2>
                <Badge variant={priorityBadgeVariant(ann.priority)}>{priorityLabel(ann.priority)}</Badge>
              </div>
              <div class="ann-meta">
                <span>📖 {ann.offering_name}</span>
                <span>✍️ {ann.creator_name || 'Admin'}</span>
                <span>🕐 {formatDate(ann.created_at)}</span>
              </div>
            </div>
            <div class="ann-body">{ann.body}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 720px; margin: 0 auto; padding: 24px 16px 48px; }
  .page-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 24px;
  }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
  .subtitle { color: var(--text-secondary); font-size: 14px; margin: 0; }

  .loading { text-align: center; padding: 40px 20px; color: var(--text-secondary); }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid var(--border); border-top-color: var(--accent);
    border-radius: 50%; animation: spin 0.7s linear infinite;
    margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .announcements-list { display: flex; flex-direction: column; gap: 8px; }
  .announcement-card {
    display: flex; gap: 0;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; cursor: pointer;
    transition: all 0.15s ease;
  }
  .announcement-card:hover { border-color: var(--accent); background: var(--surface-hover); }
  .announcement-card.unread {
    border-left: 3px solid var(--accent);
    background: var(--accent-dim);
  }

  .ann-indicator { width: 4px; flex-shrink: 0; }
  .announcement-card.unread .ann-indicator { background: var(--accent); }

  .ann-content { flex: 1; padding: 16px 20px; min-width: 0; }
  .ann-title-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;
  }
  .ann-title-row h2 { font-size: 16px; margin: 0; font-weight: 600; }
  .announcement-card.unread .ann-title-row h2 { font-weight: 700; }
  .ann-meta {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;
  }
  .ann-body {
    font-size: 14px; color: var(--text); line-height: 1.6;
    white-space: pre-wrap;
  }
</style>
