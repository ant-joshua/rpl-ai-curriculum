<script lang="ts">
	import { page } from '$app/stores';
	import { addToast } from '$lib/stores/toast.svelte';

	interface Discussion {
		id: string;
		lesson_id: string;
		user_id: string;
		title: string;
		body: string;
		is_pinned: number;
		is_locked: number;
		is_resolved: number;
		created_at: string;
		updated_at: string;
		display_name: string | null;
		avatar_url: string | null;
		lesson_title: string;
		offering_name: string;
		course_title: string;
		course_id: string;
		reply_count: number;
	}

	let discussions = $state<Discussion[]>([]);
	let loading = $state(false);
	let statusFilter = $state('open');
	let searchQuery = $state('');

	$effect(() => {
		loadDiscussions();
	});

	function getToken(): string | null {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
	}

	function authHeaders(): Record<string, string> {
		const token = getToken();
		return {
			'Content-Type': 'application/json',
			...(token ? { 'Authorization': `Bearer ${token}` } : {})
		};
	}

	async function loadDiscussions() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
			if (searchQuery.trim()) params.set('search', searchQuery.trim());

			const res = await fetch(`/api/admin/discussions?${params}`, {
				headers: authHeaders()
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					discussions = json.data || [];
				}
			} else {
				const json = await res.json();
				addToast(json.error || 'Failed to load discussions', 'error');
			}
		} catch {
			addToast('Failed to load discussions', 'error');
		} finally {
			loading = false;
		}
	}

	async function toggleResolve(threadId: string, resolved: boolean) {
		try {
			const res = await fetch(`/api/threads/${threadId}`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ is_resolved: resolved })
			});
			if (res.ok) {
				discussions = discussions.map(d =>
					d.id === threadId ? { ...d, is_resolved: resolved ? 1 : 0 } : d
				);
				addToast(resolved ? 'Marked resolved' : 'Reopened', 'success');
			}
		} catch {
			addToast('Failed to update', 'error');
		}
	}

	async function togglePin(threadId: string, pinned: boolean) {
		try {
			const res = await fetch(`/api/threads/${threadId}`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ is_pinned: pinned })
			});
			if (res.ok) {
				discussions = discussions.map(d =>
					d.id === threadId ? { ...d, is_pinned: pinned ? 1 : 0 } : d
				);
				addToast(pinned ? 'Pinned' : 'Unpinned', 'success');
			}
		} catch {
			addToast('Failed to update', 'error');
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

	function truncate(str: string, len: number): string {
		return str.length > len ? str.slice(0, len) + '...' : str;
	}
</script>

<svelte:head>
	<title>Discussions — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="discussions-page">
	<div class="page-header">
		<h1>💬 Discussions</h1>
		<p class="subtitle">Manage all student discussions across your courses</p>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="filter-group">
			<button
				class="filter-btn"
				class:active={statusFilter === 'open'}
				onclick={() => { statusFilter = 'open'; loadDiscussions(); }}
			>Open</button>
			<button
				class="filter-btn"
				class:active={statusFilter === 'resolved'}
				onclick={() => { statusFilter = 'resolved'; loadDiscussions(); }}
			>Resolved</button>
			<button
				class="filter-btn"
				class:active={statusFilter === 'all'}
				onclick={() => { statusFilter = 'all'; loadDiscussions(); }}
			>All</button>
		</div>
		<div class="search-group">
			<input
				class="search-input"
				placeholder="Search discussions..."
				bind:value={searchQuery}
				onkeydown={(e) => { if (e.key === 'Enter') loadDiscussions(); }}
			/>
			<button class="btn btn-sm" onclick={loadDiscussions}>Search</button>
			<button class="btn btn-sm btn-secondary" onclick={() => { searchQuery = ''; loadDiscussions(); }}>Clear</button>
		</div>
	</div>

	<!-- List -->
	<div class="discussion-list">
		{#if loading}
			<div class="loading">Loading discussions...</div>
		{:else if discussions.length === 0}
			<div class="empty-state">No discussions found.</div>
		{:else}
			{#each discussions as discussion (discussion.id)}
				<div class="discussion-item" class:resolved={!!discussion.is_resolved} class:pinned={!!discussion.is_pinned}>
					<div class="discussion-main">
						<div class="disc-title-row">
							{#if discussion.is_pinned}<span class="pin-badge" title="Pinned">📌</span>{/if}
							{#if discussion.is_resolved}<span class="resolve-badge" title="Resolved">✅</span>{/if}
							<a href="/learn/{discussion.lesson_id}/lessons/{discussion.lesson_id}" class="disc-title">{discussion.title}</a>
						</div>
						<div class="disc-meta">
							<span class="author">by {discussion.display_name || 'Anonymous'}</span>
							<span class="sep">·</span>
							<span class="course">{discussion.course_title} — {discussion.offering_name}</span>
							<span class="sep">·</span>
							<span class="lesson">Lesson: {discussion.lesson_title}</span>
							<span class="sep">·</span>
							<span class="replies">{discussion.reply_count} replies</span>
							<span class="sep">·</span>
							<span class="time">{timeAgo(discussion.created_at)}</span>
						</div>
						<div class="disc-body">
							{truncate(discussion.body, 200)}
						</div>
					</div>
					<div class="discussion-actions">
						<button
							class="action-btn"
							class:active={!!discussion.is_resolved}
							onclick={() => toggleResolve(discussion.id, !discussion.is_resolved)}
						>
							{discussion.is_resolved ? '✅ Resolved' : 'Resolve'}
						</button>
						<button
							class="action-btn"
							class:active={!!discussion.is_pinned}
							onclick={() => togglePin(discussion.id, !discussion.is_pinned)}
						>
							{discussion.is_pinned ? '📌 Pinned' : 'Pin'}
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.discussions-page {
		max-width: 1000px;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 24px;
		margin: 0 0 4px;
		color: var(--text);
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Filters */
	.filters {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 3px;
	}

	.filter-btn {
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
		background: none;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.filter-btn:hover {
		color: var(--text);
	}

	.filter-btn.active {
		background: var(--accent);
		color: #fff;
	}

	.search-group {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.search-input {
		padding: 7px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		width: 220px;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	/* List */
	.discussion-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.discussion-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: border-color 0.15s;
	}

	.discussion-item:hover {
		border-color: var(--accent-dim);
	}

	.discussion-item.resolved {
		border-left: 3px solid var(--success, #22c55e);
	}

	.discussion-item.pinned {
		background: rgba(108, 92, 231, 0.03);
	}

	.discussion-main {
		flex: 1;
		min-width: 0;
	}

	.disc-title-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.pin-badge, .resolve-badge {
		font-size: 14px;
		flex-shrink: 0;
	}

	.disc-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.disc-title:hover {
		color: var(--accent);
	}

	.disc-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: var(--text-secondary);
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.sep {
		color: var(--border);
	}

	.disc-body {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.discussion-actions {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
	}

	.action-btn {
		font-size: 11px;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.action-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.action-btn.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.loading, .empty-state {
		text-align: center;
		padding: 48px 16px;
		color: var(--text-secondary);
		font-size: 14px;
	}

	/* shared btn */
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

	.btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.btn-sm {
		padding: 4px 12px;
		font-size: 12px;
	}

	.btn-secondary {
		background: none;
		color: var(--text-secondary);
	}
</style>
