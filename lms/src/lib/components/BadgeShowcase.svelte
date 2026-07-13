<script lang="ts">
	let { badges = [], compact = false }: {
		badges?: Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			earned_at?: string | null;
		}>;
		compact?: boolean;
	} = $props();

	function isEarned(badge: { earned_at?: string | null }): boolean {
		return !!badge.earned_at;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="badge-showcase" class:compact>
	{#each badges as badge}
		<div
			class="badge-card"
			class:earned={isEarned(badge)}
			class:locked={!isEarned(badge)}
			title={badge.description}
		>
			<div class="badge-icon">
				{isEarned(badge) ? badge.icon : '🔒'}
			</div>
			<div class="badge-info">
				<span class="badge-name">{isEarned(badge) ? badge.name : '???'}</span>
				{#if !compact && !isEarned(badge)}
					<span class="badge-desc">{badge.description}</span>
				{/if}
				{#if isEarned(badge) && badge.earned_at}
					<span class="badge-date">Earned {formatDate(badge.earned_at!)}</span>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.badge-showcase {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.badge-showcase.compact {
		gap: 8px;
	}

	.badge-card {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		transition: all 0.15s ease;
		min-width: 160px;
	}

	.badge-showcase.compact .badge-card {
		padding: 8px 12px;
		min-width: auto;
		gap: 8px;
	}

	.badge-card.earned {
		opacity: 1;
	}

	.badge-card.locked {
		opacity: 0.5;
		filter: grayscale(1);
	}

	.badge-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.badge-showcase.compact .badge-card:hover {
		transform: translateY(-1px);
	}

	.badge-icon {
		font-size: 32px;
		line-height: 1;
		flex-shrink: 0;
	}

	.badge-showcase.compact .badge-icon {
		font-size: 24px;
	}

	.badge-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.badge-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.badge-desc {
		font-size: 11px;
		color: var(--text-secondary);
		line-height: 1.3;
	}

	.badge-date {
		font-size: 10px;
		color: var(--accent);
		font-weight: 500;
	}

	.badge-showcase.compact .badge-name {
		font-size: 12px;
	}
</style>
