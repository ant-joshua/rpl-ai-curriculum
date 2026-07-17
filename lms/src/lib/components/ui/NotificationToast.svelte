<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import {
		getSnapshot,
		subscribe,
		clearNewNotifications,
		type NewNotification,
	} from '$lib/stores/notifications.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const TYPE_ICONS: Record<string, string> = {
		assessment: '📋',
		assignment: '📂',
		attendance: '✅',
		payment: '💰',
		grade: '📝',
		system: '⚙️',
		announcement: '📢',
	};

	let notifications = $state<NewNotification[]>([]);
	let visible = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		if (!browser) return;
		const unsub = subscribe(() => {
			const snap = getSnapshot();
			if (snap.latestNotifications.length > 0 && notifications.length === 0) {
				notifications = snap.latestNotifications;
				visible = true;
				clearNewNotifications();
				// Auto-hide after 6s
				if (timeoutId) clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					visible = false;
					timeoutId = null;
				}, 6000);
			}
		});
		return unsub;
	});

	function dismiss() {
		visible = false;
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = null;
	}
</script>

{#if visible && notifications.length > 0}
	<div class="notification-toast-container" transition:fly={{ y: 20, duration: 300, opacity: 0 }}>
		{#each notifications as n (n.id)}
			<div class="notification-toast" transition:fade={{ duration: 200 }}>
				<div class="nt-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
				<div class="nt-body">
					<div class="nt-title">{n.title}</div>
					{#if n.body}
						<div class="nt-desc">{n.body}</div>
					{/if}
				</div>
				<button class="nt-close" onclick={dismiss} aria-label="Tutup">✕</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.notification-toast-container {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 10001;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 380px;
		pointer-events: none;
	}
	.notification-toast {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		background: var(--surface, #1e1e2e);
		border: 1px solid var(--accent-dim, rgba(94,106,210,0.3));
		border-left: 4px solid var(--accent, #5e6ad2);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		cursor: pointer;
		transition: box-shadow 0.15s;
	}
	.notification-toast:hover {
		box-shadow: 0 10px 32px rgba(0, 0, 0, 0.5);
	}
	.nt-icon {
		font-size: 20px;
		flex-shrink: 0;
		margin-top: 2px;
	}
	.nt-body {
		flex: 1;
		min-width: 0;
	}
	.nt-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text, #e0e0e0);
		line-height: 1.3;
	}
	.nt-desc {
		font-size: 12px;
		color: var(--text-secondary, #8a8f98);
		margin-top: 2px;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.nt-close {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--text-secondary, #8a8f98);
		cursor: pointer;
		font-size: 14px;
		padding: 2px;
		line-height: 1;
		border-radius: 4px;
		transition: color 0.15s;
	}
	.nt-close:hover {
		color: var(--text, #e0e0e0);
	}
</style>
