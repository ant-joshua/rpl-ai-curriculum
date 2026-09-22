<script lang="ts">
	let { show = false, onscrolltop }: { show: boolean; onscrolltop: () => void } = $props();
</script>

<div class="quick-actions" aria-label="Quick actions">
	{#if show}
		<div class="floating-actions-group">
			<a href="/study" class="floating-action-btn" aria-label="Pomodoro timer" title="Pomodoro timer">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<polyline points="12 6 12 12 16 14"/>
				</svg>
			</a>
			<button class="floating-action-btn" onclick={onscrolltop} aria-label="Back to top" title="Back to top">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="19" x2="12" y2="5"/>
					<polyline points="5 12 12 5 19 12"/>
				</svg>
			</button>
		</div>
	{/if}
</div>
