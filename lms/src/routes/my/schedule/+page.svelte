<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Card, CardContent, EmptyState, Skeleton, PageHeader } from '$lib/components/ui';

  let schedules = $state<any[]>([]);
  let assignments = $state<any[]>([]);
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
        schedules = json.data?.schedules || [];
        assignments = json.data?.assignments || [];
      } else {
        error = json.error || 'Gagal memuat jadwal';
      }
    } catch {
      error = 'Gagal terhubung';
    } finally {
      loading = false;
    }
  }

  // Combine schedules + assignment deadlines into one event stream
  let allEvents = $derived.by(() => {
    const events: any[] = [];
    for (const s of schedules) {
      events.push({
        kind: 'schedule',
        date: s.start_time?.slice(0, 10),
        time: s.start_time,
        endTime: s.end_time,
        title: s.title || 'Kelas',
        offering: s.offering_name,
        courseIcon: s.course_icon || '📚',
        courseOfferingId: s.course_offering_id,
        id: s.id,
      });
    }
    for (const a of assignments) {
      events.push({
        kind: 'assignment',
        date: a.due_date?.slice(0, 10),
        time: a.due_date,
        endTime: null,
        title: a.title,
        offering: a.offering_name,
        courseIcon: a.course_icon || '📝',
        courseOfferingId: null,
        id: a.id,
        submissionStatus: a.submission_status,
        submissionScore: a.submission_score,
      });
    }
    return events.sort((a, b) => (a.date + ' ' + (a.time || '')).localeCompare(b.date + ' ' + (b.time || '')));
  });

  let filteredSchedules = $derived.by(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (filter === 'today') {
      return allEvents.filter((e: any) => e.date === today);
    }
    if (filter === 'upcoming') {
      return allEvents.filter((e: any) => e.date >= today);
    }
    return allEvents;
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

  function exportCalendar() {
    if (!browser) return;
    const token = localStorage.getItem('lms-auth-token');
    const url = `/api/my/calendar.ics${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  }
</script>

<svelte:head>
  <title>Jadwal Saya — LMS RPL</title>
</svelte:head>

<div class="schedule-page">
  <PageHeader title="Jadwal Saya" subtitle="Pantau jadwal kuliah dan kegiatan belajar">
    {#snippet action()}
      <div class="header-actions">
        <button class="export-cal-btn" onclick={exportCalendar} title="Export ke Google Calendar / iCal">
          📅 Export Kalender
        </button>
        <div class="filter-row">
          <button class="filter-btn" class:active={filter === 'upcoming'} onclick={() => filter = 'upcoming'}>Akan Datang</button>
          <button class="filter-btn" class:active={filter === 'today'} onclick={() => filter = 'today'}>Hari Ini</button>
          <button class="filter-btn" class:active={filter === 'all'} onclick={() => filter = 'all'}>Semua</button>
        </div>
      </div>
    {/snippet}
  </PageHeader>

  {#if loading}
    <Skeleton variant="card" count={3} />
  {:else if error}
    <Card>
      <CardContent>
        <div class="empty-mini"><p class="empty-text">{error}</p></div>
      </CardContent>
    </Card>
  {:else if schedules.length === 0 && assignments.length === 0}
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
              <a href={item.kind === 'assignment' ? `/my/assignments/${item.id}` : `/learn/${item.courseOfferingId}`} class="schedule-item" class:assignment-item={item.kind === 'assignment'}>
                <div class="item-time">
                  <span class="item-clock">{formatTime(item.time)}</span>
                  {#if item.endTime}
                    <span class="item-clock-end">- {formatTime(item.endTime)}</span>
                  {/if}
                </div>
                <div class="item-body">
                  <div class="item-header">
                    <span class="item-icon">{item.courseIcon || '📚'}</span>
                    <div>
                      <span class="item-title">
                        {item.kind === 'assignment' ? '⏰ ' : ''}{item.title}
                      </span>
                      <span class="item-offering">{item.offering}</span>
                    </div>
                  </div>
                  {#if item.kind === 'assignment'}
                    <div class="item-meta">
                      {#if item.submissionStatus === 'graded'}
                        <span class="meta-tag status-graded">✅ Dinilai {item.submissionScore ? `(${item.submissionScore}%)` : ''}</span>
                      {:else if item.submissionStatus === 'submitted'}
                        <span class="meta-tag status-submitted">📤 Sudah dikumpulkan</span>
                      {/if}
                      <span class="meta-tag">📝 Tugas</span>
                    </div>
                  {:else if item.description}
                    <p class="item-desc">{item.description}</p>
                    <div class="item-meta">
                      {#if item.location}
                        <span class="meta-tag">📍 {item.location}</span>
                      {/if}
                      {#if item.meeting_link}
                        <span class="meta-tag meta-link">🔗 Online</span>
                      {/if}
                    </div>
                  {/if}
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
  .page-header h1 { font-size: 24px; font-weight: 590; margin: 0; font-feature-settings: 'cv01', 'ss03'; letter-spacing: -0.288px; color: #1a1a2e; }
  .filter-row { display: flex; gap: 6px; }
  .filter-btn {
    padding: 6px 14px;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn:hover { color: #4F46E5; border-color: #4F46E5; }
  .filter-btn.active {
    background: rgba(79,70,229,0.12);
    color: #4F46E5;
    border-color: rgba(79,70,229,0.3);
  }
  .schedule-groups { display: flex; flex-direction: column; gap: 20px; }
  .day-group.today .day-title { color: #4F46E5; }
  .day-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .day-title { font-size: 16px; font-weight: 590; margin: 0; color: #1a1a2e; font-feature-settings: 'cv01', 'ss03'; }
  .today-badge {
    font-size: 11px;
    background: rgba(79,70,229,0.12);
    color: #4F46E5;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  .day-items { display: flex; flex-direction: column; gap: 8px; }
  .schedule-item {
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.15s;
  }
  .schedule-item:hover {
    background: rgba(0,0,0,0.04);
    border-color: rgba(255,255,255,0.12);
  }
  .schedule-item.assignment-item {
    border-left: 3px solid #f59e0b;
    background: rgba(245, 158, 11, 0.03);
  }
  .schedule-item.assignment-item:hover { border-left-color: #f59e0b; }
  .status-graded { background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .status-submitted { background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .item-time {
    min-width: 80px;
    text-align: right;
    flex-shrink: 0;
  }
  .item-clock { font-size: 14px; font-weight: 590; color: #1a1a2e; display: block; font-feature-settings: 'cv01', 'ss03'; }
  .item-clock-end { font-size: 12px; color: #64748b; }
  .item-body { flex: 1; min-width: 0; }
  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .item-icon { font-size: 20px; }
  .item-title { font-size: 14px; font-weight: 590; color: #1a1a2e; display: block; font-feature-settings: 'cv01', 'ss03'; }
  .item-offering { font-size: 12px; color: #64748b; }
  .item-desc { font-size: 12px; color: #64748b; margin: 4px 0 0; }

  .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .export-cal-btn {
    font-size: 12px;
    font-weight: 600;
    padding: 8px 14px;
    background: #4F46E5;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.15s;
    font-family: inherit;
  }
  .export-cal-btn:hover { opacity: 0.9; }
  .item-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
  .meta-tag { font-size: 11px; color: #64748b; }
  .meta-link { color: #4F46E5; }
  .empty-mini { text-align: center; padding: 20px; }
  .empty-text { color: #64748b; font-size: 14px; margin: 0; }
</style>
