<script lang="ts">
	import {
		getConfirmVisible,
		getConfirmTitle,
		getConfirmMessage,
		getConfirmConfirmText,
		getConfirmCancelText,
		getConfirmVariant,
		confirmAction,
		cancelAction,
		type ConfirmVariant,
	} from '$lib/stores/confirm.svelte';

	let show = $state(false);
	let title = $state('');
	let msg = $state('');
	let confirmLabel = $state('');
	let cancelLabel = $state('');
	let variant = $state<ConfirmVariant>('info');

	$effect(() => {
		show = getConfirmVisible();
		title = getConfirmTitle();
		msg = getConfirmMessage();
		confirmLabel = getConfirmConfirmText();
		cancelLabel = getConfirmCancelText();
		variant = getConfirmVariant();
	});

	function onBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) cancelAction();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cancelAction();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={onBackdropClick} role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
		<div class="dialog" class:dialog--danger={variant === 'danger'} class:dialog--warning={variant === 'warning'} class:dialog--info={variant === 'info'}>
			<div class="dialog-header">
				<span class="dialog-icon">
					{#if variant === 'danger'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
					{:else if variant === 'warning'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
					{:else}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
					{/if}
				</span>
				<h3 id="confirm-title">{title}</h3>
			</div>
			<div class="dialog-body">
				<p>{msg}</p>
			</div>
			<div class="dialog-footer">
				<button class="btn btn-cancel" onclick={cancelAction}>{cancelLabel}</button>
				<button class="btn btn-confirm" class:btn-confirm--danger={variant === 'danger'} class:btn-confirm--warning={variant === 'warning'} onclick={confirmAction}>{confirmLabel}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.15s ease;
		padding: 1rem;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.dialog {
		background: var(--surface, rgba(0,0,0,0.02));
		border: 1px solid var(--border, rgba(0,0,0,0.06));
		border-radius: 14px;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
		max-width: 400px;
		width: 100%;
		padding: 1.5rem;
		animation: scaleIn 0.15s ease;
	}

	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.dialog-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.dialog-icon {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
	}

	.dialog--info .dialog-icon { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
	.dialog--warning .dialog-icon { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
	.dialog--danger .dialog-icon { background: rgba(239, 68, 68, 0.12); color: #ef4444; }

	.dialog-header h3 {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text, #e8eaf0);
		margin: 0;
	}

	.dialog-body p {
		color: var(--text-secondary, #8b8fa3);
		font-size: 0.9rem;
		line-height: 1.55;
		margin: 0 0 1.25rem 0;
	}

	.dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.625rem;
	}

	.btn {
		padding: 0.5rem 1.125rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: all 0.12s ease;
		line-height: 1.4;
	}

	.btn-cancel {
		background: var(--hover, rgba(0,0,0,0.05));
		color: var(--text-secondary, #8b8fa3);
		border: 1px solid var(--border, rgba(0,0,0,0.06));
	}
	.btn-cancel:hover {
		background: var(--surface-hover, #242638);
		color: var(--text, #e8eaf0);
	}

	.btn-confirm {
		background: var(--accent, #6c5ce7);
		color: #fff;
	}
	.btn-confirm:hover {
		filter: brightness(1.1);
	}

	.btn-confirm--danger {
		background: var(--danger, #ef4444);
	}
	.btn-confirm--danger:hover {
		filter: brightness(1.1);
	}

	.btn-confirm--warning {
		background: var(--warning, #f59e0b);
		color: #000;
	}
	.btn-confirm--warning:hover {
		filter: brightness(1.1);
	}
</style>
