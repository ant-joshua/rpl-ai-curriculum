<script lang="ts">
	type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

	let {
		src,
		alt = '',
		initials = '',
		size = 'md' as AvatarSize,
		class: className = '',
	}: {
		src?: string;
		alt?: string;
		initials?: string;
		size?: AvatarSize;
		class?: string;
	} = $props();

	let imgError = $state(false);

	const SIZE_MAP: Record<AvatarSize, { dim: number; fontSize: string }> = {
		sm: { dim: 28, fontSize: '11px' },
		md: { dim: 36, fontSize: '13px' },
		lg: { dim: 48, fontSize: '16px' },
		xl: { dim: 64, fontSize: '22px' },
	};

	let dim = $derived(SIZE_MAP[size].dim);
	let fs = $derived(SIZE_MAP[size].fontSize);

	let showImg = $derived(!!src && !imgError);
	let showInitials = $derived(!showImg && !!initials);
	let showFallback = $derived(!showImg && !showInitials);
	let fallbackChar = $derived(showFallback ? (alt ? alt[0].toUpperCase() : '?') : '');

	function onImgError() {
		imgError = true;
	}

	$effect(() => {
		// Reset error state if src changes
		if (src) imgError = false;
	});
</script>

<div
	class="avatar {className}"
	style="width: {dim}px; height: {dim}px; font-size: {fs};"
	role="img"
	aria-label={alt || initials || 'Avatar'}
>
	{#if showImg}
		<img {src} {alt} onerror={onImgError} class="avatar-img" />
	{/if}
	{#if showInitials}
		<span class="avatar-initials">{initials}</span>
	{/if}
	{#if showFallback}
		<span class="avatar-fallback">{fallbackChar}</span>
	{/if}
</div>

<style>
	.avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--hover, rgba(255,255,255,0.05));
		overflow: hidden;
		flex-shrink: 0;
		border: 2px solid var(--border, rgba(255,255,255,0.08));
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.avatar-initials,
	.avatar-fallback {
		font-weight: 600;
		color: var(--text-secondary, #d0d6e0);
		line-height: 1;
	}

	.avatar-fallback {
		color: var(--muted, #8a8f98);
	}
</style>
