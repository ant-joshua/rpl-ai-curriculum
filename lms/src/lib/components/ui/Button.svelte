<script lang="ts">
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		href,
		class: className = '',
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		class?: string;
		children?: import('svelte').Snippet;
		[key: string]: unknown;
	} = $props();

	const base = 'btn';
	const variantClass = $derived({
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		ghost: 'btn-ghost',
		danger: 'btn-danger',
		outline: 'btn-outline'
	}[variant]);
	const sizeClass = $derived(`btn-${size}`);

	const cls = $derived([base, variantClass, sizeClass, className].filter(Boolean).join(' '));
</script>

{#if href}
	<a
		{href}
		class={cls}
		{...rest}
	>
		{#if loading}
			<Spinner size="sm" />
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		class={cls}
		{disabled}
		{...rest}
	>
		{#if loading}
			<Spinner size="sm" />
		{/if}
		{@render children?.()}
	</button>
{/if}
