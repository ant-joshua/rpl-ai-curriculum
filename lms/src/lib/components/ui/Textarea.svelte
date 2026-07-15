<script lang="ts">
	let {
		placeholder = '',
		value = '',
		error,
		disabled = false,
		rows = 3,
		class: className = '',
		...rest
	}: {
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		rows?: number;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<div class="inline-flex flex-col gap-1.5 w-full">
	<textarea
		{placeholder}
		bind:value
		{disabled}
		{rows}
		class="textarea-field {className}"
		class:textarea-error={!!error}
		{...rest}
	></textarea>
	{#if error}
		<span class="textarea-error-text">{error}</span>
	{/if}
</div>

<style>
	.textarea-field {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: calc(var(--radius) - 0.125rem);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
		resize: vertical;
	}
	.textarea-field::placeholder {
		color: var(--muted-foreground);
		opacity: 0.7;
	}
	.textarea-field:focus {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 25%, transparent);
	}
	.textarea-field:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.textarea-error {
		border-color: var(--destructive);
	}
	.textarea-error:focus {
		border-color: var(--destructive);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--destructive) 25%, transparent);
	}
	.textarea-error-text {
		font-size: 0.75rem;
		color: var(--destructive);
	}
</style>
