<script lang="ts">
	type Variant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
	type Size = 'sm' | 'md';

	let {
		variant = 'default',
		size = 'sm',
		class: className = '',
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		class?: string;
		children?: import('svelte').Snippet;
		[key: string]: unknown;
	} = $props();

	const cls = $derived(['badge', `badge-${variant}`, `badge-${size}`, className].filter(Boolean).join(' '));
</script>

<span class={cls} {...rest}>
	{@render children?.()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-weight: 600;
		border-radius: 99px;
		white-space: nowrap;
		line-height: 1;
	}
	.badge-sm { padding: 2px 8px; font-size: 11px; }
	.badge-md { padding: 4px 12px; font-size: 12px; }

	.badge-default {
		background: var(--bg-primary, var(--bg-secondary));
		color: var(--text-secondary);
	}
	.badge-primary {
		background: color-mix(in srgb, var(--accent) 12%, var(--bg-primary, var(--bg-secondary)));
		color: var(--accent);
	}
	.badge-accent {
		background: color-mix(in srgb, var(--accent) 12%, var(--bg-primary, var(--bg-secondary)));
		color: var(--accent);
	}
	.badge-success {
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}
	.badge-warning {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;
	}
	.badge-danger {
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;
	}
	.badge-info {
		background: rgba(79, 140, 255, 0.12);
		color: #4f8cff;
	}
	.badge-outline {
		background: transparent;
		border: 1px solid var(--border);
	}
</style>
