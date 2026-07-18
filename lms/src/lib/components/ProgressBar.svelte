<script lang="ts">
	let { completed = 0, total = 0, showLabel = true }: { completed?: number; total?: number; showLabel?: boolean } = $props();

	let pct = $derived(total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0);
</script>

<div class="progress-wrap">
	<div class="progress-bar">
		<div class="progress-fill" style="width: {pct}%"></div>
	</div>
	{#if showLabel}
		<span class="progress-label">{completed}/{total} selesai</span>
	{/if}
</div>

<style>
	.progress-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: var(--bg-secondary, rgba(255,255,255,0.02));
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 4px;
		background: linear-gradient(90deg, var(--accent, #5e6ad2), var(--accent-secondary, #a78bfa));
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.progress-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary, #d0d6e0);
		white-space: nowrap;
	}
</style>
