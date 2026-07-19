<script lang="ts">
	import { onMount } from 'svelte';

	let scrollPercent = $state(0);
	let visible = $state(false);

	onMount(() => {
		function update() {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight;
			const winHeight = window.innerHeight;

			const scrollable = docHeight > winHeight;
			visible = scrollable;

			if (scrollable) {
				const maxScroll = docHeight - winHeight;
				scrollPercent = Math.min((scrollTop / maxScroll) * 100, 100);
			}
		}

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update, { passive: true });

		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

{#if visible}
	<div class="scroll-progress" style="width: {scrollPercent}%"></div>
{/if}

<style>
	.scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: linear-gradient(90deg, #4F46E5, #22C55E);
		z-index: 9999;
		transition: width 0.1s ease-out;
		pointer-events: none;
	}
</style>
