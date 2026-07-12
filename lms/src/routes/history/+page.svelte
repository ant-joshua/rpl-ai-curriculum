<script lang="ts">
	import { onMount } from 'svelte';
	import { activity, type ActivityEntry } from '$lib/stores/activity.svelte';
	import { modules } from '$lib/stores/modules';

	let entries = $state<ActivityEntry[]>([]);
	let filter = $state<'all' | 'view' | 'complete'>('all');
	let showConfirm = $state(false);

	function relativeTime(ts: number): string {
		const diff = Date.now() - ts;
		const sec = Math.floor(diff / 1000);
		if (sec < 60) return 'baru saja';
		const min = Math.floor(sec / 60);
		if (min < 60) return `${min} menit lalu`;
		const hour = Math.floor(min / 60);
		if (hour < 24) return `${hour} jam lalu`;
		const day = Math.floor(hour / 24);
		return `${day} hari lalu`;
	}

	function actionIcon(action: ActivityEntry['action']): string {
		if (action === 'view') return '👁️';
		if (action === 'complete') return '✅';
		return '🧪';
	}

	function actionLabel(action: ActivityEntry['action']): string {
		if (action === 'view') return 'Melihat';
		if (action === 'complete') return 'Menyelesaikan';
		return 'Mengerjakan Quiz';
	}

	function moduleName(slug: string): string {
		const mod = modules.find(m => m.slug === slug);
		return mod?.title ?? slug;
	}

	function sessionName(slug: string, sessionId?: string): string {
		if (!sessionId) return '';
		const mod = modules.find(m => m.slug === slug);
		if (!mod) return '';
		const sess = mod.sessions.find(s => s.id === sessionId);
		return sess?.title ?? sessionId;
	}

	let filtered = $derived(
		filter === 'all'
			? entries
			: entries.filter(e => e.action === filter)
	);

	function refresh() {
		entries = activity.getRecent(100);
	}

	function handleClear() {
		activity.clearAll();
		showConfirm = false;
		refresh();
	}

	onMount(refresh);

	// Reactive refresh on version change
	$effect(() => {
		void activity.version;
		refresh();
	});
</script>

<div class="history-page">
	<div class="history-header">
		<h1>📜 Riwayat Aktivitas</h1>
		{#if entries.length > 0}
			<button class="clear-btn" onclick={() => showConfirm = true}>
				🗑️ Hapus Riwayat
			</button>
		{/if}
	</div>

	<div class="filter-tabs">
		<button
			class="filter-tab"
			class:active={filter === 'all'}
			onclick={() => filter = 'all'}
		>Semua</button>
		<button
			class="filter-tab"
			class:active={filter === 'view'}
			onclick={() => filter = 'view'}
		>👁️ Dilihat</button>
		<button
			class="filter-tab"
			class:active={filter === 'complete'}
			onclick={() => filter = 'complete'}
		>✅ Selesai</button>
	</div>

	{#if showConfirm}
		<div class="confirm-overlay" onclick={() => showConfirm = false} role="button" tabindex="-1"></div>
		<div class="confirm-dialog">
			<p>Hapus seluruh riwayat aktivitas?</p>
			<div class="confirm-actions">
				<button class="confirm-cancel" onclick={() => showConfirm = false}>Batal</button>
				<button class="confirm-yes" onclick={handleClear}>Ya, Hapus</button>
			</div>
		</div>
	{/if}

	<div class="activity-list">
		{#if filtered.length === 0}
			<div class="empty-state">
				<span class="empty-icon">📭</span>
				<p>Belum ada aktivitas</p>
			</div>
		{:else}
			{#each filtered as entry (entry.id)}
				<div class="activity-item">
					<span class="activity-icon">{actionIcon(entry.action)}</span>
					<div class="activity-info">
						<span class="activity-action">{actionLabel(entry.action)}</span>
						<span class="activity-module">{moduleName(entry.moduleSlug)}</span>
						{#if entry.sessionId}
							{@const sName = sessionName(entry.moduleSlug, entry.sessionId)}
							{#if sName}
								<span class="activity-session">— {sName}</span>
							{/if}
						{/if}
					</div>
					<span class="activity-time">{relativeTime(entry.timestamp)}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.history-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.history-header h1 {
		font-size: 22px;
		font-weight: 700;
	}

	.clear-btn {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--danger, #ef4444);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-btn:hover {
		background: rgba(239, 68, 68, 0.08);
		border-color: var(--danger, #ef4444);
	}

	.filter-tabs {
		display: flex;
		gap: 6px;
		margin-bottom: 20px;
	}

	.filter-tab {
		padding: 8px 18px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-tab:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.filter-tab.active {
		background: var(--accent-dim);
		border-color: var(--accent);
		color: var(--accent);
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid transparent;
		transition: all 0.15s ease;
	}

	.activity-item:hover {
		border-color: var(--border);
	}

	.activity-icon {
		font-size: 20px;
		width: 32px;
		text-align: center;
		flex-shrink: 0;
	}

	.activity-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 6px;
	}

	.activity-action {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.activity-module {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.activity-session {
		font-size: 13px;
		color: var(--text-secondary);
		font-style: italic;
	}

	.activity-time {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: 12px;
	}

	.empty-state p {
		font-size: 16px;
	}

	.confirm-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 500;
	}

	.confirm-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		z-index: 501;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		min-width: 300px;
		text-align: center;
	}

	.confirm-dialog p {
		font-size: 15px;
		margin-bottom: 20px;
		color: var(--text);
	}

	.confirm-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	.confirm-cancel,
	.confirm-yes {
		padding: 8px 20px;
		border-radius: 8px;
		border: 1px solid var(--border);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.confirm-cancel {
		background: var(--surface);
		color: var(--text-secondary);
	}

	.confirm-cancel:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.confirm-yes {
		background: var(--danger, #ef4444);
		color: #fff;
		border-color: var(--danger, #ef4444);
	}

	.confirm-yes:hover {
		opacity: 0.9;
	}
</style>
