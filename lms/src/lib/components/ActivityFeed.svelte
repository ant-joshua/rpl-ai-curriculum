<script lang="ts">
	import { onMount } from 'svelte';

	interface Activity {
		id: string;
		offering_id: string | null;
		user_id: string;
		activity_type: string;
		description: string;
		reference_type: string | null;
		reference_id: string | null;
		metadata: Record<string, unknown> | null;
		created_at: string;
		display_name: string | null;
		avatar_url: string | null;
		offering_name?: string | null;
	}

	let {
		offeringId,
		userId,
		limit = 50,
		autoLoad = true,
		compact = false,
	}: {
		offeringId?: string;
		userId?: string;
		limit?: number;
		autoLoad?: boolean;
		compact?: boolean;
	} = $props();

	let activities = $state<Activity[]>([]);
	let loading = $state(false);
	let error = $state('');
	let cursor: string | null = $state(null);
	let hasMore = $state(true);

	const activityIcons: Record<string, string> = {
		lesson_complete: '📘',
		assignment_submit: '📝',
		discussion_post: '💬',
		enrolled: '📋',
		certificate_earned: '🎓',
		assessment_done: '📊',
	};

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
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function getDateGroup(dateStr: string): string {
		const now = new Date();
		const date = new Date(dateStr + 'Z');
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return 'This Week';
		return 'Earlier';
	}

	function groupedActivities(): Map<string, Activity[]> {
		const groups = new Map<string, Activity[]>();
		for (const a of activities) {
			const group = getDateGroup(a.created_at);
			if (!groups.has(group)) groups.set(group, []);
			groups.get(group)!.push(a);
		}
		return groups;
	}

	function getToken(): string | null {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
	}

	async function load() {
		if (loading || !hasMore || (!offeringId && !userId)) return;
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			params.set('limit', String(limit));
			if (cursor) params.set('cursor', cursor);

			let url: string;
			if (offeringId) {
				params.set('offeringId', offeringId);
				url = `/api/activity/feed?${params}`;
			} else if (userId) {
				url = `/api/activity/my-feed?${params}`;
			} else {
				error = 'No filter specified';
				return;
			}

			const res = await fetch(url, {
				headers: {
					Authorization: `Bearer ${getToken() || ''}`,
				},
			});
			if (!res.ok) {
				error = `Failed to load activity (${res.status})`;
				return;
			}
			const json = await res.json();
			if (json.success) {
				const newItems = json.data || [];
				activities = cursor ? [...activities, ...newItems] : newItems;
				cursor = json.nextCursor || null;
				hasMore = newItems.length === limit && json.nextCursor !== null;
			} else {
				error = json.error || 'Failed to load activity';
			}
		} catch {
			error = 'Network error loading activity';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (autoLoad) load();
	});

	function loadMore() {
		if (!loading && hasMore) load();
	}

	function getAvatarUrl(a: Activity): string {
		return a.avatar_url || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="%234a4a52"><circle cx="16" cy="12" r="6"/><path d="M5 28c0-6 5-10 11-10s11 4 11 10"/></svg>');
	}
</script>

<div class="activity-feed" class:compact>
	{#if error}
		<div class="feed-error">{error}</div>
	{/if}

	{#if activities.length === 0 && !loading}
		<div class="feed-empty">
			<span class="empty-icon">📭</span>
			<p>No activity yet</p>
		</div>
	{:else}
		{#each [...groupedActivities().entries()] as [group, items]}
			<div class="feed-group">
				<div class="group-header">{group}</div>
				<div class="group-items">
					{#each items as activity (activity.id)}
						<div class="feed-item">
							<div class="item-icon" title={activity.activity_type}>
								{activityIcons[activity.activity_type] || '🔔'}
							</div>
							{#if !compact}
								<div class="item-avatar">
									<img src={getAvatarUrl(activity)} alt="" />
								</div>
							{/if}
							<div class="item-body">
								<span class="item-user">{activity.display_name || activity.user_id?.slice(0, 12)}</span>
								<span class="item-desc">{activity.description}</span>
							</div>
							<span class="item-time">{timeAgo(activity.created_at)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}

		{#if hasMore}
			<button class="load-more" onclick={loadMore} disabled={loading}>
				{loading ? 'Loading...' : 'Load more'}
			</button>
		{/if}

		{#if loading && activities.length > 0}
			<div class="loading-more">Loading...</div>
		{/if}
	{/if}
</div>

<style>
	.activity-feed {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.activity-feed.compact {
		gap: 12px;
	}

	.feed-error {
		padding: 12px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #ef4444;
		font-size: 13px;
	}

	.feed-empty {
		text-align: center;
		padding: 32px 16px;
		color: #8b8b93;
	}

	.empty-icon {
		font-size: 32px;
		display: block;
		margin-bottom: 8px;
	}

	.feed-empty p {
		margin: 0;
		font-size: 14px;
	}

	.feed-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.group-header {
		font-size: 11px;
		font-weight: 600;
		color: #8b8b93;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0 4px 4px;
	}

	.group-items {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.feed-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		font-size: 13px;
		transition: background 0.1s;
	}

	.compact .feed-item {
		padding: 6px 0;
	}

	.item-icon {
		font-size: 16px;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
	}

	.item-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.item-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.item-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: baseline;
	}

	.item-user {
		font-weight: 600;
		color: #1a1a2e;
		white-space: nowrap;
	}

	.item-desc {
		color: #8b8b93;
		word-break: break-word;
	}

	.item-time {
		font-size: 11px;
		color: #5e5e66;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.load-more {
		background: transparent;
		border: 1px solid #2a2a32;
		color: #8b8b93;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
		text-align: center;
		margin-top: 4px;
	}

	.load-more:hover {
		border-color: #6c5ce7;
		color: #1a1a2e;
	}

	.load-more:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.loading-more {
		text-align: center;
		padding: 12px;
		color: #8b8b93;
		font-size: 13px;
	}
</style>
