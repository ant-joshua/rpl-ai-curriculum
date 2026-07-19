<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Progress from '$lib/components/ui/Progress.svelte';
  import { Button } from '$lib/components/ui/index.js';

  let {
    offering,
    isAuthenticated = false,
    enrollingId = null,
    onenroll,
  }: {
    offering: {
      id: string;
      courseTitle: string;
      name: string;
      description: string;
      level: string;
      category: string;
      instructorName: string | null;
      isEnrolled: boolean;
      enrolledCount: number;
      maxStudents: number | null;
      spotsAvailable: boolean;
      progress?: number;
      xp?: number;
      prerequisites?: { course_id: string; title: string; slug: string; icon: string }[];
      prerequisitesMet?: boolean;
    };
    isAuthenticated?: boolean;
    enrollingId?: string | null;
    onenroll?: (id: string) => void;
  } = $props();

  let prereqs = $derived(offering.prerequisites || []);
  let hasUnmetPrereqs = $derived(prereqs.length > 0 && !offering.prerequisitesMet && !offering.isEnrolled);

  function levelLabel(level: string): string {
    const labels: Record<string, string> = {
      beginner: 'Pemula',
      intermediate: 'Menengah',
      advanced: 'Lanjutan',
    };
    return labels[level] || level;
  }
</script>

<article class="course-card" class:enrolled={offering.isEnrolled} class:locked={hasUnmetPrereqs}>
  <!-- Top: category badge -->
  <div class="card-top">
    {#if offering.category}
      <Badge variant="accent" size="sm">{offering.category}</Badge>
    {/if}
    {#if prereqs.length > 0 && !offering.isEnrolled}
      <Badge variant={offering.prerequisitesMet ? 'success' : 'warning'} size="sm">🔗 Prasyarat</Badge>
    {/if}
  </div>

  <!-- Middle: title, description -->
  <div class="card-middle">
    <h3 class="card-title">{offering.courseTitle}</h3>
    {#if offering.name !== offering.courseTitle}
      <p class="card-offering-name">{offering.name}</p>
    {/if}
    <p class="card-desc">{offering.description || 'No description'}</p>

    {#if hasUnmetPrereqs}
      <div class="prereq-info">
        <span class="prereq-label">Membutuhkan:</span>
        {#each prereqs as p}
          <span class="prereq-badge">{p.icon || '📚'} {p.title}</span>
        {/each}
      </div>
    {:else if prereqs.length > 0 && offering.prerequisitesMet}
      <div class="prereq-info prereq-met">
        <span class="prereq-label">✅ Prasyarat terpenuhi</span>
      </div>
    {/if}
  </div>

  <!-- Bottom: instructor + action -->
  <div class="card-bottom">
    <div class="card-meta">
      {#if offering.instructorName}
        <span class="meta-instructor">
          <Icon name="user" size={12} />
          {offering.instructorName}
        </span>
      {/if}
      <span class="meta-level">{levelLabel(offering.level)}</span>
      {#if offering.xp}
        <span class="meta-xp">
          <Icon name="award" size={12} />
          {offering.xp} XP
        </span>
      {/if}
    </div>

    <div class="card-action">
      {#if offering.isEnrolled}
        <Button href="/learn/{offering.id}/syllabus" variant="primary" size="sm">
          Lanjutkan
        </Button>
      {:else if !offering.spotsAvailable}
        <Button variant="outline" size="sm" disabled>Penuh</Button>
      {:else if hasUnmetPrereqs}
        <Button variant="outline" size="sm" disabled title="Selesaikan prasyarat terlebih dahulu">Terkunci 🔒</Button>
      {:else}
        <Button
          variant="primary"
          size="sm"
          onclick={() => onenroll?.(offering.id)}
          loading={enrollingId === offering.id}
          disabled={enrollingId === offering.id}
        >
          Daftar
        </Button>
      {/if}
    </div>
  </div>

  <!-- Progress overlay if enrolled -->
  {#if offering.isEnrolled && offering.progress !== undefined}
    <div class="card-progress">
      <Progress value={offering.progress} max={100} size="sm" showLabel={false} />
    </div>
  {/if}
</article>

<style>
  .course-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.15s ease;
    position: relative;
    overflow: hidden;
  }

  .course-card:hover {
    background: rgba(0,0,0,0.04);
    border-color: rgba(79,70,229,0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(79,70,229,0.1);
  }

  .course-card.enrolled {
    border-color: rgba(79,70,229,0.3);
  }

  .course-card.locked {
    opacity: 0.7;
  }

  .course-card.locked:hover {
    border-color: rgba(0,0,0,0.06);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-middle {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: 16px;
    font-weight: 590;
    color: #1a1a2e;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  .card-offering-name {
    font-size: 12px;
    color: #94a3b8;
    margin: 0 0 6px;
  }

  .card-desc {
    font-size: 13px;
    font-weight: 400;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .prereq-info {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .prereq-label {
    font-size: 11px;
    color: #f59e0b;
    font-weight: 600;
    margin-right: 2px;
  }

  .prereq-met .prereq-label {
    color: #22c55e;
  }

  .prereq-badge {
    font-size: 11px;
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .meta-instructor {
    font-size: 12px;
    color: #64748b;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .meta-level {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    background: rgba(0,0,0,0.04);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .meta-xp {
    font-size: 11px;
    font-weight: 600;
    color: #4F46E5;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .card-action {
    flex-shrink: 0;
  }

  .card-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 20px 10px;
  }
</style>
