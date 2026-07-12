<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let isAdmin = $state(false);
	let loading = $state(true);
	let stats: {
		total_users: number;
		total_sessions: number;
		total_xp: number;
		active_today: number;
		recent_users: Array<{ id: string; username: string; created_at: string }>;
		top_exercises: Array<{ exercise_slug: string; count: number }>;
		badge_distribution: Array<{ badge_id: string; count: number; name?: string }>;
	} | null = $state(null);
	let error = $state('');
	let resetUserId = $state('');
	let resetMessage = $state('');

	onMount(() => {
		if (!browser) return;
		const adminMode = localStorage.getItem('lms-admin') === 'true';
		isAdmin = adminMode;
		if (adminMode) {
			loadStats();
		} else {
			loading = false;
		}
	});

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/stats');
			const json = await res.json();
			if (json.success) {
				stats = json.data;
			} else {
				error = json.error || 'Gagal memuat stats';
			}
		} catch (e) {
			error = 'Gagal memuat stats: ' + (e instanceof Error ? e.message : 'Unknown');
		} finally {
			loading = false;
		}
	}

	async function handleReset() {
		const confirmed = confirm(`Yakin reset progress untuk user "${resetUserId}"?`);
		if (!confirmed) return;
		try {
			const res = await fetch('/api/admin/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-admin-key': 'admin' },
				body: JSON.stringify({ user_id: resetUserId }),
			});
			const json = await res.json();
			if (json.success) {
				resetMessage = `✅ Progress direset untuk ${resetUserId}`;
				resetUserId = '';
				loadStats();
			} else {
				resetMessage = `❌ ${json.error || 'Gagal'}`;
			}
		} catch (e) {
			resetMessage = '❌ Error: ' + (e instanceof Error ? e.message : 'Unknown');
		}
	}

	function handleClearCache() {
		if (!confirm('Yakin hapus semua data lokal (progress, XP, badges)?')) return;
		const keys = Object.keys(localStorage).filter(k => k.startsWith('lms-'));
		for (const k of keys) localStorage.removeItem(k);
		alert(`Cache dibersihkan (${keys.length} keys). Refresh halaman.`);
		window.location.reload();
	}
</script>

<svelte:head>
	<title>⚙️ Admin Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="admin-page">
	{#if !isAdmin}
		<div class="access-denied">
			<span class="denied-icon">🔒</span>
			<h1>Akses Ditolak</h1>
			<p>Halaman ini hanya untuk admin. Set <code>lms-admin</code> ke <code>true</code> di localStorage untuk mengakses.</p>
		</div>
	{:else if loading}
		<div class="loading">Memuat data admin...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button onclick={loadStats} class="btn">Coba Lagi</button>
		</div>
	{:else if stats}
		<h1>⚙️ Admin Dashboard</h1>

		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-icon">👥</span>
				<span class="stat-value">{stats.total_users}</span>
				<span class="stat-label">Total Users</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✅</span>
				<span class="stat-value">{stats.total_sessions}</span>
				<span class="stat-label">Total Sessions Completed</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✨</span>
				<span class="stat-value">{stats.total_xp.toLocaleString()}</span>
				<span class="stat-label">Total XP Awarded</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🔥</span>
				<span class="stat-value">{stats.active_today}</span>
				<span class="stat-label">Active Users Today</span>
			</div>
		</div>

		<!-- Tables -->
		<div class="tables-grid">
			<!-- Recent Users -->
			<div class="table-section">
				<h2>👤 Recent Users</h2>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Device ID</th>
								<th>Username</th>
								<th>Joined</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recent_users as u}
								<tr>
									<td class="mono">{u.id.slice(0, 16)}...</td>
									<td>{u.username}</td>
									<td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Top Exercises -->
			<div class="table-section">
				<h2>🏋️ Top Exercises</h2>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Exercise</th>
								<th>Submissions</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.top_exercises as ex}
								<tr>
									<td>{ex.exercise_slug}</td>
									<td><strong>{ex.count}</strong></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Badge Distribution -->
			<div class="table-section">
				<h2>🏅 Badge Distribution</h2>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Badge</th>
								<th>Users</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.badge_distribution as b}
								<tr>
									<td>{b.badge_id}</td>
									<td><strong>{b.count}</strong></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="quick-actions">
			<h2>⚡ Quick Actions</h2>
			<div class="actions-grid">
				<div class="action-card">
					<h3>Reset User Progress</h3>
					<p>Masukkan device ID user untuk mereset semua progress.</p>
					<div class="reset-form">
						<input
							type="text"
							bind:value={resetUserId}
							placeholder="Device ID..."
							class="reset-input"
						/>
						<button onclick={handleReset} disabled={!resetUserId.trim()} class="btn btn-danger">
							Reset
						</button>
					</div>
					{#if resetMessage}
						<p class="reset-msg">{resetMessage}</p>
					{/if}
				</div>

				<div class="action-card">
					<h3>Clear Cache</h3>
					<p>Hapus semua data lokal (progress, XP, badges) dari localStorage.</p>
					<button onclick={handleClearCache} class="btn btn-warning">Clear Cache</button>
				</div>

				<div class="action-card">
					<h3>Submissions</h3>
					<p>Lihat semua submission yang masuk dari pengguna.</p>
					<a href="/api/submissions" class="btn" target="_blank">View All Submissions</a>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 24px;
	}

	h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.access-denied {
		text-align: center;
		padding: 80px 20px;
	}
	.denied-icon { font-size: 48px; display: block; margin-bottom: 16px; }
	.access-denied h1 { font-size: 24px; margin-bottom: 12px; }
	.access-denied p { color: var(--text-secondary); font-size: 14px; }
	.access-denied code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; }

	.loading, .error-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.error-msg { color: var(--danger); margin-bottom: 12px; }

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.stat-icon { font-size: 28px; }
	.stat-value { font-size: 28px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 12px; color: var(--text-secondary); }

	.tables-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 32px;
	}

	.table-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}

	.table-section:last-child {
		grid-column: 1 / -1;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	th {
		text-align: left;
		padding: 8px 10px;
		font-weight: 600;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		color: var(--text);
	}

	tr:last-child td { border-bottom: none; }

	.mono { font-family: monospace; font-size: 12px; }

	.quick-actions { margin-top: 8px; }
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.action-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}

	.action-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
	.action-card p { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

	.reset-form {
		display: flex;
		gap: 8px;
	}
	.reset-input {
		flex: 1;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		font-family: monospace;
	}
	.reset-msg { font-size: 12px; margin-top: 8px; }

	.btn {
		display: inline-block;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: opacity 0.15s;
	}
	.btn:hover { opacity: 0.85; }
	.btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-danger { background: var(--danger); color: #fff; border-color: var(--danger); }
	.btn-warning { background: #f59e0b; color: #fff; border-color: #f59e0b; }

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
		.tables-grid { grid-template-columns: 1fr; }
		.actions-grid { grid-template-columns: 1fr; }
		.stat-value { font-size: 22px; }
	}
</style>
