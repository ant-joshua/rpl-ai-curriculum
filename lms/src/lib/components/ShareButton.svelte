<script lang="ts">
	let { title, text, url }: { title: string; text: string; url: string } = $props();

	async function share() {
		if (navigator.share) {
			await navigator.share({ title, text, url });
		} else {
			// Fallback: copy link to clipboard
			await navigator.clipboard.writeText(url);
			alert('Link disalin!');
		}
	}
</script>

<button onclick={share} class="share-btn">
	📤 Bagikan
</button>

<style>
	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}
	.share-btn:hover {
		background: var(--hover);
		border-color: var(--accent);
	}
</style>
