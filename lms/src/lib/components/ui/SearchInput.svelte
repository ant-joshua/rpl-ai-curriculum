<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = 'Search...',
		disabled = false,
		class: className = '',
		onclear,
		oninput,
	}: {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onclear?: () => void;
		oninput?: (e: Event) => void;
	} = $props();
</script>

<div class={['ui-search', className].filter(Boolean).join(' ')}>
	<svg class="ui-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
	</svg>
	<input
		type="search"
		{placeholder}
		bind:value
		{disabled}
		class="ui-search-input"
		{oninput}
	/>
	{#if value}
		<button
			class="ui-search-clear"
			onclick={() => { value = ''; onclear?.(); }}
			type="button"
			aria-label="Clear search"
		>✕</button>
	{/if}
</div>

<style>
	.ui-search {
		position: relative;
		display: flex;
		align-items: center;
	}
	.ui-search-icon {
		position: absolute;
		left: 12px;
		color: var(--text-tertiary, #666);
		pointer-events: none;
		flex-shrink: 0;
	}
	.ui-search-input {
		width: 100%;
		padding: 9px 32px 9px 38px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		color: var(--text-primary, var(--text));
		font-size: 14px;
		font-family: inherit;
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}
	.ui-search-input:focus {
		border-color: var(--accent);
	}
	.ui-search-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.7;
	}
	.ui-search-clear {
		position: absolute;
		right: 6px;
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 14px;
		padding: 4px;
		line-height: 1;
		border-radius: 4px;
		transition: color 0.15s;
	}
	.ui-search-clear:hover {
		color: var(--text);
	}
</style>
