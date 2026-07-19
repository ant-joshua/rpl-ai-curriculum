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
		transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
		font-size: 14px;
		line-height: 1.5;
		font-feature-settings: 'cv01', 'ss03';
	}

	.alert-info {
		background: rgba(79, 70, 229, 0.08);
		border-color: rgba(79, 70, 229, 0.2);
		color: #1a1a2e;
		animation: slideDown 0.25s ease both;
	}
	.alert-info .alert-icon { color: #4F46E5; }

	.alert-success {
		background: rgba(16, 185, 129, 0.08);
		border-color: rgba(16, 185, 129, 0.2);
		color: #1a1a2e;
		animation: slideDown 0.25s ease both;
	}
	.alert-success .alert-icon { color: #10b981; }

	.alert-warning {
		background: rgba(245, 158, 11, 0.08);
		border-color: rgba(245, 158, 11, 0.2);
		color: #1a1a2e;
		animation: slideDown 0.25s ease both;
	}
	.alert-warning .alert-icon { color: #f59e0b; }

	.alert-danger {
		background: rgba(239, 68, 68, 0.08);
		border-color: rgba(239, 68, 68, 0.2);
		color: #1a1a2e;
		animation: slideDown 0.25s ease both;
	}
	.alert-danger .alert-icon { color: #ef4444; }

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
		color: #64748b;
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
		color: #1a1a2e;
		background: rgba(0, 0, 0, 0.04);
	}
</style>
