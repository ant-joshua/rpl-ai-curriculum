<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type AttendanceStats = {
		total_sessions: number;
		active_sessions: number;
		total_records: number;
		present_count: number;
		late_count: number;
		absent_count: number;
		excused_count: number;
		average_rate: number;
		recent_sessions: any[];
	};

	let stats = $state<AttendanceStats | null>(null);
	let loading = $state(true);
	let error = $state('');
	let selectedYear = $state(String(new Date().getFullYear()));

	const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

	const presentPct = $derived(
		stats && stats.total_records > 0
			? Math.round((stats.present_count / stats.total_records) * 100)
			: 0
	);
	const latePct = $derived(
		stats && stats.total_records > 0
			? Math.round((stats.late_count / stats.total_records) * 100)
			: 0
	);
	const absentPct = $derived(
		stats && stats.total_records > 0
			? Math.round((stats.absent_count / stats.total_records) * 100)
			: 0
	);
	const excusedPct = $derived(
		stats && stats.total_records > 0
			? Math.round((stats.excused_count / stats.total_records) * 100)
			: 0
	);

	onMount(() => {
		if (!browser) return;
		loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/admin/attendance/summary`);
			const json = await res.json();
			if (json.success) {
				// Also get stats from sessions
				const sessRes = await fetch(`/api/admin/attendance/sessions?limit=100`);
				const sessJson = await sessRes.json();
				const sessions = sessJson.data || [];

				let totalRecords = 0;
				let presentCount = 0;
				let lateCount = 0;
				let absentCount = 0;
				let excusedCount = 0;

				for (const s of sessJson.data || []) {
					if (s.total_records) {
						totalRecords += s.total_records;
						presentCount += s.present_count || 0;
						lateCount += s.late_count || 0;
						absentCount += s.absent_count || 0;
						excusedCount += s.excused_count || 0;
					}
				}

				stats = {
					total_sessions: sessJson.total || sessions.length,
					active_sessions: sessions.filter((s: any) => s.status === 'active').length,
					total_records: totalRecords,
					present_count: presentCount,
					late_count: lateCount,
					absent_count: absentCount,
					excused_count: excusedCount,
					average_rate: totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 0,
					recent_sessions: sessions.slice(0, 10)
				};
			} else {
				error = json.error || 'Gagal memuat statistik';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function formatDate(d: string) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function getStatusColor(status: string) {
		if (status === 'active') return 'badge-active';
		return 'badge-closed';
	}
</script>

<svelte:head>
	<title>Attendance System — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/admin">← Dashboard Admin</a></div>
			<h1>📋 Attendance System</h1>
			<p class="subtitle">Dashboard kehadiran siswa dan sesi presensi</p>
		</div>
		<div class="header-actions">
			<a href="/admin/attendance/sessions" class="btn-primary">
				<Icon name="calendar" size={16} />
				Manage Sessions
			</a>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Memuat data...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<Icon name="alert-circle" size={24} />
			<p>{error}</p>
			<button class="btn-secondary" onclick={loadStats}>Coba Lagi</button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card stat-card--primary">
				<div class="stat-icon">
					<Icon name="calendar" size={20} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{stats?.total_sessions ?? 0}</div>
					<div class="stat-label">Total Sesi</div>
				</div>
			</div>
			<div class="stat-card stat-card--success">
				<div class="stat-icon">
					<Icon name="check-square" size={20} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{stats?.active_sessions ?? 0}</div>
					<div class="stat-label">Sesi Aktif</div>
				</div>
			</div>
			<div class="stat-card stat-card--warning">
				<div class="stat-icon">
					<Icon name="users" size={20} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{stats?.total_records ?? 0}</div>
					<div class="stat-label">Total Presensi</div>
				</div>
			</div>
			<div class="stat-card stat-card--accent">
				<div class="stat-icon">
					<Icon name="trending-up" size={20} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{stats?.average_rate ?? 0}%</div>
					<div class="stat-label">Rata-rata Kehadiran</div>
				</div>
			</div>
		</div>

		<!-- Attendance Overview -->
		<div class="section">
			<h2 class="section-title">Ringkasan Kehadiran</h2>
			<div class="overview-cards">
				<div class="overview-card overview-present">
					<div class="overview-bar" style="width: {presentPct}%"></div>
					<div class="overview-info">
						<span class="overview-label">Hadir</span>
						<span class="overview-value">{stats?.present_count ?? 0}</span>
						<span class="overview-pct">{presentPct}%</span>
					</div>
				</div>
				<div class="overview-card overview-late">
					<div class="overview-bar" style="width: {latePct}%"></div>
					<div class="overview-info">
						<span class="overview-label">Terlambat</span>
						<span class="overview-value">{stats?.late_count ?? 0}</span>
						<span class="overview-pct">{latePct}%</span>
					</div>
				</div>
				<div class="overview-card overview-absent">
					<div class="overview-bar" style="width: {absentPct}%"></div>
					<div class="overview-info">
						<span class="overview-label">Absen</span>
						<span class="overview-value">{stats?.absent_count ?? 0}</span>
						<span class="overview-pct">{absentPct}%</span>
					</div>
				</div>
				<div class="overview-card overview-excused">
					<div class="overview-bar" style="width: {excusedPct}%"></div>
					<div class="overview-info">
						<span class="overview-label">Izin/Sakit</span>
						<span class="overview-value">{stats?.excused_count ?? 0}</span>
						<span class="overview-pct">{excusedPct}%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Sessions -->
		<div class="section">
			<div class="section-header">
				<h2 class="section-title">Sesi Terbaru</h2>
				<a href="/admin/attendance/sessions" class="btn-link">Lihat Semua →</a>
			</div>
			{#if (stats?.recent_sessions ?? []).length === 0}
				<div class="empty-state">
					<Icon name="calendar" size={40} />
					<p>Belum ada sesi presensi</p>
				</div>
			{:else}
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Tanggal</th>
								<th>Kelas</th>
								<th>Mata Kuliah</th>
								<th>Waktu</th>
								<th>Status</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each stats?.recent_sessions ?? [] as session}
								<tr>
									<td>{formatDate(session.session_date)}</td>
									<td>{session.class_name || '—'}</td>
									<td>{session.subject_name || '—'}</td>
									<td>{session.start_time} {session.end_time ? '- ' + session.end_time : ''}</td>
									<td>
										<span class="badge {getStatusColor(session.status)}">
											{session.status === 'active' ? 'Aktif' : 'Selesai'}
										</span>
									</td>
									<td>
										<a href="/admin/attendance/sessions/{session.id}" class="btn-sm">Detail</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header {
		display: flex; justify-content: space-between; align-items: flex-start;
		margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
	}
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }

	.header-actions { display: flex; gap: 8px; }

	.btn-primary {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 16px; background: var(--accent); color: #fff;
		border: none; border-radius: 8px; cursor: pointer;
		font-size: 13px; font-weight: 500; text-decoration: none;
	}
	.btn-primary:hover { background: var(--accent-hover); }

	.loading-state, .error-state, .empty-state {
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		padding: 60px 20px; text-align: center; gap: 12px; color: var(--text-secondary);
	}
	.spinner {
		width: 32px; height: 32px; border: 3px solid var(--border);
		border-top-color: var(--accent); border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	.error-state { color: var(--danger); }

	.stats-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 16px; margin-bottom: 32px;
	}
	.stat-card {
		display: flex; align-items: center; gap: 14px;
		padding: 18px; border-radius: 12px;
		background: var(--surface); border: 1px solid var(--border);
	}
	.stat-icon {
		width: 44px; height: 44px; border-radius: 10px;
		display: flex; align-items: center; justify-content: center;
	}
	.stat-card--primary .stat-icon { background: rgba(94,106,210,0.12); color: var(--accent); }
	.stat-card--success .stat-icon { background: rgba(34,197,94,0.12); color: #22c55e; }
	.stat-card--warning .stat-icon { background: rgba(245,158,11,0.12); color: #f59e0b; }
	.stat-card--accent .stat-icon { background: rgba(139,92,246,0.12); color: #8b5cf6; }
	.stat-value { font-size: 22px; font-weight: 700; color: var(--text); }
	.stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

	.section { margin-bottom: 32px; }
	.section-header {
		display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
	}
	.section-title { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; }
	.btn-link {
		font-size: 13px; color: var(--accent); text-decoration: none; font-weight: 500;
	}
	.btn-link:hover { text-decoration: underline; }

	.overview-cards { display: flex; flex-direction: column; gap: 10px; }
	.overview-card {
		position: relative; padding: 14px 16px; border-radius: 8px;
		background: var(--surface); border: 1px solid var(--border);
		overflow: hidden;
	}
	.overview-bar {
		position: absolute; top: 0; left: 0; height: 100%; border-radius: 8px;
		opacity: 0.06; transition: width 0.6s ease;
	}
	.overview-present .overview-bar { background: #22c55e; }
	.overview-late .overview-bar { background: #f59e0b; }
	.overview-absent .overview-bar { background: #ef4444; }
	.overview-excused .overview-bar { background: #8b5cf6; }

	.overview-info {
		display: flex; align-items: center; gap: 12px; position: relative; z-index: 1;
	}
	.overview-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); min-width: 80px; }
	.overview-value { font-size: 18px; font-weight: 700; color: var(--text); }
	.overview-pct { font-size: 12px; color: var(--text-secondary); margin-left: auto; }

	.table-wrap {
		overflow-x: auto; border: 1px solid var(--border);
		border-radius: 10px; background: var(--surface);
	}
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; white-space: nowrap; background: var(--bg-secondary);
	}
	td { padding: 10px 12px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-subtle); }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(255,255,255,0.02); }

	.badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 11px; font-weight: 600;
	}
	.badge-active { background: rgba(34,197,94,0.12); color: #22c55e; }
	.badge-closed { background: rgba(156,163,175,0.12); color: #9ca3af; }

	.btn-sm {
		padding: 4px 10px; background: var(--bg-secondary); color: var(--text);
		border: 1px solid var(--border); border-radius: 6px; cursor: pointer;
		font-size: 12px; text-decoration: none; display: inline-block;
	}
	.btn-sm:hover { border-color: var(--accent); color: var(--accent); }

	.btn-secondary {
		padding: 8px 16px; background: var(--accent); color: #fff;
		border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
	}
	.btn-secondary:hover { background: var(--accent-hover); }
</style>
