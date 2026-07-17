import { browser } from '$app/environment';

export interface NewNotification {
	id: string;
	type: string;
	title: string;
	body: string | null;
	created_at: string;
}

interface NotificationState {
	unreadCount: number;
	latestNotifications: NewNotification[];
	lastSeenIds: Set<string>;
	pollingInterval: ReturnType<typeof setInterval> | null;
	knownCount: number;
}

const state: NotificationState = {
	unreadCount: 0,
	latestNotifications: [],
	lastSeenIds: new Set(),
	pollingInterval: null,
	knownCount: 0,
};

let listeners: Array<() => void> = [];

function notify() {
	for (const fn of listeners) fn();
}

export function subscribe(fn: () => void): () => void {
	listeners = [...listeners, fn];
	return () => {
		listeners = listeners.filter(f => f !== fn);
	};
}

export function getSnapshot(): { unreadCount: number; latestNotifications: NewNotification[] } {
	return {
		unreadCount: state.unreadCount,
		latestNotifications: state.latestNotifications,
	};
}

function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('lms-auth-token');
}

export async function fetchUnreadCount(): Promise<void> {
	const token = getToken();
	if (!token || !browser) return;
	try {
		const res = await fetch('/api/notifications/unread-count', {
			headers: { 'Authorization': `Bearer ${token}` },
		});
		const json = await res.json();
		if (json.success) {
			const newCount = json.unreadCount ?? 0;
			// Detect new notifications (count increased)
			if (newCount > state.knownCount && state.knownCount > 0) {
				const newOnes = (json.latest || []).filter(
					(n: NewNotification) => !state.lastSeenIds.has(n.id)
				);
				if (newOnes.length > 0) {
					state.latestNotifications = newOnes.slice(0, 3);
					for (const n of newOnes) state.lastSeenIds.add(n.id);
				}
			} else if (newCount > 0 && state.knownCount === 0 && json.latest) {
				// First load — just track them, don't toast
				for (const n of json.latest) state.lastSeenIds.add(n.id);
			}
			state.unreadCount = newCount;
			state.knownCount = newCount;
			notify();
		}
	} catch {
		// silent
	}
}

export function startPolling(intervalMs = 30000): void {
	if (!browser) return;
	stopPolling();
	// Initial fetch
	fetchUnreadCount();
	state.pollingInterval = setInterval(fetchUnreadCount, intervalMs);
}

export function stopPolling(): void {
	if (state.pollingInterval) {
		clearInterval(state.pollingInterval);
		state.pollingInterval = null;
	}
}

export function clearNewNotifications(): void {
	state.latestNotifications = [];
	notify();
}

export function decrementUnreadCount(): void {
	state.unreadCount = Math.max(0, state.unreadCount - 1);
	state.knownCount = state.unreadCount;
	notify();
}

export function resetUnreadCount(): void {
	state.unreadCount = 0;
	state.knownCount = 0;
	state.latestNotifications = [];
	notify();
}
