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
		border: 3px solid rgba(0, 0, 0, 0.06);
		border-top-color: #4F46E5;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.ui-loading-text {
		font-size: 14px;
		color: #64748b;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
