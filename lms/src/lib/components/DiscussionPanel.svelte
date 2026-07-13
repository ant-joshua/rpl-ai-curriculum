<script lang="ts">
	import { addToast } from '$lib/stores/toast.svelte';

	interface User {
		id: string;
		display_name: string | null;
		avatar_url: string | null;
	}

	interface Thread {
		id: string;
		lesson_id: string;
		user_id: string;
		title: string;
		body: string;
		is_pinned: number;
		is_locked: number;
		reply_count: number;
		display_name: string | null;
		avatar_url: string | null;
		created_at: string;
		updated_at: string;
	}

	interface Reply {
		id: string;
		thread_id: string;
		user_id: string;
		body: string;
		parent_id: string | null;
		display_name: string | null;
		avatar_url: string | null;
		created_at: string;
		updated_at: string;
	}

	let { lessonId, offeringId }: { lessonId: string; offeringId: string } = $props();

	let activeTab = $state<'threads' | 'ask'>('threads');
	let threads = $state<Thread[]>([]);
	let loading = $state(false);
	let expandedThreadId = $state<string | null>(null);
	let replies = $state<Map<string, Reply[]>>(new Map());
	let repliesLoading = $state<Set<string>>(new Set());

	// New thread form
	let newTitle = $state('');
	let newBody = $state('');
	let submitting = $state(false);

	// Reply form
	let replyBodies = $state<Map<string, string>>(new Map());
	let replyingTo = $state<Set<string>>(new Set());

	let currentUserId = $state<string | null>(null);
	let currentUserDisplay = $state<string | null>(null);

	function getToken(): string | null {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
	}

	$effect(() => {
		if (!lessonId) return;
		loadThreads();
		loadCurrentUser();
	});

	function authHeaders(): Record<string, string> {
		const token = getToken();
		return {
			'Content-Type': 'application/json',
			...(token ? { 'Authorization': `Bearer ${token}` } : {})
		};
	}

	async function loadCurrentUser() {
		try {
			const token = getToken();
			if (!token) return;
			const res = await fetch('/api/auth/me', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					currentUserId = json.data.id;
					currentUserDisplay = json.data.name;
				}
			}
		} catch { /* ignore */ }
	}

	async function loadThreads() {
		loading = true;
		try {
			const res = await fetch(`/api/lessons/${lessonId}/threads`, {
				headers: authHeaders()
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					threads = json.data || [];
				}
			}
		} catch {
			addToast('Failed to load discussions', 'error');
		} finally {
			loading = false;
		}
	}

	async function loadReplies(threadId: string) {
		if (replies.has(threadId) && (replies.get(threadId)?.length ?? 0) > 0) return;
		repliesLoading.add(threadId);
		repliesLoading = new Set(repliesLoading);
		try {
			const res = await fetch(`/api/lessons/${lessonId}/threads/${threadId}/replies`, {
				headers: authHeaders()
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					replies.set(threadId, json.data || []);
					replies = new Map(replies);
				}
			}
		} catch {
			addToast('Failed to load replies', 'error');
		} finally {
			repliesLoading.delete(threadId);
			repliesLoading = new Set(repliesLoading);
		}
	}

	function toggleThread(threadId: string) {
		if (expandedThreadId === threadId) {
			expandedThreadId = null;
		} else {
			expandedThreadId = threadId;
			if (!replies.has(threadId)) {
				loadReplies(threadId);
			}
		}
	}

	async function createThread() {
		if (!newTitle.trim() || !newBody.trim()) {
			addToast('Title and body are required', 'warning');
			return;
		}
		submitting = true;
		try {
			const res = await fetch(`/api/lessons/${lessonId}/threads`, {
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() })
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					threads = [json.data, ...threads];
					newTitle = '';
					newBody = '';
					activeTab = 'threads';
					addToast('Thread created!', 'success');
				} else {
					addToast(json.error || 'Failed to create thread', 'error');
				}
			} else {
				addToast('Failed to create thread', 'error');
			}
		} catch {
			addToast('Failed to create thread', 'error');
		} finally {
			submitting = false;
		}
	}

	async function createReply(threadId: string) {
		const body = replyBodies.get(threadId) || '';
		if (!body.trim()) return;
		replyingTo.add(threadId);
		replyingTo = new Set(replyingTo);
		try {
			const res = await fetch(`/api/lessons/${lessonId}/threads/${threadId}/replies`, {
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify({ body: body.trim() })
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					const existing = replies.get(threadId) || [];
					replies.set(threadId, [...existing, json.data]);
					replies = new Map(replies);
					replyBodies.set(threadId, '');
					replyBodies = new Map(replyBodies);
					// Update reply count
					threads = threads.map(t =>
						t.id === threadId ? { ...t, reply_count: t.reply_count + 1 } : t
					);
					addToast('Reply posted!', 'success');
				} else {
					addToast(json.error || 'Failed to post reply', 'error');
				}
			} else {
				addToast('Failed to post reply', 'error');
			}
		} catch {
			addToast('Failed to post reply', 'error');
		} finally {
			replyingTo.delete(threadId);
			replyingTo = new Set(replyingTo);
		}
	}

	async function deleteThread(threadId: string) {
		if (!confirm('Delete this thread? This cannot be undone.')) return;
		try {
			const res = await fetch(`/api/threads/${threadId}`, {
				method: 'DELETE',
				headers: authHeaders()
			});
			if (res.ok) {
				threads = threads.filter(t => t.id !== threadId);
				addToast('Thread deleted', 'success');
			} else {
				addToast('Failed to delete thread', 'error');
			}
		} catch {
			addToast('Failed to delete thread', 'error');
		}
	}

	function timeAgo(dateStr: string): string {
		const now = Date.now();
		const date = new Date(dateStr + 'Z').getTime();
		const diff = now - date;
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		if (days < 7) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString();
	}

	function isOwnThread(thread: Thread): boolean {
		return currentUserId !== null && thread.user_id === currentUserId;
	}

	function getAvatarUrl(thread: Thread): string {
		return thread.avatar_url || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="%236c5ce7"><circle cx="16" cy="12" r="6"/><path d="M5 28c0-6 5-10 11-10s11 4 11 10"/></svg>');
	}

	function getReplyAvatarUrl(reply: Reply): string {
		return reply.avatar_url || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="%23374151"><circle cx="16" cy="12" r="6"/><path d="M5 28c0-6 5-10 11-10s11 4 11 10"/></svg>');
	}

	function displayName(threadOrReply: Thread | Reply): string {
		return threadOrReply.display_name || 'Anonymous';
	}
