<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Activity = {
		id: string;
		action: string;
		entity_type: string;
		entity_id?: string;
		metadata?: Record<string, unknown> | null;
		created_at: string;
		offering_name?: string;
		display_name?: string;
	};

	let {
		activities = [] as Activity[],
	}: {
		activities?: Activity[];
	} = $props();

	function formatTimeAgo(dateStr: string): string {
		try {
			const now = Date.now();
			const date = new Date(dateStr + (dateStr.includes('T') || dateStr.includes(' ') ? '' : 'T00:00:00Z')).getTime();
			const diffMs = now - date;
			const mins = Math.floor(diffMs / (1000 * 60));
			const hours = Math.floor(diffMs / (1000 * 60 * 60));
			const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

			if (mins < 1) return 'Baru saja';
			if (mins < 60) return `${mins} menit lalu`;
			if (hours < 24) return `${hours} jam lalu`;
			if (days < 7) return `${days} hari lalu`;
			return new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
		} catch {
			return '';
		}
	}

	function actionIcon(action: string): string {
		if (action === 'lesson_complete') return 'check-circle';
		if (action === 'quiz_attempt') return 'file-text';
		if (action === 'enrolled') return 'user-plus';
		if (action === 'badge_earned') return 'award';
		if (action === 'xp_gained') return 'trending-up';
		if (action === 'module_complete') return 'book';
		return 'list';
	}

	function actionLabel(action: string, metadata?: Record<string, unknown> | null): string {
		if (action === 'lesson_complete') return `Menyelesaikan ${metadata?.lesson_title || 'sesi'}`;
		if (action === 'quiz_attempt') return `Mengerjakan kuis: ${metadata?.quiz_title || ''}`;
		if (action === 'enrolled') return `Mendaftar ${metadata?.course_name || 'kursus'}`;
		if (action === 'badge_earned') return `Mendapat badge ${metadata?.badge_name || ''}`;
		if (action === 'xp_gained') return `Mendapat ${metadata?.amount || ''} XP`;
		if (action === 'module_complete') return `Menyelesaikan modul ${metadata?.module_title || ''}`;
		return action;
	}
</script>

<section class="activity-section">
	<h2 class="section-title">
		<Icon name="list" size={16} />
		Aktivitas Terbaru
	</h2>

	{#if activities.length === 0}
		<EmptyState
			icon="📭"
			title="Belum ada aktivitas"
			description="Mulai belajar untuk mencatat aktivitasmu"
		/>
	{:else}
		<div class="activity-list">
			{#each activities as act}
				<div class="activity-item">
					<div class="activity-icon">
						<Icon name={actionIcon(act.action)} size={16} />
					</div>
					<div class="activity-body">
						<span class="activity-text">{actionLabel(act.action, act.metadata)}</span>
						{#if act.offering_name}
							<span class="activity-course">{act.offering_name}</span>
						{/if}
					</div>
					<span class="activity-time">{formatTimeAgo(act.created_at)}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.activity-section {
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

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-icon {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 6px;
		color: #8a8f98;
	}

	.activity-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.activity-text {
		font-size: 13px;
		font-weight: 400;
		color: #fff;
		line-height: 1.3;
	}

	.activity-course {
		font-size: 11px;
		font-weight: 400;
		color: #6b7280;
	}

	.activity-time {
		font-size: 11px;
		font-weight: 400;
		color: #6b7280;
		flex-shrink: 0;
		white-space: nowrap;
	}
</style>
