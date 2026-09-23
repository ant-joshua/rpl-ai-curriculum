import { toast } from '$lib/components/ui';

export interface MutationOptions<TData, TVariables> {
	onSuccess?: (data: TData, variables: TVariables) => Promise<unknown> | unknown;
	onError?: (error: Error, variables: TVariables) => Promise<unknown> | unknown;
	onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => Promise<unknown> | unknown;
	successToast?: string | ((data: TData, variables: TVariables) => string);
	errorToast?: string | ((error: Error, variables: TVariables) => string);
}

export interface MutationResult<TData, TVariables> {
	readonly data: TData | undefined;
	readonly loading: boolean;
	readonly error: string | null;
	readonly isSuccess: boolean;
	readonly isError: boolean;
	mutate: (variables: TVariables) => Promise<TData | undefined>;
	reset: () => void;
}

/**
 * Lightweight Svelte 5 native mutation composable.
 * Zero external dependencies.
 */
export function createMutation<TData, TVariables = void>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: MutationOptions<TData, TVariables> = {}
): MutationResult<TData, TVariables> {
	let data = $state<TData | undefined>(undefined);
	let loading = $state<boolean>(false);
	let error = $state<string | null>(null);

	async function mutate(variables: TVariables): Promise<TData | undefined> {
		loading = true;
		error = null;
		try {
			const res = await mutationFn(variables);
			data = res;
			if (options.successToast) {
				const msg =
					typeof options.successToast === 'function'
						? options.successToast(res, variables)
						: options.successToast;
				toast.success(msg);
			}
			await options.onSuccess?.(res, variables);
			await options.onSettled?.(res, null, variables);
			return res;
		} catch (err: unknown) {
			const errorObj = err instanceof Error ? err : new Error(String(err));
			error = errorObj.message;
			if (options.errorToast) {
				const msg =
					typeof options.errorToast === 'function'
						? options.errorToast(errorObj, variables)
						: options.errorToast;
				toast.error(msg);
			}
			await options.onError?.(errorObj, variables);
			await options.onSettled?.(undefined, errorObj, variables);
			return undefined;
		} finally {
			loading = false;
		}
	}

	function reset(): void {
		data = undefined;
		loading = false;
		error = null;
	}

	return {
		get data() {
			return data;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get isSuccess() {
			return !loading && !error && data !== undefined;
		},
		get isError() {
			return !loading && error !== null;
		},
		mutate,
		reset,
	};
}
