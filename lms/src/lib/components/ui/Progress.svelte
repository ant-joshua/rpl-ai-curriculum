<script lang="ts">
	type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';
	type ProgressSize = 'sm' | 'md' | 'lg';

	let {
		value = 0,
		max = 100,
		variant = 'default' as ProgressVariant,
		size = 'md' as ProgressSize,
		showLabel = false,
		class: className = '',
	}: {
		value?: number;
		max?: number;
		variant?: ProgressVariant;
		size?: ProgressSize;
		showLabel?: boolean;
		class?: string;
	} = $props();

	let pct = $derived(max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0);

	const SIZE_HEIGHTS: Record<ProgressSize, string> = {
		sm: '4px',
		md: '8px',
		lg: '14px',
	};

	let barHeight = $derived(SIZE_HEIGHTS[size]);

	let variantClass = $derived(`variant-${variant}`);
</script>

<div class="progress-wrap {className}">
	<div
		class="progress-bar {variantClass}"
		role="progressbar"
		aria-valuenow={value}
		aria-valuemin={0}
		aria-valuemax={max}
		style="height: {barHeight};"
	>
		<div class="progress-fill" style="width: {pct}%;"></div>
	</div>
	{#if showLabel}
		<span class="progress-label">{Math.round(pct)}%</span>
	{/if}
</div>

<style>
	.progress-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.progress-bar {
		flex: 1;
		background: var(--bg-secondary, rgba(255,255,255,0.02));
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--accent, #5e6ad2);
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.variant-success .progress-fill {
		background: var(--success, #22c55e);
	}

	.variant-warning .progress-fill {
		background: var(--warning, #f59e0b);
	}

	.variant-danger .progress-fill {
		background: var(--danger, #ef4444);
	}

	.progress-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary, #d0d6e0);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
