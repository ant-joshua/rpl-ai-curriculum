<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();
	let offerings = $derived(data.offerings);

	async function enroll(offeringId: string) {
		const token = new URLSearchParams(window.location.search).get('token') || '';
		await fetch(`/api/my/enroll`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
			body: JSON.stringify({ offeringId })
		});
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Course Catalog — LMS RPL</title>
</svelte:head>

<div class="learn-page">
	<header class="page-header">
		<h1>Course Catalog</h1>
		<p>Daftar course yang tersedia. Enroll untuk mulai belajar.</p>
	</header>

	<div class="course-grid">
		{#each offerings as offering}
			<div class="course-card">
				<div class="card-icon">{offering.courseIcon}</div>
				<div class="card-body">
					<h2>{offering.courseTitle}</h2>
					<p class="offering-name">{offering.name}</p>
					<p class="desc">{offering.courseDescription || ''}</p>
					<div class="meta-row">
						{#if offering.category}<span class="badge">{offering.category}</span>{/if}
						{#if offering.level}<span class="badge">{offering.level}</span>{/if}
						<span class="badge">{offering.status}</span>
					</div>
				</div>
				<div class="card-footer">
					{#if offering.isEnrolled}
						<a href="/learn/{offering.id}/syllabus" class="btn primary">Lihat Silabus</a>
						<a href="/learn/{offering.id}" class="btn">Lanjut Belajar</a>
					{:else}
						<button onclick={() => enroll(offering.id)} class="btn primary">Enroll</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

{#if offerings.length === 0}
	<div class="empty-state">
		<p>Tidak ada course tersedia saat ini.</p>
	</div>
{/if}

<style>
	.learn-page { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; }
	.page-header { margin-bottom: 32px; }
	.page-header h1 { margin: 0 0 8px; font-size: 28px; color: var(--text-primary); }
	.page-header p { color: var(--text-secondary); font-size: 14px; margin: 0; }
	.course-grid { display: flex; flex-direction: column; gap: 16px; }
	.course-card {
		display: flex; gap: 20px; align-items: flex-start;
		background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
		padding: 24px; transition: transform 0.15s, box-shadow 0.15s;
	}
	.course-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
	.card-icon {
		font-size: 48px; width: 64px; height: 64px; flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
		background: var(--bg-primary); border-radius: 12px;
	}
	.card-body { flex: 1; min-width: 0; }
	.card-body h2 { margin: 0 0 4px; font-size: 18px; color: var(--text-primary); }
	.offering-name { font-size: 13px; color: var(--text-secondary); margin: 0 0 8px; }
	.desc { font-size: 13px; color: var(--text-secondary); margin: 0 0 12px; line-height: 1.5; }
	.meta-row { display: flex; flex-wrap: wrap; gap: 6px; }
	.badge {
		font-size: 11px; padding: 3px 8px; border-radius: 99px;
		background: var(--bg-primary); color: var(--text-secondary);
	}
	.card-footer { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
	.btn {
		display: inline-block; padding: 10px 20px; border-radius: 8px;
		font-size: 13px; font-weight: 600; text-decoration: none; text-align: center;
		border: 1px solid var(--border); color: var(--text-primary);
		background: var(--bg-primary); cursor: pointer;
	}
	.btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn:hover { opacity: 0.9; }
	.empty-state { text-align: center; padding: 64px 16px; color: var(--text-secondary); }

	@media (max-width: 640px) {
		.learn-page { padding: 20px 12px 48px; }
		.page-header h1 { font-size: 22px; }
		.course-card { flex-direction: column; gap: 12px; padding: 16px; }
		.card-icon { font-size: 40px; width: 56px; height: 56px; }
		.card-footer { width: 100%; }
		.btn { width: 100%; text-align: center; }
	}
</style>
