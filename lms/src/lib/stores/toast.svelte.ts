export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	timeout?: number;
}

let nextId = 1;
let toasts = $state<Toast[]>([]);
let timers = new Map<number, ReturnType<typeof setTimeout>>();

const MAX_VISIBLE = 3;

function add(message: string, type: ToastType): void {
	const id = nextId++;
	const toast: Toast = { id, message, type, timeout: type === 'error' ? undefined : 4000 };
	toasts = [...toasts, toast];

	// Trim excess beyond max visible
	if (toasts.length > MAX_VISIBLE) {
		const removed = toasts.slice(0, toasts.length - MAX_VISIBLE);
		removed.forEach(t => clearTimer(t.id));
		toasts = toasts.slice(toasts.length - MAX_VISIBLE);
	}

	// Auto-dismiss for non-error
	if (toast.timeout) {
		const timer = setTimeout(() => remove(id), toast.timeout);
		timers.set(id, timer);
	}
}

function remove(id: number): void {
	clearTimer(id);
	toasts = toasts.filter(t => t.id !== id);
}

function clearTimer(id: number): void {
	const timer = timers.get(id);
	if (timer) {
		clearTimeout(timer);
		timers.delete(id);
	}
}

export function addToast(message: string, type: ToastType = 'info'): void {
	add(message, type);
}

export function getToasts(): Toast[] {
	return toasts;
}

export function dismissToast(id: number): void {
	remove(id);
}
