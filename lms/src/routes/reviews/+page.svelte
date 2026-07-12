<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user.svelte';
	import { api } from '$lib/utils/api';

	let tab = $state<'request' | 'review'>('request');
	let requests = $state<any[]>([]);
	let loading = $state(true);
	let selectedRequest = $state<any>(null);
	let showDetail = $state(false);

	// Form state
	let exerciseSlug = $state('');
	let code = $state('');
	let submitting = $state(false);
	let submitError = $state('');

	// Review form
	let feedback = $state('');
	let score = $state(5);
	let reviewSubmitting = $state(false);

	const exercises = ['js-basics', 'html-css', 'react-component', 'python-functions', 'sql-queries', 'api-design'];

	onMount(() => {
		loadRequests();
	});

	async function loadRequests() {
		loading = true;
		const filter = tab === 'request' ? 'mine' : 'open';
		const res = await api<any[]>(`/api/reviews?filter=${filter}`);
		if (res.success && res.data) {
			requests = res.data;
		}
		loading = false;
	}

	function switchTab(newTab: 'request' | 'review') {
		tab = newTab;
		showDetail = false;
		selectedRequest = null;
		loadRequests();
	}

	async function handleSubmit() {
		if (!exerciseSlug.trim() || !code.trim()) return;
		submitting = true;
		submitError = '';
		const res = await api('/api/reviews', {
			method: 'POST',
			body: JSON.stringify({ exercise_slug: exerciseSlug.trim(), code }),
		});
		submitting = false;
		if (res.success) {
			exerciseSlug = '';
			code = '';
			await loadRequests();
		} else {
			submitError = res.error || 'Gagal mengirim';
		}
	}

	async function openDetail(req: any) {
		selectedRequest = req;
		showDetail = true;
		feedback = '';
		score = 5;
		// Fetch detail with reviews
		const res = await api<any>(`/api/reviews/${req.id}`);
		if (res.success && res.data) {
			selectedRequest = res.data;
		}
	}

	async function submitReview() {
		if (!feedback.trim()) return;
		reviewSubmitting = true;
		const res = await api(`/api/reviews/${selectedRequest.id}`, {
			method: 'POST',
			body: JSON.stringify({ feedback: feedback.trim(), score }),
		});
		reviewSubmitting = false;
		if (res.success) {
			showDetail = false;
			selectedRequest = null;
			await loadRequests();
		}
	}
</script>

