<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, StatCard } from '$lib/components/ui';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type Tab = 'exams' | 'rooms' | 'types';
	let activeTab = $state<Tab>('exams');

	let loading = $state(true);
	let error = $state('');

	// Exams preview
	let exams: any[] = $state([]);
	let rooms: any[] = $state([]);
	let examTypes: any[] = $state([]);

	// Derived stats (computed from loaded data)
	let examCount = $derived(exams.length);
	let roomCount = $derived(rooms.length);
	let typeCount = $derived(examTypes.length);
	let draftCount = $derived(exams.filter(e => e.status === 'draft').length);
	let activeCount = $derived(exams.filter(e => e.status === 'ongoing').length);
	let availableRoomCount = $derived(rooms.filter(r => r.is_available !== false).length);

	onMount(() => {
		if (browser) loadAll();
	});

	async function loadAll() {
		loading = true;
		const examColumns: ColumnDef<any, any>[] = [
			{ header: 'Nama Ujian', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
			{ header: 'Tanggal', accessorKey: 'date', cell: ({ getValue }) => formatDate(getValue() as string) },
			{ header: 'Jam', id: 'jam', cell: ({ row }) => `${row.original.start_time || '\u2014'} - ${row.original.end_time || '\u2014'}` },
			{ header: 'Status', accessorKey: 'status', cell: ({ getValue }) => { const s = getValue() as string; return `<span class="status-badge ${statusColor(s)}">${s}</span>`; } },
		];

		const roomTabColumns: ColumnDef<any, any>[] = [
			{ header: 'Nama Ruangan', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
			{ header: 'Kapasitas', accessorKey: 'capacity', cell: ({ getValue }) => getValue() ?? '\u2014' },
			{ header: 'Lokasi', accessorKey: 'location', cell: ({ getValue }) => (getValue() as string) || '\u2014' },
			{ header: 'Status', accessorKey: 'is_available', cell: ({ getValue }) => getValue() !== false ? '<span class="status-badge status-published">'+t('admin.tersedia')+'</span>' : '<span class="status-badge status-cancelled">Tidak Tersedia</span>' },
		];

		const typeColumns: ColumnDef<any, any>[] = [
			{ header: 'Nama Tipe', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
			{ header: 'Deskripsi', accessorKey: 'description', cell: ({ getValue }) => (getValue() as string) || '\u2014' },
			{ header: 'Durasi Default', accessorKey: 'default_duration', cell: ({ getValue }) => { const v = getValue(); return v ? `${v} menit` : '\u2014'; } },
		];
		error = '';
		try {
			const [exRes, rmRes, tyRes] = await Promise.all([
				fetch('/api/admin/exam-scheduler/exams'),
				fetch('/api/admin/exam-scheduler/rooms'),
				fetch('/api/admin/exam-scheduler/types')
			]);
			const exJson = await exRes.json();
			const rmJson = await rmRes.json();
			const tyJson = await tyRes.json();

			if (exJson.success) exams = exJson.data || [];
			if (rmJson.success) rooms = rmJson.data || [];
			if (tyJson.success) examTypes = tyJson.data || [];

			if (!exJson.success && !rmJson.success && !tyJson.success) {
				error = 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'draft': return 'status-draft';
			case 'published': return 'status-published';
			case 'ongoing': return 'status-ongoing';
			case 'completed': return 'status-completed';
			case 'cancelled': return 'status-cancelled';
			default: return 'status-draft';
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
		} catch { return d; }
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Exam Scheduler</h1>
			<p class="subtitle">{t('admin.kelola_jadwal_ujian')}</p>
		</div>
		<Button class="btn-refresh" onclick={loadAll}>🔄</Button>
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadAll}>{t('common.retry')}</Button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-row">
			<StatCard icon="📋" value={loading ? '—' : examCount} label="Total Ujian" />
			<StatCard icon="🏫" value={loading ? '—' : roomCount} label="Ruangan" />
			<StatCard icon="🏷️" value={loading ? '—' : typeCount} label="Tipe Ujian" />
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button class="tab" class:tab--active={activeTab === 'exams'} onclick={() => activeTab = 'exams'}>
				📋 Ujian
			</button>
			<button class="tab" class:tab--active={activeTab === 'rooms'} onclick={() => activeTab = 'rooms'}>
				🏫 Ruangan
			</button>
			<button class="tab" class:tab--active={activeTab === 'types'} onclick={() => activeTab = 'types'}>
				🏷️ Tipe Ujian
			</button>
		</div>

		<!-- Exams Tab -->
		{#if activeTab === 'exams'}
			{#if loading}
				<div class="loading">Memuat data ujian...</div>
			{:else if exams.length === 0}
				<div class="empty-state">
					<p>{t('admin.belum_ada_ujian')}</p>
					<a href="/admin/exam-scheduler/exams" class="btn-primary">{t('admin.buat_ujian_pertama')}</a>
				</div>
			{:else}
				<div class="card">
					<div class="card-header">
						<h3>Jadwal Ujian Terbaru</h3>
						<a href="/admin/exam-scheduler/exams" class="link-btn">{t('admin.lihat_semua')}</a>
					</div>
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>{t('admin.nama_ujian')}</th>
									<th>{t('admin.tanggal')}</th>
									<th>Jam</th>
									<th>{t('common.status')}</th>
								</tr>
							</thead>
							<tbody>
								{#each exams.slice(0, 5) as exam}
									<tr>
										<td class="cell-name">{exam.name}</td>
										<td>{formatDate(exam.date)}</td>
										<td>{exam.start_time || '—'} - {exam.end_time || '—'}</td>
										<td><span class="status-badge {statusColor(exam.status)}">{exam.status}</span></td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}

		<!-- Rooms Tab -->
		{#if activeTab === 'rooms'}
			{#if loading}
				<div class="loading">Memuat data ruangan...</div>
			{:else if rooms.length === 0}
				<div class="empty-state">
					<p>Belum ada ruangan</p>
					<a href="/admin/exam-scheduler/rooms" class="btn-primary">Tambah Ruangan Pertama</a>
				</div>
			{:else}
				<div class="card">
					<div class="card-header">
						<h3>Ruangan Tersedia</h3>
						<a href="/admin/exam-scheduler/rooms" class="link-btn">{t('admin.lihat_semua')}</a>
					</div>
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>{t('admin.nama_ruangan')}</th>
									<th>{t('admin.kapasitas')}</th>
									<th>{t('admin.lokasi')}</th>
									<th>{t('common.status')}</th>
								</tr>
							</thead>
							<tbody>
								{#each rooms.slice(0, 5) as room}
									<tr>
										<td class="cell-name">{room.name}</td>
										<td>{room.capacity ?? '—'}</td>
										<td>{room.location || '—'}</td>
										<td>
											{#if room.is_available !== false}
												<span class="status-badge status-published">{t('admin.tersedia')}</span>
											{:else}
												<span class="status-badge status-cancelled">{t('admin.tidak_tersedia')}</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}

		<!-- Types Tab -->
		{#if activeTab === 'types'}
			{#if loading}
				<div class="loading">Memuat data tipe ujian...</div>
			{:else if examTypes.length === 0}
				<div class="empty-state">
					<p>Belum ada tipe ujian</p>
					<Button variant="primary" onclick={() => window.location.href = '/admin/exam-scheduler/exams'}>Kelola Ujian</Button>
				</div>
			{:else}
				<div class="card">
					<div class="card-header">
						<h3>{t('admin.tipe_ujian')}</h3>
					</div>
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Nama Tipe</th>
									<th>{t('common.description')}</th>
									<th>Durasi Default</th>
								</tr>
							</thead>
							<tbody>
								{#each examTypes as tipe}
									<tr>
										<td class="cell-name">{tipe.name}</td>
										<td>{tipe.description || '—'}</td>
										<td>{tipe.default_duration ? `${tipe.default_duration} menit` : '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1000px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none !important; display: inline-block; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	/* Stats */
	.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
	}
	.stat-number { display: block; font-size: 28px; font-weight: 700; color: var(--text); }
	.stat-label { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		margin-bottom: 20px;
		overflow-x: auto;
	}
	.tab {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

	/* Content */
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
	}
	.card-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
	.link-btn { font-size: 13px; color: var(--accent); text-decoration: none !important; }
	.link-btn:hover { text-decoration: underline; }

	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	/* Status badges */
	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: capitalize;
	}
	.status-draft { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.status-published { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-ongoing { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-completed { background: rgba(139,92,246,0.1); color: #8b5cf6; }
	.status-cancelled { background: rgba(239,68,68,0.1); color: #ef4444; }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: 1fr; }
	}
</style>
