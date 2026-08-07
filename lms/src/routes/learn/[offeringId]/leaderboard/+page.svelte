<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PageHeader, Card, CardContent, Spinner, EmptyState } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let entries: any[] = $state([]);
	let period = $state('all');
	let currentUserId = $state('');
	let offeringName = $state('');

	const offeringId = $derived($page.params.offeringId || '');

	async function loadLeaderboard() {
		loading = true;
		error = '';
		try {
			const token = localStorage.getItem('token') || '';
			const res = await fetch(`/api/gamification/leaderboard?offeringId=${offeringId}&period=${period}&limit=30`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			if (!json.success) { error = json.error || 'Gagal memuat'; return; }
			entries = json.data?.entries || [];
			offeringName = json.data?.offeringName || '';
		} catch { error = 'Network error'; } finally { loading = false; }
	}

	onMount(() => {
		if (!browser) return;
		loadLeaderboard();
	});

	const periods = [
		{ value: 'all', label: 'Semua Waktu' },
		{ value: 'daily', label: 'Hari Ini' },
		{ value: 'weekly', label: 'Minggu Ini' },
	];

	function medal(i: number): string {
		if (i === 0) return '🥇';
		if (i === 1) return '🥈';
		if (i === 2) return '🥉';
		return `${i + 1}`;
	}
</script>

<svelte:head>
	<title>Papan Peringkat — LMS RPL</title>
</svelte:head>

<div class="lb-page">
	<PageHeader title="🏆 Papan Peringkat" subtitle={offeringName || 'Kelas'} />

	<div class="lb-controls">
		{#each periods as p}
			<button
				class="period-btn {period === p.value ? 'active' : ''}"
				onclick={() => { period = p.value; loadLeaderboard(); }}
			>{p.label}</button>
		{/each}
	</div>

	{#if loading}
		<div class="center"><Spinner /></div>
	{:else if error}
		<Card><CardContent><p class="error-text">{error}</p></CardContent></Card>
	{:else if entries.length === 0}
		<EmptyState icon="award" title="Belum ada peringkat" description="Kerjakan quiz dan materi untuk mendapatkan XP!" />
	{:else}
		<div class="lb-list">
			{#each entries as e, i}
				<div class="lb-row {i < 3 ? 'top' : ''} {e.userId === currentUserId ? 'me' : ''}">
					<span class="lb-rank">{medal(i)}</span>
					<span class="lb-avatar">{e.avatar ? '' : '🧑‍🎓'}</span>
					<span class="lb-name">
						{e.displayName || e.username || 'Siswa'}
						{#if e.userId === currentUserId}<span class="lb-me-tag">Anda</span>{/if}
					</span>
					<span class="lb-xp">⭐ {e.xp} XP</span>
					{#if e.level}<span class="lb-level">Lv {e.level}</span>{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.lb-page { max-width: 760px; margin: 0 auto; padding: 24px 20px; }
	.center { display: flex; justify-content: center; padding: 60px; }
	.error-text { color: #dc2626; }

	.lb-controls { display: flex; gap: 8px; margin-bottom: 16px; }
	.period-btn {
		padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border);
		background: var(--surface); cursor: pointer; font-size: 13px; font-weight: 500;
		transition: all 0.15s;
	}
	.period-btn.active { background: var(--accent); color: white; border-color: var(--accent); }

	.lb-list { display: flex; flex-direction: column; gap: 8px; }
	.lb-row {
		display: flex; align-items: center; gap: 12px;
		padding: 12px 16px; background: var(--surface);
		border: 1px solid var(--border); border-radius: 10px;
	}
	.lb-row.top { background: linear-gradient(135deg, #fffbeb, #fef3c7); border-color: #fcd34d; }
	.lb-row.me { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(79,70,229,0.15); }
	.lb-rank { width: 36px; font-size: 18px; font-weight: 700; text-align: center; }
	.lb-avatar { font-size: 20px; }
	.lb-name { flex: 1; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
	.lb-me-tag { font-size: 10px; background: var(--accent); color: white; padding: 2px 8px; border-radius: 999px; }
	.lb-xp { font-weight: 700; color: #b45309; font-size: 14px; }
	.lb-level { font-size: 12px; color: var(--text-secondary); background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }

	@media (max-width: 600px) {
		.lb-level { display: none; }
		.lb-xp { font-size: 12px; }
	}
</style>
