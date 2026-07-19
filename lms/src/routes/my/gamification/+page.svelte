<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle, Badge, Spinner, EmptyState, ProgressBar, PageHeader } from '$lib/components/ui';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	const token = $derived(browser ? localStorage.getItem('token') || '' : '');
	function authFetch(url: string, opts?: RequestInit) {
		return fetch(url, { ...opts, headers: { ...opts?.headers, 'Authorization': `Bearer ${token}` } });
	}

	// --- State ---
	let loading = $state(true);
	let error = $state('');

	// User gamification data
	let userStats: any = $state(null);
	let leaderboard: any[] = $state([]);
	let leaderboardLoading = $state(true);

	let tab: 'overview' | 'leaderboard' | 'activity' = $state('overview');
	let newBadgeAnimations: string[] = $state([]);
	let badgeSearch = $state('');

	onMount(() => {
		if (!browser) return;
		loadStats();
		loadLeaderboard();
	});

	async function loadStats() {
		try {
			const res = await authFetch('/api/gamification/my-stats');
			const json = await res.json();
			if (json.success) {
				userStats = json.data;

				// Check for newly unlocked badges from localStorage
				const raw = localStorage.getItem('lms-new-badges');
				if (raw) {
					const ids: string[] = JSON.parse(raw);
					newBadgeAnimations = ids;
					localStorage.removeItem('lms-new-badges');
					setTimeout(() => { newBadgeAnimations = []; }, 5000);
				}
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal memuat data. Coba lagi.';
		} finally {
			loading = false;
		}
	}

	async function loadLeaderboard() {
		leaderboardLoading = true;
		try {
			const res = await authFetch('/api/gamification/leaderboard/global');
			const json = await res.json();
			if (json.success) leaderboard = json.data.leaderboard || [];
		} catch {} finally {
			leaderboardLoading = false;
		}
	}

	// --- Derived ---
	const level = $derived(userStats?.level || 1);
	const totalXp = $derived(userStats?.totalXp || 0);
	const xpPerLevel = $derived(userStats?.xpPerLevel || 100);
	const currentLevelXp = $derived(userStats?.currentLevelXp || 0);
	const xpToNext = $derived(userStats?.xpToNext || xpPerLevel);
	const pct = $derived(xpPerLevel > 0 ? Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100)) : 0);
	const streak = $derived(userStats?.streak || { current: 0, longest: 0 });
	const earnedBadges = $derived(userStats?.badges?.earned || []);
	const availableBadges = $derived(userStats?.badges?.available || []);
	const recentActivity = $derived(userStats?.recentActivity || []);

	const filteredAvailable = $derived(
		badgeSearch ? availableBadges.filter((b: any) =>
			b.name?.toLowerCase().includes(badgeSearch.toLowerCase()) ||
			b.description?.toLowerCase().includes(badgeSearch.toLowerCase())
		) : availableBadges
	);

	function rankBadge(rank: number) {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	function getLevelIcon(lvl: number) {
		if (lvl >= 20) return '💎';
		if (lvl >= 10) return '🏅';
		if (lvl >= 5) return '⭐';
		return '📌';
	}

	const REASON_LABELS: Record<string, string> = {
		lesson_complete: 'Menyelesaikan Pelajaran',
		daily_login: 'Login Harian',
		assignment_graded: 'Tugas Dinilai',
		assessment_completed: 'Assessment',
		discussion_post: 'Diskusi',
		streak_milestone: 'Bonus Streak',
		custom: 'Aktivitas',
	};

	function reasonLabel(r: string) { return REASON_LABELS[r] || r; }

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const diff = Date.now() - new Date(dateStr + 'Z').getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'baru saja';
		if (mins < 60) return `${mins} menit lalu`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} jam lalu`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days} hari lalu`;
		return new Date(dateStr).toLocaleDateString('id-ID');
	}

	const leaderboardColumns: ColumnDef<any, any>[] = [
		{
			header: '#',
			accessorKey: 'rank',
			cell: ({ getValue, row }) => {
				const rank = getValue() as number;
				const i = row.index;
				let display = `#${rank}`;
				if (rank === 1) display = '🥇';
				else if (rank === 2) display = '🥈';
				else if (rank === 3) display = '🥉';
				const size = i < 3 ? 'font-size:18px' : 'font-weight:700;color:var(--text-secondary)';
				return `<span style="${size}">${display}</span>`;
			}
		},
		{
			header: 'Pengguna',
			accessorKey: 'displayName',
			cell: ({ row }) => {
				const e = row.original;
				let html = '<div style="display:flex;align-items:center;gap:10px">';
				if (e.avatarUrl) {
					html += `<img src="${e.avatarUrl}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover">`;
				} else {
					const initial = (e.displayName || '?').charAt(0).toUpperCase();
					html += `<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${initial}</div>`;
				}
				html += `<span style="font-weight:600">${e.displayName || e.userId?.slice(0, 8)}</span>`;
				if (e.isCurrentUser) {
					html += `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(113,112,255,0.12);color:#4F46E5">Anda</span>`;
				}
				html += '</div>';
				return html;
			}
		},
		{
			header: 'XP',
			accessorKey: 'totalXp',
			cell: ({ getValue }) => `<span style="font-weight:700">${(getValue() as number).toLocaleString()}</span>`
		},
		{
			header: 'Level',
			accessorKey: 'level',
			cell: ({ getValue }) => {
				const lvl = getValue() as number;
				return `${getLevelIcon(lvl)} ${lvl}`;
			}
		},
		{
			header: 'Streak',
			accessorKey: 'currentStreak',
			cell: ({ getValue }) => {
				const s = getValue() as number;
				return s > 0 ? `🔥 ${s} hari` : '—';
			}
		}
	];
