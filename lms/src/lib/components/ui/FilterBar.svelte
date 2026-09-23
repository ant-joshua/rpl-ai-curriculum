<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		wrap = true,
		children,
		actions
	}: {
		class?: string;
		wrap?: boolean;
		children?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="ui-filter-bar {wrap ? 'ui-filter-bar--wrap' : ''} {className}">
	<div class="ui-filter-bar__inputs">
		{@render children?.()}
	</div>
	{#if actions}
		<div class="ui-filter-bar__actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.ui-filter-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
	}

	.ui-filter-bar--wrap {
		flex-wrap: wrap;
	}

	.ui-filter-bar__inputs {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		flex-wrap: wrap;
		min-width: 240px;
	}

	.ui-filter-bar__actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.ui-filter-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.ui-filter-bar__inputs {
			width: 100%;
		}

		.ui-filter-bar__actions {
			justify-content: flex-end;
			width: 100%;
		}
	}
</style>
