<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    icon,
    value,
    label,
    color = 'var(--accent)',
    delay = 0,
    class: className = '',
    children,
    ...rest
  }: {
    icon?: string;
    value: string | number;
    label: string;
    color?: string;
    delay?: number;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="stat-card {className}" style="animation-delay: {delay}s" {...rest}>
  <div class="stat-card-header">
    {#if icon}
      <div class="stat-card-icon" style:background="{color}" style:opacity="0.12" style:color={color}>
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
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid transparent;
    border-radius: 8px;
    padding: 16px;
    transition: border-color 0.15s ease, transform 0.15s ease;
    animation: fadeSlideIn 0.3s ease both;
    opacity: 0;
  }

  .stat-card:hover {
    border-color: var(--accent);
    border-left-color: var(--accent);
    transform: translateY(-1px);
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
    font-weight: 700;
    letter-spacing: -0.6px;
    color: var(--text);
    line-height: 1.1;
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
  }

  .stat-card-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
    margin-top: 2px;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
