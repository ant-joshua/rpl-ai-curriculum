<script lang="ts">
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let {
		username = 'Teman',
		level = 1,
		totalXp = 0,
		xpToNext = 100,
		currentLevelXp = 0,
		streak = 0,
		completedCount = 0,
		totalEnrollments = 0,
		averageProgress = 0,
	}: {
		username?: string;
		level?: number;
		totalXp?: number;
		xpToNext?: number;
		currentLevelXp?: number;
		streak?: number;
		completedCount?: number;
		totalEnrollments?: number;
		averageProgress?: number;
	} = $props();

	const hour = new Date().getHours();
	const greeting = $derived(
		hour < 10 ? 'Selamat Pagi' :
		hour < 15 ? 'Selamat Siang' :
		hour < 19 ? 'Selamat Sore' :
		'Selamat Malam'
	);

	const initials = $derived(username.charAt(0).toUpperCase());
	const xpPct = $derived(
		xpToNext > 0 ? Math.round((currentLevelXp / (currentLevelXp + xpToNext)) * 100) : 0
	);
</script>

<div class="welcome-row">
	<!-- Welcome card -->
	<div class="welcome-card">
		<div class="welcome-left">
			<Avatar initials={initials} alt={username} size="lg" />
			<div class="welcome-info">
				<h1 class="welcome-greeting">{greeting}, {username}!</h1>
				<p class="welcome-sub">Lanjutkan perjalanan belajar RPL AI-mu</p>
				<div class="welcome-meta">
					{#if streak > 0}
						<Badge variant="warning">
							🔥 {streak} hari streak
						</Badge>
					{/if}
					{#if totalXp > 0}
						<Badge variant="primary">
							⭐ Level {level}
						</Badge>
					{/if}
				</div>
			</div>
		</div>
		<div class="xp-section">
			<div class="xp-header">
				<span class="xp-label">Level {level}</span>
				<span class="xp-count">{totalXp} XP</span>
			</div>
			<div class="xp-bar-track">
				<div class="xp-bar-fill" style="width: {xpPct}%"></div>
			</div>
			<span class="xp-next">{xpToNext} XP ke level {level + 1}</span>
		</div>
	</div>

	<!-- Stats cards -->
	<div class="stats-cards">
		<div class="stat-card">
			<Icon name="book" size={18} />
			<div class="stat-body">
				<span class="stat-value">{completedCount}</span>
				<span class="stat-label">Selesai</span>
			</div>
		</div>
		<div class="stat-card">
			<Icon name="layers" size={18} />
			<div class="stat-body">
				<span class="stat-value">{totalEnrollments}</span>
				<span class="stat-label">Terdaftar</span>
			</div>
		</div>
		<div class="stat-card">
			<Icon name="trending-up" size={18} />
			<div class="stat-body">
				<span class="stat-value">{averageProgress}%</span>
				<span class="stat-label">Rata-rata</span>
			</div>
		</div>
	</div>
</div>

<style>
	.welcome-row {
		display: flex;
		gap: 14px;
		margin-bottom: 20px;
	}

	.welcome-card {
		flex: 1;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.welcome-left {
		display: flex;
		align-items: flex-start;
		gap: 14px;
	}

	.welcome-info {
		flex: 1;
		min-width: 0;
	}

	.welcome-greeting {
		font-size: 20px;
		font-weight: 590;
		margin: 0 0 2px;
		color: #fff;
	}

	.welcome-sub {
		font-size: 13px;
		color: #8a8f98;
		margin: 0 0 10px;
		font-weight: 400;
	}

	.welcome-meta {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.xp-section {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		padding: 12px 14px;
	}

	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}

	.xp-label {
		font-size: 12px;
		font-weight: 510;
		color: #8a8f98;
	}

	.xp-count {
		font-size: 12px;
		font-weight: 590;
		color: #7170ff;
	}

	.xp-bar-track {
		height: 4px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 4px;
	}

	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #5e6ad2, #7170ff);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.xp-next {
		font-size: 11px;
		font-weight: 400;
		color: #6b7280;
	}

	.stats-cards {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 140px;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
		color: #8a8f98;
	}

	.stat-body {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 16px;
		font-weight: 590;
		color: #fff;
		line-height: 1.2;
	}

	.stat-label {
		font-size: 11px;
		font-weight: 400;
		color: #8a8f98;
	}

	@media (max-width: 768px) {
		.welcome-row {
			flex-direction: column;
		}
		.stats-cards {
			flex-direction: row;
			flex: 1;
		}
		.stat-card {
			flex: 1;
		}
	}
</style>
