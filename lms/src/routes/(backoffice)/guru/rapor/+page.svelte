<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Skeleton, EmptyState, Badge, Select } from '$lib/components/ui/index.js';

	let classes: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	onMount(() => {
		if (!browser) return;
		loadClasses();
	});

	async function loadClasses() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/rapor/kelas?semester=${selectedSemester}`);
			const json = await res.json();
			if (json.success) classes = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal memuat data kelas'; }
		finally { loading = false; }
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	function getStatusColor(status: string): string {
		if (status === 'finalized') return '#10b981';
		if (status === 'printed') return '#3b82f6';
		return 'var(--text-quaternary)';
	}

	function getStatusLabel(status: string): string {
		if (status === 'finalized') return 'Finalized';
		if (status === 'printed') return 'Printed';
		return 'Draft';
	}
</script>

<svelte:head>
	<title>Rapor — Wali Kelas — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/guru">← Dashboard Guru</a></div>
			<h1>📄 Rapor — Wali Kelas</h1>
			<p class="subtitle">Daftar kelas yang Anda ampu sebagai wali kelas</p>
		</div>
		<div class="header-actions">
			<Select options={[{ value:'1', label:'Semester Ganjil' }, { value:'2', label:'Semester Genap' }]} bind:value={selectedSemester} onchange={() => loadClasses()} />
		</div>
	</div>

	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if classes.length === 0}
		<EmptyState icon="📚" message="Belum ada kelas wali." description="Anda belum ditugaskan sebagai wali kelas. Hubungi admin untuk penugasan." />
	{:else}
		<div class="class-list">
			{#each classes as cls}
				<a href="/guru/rapor/{cls.id}" class="class-card">
					<div class="card-top">
						<span class="class-name">{cls.name || cls.class_name}</span>
						<Badge variant={selectedSemester === '1' ? 'primary' : 'info'}>{getSemesterLabel(selectedSemester)}</Badge>
					</div>
					<div class="card-detail">
						{#if cls.grade_level_name}
							<span class="grade-level">{cls.grade_level_name}</span>
						{/if}
						{#if cls.major_name}
							<span class="major-name">{cls.major_name}</span>
						{/if}
					</div>
					<div class="card-footer">
						{#if cls.rapor_count != null}
							<span class="rapor-count" style="color: {getStatusColor(cls.status)}">
								{cls.rapor_count} rapor · {getStatusLabel(cls.status || 'draft')}
							</span>
						{/if}
						<span class="enter-link">Kelola Rapor →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 800px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.class-list { display: flex; flex-direction: column; gap: 8px; }

	.class-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s ease;
	}
	.class-card:hover {
		border-color: var(--accent);
		background: rgba(79, 70, 229, 0.06);
		transform: translateX(4px);
	}

	.card-top { display: flex; justify-content: space-between; align-items: center; }
	.class-name { font-size: 16px; font-weight: 600; }

	.card-detail { display: flex; align-items: center; gap: 8px; }
	.grade-level { font-size: 12px; color: var(--text-quaternary); background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px; }
	.major-name { font-size: 13px; color: var(--text-secondary); }

	.card-footer { display: flex; justify-content: space-between; align-items: center; }
	.rapor-count { font-size: 12px; font-weight: 500; }
	.enter-link { font-size: 13px; color: var(--accent); font-weight: 500; }
</style>
