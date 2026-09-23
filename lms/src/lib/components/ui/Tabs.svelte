<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface TabItem {
		id: string;
		label: string;
		icon?: string;
		badge?: string | number;
		disabled?: boolean;
	}

	let {
		items = [],
		value = $bindable(''),
		variant = 'pill',
		size = 'md',
		class: className = '',
		onchange,
		children
	}: {
		items?: TabItem[];
		value?: string;
		variant?: 'pill' | 'underline' | 'contained';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		onchange?: (tabId: string) => void;
		children?: Snippet;
	} = $props();

	function selectTab(id: string) {
		value = id;
		onchange?.(id);
	}
</script>

<div
	class="ui-tabs ui-tabs--{variant} ui-tabs--{size} {className}"
	role="tablist"
>
	{#if items && items.length > 0}
		{#each items as item (item.id)}
			<button
				type="button"
				role="tab"
				class="ui-tab-btn"
				class:ui-tab-btn--active={value === item.id}
				disabled={item.disabled}
				aria-selected={value === item.id}
				onclick={() => selectTab(item.id)}
			>
				{#if item.icon}
					<span class="ui-tab-icon">{item.icon}</span>
				{/if}
				<span class="ui-tab-label">{item.label}</span>
				{#if item.badge !== undefined}
					<span class="ui-tab-badge">{item.badge}</span>
				{/if}
			</button>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.ui-tabs {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.ui-tabs::-webkit-scrollbar {
		display: none;
	}

	.ui-tab-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-family: inherit;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-secondary);
		transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
		user-select: none;
	}

	.ui-tab-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.ui-tabs--sm .ui-tab-btn {
		padding: 4px 10px;
		font-size: 0.8125rem;
		border-radius: 6px;
	}

	.ui-tabs--md .ui-tab-btn {
		padding: 6px 14px;
		font-size: 0.875rem;
		border-radius: 8px;
	}

	.ui-tabs--lg .ui-tab-btn {
		padding: 8px 18px;
		font-size: 0.9375rem;
		border-radius: 8px;
	}

	/* Variant: Pill */
	.ui-tabs--pill .ui-tab-btn {
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
	}

	.ui-tabs--pill .ui-tab-btn:hover:not(:disabled) {
		background: var(--surface-alt);
	}

	.ui-tabs--pill .ui-tab-btn--active {
		background: var(--accent) !important;
		color: #ffffff !important;
		border-color: var(--accent) !important;
		font-weight: 600;
	}

	/* Variant: Contained */
	.ui-tabs--contained {
		background: var(--surface-alt);
		padding: 4px;
		border-radius: 10px;
		border: 1px solid var(--border);
		gap: 4px;
	}

	.ui-tabs--contained .ui-tab-btn {
		border-radius: 6px;
		border: 1px solid transparent;
	}

	.ui-tabs--contained .ui-tab-btn:hover:not(:disabled) {
		color: var(--text);
	}

	.ui-tabs--contained .ui-tab-btn--active {
		background: var(--surface);
		color: var(--accent);
		border-color: var(--border);
		font-weight: 600;
	}

	/* Variant: Underline */
	.ui-tabs--underline {
		border-bottom: 1px solid var(--border);
		gap: 16px;
	}

	.ui-tabs--underline .ui-tab-btn {
		border-radius: 0;
		padding-bottom: 10px;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}

	.ui-tabs--underline .ui-tab-btn:hover:not(:disabled) {
		color: var(--text);
	}

	.ui-tabs--underline .ui-tab-btn--active {
		color: var(--accent);
		border-bottom-color: var(--accent);
		font-weight: 600;
	}

	.ui-tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px 6px;
		font-size: 0.75rem;
		line-height: 1;
		border-radius: 9999px;
		background: var(--surface-alt);
		color: var(--text-secondary);
	}

	.ui-tab-btn--active .ui-tab-badge {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
	}
</style>
