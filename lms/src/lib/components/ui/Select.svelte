<script lang="ts">
	interface SelectOption {
		value: string;
		label: string;
	}

	let {
		label = '',
		options = [] as SelectOption[],
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		error,
		icon,
		class: className = '',
		onchange,
		...rest
	}: {
		label?: string;
		options?: SelectOption[];
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		icon?: string;
		class?: string;
		onchange?: (e: Event) => void;
		[key: string]: unknown;
	} = $props();

	let focused = $state(false);
	const hasValue = $derived(value !== '' && value !== undefined && value !== null);
	const floatUp = $derived(focused || hasValue);
	const selectId = $derived(label ? `select-${label.replace(/\s/g, '-').toLowerCase()}` : `select-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div
	class="select-wrapper"
	class:select-wrapper--focused={focused}
	class:select-wrapper--error={!!error}
	class:select-wrapper--disabled={disabled}
	class:select-wrapper--has-value={hasValue}
>
	{#if icon}
		<div class="select-icon-prefix">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				{#if icon === 'users'}
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
				{:else if icon === 'layers'}
					<polyline points="12 2 22 8.5 12 15 2 8.5"/><polyline points="2 15.5 12 22 22 15.5"/><polyline points="2 8.5 12 15 22 8.5"/>
				{:else if icon === 'book'}
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				{:else if icon === 'calendar'}
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
				{:else}
					<path d="M6 9l6 6 6-6"/>
				{/if}
			</svg>
		</div>
	{/if}

	<select
		class="select-field {className}"
		class:select-field--has-icon={!!icon}
		{disabled}
		bind:value
		onchange={onchange}
		id={selectId}
		onfocus={() => focused = true}
		onblur={() => focused = false}
		{...rest}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as opt}
			<option
				value={opt.value}
				selected={opt.value === value}
			>{opt.label}</option>
		{/each}
	</select>

	{#if label}
		<label
			class="select-label"
			for={selectId}
			class:select-label--float={floatUp}
		>{label}</label>
	{/if}

	{#if error}
		<span class="select-error-text">{error}</span>
	{/if}
</div>

<style>
	.select-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.select-icon-prefix {
		position: absolute;
		left: 12px;
		top: 14px;
		color: #94a3b8;
		pointer-events: none;
		z-index: 1;
		transition: color 0.2s ease;
	}
	.select-wrapper--focused .select-icon-prefix {
		color: #4F46E5;
	}

	.select-field {
		display: block;
		width: 100%;
		padding: 0.625rem 2rem 0.625rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #1a1a2e;
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, padding-top 0.2s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a8f98' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1rem;
		cursor: pointer;
		box-sizing: border-box;
		outline: none;
	}
	.select-field--has-icon {
		padding-left: 36px;
	}
	.select-field:focus {
		outline: none;
		border-color: #4F46E5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
	}
	.select-field:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.select-wrapper--error .select-field {
		border-color: #ef4444;
	}
	.select-wrapper--error .select-field:focus {
		border-color: #ef4444;
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
	}

	/* Floating label */
	.select-label {
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
	.select-field--has-icon ~ .select-label {
		left: 36px;
	}
	.select-label--float {
		top: 6px;
		font-size: 10px;
		color: #4F46E5;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.select-wrapper--error .select-label--float {
		color: #ef4444;
	}
	.select-label--float ~ .select-field {
		padding-top: 1rem;
		padding-bottom: 0.35rem;
	}

	.select-error-text {
		font-size: 0.75rem;
		color: #ef4444;
		margin-top: 2px;
		display: flex;
		align-items: center;
		gap: 4px;
		animation: fadeSlideIn 0.2s ease both;
	}
	.select-error-text::before {
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
