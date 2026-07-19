<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  let {
    icon,
    title,
    description,
    message,
    class: className = '',
    children,
    ...rest
  }: {
    icon?: string;
    title?: string;
    description?: string;
    message?: string;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  // Backward compat: if `message` passed, use as description
  let desc = $derived(description ?? message ?? '');
  let isEmojiIcon = $derived(icon ? icon.codePointAt(0)! > 0x1F000 : false);
</script>

<div class="empty-state {className}" {...rest}>
  {#if icon}
    <div class="empty-state-icon">
      {#if isEmojiIcon}
        <span class="emoji-icon">{icon}</span>
      {:else}
        <Icon name={icon} size={48} />
      {/if}
    </div>
  {/if}
  {#if title}
    <h3 class="empty-state-title">{title}</h3>
  {/if}
  {#if desc}
    <p class="empty-state-description">{desc}</p>
  {/if}
  {#if children}
    <div class="empty-state-action">
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
    min-height: 160px;
  }

  .empty-state-icon {
    margin-bottom: 16px;
    color: #94a3b8;
  }

  .emoji-icon {
    font-size: 48px;
    line-height: 1;
  }

  .empty-state-title {
    font-size: 16px;
    font-weight: 510;
    color: #1a1a2e;
    margin: 0 0 8px;
  }

  .empty-state-description {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }

  .empty-state-action {
    margin-top: 20px;
  }
</style>
