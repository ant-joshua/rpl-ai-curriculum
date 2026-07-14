export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: ConfirmVariant;
}

let visible = $state(false);
let title = $state('Konfirmasi');
let message = $state('');
let confirmText = $state('Ya');
let cancelText = $state('Batal');
let variant = $state<ConfirmVariant>('info');

let resolvePromise: ((value: boolean) => void) | null = null;

const DEFAULTS = {
	title: 'Konfirmasi',
	confirmText: 'Ya',
	cancelText: 'Batal',
	variant: 'info' as ConfirmVariant,
};

export function confirm(options: ConfirmOptions): Promise<boolean> {
	return new Promise((resolve) => {
		title = options.title ?? DEFAULTS.title;
		message = options.message;
		confirmText = options.confirmText ?? DEFAULTS.confirmText;
		cancelText = options.cancelText ?? DEFAULTS.cancelText;
		variant = options.variant ?? DEFAULTS.variant;
		visible = true;
		resolvePromise = resolve;
	});
}

export function getConfirmVisible(): boolean {
	return visible;
}

export function getConfirmTitle(): string {
	return title;
}

export function getConfirmMessage(): string {
	return message;
}

export function getConfirmConfirmText(): string {
	return confirmText;
}

export function getConfirmCancelText(): string {
	return cancelText;
}

export function getConfirmVariant(): ConfirmVariant {
	return variant;
}

export function confirmAction(): void {
	if (resolvePromise) {
		const r = resolvePromise;
		resolvePromise = null;
		visible = false;
		r(true);
	}
}

export function cancelAction(): void {
	if (resolvePromise) {
		const r = resolvePromise;
		resolvePromise = null;
		visible = false;
		r(false);
	}
}
