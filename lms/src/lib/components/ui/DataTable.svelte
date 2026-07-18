<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Column {
    key: string;
    label: string;
    width?: string;
  }

  let {
    columns = [],
    data = [],
    emptyMessage = 'Tidak ada data',
    onRowClick,
    emptyIcon,
    emptyDescription,
    cell,
    class: className = '',
    ...rest
  }: {
    columns?: Column[];
    data?: Record<string, unknown>[];
    emptyMessage?: string;
    onRowClick?: (row: Record<string, unknown>, index: number) => void;
    emptyIcon?: string;
    emptyDescription?: string;
    cell?: Snippet<[{ column: Column; row: Record<string, unknown>; index: number }]>;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="data-table-wrapper {className}" {...rest}>
  {#if data.length === 0}
    <div class="data-table-empty">
      {#if emptyIcon}
        <span class="data-table-empty-icon">{emptyIcon}</span>
      {/if}
      {#if emptyDescription}
        <p class="data-table-empty-desc">{emptyDescription}</p>
      {:else}
        <p class="data-table-empty-desc">{emptyMessage}</p>
      {/if}
    </div>
  {:else}
    <table class="data-table">
      <thead>
        <tr>
          {#each columns as col}
            <th style:width={col.width ?? 'auto'}>{col.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data as row, i}
          <tr
            class:clickable={!!onRowClick}
            onclick={onRowClick ? () => onRowClick(row, i) : undefined}
          >
            {#each columns as col}
              <td>
                {#if cell}
                  {@render cell({ column: col, row, index: i })}
                {:else}
                  {row[col.key] ?? ''}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .data-table-wrapper {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-sans);
    font-feature-settings: 'cv01', 'ss03';
  }

  thead tr {
    background: rgba(255, 255, 255, 0.04);
  }

  th {
    text-align: left;
    font-size: 13px;
    font-weight: 510;
    color: #8a8f98;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    white-space: nowrap;
  }

  td {
    font-size: 14px;
    color: #d0d6e0;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  tbody tr {
    transition: background 0.15s;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr.clickable {
    cursor: pointer;
  }

  .data-table-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    text-align: center;
  }

  .data-table-empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  .data-table-empty-desc {
    font-size: 14px;
    color: #8a8f98;
    margin: 0;
  }
</style>
