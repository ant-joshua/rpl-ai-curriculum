<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user.svelte';

	let projects = $state<any[]>([]);
	let loading = $state(true);
	let errorMsg = $state('');

	onMount(() => {
		if (!user.isLoggedIn) {
			goto('/login');
			return;
		}
		loadProjects();
	});

	async function loadProjects() {
		loading = true;
		try {
			const res = await fetch('/api/capstone', {
				headers: { 'x-device-id': user.userId || user.deviceId },
			});
			const data = await res.json();
			if (data.success) {
				projects = data.data;
			} else {
				errorMsg = data.error || 'Gagal memuat proyek';
			}
		} catch {
			errorMsg = 'Gagal memuat proyek';
		} finally {
			loading = false;
		}
	}

	function statusBadge(status: string): string {
		const map: Record<string, string> = {
			draft: '📄 Draf',
			submitted: '📤 Submitted',
			in_review: '🔍 Dalam Review',
			approved: '✅ Disetujui',
			rejected: '❌ Ditolak',
		};
		return map[status] || status;
	}
</script>

<div class="capstone-page">
	<div class="page-header">
		<div>
			<h1>🎓 Capstone Project</h1>
			<p class="subtitle">Proyek akhir RPL AI — bangun aplikasi nyata sebagai portofolio</p>
		</div>
		<button class="btn-primary" onclick={() => goto('/capstone/new')}>
			+ Buat Project Baru
		</button>
	</div>

	{#if loading}
		<div class="loading-state">
			<p>Memuat proyek...</p>
		</div>
	{:else if errorMsg}
		<div class="error-state">
			<p>{errorMsg}</p>
			<button class="btn-secondary" onclick={loadProjects}>Coba Lagi</button>
		</div>
	{:else if projects.length === 0}
		<div class="empty-state">
			<span class="empty-icon">🚀</span>
			<h3>Belum ada proyek</h3>
			<p>Buat proyek capstone pertamamu untuk menampilkan kemampuan!</p>
			<button class="btn-primary" onclick={() => goto('/capstone/new')}>
				Buat Project Baru
			</button>
		</div>
	{:else}
		<div class="projects-grid">
			{#each projects as project}
				<div class="project-card">
					<div class="card-header">
						<span class="project-status">{statusBadge(project.status)}</span>
						<span class="project-date">
							{new Date(project.created_at + 'Z').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
						</span>
					</div>
					<h3 class="project-title">{project.title}</h3>
					<p class="project-desc">{project.description}</p>
					<div class="card-meta">
						<span class="meta-path">📚 {project.path_slug}</span>
						{#if project.repo_url}
							<a href={project.repo_url} target="_blank" class="meta-repo" rel="noopener">🔗 Repo</a>
						{/if}
					</div>
					{#if project.score != null}
						<div class="project-score">
							Nilai: <strong>{project.score}</strong>
						</div>
					{/if}
					{#if project.feedback}
						<div class="project-feedback">
							<strong>Feedback:</strong> {project.feedback}
						</div>
					{/if}
					<div class="card-footer">
						<a href="/api/capstone/{project.id}" target="_blank" class="btn-link">Detail</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.capstone-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		gap: 16px;
	}

	.page-header h1 {
		font-size: 28px;
		color: var(--text);
		margin: 0;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-top: 4px;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}

	.btn-primary:hover { opacity: 0.9; }

	.btn-secondary {
		padding: 8px 16px;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 13px;
		cursor: pointer;
	}

	.loading-state, .error-state, .empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		color: var(--text);
		margin-bottom: 8px;
	}

	.empty-state p {
		margin-bottom: 20px;
	}

	.projects-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.project-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		transition: border-color 0.15s;
	}

	.project-card:hover {
		border-color: var(--accent-dim);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.project-status {
		font-size: 12px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 20px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.project-date {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.project-title {
		font-size: 18px;
		color: var(--text);
		margin-bottom: 6px;
	}

	.project-desc {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: 12px;
	}

	.card-meta {
		display: flex;
		gap: 12px;
		align-items: center;
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 10px;
	}

	.meta-repo {
		color: var(--accent) !important;
		text-decoration: none !important;
	}

	.meta-repo:hover {
		text-decoration: underline !important;
	}

	.project-score {
		font-size: 14px;
		color: var(--accent);
		margin-bottom: 6px;
	}

	.project-feedback {
		font-size: 13px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 10px;
		border-radius: 8px;
		margin-bottom: 10px;
	}

	.card-footer {
		margin-top: 4px;
	}

	.btn-link {
		font-size: 13px;
		color: var(--accent) !important;
		text-decoration: none !important;
		font-weight: 500;
	}
</style>