<div class="reviews-page">
	<h1>🔍 Peer Code Review</h1>
	<p class="subtitle">Minta review kode atau review kode teman</p>

	<div class="tab-bar">
		<button class="tab-btn" class:active={tab === 'request'} onclick={() => switchTab('request')}>
			📝 Minta Review
		</button>
		<button class="tab-btn" class:active={tab === 'review'} onclick={() => switchTab('review')}>
			👀 Review Teman
		</button>
	</div>

	{#if showDetail && selectedRequest}
		<div class="detail-view">
			<button class="back-btn" onclick={() => { showDetail = false; selectedRequest = null; }}>← Kembali</button>
			<div class="code-display">
				<h3>📁 {selectedRequest.exercise_slug}</h3>
				<p class="author-label">oleh {selectedRequest.author_name || selectedRequest.user_id?.slice(0, 8)}</p>
				<pre class="code-block"><code>{selectedRequest.code}</code></pre>
			</div>

			{#if selectedRequest.reviews && selectedRequest.reviews.length > 0}
				<div class="existing-reviews">
					<h4>Review yang sudah diberikan</h4>
					{#each selectedRequest.reviews as rev}
						<div class="review-card">
							<div class="review-header">
								<span class="reviewer">{rev.reviewer_name || rev.reviewer_id?.slice(0, 8)}</span>
								<span class="review-score">Nilai: {rev.score ?? '-'}/10</span>
							</div>
							<p class="review-feedback">{rev.feedback}</p>
						</div>
					{/each}
				</div>
			{:else if tab === 'review'}
				<div class="review-form">
					<h4>Beri Review</h4>
					<div class="form-field">
						<label for="feedback">Feedback</label>
						<textarea id="feedback" bind:value={feedback} placeholder="Tulis review konstruktif..."></textarea>
					</div>
					<div class="form-field">
						<label for="score">Nilai (1-10)</label>
						<input id="score" type="range" min="1" max="10" bind:value={score} />
						<span class="score-value">{score}/10</span>
					</div>
					<button class="submit-btn" onclick={submitReview} disabled={reviewSubmitting || !feedback.trim()}>
						{reviewSubmitting ? 'Mengirim...' : 'Kirim Review'}
					</button>
				</div>
			{/if}
		</div>
	{:else if tab === 'request'}
		<div class="request-section">
			<div class="submit-form">
				<h3>Kirim Kode untuk Review</h3>
				<div class="form-field">
					<label for="ex-slug">Exercise</label>
					<select id="ex-slug" bind:value={exerciseSlug}>
						<option value="">Pilih exercise...</option>
						{#each exercises as ex}
							<option value={ex}>{ex}</option>
						{/each}
					</select>
				</div>
				<div class="form-field">
					<label for="code-input">Kode</label>
					<textarea id="code-input" bind:value={code} placeholder="Tempel kode kamu di sini..." rows="8"></textarea>
				</div>
				{#if submitError}
					<p class="form-error">{submitError}</p>
				{/if}
				<button class="submit-btn" onclick={handleSubmit} disabled={submitting || !exerciseSlug || !code.trim()}>
					{submitting ? 'Mengirim...' : 'Kirim'}
				</button>
			</div>

			<div class="my-requests">
				<h3>Review Saya</h3>
				{#if loading}
					<p class="loading-text">Memuat...</p>
				{:else if requests.length === 0}
					<p class="empty-state">Belum ada permintaan review.</p>
				{:else}
					{#each requests as req}
						<div class="request-card" onclick={() => openDetail(req)}>
							<div class="req-info">
								<span class="req-exercise">📁 {req.exercise_slug}</span>
								<span class="req-status" class:open={req.status === 'open'} class:closed={req.status === 'closed'}>
									{req.status === 'open' ? '⏳ Open' : '✅ Closed'}
								</span>
							</div>
							{#if req.review_count > 0}
								<span class="req-count">{req.review_count} review</span>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<div class="review-section">
			{#if loading}
				<p class="loading-text">Memuat...</p>
			{:else if requests.length === 0}
				<p class="empty-state">Belum ada permintaan review dari teman.</p>
			{:else}
				{#each requests as req}
					<div class="request-card" onclick={() => openDetail(req)}>
						<div class="req-info">
							<span class="req-exercise">📁 {req.exercise_slug}</span>
							<span class="req-author">👤 {req.author_name || req.user_id?.slice(0, 8)}</span>
						</div>
						<span class="req-arrow">→</span>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.reviews-page {
		max-width: 700px;
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
	.back-btn {
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		cursor: pointer;
		font-family: inherit;
		margin-bottom: 16px;
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
	.submit-form {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
	}
	.submit-form h3 {
		font-size: 16px;
		margin-bottom: 16px;
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
	.form-field select, .form-field input, .form-field textarea {
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
		resize: vertical;
		font-family: 'Menlo', 'Fira Code', monospace;
		font-size: 13px;
	}
	.score-value {
		display: inline-block;
		margin-left: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
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
	.my-requests h3, .review-section h3 {
		font-size: 16px;
		margin-bottom: 12px;
	}
	.request-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		margin-bottom: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: border-color 0.15s ease;
	}
	.request-card:hover {
		border-color: var(--accent);
	}
	.req-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.req-exercise {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.req-author {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.req-status {
		font-size: 11px;
		font-weight: 600;
	}
	.req-status.open { color: var(--accent); }
	.req-status.closed { color: #22c55e; }
	.req-count {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.req-arrow {
		font-size: 18px;
		color: var(--text-secondary);
	}
	.detail-view {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}
	.code-display h3 {
		font-size: 16px;
		margin-bottom: 2px;
	}
	.author-label {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}
	.code-block {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		font-size: 13px;
		font-family: 'Menlo', 'Fira Code', monospace;
		line-height: 1.5;
		color: var(--text);
		margin-bottom: 20px;
	}
	.existing-reviews h4 {
		font-size: 14px;
		margin-bottom: 12px;
	}
	.review-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 8px;
	}
	.review-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 6px;
	}
	.reviewer {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
	}
	.review-score {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.review-feedback {
		font-size: 13px;
		color: var(--text);
	}
	.review-form {
		margin-top: 20px;
		border-top: 1px solid var(--border);
		padding-top: 20px;
	}
	.review-form h4 {
		font-size: 14px;
		margin-bottom: 12px;
	}
</style>
