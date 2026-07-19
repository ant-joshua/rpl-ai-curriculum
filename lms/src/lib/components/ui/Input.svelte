<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		type = 'text',
		label = '',
		placeholder = '',
		value = $bindable(''),
		error,
		disabled = false,
		icon,  // icon name (string) for prefix icon
		class: className = '',
		...rest
	}: {
		type?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		icon?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();

	let focused = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();
	const hasValue = $derived(value !== '' && value !== undefined && value !== null);
	const floatUp = $derived(focused || hasValue);
	const inputId = $derived(label ? `input-${label.replace(/\s/g, '-').toLowerCase()}` : `input-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class="input-wrapper" class:input-wrapper--has-value={hasValue} class:input-wrapper--focused={focused} class:input-wrapper--error={!!error} class:input-wrapper--disabled={disabled}>
	{#if icon}
		<div class="input-icon-prefix">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				{#if icon === 'search'}
					<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
				{:else if icon === 'user'}
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
				{:else if icon === 'mail'}
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
				{:else if icon === 'lock'}
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
				{:else if icon === 'calendar'}
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
				{:else if icon === 'clock'}
					<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
				{:else}
					<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
				{/if}
			</svg>
		</div>
	{/if}

	<input
		{type}
		{placeholder}
		bind:value
		{disabled}
		class="input-field {className}"
		class:input-field--has-icon={!!icon}
		class:input-error={!!error}
		id={inputId}
		onfocus={() => focused = true}
		onblur={() => focused = false}
		bind:this={inputEl}
		{...rest}
	/>

	{#if label}
		<label
			class="input-label"
			for={inputId}
			class:input-label--float={floatUp}
		>{label}</label>
	{/if}

	{#if error}
		<span class="input-error-text">{error}</span>
	{/if}
</div>

<style>
	.input-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.input-icon-prefix {
		position: absolute;
		left: 12px;
		top: 14px;
		color: #94a3b8;
		pointer-events: none;
		z-index: 1;
		transition: color 0.2s ease;
	}
	.input-wrapper--focused .input-icon-prefix {
		color: #4F46E5;
	}

	.input-field {
		display: block;
		width: 100%;
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #1a1a2e;
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, padding-top 0.2s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		box-sizing: border-box;
		outline: none;
	}
	.input-field--has-icon {
		padding-left: 36px;
	}
	.input-field::placeholder {
		color: #94a3b8;
		transition: opacity 0.2s ease;
	}
	.input-field:focus {
		outline: none;
		border-color: #4F46E5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
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
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
	}

	/* Floating label */
	.input-label {
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
	.input-field--has-icon ~ .input-label {
		left: 36px;
	}
	.input-label--float {
		top: 6px;
		font-size: 10px;
		color: #4F46E5;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.input-wrapper--error .input-label--float {
		color: #ef4444;
	}
	/* When floating, adjust input padding to give room */
	.input-label--float ~ .input-field {
		padding-top: 1rem;
		padding-bottom: 0.3rem;
	}

	.input-error-text {
		font-size: 0.75rem;
		color: #ef4444;
		margin-top: 2px;
		display: flex;
		align-items: center;
		gap: 4px;
		animation: fadeSlideIn 0.2s ease both;
	}
	.input-error-text::before {
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
