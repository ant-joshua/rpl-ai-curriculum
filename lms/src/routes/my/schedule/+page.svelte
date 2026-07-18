<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Card, CardContent, EmptyState, Loading, PageHeader } from '$lib/components/ui';

  let schedules = $state<any[]>([]);
  let loading = $state(true);
  let error = $state('');

  let filter = $state<'all' | 'today' | 'upcoming'>('upcoming');

  onMount(() => {
    if (browser) loadSchedules();
  });

  async function loadSchedules() {
    loading = true;
    error = '';
    try {
      const token = localStorage.getItem('lms-auth-token');
      const res = await fetch('/api/my/schedules', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) {
        schedules = json.data || [];
      } else {
        error = json.error || 'Gagal memuat jadwal';
      }
    } catch {
      error = 'Gagal terhubung';
    } finally {
      loading = false;
    }
  }

  let filteredSchedules = $derived.by(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (filter === 'today') {
      return schedules.filter((s: any) => s.start_time?.slice(0, 10) === today);
    }
    if (filter === 'upcoming') {
      return schedules.filter((s: any) => s.start_time >= now.toISOString());
    }
    return schedules;
  });

  let groupedSchedules = $derived.by(() => {
    const groups: Record<string, any[]> = {};
    for (const s of filteredSchedules) {
      const day = s.start_time?.slice(0, 10) || 'unknown';
      if (!groups[day]) groups[day] = [];
      groups[day].push(s);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  });

  function formatDate(dt: string): string {
    const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(dt: string): string {
    const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function isToday(dt: string): boolean {
    return dt?.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }
</script>

<svelte:head>
  <title>Jadwal Saya — LMS RPL</title>
</svelte:head>

<div class="schedule-page">
  <PageHeader title="Jadwal Saya" subtitle="Pantau jadwal kuliah dan kegiatan belajar">
    {#snippet action()}
      <div class="filter-row">
        <button class="filter-btn" class:active={filter === 'upcoming'} onclick={() => filter = 'upcoming'}>Akan Datang</button>
        <button class="filter-btn" class:active={filter === 'today'} onclick={() => filter = 'today'}>Hari Ini</button>
        <button class="filter-btn" class:active={filter === 'all'} onclick={() => filter = 'all'}>Semua</button>
      </div>
    {/snippet}
  </PageHeader>

  {#if loading}
    <Loading />
  {:else if error}
    <Card>
      <CardContent>
        <div class="empty-mini"><p class="empty-text">{error}</p></div>
      </CardContent>
    </Card>
  {:else if schedules.length === 0}
    <EmptyState icon="📅" title="Belum ada jadwal" description="Kamu belum memiliki jadwal untuk kursus yang terdaftar" />
  {:else if groupedSchedules.length === 0}
    <EmptyState icon="📅" title="Tidak ada jadwal" description="Tidak ada jadwal dengan filter ini" />
  {:else}
    <div class="schedule-groups">
      {#each groupedSchedules as [date, items]}
        <div class="day-group" class:today={isToday(date)}>
          <div class="day-header">
            <h2 class="day-title">{formatDate(date)}</h2>
            {#if isToday(date)}
              <span class="today-badge">Hari Ini</span>
            {/if}
          </div>
          <div class="day-items">
            {#each items as item}
              <a href="/learn/{item.course_offering_id}" class="schedule-item">
                <div class="item-time">
                  <span class="item-clock">{formatTime(item.start_time)}</span>
                  {#if item.end_time}
                    <span class="item-clock-end">- {formatTime(item.end_time)}</span>
                  {/if}
                </div>
                <div class="item-body">
                  <div class="item-header">
                    <span class="item-icon">{item.course_icon || '📚'}</span>
                    <div>
                      <span class="item-title">{item.title}</span>
                      <span class="item-offering">{item.offering_name}</span>
                    </div>
                  </div>
                  {#if item.description}
                    <p class="item-desc">{item.description}</p>
                  {/if}
                  <div class="item-meta">
                    {#if item.location}
                      <span class="meta-tag">📍 {item.location}</span>
                    {/if}
                    {#if item.meeting_link}
                      <span class="meta-tag meta-link">🔗 Online</span>
                    {/if}
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .schedule-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .page-header h1 { font-size: 24px; font-weight: 700; margin: 0; }
  .filter-row { display: flex; gap: 6px; }
  .filter-btn {
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    background: transparent;
    color: #8a8f98;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn:hover { color: #f7f8f8; border-color: rgba(255,255,255,0.15); }
  .filter-btn.active {
    background: rgba(94,106,210,0.15);
    color: #7170ff;
    border-color: rgba(94,106,210,0.3);
  }
  .schedule-groups { display: flex; flex-direction: column; gap: 20px; }
  .day-group.today .day-title { color: #7170ff; }
  .day-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .day-title { font-size: 16px; font-weight: 600; margin: 0; color: #f7f8f8; }
  .today-badge {
    font-size: 11px;
    background: rgba(94,106,210,0.15);
    color: #7170ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  .day-items { display: flex; flex-direction: column; gap: 8px; }
  .schedule-item {
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.15s;
  }
  .schedule-item:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.12);
  }
  .item-time {
    min-width: 80px;
    text-align: right;
    flex-shrink: 0;
  }
  .item-clock { font-size: 14px; font-weight: 600; color: #f7f8f8; display: block; }
  .item-clock-end { font-size: 12px; color: #8a8f98; }
  .item-body { flex: 1; min-width: 0; }
  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .item-icon { font-size: 20px; }
  .item-title { font-size: 14px; font-weight: 600; color: #f7f8f8; display: block; }
  .item-offering { font-size: 12px; color: #8a8f98; }
  .item-desc { font-size: 12px; color: #8a8f98; margin: 4px 0 0; }
  .item-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
  .meta-tag { font-size: 11px; color: #62666d; }
  .meta-link { color: #7170ff; }
  .empty-mini { text-align: center; padding: 20px; }
  .empty-text { color: #8a8f98; font-size: 14px; margin: 0; }
</style>
