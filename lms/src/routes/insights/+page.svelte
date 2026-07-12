<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { progress } from '$lib/stores/progress.svelte';
  import { modules } from '$lib/stores/modules';
  import { api } from '$lib/utils/api';
  import ActivityHeatmap from '$lib/components/ActivityHeatmap.svelte';

  let loading = $state(true);
  let insights: any = $state(null);
  let error = $state<string | null>(null);

  // Stats
  let totalStudyTime = $state(0);
  let sessionsDone = $state(0);
  let streak = $state(0);
  let dailyAverage = $state(0);

  // Weak topics
  let weakTopics = $state<any[]>([]);

  // Predictions
  let predictions = $state<any[]>([]);
  let customSessions = $state(5);
  let customPredictions = $state<any[]>([]);

  // Hour data for bar chart
  let hourData = $state<number[]>([]);
  let maxHour = $state(1);
  let maxCustomHour = $state(1);

  // Recent activity
  let recentActivity = $state<any[]>([]);

  // Heatmap
  let heatmapData = $state<Record<string, number>>({});

  // Completion dates from progress store (for heatmap fallback)
  let localActivity = $state<any[]>([]);

  onMount(async () => {
    try {
      const res = await api<any>('/api/insights');
      if (res.success && res.data) {
        const d = res.data;
        totalStudyTime = d.total_study_time || 0;
        sessionsDone = d.sessions_done || 0;
        streak = d.streak || 0;
        dailyAverage = d.daily_average || 0;
        weakTopics = d.weak_topics || [];
        predictions = d.predictions || [];
        hourData = d.hour_activity || new Array(24).fill(0);
        recentActivity = d.recent_activity || [];
        heatmapData = d.heatmap_data || {};
        maxHour = Math.max(1, ...hourData);
      } else {
        // Fallback: use local stores
        localActivity = JSON.parse(localStorage.getItem('lms-activity') || '[]');
        totalStudyTime = localActivity.length;
        sessionsDone = progress.getStreak();
        streak = progress.getStreak();
        dailyAverage = 1;
        // Build hour data from local activity
        const hData = new Array(24).fill(0);
        for (const a of localActivity) {
          const d = new Date(a.timestamp);
          hData[d.getHours()]++;
        }
        hourData = hData;
        maxHour = Math.max(1, ...hourData);
        // Weak topics from local progress
        const weak: any[] = [];
        for (const mod of modules) {
          const pct = progress.getModuleProgress(mod.slug);
          if (pct > 0 && pct < 50) {
            weak.push({ slug: mod.slug, title: mod.title, completion: pct });
          }
        }
        weakTopics = weak;
        // Recent from local
        recentActivity = localActivity.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 20);
      }
    } catch {
      error = 'Gagal memuat insights';
    } finally {
      loading = false;
    }
  });

  function computeCustomPredictions() {
    if (!predictions.length) return;
    customPredictions = predictions.map((p: any) => {
      const remaining = p.totalSessions - p.sessionsDone;
      const daysNeeded = Math.ceil(remaining / customSessions);
      const est = new Date();
      est.setDate(est.getDate() + daysNeeded);
      return { ...p, daysNeeded, completionDate: est.toISOString().split('T')[0] };
    });
  }

  function formatTimestamp(ts: string | number): string {
    const d = typeof ts === 'string' ? new Date(ts + 'Z') : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function getModuleTitle(slug: string): string {
    const m = modules.find(m => m.slug === slug);
    return m?.title || slug;
  }
</script>

<div class="insights-page">
  {#if loading}
    <div class="loading">Memuat insights...</div>
  {:else if error}
    <div class="error-card">{error}</div>
  {:else}
    <div in:fade={{ duration: 300 }}>
      <h1 class="page-title">📊 Learning Insights</h1>
      <p class="page-subtitle">Wawasan belajar dan analisis progress</p>

      <!-- Top Stats Row -->
      <section class="stats-row">
        <div class="stat-card">
          <span class="stat-icon">⏱️</span>
          <div>
            <span class="stat-value">{totalStudyTime}</span>
            <span class="stat-label">Total Aktivitas</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div>
            <span class="stat-value">{sessionsDone}</span>
            <span class="stat-label">Sesi Selesai</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <div>
            <span class="stat-value">{streak}</span>
            <span class="stat-label">Streak (hari)</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📅</span>
          <div>
            <span class="stat-value">{dailyAverage}</span>
            <span class="stat-label">Rata-rata Harian</span>
          </div>
        </div>
      </section>

      <!-- Activity Heatmap -->
      <section class="section-card">
        <h2>🔥 Activity Heatmap</h2>
        <ActivityHeatmap dayCounts={heatmapData} />
      </section>

      <!-- Time Breakdown -->
      <section class="section-card">
        <h2>⏰ Waktu Belajar per Jam</h2>
        <div class="bar-chart">
          {#each hourData as count, i}
            <div class="bar-column">
              <div class="bar-fill-wrap">
                <div
                  class="bar-fill"
                  style="height: {(count / maxHour) * 100}%"
                  title="{count} aktivitas jam {i}:00"
                ></div>
              </div>
              <span class="bar-label">{i}</span>
            </div>
          {/each}
        </div>
      </section>

      <!-- Weak Topics -->
      {#if weakTopics.length > 0}
        <section class="section-card">
          <h2>⚠️ Topik Lemah (&lt;50% completion)</h2>
          <div class="weak-list">
            {#each weakTopics as topic}
              <a href="/module/{topic.slug}" class="weak-item">
                <span class="weak-title">{topic.title}</span>
                <span class="weak-pct">{topic.completion}%</span>
              </a>
            {/each}
          </div>
          <p class="weak-hint">Selesaikan modul-modul ini untuk memperkuat pemahamanmu.</p>
        </section>
      {/if}

      <!-- Predictions -->
      <section class="section-card">
        <h2>📈 Prediksi Penyelesaian</h2>
        {#if predictions.length > 0}
          <div class="prediction-controls">
            <label>Jika kamu belajar</label>
            <input type="number" min="1" max="20" bind:value={customSessions} class="pred-input" />
            <label>sesi/hari</label>
            <button class="pred-btn" onclick={computeCustomPredictions}>Hitung</button>
          </div>
          <div class="prediction-list">
            {#each (customPredictions.length ? customPredictions : predictions.slice(0, 5)) as pred}
              <div class="prediction-item">
                <span class="pred-icon">{getPathIcon(pred.slug)}</span>
                <div class="pred-info">
                  <span class="pred-title">{pred.title}</span>
                  <span class="pred-progress">{pred.sessionsDone}/{pred.totalSessions} sesi</span>
                </div>
                <span class="pred-date">
                  🎯 {(customPredictions.length ? (pred as any).completionDate : pred.estimatedCompletion) || '—'}
                </span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-text">Belum cukup data untuk prediksi. Mulai belajar!</p>
        {/if}
      </section>

      <!-- Recent Activity -->
      <section class="section-card">
        <h2>📜 Aktivitas Terbaru</h2>
        {#if recentActivity.length > 0}
          <div class="activity-feed">
            {#each recentActivity.slice(0, 10) as entry}
              <div class="activity-item">
                <span class="activity-icon">
                  {entry.action === 'complete' ? '✅' : entry.action === 'quiz' ? '📝' : '👁️'}
                </span>
                <div class="activity-info">
                  <span class="activity-module">{getModuleTitle(entry.module_slug || entry.moduleSlug)}</span>
                  {#if entry.session_id || entry.sessionId}
                    <span class="activity-session">{entry.session_id || entry.sessionId}</span>
                  {/if}
                </div>
                <span class="activity-time">{formatTimestamp(entry.created_at || entry.timestamp)}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-text">Belum ada aktivitas tercatat.</p>
        {/if}
      </section>
    </div>
  {/if}
</div>

<script module lang="ts">
  // Path icons for predictions
  function getPathIcon(slug: string): string {
    const icons: Record<string, string> = {
      'frontend-web': '🎨',
      'backend-dev': '⚙️',
      'fullstack': '🚀',
      'ai-ml-dev': '🤖',
      'devops-infra': '🛡️',
      'mobile-dev': '📱',
      'cs-fundamentals': '🧠',
      'career-prep': '💼',
    };
    return icons[slug] || '📚';
  }
</script>

<style>
  .insights-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }
  .page-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .page-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  .loading, .error-card {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
  }
  .error-card {
    color: #ef4444;
    background: var(--surface);
    border: 1px solid #ef4444;
    border-radius: 10px;
  }

  /* Stats Row */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stat-icon { font-size: 22px; }
  .stat-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
  }
  .stat-label {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Section Card */
  .section-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .section-card h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 14px;
  }

  /* Bar Chart */
  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 120px;
    padding-top: 8px;
  }
  .bar-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    height: 100%;
  }
  .bar-fill-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .bar-fill {
    width: 100%;
    max-width: 16px;
    background: linear-gradient(180deg, var(--accent), var(--accent-secondary));
    border-radius: 3px 3px 0 0;
    min-height: 2px;
    transition: height 0.3s ease;
  }
  .bar-label {
    font-size: 9px;
    color: var(--text-secondary);
  }

  /* Weak Topics */
  .weak-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .weak-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    text-decoration: none !important;
    transition: border-color 0.15s ease;
  }
  .weak-item:hover {
    border-color: var(--accent);
  }
  .weak-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }
  .weak-pct {
    font-size: 12px;
    font-weight: 600;
    color: #f59e0b;
  }
  .weak-hint {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 10px;
  }

  /* Predictions */
  .prediction-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    font-size: 13px;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }
  .pred-input {
    width: 56px;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    font-family: inherit;
  }
  .pred-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 4px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .pred-btn:hover {
    opacity: 0.9;
  }
  .prediction-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .prediction-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .pred-icon { font-size: 20px; }
  .pred-info { flex: 1; }
  .pred-title {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }
  .pred-progress {
    font-size: 11px;
    color: var(--text-secondary);
  }
  .pred-date {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    white-space: nowrap;
  }
  .empty-text {
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
    padding: 20px;
  }

  /* Activity Feed */
  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .activity-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg);
    border-radius: 8px;
    font-size: 13px;
  }
  .activity-icon { font-size: 16px; }
  .activity-info { flex: 1; }
  .activity-module {
    display: block;
    font-weight: 500;
    color: var(--text);
  }
  .activity-session {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
  }
  .activity-time {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
