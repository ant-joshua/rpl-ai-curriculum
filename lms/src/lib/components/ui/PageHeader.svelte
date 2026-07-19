<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    action,
    class: className = '',
    children,
    ...rest
  }: {
    title: string;
    subtitle?: string;
    action?: Snippet;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="page-header {className}" {...rest}>
  <div class="page-header-left">
    <h1 class="page-header-title">{title}</h1>
    {#if subtitle}
      <p class="page-header-subtitle">{subtitle}</p>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
  {#if action}
    <div class="page-header-action">
      {@render action()}
    </div>
  {/if}
</div>

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 16px;
    gap: 16px;
    font-family: var(--font-sans);
    font-feature-settings: 'cv01', 'ss03';
  }

  .page-header-left {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .page-header-title {
    font-size: 24px;
    font-weight: 590;
    letter-spacing: -0.288px;
    color: #1a1a2e;
    margin: 0;
    line-height: 1.2;
  }

  .page-header-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 4px 0 0;
    line-height: 1.4;
  }

  .page-header-action {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
</style>
