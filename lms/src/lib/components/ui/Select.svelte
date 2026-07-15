<script lang="ts">
	interface SelectOption {
		value: string;
		label: string;
	}

	let {
		options = [] as SelectOption[],
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		class: className = '',
		onchange,
		...rest
	}: {
		options?: SelectOption[];
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onchange?: (e: Event) => void;
		[key: string]: unknown;
	} = $props();
</script>

<select
	class="select-field {className}"
	{disabled}
	{value}
	onchange={onchange}
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

<style>
	.select-field {
		display: block;
		width: 100%;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #f7f8f8;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a8f98' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1rem;
		cursor: pointer;
	}
	.select-field:focus {
		outline: none;
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}
	.select-field:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
