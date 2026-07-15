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
    };
    isAuthenticated?: boolean;
    enrollingId?: string | null;
    onenroll?: (id: string) => void;
  } = $props();

  function levelLabel(level: string): string {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return labels[level] || level;
  }
</script>

<article class="course-card" class:enrolled={offering.isEnrolled}>
  <!-- Top: category badge -->
  <div class="card-top">
    {#if offering.category}
      <Badge variant="accent" size="sm">{offering.category}</Badge>
    {/if}
  </div>

  <!-- Middle: title, description -->
  <div class="card-middle">
    <h3 class="card-title">{offering.courseTitle}</h3>
    {#if offering.name !== offering.courseTitle}
      <p class="card-offering-name">{offering.name}</p>
    {/if}
    <p class="card-desc">{offering.description || 'No description'}</p>
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
          Continue
        </Button>
      {:else if !offering.spotsAvailable}
        <Button variant="outline" size="sm" disabled>Full</Button>
      {:else}
        <Button
          variant="primary"
          size="sm"
          onclick={() => onenroll?.(offering.id)}
          loading={enrollingId === offering.id}
          disabled={enrollingId === offering.id}
        >
          Enroll
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
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 20px;
    transition: background 0.15s ease, border-color 0.15s ease;
    position: relative;
    overflow: hidden;
  }

  .course-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.12);
  }

  .course-card.enrolled {
    border-color: rgba(94,106,210,0.3);
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
    color: #f7f8f8;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  .card-offering-name {
    font-size: 12px;
    color: #62666d;
    margin: 0 0 6px;
  }

  .card-desc {
    font-size: 13px;
    font-weight: 400;
    color: #8a8f98;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
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
    color: #8a8f98;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .meta-level {
    font-size: 11px;
    font-weight: 500;
    color: #8a8f98;
    background: rgba(255,255,255,0.04);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .meta-xp {
    font-size: 11px;
    font-weight: 600;
    color: #7170ff;
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
