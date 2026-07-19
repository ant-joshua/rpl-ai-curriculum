<script lang="ts">
	type Option = { value: string; label: string };

	let {
		value = $bindable(''),
		options = [] as Option[],
		class: className = '',
		onselect,
	}: {
		value?: string;
		options?: Option[];
		class?: string;
		onselect?: (val: string) => void;
	} = $props();
</script>

<div class={['ui-toggle-group', className].filter(Boolean).join(' ')}>
	{#each options as opt}
		<button
			class="ui-toggle-btn"
			class:active={value === opt.value}
			onclick={() => { value = opt.value; onselect?.(opt.value); }}
			type="button"
		>
			{opt.label}
		</button>
	{/each}
</div>

<style>
	.ui-toggle-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px;
		padding: 3px;
	}
	.ui-toggle-btn {
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 510;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		color: #64748b;
		background: none;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.ui-toggle-btn:hover {
		color: #1a1a2e;
	}
	.ui-toggle-btn.active {
		background: #4F46E5;
		color: #ffffff;
	}
</style>
