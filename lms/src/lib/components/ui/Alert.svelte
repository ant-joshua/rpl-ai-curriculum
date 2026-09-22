<script lang="ts">
	type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

	let {
		variant = 'info' as AlertVariant,
		dismissible = false,
		show = true,
		class: className = '',
		children,
		onDismiss,
	}: {
		variant?: AlertVariant;
		dismissible?: boolean;
		show?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
		onDismiss?: () => void;
	} = $props();

	const ICONS: Record<AlertVariant, string> = {
		info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
		success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
		warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
		danger: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
	};

	let visible = $state(true);

	$effect(() => {
		visible = show;
	});

	function handleDismiss() {
		visible = false;
		onDismiss?.();
	}
</script>

{#if visible}
	<div class="alert alert-{variant} {className}" role="alert">
		<span class="alert-icon">{@html ICONS[variant]}</span>
		<div class="alert-body">
			{@render children?.()}
		</div>
		{#if dismissible}
			<button class="alert-close" onclick={handleDismiss} aria-label="Dismiss">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		{/if}
	</div>
{/if}

<style>
	.alert {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 8px;
		border: 1px solid;
		transition: opacity 0.2s ease, transform 0.2s ease;
		font-size: 14px;
		line-height: 1.5;
		font-family: var(--font-sans);
	}

	.alert-info {
		background: var(--accent-light);
		border-color: var(--border);
		color: var(--text);
		animation: slideDown 0.25s ease both;
	}
	.alert-info .alert-icon { color: var(--accent); }

	.alert-success {
		background: var(--success-light);
		border-color: rgba(45, 122, 79, 0.25);
		color: var(--text);
		animation: slideDown 0.25s ease both;
	}
	.alert-success .alert-icon { color: var(--success); }

	.alert-warning {
		background: var(--warning-light);
		border-color: rgba(184, 134, 11, 0.25);
		color: var(--text);
		animation: slideDown 0.25s ease both;
	}
	.alert-warning .alert-icon { color: var(--warning); }

	.alert-danger {
		background: var(--danger-light);
		border-color: rgba(166, 61, 64, 0.25);
		color: var(--text);
		animation: slideDown 0.25s ease both;
	}
	.alert-danger .alert-icon { color: var(--danger); }

	.alert-icon {
		flex-shrink: 0;
		margin-top: 2px;
		display: inline-flex;
	}

	.alert-body {
		flex: 1;
		min-width: 0;
	}

	.alert-body :global(p) {
		margin: 0;
	}

	.alert-body :global(p + p) {
		margin-top: 4px;
	}

	.alert-close {
		flex-shrink: 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		padding: 2px;
		border-radius: 4px;
		transition: all 0.12s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
	}

	.alert-close:hover {
		opacity: 1;
		color: var(--text);
		background: var(--surface-alt);
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
