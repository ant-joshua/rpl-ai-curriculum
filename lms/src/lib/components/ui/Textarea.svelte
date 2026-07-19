<script lang="ts">
	let {
		label = '',
		placeholder = '',
		value = $bindable(''),
		error,
		disabled = false,
		rows = 3,
		icon,
		class: className = '',
		...rest
	}: {
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		rows?: number;
		icon?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();

	let focused = $state(false);
	const hasValue = $derived(value !== '' && value !== undefined && value !== null);
	const floatUp = $derived(focused || hasValue);
	const textareaId = $derived(label ? `textarea-${label.replace(/\s/g, '-').toLowerCase()}` : `textarea-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div
	class="textarea-wrapper"
	class:textarea-wrapper--focused={focused}
	class:textarea-wrapper--error={!!error}
	class:textarea-wrapper--disabled={disabled}
	class:textarea-wrapper--has-value={hasValue}
>
	{#if icon}
		<div class="textarea-icon-prefix">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				{#if icon === 'edit'}
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
				{:else if icon === 'message-square'}
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
				{:else}
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
					<polyline points="14 2 14 8 20 8"/>
					<line x1="16" y1="13" x2="8" y2="13"/>
					<line x1="16" y1="17" x2="8" y2="17"/>
				{/if}
			</svg>
		</div>
	{/if}

	<textarea
		{placeholder}
		bind:value
		{disabled}
		{rows}
		class="textarea-field {className}"
		class:textarea-field--has-icon={!!icon}
		class:textarea-error={!!error}
		id={textareaId}
		onfocus={() => focused = true}
		onblur={() => focused = false}
		{...rest}
	></textarea>

	{#if label}
		<label
			class="textarea-label"
			for={textareaId}
			class:textarea-label--float={floatUp}
		>{label}</label>
	{/if}

	{#if error}
		<span class="textarea-error-text">{error}</span>
	{/if}
</div>

<style>
	.textarea-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.textarea-icon-prefix {
		position: absolute;
		left: 12px;
		top: 14px;
		color: #94a3b8;
		pointer-events: none;
		z-index: 1;
		transition: color 0.2s ease;
	}
	.textarea-wrapper--focused .textarea-icon-prefix {
		color: #4F46E5;
	}

	.textarea-field {
		display: block;
		width: 100%;
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #1a1a2e;
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, padding-top 0.2s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		resize: vertical;
		box-sizing: border-box;
		outline: none;
	}
	.textarea-field--has-icon {
		padding-left: 36px;
	}
	.textarea-field::placeholder {
		color: #94a3b8;
		transition: opacity 0.2s ease;
	}
	.textarea-field:focus {
		outline: none;
		border-color: #4F46E5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
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
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
	}

	/* Floating label */
	.textarea-label {
		position: absolute;
		left: 12px;
		top: 14px;
		font-size: 13px;
		color: #94a3b8;
		font-weight: 500;
		pointer-events: none;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: left center;
	}
	.textarea-field--has-icon ~ .textarea-label {
		left: 36px;
	}
	.textarea-label--float {
		top: 6px;
		font-size: 10px;
		color: #4F46E5;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.textarea-wrapper--error .textarea-label--float {
		color: #ef4444;
	}
	.textarea-label--float ~ .textarea-field {
		padding-top: 1rem;
		padding-bottom: 0.3rem;
	}

	.textarea-error-text {
		font-size: 0.75rem;
		color: #ef4444;
		margin-top: 2px;
		display: flex;
		align-items: center;
		gap: 4px;
		animation: fadeSlideIn 0.2s ease both;
	}
	.textarea-error-text::before {
		content: '';
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #ef4444;
		flex-shrink: 0;
	}

	@keyframes fadeSlideIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
