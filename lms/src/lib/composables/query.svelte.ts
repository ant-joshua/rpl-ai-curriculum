import { browser } from '$app/environment';

export interface QueryOptions<T> {
	autoFetch?: boolean;
	initialData?: T;
	onError?: (error: Error) => void;
	onSuccess?: (data: T) => void;
}

export interface QueryResult<T> {
	readonly data: T | undefined;
	readonly loading: boolean;
	readonly error: string | null;
	readonly isSuccess: boolean;
	readonly isError: boolean;
	refetch: () => Promise<T | undefined>;
	mutate: (newData: T | ((prev: T | undefined) => T)) => void;
}

/**
 * Lightweight Svelte 5 native query composable.
 * Replaces bulky TanStack Query with zero bundle overhead.
 */
export function createQuery<T>(
	fetcher: () => Promise<T>,
	options: QueryOptions<T> = {}
): QueryResult<T> {
	const { autoFetch = true, initialData, onError, onSuccess } = options;

	let data = $state<T | undefined>(initialData);
	let loading = $state<boolean>(autoFetch && browser);
	let error = $state<string | null>(null);

	async function execute(): Promise<T | undefined> {
		loading = true;
		error = null;
		try {
			const result = await fetcher();
			data = result;
			onSuccess?.(result);
			return result;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Unknown error occurred';
			error = msg;
			onError?.(err instanceof Error ? err : new Error(msg));
			return undefined;
		} finally {
			loading = false;
		}
	}

	function mutate(newData: T | ((prev: T | undefined) => T)): void {
		if (typeof newData === 'function') {
			data = (newData as (prev: T | undefined) => T)(data);
		} else {
			data = newData;
		}
	}

	if (autoFetch && browser) {
		execute();
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
		refetch: execute,
		mutate,
	};
}
