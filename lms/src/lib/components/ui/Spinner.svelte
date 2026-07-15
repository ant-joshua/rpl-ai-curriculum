<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	let {
		size = 'sm',
		class: className = '',
		...rest
	}: {
		size?: Size;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const sizeMap: Record<Size, string> = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};
</script>

<svg
	class="spinner {sizeMap[size]} {className}"
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	{...rest}
>
	<circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
	<path class="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>

<style>
	.spinner {
		animation: spin 0.7s linear infinite;
		opacity: 0.6;
	}
	.spinner-track {
		opacity: 0.15;
	}
	.spinner-fill {
		opacity: 0.85;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
