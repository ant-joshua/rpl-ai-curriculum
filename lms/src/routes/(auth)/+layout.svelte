<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#F4F7FA" />
</svelte:head>

<div class="auth-layout">
	<div class="auth-container">
		{@render children()}
	</div>
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg, #F4F7FA);
		background-image:
			radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.08) 0%, transparent 60%),
			radial-gradient(ellipse at 80% 80%, rgba(79, 70, 229, 0.04) 0%, transparent 50%);
		padding: 1rem;
		/* Force light theme on auth pages */
		--bg: #F4F7FA !important;
		--surface: #FFFFFF !important;
		--text: #1a1a2e !important;
		--text-secondary: #64748b !important;
		--text-muted: #94a3b8 !important;
		--border: #E2E8F0 !important;
		--accent: #4F46E5 !important;
		--accent-hover: #4338CA !important;
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
	}
</style>
