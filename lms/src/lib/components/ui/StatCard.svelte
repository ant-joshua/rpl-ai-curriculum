<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    icon,
    value,
    label,
    color = '#7170ff',
    class: className = '',
    children,
    ...rest
  }: {
    icon?: string;
    value: string | number;
    label: string;
    color?: string;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="stat-card {className}" {...rest}>
  <div class="stat-card-header">
    {#if icon}
      <div class="stat-card-icon" style:background="{color}12" style:color={color}>
        <span>{icon}</span>
      </div>
    {/if}
    <div class="stat-card-info">
      <div class="stat-card-value">{value}</div>
      <div class="stat-card-label">{label}</div>
    </div>
  </div>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .stat-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
    transition: background 0.15s;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .stat-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-card-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 18px;
    flex-shrink: 0;
  }

  .stat-card-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .stat-card-value {
    font-size: 28px;
    font-weight: 590;
    letter-spacing: -0.6px;
    color: #f7f8f8;
    line-height: 1.1;
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
  }

  .stat-card-label {
    font-size: 13px;
    font-weight: 510;
    color: #8a8f98;
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
    margin-top: 2px;
  }
</style>
