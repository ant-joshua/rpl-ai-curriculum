import { browser } from '$app/environment';

interface UnreadState {
	count: number;
	pollingInterval: ReturnType<typeof setInterval> | null;
}

const state: UnreadState = {
	count: 0,
	pollingInterval: null,
};

let listeners: Array<() => void> = [];

function notify() {
	for (const fn of listeners) fn();
}

export function subscribe(fn: () => void): () => void {
	listeners = [...listeners, fn];
	return () => {
		listeners = listeners.filter((f) => f !== fn);
	};
}

export function getSnapshot(): { count: number } {
	return { count: state.count };
}

async function refresh() {
	if (!browser) return;
	try {
		const res = await fetch('/api/direct/unread-count', {
			headers: { Accept: 'application/json' },
		});
		if (!res.ok) return;
		const data = await res.json();
		if (typeof data.unread === 'number') {
			state.count = data.unread;
			notify();
		}
	} catch {
		// offline / not authed — keep last known count
	}
}

export function startPolling() {
	if (!browser || state.pollingInterval) return;
	refresh();
	state.pollingInterval = setInterval(refresh, 15000);
}

export function stopPolling() {
	if (!browser || !state.pollingInterval) return;
	clearInterval(state.pollingInterval);
	state.pollingInterval = null;
}
