<script lang="ts">
	import { fontSizeStore } from '$lib/stores/font-size.svelte';

	let current = $derived(fontSizeStore.fontSize);
</script>

<div class="font-size-control">
	<button class="fs-btn" onclick={() => fontSizeStore.decrease()} disabled={current === 14} title="Perkecil ukuran font">
		A−
	</button>
	<span class="fs-value">{current}px</span>
	<button class="fs-btn" onclick={() => fontSizeStore.increase()} disabled={current === 24} title="Perbesar ukuran font">
		A+
	</button>
</div>

<style>
	.font-size-control {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 6px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
	}
	.fs-btn {
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		padding: 4px 6px;
		border-radius: 4px;
		line-height: 1;
		transition: all 0.15s ease;
	}
	.fs-btn:hover:not(:disabled) {
		color: var(--accent);
		background: var(--accent-dim);
	}
	.fs-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.fs-value {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
		min-width: 28px;
		text-align: center;
		user-select: none;
	}
</style>
