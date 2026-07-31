export interface XpToastItem {
	id: number;
	amount?: number;
	type: 'xp' | 'levelup';
	level?: number;
}

let nextId = 1;
const visible = $state<XpToastItem[]>([]);
const MAX_VISIBLE = 2;

export function pushXpGain(amount: number): void {
	const id = nextId++;
	add({ id, amount, type: 'xp' });
}

export function pushLevelUp(level: number): void {
	const id = nextId++;
	add({ id, level, type: 'levelup' });
}

function add(item: XpToastItem): void {
	// Remove oldest if at max capacity
	while (visible.length >= MAX_VISIBLE) {
		visible.shift();
	}
	visible.push(item);

	// Auto-dismiss
	const timeout = item.type === 'levelup' ? 4000 : 3000;
	setTimeout(() => dismiss(item.id), timeout);
}

export function dismissToast(id: number): void {
	dismiss(id);
}

function dismiss(id: number): void {
	const idx = visible.findIndex((t) => t.id === id);
	if (idx !== -1) {
		visible.splice(idx, 1);
	}
}

export function getVisibleToasts(): XpToastItem[] {
	return visible;
}
