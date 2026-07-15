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
