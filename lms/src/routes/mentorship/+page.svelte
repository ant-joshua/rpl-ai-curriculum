<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user.svelte';
	import { api } from '$lib/utils/api';

	let requests = $state<any[]>([]);
	let loading = $state(true);
	let showForm = $state(false);
	let pathSlug = $state('');
	let message = $state('');
	let submitting = $state(false);
	let submitError = $state('');
	let isMentor = $state(false);

	onMount(async () => {
		await loadRequests();
	});

	async function loadRequests() {
		loading = true;
		const res = await api<any[]>('/api/mentorship');
		if (res.success && res.data) {
			requests = res.data;
		}
		loading = false;
	}

	async function handleSubmit() {
		if (!pathSlug.trim()) return;
		submitting = true;
		submitError = '';
		const res = await api('/api/mentorship', {
			method: 'POST',
			body: JSON.stringify({ path_slug: pathSlug.trim(), message: message.trim() }),
		});
		submitting = false;
		if (res.success) {
			showForm = false;
			pathSlug = '';
			message = '';
			await loadRequests();
		} else {
			submitError = res.error || 'Gagal mengirim permintaan';
		}
	}

	async function handleRespond(id: string, status: string) {
		await api(`/api/mentorship/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ status }),
		});
		await loadRequests();
	}

	async function loadMentorPending() {
		isMentor = true;
		loading = true;
		const res = await api<any[]>('/api/mentorship?role=mentor');
		if (res.success && res.data) {
			requests = res.data;
		}
		loading = false;
	}

	const statusLabels: Record<string, string> = {
		pending: '⏳ Menunggu',
		accepted: '✅ Diterima',
		rejected: '❌ Ditolak',
	};
	const statusColors: Record<string, string> = {
		pending: 'var(--accent)',
		accepted: '#22c55e',
		rejected: '#ef4444',
	};
</script>

<div class="mentorship-page">
	<h1>🎯 Mentorship</h1>
	<p class="subtitle">Minta bimbingan atau bantu teman belajar RPL</p>

	<div class="tab-bar">
		<button class="tab-btn" class:active={!isMentor} onclick={() => { isMentor = false; loadRequests(); }}>
			Permintaanku
		</button>
		<button class="tab-btn" class:active={isMentor} onclick={loadMentorPending}>
			Jadi Mentor
		</button>
	</div>

	{#if loading}
		<p class="loading-text">Memuat...</p>
	{:else if isMentor}
		<div class="mentor-section">
			<h3>Permintaan Bimbingan Masuk</h3>
			{#if requests.length === 0}
				<p class="empty-state">Belum ada permintaan bimbingan.</p>
			{:else}
				<div class="request-list">
					{#each requests as req}
						<div class="request-card pending-card">
							<div class="req-header">
								<span class="req-student">{req.student_name || req.student_id.slice(0, 8)}</span>
								<span class="req-status" style="color: {statusColors[req.status]}">{statusLabels[req.status]}</span>
							</div>
							<p class="req-path">📁 {req.path_slug}</p>
							{#if req.message}
								<p class="req-message">"{req.message}"</p>
							{/if}
							{#if req.status === 'pending'}
								<div class="req-actions">
									<button class="accept-btn" onclick={() => handleRespond(req.id, 'accepted')}>Terima</button>
									<button class="reject-btn" onclick={() => handleRespond(req.id, 'rejected')}>Tolak</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="student-section">
			{#if requests.length === 0}
				<p class="empty-state">Belum ada permintaan mentorship.</p>
				<button class="create-request-btn" onclick={() => showForm = !showForm}>
					{showForm ? '✕ Batal' : '➕ Minta Mentor'}
				</button>

				{#if showForm}
					<div class="request-form">
						<div class="form-field">
							<label for="ment-path">Path / Bidang</label>
							<input id="ment-path" type="text" bind:value={pathSlug} placeholder="misal: web-dev, mobile" />
						</div>
						<div class="form-field">
							<label for="ment-msg">Pesan (opsional)</label>
							<textarea id="ment-msg" bind:value={message} placeholder="Ceritakan apa yang ingin dipelajari..."></textarea>
						</div>
						{#if submitError}
							<p class="form-error">{submitError}</p>
						{/if}
						<button class="submit-btn" onclick={handleSubmit} disabled={submitting}>
							{submitting ? 'Mengirim...' : 'Kirim Permintaan'}
						</button>
					</div>
				{/if}
			{:else}
				<div class="request-list">
					{#each requests as req}
						<div class="request-card">
							<div class="req-header">
								<span class="req-path-label">📁 {req.path_slug}</span>
								<span class="req-status" style="color: {statusColors[req.status]}">{statusLabels[req.status]}</span>
							</div>
							{#if req.message}
								<p class="req-message">"{req.message}"</p>
							{/if}
							{#if req.mentor_name}
								<p class="req-mentor">Mentor: {req.mentor_name}</p>
							{/if}
						</div>
					{/each}
				</div>
				<button class="create-request-btn" onclick={() => showForm = !showForm}>
					{showForm ? '✕ Batal' : '➕ Minta Mentor Lagi'}
				</button>
				{#if showForm}
					<div class="request-form same-form">
						<div class="form-field">
							<label for="ment-path2">Path / Bidang</label>
							<input id="ment-path2" type="text" bind:value={pathSlug} placeholder="misal: web-dev, mobile" />
						</div>
						<div class="form-field">
							<label for="ment-msg2">Pesan (opsional)</label>
							<textarea id="ment-msg2" bind:value={message} placeholder="Ceritakan apa yang ingin dipelajari..."></textarea>
						</div>
						{#if submitError}
							<p class="form-error">{submitError}</p>
						{/if}
						<button class="submit-btn" onclick={handleSubmit} disabled={submitting}>
							{submitting ? 'Mengirim...' : 'Kirim Permintaan'}
						</button>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.mentorship-page {
		max-width: 650px;
		margin: 0 auto;
	}
	h1 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.subtitle {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 20px;
	}
	.tab-bar {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
	}
	.tab-btn {
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
	.tab-btn.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.loading-text {
		text-align: center;
		color: var(--text-secondary);
		padding: 20px;
	}
	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		padding: 30px;
		font-size: 14px;
	}
	.request-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}
	.request-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}
	.req-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.req-student, .req-path-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.req-status {
		font-size: 12px;
		font-weight: 600;
	}
	.req-path {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}
	.req-message {
		font-size: 13px;
		color: var(--text-secondary);
		font-style: italic;
		margin: 4px 0;
	}
	.req-mentor {
		font-size: 12px;
		color: var(--accent);
		margin-top: 4px;
	}
	.req-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}
	.accept-btn, .reject-btn {
		padding: 6px 16px;
		border-radius: 8px;
		border: none;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
	.accept-btn {
		background: #22c55e;
		color: #fff;
	}
	.reject-btn {
		background: #ef4444;
		color: #fff;
	}
	.create-request-btn {
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--accent);
		background: var(--accent);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		margin-bottom: 16px;
	}
	.request-form {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}
	.form-field {
		margin-bottom: 12px;
	}
	.form-field label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}
	.form-field input, .form-field textarea {
		width: 100%;
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
	}
	.form-field textarea {
		min-height: 60px;
		resize: vertical;
	}
	.form-error {
		color: #ef4444;
		font-size: 12px;
		margin-bottom: 8px;
	}
	.submit-btn {
		padding: 8px 20px;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
