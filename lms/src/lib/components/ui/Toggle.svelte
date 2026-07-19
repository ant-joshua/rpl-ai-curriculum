<script lang="ts">
	let {
		checked = false,
		disabled = false,
		label = '',
		id,
		class: className = '',
		onChange,
	}: {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		id?: string;
		class?: string;
		onChange?: (value: boolean) => void;
	} = $props();

	let uid = $derived(id ?? `toggle-${Math.random().toString(36).slice(2, 9)}`);

	function handleChange() {
		if (disabled) return;
		checked = !checked;
		onChange?.(checked);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleChange();
		}
	}
</script>

<label class="toggle-wrap {className}" class:checked class:disabled for={uid}>
	<div class="toggle-track">
		<input
			type="checkbox"
			{id}
			bind:checked
			disabled={disabled}
			role="switch"
			aria-checked={checked}
			aria-label={label || undefined}
			onchange={handleChange}
		/>
		<div class="toggle-thumb"></div>
	</div>
	{#if label}
		<span class="toggle-label">{label}</span>
	{/if}
</label>

<style>
	.toggle-wrap {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		user-select: none;
	}

	.toggle-wrap.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toggle-track {
		position: relative;
		width: 40px;
		height: 22px;
		background: var(--bg-secondary, rgba(0,0,0,0.02));
		border-radius: 999px;
		transition: background 0.2s ease;
		flex-shrink: 0;
		border: 2px solid var(--border, rgba(0,0,0,0.06));
	}

	.checked .toggle-track {
		background: var(--accent, #4F46E5);
		border-color: var(--accent, #4F46E5);
	}

	.toggle-track input {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		cursor: pointer;
		z-index: 1;
	}

	.disabled .toggle-track input {
		cursor: not-allowed;
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		background: var(--text, #e8eaf0);
		border-radius: 50%;
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}

	.checked .toggle-thumb {
		transform: translateX(18px);
		background: #fff;
	}

	.toggle-label {
		font-size: 14px;
		color: var(--text, #e8eaf0);
		font-weight: 500;
		line-height: 1.3;
	}
</style>
