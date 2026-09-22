<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { ondismiss }: { ondismiss?: () => void } = $props();
</script>

<div class="viewport-banner" transition:fly={{ y: -20, duration: 300 }}>
	<Icon name="rotate-ccw" size={14} />
	<span>Putar ponsel ke mode landscape untuk pengalaman lebih baik</span>
	<button class="viewport-banner-dismiss" onclick={ondismiss} aria-label="Tutup banner">
		<Icon name="x" size={12} />
	</button>
</div>
