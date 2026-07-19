<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

	let classes: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadClasses();
	});

	async function loadClasses() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/guru/kelas');
			const json = await res.json();
			if (json.success) classes = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal memuat data kelas'; }
		finally { loading = false; }
	}

	function getSemesterLabel(s: string | null): string {
		if (!s) return '-';
		if (s === '1') return 'Ganjil';
		if (s === '2') return 'Genap';
		return s;
	}
</script>

<svelte:head>
	<title>Kelas Saya — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/guru">← Dashboard Guru</a></div>
			<h1>📚 Kelas Saya</h1>
			<p class="subtitle">Daftar kelas dan mata pelajaran yang Anda ajar</p>
		</div>
	</div>

	{#if loading}
		<Loading message="Memuat kelas..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if classes.length === 0}
		<EmptyState icon="📚" message="Belum ada kelas yang ditugaskan." description="Hubungi admin untuk penugasan kelas." />
	{:else}
		<div class="class-list">
			{#each classes as cs}
				<a href="/guru/nilai/{cs.id}" class="class-card">
					<div class="card-top">
						<span class="class-name">{cs.class_name}</span>
						<Badge variant="primary">{getSemesterLabel(cs.semester)}</Badge>
					</div>
					<div class="card-subject">
						<span class="subject-name">{cs.subject_name}</span>
						{#if cs.grade_level_name}
							<span class="grade-level">{cs.grade_level_name}</span>
						{/if}
					</div>
					<div class="card-footer">
						<span class="enter-link">Input Nilai →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 24px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
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

	.card-subject { display: flex; align-items: center; gap: 8px; }
	.subject-name { font-size: 14px; color: var(--text-secondary); }
	.grade-level { font-size: 12px; color: var(--text-quaternary); background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px; }

	.card-footer { display: flex; justify-content: flex-end; }
	.enter-link { font-size: 13px; color: var(--accent); font-weight: 500; }
</style>
