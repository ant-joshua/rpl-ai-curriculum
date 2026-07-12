<script lang="ts">
	let {
		width = '100%',
		height = '16px',
		borderRadius = '6px',
		variant = 'text'
	}: {
		width?: string;
		height?: string;
		borderRadius?: string;
		variant?: 'text' | 'card' | 'chart' | 'circle';
	} = $props();
</script>

<div
	class="skeleton"
	class:skeleton-text={variant === 'text'}
	class:skeleton-card={variant === 'card'}
	class:skeleton-chart={variant === 'chart'}
	class:skeleton-circle={variant === 'circle'}
	style={variant === 'text' || variant === 'circle' ? `width: ${width}; height: ${height}; border-radius: ${borderRadius};` : ''}
>
	{#if variant === 'card'}
		<div class="skeleton-card-header">
			<div class="skeleton skeleton-text" style="width: 50px; height: 22px; border-radius: 20px;"></div>
			<div class="skeleton skeleton-text" style="width: 20px; height: 20px; border-radius: 4px;"></div>
		</div>
		<div class="skeleton skeleton-text" style="width: 85%; height: 18px; margin-top: 12px;"></div>
		<div class="skeleton skeleton-text" style="width: 65%; height: 14px; margin-top: 8px;"></div>
		<div class="skeleton-card-footer">
			<div class="skeleton skeleton-text" style="width: 100%; height: 6px; border-radius: 3px;"></div>
			<div class="skeleton skeleton-text" style="width: 60px; height: 16px; border-radius: 4px; align-self: flex-end;"></div>
		</div>
	{:else if variant === 'chart'}
		<div class="skeleton skeleton-text" style="width: 100%; height: 100%; border-radius: 10px;"></div>
	{/if}
</div>

<style>
	.skeleton {
		background: #1e2240;
		overflow: hidden;
		position: relative;
	}

	.skeleton::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#2a2f52 25%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.skeleton-text {
		border-radius: 6px;
	}

	.skeleton-circle {
		border-radius: 50%;
	}

	/* Card variant built-in layout */
	.skeleton-card {
		background: #1e2240;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		position: relative;
		overflow: hidden;
	}

	.skeleton-card > .skeleton::after {
		background: none;
		animation: none;
	}

	.skeleton-card::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#2a2f52 25%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		pointer-events: none;
	}

	.skeleton-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.skeleton-card-footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: auto;
		padding-top: 12px;
	}

	/* Chart variant */
	.skeleton-chart {
		border-radius: 10px;
		background: #1e2240;
		overflow: hidden;
		position: relative;
	}

	.skeleton-chart::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#2a2f52 25%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		pointer-events: none;
	}
</style>
