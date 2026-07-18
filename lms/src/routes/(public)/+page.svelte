<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	if (browser) {
		const user = localStorage.getItem('hermes_user');
		if (user) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	}
</script>
