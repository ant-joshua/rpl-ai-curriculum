<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, StatCard, Card, CardHeader, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '$lib/components/ui';
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
  import { t } from '$lib/stores/i18n';
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
			<Button variant="ghost" class="tab {activeTab === 'exams' ? 'tab--active' : ''}" onclick={() => activeTab = 'exams'}>
				📋 Ujian
			</Button>
			<Button variant="ghost" class="tab {activeTab === 'rooms' ? 'tab--active' : ''}" onclick={() => activeTab = 'rooms'}>
				🏫 Ruangan
			</Button>
			<Button variant="ghost" class="tab {activeTab === 'types' ? 'tab--active' : ''}" onclick={() => activeTab = 'types'}>
				🏷️ Tipe Ujian
			</Button>
		</div>

		<!-- Exams Tab -->
		{#if activeTab === 'exams'}
			{#if loading}
				<div class="loading">Memuat data ujian...</div>
			{:else if exams.length === 0}
				<div class="empty-state">
					<p>{t('admin.belum_ada_ujian')}</p>
					<Button href="/admin/exam-scheduler/exams" variant="primary">{t('admin.buat_ujian_pertama')}</Button>
				</div>
			{:else}
				<Card overflow-hidden>
					<CardHeader>
						<h3>Jadwal Ujian Terbaru</h3>
						<a href="/admin/exam-scheduler/exams" class="link-btn">{t('admin.lihat_semua')}</a>
					</CardHeader>
					<div class="table-container">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('admin.nama_ujian')}</TableHead>
									<TableHead>{t('admin.tanggal')}</TableHead>
									<TableHead>Jam</TableHead>
									<TableHead>{t('common.status')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each exams.slice(0, 5) as exam}
									<TableRow>
										<TableCell class="cell-name">{exam.name}</TableCell>
										<TableCell>{formatDate(exam.date)}</TableCell>
										<TableCell>{exam.start_time || '—'} - {exam.end_time || '—'}</TableCell>
										<TableCell><span class="status-badge {statusColor(exam.status)}">{exam.status}</span></TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</Card>
			{/if}
		{/if}

		<!-- Rooms Tab -->
		{#if activeTab === 'rooms'}
			{#if loading}
				<div class="loading">Memuat data ruangan...</div>
			{:else if rooms.length === 0}
				<div class="empty-state">
					<p>Belum ada ruangan</p>
					<Button href="/admin/exam-scheduler/rooms" variant="primary">Tambah Ruangan Pertama</Button>
				</div>
			{:else}
				<Card overflow-hidden>
					<CardHeader>
						<h3>Ruangan Tersedia</h3>
						<a href="/admin/exam-scheduler/rooms" class="link-btn">{t('admin.lihat_semua')}</a>
					</CardHeader>
					<div class="table-container">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('admin.nama_ruangan')}</TableHead>
									<TableHead>{t('admin.kapasitas')}</TableHead>
									<TableHead>{t('admin.lokasi')}</TableHead>
									<TableHead>{t('common.status')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each rooms.slice(0, 5) as room}
									<TableRow>
										<TableCell class="cell-name">{room.name}</TableCell>
										<TableCell>{room.capacity ?? '—'}</TableCell>
										<TableCell>{room.location || '—'}</TableCell>
										<TableCell>
											{#if room.is_available !== false}
												<span class="status-badge status-published">{t('admin.tersedia')}</span>
											{:else}
												<span class="status-badge status-cancelled">{t('admin.tidak_tersedia')}</span>
											{/if}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</Card>
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
				<Card overflow-hidden>
					<CardHeader>
						<h3>{t('admin.tipe_ujian')}</h3>
					</CardHeader>
					<div class="table-container">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama Tipe</TableHead>
									<TableHead>{t('common.description')}</TableHead>
									<TableHead>Durasi Default</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each examTypes as tipe}
									<TableRow>
										<TableCell class="cell-name">{tipe.name}</TableCell>
										<TableCell>{tipe.description || '—'}</TableCell>
										<TableCell>{tipe.default_duration ? `${tipe.default_duration} menit` : '—'}</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</Card>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1000px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.header-actions { display: flex; gap: 8px; }
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
	:global(.overflow-hidden) { overflow: hidden; border-radius: 12px; }
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
	.error-msg { color: var(--danger); margin-bottom: 12px; }
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
	.status-draft { background: rgba(98,102,109,0.15); color: var(--text-secondary); }
	.status-published { background: rgba(16,185,129,0.1); color: var(--success); }
	.status-ongoing { background: rgba(59,130,246,0.1); color: var(--accent); }
	.status-completed { background: rgba(139,92,246,0.1); color: var(--accent); }
	.status-cancelled { background: rgba(239,68,68,0.1); color: var(--danger); }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: 1fr; }
	}
</style>
