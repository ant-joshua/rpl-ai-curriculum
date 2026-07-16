<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let kelas: any = $state(null);
	let siswa: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let kelasId = $derived($page.params.id);

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [kelasRes, siswaRes] = await Promise.all([
				fetch(`/api/admin/struktur/kelas/${kelasId}`),
				fetch(`/api/admin/struktur/kelas/${kelasId}/siswa`),
			]);
			const kjson = await kelasRes.json();
			const sjson = await siswaRes.json();
			if (kjson.success) kelas = kjson.data; else error = kjson.error || 'Kelas tidak ditemukan';
			if (sjson.success) siswa = sjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function statusBadge(status: string) {
		const styles: Record<string, string> = {
			active: 'background: rgba(16,185,129,0.1); color: #10b981;',
			inactive: 'background: rgba(239,68,68,0.1); color: #ef4444;',
			alumni: 'background: rgba(99,102,241,0.1); color: #6366f1;',
			mutasi: 'background: rgba(245,158,11,0.1); color: #f59e0b;',
		};
		return styles[status] || 'background: var(--bg-secondary); color: var(--text-secondary);';
	}
</script>

<svelte:head>
	<title>{kelas?.name || 'Detail Kelas'} — Struktur Kurikulum — Admin</title>
</svelte:head>

<div class="page">
	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<a href="/admin/struktur/kelas" class="btn-primary">← Kembali</a>
		</div>
	{:else if kelas}
		<div class="header">
			<div>
				<a href="/admin/struktur/kelas" class="back-link">← Kelas</a>
				<h1>{kelas.name}</h1>
				<div class="meta">
					<code>{kelas.code || '—'}</code>
					<span class="meta-item">Tingkat: {kelas.grade_level_name || kelas.gradeLevelName || '—'}</span>
					<span class="meta-item">Jurusan: {kelas.major_name || kelas.majorName || '—'}</span>
					<span class="meta-item">Shift: {kelas.shift || 'pagi'}</span>
					<span class="meta-item">Ruangan: {kelas.room || '—'}</span>
				</div>
			</div>
		</div>

		<div class="info-grid">
			<div class="info-card">
				<span class="info-label">Wali Kelas</span>
				<span class="info-value">{kelas.homeroom_teacher_name || kelas.homeroomTeacherName || 'Belum ditentukan'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Jumlah Siswa</span>
				<span class="info-value">{kelas.student_count ?? siswa.length ?? '—'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Periode Akademik</span>
				<span class="info-value">{kelas.academic_period_name || kelas.academicPeriodName || '—'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Status</span>
				<span class="info-value" class:active={kelas.is_active !== false}>{(kelas.is_active !== false) ? 'Aktif' : 'Nonaktif'}</span>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h2>👨‍🎓 Daftar Siswa</h2>
				<span class="badge-count">{siswa.length} siswa</span>
			</div>
			{#if siswa.length === 0}
				<div class="empty-sub">
					<p>Belum ada siswa di kelas ini</p>
				</div>
			{:else}
				<div class="table-container">
					<table>
						<thead>
							<tr>
								<th>No</th>
								<th>NIS</th>
								<th>NISN</th>
								<th>Nama</th>
								<th>Status</th>
								<th>Bergabung</th>
							</tr>
						</thead>
						<tbody>
							{#each siswa as s, i}
								<tr>
									<td class="cell-num">{i + 1}</td>
									<td><code>{s.nis || '—'}</code></td>
									<td><code>{s.nisn || '—'}</code></td>
									<td class="cell-name">{s.display_name || s.username || s.name || s.user_name || '—'}</td>
									<td>
										<span class="status-badge" style={statusBadge(s.status || 'active')}>
											{(s.status || 'active') === 'active' ? 'Aktif' : s.status || '—'}
										</span>
									</td>
									<td class="cell-date">{s.joined_at || s.joinedAt ? new Date(s.joined_at || s.joinedAt).toLocaleDateString() : '—'}</td>
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
	.page { max-width: 1000px; }
	.header { margin-bottom: 24px; }
	.back-link { color: var(--text-secondary); text-decoration: none; font-size: 13px; display: inline-block; margin-bottom: 8px; }
	.back-link:hover { color: var(--accent); }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
	.meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 13px; color: var(--text-secondary); }
	.meta-item { display: flex; align-items: center; gap: 4px; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }

	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; }
	.error-msg { color: #ef4444; margin-bottom: 16px; }
	.btn-primary { display: inline-block; padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none; }

	.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: 24px; }
	.info-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
	.info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); font-weight: 600; }
	.info-value { font-size: 16px; font-weight: 600; color: var(--text); }
	.info-value.active { color: #10b981; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.card-header h2 { margin: 0; font-size: 15px; font-weight: 600; }
	.badge-count { font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 3px 10px; border-radius: 20px; }
	.empty-sub { text-align: center; padding: 40px; color: var(--text-secondary); }

	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 11px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; }
	td { padding: 11px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-num { color: var(--text-secondary); text-align: center; width: 40px; }
	.cell-name { font-weight: 500; }
	.cell-date { color: var(--text-secondary); font-size: 12px; }
	.status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
</style>
