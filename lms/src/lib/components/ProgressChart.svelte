<script lang="ts">
	let {
		filteredCompletedCount = 0,
		filteredTotalModules = 0,
		filteredProgress = 0,
		streak = 0
	}: {
		filteredCompletedCount?: number;
		filteredTotalModules?: number;
		filteredProgress?: number;
		streak?: number;
	} = $props();
</script>

<div class="progress-chart-card">
	<div class="stats-row">
		<div class="stat-item">
			<span class="stat-value">{filteredCompletedCount}/{filteredTotalModules}</span>
			<span class="stat-label">Modul selesai</span>
		</div>
		<div class="stat-item">
			<span class="stat-value">{filteredProgress}%</span>
			<span class="stat-label">Progress</span>
		</div>
		<div class="stat-item">
			<span class="stat-value">{streak}</span>
			<span class="stat-label">Streak 🔥</span>
		</div>
	</div>
	<div class="bar-chart">
		<div class="bar-track">
			<div
				class="bar-fill"
				style="width: {Math.min(filteredProgress, 100)}%"
				role="progressbar"
				aria-valuenow={filteredProgress}
				aria-valuemin={0}
				aria-valuemax={100}
			></div>
		</div>
	</div>
</div>

<style>
	.progress-chart-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		margin-bottom: 16px;
	}

	.stats-row {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		margin-bottom: 12px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.bar-track {
		width: 100%;
		height: 10px;
		background: var(--bg-secondary);
		border-radius: 99px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 99px;
		transition: width 0.5s ease;
	}
</style>
