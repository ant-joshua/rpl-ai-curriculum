<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, Button, Badge, Spinner, EmptyState, StatCard } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let data: any = $state(null);
	let notParent = $state(false);

	async function loadData() {
		loading = true;
		error = '';
		try {
			const token = localStorage.getItem('token') || '';
			const res = await fetch('/api/parent/overview', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.notParent) {
				notParent = true;
				loading = false;
				return;
			}
			if (!json.success) {
				error = json.error || 'Gagal memuat data';
				return;
			}
			data = json.data;
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	function pctClass(pct: number): string {
		if (pct >= 80) return 'good';
		if (pct >= 60) return 'mid';
		return 'bad';
	}
</script>

<svelte:head>
	<title>Portal Orang Tua — LMS RPL</title>
</svelte:head>

<div class="parent-page">
	<PageHeader title="👨‍👩‍👧 Portal Orang Tua" subtitle="Pantau perkembangan belajar anak" />

	{#if loading}
		<div class="center"><Spinner /></div>
	{:else if notParent}
		<Card>
			<CardContent>
				<div class="not-parent">
					<span class="np-icon">👨‍👩‍👧</span>
					<h2>Akun ini belum terhubung sebagai orang tua</h2>
					<p>Hubungi admin sekolah untuk menautkan akun orang tua ke siswa.</p>
					<Button onclick={() => location.href = '/my/dashboard'}>Ke Dashboard Siswa</Button>
				</div>
			</CardContent>
		</Card>
	{:else if error}
		<Card>
			<CardContent><p class="error-text">{error}</p></CardContent>
		</Card>
	{:else if data}
		{#if data.students.length === 0}
			<EmptyState icon="users" title="Belum ada siswa tertaut" description="Admin belum menautkan siswa ke akun Anda." />
		{:else}
			{#each data.students as s}
				<section class="student-section">
					<div class="student-head">
						<div class="student-info">
							<span class="student-avatar">{s.avatar ? `<img src="${s.avatar}" />` : '🧑‍🎓'}</span>
							<div>
								<h2 class="student-name">{s.name}</h2>
								<span class="student-rel">{s.relationship} · Akses: {s.accessLevel}</span>
							</div>
						</div>
						<div class="student-actions">
							<a href="/parent/student/{s.id}" class="detail-link">Detail Lengkap →</a>
						</div>
					</div>

					<div class="stats-grid">
						<StatCard icon="🎓" value="{s.avgGrade}%" label="Rata-rata Nilai" />
						<StatCard icon="📝" value={s.gradedCount} label="Sudah Dinilai" />
						<StatCard icon="📅" value="{s.attendance}%" label="Kehadiran" />
						<StatCard icon="💬" value={s.unreadMessages} label="Pesan Baru" />
					</div>

					{#if s.enrollments.length > 0}
						<div class="enroll-grid">
							{#each s.enrollments as e}
								<div class="enroll-chip">
									<span class="enroll-name">{e.name}</span>
									<Badge variant={e.status === 'active' ? 'success' : 'default'}>{e.status}</Badge>
								</div>
							{/each}
						</div>
					{/if}

					<div class="panel-grid">
						{#if s.recentGrades.length > 0}
							<div class="panel">
								<h3>📊 Nilai Terbaru</h3>
								<div class="grade-list">
									{#each s.recentGrades as g}
										<div class="grade-item">
											<span class="grade-title">{g.title}</span>
											<span class="grade-pct {pctClass(g.pct)}">{g.pct}%</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if s.deadlines.length > 0}
							<div class="panel">
								<h3>⏰ Tenggat Mendatang</h3>
								<div class="deadline-list">
									{#each s.deadlines as d}
										<div class="deadline-item">
											<span class="deadline-title">{d.title}</span>
											<span class="deadline-date">{d.due}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.parent-page { max-width: 980px; margin: 0 auto; padding: 24px 20px; }
	.center { display: flex; justify-content: center; padding: 60px; }
	.error-text { color: #dc2626; }

	.not-parent { text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
	.np-icon { font-size: 48px; }
	.not-parent h2 { font-size: 20px; margin: 0; }
	.not-parent p { color: var(--text-secondary); }

	.student-section {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 14px; padding: 20px; margin-bottom: 24px;
	}
	.student-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
	.student-info { display: flex; align-items: center; gap: 12px; }
	.student-avatar { font-size: 32px; }
	.student-name { font-size: 20px; margin: 0; }
	.student-rel { font-size: 12px; color: var(--text-secondary); }
	.detail-link { color: var(--accent); font-weight: 600; text-decoration: none; font-size: 14px; }
	.detail-link:hover { text-decoration: underline; }

	.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 14px; }
	.enroll-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
	.enroll-chip {
		display: flex; align-items: center; gap: 8px;
		padding: 6px 12px; background: #f8fafc; border: 1px solid var(--border);
		border-radius: 8px; font-size: 13px;
	}
	.enroll-name { font-weight: 500; }

	.panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	@media (max-width: 700px) { .panel-grid { grid-template-columns: 1fr; } }
	.panel { background: #fafbfc; border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
	.panel h3 { font-size: 14px; margin: 0 0 10px; }

	.grade-list, .deadline-list { display: flex; flex-direction: column; gap: 6px; }
	.grade-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
	.grade-title { font-weight: 500; }
	.grade-pct { font-weight: 700; padding: 2px 8px; border-radius: 5px; }
	.grade-pct.good { background: #dcfce7; color: #166534; }
	.grade-pct.mid { background: #fef9c3; color: #854d0e; }
	.grade-pct.bad { background: #fee2e2; color: #991b1b; }
	.deadline-item { display: flex; justify-content: space-between; font-size: 13px; }
	.deadline-title { font-weight: 500; }
	.deadline-date { color: var(--accent); font-weight: 600; }
</style>
