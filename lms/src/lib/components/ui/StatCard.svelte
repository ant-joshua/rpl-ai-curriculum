<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    icon,
    value,
    label,
    color = '#4F46E5',
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
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-left: 3px solid transparent;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease;
    animation: fadeSlideIn 0.3s ease both;
    opacity: 0;
  }

  .stat-card:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(79, 70, 229, 0.2);
    border-left-color: #4F46E5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
    color: #1a1a2e;
    line-height: 1.1;
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
  }

  .stat-card-label {
    font-size: 13px;
    font-weight: 510;
    color: #64748b;
    font-feature-settings: 'cv01', 'ss03';
    font-family: var(--font-sans);
    margin-top: 2px;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
