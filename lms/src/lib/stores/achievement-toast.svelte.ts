export interface AchievementToastItem {
	id: number;
	icon: string;
	title: string;
	description: string;
	color?: string;
}

let nextId = 1;

/** Queue of pending toasts (not yet visible). */
const queue = $state<AchievementToastItem[]>([]);

/** Currently visible toasts (max 3). */
const visible = $state<AchievementToastItem[]>([]);

const MAX_VISIBLE = 3;

const timers = new Map<number, ReturnType<typeof setTimeout>>();

function dequeue(): void {
	while (visible.length < MAX_VISIBLE && queue.length > 0) {
		const item = queue.shift()!;
		visible.push(item);

		// Auto-dismiss after 4s
		const timer = setTimeout(() => {
			dismiss(item.id);
		}, 4000);
		timers.set(item.id, timer);
	}
}

export function pushToast(item: Omit<AchievementToastItem, 'id'>): void {
	const id = nextId++;
	const toast: AchievementToastItem = { id, ...item };
	queue.push(toast);

	if (visible.length < MAX_VISIBLE) {
		dequeue();
	}
}

export function dismissToast(id: number): void {
	dismiss(id);
}

function dismiss(id: number): void {
	const timer = timers.get(id);
	if (timer) {
		clearTimeout(timer);
		timers.delete(id);
	}

	const idx = visible.findIndex(t => t.id === id);
	if (idx !== -1) {
		visible.splice(idx, 1);
	}

	// Fill slot from queue
	dequeue();
}

export function getVisibleToasts(): AchievementToastItem[] {
	return visible;
}
