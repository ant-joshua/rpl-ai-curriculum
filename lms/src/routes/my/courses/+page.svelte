<script lang="ts">
  import { t } from '$lib/stores/i18n';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { EmptyState } from '$lib/components/ui/index.js';

  let { data }: { data: import('./$types').PageData } = $props();
  let courses = $state(data.courses || []);
</script>

<svelte:head>
  <title>My Courses — RPL AI</title>
</svelte:head>

<div class="my-courses">
  <header class="page-header">
    <h1>{t('nav.courses')}</h1>
    <p class="page-subtitle">Kursus yang sudah kamu daftar</p>
  </header>

  {#if courses.length === 0}
    <EmptyState
      icon="book"
      title="Belum ada kursus"
      description="Daftar kursus dulu dari katalog"
    >
      <a href="/catalog" class="btn-primary">Lihat Katalog</a>
    </EmptyState>
  {:else}
    <div class="course-list">
      {#each courses as course}
        <a href="/learn/{course.offeringId}" class="course-item">
          <div class="course-icon">
            <Icon name={course.icon || 'book'} size={24} />
          </div>
          <div class="course-info">
            <span class="course-title">{course.title || course.name}</span>
            <span class="course-meta">{course.progress || 0}% selesai</span>
          </div>
          <div class="course-progress">
            <div class="progress-track">
              <div class="progress-fill" style="width: {course.progress || 0}%"></div>
            </div>
          </div>
          <Icon name="chevron-right" size={16} class="course-arrow" />
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .my-courses {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 16px;
  }
  .page-header {
    margin-bottom: 24px;
  }
  .page-header h1 {
    font-size: 24px;
    font-weight: 590;
    color: #1a1a2e;
    margin: 0 0 4px;
  }
  .page-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
  .course-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .course-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.15s ease;
  }
  .course-item:hover {
    border-color: #C8CCD0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .course-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4F46E5;
    flex-shrink: 0;
  }
  .course-info {
    flex: 1;
    min-width: 0;
  }
  .course-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .course-meta {
    font-size: 12px;
    color: #64748b;
  }
  .course-progress {
    width: 80px;
    flex-shrink: 0;
  }
  .progress-track {
    height: 4px;
    background: #E2E8F0;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22C55E, #16A34A);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .course-arrow {
    color: #94a3b8;
    flex-shrink: 0;
  }
</style>
