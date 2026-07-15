<script lang="ts">
	let {
		label = '',
		placeholder = '',
		value = $bindable(''),
		error,
		disabled = false,
		rows = 3,
		class: className = '',
		...rest
	}: {
		label?: string;
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
	{#if label}
		<label class="textarea-label" for="textarea-{label.replace(/\s/g, '-').toLowerCase()}">{label}</label>
	{/if}
	<textarea
		{placeholder}
		bind:value
		{disabled}
		{rows}
		class="textarea-field {className}"
		class:textarea-error={!!error}
		id="textarea-{label.replace(/\s/g, '-').toLowerCase()}"
		{...rest}
	></textarea>
	{#if error}
		<span class="textarea-error-text">{error}</span>
	{/if}
</div>

<style>
	.textarea-label {
		font-size: 12px;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 4px;
		font-weight: 500;
	}

	.textarea-field {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #f7f8f8;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		resize: vertical;
		box-sizing: border-box;
	}
	.textarea-field::placeholder {
		color: #62666d;
	}
	.textarea-field:focus {
		outline: none;
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}
	.textarea-field:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.textarea-error {
		border-color: #ef4444;
	}
	.textarea-error:focus {
		border-color: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
	}
	.textarea-error-text {
		font-size: 0.75rem;
		color: #ef4444;
	}
</style>
