<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let notifications = $state<any[]>([]);
	let statusFilter = $state('');
	let showSendModal = $state(false);
	let sending = $state(false);

	let sendChannelType = $state('in_app');
	let sendRecipientId = $state('');
	let sendRecipientAddress = $state('');
	let sendSubject = $state('');
	let sendBody = $state('');

	const statuses = ['pending', 'sent', 'delivered', 'failed'];

	onMount(() => {
		if (browser) loadQueue();
	});

	async function loadQueue() {
		loading = true;
		error = '';
		try {
			const params = statusFilter ? `?status=${statusFilter}` : '';
			const res = await fetch('/api/admin/notifications/queue' + params);
			const json = await res.json();
			if (json.success) {
				notifications = json.data || [];
			} else {
				error = 'Gagal memuat queue notifikasi';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function openSendModal() {
		sendChannelType = 'in_app';
		sendRecipientId = '';
		sendRecipientAddress = '';
		sendSubject = '';
		sendBody = '';
		showSendModal = true;
	}

	function closeSendModal() {
		showSendModal = false;
	}

	async function sendNotification() {
		if (!sendBody) return;
		sending = true;
		try {
			const payload: Record<string, any> = {
				channelType: sendChannelType,
				body: sendBody,
			};
			if (sendRecipientId) payload.recipientId = sendRecipientId;
			if (sendRecipientAddress) payload.recipientAddress = sendRecipientAddress;
			if (sendSubject) payload.subject = sendSubject;

			const res = await fetch('/api/admin/notifications/queue', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				closeSendModal();
				await loadQueue();
			} else {
				error = json.error || 'Gagal mengirim notifikasi';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			sending = false;
		}
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'sent': return 'status-sent';
			case 'delivered': return 'status-delivered';
			case 'failed': return 'status-failed';
			case 'pending': return 'status-pending';
			default: return 'status-pending';
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
		} catch { return d; }
	}

	function channelLabel(type: string): string {
		switch (type) {
			case 'email': return '📧 Email';
			case 'sms': return '💬 SMS';
			case 'push': return '🔔 Push';
			case 'in_app': return '📱 In-App';
			default: return type;
		}
	}
</script>

<svelte:head>
	<title>Notification Queue — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📨 Notification Queue</h1>
			<p class="subtitle">Daftar notifikasi terkirim dengan filter status</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadQueue}>🔄</button>
			<button class="btn-primary" onclick={openSendModal}>+ Kirim Notifikasi</button>
		</div>
	</div>

	<!-- Status filter -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={statusFilter === ''} onclick={() => { statusFilter = ''; loadQueue(); }}>
			All
		</button>
		{#each statuses as s}
			<button class="filter-btn" class:active={statusFilter === s} onclick={() => { statusFilter = s; loadQueue(); }}>
				{s}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadQueue}>Coba Lagi</button>
		</div>
	{/if}

	<!-- Send Modal -->
	{#if showSendModal}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={closeSendModal}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Kirim Notifikasi Baru</h3>
					<button class="btn-close" onclick={closeSendModal}>✕</button>
				</div>
				<div class="modal-body">
					<div class="form-row">
						<label class="form-label">Channel Type</label>
						<select class="form-input" bind:value={sendChannelType}>
							<option value="in_app">In-App</option>
							<option value="email">Email</option>
							<option value="sms">SMS</option>
							<option value="push">Push</option>
						</select>
					</div>
					{#if sendChannelType === 'email' || sendChannelType === 'sms'}
						<div class="form-row">
							<label class="form-label">Recipient Address</label>
							<input class="form-input" bind:value={sendRecipientAddress} placeholder={sendChannelType === 'email' ? 'email@domain.com' : '+6281234567890'} />
						</div>
					{/if}
					{#if sendChannelType === 'push'}
						<div class="form-row">
							<label class="form-label">User ID</label>
							<input class="form-input" bind:value={sendRecipientId} placeholder="Target user ID" />
						</div>
					{/if}
					<div class="form-row">
						<label class="form-label">Subject (opsional)</label>
						<input class="form-input" bind:value={sendSubject} placeholder="Subject line" />
					</div>
					<div class="form-row">
						<label class="form-label">Body</label>
						<textarea class="form-textarea" bind:value={sendBody} rows="4" placeholder="Isi notifikasi..."></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={closeSendModal}>Batal</button>
					<button class="btn-primary" onclick={sendNotification} disabled={sending || !sendBody}>
						{sending ? 'Mengirim...' : 'Kirim'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Queue List -->
	{#if loading}
		<div class="loading">Memuat queue...</div>
	{:else if notifications.length === 0}
		<div class="empty-state">
			<p>Belum ada notifikasi di queue</p>
			<button class="btn-primary" onclick={openSendModal}>Kirim Notifikasi Pertama</button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Recipient</th>
							<th>Channel</th>
							<th>Subject</th>
							<th>Body Preview</th>
							<th>Status</th>
							<th>Created</th>
							<th>Sent At</th>
						</tr>
					</thead>
					<tbody>
						{#each notifications as n}
							<tr>
								<td class="cell-name">{n.recipient_address || n.recipient_id || '—'}</td>
								<td><span class="channel-label">{channelLabel(n.channel_type)}</span></td>
								<td>{n.subject || '—'}</td>
								<td class="cell-body">{n.body?.length > 50 ? n.body.slice(0, 50) + '...' : n.body}</td>
								<td><span class="status-badge {statusColor(n.status)}">{n.status}</span></td>
								<td>{formatDate(n.created_at)}</td>
								<td>{n.sent_at ? formatDate(n.sent_at) : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }

	/* Filter */
	.filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-btn {
		padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--surface); color: var(--text-secondary); font-size: 12px;
		font-weight: 500; cursor: pointer; transition: all 0.15s; text-transform: capitalize;
	}
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200;
		display: flex; align-items: center; justify-content: center;
		backdrop-filter: blur(4px);
	}
	.modal {
		background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
		width: 520px; max-width: 95vw; max-height: 85vh; overflow-y: auto;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 18px 20px; border-bottom: 1px solid var(--border);
	}
	.modal-header h3 { margin: 0; font-size: 16px; }
	.btn-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
	.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }

	.form-row { display: flex; flex-direction: column; gap: 6px; }
	.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
	.form-input, .form-textarea {
		width: 100%; padding: 10px 12px; font-size: 13px;
		background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px;
		color: var(--text); outline: none; font-family: inherit;
	}
	.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
	textarea.form-textarea { resize: vertical; }

	/* Table */
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-body { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.channel-label { font-size: 12px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; margin-bottom: 16px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; font-size: 13px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	/* Status badges */
	.status-badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 11px; font-weight: 600; text-transform: capitalize;
	}
	.status-sent { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-delivered { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-failed { background: rgba(239,68,68,0.1); color: #ef4444; }
	.status-pending { background: rgba(245,158,11,0.1); color: #f59e0b; }
</style>
