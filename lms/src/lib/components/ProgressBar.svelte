<script lang="ts">
	let {
		value = 0,
		height = 8,
		label = ''
	}: {
		value?: number;
		height?: number;
		label?: string;
	} = $props();
</script>

<div class="progress-wrapper">
	{#if label}
		<span class="progress-label">{label}</span>
	{/if}
	<div class="progress-track" style="height: {height}px">
		<div
			class="progress-fill"
			style="width: {Math.min(value, 100)}%"
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={100}
		></div>
	</div>
</div>

<style>
	.progress-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.progress-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
		min-width: 40px;
	}

	.progress-track {
		flex: 1;
		background: var(--bg-secondary);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 99px;
		transition: width 0.4s ease;
	}
</style>
