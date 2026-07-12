<script lang="ts">
  import { browser } from '$app/environment';

  // Accept either:
  // - dayCounts: Record<string, number> (day -> count) — from insights API
  // - data: ActivityEntry[] — from local activity store
  let { dayCounts = {} as Record<string, number>, data = [] as Array<{timestamp: number}> } = $props();

  // Build final day counts from whichever input was given
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let combinedCounts = $derived.by(() => {
    const map: Record<string, number> = { ...dayCounts };
    // Initialize empty for last 365 days if no data yet
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (map[key] === undefined) map[key] = 0;
    }
    // Count from activity entries (array format)
    if (data.length > 0) {
      for (const entry of data) {
        const d = new Date(entry.timestamp);
        const key = d.toISOString().split('T')[0];
        if (map[key] !== undefined) map[key]++;
      }
    }
    return map;
  });

  let days = $derived.by(() => {
    const result: { date: Date; count: number; dateStr: string }[] = [];
    const keys = Object.keys(combinedCounts).sort();
    for (const key of keys) {
      const d = new Date(key + 'T00:00:00');
      result.push({ date: d, count: combinedCounts[key], dateStr: key });
    }
    return result;
  });

  let weeks = $derived.by(() => {
    const result: { date: Date; count: number; dateStr: string }[][] = [];
    let currentWeek: { date: Date; count: number; dateStr: string }[] = [];
    const startDow = days[0]?.date.getDay() ?? 0;

    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ date: new Date(0), count: -1, dateStr: '' });
    }

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), count: -1, dateStr: '' });
      }
      result.push(currentWeek);
    }
    return result;
  });

  let months = $derived.by(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seen = new Set<string>();
    const result: { label: string; span: number }[] = [];

    for (let col = 0; col < weeks.length; col++) {
      const firstRealDay = weeks[col].find(d => d.dateStr !== '');
      if (!firstRealDay) continue;
      const month = firstRealDay.date.getMonth();
      const year = firstRealDay.date.getFullYear();
      const key = `${year}-${month}`;
      if (!seen.has(key)) {
        seen.add(key);
        let span = 1;
        for (let c = col + 1; c < weeks.length; c++) {
          const nextRealDay = weeks[c].find(d => d.dateStr !== '');
          if (!nextRealDay) break;
          if (nextRealDay.date.getMonth() === month) span++;
          else break;
        }
        result.push({ label: monthNames[month], span });
      }
    }
    return result;
  });

  function getIntensity(count: number): number {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  let selectedDay = $state<string | null>(null);
  let tooltipStyle = $state('');

  function onDayHover(dateStr: string, count: number, el: HTMLElement) {
    if (!dateStr) return;
    const rect = el.getBoundingClientRect();
    tooltipStyle = `left: ${rect.left + window.scrollX}px; top: ${rect.top - 40 + window.scrollY}px;`;
    selectedDay = `${count} sesi pada ${dateStr.split('-').reverse().join('/')}`;
  }

  function onDayLeave() {
    selectedDay = null;
  }
</script>

<div class="heatmap-wrapper">
  <div class="heatmap-container">
    <!-- Month labels -->
    <div class="heatmap-months">
      <span class="month-spacer"></span>
      <div class="month-labels">
        {#each months as m}
          <span class="month-label" style="width: {m.span * 14}px">{m.label}</span>
        {/each}
      </div>
    </div>

    <div class="heatmap-grid" style="display: flex; gap: 3px;">
      <!-- Day labels column -->
      <div class="day-labels">
        {#each ['', 'Mon', '', 'Wed', '', 'Fri', ''] as label}
          <span class="day-label">{label}</span>
        {/each}
      </div>

      <!-- Weeks -->
      <div style="display: flex; gap: 2px;">
        {#each weeks as week}
          <div class="heatmap-week">
            {#each week as day}
              {#if day.dateStr}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="heatmap-day intensity-{getIntensity(day.count)}"
                  title="{day.count} sesi pada {day.dateStr.split('-').reverse().join('/')}"
                  onmouseenter={(e) => onDayHover(day.dateStr, day.count, e.currentTarget as HTMLElement)}
                  onmouseleave={onDayLeave}
                ></div>
              {:else}
                <div class="heatmap-day heatmap-empty"></div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <!-- Legend -->
    <div class="heatmap-legend">
      <span class="legend-label">Sedikit</span>
      {#each [0, 1, 2, 3, 4] as level}
        <div class="legend-swatch intensity-{level}"></div>
      {/each}
      <span class="legend-label">Banyak</span>
    </div>
  </div>
</div>

{#if selectedDay}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="heatmap-tooltip" style={tooltipStyle} onclick={() => selectedDay = null}>
    {selectedDay}
  </div>
{/if}

<style>
  .heatmap-wrapper {
    position: relative;
    overflow-x: auto;
    padding: 8px 0;
  }
  .heatmap-container {
    min-width: fit-content;
  }
  .heatmap-months {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    padding-left: 30px;
  }
  .month-spacer { width: 0; }
  .month-labels {
    display: flex;
    gap: 2px;
  }
  .month-label {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  .heatmap-grid {
    display: flex;
    gap: 3px;
  }
  .day-labels {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-right: 4px;
  }
  .day-label {
    font-size: 10px;
    color: var(--text-secondary);
    height: 10px;
    line-height: 10px;
    width: 28px;
    text-align: right;
  }
  .heatmap-week {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .heatmap-day {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    cursor: pointer;
    transition: opacity 0.1s ease;
  }
  .heatmap-day:hover {
    opacity: 0.8;
    outline: 1px solid var(--text);
  }
  .heatmap-empty { visibility: hidden; }
  .intensity-0 { background: var(--border); }
  .intensity-1 { background: #0e4429; }
  .intensity-2 { background: #006d32; }
  .intensity-3 { background: #26a641; }
  .intensity-4 { background: #39d353; }

  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    justify-content: flex-end;
    padding-right: 8px;
  }
  .legend-label {
    font-size: 10px;
    color: var(--text-secondary);
  }
  .legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .heatmap-tooltip {
    position: fixed;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
</style>
