<script lang="ts">
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data }: { data: import('./$types').PageData } = $props();

	let loading = $state(true);

	let courses = $derived(data.courses ?? []);
	let pendingSubmissions = $derived(data.pendingSubmissions ?? []);
	let pendingAssignments = $derived(data.pendingAssignments ?? []);
	let pendingCount = $derived(data.pendingCount ?? 0);

	let courseCount = $derived(courses.length);
	let totalStudents = $derived(
		courses.reduce((sum: number, c: any) => sum + (c.activeEnrollments || 0), 0)
	);
	let averageGrade = $derived.by(() => {
		const stats = data.courseStats ?? {};
		const keys = Object.keys(stats);
		if (keys.length === 0) return 0;
		return Math.round(
			keys.reduce((s: number, k: string) => s + (stats[k]?.avgGrade || 0), 0) / keys.length
		);
	});

	let allSubmissions = $derived.by(() => {
		const merged = [...(pendingSubmissions || []), ...(pendingAssignments || [])];
		merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
		return merged.slice(0, 10);
	});

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'Z').getTime();
		const diff = Math.floor((Date.now() - d) / 1000);
		if (diff < 60) return 'baru saja';
		if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
		return `${Math.floor(diff / 86400)}h lalu`;
	}

	onMount(() => {
		// Brief delay to show skeleton during hydration
		const timer = setTimeout(() => {
			loading = false;
		}, 300);
		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<title>Dashboard Instruktur — LMS RPL</title>
</svelte:head>

<div class="instructor-page">
	<h1 class="page-title">Dashboard Guru</h1>
	<p class="page-subtitle">Kelola kursus, tugas, dan pantau perkembangan siswa</p>

	<!-- Stat Cards -->
	{#if loading}
		<div class="stats-grid">
			{#each Array(4) as _}
				<div class="stat-card">
					<Skeleton variant="text" width="60px" height="12px" />
					<Skeleton variant="title" width="48px" height="28px" />
					<Skeleton variant="text" width="80px" height="10px" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-label">Kursus Saya</span>
				<span class="stat-value">{courseCount}</span>
				<span class="stat-hint">kursus aktif</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Total Siswa</span>
				<span class="stat-value">{totalStudents}</span>
				<span class="stat-hint">terdaftar</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Menunggu Nilai</span>
				<span class="stat-value">{pendingCount}</span>
				<span class="stat-hint">tugas</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Rata-rata Nilai</span>
				<span class="stat-value">{averageGrade}%</span>
				<span class="stat-hint">semua kursus</span>
			</div>
		</div>
	{/if}

	<!-- Recent Submissions -->
	{#if loading}
		<div class="section-card">
			<h2 class="section-title">Submission Terbaru</h2>
			<Skeleton variant="table-row" count={4} />
		</div>
	{:else}
		<div class="section-card">
			<h2 class="section-title">Submission Terbaru</h2>
			{#if allSubmissions.length === 0}
				<EmptyState icon="📋" title="Belum ada submission" description="Submission siswa akan muncul di sini setelah mengirim tugas." />
			{:else}
				<div class="submission-list">
					{#each allSubmissions as sub}
						<a href="/admin/gradebook?submission={sub.id}" class="submission-row">
							<div class="sub-info">
								<span class="sub-name">{sub.studentName}</span>
								<span class="sub-assignment">{sub.title}</span>
							</div>
							<span class="sub-offering">{sub.offeringName}</span>
							<span class="sub-time">{timeAgo(sub.submittedAt)}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Quick Links -->
	{#if loading}
		<div class="section-card">
			<h2 class="section-title">Akses Cepat</h2>
			<Skeleton variant="button" count={1} width="100%" height="44px" />
			<Skeleton variant="button" count={1} width="100%" height="44px" />
			<Skeleton variant="button" count={1} width="100%" height="44px" />
		</div>
	{:else}
		<div class="section-card">
			<h2 class="section-title">Akses Cepat</h2>
			<div class="quick-links">
				<a href="/instructor/courses" class="quick-link">
					<span class="ql-icon">📚</span>
					<span class="ql-text">
						<span class="ql-label">Kursus Saya</span>
						<span class="ql-desc">{courseCount} kursus aktif</span>
					</span>
				</a>
				<a href="/instructor/courses" class="quick-link">
					<span class="ql-icon">📝</span>
					<span class="ql-text">
						<span class="ql-label">Buat Materi</span>
						<span class="ql-desc">Tambah materi pelajaran baru</span>
					</span>
				</a>
				<a href="/admin/gradebook" class="quick-link">
					<span class="ql-icon">✅</span>
					<span class="ql-text">
						<span class="ql-label">Beri Nilai</span>
						<span class="ql-desc">{pendingCount} tugas menunggu</span>
					</span>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.instructor-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
	}

	.page-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 28px;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}

	.stat-card {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 20px;
		background: var(--bg, #fff);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
	}

	.stat-hint {
		font-size: 11px;
		color: var(--text-muted);
	}

	/* Section Cards */
	.section-card {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 20px;
		background: var(--bg, #fff);
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 16px;
	}

	/* Submission List */
	.submission-list {
		display: flex;
		flex-direction: column;
	}

	.submission-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
		text-decoration: none;
		color: inherit;
	}

	.submission-row:last-child {
		border-bottom: none;
	}

	.sub-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sub-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.sub-assignment {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sub-offering {
		font-size: 11px;
		color: var(--text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.sub-time {
		font-size: 11px;
		color: var(--text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Quick Links */
	.quick-links {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.quick-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		background: var(--bg, #fff);
		transition: border-color 0.15s;
	}

	.quick-link:hover {
		border-color: var(--accent, var(--accent));
	}

	.ql-icon {
		font-size: 20px;
		flex-shrink: 0;
	}

	.ql-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.ql-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.ql-desc {
		font-size: 11px;
		color: var(--text-muted);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.instructor-page {
			padding: 20px 16px;
		}
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}
		.stat-card {
			padding: 16px;
		}
		.stat-value {
			font-size: 22px;
		}
		.submission-row {
			flex-wrap: wrap;
			gap: 8px;
		}
	}

	@media (max-width: 480px) {
		.instructor-page {
			padding: 12px 10px;
		}
		.stats-grid {
			grid-template-columns: 1fr 1fr;
			gap: 6px;
		}
		.stat-card {
			padding: 12px 10px;
		}
		.stat-value {
			font-size: 20px;
		}
		.quick-links {
			gap: 6px;
		}
		.quick-link {
			padding: 12px;
		}
	}
</style>
