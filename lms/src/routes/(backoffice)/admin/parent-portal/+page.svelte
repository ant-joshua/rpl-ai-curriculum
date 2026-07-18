<script lang="ts">
	import { onMount } from 'svelte';
	import { StatCard } from '$lib/components/ui';

	type Message = {
		id: string;
		senderId: string;
		senderName: string;
		senderRole: string;
		subject: string | null;
		body: string;
		isRead: number;
		createdAt: string | null;
	};

	type Stats = {
		totalParents: number;
		totalLinks: number;
		totalMessages: number;
		recentMessages: Message[];
	};

	let stats = $state<Stats | null>(null);
	let loading = $state(true);
	let error = $state('');

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/parent-portal/stats');
			const json = await res.json();
			if (json.success) {
				stats = json.data;
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	onMount(loadStats);
</script>

<div class="pp-dashboard">
	<div class="pp-header">
		<h1 class="pp-title">Parent Portal</h1>
		<p class="pp-subtitle">Dashboard manajemen akses orang tua</p>
	</div>

	{#if loading}
		<div class="pp-loading">
			<div class="pp-spinner"></div>
			<p>Memuat data...</p>
		</div>
	{:else if error}
		<div class="pp-error">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
			<p>{error}</p>
			<button class="pp-btn pp-btn-ghost" onclick={loadStats}>Coba Lagi</button>
		</div>
	{:else if stats}
		<div class="pp-stats-grid">
			<StatCard icon="👥" value={stats.totalParents} label="Orang Tua Terdaftar" color="#7170ff" />
			<StatCard icon="🔗" value={stats.totalLinks} label="Tautan Siswa Aktif" color="#10b981" />
			<StatCard icon="💬" value={stats.totalMessages} label="Total Pesan" color="#f59e0b" />
		</div>

		<div class="pp-section">
			<div class="pp-section-header">
				<h2 class="pp-section-title">Pesan Terbaru</h2>
				<a href="/admin/parent-portal/parents" class="pp-btn pp-btn-ghost pp-btn-sm">Kelola Orang Tua</a>
			</div>

			{#if stats.recentMessages && stats.recentMessages.length > 0}
				<div class="pp-table-wrap">
					<table class="pp-table">
						<thead>
							<tr>
								<th>Tanggal</th>
								<th>Pengirim</th>
								<th>Subjek</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recentMessages as msg}
								<tr>
									<td>{formatDate(msg.createdAt)}</td>
									<td>{msg.senderName || msg.senderId}</td>
									<td>{msg.subject || '(tanpa subjek)'}</td>
									<td>
										<span class="pp-badge" class:pp-badge-read={msg.isRead === 1} class:pp-badge-unread={msg.isRead === 0}>
											{msg.isRead === 1 ? 'Dibaca' : 'Baru'}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="pp-empty">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
					<p>Belum ada pesan</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pp-dashboard { display: flex; flex-direction: column; gap: 24px; }
	.pp-header { margin-bottom: 8px; }
	.pp-title { font-size: 24px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; letter-spacing: -0.3px; }
	.pp-subtitle { font-size: 13px; color: var(--text-secondary, #8a8f98); margin: 4px 0 0; }

	.pp-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }
	.pp-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, rgba(255,255,255,0.08)); border-top-color: var(--accent, #7170ff); border-radius: 50%; animation: pp-spin 0.7s linear infinite; }
	@keyframes pp-spin { to { transform: rotate(360deg); } }

	.pp-error { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #ef4444; text-align: center; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 10px; }

	.pp-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
	.pp-stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; transition: border-color 0.15s; }
	.pp-stat-card:hover { border-color: rgba(255,255,255,0.12); }
	.pp-stat-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
	.pp-stat-parents .pp-stat-icon { background: rgba(113, 112, 255, 0.1); color: #7170ff; }
	.pp-stat-links .pp-stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
	.pp-stat-messages .pp-stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
	.pp-stat-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.pp-stat-label { font-size: 12px; color: var(--text-secondary, #8a8f98); font-weight: 500; }
	.pp-stat-value { font-size: 18px; font-weight: 600; color: var(--text-primary, #f7f8f8); letter-spacing: -0.3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.pp-section { background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; overflow: hidden; }
	.pp-section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); }
	.pp-section-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }

	.pp-table-wrap { overflow-x: auto; }
	.pp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.pp-table th { text-align: left; padding: 10px 20px; font-size: 11px; font-weight: 600; color: var(--text-secondary, #8a8f98); text-transform: uppercase; letter-spacing: 0.04em; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); white-space: nowrap; }
	.pp-table td { padding: 12px 20px; color: var(--text-primary, #d0d6e0); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.04)); white-space: nowrap; }
	.pp-table tbody tr:hover { background: rgba(255,255,255,0.02); }

	.pp-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
	.pp-badge-unread { background: rgba(113, 112, 255, 0.12); color: #7170ff; }
	.pp-badge-read { background: rgba(156, 163, 175, 0.12); color: #9ca3af; }

	.pp-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 20px; color: var(--text-secondary, #8a8f98); }

	.pp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
	.pp-btn-ghost { background: transparent; color: var(--accent, #7170ff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
	.pp-btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.pp-btn-sm { padding: 5px 12px; font-size: 12px; }

	@media (max-width: 640px) { .pp-stats-grid { grid-template-columns: 1fr; } }
</style>
