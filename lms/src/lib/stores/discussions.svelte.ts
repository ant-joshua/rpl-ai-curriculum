import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

export interface DiscussionComment {
	id: string;
	module_slug: string;
	session_id: string | null;
	user_id: string;
	content: string;
	parent_id: string | null;
	created_at: string;
	updated_at: string;
	username?: string;
}

const CACHE_PREFIX = 'lms-discussions-';

function createDiscussionsStore() {
	let comments = $state<DiscussionComment[]>([]);
	let loading = $state(false);
	let version = $state(0);

	function cacheKey(moduleSlug: string, sessionId?: string): string {
		return `${CACHE_PREFIX}${moduleSlug}${sessionId ? '-' + sessionId : ''}`;
	}

	function loadFromCache(moduleSlug: string, sessionId?: string): DiscussionComment[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(cacheKey(moduleSlug, sessionId));
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function saveToCache(moduleSlug: string, sessionId: string | undefined, data: DiscussionComment[]): void {
		if (!browser) return;
		try {
			localStorage.setItem(cacheKey(moduleSlug, sessionId), JSON.stringify(data));
		} catch { /* quota exceeded — ignore */ }
	}

	async function loadComments(moduleSlug: string, sessionId?: string): Promise<void> {
		loading = true;
		// Show cached data immediately
		const cached = loadFromCache(moduleSlug, sessionId);
		if (cached.length > 0) {
			comments = cached;
		}

		try {
			let url = `/api/discussions?module_slug=${encodeURIComponent(moduleSlug)}`;
			if (sessionId) {
				url += `&session_id=${encodeURIComponent(sessionId)}`;
			}
			const res = await api<DiscussionComment[]>(url);
			if (res.success && res.data) {
				comments = res.data;
				saveToCache(moduleSlug, sessionId, res.data);
			}
		} catch {
			// keep cached
		}
		loading = false;
		version++;
	}

	async function addComment(content: string, moduleSlug: string, sessionId?: string, parentId?: string): Promise<boolean> {
		try {
			const res = await api('/api/discussions', {
				method: 'POST',
				body: JSON.stringify({
					module_slug: moduleSlug,
					session_id: sessionId || null,
					content,
					parent_id: parentId || null,
				}),
			});
			if (res.success && res.data) {
				// Reload to get full list with usernames
				await loadComments(moduleSlug, sessionId);
				return true;
			}
			return false;
		} catch {
			return false;
		}
	}

	async function deleteComment(id: string, moduleSlug: string, sessionId?: string): Promise<boolean> {
		try {
			const res = await api('/api/discussions', {
				method: 'DELETE',
				body: JSON.stringify({ id }),
			});
			if (res.success) {
				await loadComments(moduleSlug, sessionId);
				return true;
			}
			return false;
		} catch {
			return false;
		}
	}

	function getCommentsForModule(moduleSlug: string): DiscussionComment[] {
		void version;
		return comments.filter(c => c.module_slug === moduleSlug);
	}

	function getTopLevelComments(moduleSlug: string): DiscussionComment[] {
		void version;
		return comments.filter(c => c.module_slug === moduleSlug && !c.parent_id);
	}

	function getReplies(parentId: string): DiscussionComment[] {
		void version;
		return comments.filter(c => c.parent_id === parentId);
	}

	return {
		get comments() {
			void version;
			return comments;
		},
		get loading() {
			return loading;
		},
		loadComments,
		addComment,
		deleteComment,
		getCommentsForModule,
		getTopLevelComments,
		getReplies,
	};
}

export const discussions = createDiscussionsStore();