</script>

<div class="discussion-panel">
	<div class="panel-header">
		<span class="panel-title">💬 Discussion</span>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'threads'}
			onclick={() => activeTab = 'threads'}
		>
			Threads ({threads.length})
		</button>
		<button
			class="tab"
			class:active={activeTab === 'ask'}
			onclick={() => activeTab = 'ask'}
		>
			Ask Question
		</button>
	</div>

	<div class="panel-body">
		{#if activeTab === 'threads'}
			{#if loading}
				<div class="loading">Loading discussions...</div>
			{:else if threads.length === 0}
				<div class="empty-state">
					<p class="empty-text">No discussions yet.</p>
					<button class="btn btn-sm" onclick={() => activeTab = 'ask'}>
						Start a discussion
					</button>
				</div>
			{:else}
				<div class="thread-list">
					{#each threads as thread (thread.id)}
						<div class="thread-item" class:expanded={expandedThreadId === thread.id}>
							<button class="thread-header" onclick={() => toggleThread(thread.id)}>
								<div class="thread-info">
									<div class="thread-title-row">
										{#if thread.is_pinned}
											<span class="pin-badge" title="Pinned">📌</span>
										{/if}
										{#if thread.is_locked}
											<span class="lock-badge" title="Locked">🔒</span>
										{/if}
										<span class="thread-title">{thread.is_locked ? '[deleted]' : thread.title}</span>
									</div>
									<div class="thread-meta">
										<img class="avatar" src={getAvatarUrl(thread)} alt="" />
										<span class="author">{displayName(thread)}</span>
										<span class="sep">·</span>
										<span class="replies">{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
										<span class="sep">·</span>
										<span class="time">{timeAgo(thread.created_at)}</span>
									</div>
								</div>
								<div class="thread-arrow">{expandedThreadId === thread.id ? '▾' : '▸'}</div>
							</button>

							{#if expandedThreadId === thread.id}
								<div class="thread-body-content">
									<div class="thread-body markdown-content">
										{thread.body}
									</div>

									<!-- Replies -->
									<div class="replies-section">
										{#if repliesLoading.has(thread.id)}
											<div class="loading-small">Loading replies...</div>
										{:else}
											{#each replies.get(thread.id) || [] as reply (reply.id)}
												<div class="reply-item">
													<div class="reply-header">
														<img class="avatar-small" src={getReplyAvatarUrl(reply)} alt="" />
														<span class="author">{displayName(reply)}</span>
														<span class="sep">·</span>
														<span class="time">{timeAgo(reply.created_at)}</span>
													</div>
													<div class="reply-body">{reply.body}</div>
												</div>
											{/each}
										{/if}
									</div>

									<!-- Reply form -->
									{#if !thread.is_locked}
										<div class="reply-form">
											<textarea
												class="reply-input"
												placeholder="Write a reply..."
												value={replyBodies.get(thread.id) ?? ''}
												oninput={(e) => {
													const val = (e.target as HTMLTextAreaElement).value;
													const next = new Map(replyBodies);
													next.set(thread.id, val);
													replyBodies = next;
												}}
												rows="2"
												onkeydown={(e) => {
													if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
														createReply(thread.id);
													}
												}}
											></textarea>
											<div class="reply-actions">
												<span class="hint">Ctrl+Enter to post</span>
												<button
													class="btn btn-sm"
													onclick={() => createReply(thread.id)}
													disabled={replyingTo.has(thread.id)}
												>
													{replyingTo.has(thread.id) ? 'Posting...' : 'Reply'}
												</button>
											</div>
										</div>
									{/if}

									<!-- Delete button -->
									{#if isOwnThread(thread)}
										<button class="delete-btn" onclick={() => deleteThread(thread.id)}>
											Delete thread
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Ask Question tab -->
			<div class="ask-form">
				<input
					class="form-input"
					placeholder="Question title"
					bind:value={newTitle}
					maxlength="200"
				/>
				<textarea
					class="form-textarea"
					placeholder="Write your question or discussion topic..."
					bind:value={newBody}
					rows="5"
				></textarea>
				<button
					class="btn btn-primary"
					onclick={createThread}
					disabled={submitting || !newTitle.trim() || !newBody.trim()}
				>
					{submitting ? 'Posting...' : 'Post Question'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.discussion-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		margin-top: 24px;
	}

	.panel-header {
		padding: 14px 16px;
		border-bottom: 1px solid var(--border);
	}

	.panel-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	/* Tabs */
	.tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
	}

	.tab {
		flex: 1;
		padding: 10px 16px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.15s;
		border-bottom: 2px solid transparent;
	}

	.tab:hover {
		color: var(--text);
		background: var(--surface-hover);
	}

	.tab.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.panel-body {
		padding: 12px;
	}

	/* Loading */
	.loading, .empty-state {
		text-align: center;
		padding: 32px 16px;
		color: var(--text-secondary);
		font-size: 13px;
	}

	.empty-text {
		margin: 0 0 12px;
	}

	.loading-small {
		text-align: center;
		padding: 12px;
		color: var(--text-secondary);
		font-size: 12px;
	}

	/* Threads */
	.thread-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.thread-item {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.thread-item:hover {
		border-color: var(--accent-dim);
	}

	.thread-item.expanded {
		border-color: var(--accent);
	}

	.thread-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 10px 12px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		color: var(--text);
		gap: 8px;
	}

	.thread-header:hover {
		background: var(--surface-hover);
	}

	.thread-info {
		flex: 1;
		min-width: 0;
	}

	.thread-title-row {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 4px;
	}

	.pin-badge, .lock-badge {
		font-size: 12px;
		flex-shrink: 0;
	}

	.thread-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.thread-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: var(--text-secondary);
	}

	.avatar {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		background: var(--bg-secondary);
	}

	.avatar-small {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		background: var(--bg-secondary);
	}

	.author {
		font-weight: 500;
		color: var(--text-secondary);
	}

	.sep {
		color: var(--border);
	}

	.replies {
		color: var(--accent);
		font-weight: 500;
	}

	.time {
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.thread-arrow {
		font-size: 12px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	/* Expanded thread */
	.thread-body-content {
		border-top: 1px solid var(--border);
		padding: 12px;
		background: var(--bg-secondary);
	}

	.thread-body {
		font-size: 14px;
		line-height: 1.6;
		color: var(--text);
		padding: 8px 0;
		margin-bottom: 12px;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Replies */
	.replies-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 12px;
	}

	.reply-item {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px 12px;
	}

	.reply-header {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 6px;
		font-size: 11px;
		color: var(--text-secondary);
	}

	.reply-body {
		font-size: 13px;
		line-height: 1.5;
		color: var(--text);
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Reply form */
	.reply-form {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.reply-input {
		width: 100%;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
		min-height: 36px;
	}

	.reply-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.reply-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.reply-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.hint {
		font-size: 11px;
		color: var(--text-secondary);
		opacity: 0.5;
	}

	/* Buttons */
	.btn {
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 500;
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-secondary);
		color: #fff;
	}

	.btn-sm {
		padding: 4px 12px;
		font-size: 12px;
	}

	/* Ask form */
	.ask-form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 4px 0;
	}

	.form-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font-size: 14px;
		font-weight: 500;
		font-family: inherit;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.form-textarea {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		line-height: 1.6;
		resize: vertical;
		box-sizing: border-box;
		min-height: 100px;
	}

	.form-textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.form-textarea::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	/* Delete */
	.delete-btn {
		font-size: 11px;
		color: var(--error, #ef4444);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 0;
		margin-top: 4px;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.thread-body-content:hover .delete-btn {
		opacity: 0.7;
	}

	.delete-btn:hover {
		opacity: 1 !important;
	}
</style>
