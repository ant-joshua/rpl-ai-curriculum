<script lang="ts">
	let {
		value = 0,
		max = 100,
		showLabel = false,
		height = 6,
		color,
		class: className = '',
	}: {
		value?: number;
		max?: number;
		showLabel?: boolean;
		height?: number;
		color?: string;
		class?: string;
	} = $props();

	let pct = $derived(max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0);
</script>

<div class={['ui-progress', className].filter(Boolean).join(' ')}>
	<div class="ui-progress-track" style="height: {height}px;">
		<div
			class="ui-progress-fill"
			style="width: {pct}%; {color ? `background: ${color}` : ''}"
		></div>
	</div>
	{#if showLabel}
		<span class="ui-progress-label">{pct}%</span>
	{/if}
</div>

<style>
	.ui-progress {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-progress-track {
		flex: 1;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 3px;
		overflow: hidden;
	}
	.ui-progress-fill {
		height: 100%;
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		border-radius: 3px;
		transition: width 0.4s ease;
	}
	.ui-progress-label {
		font-size: 12px;
		font-weight: 510;
		color: #8a8f98;
		min-width: 32px;
		text-align: right;
	}
</style>
