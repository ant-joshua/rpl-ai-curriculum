<script lang="ts">
	let {
		orientation = 'horizontal' as 'horizontal' | 'vertical',
		class: className = '',
	}: {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	} = $props();
</script>

{#if orientation === 'horizontal'}
	<hr class="separator separator-horizontal {className}" aria-orientation="horizontal" />
{:else}
	<div class="separator separator-vertical {className}" role="separator" aria-orientation="vertical"></div>
{/if}

<style>
	.separator {
		flex-shrink: 0;
		border: none;
		margin: 0;
		background: var(--border, #2a2d3e);
	}

	.separator-horizontal {
		width: 100%;
		height: 1px;
	}

	.separator-vertical {
		width: 1px;
		height: 100%;
		min-height: 1em;
	}
</style>
