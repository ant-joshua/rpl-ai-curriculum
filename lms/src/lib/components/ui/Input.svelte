<script lang="ts">
	let {
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		error,
		disabled = false,
		class: className = '',
		...rest
	}: {
		type?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<div class="inline-flex flex-col gap-1.5">
	<input
		{type}
		{placeholder}
		bind:value
		{disabled}
		class="input-field {className}"
		class:input-error={!!error}
		{...rest}
	/>
	{#if error}
		<span class="input-error-text">{error}</span>
	{/if}
</div>

<style>
	.input-field {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: calc(var(--radius) - 0.125rem);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
	}
	.input-field::placeholder {
		color: var(--muted-foreground);
		opacity: 0.7;
	}
	.input-field:focus {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 25%, transparent);
	}
	.input-field:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.input-error {
		border-color: var(--destructive);
	}
	.input-error:focus {
		border-color: var(--destructive);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--destructive) 25%, transparent);
	}
	.input-error-text {
		font-size: 0.75rem;
		color: var(--destructive);
	}
</style>
