<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';
	import { StatCard } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let stats = $state({ todaySessions: 0, activeStudents: 0, totalStudents: 0, unpaidInvoices: 0 });

	onMount(() => {
		if (!browser) return;
		loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/tutor/paket');
			const json = await res.json();
			if (json.success) stats = json.data || stats;
			else error = json.error || 'Gagal memuat statistik';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	const menuCards = [
		{ href: '/tutor/jadwal', icon: '📅', title: 'Jadwal Sesi', desc: 'Atur jadwal les privat mingguan' },
		{ href: '/tutor/siswa', icon: '👨‍🎓', title: 'Data Siswa', desc: 'Daftar siswa, paket, dan progres belajar' },
		{ href: '/tutor/keuangan', icon: '💰', title: 'Keuangan', desc: 'Tagihan, pembayaran, dan status invoice' },
	];
</script>

<svelte:head>
	<title>Tutor Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>📖 Tutor Dashboard</h1>
		<p class="subtitle">Panel manajemen les privat</p>
	</div>

	{#if loading}
		<Loading message="Memuat statistik..." />
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn btn-secondary btn-sm" onclick={loadStats}>🔄 Muat Ulang</button>
		</div>
	{:else}
		<div class="stats-grid">
			<StatCard icon="📅" value={stats.todaySessions} label="Sesi Hari Ini" />
			<StatCard icon="👨‍🎓" value={stats.activeStudents} label="Siswa Aktif" />
			<StatCard icon="👥" value={stats.totalStudents} label="Total Siswa" />
			<StatCard icon="💰" value={stats.unpaidInvoices} label="Tagihan Belum Dibayar" />
		</div>
	{/if}

	<div class="card-grid">
		{#each menuCards as card}
			<a href={card.href} class="nav-card">
				<div class="card-icon">{card.icon}</div>
				<div class="card-body">
					<h3>{card.title}</h3>
					<p>{card.desc}</p>
				</div>
				<div class="card-arrow">→</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 32px; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; color: var(--text); }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); display: flex; flex-direction: column; align-items: center; gap: 12px; }
	.error-msg { margin: 0; }

	.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 32px; }
	.stat-card {
		display: flex; flex-direction: column; align-items: center; gap: 6px;
		padding: 20px 16px; border-radius: 12px; border: 1px solid var(--border);
		background: var(--surface); text-align: center;
	}
	.stat-value { font-size: 32px; font-weight: 700; color: var(--accent); line-height: 1; }
	.stat-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }

	.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
	.nav-card {
		display: flex; align-items: center; gap: 16px;
		padding: 20px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; text-decoration: none; color: var(--text);
		transition: all 0.15s ease;
	}
	.nav-card:hover { border-color: var(--accent); background: rgba(94, 106, 210, 0.06); transform: translateY(-2px); }
	.card-icon { font-size: 32px; flex-shrink: 0; }
	.card-body { flex: 1; }
	.card-body h3 { margin: 0 0 4px; font-size: 16px; }
	.card-body p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
	.card-arrow { font-size: 18px; color: var(--text-tertiary); transition: transform 0.15s ease; }
	.nav-card:hover .card-arrow { transform: translateX(4px); color: var(--accent); }
</style>
