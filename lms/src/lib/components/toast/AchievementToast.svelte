<script lang="ts">
	import { dismissToast, getVisibleToasts, type AchievementToastItem } from '$lib/stores/achievement-toast.svelte';

	let visible = $state<AchievementToastItem[]>([]);

	$effect(() => {
		visible = getVisibleToasts();
	});

	function handleDismiss(id: number): void {
		dismissToast(id);
	}
</script>

<div class="achievement-toast-container">
	{#each visible as toast (toast.id)}
		<div class="achievement-toast" role="alert" aria-live="polite">
			<div class="toast-gold-border"></div>
			<div class="toast-shimmer"></div>
			<div class="toast-content">
				<div class="toast-icon-wrapper">
					<span class="toast-icon">{toast.icon}</span>
				</div>
				<div class="toast-text">
					<span class="toast-title">{toast.title}</span>
					<span class="toast-description">{toast.description}</span>
				</div>
				<button
					class="toast-close"
					onclick={() => handleDismiss(toast.id)}
					aria-label="Dismiss"
				>✕</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.achievement-toast-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column-reverse;
		gap: 10px;
		pointer-events: none;
	}

	.achievement-toast {
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: stretch;
		background: #FFFFFF;
		border-radius: 12px;
		box-shadow: var(--shadow-lg);
		min-width: 320px;
		max-width: 400px;
		pointer-events: auto;
		animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.toast-gold-border {
		flex-shrink: 0;
		width: 4px;
		background: #F59E0B;
		border-radius: 12px 0 0 12px;
	}

	.toast-shimmer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			transparent 0%,
			transparent 40%,
			rgba(245, 158, 11, 0.06) 50%,
			transparent 60%,
			transparent 100%
		);
		pointer-events: none;
	}

	.toast-content {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		position: relative;
		z-index: 1;
	}

	.toast-icon-wrapper {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: rgba(245, 158, 11, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toast-icon {
		font-size: 32px;
		line-height: 1;
	}

	.toast-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.toast-title {
		font-size: 14px;
		font-weight: 700;
		color: #1a1a2e;
		line-height: 1.3;
	}

	.toast-description {
		font-size: 12px;
		color: #64748b;
		line-height: 1.4;
		overflow-wrap: break-word;
	}

	.toast-close {
		flex-shrink: 0;
		background: none;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.15s ease;
		align-self: flex-start;
		margin-top: -2px;
	}

	.toast-close:hover {
		color: #1a1a2e;
	}

	@keyframes slideInRight {
		0% {
			opacity: 0;
			transform: translateX(120px) scale(0.85);
		}
		50% {
			opacity: 1;
			transform: translateX(-8px) scale(1.02);
		}
		75% {
			transform: translateX(4px) scale(0.98);
		}
		100% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}
</style>
