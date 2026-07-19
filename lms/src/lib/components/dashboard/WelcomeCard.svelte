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
		background: var(--surface, #FFFFFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius, 12px);
		box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.08));
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		transition: all 0.2s ease;
		animation: fadeSlideIn 0.35s ease both;
	}
	.welcome-card:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.12);
		transform: translateY(-1px);
		border-color: rgba(79, 70, 229, 0.15);
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
		color: var(--text, #1a1a2e);
	}

	.welcome-sub {
		font-size: 13px;
		color: #64748b;
		margin: 0 0 10px;
		font-weight: 400;
	}

	.welcome-meta {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.xp-section {
		background: var(--surface-alt, #F1F5F9);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius-sm, 8px);
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
		color: #64748b;
	}

	.xp-count {
		font-size: 12px;
		font-weight: 590;
		color: var(--success, #22C55E);
	}

	.xp-bar-track {
		height: 8px;
		background: var(--border, #E2E8F0);
		border-radius: var(--radius-full, 9999px);
		overflow: hidden;
		margin-bottom: 4px;
	}

	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #22C55E, #16A34A);
		border-radius: var(--radius-full, 9999px);
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}
	.xp-bar-fill::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
		animation: shimmer 2s infinite;
	}
	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	.xp-next {
		font-size: 11px;
		font-weight: 400;
		color: #64748b;
	}

	.stats-cards {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 140px;
	}

	.stat-card {
		background: var(--surface, #FFFFFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius-sm, 8px);
		box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--accent, #4F46E5);
		transition: all 0.15s ease;
		animation: fadeSlideIn 0.3s ease both;
		opacity: 0;
	}
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		border-color: rgba(79, 70, 229, 0.2);
	}

	.stat-body {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 16px;
		font-weight: 590;
		color: var(--text, #1a1a2e);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 11px;
		font-weight: 400;
		color: var(--text-secondary, #64748b);
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
