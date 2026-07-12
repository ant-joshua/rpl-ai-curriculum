<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { SHORTCUTS } from '$lib/stores/shortcuts.svelte';

	let { show, onclose }: { show: boolean; onclose: () => void } = $props();

	const shortcutList = Object.entries(SHORTCUTS) as [string, string][];

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="shortcut-overlay" onclick={handleOverlayClick} transition:fade={{ duration: 150 }}>
		<div class="shortcut-modal" transition:scale={{ start: 0.95, duration: 200 }}>
			<div class="shortcut-header">
				<h2>⌨️ Keyboard Shortcuts</h2>
				<button class="close-btn" onclick={onclose}>✕</button>
			</div>
			<div class="shortcut-grid">
				{#each shortcutList as [key, action]}
					<div class="shortcut-item">
						<kbd class="shortcut-key">{key}</kbd>
						<span class="shortcut-action">
							{action === 'showHelp' ? 'Show shortcut help' : `Go to ${action}`}
						</span>
					</div>
				{/each}
			</div>
			<p class="shortcut-hint">Tekan <kbd>g</kbd> lalu huruf untuk navigasi cepat. <kbd>?</kbd> buka ini.</p>
		</div>
	</div>
{/if}

<style>
	.shortcut-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.shortcut-modal {
		background: var(--surface, #1e1e2e);
		border: 1px solid var(--border, #333);
		border-radius: 16px;
		padding: 28px;
		width: 90%;
		max-width: 480px;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
	}

	.shortcut-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.shortcut-header h2 {
		font-size: 18px;
		font-weight: 700;
		color: var(--text, #e0e0e0);
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 1px solid var(--border, #333);
		background: transparent;
		color: var(--text-secondary, #888);
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: var(--hover, rgba(255,255,255,0.05));
		color: var(--text, #e0e0e0);
	}

	.shortcut-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 6px;
		margin-bottom: 16px;
	}

	.shortcut-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		border-radius: 8px;
		background: var(--bg-secondary, #16162a);
	}

	.shortcut-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 48px;
		padding: 4px 10px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 13px;
		font-weight: 600;
		color: var(--accent, #6c5ce7);
		background: rgba(108, 92, 231, 0.1);
		border: 1px solid rgba(108, 92, 231, 0.25);
		border-radius: 6px;
		text-align: center;
	}

	.shortcut-action {
		font-size: 13px;
		color: var(--text-secondary, #888);
		font-weight: 500;
	}

	.shortcut-hint {
		font-size: 12px;
		color: var(--text-secondary, #666);
		text-align: center;
		margin: 0;
	}

	.shortcut-hint kbd {
		display: inline;
		padding: 2px 6px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 11px;
		font-weight: 600;
		color: var(--accent, #6c5ce7);
		background: rgba(108, 92, 231, 0.1);
		border: 1px solid rgba(108, 92, 231, 0.25);
		border-radius: 4px;
	}
</style>
