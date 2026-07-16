<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading } from '$lib/components/ui/index.js';

	let loading = $state(true);
	let error = $state('');
	let stats = $state({ activeBatches: 0, totalStudents: 0, upcomingTryouts: 0, unpaidInvoices: 0 });

	onMount(() => {
		if (!browser) return;
		loadStats();
	});

	async function loadStats() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/bimbel/batch');
			const json = await res.json();
			if (json.success) stats = json.data || stats;
			else error = json.error || 'Gagal memuat statistik';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	const menuCards = [
		{ href: '/bimbel/batch', icon: '📦', title: 'Batch', desc: 'Kelola grup bimbel dan daftar siswa' },
		{ href: '/bimbel/tryout', icon: '📝', title: 'Try Out', desc: 'Buat dan kelola try out, lihat ranking' },
		{ href: '/bimbel/keuangan', icon: '💰', title: 'Keuangan', desc: 'Tagihan dan pembayaran bimbel' },
	];
</script>

<svelte:head>
	<title>Bimbel Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>📚 Bimbel Dashboard</h1>
		<p class="subtitle">Panel manajemen bimbingan belajar</p>
	</div>

	{#if loading}
		<Loading message="Memuat statistik..." />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<button class="btn btn-secondary btn-sm" onclick={loadStats}>🔄 Muat Ulang</button>
		</div>
	{:else}
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-value">{stats.activeBatches}</span>
				<span class="stat-label">Batch Aktif</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{stats.totalStudents}</span>
				<span class="stat-label">Total Siswa</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{stats.upcomingTryouts}</span>
				<span class="stat-label">Try Out Mendatang</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{stats.unpaidInvoices}</span>
				<span class="stat-label">Tagihan Belum Dibayar</span>
			</div>
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
	.error-state p { margin: 0; }

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

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
