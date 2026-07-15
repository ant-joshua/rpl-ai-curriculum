<script lang="ts">
	type SkeletonVariant = 'text' | 'title' | 'avatar' | 'block' | 'card' | 'circle' | 'button';

	let {
		variant = 'text' as SkeletonVariant,
		width,
		height,
		class: className = '',
		count = 1,
		gap = '0.5rem',
	}: {
		variant?: SkeletonVariant;
		width?: string;
		height?: string;
		class?: string;
		count?: number;
		gap?: string;
	} = $props();

	const PRESETS: Record<SkeletonVariant, { width?: string; height: string; borderRadius: string }> = {
		text: { height: '14px', borderRadius: '6px' },
		title: { width: '70%', height: '20px', borderRadius: '6px' },
		avatar: { width: '40px', height: '40px', borderRadius: '10px' },
		block: { height: '100px', borderRadius: '8px' },
		card: { height: '180px', borderRadius: '12px' },
		circle: { width: '40px', height: '40px', borderRadius: '50%' },
		button: { width: '100px', height: '36px', borderRadius: '8px' },
	};

	let w = $derived(width ?? PRESETS[variant].width ?? '100%');
	let h = $derived(height ?? PRESETS[variant].height);
	let br = $derived(PRESETS[variant].borderRadius);
</script>

{#if count === 1}
	<div class="skeleton {className}" style="width: {w}; height: {h}; border-radius: {br};" role="status" aria-label="Loading"></div>
{:else}
	<div class="skeleton-group" style="display: flex; flex-direction: column; gap: {gap};" role="status" aria-label="Loading">
		{#each Array(count) as _}
			<div class="skeleton {className}" style="width: {w}; height: {h}; border-radius: {br};"></div>
		{/each}
	</div>
{/if}

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(255,255,255,0.02) 25%,
			rgba(255,255,255,0.06) 50%,
			rgba(255,255,255,0.02) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
