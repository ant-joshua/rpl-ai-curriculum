<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Card, EmptyState, PageHeader, StatCard } from '$lib/components/ui';

  let { data }: { data: import('./$types').PageData } = $props();

  let enrollments = $derived(data.enrollments || []);
  let authToken = $derived(data.token || '');

  // Selected offering
  let selectedOfferingId = $state<string>('');
  let loading = $state(false);
  let saving = $state(false);
  let error = $state('');

  // Plan data
  let plan = $state<any>(null);
  let offering = $state<any>(null);
  let progress = $state<any>(null);
  let weeks = $state<any[]>([]);
  let recommendations = $state<any>(null);

  // Form state
  let targetPerWeek = $state(3);
  let startWeek = $state('');
  let dailyReminder = $state(false);
  let reminderTime = $state('09:00');

  // Time tracking
  let studyMinutes = $state(0);
  let studyGoalMinutes = $state(30);
  let weeklyLog: { date: string; minutes: number }[] = [];

  // Show setup form
  let showSetup = $state(false);
  let showTimeTracking = $state(false);
  let activeTab = $state<'overview' | 'weekly' | 'time'>('overview');

  let apiBase = '/api/my/planner';

  function apiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };
  }

  // ── Time tracking ──
  function loadTimeLog() {
    if (!browser) return;
    try {
      const raw = localStorage.getItem('lms-study-time-log');
      if (raw) weeklyLog = JSON.parse(raw);
    } catch {}
  }

  function saveTimeLog() {
    if (!browser) return;
    localStorage.setItem('lms-study-time-log', JSON.stringify(weeklyLog));
  }

  function logStudyTime(minutes: number) {
    const today = new Date().toISOString().split('T')[0];
    const existing = weeklyLog.find(e => e.date === today);
    if (existing) {
      existing.minutes += minutes;
    } else {
      weeklyLog.push({ date: today, minutes });
    }
    studyMinutes += minutes;
    saveTimeLog();
  }

  let todayMinutes = $derived.by(() => {
    const today = new Date().toISOString().split('T')[0];
    return weeklyLog.find(e => e.date === today)?.minutes || 0;
  });

  let thisWeekMinutes = $derived.by(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startStr = startOfWeek.toISOString().split('T')[0];
    return weeklyLog
      .filter(e => e.date >= startStr)
      .reduce((sum, e) => sum + e.minutes, 0);
  });

  let totalStudyDays = $derived(weeklyLog.filter(e => e.minutes >= 10).length);
  let studyStreak = $derived.by(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const entry = weeklyLog.find(e => e.date === key);
      if (entry && entry.minutes >= 10) streak++;
      else break;
    }
    return streak;
  });

  // ── Plan loading ──

  async function loadPlan() {
    if (!selectedOfferingId) return;
    loading = true;
    error = '';
    try {
      const res = await fetch(`${apiBase}?offeringId=${selectedOfferingId}`, { headers: apiHeaders() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load plan');
      const d = json.data;
      plan = d.plan;
      offering = d.offering;
      progress = d.progress;
      weeks = d.weeks || [];
      recommendations = d.recommendations;

      if (plan) {
        targetPerWeek = plan.target_lessons_per_week;
        startWeek = plan.start_week;
        dailyReminder = plan.daily_reminder;
        reminderTime = plan.reminder_time || '09:00';
        showSetup = false;
      } else {
        if (offering?.start_date) {
          startWeek = offering.start_date.slice(0, 10);
        } else {
          startWeek = new Date().toISOString().slice(0, 10);
        }
        showSetup = true;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      error = msg;
    } finally {
      loading = false;
    }
  }

  async function savePlan() {
    if (!selectedOfferingId) return;
    saving = true;
    error = '';
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          course_offering_id: selectedOfferingId,
          target_lessons_per_week: targetPerWeek,
          start_week: startWeek,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save plan');
      showSetup = false;
      await loadPlan();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      error = msg;
    } finally {
      saving = false;
    }
  }

  async function saveReminder() {
    if (!selectedOfferingId) return;
    saving = true;
    try {
      const res = await fetch(`${apiBase}/reminder`, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          course_offering_id: selectedOfferingId,
          daily_reminder: dailyReminder,
          reminder_time: reminderTime,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save reminder');
      plan = { ...plan, daily_reminder: dailyReminder, reminder_time: reminderTime };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      error = msg;
    } finally {
      saving = false;
    }
  }

  function handleOfferingChange() {
    plan = null;
    offering = null;
    progress = null;
    weeks = [];
    recommendations = null;
    showSetup = false;
    loadPlan();
  }

  // ── Today's schedule ──
  let todayTasks = $derived.by(() => {
    if (!weeks.length || !plan) return [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentWeek = weeks.find(w => w.weekStart <= todayStr && w.weekEnd >= todayStr);
    if (!currentWeek) return [];

    const tasks: { day: string; label: string }[] = [];
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const dayName = days[now.getDay()];

    if (currentWeek.target > 0) {
      const perDay = Math.ceil(currentWeek.target / 7);
      tasks.push({ day: dayName, label: `Target: ${perDay} sesi` });
    }
    if (recommendations?.next_lesson_slug) {
      tasks.push({ day: dayName, label: recommendations.next_lesson_title || 'Lanjut belajar' });
    }
    return tasks;
  });

  // ── Helpers ──
  function statusLabel(s: string): string {
    if (s === 'ahead') return 'Di Depan';
    if (s === 'on_track') return 'On Track';
    if (s === 'behind') return 'Tertinggal';
    return s;
  }

  function statusColor(s: string): string {
    if (s === 'ahead' || s === 'on_track') return 'var(--success)';
    if (s === 'behind') return 'var(--danger)';
    return 'var(--text-secondary)';
  }

  function weekStatusIcon(s: string): string {
    if (s === 'ahead' || s === 'on_track') return '✅';
    if (s === 'behind') return '⚠️';
    if (s === 'future') return '📅';
    return '⬜';
  }

  function progressColor(pct: number): string {
    if (pct >= 80) return 'var(--success)';
    if (pct >= 40) return 'var(--warning)';
    return 'var(--accent)';
  }

  // Load first enrollment on mount
  $effect(() => {
    if (browser && enrollments.length > 0 && !selectedOfferingId) {
      selectedOfferingId = enrollments[0].offering_id;
      loadPlan();
      loadTimeLog();
    }
  });

  const quickTimes = [5, 10, 15, 25, 30, 45, 60];
</script>

<svelte:head>
  <title>Study Planner — RPL AI Curriculum</title>
</svelte:head>

<div class="planner-page">
  <!-- Header -->
  <PageHeader title="Study Planner" subtitle="Atur target belajar mingguan, pantau progres, dan catat waktu belajar" />

  <!-- Course selector + error -->
  <div class="controls">
    <div class="offering-select-wrapper">
      <label class="select-label" for="offering-select">Pilih Course</label>
      <select
        id="offering-select"
        class="offering-select"
        bind:value={selectedOfferingId}
        onchange={handleOfferingChange}
      >
        <option value="">-- Pilih Course --</option>
        {#each enrollments as e}
          <option value={e.offering_id}>
            {e.course_icon} {e.course_title} — {e.offering_name}
          </option>
        {/each}
      </select>
    </div>
  </div>

  {#if error}
    <div class="error-banner">
      <span>⚠️ {error}</span>
      <button class="error-dismiss" onclick={() => error = ''}>✕</button>
    </div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Memuat data planner...</span>
    </div>
  {:else if offering}
    <!-- Tab Navigation -->
    <div class="tab-bar">
      <button class="tab" class:active={activeTab === 'overview'} onclick={() => activeTab = 'overview'}>
        📊 Ringkasan
      </button>
      <button class="tab" class:active={activeTab === 'weekly'} onclick={() => activeTab = 'weekly'}>
        📈 Mingguan
      </button>
      <button class="tab" class:active={activeTab === 'time'} onclick={() => activeTab = 'time'}>
        ⏱ Waktu
      </button>
    </div>

    {#if activeTab === 'overview'}
      <!-- Overview -->
      <section class="overview-section">
        <div class="overview-cards">
          <StatCard icon="📊" value="{progress?.percentage || 0}%" label="Progres Total" />
          <StatCard icon="🎯" value="{plan?.target_lessons_per_week || 0}/minggu" label="Target" />
          <StatCard icon={recommendations?.overall_status === 'behind' ? '⚠️' : '✅'} value={statusLabel(recommendations?.overall_status || 'on_track')} label="Status" color={statusColor(recommendations?.overall_status || 'on_track')} />
        </div>
      </section>

      <!-- Today's Tasks -->
      {#if todayTasks.length > 0}
        <Card padding="lg">
          <h2>📋 Jadwal Hari Ini</h2>
          <div class="today-tasks">
            {#each todayTasks as task}
              <div class="task-item">
                <span class="task-day">{task.day}</span>
                <span class="task-label">{task.label}</span>
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      <!-- Study Time Today -->
      <Card padding="lg">
        <div class="section-card-header">
          <h2>⏱ Waktu Belajar</h2>
          <button class="toggle-btn" onclick={() => showTimeTracking = !showTimeTracking}>
            {showTimeTracking ? 'Tutup' : 'Catat Waktu'}
          </button>
        </div>

        <div class="time-stats">
          <div class="time-stat">
            <span class="time-stat-value">{todayMinutes}</span>
            <span class="time-stat-label">Hari Ini (menit)</span>
          </div>
          <div class="time-stat">
            <span class="time-stat-value">{thisWeekMinutes}</span>
            <span class="time-stat-label">Minggu Ini (menit)</span>
          </div>
          <div class="time-stat">
            <span class="time-stat-value">🔥 {studyStreak}</span>
            <span class="time-stat-label">Streak Belajar (hari)</span>
          </div>
          <div class="time-stat">
            <span class="time-stat-value">{totalStudyDays}</span>
            <span class="time-stat-label">Total Hari</span>
          </div>
        </div>

        {#if showTimeTracking}
          <div class="quick-log">
            <p class="quick-log-label">Catat waktu belajar:</p>
            <div class="quick-times">
              {#each quickTimes as t}
                <button class="time-btn" onclick={() => logStudyTime(t)}>
                  {t} menit
                </button>
              {/each}
            </div>
            <div class="manual-log">
              <input type="number" min="1" max="480" bind:value={studyMinutes} class="time-input" />
              <button class="btn small" onclick={() => { if (studyMinutes > 0) logStudyTime(studyMinutes); studyMinutes = 0; }}>
                Catat
              </button>
            </div>
          </div>
        {/if}
      </Card>

      <!-- Setup / Edit Plan -->
      <Card padding="lg">
        <div class="section-card-header">
          <h2>⚙️ Atur Target</h2>
          <button class="toggle-btn" onclick={() => showSetup = !showSetup}>
            {showSetup ? 'Tutup' : plan ? 'Ubah Target' : 'Buat Rencana'}
          </button>
        </div>

        {#if showSetup}
          <div class="setup-form">
            <div class="form-row">
              <div class="form-group">
                <label for="targetInput">Target sesi per minggu</label>
                <input
                  id="targetInput"
                  type="number"
                  min="1"
                  max="20"
                  bind:value={targetPerWeek}
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="startWeek">Minggu mulai</label>
                <input
                  id="startWeek"
                  type="date"
                  bind:value={startWeek}
                  class="form-input"
                />
              </div>
            </div>

            {#if offering?.start_date && offering?.end_date}
              <p class="form-hint">
                Course berlangsung {offering.start_date.slice(0, 10)} s.d. {offering.end_date.slice(0, 10)}.
                Total {offering.total_lessons} sesi.
              </p>
            {/if}

            <Button onclick={savePlan} disabled={saving}>
              {saving ? 'Menyimpan...' : plan ? 'Perbarui Rencana' : 'Simpan Rencana'}
            </Button>
          </div>
        {/if}
      </Card>

      <!-- Recommendations -->
      {#if recommendations}
        <Card padding="lg">
          <div class="section-card-header">
            <h2>💡 Rekomendasi</h2>
          </div>

          <div class="recommendations">
            {#if recommendations.next_lesson_slug}
              <div class="rec-item">
                <span class="rec-icon">📖</span>
                <div>
                  <span class="rec-label">Lanjutkan ke sesi berikutnya:</span>
                  <a href="/learn/{selectedOfferingId}/lessons/{recommendations.next_lesson_slug}" class="rec-link">
                    {recommendations.next_lesson_title || 'Lanjut Belajar'}
                  </a>
                </div>
              </div>
            {/if}

            {#if recommendations.remaining_this_week > 0}
              <div class="rec-item">
                <span class="rec-icon">🎯</span>
                <div>
                  <span class="rec-label">Sisa target minggu ini:</span>
                  <span class="rec-value">{recommendations.remaining_this_week} sesi lagi</span>
                </div>
              </div>
            {:else if recommendations.remaining_this_week === 0 && plan}
              <div class="rec-item">
                <span class="rec-icon">✅</span>
                <div>
                  <span class="rec-label">Target minggu ini sudah tercapai!</span>
                  <span class="rec-value greened">Bagus! Pertahankan!</span>
                </div>
              </div>
            {/if}

            {#if recommendations.overall_status === 'behind'}
              <div class="rec-item warning">
                <span class="rec-icon">⚠️</span>
                <div>
                  <span class="rec-label">Kamu tertinggal dari target.</span>
                  <span class="rec-value">Coba catch up dengan menambah sesi minggu ini.</span>
                </div>
              </div>
            {/if}
          </div>
        </Card>
      {/if}

      <!-- Reminder Settings -->
      <Card padding="lg">
        <div class="section-card-header">
          <h2>🔔 Pengingat</h2>
        </div>

        <div class="reminder-form">
          <div class="reminder-toggle-row">
            <label class="toggle-label" for="reminderToggle">Pengingat harian</label>
            <button
              id="reminderToggle"
              class="toggle-switch"
              class:active={dailyReminder}
              onclick={() => dailyReminder = !dailyReminder}
              role="switch"
              aria-checked={dailyReminder}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          {#if dailyReminder}
            <div class="form-row">
              <div class="form-group">
                <label for="reminderTime">Waktu pengingat</label>
                <input
                  id="reminderTime"
                  type="time"
                  bind:value={reminderTime}
                  class="form-input"
                />
              </div>
            </div>
          {/if}

          <Button onclick={saveReminder} disabled={saving || !plan}>
            {saving ? 'Menyimpan...' : 'Simpan Pengingat'}
          </Button>
          {#if !plan}
            <p class="form-hint">Buat rencana belajar dulu sebelum mengatur pengingat.</p>
          {/if}
        </div>
      </Card>
    {/if}

    {#if activeTab === 'weekly'}
      <!-- Weekly Calendar Chart -->
      {#if weeks.length > 0}
        <Card padding="lg">
          <div class="section-card-header">
            <h2>📈 Progres Mingguan</h2>
          </div>

          <div class="week-chart">
            {#each weeks as w, i}
              <div class="week-row">
                <div class="week-label">
                  <span class="week-icon">{weekStatusIcon(w.status)}</span>
                  <span class="week-date">{w.weekLabel}</span>
                </div>

                <div class="week-bars">
                  <div class="bar-group">
                    <span class="bar-label">Target</span>
                    <div class="bar-track">
                      <div
                        class="bar-fill target"
                        style="width: {Math.min((w.target / Math.max(...weeks.map(x => x.target))) * 100, 100)}%"
                      ></div>
                    </div>
                    <span class="bar-value">{w.target}</span>
                  </div>

                  <div class="bar-group">
                    <span class="bar-label">Actual</span>
                    <div class="bar-track">
                      <div
                        class="bar-fill actual"
                        style="width: {Math.min((w.actual / Math.max(...weeks.map(x => x.target))) * 100, 100)}%"
                      ></div>
                    </div>
                    <span class="bar-value" style="color: {w.actual >= w.target ? 'var(--success)' : 'var(--danger)'}">
                      {w.actual}
                    </span>
                  </div>
                </div>

                <div class="week-status" style="color: {statusColor(w.status)}">
                  {statusLabel(w.status)}
                </div>
              </div>

              <!-- Cumulative progress line -->
              <div class="cumulative-row">
                <span class="cumulative-label">Kumulatif:</span>
                <div class="cumulative-bar">
                  <div class="cumulative-cap" style="width: {Math.min((w.cumulativeTarget / Math.max(...weeks.map(x => x.cumulativeTarget))) * 100, 100)}%">
                  </div>
                  <div
                    class="cumulative-fill"
                    style="width: {Math.min((w.cumulativeActual / Math.max(...weeks.map(x => x.cumulativeTarget))) * 100, 100)}%"
                  ></div>
                </div>
                <span class="cumulative-value">
                  {w.cumulativeActual}/{w.cumulativeTarget}
                </span>
              </div>

              {#if i < weeks.length - 1}
                <hr class="week-divider" />
              {/if}
            {/each}
          </div>
        </Card>
      {:else if plan}
        <Card padding="lg">
          <div class="section-card-header">
            <h2>📈 Progres Mingguan</h2>
          </div>
          <p class="empty-note">Data mingguan belum tersedia — pastikan course memiliki tanggal mulai dan akhir.</p>
        </Card>
      {/if}
    {/if}

    {#if activeTab === 'time'}
      <!-- Time Tracking Detail -->
      <Card padding="lg">
        <div class="section-card-header">
          <h2>⏱ Riwayat Waktu Belajar</h2>
        </div>

        {#if weeklyLog.length === 0}
          <p class="empty-note">Belum ada catatan waktu belajar. Mulai catat waktu belajarmu!</p>
        {:else}
          <div class="time-chart">
            {#each [...weeklyLog].reverse().slice(0, 14) as entry}
              <div class="time-bar-row">
                <span class="time-bar-date">{entry.date.slice(5)}</span>
                <div class="time-bar-track">
                  <div
                    class="time-bar-fill"
                    style="width: {Math.min((entry.minutes / 120) * 100, 100)}%"
                  ></div>
                </div>
                <span class="time-bar-value">{entry.minutes}m</span>
              </div>
            {/each}
          </div>
        {/if}

        <div class="time-summary">
          <p><strong>Total waktu belajar:</strong> {weeklyLog.reduce((s, e) => s + e.minutes, 0)} menit ({(weeklyLog.reduce((s, e) => s + e.minutes, 0) / 60).toFixed(1)} jam)</p>
          <p><strong>Rata-rata harian:</strong> {weeklyLog.length > 0 ? Math.round(weeklyLog.reduce((s, e) => s + e.minutes, 0) / weeklyLog.length) : 0} menit</p>
        </div>
      </Card>
    {/if}

  {:else if !loading && selectedOfferingId}
    <EmptyState
      icon="📭"
      title="Data tidak tersedia"
      description="Course tidak ditemukan. Pastikan kamu terdaftar di course ini."
    />
  {/if}
</div>

<style>
  .planner-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
    animation: fadeIn 0.4s ease both;
  }

  .planner-header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* ── Tab bar ── */
  .tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 4px;
  }
  .tab {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .tab.active {
    background: var(--accent);
    color: #fff;
  }
  .tab:hover:not(.active) {
    background: var(--hover);
    color: var(--text);
  }

  /* ── Today Tasks ── */
  .today-tasks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  .task-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .task-day {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    min-width: 60px;
  }
  .task-label {
    font-size: 13px;
    color: var(--text);
  }

  /* ── Time tracking ── */
  .time-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .time-stat {
    text-align: center;
    padding: 12px;
    background: var(--bg);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .time-stat-value {
    display: block;
    font-size: 22px;
    font-weight: 700;
    color: var(--accent);
  }
  .time-stat-label {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .quick-log { margin-top: 12px; }
  .quick-log-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  .quick-times {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .time-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--accent);
    background: var(--accent-dim);
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .time-btn:hover {
    background: var(--accent);
    color: #fff;
  }
  .manual-log {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .time-input {
    width: 100px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
  }

  /* ── Time chart ── */
  .time-chart {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .time-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .time-bar-date {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 36px;
    font-weight: 500;
  }
  .time-bar-track {
    flex: 1;
    height: 14px;
    background: var(--bg);
    border-radius: 7px;
    overflow: hidden;
  }
  .time-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #a855f7);
    border-radius: 7px;
    transition: width 0.3s ease;
  }
  .time-bar-value {
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    min-width: 36px;
    text-align: right;
  }
  .time-summary {
    padding: 12px;
    background: var(--bg);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* ── Controls ── */
  .controls {
    margin-bottom: 20px;
  }

  .offering-select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .select-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .offering-select {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    width: 100%;
    max-width: 480px;
  }

  .error-banner {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--danger, #ef4444);
  }

  .error-dismiss { background: none; border: none; color: var(--danger, #ef4444); cursor: pointer; font-size: 16px; }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .spinner {
    width: 28px; height: 28px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .section-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-card-header h2 { font-size: 16px; font-weight: 600; margin: 0; }

  .toggle-btn {
    font-size: 12px; font-weight: 600; color: var(--accent);
    background: var(--accent-dim); border: none; padding: 6px 14px;
    border-radius: 8px; cursor: pointer; font-family: inherit;
    transition: all 0.15s ease;
  }
  .toggle-btn:hover { background: var(--accent); color: #fff; }

  /* Overview cards */
  .overview-section { margin-bottom: 16px; }

  .overview-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }



  /* Setup form */
  .setup-form { display: flex; flex-direction: column; gap: 14px; }
  .form-row { display: flex; gap: 14px; }
  .form-group { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
  .form-input {
    padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit;
    transition: border-color 0.15s ease;
  }
  .form-input:focus { outline: none; border-color: var(--accent); }
  .form-hint { font-size: 12px; color: var(--text-secondary); opacity: 0.8; }

  /* Weekly chart */
  .week-chart { display: flex; flex-direction: column; gap: 4px; }
  .week-row { display: grid; grid-template-columns: 180px 1fr 90px; gap: 12px; align-items: center; padding: 8px 0; }
  .week-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text); font-weight: 500; }
  .week-icon { font-size: 14px; }
  .week-date { font-size: 12px; }
  .week-bars { display: flex; flex-direction: column; gap: 4px; }
  .bar-group { display: flex; align-items: center; gap: 8px; }
  .bar-label { font-size: 10px; font-weight: 600; color: var(--text-secondary); width: 36px; text-align: right; flex-shrink: 0; }
  .bar-track { flex: 1; height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 5px; transition: width 0.3s ease; min-width: 4px; }
  .bar-fill.target { background: var(--accent); opacity: 0.4; }
  .bar-fill.actual { background: var(--accent); opacity: 0.85; }
  .bar-value { font-size: 11px; font-weight: 700; min-width: 20px; text-align: right; color: var(--text); }
  .week-status { font-size: 11px; font-weight: 600; text-align: right; }

  .cumulative-row { display: grid; grid-template-columns: 180px 1fr 90px; gap: 12px; align-items: center; padding: 2px 0 8px 20px; }
  .cumulative-label { font-size: 10px; font-weight: 500; color: var(--text-secondary); }
  .cumulative-bar { flex: 1; height: 6px; background: var(--bg); border-radius: 3px; overflow: hidden; position: relative; }
  .cumulative-cap { position: absolute; height: 100%; background: var(--accent); opacity: 0.2; border-radius: 3px; transition: width 0.3s ease; }
  .cumulative-fill { position: absolute; height: 100%; background: var(--accent); opacity: 0.7; border-radius: 3px; transition: width 0.3s ease; }
  .cumulative-value { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-align: right; }

  .week-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

  /* Recommendations */
  .recommendations { display: flex; flex-direction: column; gap: 10px; }
  .rec-item {
    display: flex; align-items: flex-start; gap: 10px; padding: 12px;
    background: var(--bg); border-radius: 10px; border: 1px solid var(--border);
  }
  .rec-item.warning { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
  .rec-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .rec-item div { display: flex; flex-direction: column; gap: 2px; }
  .rec-label { font-size: 13px; color: var(--text-secondary); }
  .rec-link { font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; }
  .rec-link:hover { text-decoration: underline; }
  .rec-value { font-size: 14px; font-weight: 600; color: var(--text); }
  .rec-value.greened { color: var(--success); }

  /* Reminder */
  .reminder-form { display: flex; flex-direction: column; gap: 14px; }
  .reminder-toggle-row { display: flex; align-items: center; justify-content: space-between; }
  .toggle-label { font-size: 14px; font-weight: 500; }
  .toggle-switch {
    width: 44px; height: 24px; border-radius: 12px; background: var(--border);
    border: none; cursor: pointer; position: relative; transition: background 0.2s ease; padding: 0;
  }
  .toggle-switch.active { background: var(--accent); }
  .toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .toggle-switch.active .toggle-knob { transform: translateX(20px); }

  .empty-note { font-size: 13px; color: var(--text-secondary); padding: 12px 0; }

  /* Responsive */
  @media (max-width: 768px) {
    .overview-cards { grid-template-columns: 1fr; }
    .week-row { grid-template-columns: 140px 1fr 70px; gap: 8px; }
    .cumulative-row { grid-template-columns: 140px 1fr 70px; padding-left: 0; }
    .form-row { flex-direction: column; }
    .time-stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>
