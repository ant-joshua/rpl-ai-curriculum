<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getToasts, dismissToast, type Toast, type ToastType } from '$lib/stores/toast.svelte';

	let toasts = $state<Toast[]>([]);

	$effect(() => {
		toasts = getToasts();
	});

	function icon(type: ToastType): string {
		switch (type) {
			case 'success': return '✅';
			case 'error': return '❌';
			case 'warning': return '⚠️';
			case 'info': return 'ℹ️';
		}
	}

	function accent(type: ToastType): string {
		switch (type) {
			case 'success': return 'var(--toast-success, #22c55e)';
			case 'error': return 'var(--toast-error, #ef4444)';
			case 'warning': return 'var(--toast-warning, #f59e0b)';
			case 'info': return 'var(--toast-info, #3b82f6)';
		}
	}
</script>

{#each toasts as toast (toast.id)}
	<div
		class="toast toast-{toast.type}"
		transition:fly={{ x: 100, duration: 300, opacity: 0 }}
		role="alert"
		onclick={() => dismissToast(toast.id)}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismissToast(toast.id); }}
		tabindex="0"
	>
		<span class="toast-icon">{icon(toast.type)}</span>
		<span class="toast-message">{toast.message}</span>
		<button
			class="toast-close"
			onclick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
			aria-label="Dismiss"
		>✕</button>
	</div>
{/each}

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 10px;
		background: var(--surface, #191a1b);
		color: var(--text, #f7f8f8);
		font-size: 14px;
		font-weight: 500;
		line-height: 1.4;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
		border: 1px solid var(--border, #2d2d4e);
		cursor: pointer;
		transition: box-shadow 0.15s ease;
		user-select: none;
		min-width: 260px;
		max-width: 400px;
	}
	.toast:hover {
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
	}
	.toast:focus-visible {
		outline: 2px solid var(--accent, #6c5ce7);
		outline-offset: 2px;
	}

	.toast-success { border-left: 4px solid var(--toast-success, #22c55e); }
	.toast-error   { border-left: 4px solid var(--toast-error, #ef4444); }
	.toast-warning { border-left: 4px solid var(--toast-warning, #f59e0b); }
	.toast-info    { border-left: 4px solid var(--toast-info, #3b82f6); }

	.toast-icon {
		font-size: 18px;
		flex-shrink: 0;
		line-height: 1;
	}
	.toast-message {
		flex: 1;
		min-width: 0;
		overflow-wrap: break-word;
	}
	.toast-close {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--text-secondary, #888);
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 2px;
		border-radius: 4px;
		transition: color 0.15s ease;
	}
	.toast-close:hover {
		color: var(--text, #f7f8f8);
	}
</style>
