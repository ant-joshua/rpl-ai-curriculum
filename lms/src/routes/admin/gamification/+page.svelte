<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, Alert, Badge, Spinner } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let globalLeaderboard: any[] = $state([]);
	let offeringFilter = $state('');
	let offeringLeaderboard: any[] = $state([]);
	let offeringList: any[] = $state([]);
	let activeTab = $state<'global' | 'offering'>('global');
	let currentUser: any = null;

	onMount(() => {
		if (!browser) return;
		loadGlobal();
		loadOfferings();
	});

	async function loadGlobal() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/gamification/leaderboard/global', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			const json = await res.json();
			if (json.success) {
				globalLeaderboard = json.data.leaderboard || [];
			} else {
				error = json.error || 'Failed to load';
			}
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	async function loadOfferings() {
		try {
			const res = await fetch('/api/admin/course-offerings', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			const json = await res.json();
			if (json.success && json.data) {
				offeringList = json.data;
			}
		} catch {}
	}

	async function loadOfferingLeaderboard() {
		if (!offeringFilter) return;
		loading = true;
		try {
			const res = await fetch(`/api/gamification/leaderboard?offeringId=${offeringFilter}`, {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			const json = await res.json();
			if (json.success) {
				offeringLeaderboard = json.data.leaderboard || [];
			} else {
				error = json.error || 'Failed to load';
			}
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	function rankBadge(rank: number) {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	function getLevelIcon(level: number) {
		if (level >= 20) return '💎';
		if (level >= 10) return '🏅';
		if (level >= 5) return '⭐';
		return '📌';
	}
</script>

<svelte:head>
	<title>🏆 Gamification — Admin</title>
</svelte:head>

<div class="gamification-page">
	<div class="header-row">
		<h1>🏆 Gamification</h1>
		<div class="tabs">
			<button class="tab" class:tab--active={activeTab === 'global'} onclick={() => activeTab = 'global'}>
				🌍 Global Leaderboard
			</button>
			<button class="tab" class:tab--active={activeTab === 'offering'} onclick={() => activeTab = 'offering'}>
				📋 Per-Offering Leaderboard
			</button>
		</div>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	{#if activeTab === 'global'}
		{#if loading}
			<div class="loading"><Spinner /> Loading leaderboard...</div>
		{:else if globalLeaderboard.length === 0}
			<div class="empty">Belum ada data XP. Ajak siswa untuk mulai belajar!</div>
		{:else}
			<Card>
				<CardContent>
					<table class="leaderboard-table">
						<thead>
							<tr>
								<th class="col-rank">Rank</th>
								<th class="col-user">User</th>
								<th class="col-xp">Total XP</th>
								<th class="col-level">Level</th>
								<th class="col-streak">Streak</th>
							</tr>
						</thead>
						<tbody>
							{#each globalLeaderboard as entry, i}
								<tr class="leaderboard-row" class:highlight={entry.isCurrentUser}>
									<td class="col-rank">
										<span class="rank-badge" class:top3={i < 3}>{rankBadge(entry.rank)}</span>
									</td>
									<td class="col-user">
										<div class="user-info">
											{#if entry.avatarUrl}
												<img src={entry.avatarUrl} alt="" class="avatar" />
											{:else}
												<div class="avatar-placeholder">{entry.displayName?.charAt(0)?.toUpperCase() || '?'}</div>
											{/if}
											<span class="display-name">{entry.displayName || entry.userId?.slice(0, 12)}</span>
											{#if entry.isCurrentUser}
												<Badge variant="accent">You</Badge>
											{/if}
										</div>
									</td>
									<td class="col-xp">
										<span class="xp-value">{entry.totalXp.toLocaleString()}</span>
										<span class="xp-label">XP</span>
									</td>
									<td class="col-level">
										<span class="level-badge">{getLevelIcon(entry.level)} Lv.{entry.level}</span>
									</td>
									<td class="col-streak">
										{#if entry.currentStreak > 0}
											<span class="streak-value">🔥 {entry.currentStreak} hari</span>
										{:else}
											<span class="streak-value dim">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</CardContent>
			</Card>
		{/if}

	{:else if activeTab === 'offering'}
		<div class="offering-selector">
			<select bind:value={offeringFilter} onchange={loadOfferingLeaderboard} class="offering-select">
				<option value="">— Pilih Course Offering —</option>
				{#each offeringList as off}
					<option value={off.id}>{off.name} ({off.code})</option>
				{/each}
			</select>
		</div>

		{#if loading}
			<div class="loading"><Spinner /> Loading leaderboard...</div>
		{:else if offeringFilter && offeringLeaderboard.length === 0}
			<div class="empty">Belum ada data untuk offering ini.</div>
		{:else if offeringLeaderboard.length > 0}
			<Card>
				<CardContent>
					<table class="leaderboard-table">
						<thead>
							<tr>
								<th class="col-rank">Rank</th>
								<th class="col-user">User</th>
								<th class="col-xp">Total XP</th>
								<th class="col-level">Level</th>
								<th class="col-streak">Streak</th>
							</tr>
						</thead>
						<tbody>
							{#each offeringLeaderboard as entry, i}
								<tr class="leaderboard-row" class:highlight={entry.isCurrentUser}>
									<td class="col-rank">
										<span class="rank-badge" class:top3={i < 3}>{rankBadge(entry.rank)}</span>
									</td>
									<td class="col-user">
										<div class="user-info">
											{#if entry.avatarUrl}
												<img src={entry.avatarUrl} alt="" class="avatar" />
											{:else}
												<div class="avatar-placeholder">{entry.displayName?.charAt(0)?.toUpperCase() || '?'}</div>
											{/if}
											<span class="display-name">{entry.displayName || entry.userId?.slice(0, 12)}</span>
											{#if entry.isCurrentUser}
												<Badge variant="accent">You</Badge>
											{/if}
										</div>
									</td>
									<td class="col-xp">
										<span class="xp-value">{entry.totalXp.toLocaleString()}</span>
										<span class="xp-label">XP</span>
									</td>
									<td class="col-level">
										<span class="level-badge">{getLevelIcon(entry.level)} Lv.{entry.level}</span>
									</td>
									<td class="col-streak">
										{#if entry.currentStreak > 0}
											<span class="streak-value">🔥 {entry.currentStreak} hari</span>
										{:else}
											<span class="streak-value dim">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.gamification-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	.header-row { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }
	.empty { text-align: center; padding: 60px; color: var(--text-secondary); font-size: 14px; }
	.error-state { text-align: center; padding: 60px; }

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		overflow-x: auto;
	}
	.tab {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

	/* Offering selector */
	.offering-selector { margin-bottom: 16px; }
	.offering-select {
		width: 100%;
		max-width: 400px;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
	}

	/* Leaderboard table */
	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.leaderboard-table th {
		text-align: left;
		padding: 10px 12px;
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
	}
	.leaderboard-table td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
	}
	.leaderboard-row:hover { background: var(--hover); }
	.leaderboard-row.highlight {
		background: var(--accent-dim);
		position: relative;
	}
	.leaderboard-row.highlight::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--accent);
		border-radius: 0 3px 3px 0;
	}

	/* Rank */
	.col-rank { width: 60px; }
	.rank-badge {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-secondary);
	}
	.rank-badge.top3 { font-size: 20px; }

	/* User */
	.col-user { min-width: 180px; }
	.user-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}
	.avatar-placeholder {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--accent-dim);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
	}
	.display-name {
		font-weight: 600;
		color: var(--text);
	}

	/* XP */
	.col-xp { min-width: 100px; }
	.xp-value {
		font-weight: 700;
		font-size: 15px;
		color: var(--text);
	}
	.xp-label {
		font-size: 11px;
		color: var(--text-secondary);
		margin-left: 2px;
	}

	/* Level */
	.col-level { width: 100px; }
	.level-badge {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
	}

	/* Streak */
	.col-streak { width: 120px; }
	.streak-value { font-size: 13px; font-weight: 500; }
	.streak-value.dim { color: var(--text-secondary); }

	@media (max-width: 768px) {
		.col-level, .col-streak { display: none; }
		.col-user { min-width: 120px; }
	}
</style>
