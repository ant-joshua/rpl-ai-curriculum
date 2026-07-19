<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = 'Cari...',
    onSearch,
    class: className = '',
    ...rest
  }: {
    value?: string;
    placeholder?: string;
    onSearch?: (value: string) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="search-bar {className}" {...rest}>
  <svg class="search-bar-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
  <input
    type="search"
    {placeholder}
    bind:value
    class="search-bar-input"
    oninput={onSearch ? () => onSearch(value) : undefined}
  />
  <div class="search-bar-hint">
    <kbd>/</kbd>
  </div>
</div>

<style>
  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-bar-icon {
    position: absolute;
    left: 12px;
    color: #64748b;
    pointer-events: none;
    flex-shrink: 0;
  }

  .search-bar-input {
    width: 100%;
    height: 36px;
    padding: 0 40px 0 34px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.02);
    color: #1a1a2e;
    font-size: 14px;
    font-family: var(--font-sans);
    font-feature-settings: 'cv01', 'ss03';
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .search-bar-input:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }

  .search-bar-input::placeholder {
    color: #64748b;
  }

  .search-bar-hint {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 2px;
    pointer-events: none;
  }

  .search-bar-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    color: #64748b;
    font-size: 11px;
    font-family: var(--font-sans);
    font-feature-settings: 'cv01', 'ss03';
    line-height: 1;
  }
</style>
