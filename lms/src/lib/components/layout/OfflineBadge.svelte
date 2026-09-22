<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { ondismiss }: { ondismiss?: () => void } = $props();
</script>

<div class="offline-badge" transition:fly={{ y: 20, duration: 300 }}>
	<span class="offline-dot"></span>
	<span>Offline</span>
	<button class="offline-dismiss" onclick={ondismiss} aria-label="Tutup notifikasi offline">
		<Icon name="x" size={12} />
	</button>
</div>
