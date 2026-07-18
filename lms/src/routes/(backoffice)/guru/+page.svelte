<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, Loading } from '$lib/components/ui/index.js';

	let user: any = $state(null);
	let loading = $state(true);

	onMount(() => {
		if (!browser) return;
		loadUser();
	});

	async function loadUser() {
		loading = true;
		try {
			const res = await fetch('/api/auth/me');
			const json = await res.json();
			if (json.success) user = json.data;
		} catch { /* ignore */ }
		finally { loading = false; }
	}

	const menuCards = [
		{ href: '/guru/kelas', icon: '📚', title: 'Kelas Saya', desc: 'Lihat daftar kelas dan mata pelajaran yang Anda ajar' },
		{ href: '/guru/nilai', icon: '📝', title: 'Input Nilai', desc: 'Masukkan nilai Pengetahuan, Keterampilan, dan Sikap' },
		{ href: '/guru/rekap', icon: '📊', title: 'Rekap Nilai', desc: 'Lihat rekap nilai per siswa' },
	];
</script>

<svelte:head>
	<title>Dashboard Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>Dashboard Guru</h1>
		<p class="subtitle">
			{#if user}
				Selamat datang, {user.display_name || user.username || 'Guru'}
			{:else}
				Panel guru
			{/if}
		</p>
	</div>

	{#if loading}
		<Loading message={t('common.loading')} />
	{:else}
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
	{/if}
</div>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 32px; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; color: var(--text); }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
	}

	.nav-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s ease;
	}
	.nav-card:hover {
		border-color: var(--accent);
		background: rgba(94, 106, 210, 0.06);
		transform: translateY(-2px);
	}
	.card-icon { font-size: 32px; flex-shrink: 0; }
	.card-body { flex: 1; }
	.card-body h3 { margin: 0 0 4px; font-size: 16px; }
	.card-body p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
	.card-arrow { font-size: 18px; color: var(--text-tertiary); transition: transform 0.15s ease; }
	.nav-card:hover .card-arrow { transform: translateX(4px); color: var(--accent); }
</style>
