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
		color: #f7f8f8;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
	}
	.input-field::placeholder {
		color: #8a8f98;
		opacity: 0.7;
	}
	.input-field:focus {
		outline: none;
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}
	.input-field:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.input-error {
		border-color: #ef4444;
	}
	.input-error:focus {
		border-color: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
	}
	.input-error-text {
		font-size: 0.75rem;
		color: #ef4444;
	}
</style>
