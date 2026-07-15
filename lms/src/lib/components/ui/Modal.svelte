<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = false,
		title = '',
		onclose,
		class: className = '',
		children,
		footer,
	}: {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		class?: string;
		children?: Snippet;
		footer?: Snippet;
	} = $props();

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose?.();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ui-modal-overlay"
		role="dialog"
		tabindex="-1"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class={['ui-modal', className].filter(Boolean).join(' ')} onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="ui-modal-header">
				<h2 class="ui-modal-title">{title}</h2>
				<button class="ui-modal-close" onclick={() => onclose?.()} type="button" aria-label="Close">&times;</button>
			</div>
			<div class="ui-modal-body">
				{@render children?.()}
			</div>
			{#if footer}
				<div class="ui-modal-footer">
					{@render footer?.()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ui-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
		animation: fadeIn 0.15s ease;
	}
	.ui-modal {
		background: #191a1b;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		width: 100%;
		max-width: 480px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2),
			0 8px 2px rgba(0, 0, 0, 0),
			0 5px 2px rgba(0, 0, 0, 0.01),
			0 3px 2px rgba(0, 0, 0, 0.04),
			0 1px 1px rgba(0, 0, 0, 0.07),
			0 0 1px rgba(0, 0, 0, 0.08);
		animation: scaleIn 0.15s ease;
	}
	.ui-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		flex-shrink: 0;
	}
	.ui-modal-title {
		font-size: 17px;
		font-weight: 590;
		margin: 0;
		color: #f7f8f8;
		font-feature-settings: 'cv01', 'ss03';
	}
	.ui-modal-close {
		background: none;
		border: none;
		font-size: 24px;
		color: #8a8f98;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		transition: color 0.15s;
	}
	.ui-modal-close:hover {
		color: #f7f8f8;
	}
	.ui-modal-body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.ui-modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 20px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		flex-shrink: 0;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
