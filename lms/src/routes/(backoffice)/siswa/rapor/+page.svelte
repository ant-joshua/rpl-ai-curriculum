<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

	let raporList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	onMount(() => {
		if (!browser) return;
		loadRapor();
	});

	async function loadRapor() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/siswa/rapor?semester=${selectedSemester}`);
			const json = await res.json();
			if (json.success) raporList = json.data || [];
			else error = json.error || 'Gagal memuat rapor';
		} catch { error = 'Gagal memuat data rapor'; }
		finally { loading = false; }
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	function statusVariant(status: string): 'success' | 'primary' | 'outline' {
		if (status === 'finalized') return 'success';
		if (status === 'printed') return 'primary';
		return 'outline';
	}

	function getStatusLabel(status: string): string {
		if (status === 'finalized') return 'Finalized';
		if (status === 'printed') return 'Printed';
		return 'Draft';
	}
</script>

<svelte:head>
	<title>Rapor Saya — Siswa — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>📄 Rapor Saya</h1>
			<p class="subtitle">Lihat rapor pembelajaran Anda per semester</p>
		</div>
		<div class="header-actions">
			<select class="sem-select" bind:value={selectedSemester} onchange={() => loadRapor()}>
				<option value="1">Semester Ganjil</option>
				<option value="2">Semester Genap</option>
			</select>
		</div>
	</div>

	{#if loading}
		<Loading message="Memuat rapor..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if raporList.length === 0}
		<EmptyState icon="📄" message="Belum ada rapor tersedia." description="Rapor akan muncul setelah guru wali kelas meng-generate-nya." />
	{:else}
		<div class="rapor-list">
			{#each raporList as r}
				<a href="/siswa/rapor/{r.semester}" class="rapor-card">
					<div class="card-left">
						<div class="card-icon">📄</div>
					</div>
					<div class="card-body">
						<h3 class="card-title">Semester {getSemesterLabel(String(r.semester))}</h3>
						<p class="card-detail">
							{#if r.academic_year || r.tahun_ajaran}
								<span>{r.academic_year || r.tahun_ajaran}</span>
								<span class="detail-sep">·</span>
							{/if}
							<span>{r.class_name}</span>
						</p>
					</div>
					<div class="card-right">
						<Badge variant={statusVariant(r.status)}>
							{getStatusLabel(r.status)}
						</Badge>
						<span class="card-arrow">→</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 700px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.rapor-list { display: flex; flex-direction: column; gap: 8px; }

	.rapor-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s ease;
	}
	.rapor-card:hover {
		border-color: var(--accent);
		background: rgba(94, 106, 210, 0.06);
		transform: translateX(4px);
	}

	.card-left { flex-shrink: 0; }
	.card-icon { font-size: 28px; }

	.card-body { flex: 1; }
	.card-title { margin: 0 0 4px; font-size: 16px; font-weight: 600; }
	.card-detail { margin: 0; font-size: 13px; color: var(--text-secondary); display: flex; gap: 4px; align-items: center; }
	.detail-sep { color: var(--text-quaternary); }

	.card-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
	.card-arrow { font-size: 16px; color: var(--text-tertiary); transition: transform 0.15s ease; }
	.rapor-card:hover .card-arrow { transform: translateX(4px); color: var(--accent); }
</style>
