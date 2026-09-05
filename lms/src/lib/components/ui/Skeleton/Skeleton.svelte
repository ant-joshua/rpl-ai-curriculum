<script lang="ts">
	let { class: className = '', style = '' }: { class?: string; style?: string } = $props();
</script>

<div class="skeleton {className}" {style}></div>

<style>
	.skeleton {
		background: linear-gradient(90deg, var(--surface-alt) 25%, var(--border-light, rgba(0,0,0,0.04)) 50%, var(--surface-alt) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		border-radius: var(--radius-sm);
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
