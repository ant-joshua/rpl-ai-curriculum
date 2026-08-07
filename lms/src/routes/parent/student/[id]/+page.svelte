<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Card, CardContent, Badge, Spinner, EmptyState } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let studentId = $state('');
	let data: any = $state(null);

	async function loadData() {
		loading = true;
		error = '';
		try {
			const token = localStorage.getItem('token') || '';
			const res = await fetch('/api/parent/overview', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			if (!json.success) { error = json.error || 'Gagal memuat data'; return; }
			const students = json.data?.students || [];
			const found = students.find((s: any) => s.id === studentId);
			if (!found) { error = 'Siswa tidak ditemukan atau tidak terhubung ke akun Anda'; return; }
			data = found;
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!browser) return;
		studentId = window.location.pathname.split('/').pop() || '';
		loadData();
	});

	function pctClass(pct: number): string {
		if (pct >= 80) return 'good';
		if (pct >= 60) return 'mid';
		return 'bad';
	}
</script>

<svelte:head>
	<title>Detail Anak — Portal Orang Tua</title>
</svelte:head>

<div class="detail-page">
	<PageHeader title="👨‍👩‍👧 Detail Anak" subtitle={data?.name || 'Progres belajar siswa'} />

	{#if loading}
		<div class="center"><Spinner /></div>
	{:else if error}
		<Card><CardContent><p class="error-text">{error}</p></CardContent></Card>
	{:else if data}
		<!-- Quick stats -->
		<div class="stats-row">
			<div class="stat-card">
				<span class="stat-label">Rata-rata Nilai</span>
				<span class="stat-value {pctClass(data.avgGrade)}">{data.avgGrade}%</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Kehadiran</span>
				<span class="stat-value {pctClass(data.attendance)}">{data.attendance}%</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Sudah Dinilai</span>
				<span class="stat-value">{data.gradedCount}</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Pesan Baru</span>
				<span class="stat-value">{data.unreadMessages}</span>
			</div>
		</div>

		<!-- Enrollments -->
		<Card>
			<CardContent>
				<h3 class="section-title">📚 Mata Pelajaran</h3>
				{#if data.enrollments.length === 0}
					<p class="muted">Belum ada mapel.</p>
				{:else}
					<ul class="list">
						{#each data.enrollments as e}
							<li class="list-item">
								<span>{e.name}</span>
								<Badge variant={e.status === 'active' ? 'success' : 'default'}>{e.status}</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>

		<!-- Recent grades -->
		<Card>
			<CardContent>
				<h3 class="section-title">📝 Nilai Terbaru</h3>
				{#if data.recentGrades.length === 0}
					<p class="muted">Belum ada nilai.</p>
				{:else}
					<ul class="list">
						{#each data.recentGrades as g}
							<li class="list-item">
								<span>{g.title} — {g.score}/{g.maxScore}</span>
								<Badge variant={g.pct >= 75 ? 'success' : g.pct >= 60 ? 'warning' : 'danger'}>{g.pct}%</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>

		<!-- Deadlines -->
		<Card>
			<CardContent>
				<h3 class="section-title">⏰ Tenggat Mendatang</h3>
				{#if data.deadlines.length === 0}
					<p class="muted">Tidak ada tenggat.</p>
				{:else}
					<ul class="list">
						{#each data.deadlines as d}
							<li class="list-item">
								<span>{d.title}</span>
								<Badge>Due {d.due}</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>

		<a href="/parent" class="back-link">← Kembali ke Portal</a>
	{/if}
</div>

<style>
	.detail-page { max-width: 860px; margin: 0 auto; padding: 0 12px 32px; }
	.center { display: flex; justify-content: center; padding: 40px; }
	.error-text { color: #ef4444; }
	.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
	.stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
	.stat-label { font-size: 12px; color: #64748b; }
	.stat-value { font-size: 22px; font-weight: 700; }
	.stat-value.good { color: #16a34a; }
	.stat-value.mid { color: #d97706; }
	.stat-value.bad { color: #dc2626; }
	.section-title { font-size: 15px; margin: 0 0 10px; }
	.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
	.list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
	.muted { color: #94a3b8; font-size: 13px; }
	.back-link { display: inline-block; margin-top: 20px; color: #4F46E5; text-decoration: none; font-size: 14px; }
	.back-link:hover { text-decoration: underline; }

	@media (max-width: 640px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
	}
</style>
