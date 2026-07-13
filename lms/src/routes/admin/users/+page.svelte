<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let users: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let sortBy = $state<'username' | 'xp' | 'level' | 'sessions'>('xp');

	onMount(() => {
		if (!browser) return;
		loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/users');
			const json = await res.json();
			if (json.success) users = json.data;
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		users
			.filter(u => !searchQuery || u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id?.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => {
				if (sortBy === 'username') return (a.username || '').localeCompare(b.username || '');
				if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
				if (sortBy === 'level') return (b.level || 1) - (a.level || 1);
				return (b.completed_sessions || 0) - (a.completed_sessions || 0);
			})
	);
</script>

<svelte:head>
	<title>👥 Users — Admin</title>
</svelte:head>

<div class="users-page">
	<div class="header-row">
		<h1>👥 User Management</h1>
		<button onclick={loadUsers} class="btn btn-sm">🔄 Refresh</button>
	</div>

	{#if loading}
		<div class="loading">Loading users...</div>
	{:else if error}
		<div class="error-state"><p>{error}</p><button onclick={loadUsers} class="btn">Retry</button></div>
	{:else}
		<div class="toolbar">
			<input type="text" bind:value={searchQuery} placeholder="Search by username or ID..." class="search-input" />
			<div class="sort-group">
				<span class="sort-label">Sort:</span>
				<button class="sort-btn" class:active={sortBy === 'xp'} onclick={() => sortBy = 'xp'}>XP</button>
				<button class="sort-btn" class:active={sortBy === 'level'} onclick={() => sortBy = 'level'}>Level</button>
				<button class="sort-btn" class:active={sortBy === 'sessions'} onclick={() => sortBy = 'sessions'}>Sessions</button>
				<button class="sort-btn" class:active={sortBy === 'username'} onclick={() => sortBy = 'username'}>Name</button>
			</div>
			<span class="user-count">{filtered.length} users</span>
		</div>

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Username</th>
						<th>User ID</th>
						<th>Level</th>
						<th>XP</th>
						<th>Sessions Done</th>
						<th>Projects Done</th>
						<th>Joined</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as u}
						<tr>
							<td class="username-cell">
								<span class="avatar">{u.username?.charAt(0)?.toUpperCase() || '?'}</span>
								{u.username || 'anonymous'}
							</td>
							<td class="mono">{u.id?.slice(0, 12)}...</td>
							<td><span class="level-badge">Lv.{u.level || 1}</span></td>
							<td class="xp-cell">{Number(u.xp || 0).toLocaleString()} XP</td>
							<td>{u.completed_sessions || 0}</td>
							<td>{u.completed_projects || 0}</td>
							<td>{new Date(u.created_at).toLocaleDateString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if filtered.length === 0}
			<p class="empty">No users found.</p>
		{/if}
	{/if}
</div>

<style>
	.users-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	.loading, .error-state { text-align: center; padding: 60px; color: var(--text-secondary); }

	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

	.toolbar {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.search-input {
		flex: 1;
		min-width: 200px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
	}
	.sort-group { display: flex; gap: 4px; align-items: center; }
	.sort-label { font-size: 12px; color: var(--text-secondary); }
	.sort-btn {
		padding: 5px 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: 12px;
		cursor: pointer;
	}
	.sort-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
	.user-count { font-size: 13px; color: var(--text-secondary); margin-left: auto; }

	.table-wrap { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th { text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
	td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text); }
	tr:last-child td { border-bottom: none; }
	tr:hover td { background: var(--hover); }
	.mono { font-family: monospace; font-size: 12px; }
	.username-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
	.avatar {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 12px; font-weight: 700;
	}
	.level-badge { padding: 2px 8px; background: var(--bg-secondary); border-radius: 6px; font-size: 12px; font-weight: 600; }
	.xp-cell { font-weight: 600; color: var(--accent); }
	.empty { color: var(--text-secondary); text-align: center; padding: 40px; }

	.btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--bg-secondary);
		color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
	}
	.btn-sm { padding: 5px 10px; font-size: 12px; }
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.toolbar { flex-direction: column; align-items: stretch; }
		.user-count { margin-left: 0; }
	}
</style>
