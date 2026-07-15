<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Card, EmptyState } from '$lib/components/ui';

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

  // Show setup form
  let showSetup = $state(false);

  let apiBase = '/api/my/planner';

  function apiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };
  }

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
        // Default form values from offering
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

  // Helpers
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
    }
  });
</script>

<svelte:head>
  <title>Study Planner — RPL AI Curriculum</title>
</svelte:head>

<div class="planner-page">
  <!-- Header -->
  <header class="planner-header">
    <div>
      <h1>📅 Study Planner</h1>
      <p class="subtitle">Atur target belajar mingguan dan pantau progresmu</p>
    </div>
  </header>

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
    <!-- Plan Overview -->
    <section class="overview-section">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="overview-icon">📊</div>
          <div>
            <div class="overview-value">{progress?.percentage || 0}%</div>
            <div class="overview-label">Progres Total</div>
            <div class="overview-sub">{progress?.completed_lessons || 0}/{progress?.total_lessons || 0} sesi</div>
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-icon">🎯</div>
          <div>
            <div class="overview-value">{plan?.target_lessons_per_week || 0}/minggu</div>
            <div class="overview-label">Target</div>
            <div class="overview-sub">{recommendations?.remaining_this_week ?? '-'} sisa minggu ini</div>
          </div>
        </div>

        <div class="overview-card" style="border-color: {statusColor(recommendations?.overall_status || 'on_track')}30">
          <div class="overview-icon">{recommendations?.overall_status === 'behind' ? '⚠️' : '✅'}</div>
          <div>
            <div class="overview-value" style="color: {statusColor(recommendations?.overall_status || 'on_track')}">
              {statusLabel(recommendations?.overall_status || 'on_track')}
            </div>
            <div class="overview-label">Status</div>
          </div>
        </div>
      </div>
    </section>

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

  .error-dismiss {
    background: none;
    border: none;
    color: var(--danger, #ef4444);
    cursor: pointer;
    font-size: 16px;
  }

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
    width: 28px;
    height: 28px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .section-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-card-header h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .toggle-btn {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-dim);
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .toggle-btn:hover {
    background: var(--accent);
    color: #fff;
  }

  /* Overview cards */
  .overview-section {
    margin-bottom: 16px;
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .overview-card {
    background: var(--gradient-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.2s ease;
  }

  .overview-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
  }

  .overview-icon { font-size: 28px; }

  .overview-card div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .overview-value {
    font-size: 20px;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .overview-label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .overview-sub {
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.8;
  }

  /* Setup form */
  .setup-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row {
    display: flex;
    gap: 14px;
  }

  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .form-input {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.15s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .form-hint {
    font-size: 12px;
    color: var(--text-secondary);
    opacity: 0.8;
  }

  /* Weekly chart */
  .week-chart {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .week-row {
    display: grid;
    grid-template-columns: 180px 1fr 90px;
    gap: 12px;
    align-items: center;
    padding: 8px 0;
  }

  .week-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text);
    font-weight: 500;
  }

  .week-icon { font-size: 14px; }
  .week-date { font-size: 12px; }

  .week-bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

  .bar-track {
    flex: 1;
    height: 10px;
    background: var(--bg);
    border-radius: 5px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s ease;
    min-width: 4px;
  }

  .bar-fill.target {
    background: var(--accent);
    opacity: 0.4;
  }

  .bar-fill.actual {
    background: var(--accent);
    opacity: 0.85;
  }

  .bar-value {
    font-size: 11px;
    font-weight: 700;
    min-width: 20px;
    text-align: right;
    color: var(--text);
  }

  .week-status {
    font-size: 11px;
    font-weight: 600;
    text-align: right;
  }

  /* Cumulative row */
  .cumulative-row {
    display: grid;
    grid-template-columns: 180px 1fr 90px;
    gap: 12px;
    align-items: center;
    padding: 2px 0 8px 20px;
  }

  .cumulative-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .cumulative-bar {
    flex: 1;
    height: 6px;
    background: var(--bg);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }

  .cumulative-cap {
    position: absolute;
    height: 100%;
    background: var(--accent);
    opacity: 0.2;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .cumulative-fill {
    position: absolute;
    height: 100%;
    background: var(--accent);
    opacity: 0.7;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .cumulative-value {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-align: right;
  }

  .week-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
  }

  /* Recommendations */
  .recommendations {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rec-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: var(--bg);
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .rec-item.warning {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(245, 158, 11, 0.05);
  }

  .rec-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

  .rec-item div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rec-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .rec-link {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
  }

  .rec-link:hover {
    text-decoration: underline;
  }

  .rec-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .rec-value.greened {
    color: var(--success);
  }

  /* Reminder */
  .reminder-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .reminder-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: var(--border);
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s ease;
    padding: 0;
  }

  .toggle-switch.active {
    background: var(--accent);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(20px);
  }

  .empty-note {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 12px 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .overview-cards {
      grid-template-columns: 1fr;
    }

    .week-row {
      grid-template-columns: 140px 1fr 70px;
      gap: 8px;
    }

    .cumulative-row {
      grid-template-columns: 140px 1fr 70px;
      padding-left: 0;
    }

    .form-row {
      flex-direction: column;
    }
  }
</style>
