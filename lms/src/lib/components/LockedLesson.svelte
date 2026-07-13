<script lang="ts">
	interface Prereq {
		lesson_id: string;
		title: string;
		completed: boolean;
	}

	let {
		prerequisites = [] as Prereq[],
	}: {
		prerequisites?: Prereq[];
	} = $props();

	let completedCount = $derived(prerequisites.filter(p => p.completed).length);
	let totalCount = $derived(prerequisites.length);
</script>

<div class="locked-lesson">
	<div class="card">
		<div class="lock-icon">🔒</div>
		<h2 class="title">Lesson Terkunci</h2>
		<p class="subtitle">Selesaikan prerequisite berikut terlebih dahulu:</p>

		<div class="prereq-list">
			{#each prerequisites as prereq (prereq.lesson_id)}
				<div class="prereq-row" class:completed={prereq.completed}>
					<span class="prereq-icon">{prereq.completed ? '✅' : '❌'}</span>
					<span class="prereq-title">{prereq.title}</span>
				</div>
			{/each}
		</div>

		<div class="progress-section">
			<div class="progress-bar-bg">
				<div
					class="progress-bar-fill"
					style="width: {totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%"
				></div>
			</div>
			<span class="progress-label">{completedCount} of {totalCount} prerequisites completed</span>
		</div>
	</div>
</div>

<style>
	.locked-lesson {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		animation: fadeIn 0.4s ease both;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		max-width: 480px;
		width: 100%;
		padding: 2rem;
		text-align: center;
	}

	.lock-icon {
		font-size: 48px;
		line-height: 1;
		margin-bottom: 1rem;
	}

	.title {
		font-size: 20px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 1.5rem 0;
		line-height: 1.5;
	}

	.prereq-list {
		text-align: left;
		margin-bottom: 1.5rem;
	}

	.prereq-row {
		display: flex;
		align-items: center;
		padding: 10px 12px;
		gap: 10px;
		border-bottom: 1px solid var(--border);
		transition: background 0.15s ease;
	}

	.prereq-row:last-child {
		border-bottom: none;
	}

	.prereq-row:hover {
		background: var(--hover);
	}

	.prereq-icon {
		font-size: 20px;
		line-height: 1;
		flex-shrink: 0;
		width: 20px;
		text-align: center;
	}

	.prereq-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		line-height: 1.4;
	}

	.prereq-row.completed .prereq-title {
		color: var(--text-secondary);
		text-decoration: line-through;
		opacity: 0.7;
	}

	.progress-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.progress-bar-bg {
		width: 100%;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.progress-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
