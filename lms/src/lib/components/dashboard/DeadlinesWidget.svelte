<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Deadline = {
		id: string;
		title: string;
		due_date: string;
		kind: 'assessment' | 'assignment';
		offering_name: string;
		assessment_type?: string;
	};

	let {
		deadlines = [] as Deadline[],
	}: {
		deadlines?: Deadline[];
	} = $props();

	function getCountdown(dueDate: string): { label: string; urgent: 'danger' | 'warning' | 'normal' } {
		const now = Date.now();
		const due = new Date(dueDate + (dueDate.includes('T') ? '' : 'T23:59:59')).getTime();
		const diffMs = due - now;
		const diffHours = Math.round(diffMs / (1000 * 60 * 60));
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		if (diffMs <= 0) return { label: 'Terlewat', urgent: 'danger' as const };
		if (diffHours < 24) return { label: `${diffHours} jam lagi`, urgent: 'danger' as const };
		if (diffHours < 72) return { label: `${diffDays} hari lagi`, urgent: 'warning' as const };
		return { label: `${diffDays} hari lagi`, urgent: 'normal' as const };
	}

	function formatDate(d: string): string {
		try {
			return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric'
			});
		} catch {
			return d;
		}
	}
</script>

<section class="deadlines-section">
	<h2 class="section-title">
		<Icon name="calendar" size={16} />
		Deadline Mendatang
	</h2>

	{#if deadlines.length === 0}
		<EmptyState
			icon="✅"
			title="Tidak ada deadline"
			description="Semua tugas sudah selesai. Santai dulu!"
		/>
	{:else}
		<div class="deadline-list">
			{#each deadlines as dl}
				{@const countdown = getCountdown(dl.due_date)}
				<div class="deadline-item">
					<div class="deadline-left">
						<div class="deadline-kind">
							{#if dl.kind === 'assessment'}
								<Badge variant="info" size="sm">Tes</Badge>
							{:else}
								<Badge variant="accent" size="sm">Tugas</Badge>
							{/if}
						</div>
						<div class="deadline-info">
							<span class="deadline-title">{dl.title}</span>
							<span class="deadline-course">{dl.offering_name}</span>
						</div>
					</div>
					<div class="deadline-right">
						<span
							class="deadline-date"
							style="color: {countdown.urgent === 'danger' ? '#ef4444' : countdown.urgent === 'warning' ? '#f59e0b' : '#8a8f98'}"
						>
							{formatDate(dl.due_date)}
						</span>
						<span
							class="deadline-countdown"
							style="color: {countdown.urgent === 'danger' ? '#ef4444' : countdown.urgent === 'warning' ? '#f59e0b' : '#8a8f98'}"
						>
							{countdown.label}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.deadlines-section {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 20px;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 15px;
		font-weight: 590;
		color: #fff;
		margin: 0 0 14px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.deadline-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.deadline-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.deadline-item:last-child {
		border-bottom: none;
	}

	.deadline-left {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.deadline-kind {
		flex-shrink: 0;
	}

	.deadline-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.deadline-title {
		font-size: 13px;
		font-weight: 510;
		color: #fff;
		line-height: 1.3;
	}

	.deadline-course {
		font-size: 11px;
		font-weight: 400;
		color: #6b7280;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.deadline-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1px;
		flex-shrink: 0;
	}

	.deadline-date {
		font-size: 11px;
		font-weight: 400;
	}

	.deadline-countdown {
		font-size: 12px;
		font-weight: 590;
	}
</style>
