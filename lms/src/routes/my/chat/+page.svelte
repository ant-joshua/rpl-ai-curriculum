<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { Card, CardContent } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();

	let courses = $derived(data.courses ?? []);
</script>

<svelte:head>
	<title>Chat Kursus — RPL AI Curriculum</title>
</svelte:head>

<div class="chat-index">
	<div class="page-header">
		<h1>💬 Chat Kursus</h1>
		<p class="subtitle">Diskusikan materi kursus dengan instruktur dan sesama siswa</p>
	</div>

	{#if courses.length === 0}
		<Card>
			<CardContent>
				<p class="empty-text">Kamu belum terdaftar di kursus apapun. Ikuti kursus untuk mulai chat.</p>
			</CardContent>
		</Card>
	{:else}
		<div class="course-grid">
			{#each courses as course}
				<a href="/my/chat/{course.id}" class="course-card">
					<span class="cc-icon">{course.courseIcon}</span>
					<div class="cc-body">
						<span class="cc-name">{course.offeringName}</span>
						<span class="cc-title">{course.courseTitle}</span>
					</div>
					<span class="cc-arrow">→</span>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.chat-index {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px;
	}
	.page-header { margin-bottom: 24px; }
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 0; }
	.empty-text {
		text-align: center;
		padding: 40px;
		color: var(--text-secondary);
		font-size: 14px;
	}
	.course-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.course-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none !important;
		transition: all 0.2s ease;
	}
	.course-card:hover {
		border-color: var(--accent);
		transform: translateX(2px);
	}
	.cc-icon { font-size: 24px; flex-shrink: 0; }
	.cc-body { flex: 1; min-width: 0; }
	.cc-name {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.cc-title {
		display: block;
		font-size: 11px;
		color: var(--text-secondary);
		margin-top: 2px;
	}
	.cc-arrow {
		color: var(--text-secondary);
		font-size: 16px;
		flex-shrink: 0;
	}
</style>
