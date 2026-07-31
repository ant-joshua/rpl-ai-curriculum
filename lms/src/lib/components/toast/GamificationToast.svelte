<script lang="ts">
	import {
		getVisibleToasts,
		dismissToast,
		type XpToastItem,
	} from '$lib/stores/xp-toast.svelte';

	let visible = $state<XpToastItem[]>([]);

	$effect(() => {
		visible = getVisibleToasts();
	});
</script>

<div class="xp-toast-container">
	{#each visible as toast (toast.id)}
		<div
			class="xp-toast"
			class:levelup={toast.type === 'levelup'}
			role="alert"
			aria-live="polite"
			onclick={() => dismissToast(toast.id)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') dismissToast(toast.id);
			}}
			tabindex="0"
		>
			{#if toast.type === 'levelup'}
				<div class="levelup-icon">🎉</div>
				<div class="toast-body">
					<div class="toast-title">Naik Level! 🚀</div>
					<div class="toast-desc">Kamu sekarang level {toast.level}</div>
				</div>
			{:else}
				<div class="xp-icon-wrapper">
					<span class="xp-icon">⭐</span>
				</div>
				<div class="toast-body">
					<div class="xp-amount">+{toast.amount} XP</div>
					<div class="xp-label">Luar biasa! Terus belajar 💪</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.xp-toast-container {
		position: fixed;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9998;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		pointer-events: none;
	}

	.xp-toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 20px;
		border-radius: var(--radius, 12px);
		background: var(--surface, #ffffff);
		color: var(--text, #1a1a2e);
		box-shadow: var(--shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.08));
		border: 1px solid rgba(245, 158, 11, 0.2);
		pointer-events: auto;
		cursor: pointer;
		animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		min-width: 220px;
		justify-content: center;
		user-select: none;
		transition: box-shadow 0.15s ease;
	}

	.xp-toast:hover {
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
	}

	.xp-toast:focus-visible {
		outline: 2px solid var(--accent, #4f46e5);
		outline-offset: 2px;
	}

	.xp-toast.levelup {
		background: linear-gradient(135deg, var(--accent, #4f46e5), #7c3aed);
		color: #fff;
		border-color: transparent;
	}

	.levelup-icon {
		font-size: 28px;
		line-height: 1;
		flex-shrink: 0;
	}

	.xp-icon-wrapper {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(245, 158, 11, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.xp-icon {
		font-size: 24px;
		line-height: 1;
	}

	.toast-body {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.xp-amount {
		font-size: 18px;
		font-weight: 700;
		color: #f59e0b;
		line-height: 1.3;
		letter-spacing: -0.01em;
	}

	.toast-title {
		font-size: 15px;
		font-weight: 700;
		line-height: 1.3;
	}

	.toast-desc,
	.xp-label {
		font-size: 12px;
		color: var(--text-secondary, #64748b);
		line-height: 1.4;
	}

	.xp-toast.levelup .toast-desc {
		color: rgba(255, 255, 255, 0.85);
	}

	@keyframes toastIn {
		0% {
			opacity: 0;
			transform: translateY(24px) scale(0.88);
		}
		60% {
			opacity: 1;
			transform: translateY(-3px) scale(1.04);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
