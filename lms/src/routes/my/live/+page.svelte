<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { EmptyState, Spinner, Card, CardContent } from '$lib/components/ui';

	let sessions = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		if (!browser) return;
		await loadSessions();
	});

	async function loadSessions() {
		loading = true;
		try {
			// Get user's enrolled offerings live classes
			const res = await fetch('/api/my/live');
			const json = await res.json();
			if (json.success) sessions = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	function statusLabel(s: string): string {
		return s === 'live' ? '● LIVE' : s === 'scheduled' ? 'Terjadwal' : s === 'ended' ? 'Selesai' : 'Dibatalkan';
	}

	function fmtDate(dt: string): string {
		if (!dt) return '';
		return dt.replace('T', ' ').slice(0, 16);
	}

	function canJoin(s: any): boolean {
		return s.status === 'live' || (s.status === 'scheduled' && new Date(s.start_at) <= new Date(Date.now() + 15 * 60000));
	}
</script>

<svelte:head>
	<title>Kelas Live — RPL AI Curriculum</title>
</svelte:head>

<div class="live-page">
	<header class="page-header">
		<h1>📺 Kelas Live</h1>
		<p class="page-subtitle">Sesi live dari kursus yang kamu ikuti</p>
	</header>

	{#if loading}
		<div class="loading"><Spinner /> Memuat jadwal live...</div>
	{:else if sessions.length === 0}
		<EmptyState
			icon="video"
			title="Belum ada kelas live"
			description="Kelas live dari kursusmu akan muncul di sini."
		/>
	{:else}
		<div class="live-list">
			{#each sessions as s}
				<Card>
					<CardContent>
						<div class="live-item">
							<div class="live-left">
								<div class="live-badge" class:live-now={s.status === 'live'} class:live-scheduled={s.status === 'scheduled'}>
									{statusLabel(s.status)}
								</div>
								<h3 class="live-title">{s.title}</h3>
								{#if s.description}
									<p class="live-desc">{s.description}</p>
								{/if}
								<div class="live-meta">
									<span>📅 {fmtDate(s.start_at)}</span>
									<span>⏱️ {s.duration_minutes} menit</span>
									<span>📚 {s.offering_name || ''}</span>
									{#if s.instructor_name}
										<span>👨‍🏫 {s.instructor_name}</span>
									{/if}
								</div>
							</div>
							<div class="live-right">
								{#if s.status === 'live' && s.join_url}
									<a class="live-btn primary" href={s.join_url} target="_blank" rel="noopener">▶ Gabung Sekarang</a>
								{:else if s.status === 'scheduled' && canJoin(s) && s.join_url}
									<a class="live-btn primary" href={s.join_url} target="_blank" rel="noopener">▶ Gabung</a>
								{:else if s.status === 'scheduled'}
									<span class="live-soon">Segera</span>
								{:else if s.status === 'ended' && s.recording_url}
									<a class="live-btn" href={s.recording_url} target="_blank" rel="noopener">🎬 Rekaman</a>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.live-page { max-width: 860px; margin: 0 auto; padding: 24px 16px; }
	.page-header { margin-bottom: 20px; }
	.page-header h1 { margin: 0 0 4px; font-size: 24px; }
	.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.live-list { display: flex; flex-direction: column; gap: 12px; }
	.live-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
	.live-left { flex: 1; min-width: 260px; }
	.live-badge {
		display: inline-block; padding: 2px 10px; border-radius: 999px;
		font-size: 11px; font-weight: 700; text-transform: uppercase;
		background: #e2e8f0; color: #475569; margin-bottom: 6px;
	}
	.live-badge.live-now { background: #fee2e2; color: #dc2626; animation: pulse 1.5s infinite; }
	.live-badge.live-scheduled { background: #dbeafe; color: #2563eb; }
	@keyframes pulse { 50% { opacity: 0.6; } }
	.live-title { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
	.live-desc { font-size: 13px; color: var(--text-muted); margin: 0 0 8px; }
	.live-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-muted); }
	.live-right { flex-shrink: 0; }
	.live-btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		background: #f1f5f9; color: #334155; font-size: 13px; font-weight: 600;
		text-decoration: none; border: 1px solid #e2e8f0;
	}
	.live-btn.primary { background: #2563eb; color: white; border-color: #2563eb; }
	.live-btn.primary:hover { background: #1d4ed8; }
	.live-soon { font-size: 12px; color: var(--text-muted); font-weight: 600; }
</style>
