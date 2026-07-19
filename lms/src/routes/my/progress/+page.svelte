<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if (browser) {
			goto('/my/progress/analytics', { replaceState: true });
		}
	});
</script>

<div class="redirecting">
	<p>{t('loading')}</p>
</div>

<style>
	.redirecting {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		color: var(--text-secondary, #64748b);
		font-size: 14px;
	}
</style>
