import { toast } from '$lib/components/ui';

export interface UseConfirmOptions<T> {
	title?: string | ((item: T) => string);
	message?: string | ((item: T) => string);
	confirmText?: string;
	cancelText?: string;
	variant?: 'primary' | 'danger';
	onConfirm?: (item: T) => Promise<unknown> | unknown;
	successMessage?: string | ((item: T) => string);
	errorMessage?: string | ((err: unknown) => string);
}

/**
 * Svelte 5 composable for handling confirmation dialogs.
 * Eliminates repetitive dialog open/target/loading state across routes.
 */
export function useConfirmDialog<T = any>(defaultOptions: UseConfirmOptions<T> = {}) {
	let target = $state<T | null>(null);
	let loading = $state<boolean>(false);
	let currentOptions = $state<UseConfirmOptions<T>>(defaultOptions);

	function ask(item: T, options?: UseConfirmOptions<T>) {
		target = item;
		currentOptions = options ? { ...defaultOptions, ...options } : defaultOptions;
	}

	function cancel() {
		if (loading) return;
		target = null;
	}

	async function execute(): Promise<void> {
		if (!target || loading) return;
		const item = target;
		loading = true;
		try {
			if (currentOptions.onConfirm) {
				await currentOptions.onConfirm(item);
			}
			if (currentOptions.successMessage) {
				const msg =
					typeof currentOptions.successMessage === 'function'
						? currentOptions.successMessage(item)
						: currentOptions.successMessage;
				toast.success(msg);
			}
			target = null;
		} catch (err: unknown) {
			const msg = currentOptions.errorMessage
				? typeof currentOptions.errorMessage === 'function'
					? currentOptions.errorMessage(err)
					: currentOptions.errorMessage
				: err instanceof Error
					? err.message
					: 'Terjadi kesalahan';
			toast.error(msg);
		} finally {
			loading = false;
		}
	}

	const title = $derived(
		target
			? typeof currentOptions.title === 'function'
				? currentOptions.title(target)
				: currentOptions.title || 'Konfirmasi Tindakan'
			: ''
	);

	const message = $derived(
		target
			? typeof currentOptions.message === 'function'
				? currentOptions.message(target)
				: currentOptions.message || 'Apakah Anda yakin ingin melanjutkan?'
			: ''
	);

	return {
		get open() {
			return !!target;
		},
		get target() {
			return target;
		},
		get loading() {
			return loading;
		},
		get title() {
			return title;
		},
		get message() {
			return message;
		},
		get confirmText() {
			return currentOptions.confirmText || 'Konfirmasi';
		},
		get cancelText() {
			return currentOptions.cancelText || 'Batal';
		},
		get variant() {
			return currentOptions.variant || 'danger';
		},
		ask,
		cancel,
		execute,
		dialogProps: {
			get open() {
				return !!target;
			},
			get title() {
				return title;
			},
			get message() {
				return message;
			},
			get confirmText() {
				return currentOptions.confirmText || 'Konfirmasi';
			},
			get cancelText() {
				return currentOptions.cancelText || 'Batal';
			},
			get confirmVariant() {
				return currentOptions.variant || 'danger';
			},
			get loading() {
				return loading;
			},
			onconfirm: execute,
			oncancel: cancel,
		},
	};
}
