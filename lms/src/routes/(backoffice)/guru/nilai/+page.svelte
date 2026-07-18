<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	let { data }: { data: { assignments: any[] } } = $props();
</script>

<svelte:head>
	<title>Input Nilai — Guru</title>
</svelte:head>

<div class="page">
	<h2>{t('dosen.title')}</h2>

	{#if data.assignments.length === 0}
		<div class="empty-state">
			<p>Belum ada penugasan mengajar.</p>
			<p class="empty-hint">Hubungi admin untuk penugasan kelas</p>
		</div>
	{:else}
		<div class="assignment-grid">
			{#each data.assignments as a (a.id)}
				<a href="/guru/nilai/{a.id}" class="assignment-card">
					<div class="card-header">
						<span class="subject-name">{a.subject_name}</span>
						<span class="class-code">{a.class_code || a.class_name}</span>
					</div>
					<div class="card-body">
						<span class="class-name">{a.class_name}</span>
						<span class="semester">Semester {a.semester}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 24px; }
	h2 { margin: 0 0 20px; font-size: 20px; font-weight: 600; color: var(--text-primary); }
	.empty-state {
		text-align: center; padding: 60px 20px; color: var(--text-secondary);
	}
	.empty-hint { font-size: 13px; margin-top: 8px; color: var(--text-tertiary); }
	.assignment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
	.assignment-card {
		background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px;
		padding: 16px; text-decoration: none; display: block;
		transition: all 0.15s ease;
	}
	.assignment-card:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
	.card-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
	.subject-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
	.class-code { font-size: 12px; color: var(--text-secondary); background: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px; }
	.card-body { display: flex; flex-direction: column; gap: 4px; }
	.class-name { font-size: 13px; color: var(--text-secondary); }
	.semester { font-size: 12px; color: var(--text-tertiary); }
</style>