</script>

<svelte:head>
	<title>🎮 Gamification — Siswa</title>
</svelte:head>

<div class="gamification-page">
	<PageHeader title="Gamification" subtitle="Pantau level, badge, dan pencapaian belajar kamu" />
	{#if loading}
		<div class="loading"><Spinner /> Memuat data gamification...</div>
	{:else if error}
		<div class="error-state"><p class="error-text">{error}</p></div>
	{:else if userStats}
		<!-- New Badge Alert -->
		{#if newBadgeAnimations.length > 0}
			{#each newBadgeAnimations as badgeId}
				{@const badge = earnedBadges.find((b: any) => b.id === badgeId)}
				{#if badge}
					<div class="badge-alert">
						<span class="badge-alert-icon">{badge.icon}</span>
						<div>
							<div class="badge-alert-title">🎉 Badge Baru!</div>
							<div class="badge-alert-name">{badge.name}</div>
						</div>
					</div>
				{/if}
			{/each}
		{/if}

		<!-- Header: Level Card -->
		<Card>
			<CardContent>
				<div class="level-header">
					<div class="level-icon">{getLevelIcon(level)}</div>
					<div class="level-info">
						<div class="level-title">Level {level}</div>
						<div class="level-xp-text">{totalXp.toLocaleString()} Total XP</div>
					</div>
					<div class="streak-display">
						<div class="streak-icon">🔥</div>
						<div class="streak-info">
							<div class="streak-value">{streak.current} hari</div>
							<div class="streak-label">Streak</div>
						</div>
					</div>
				</div>
				<div class="xp-bar-section">
					<div class="xp-bar-label">
						<span>XP menuju Level {level + 1}</span>
						<span>{currentLevelXp.toLocaleString()} / {xpPerLevel.toLocaleString()} XP</span>
					</div>
					<ProgressBar value={pct} max={100} />
					{#if xpToNext > 0}
						<div class="xp-remaining">{xpToNext.toLocaleString()} XP lagi ke level berikutnya</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Tabs -->
		<div class="tabs">
			<button class="tab" class:tab--active={tab === 'overview'} onclick={() => tab = 'overview'}>
				🎖️ Badge Saya
			</button>
			<button class="tab" class:tab--active={tab === 'leaderboard'} onclick={() => tab = 'leaderboard'}>
				🏆 Papan Skor
			</button>
			<button class="tab" class:tab--active={tab === 'activity'} onclick={() => tab = 'activity'}>
				📊 Aktivitas XP
			</button>
		</div>

		<!-- Tab: Badges -->
		{#if tab === 'overview'}
			<div class="badge-section">
				<h2>Badge Tersedia</h2>
				{#if earnedBadges.length === 0 && availableBadges.length === 0}
					<EmptyState title="Belum ada badge" description="Selesaikan pelajaran dan tantangan untuk mendapatkan badge!" />
				{:else}
					<div class="badge-grid">
						<!-- Earned badges -->
						{#each earnedBadges as b}
							<div class="badge-card earned" title={b.description}>
								<div class="badge-icon">{b.icon}</div>
								<div class="badge-name">{b.name}</div>
								<Badge variant="success">✔️ Diklaim</Badge>
							</div>
						{/each}
						<!-- Locked badges -->
						{#each filteredAvailable as b}
							<div class="badge-card locked" title={b.description}>
								<div class="badge-icon dim">?</div>
								<div class="badge-name locked-name">{b.name}</div>
								<Badge variant="outline">🔒 Terkunci</Badge>
							</div>
						{/each}
					</div>
					{#if filteredAvailable.length < availableBadges.length}
						<div class="badge-search-info">Menampilkan {filteredAvailable.length} dari {availableBadges.length} badge</div>
					{/if}
				{/if}
			</div>

		{:else if tab === 'leaderboard'}
			<!-- Tab: Leaderboard -->
			<div class="leaderboard-section">
				<h2>🏆 Papan Skor Global — Top 20</h2>
				{#if leaderboardLoading}
					<div class="loading"><Spinner /> Memuat papan skor...</div>
				{:else if leaderboard.length === 0}
					<EmptyState title="Belum ada data" description="Mulai belajar untuk masuk papan skor!" />
				{:else}
					<Card>
						<CardContent>
							<DataTable columns={leaderboardColumns} data={leaderboard.slice(0, 20)} pageSize={100} showSearch={false} showPagination={false} />
						</CardContent>
					</Card>
				{/if}
			</div>

		{:else if tab === 'activity'}
			<!-- Tab: Recent Activity -->
			<div class="activity-section">
				<h2>📊 Aktivitas XP Terbaru</h2>
				{#if recentActivity.length === 0}
					<EmptyState title="Belum ada aktivitas" description="Mulai belajar untuk mendapatkan XP!" />
				{:else}
					<Card>
						<CardContent>
							<div class="activity-list">
								{#each recentActivity as act}
									<div class="activity-item">
										<div class="activity-icon">
											{#if act.reason === 'lesson_complete'}📖
											{:else if act.reason === 'daily_login'}🌅
											{:else if act.reason === 'assignment_graded'}📝
											{:else if act.reason === 'assessment_completed'}📋
											{:else if act.reason === 'discussion_post'}💬
											{:else if act.reason === 'streak_milestone'}🔥
											{:else}⭐
											{/if}
										</div>
										<div class="activity-info">
											<div class="activity-reason">{reasonLabel(act.reason)}</div>
											<div class="activity-time">{timeAgo(act.created_at)}</div>
										</div>
										<div class="activity-xp">+{act.amount} XP</div>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.gamification-page { max-width: 800px; margin: 0 auto; padding: 0 0 40px; }
	h2 { font-size: 16px; font-weight: 600; margin: 20px 0 12px; }

	.loading { text-align: center; padding: 80px 20px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }
	.error-state { text-align: center; padding: 80px 20px; }
	.error-text { color: var(--danger); }

	/* New Badge Alert */
	.badge-alert {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		background: linear-gradient(135deg, rgba(79,70,229,0.15), rgba(113,112,255,0.1));
		border: 1px solid rgba(79,70,229,0.3);
		border-radius: 12px;
		margin-bottom: 16px;
		animation: slideDown 0.4s ease both;
	}
	.badge-alert-icon { font-size: 36px; }
	.badge-alert-title { font-weight: 700; font-size: 15px; color: var(--accent); }
	.badge-alert-name { font-size: 13px; color: var(--text-secondary); }

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Level Header */
	.level-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}
	.level-icon { font-size: 48px; line-height: 1; }
	.level-info { flex: 1; }
	.level-title { font-size: 22px; font-weight: 700; }
	.level-xp-text { font-size: 13px; color: var(--text-secondary); }
	.streak-display {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-secondary);
		padding: 10px 14px;
		border-radius: 10px;
	}
	.streak-icon { font-size: 24px; }
	.streak-value { font-weight: 700; font-size: 16px; }
	.streak-label { font-size: 11px; color: var(--text-secondary); }

	/* XP Bar */
	.xp-bar-section { margin-top: 8px; }
	.xp-bar-label {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}
	.xp-remaining {
		text-align: center;
		font-size: 12px;
		color: var(--text-secondary);
		margin-top: 6px;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		margin: 20px 0;
		overflow-x: auto;
	}
	.tab {
		flex: 1;
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		text-align: center;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

	/* Badge Grid */
	.badge-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
	}
	.badge-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 16px 10px;
		border-radius: 12px;
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		transition: all 0.2s;
	}
	.badge-card.earned {
		border-color: var(--accent);
		background: rgba(79,70,229,0.06);
	}
	.badge-card.locked {
		opacity: 0.6;
	}
	.badge-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	}
	.badge-icon { font-size: 32px; line-height: 1; }
	.badge-icon.dim { opacity: 0.4; font-size: 28px; }
	.badge-name { font-size: 12px; font-weight: 600; color: var(--text); }
	.badge-name.locked-name { color: var(--text-secondary); }
	.badge-search-info { font-size: 12px; color: var(--text-secondary); margin-top: 8px; }

	/* Leaderboard Table */
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
	.leaderboard-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
	.leaderboard-row:hover { background: var(--hover); }
	.leaderboard-row.highlight { background: var(--accent-dim); }
	.col-rank { width: 50px; }
	.rank-badge { font-weight: 700; color: var(--text-secondary); }
	.rank-badge.top3 { font-size: 18px; }
	.col-user { min-width: 160px; }
	.user-info { display: flex; align-items: center; gap: 10px; }
	.avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
	.avatar-placeholder {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-weight: 700; font-size: 12px;
	}
	.display-name { font-weight: 600; }
	.col-xp { font-weight: 700; }
	.col-level { color: var(--accent); }
	.col-streak { font-size: 13px; }

	/* Activity List */
	.activity-list { display: flex; flex-direction: column; }
	.activity-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.activity-item:last-child { border-bottom: none; }
	.activity-icon { font-size: 20px; width: 28px; text-align: center; }
	.activity-info { flex: 1; }
	.activity-reason { font-size: 14px; font-weight: 500; }
	.activity-time { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
	.activity-xp { font-weight: 700; color: var(--accent); font-size: 14px; }

	@media (max-width: 600px) {
		.badge-grid { grid-template-columns: repeat(2, 1fr); }
		.level-header { flex-wrap: wrap; }
		.streak-display { flex: 1; justify-content: center; }
	}
</style>
