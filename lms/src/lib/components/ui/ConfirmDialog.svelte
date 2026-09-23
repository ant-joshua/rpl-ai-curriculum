<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	let {
		open = $bindable(false),
		title = 'Konfirmasi Tindakan',
		message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
		confirmText = 'Konfirmasi',
		cancelText = 'Batal',
		variant = 'danger',
		loading = false,
		onconfirm,
		oncancel
	}: {
		open?: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger' | 'primary' | 'secondary' | 'outline';
		loading?: boolean;
		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
	} = $props();

	function handleClose() {
		if (loading) return;
		open = false;
		oncancel?.();
	}

	async function handleConfirm() {
		if (loading) return;
		if (onconfirm) {
			await onconfirm();
		}
		open = false;
	}
</script>

<Modal {open} {title} onclose={handleClose} class="ui-confirm-dialog">
	<div class="ui-confirm-body">
		<p class="ui-confirm-message">{message}</p>
	</div>
	{#snippet footer()}
		<div class="ui-confirm-footer">
			<Button variant="ghost" onclick={handleClose} disabled={loading}>
				{cancelText}
			</Button>
			<Button {variant} onclick={handleConfirm} disabled={loading}>
				{loading ? 'Memproses...' : confirmText}
			</Button>
		</div>
	{/snippet}
</Modal>

<style>
	:global(.ui-confirm-dialog) {
		max-width: 440px !important;
	}

	.ui-confirm-body {
		padding: 8px 0;
	}

	.ui-confirm-message {
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--text);
		margin: 0;
	}

	.ui-confirm-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		width: 100%;
	}
</style>
