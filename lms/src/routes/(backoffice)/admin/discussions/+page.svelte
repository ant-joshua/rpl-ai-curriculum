<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { page } from '$app/stores';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Button, Badge, SearchBar, Loading, EmptyState, PageHeader } from '$lib/components/ui/index.js';

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

	function clearSearch() {
		searchQuery = '';
		loadDiscussions();
	}
</script>

<svelte:head>
	<title>Discussions — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="discussions-page">
	<div class="page-header">
		<h1>💬 Discussions</h1>
		<p class="subtitle">{t('admin.kelola_diskusi')}</p>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="filter-group">
			<Button
				variant={statusFilter === 'open' ? 'primary' : 'ghost'}
				size="sm"
				onclick={() => { statusFilter = 'open'; loadDiscussions(); }}
			>Open</Button>
			<Button
				variant={statusFilter === 'resolved' ? 'primary' : 'ghost'}
				size="sm"
				onclick={() => { statusFilter = 'resolved'; loadDiscussions(); }}
			>Resolved</Button>
			<Button
				variant={statusFilter === 'all' ? 'primary' : 'ghost'}
				size="sm"
				onclick={() => { statusFilter = 'all'; loadDiscussions(); }}
			>All</Button>
		</div>
		<div class="search-group">
			<SearchInput bind:value={searchQuery} placeholder="Search discussions..." class="search-input" />
			<Button onclick={loadDiscussions} variant="secondary" size="sm">Search</Button>
			<Button onclick={clearSearch} variant="ghost" size="sm">Clear</Button>
		</div>
	</div>

	<!-- List -->
	<div class="discussion-list">
		{#if loading}
			<Loading message="Loading discussions..." />
		{:else if discussions.length === 0}
			<EmptyState icon="💬" message="No discussions found." />
		{:else}
			{#each discussions as discussion (discussion.id)}
				<div class="discussion-item" class:resolved={!!discussion.is_resolved} class:pinned={!!discussion.is_pinned}>
					<div class="discussion-main">
						<div class="disc-title-row">
							{#if discussion.is_pinned}<Badge variant="accent">📌 Pinned</Badge>{/if}
							{#if discussion.is_resolved}<Badge variant="success">✅ Resolved</Badge>{/if}
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
						<Button
							variant={discussion.is_resolved ? 'primary' : 'ghost'}
							size="sm"
							onclick={() => toggleResolve(discussion.id, !discussion.is_resolved)}
						>
							{discussion.is_resolved ? '✅ Resolved' : 'Resolve'}
						</Button>
						<Button
							variant={discussion.is_pinned ? 'primary' : 'ghost'}
							size="sm"
							onclick={() => togglePin(discussion.id, !discussion.is_pinned)}
						>
							{discussion.is_pinned ? '📌 Pinned' : 'Pin'}
						</Button>
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

	.search-group {
		display: flex;
		gap: 6px;
		align-items: center;
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
		flex-wrap: wrap;
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
</style>
