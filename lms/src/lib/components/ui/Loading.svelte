<script lang="ts">
	let {
		message = 'Loading...',
		class: className = '',
	}: {
		message?: string;
		class?: string;
	} = $props();
</script>

<div class={['ui-loading', className].filter(Boolean).join(' ')}>
	<span class="ui-loading-spinner"></span>
	<span class="ui-loading-text">{message}</span>
</div>

<style>
	.ui-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 48px 16px;
	}
	.ui-loading-spinner {
		width: 24px;
		height: 24px;
		border: 3px solid rgba(255, 255, 255, 0.08);
		border-top-color: #5e6ad2;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.ui-loading-text {
		font-size: 14px;
		color: #8a8f98;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
