<script lang="ts">
	import { browser } from '$app/environment';
	import { auth } from '$lib/stores/auth.svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';

	interface Notification {
		id: string;
		user_id: string;
		type: string;
		title: string;
		body: string | null;
		link: string | null;
		is_read: number;
		created_at: string;
	}

	const TYPE_ICONS: Record<string, string> = {
		course_update: '📢',
		new_lesson: '📚',
		discussion_reply: '💬',
		assignment_grade: '📝',
		system: '⚙️',
		announcement: '📣',
	};

	let open = $state(false);
	let notifications = $state<Notification[]>([]);
	let unreadCount = $state(0);
	let loading = $state(false);

	function getToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('lms-auth-token');
	}

	function timeAgo(dateStr: string): string {
		const now = Date.now();
		const then = new Date(dateStr + 'Z').getTime();
		const diff = now - then;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'baru saja';
		if (minutes < 60) return `${minutes}m lalu`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}j lalu`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}h lalu`;
		return new Date(dateStr).toLocaleDateString();
	}

	async function fetchNotifications() {
		if (!browser || !auth.isLoggedIn) return;
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const res = await fetch('/api/notifications?page=1', {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.success) {
				notifications = (json.data || []).slice(0, 5);
				unreadCount = json.unreadCount ?? 0;
			}
		} catch {
			// silent
		} finally {
			loading = false;
		}
	}

	async function markAllRead() {
		const token = getToken();
		if (!browser || !token) return;
		try {
			await fetch('/api/notifications/read-all', {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` },
			});
			unreadCount = 0;
			notifications = notifications.map(n => ({ ...n, is_read: 1 }));
		} catch {
			// silent
		}
	}

	async function markRead(notif: Notification) {
		const token = getToken();
		if (!browser || !token || notif.is_read) return;
		try {
			await fetch(`/api/notifications/${notif.id}/read`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` },
			});
			notif.is_read = 1;
			unreadCount = Math.max(0, unreadCount - 1);
		} catch {
			// silent
		}
	}

	function handleNotifClick(notif: Notification) {
		open = false;
		if (!notif.is_read) markRead(notif);
		if (notif.link) {
			goto(notif.link);
		}
	}

	function toggleDropdown() {
		open = !open;
		if (open && notifications.length === 0) {
			fetchNotifications();
		}
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.notif-bell-wrapper')) {
			open = false;
		}
	}

	$effect(() => {
		if (!browser) return;
		if (auth.isLoggedIn) {
			fetchNotifications();
		}
		const interval = setInterval(() => {
			if (auth.isLoggedIn) fetchNotifications();
		}, 60000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (!browser) return;
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

{#if browser && auth.isLoggedIn}
	<div class="notif-bell-wrapper">
		<button class="notif-bell" onclick={toggleDropdown} aria-label="Notifications">
			<span class="bell-icon">🔔</span>
			{#if unreadCount > 0}
				<span class="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
			{/if}
		</button>

		{#if open}
			<div class="notif-dropdown" transition:fly={{ y: -8, duration: 150 }}>
				<div class="notif-header">
					<span class="notif-header-title">Notifikasi</span>
					{#if unreadCount > 0}
						<button class="mark-all-read" onclick={markAllRead}>Tandai dibaca</button>
					{/if}
				</div>

				<div class="notif-list">
					{#if loading}
						<div class="notif-loading">Memuat...</div>
					{:else if notifications.length === 0}
						<div class="notif-empty">Tidak ada notifikasi</div>
					{:else}
						{#each notifications as notif}
							<button
								class="notif-item"
								class:unread={!notif.is_read}
								onclick={() => handleNotifClick(notif)}
							>
								<span class="notif-type-icon">{TYPE_ICONS[notif.type] ?? '🔔'}</span>
								<span class="notif-content">
									<span class="notif-title">{notif.title}</span>
									{#if notif.body}
										<span class="notif-body">{notif.body}</span>
									{/if}
									<span class="notif-time">{timeAgo(notif.created_at)}</span>
								</span>
								{#if !notif.is_read}
									<span class="notif-dot"></span>
								{/if}
							</button>
						{/each}
					{/if}
				</div>

				<div class="notif-footer">
					<a href="/notifications" onclick={() => { open = false; }}>Lihat semua</a>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.notif-bell-wrapper {
		position: relative;
		display: inline-flex;
	}

	.notif-bell {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px 8px;
		border-radius: 8px;
		font-size: 18px;
		transition: background 0.15s;
		line-height: 1;
	}
	.notif-bell:hover {
		background: var(--hover);
	}
	.bell-icon {
		display: block;
	}

	.notif-badge {
		position: absolute;
		top: 0;
		right: 0;
		background: #e74c3c;
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		min-width: 16px;
		height: 16px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
		line-height: 1;
		pointer-events: none;
	}

	.notif-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		width: 340px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.15);
		z-index: 200;
		overflow: hidden;
		margin-top: 4px;
	}

	.notif-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--border);
	}
	.notif-header-title {
		font-weight: 600;
		font-size: 14px;
		color: var(--text);
	}
	.mark-all-read {
		background: none;
		border: none;
		color: var(--accent);
		font-size: 12px;
		cursor: pointer;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 4px;
	}
	.mark-all-read:hover {
		background: var(--hover);
	}

	.notif-list {
		max-height: 360px;
		overflow-y: auto;
	}

	.notif-loading,
	.notif-empty {
		padding: 24px 16px;
		text-align: center;
		color: var(--text-secondary);
		font-size: 13px;
	}

	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		font-size: inherit;
		transition: background 0.1s;
		position: relative;
	}
	.notif-item:hover {
		background: var(--hover);
	}
	.notif-item.unread {
		background: var(--accent-dim);
	}

	.notif-type-icon {
		font-size: 16px;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
		margin-top: 1px;
	}

	.notif-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.notif-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}
	.notif-body {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.notif-time {
		font-size: 11px;
		color: var(--muted);
		margin-top: 1px;
	}

	.notif-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
		margin-top: 6px;
	}

	.notif-footer {
		border-top: 1px solid var(--border);
		padding: 10px 16px;
		text-align: center;
	}
	.notif-footer a {
		font-size: 13px;
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
	.notif-footer a:hover {
		text-decoration: underline;
	}
</style>
