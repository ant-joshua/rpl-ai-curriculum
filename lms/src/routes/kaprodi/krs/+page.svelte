<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let pendingList: any[] = $state([]);
	let riwayatList: any[] = $state([]);
	let semesterList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterSemester = $state('');
	let showRiwayat = $state(false);

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [pendingRes, semRes] = await Promise.all([
				fetch('/api/kaprodi/krs/pending'),
				fetch('/api/admin/academic-semesters'),
			]);
			const pjson = await pendingRes.json();
			const sjson = await semRes.json();
			if (pjson.success) pendingList = pjson.data || [];
			else error = pjson.error || 'Gagal memuat data';
			if (sjson.success) semesterList = sjson.data || [];
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	async function loadRiwayat() {
		showRiwayat = true;
		try {
			const params = new URLSearchParams();
			if (filterSemester) params.set('semester_id', filterSemester);
			const res = await fetch(`/api/kaprodi/krs/riwayat?${params}`);
			const json = await res.json();
			if (json.success) riwayatList = json.data || [];
		} catch { /* ignore */ }
	}

	async function approveKrs(krsId: string) {
		if (!confirm('Setujui KRS ini?')) return;
		try {
			const res = await fetch(`/api/kaprodi/krs/${krsId}/approve`, { method: 'PUT' });
			const json = await res.json();
			if (json.success) {
				pendingList = pendingList.filter(k => k.id !== krsId);
			} else alert(json.error || 'Gagal menyetujui');
		} catch { alert('Terjadi kesalahan'); }
	}

	async function rejectKrs(krsId: string) {
		const alasan = prompt('Alasan penolakan (opsional):');
		try {
			const res = await fetch(`/api/kaprodi/krs/${krsId}/reject`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ alasan: alasan || '' }),
			});
			const json = await res.json();
			if (json.success) {
				pendingList = pendingList.filter(k => k.id !== krsId);
			} else alert(json.error || 'Gagal menolak');
		} catch { alert('Terjadi kesalahan'); }
	}

	function getSemesterName(id: string) {
		return semesterList.find(s => s.id === id)?.name || '—';
	}
</script>

<svelte:head>
	<title>Verifikasi KRS — Kaprodi</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>✅ Verifikasi KRS</h1>
			<p class="subtitle">Pengajuan Kartu Rencana Studi mahasiswa</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if pendingList.length === 0 && !showRiwayat}
		<div class="empty-state">
			<p>Tidak ada pengajuan KRS yang menunggu</p>
			<button class="btn-secondary" onclick={loadRiwayat}>Lihat Riwayat</button>
		</div>
	{:else}
		<section class="section">
			<div class="section-header">
				<h2>Menunggu Persetujuan ({pendingList.length})</h2>
			</div>
			{#if pendingList.length === 0}
				<div class="empty-subtle">Semua KRS sudah diproses</div>
			{:else}
				{#each pendingList as krs}
					<div class="krs-card">
						<div class="krs-info">
							<div class="krs-mahasiswa">
								<span class="krs-nama">{krs.mahasiswa_name || krs.student_name || '—'}</span>
								<span class="krs-nim"><code>{krs.nim || krs.student_nim || '—'}</code></span>
							</div>
							<div class="krs-meta">
								<span class="krs-semester">{getSemesterName(krs.semester_id || krs.semesterId)}</span>
								<span class="krs-sks">{krs.total_sks ?? krs.totalSks ?? 0} SKS</span>
								<span class="krs-matkul">{krs.jumlah_matkul ?? krs.course_count ?? 0} mata kuliah</span>
							</div>
							{#if krs.catatan || krs.notes}
								<div class="krs-catatan">{krs.catatan || krs.notes}</div>
							{/if}
						</div>
						<div class="krs-courses">
							{#each (krs.kelas_list || krs.courses || []) as c}
								<span class="course-chip">{c.kode || c.code} — {c.nama || c.name}</span>
							{/each}
						</div>
						<div class="krs-actions">
							<button class="btn-approve" onclick={() => approveKrs(krs.id)}>✓ Setujui</button>
							<button class="btn-reject" onclick={() => rejectKrs(krs.id)}>✕ Tolak</button>
						</div>
					</div>
				{/each}
			{/if}
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Riwayat</h2>
				<button class="btn-secondary" onclick={loadRiwayat}>Muat Riwayat</button>
			</div>
			{#if showRiwayat}
				{#if riwayatList.length === 0}
					<div class="empty-subtle">Belum ada riwayat</div>
				{:else}
					<div class="card">
						<div class="table-container">
							<table>
								<thead>
									<tr>
										<th>Mahasiswa</th>
										<th>NIM</th>
										<th>Semester</th>
										<th>SKS</th>
										<th>Status</th>
										<th>Tanggal</th>
									</tr>
								</thead>
								<tbody>
									{#each riwayatList as krs}
										<tr>
											<td class="cell-name">{krs.mahasiswa_name || krs.student_name || '—'}</td>
											<td><code>{krs.nim || krs.student_nim || '—'}</code></td>
											<td>{getSemesterName(krs.semester_id || krs.semesterId)}</td>
											<td class="cell-num">{krs.total_sks ?? krs.totalSks ?? 0}</td>
											<td>
												<span class="status-badge" class:status-approved={krs.status === 'disetujui' || krs.status === 'approved'} class:status-rejected={krs.status === 'ditolak' || krs.status === 'rejected'}>
													{krs.status === 'disetujui' || krs.status === 'approved' ? 'Disetujui' : krs.status === 'ditolak' || krs.status === 'rejected' ? 'Ditolak' : krs.status || '—'}
												</span>
											</td>
											<td class="cell-date">{krs.updated_at ? new Date(krs.updated_at).toLocaleDateString('id-ID') : '—'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			{/if}
		</section>
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-secondary:hover { background: var(--surface-hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-approve { padding: 6px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.btn-approve:hover { background: rgba(16,185,129,0.2); }
	.btn-reject { padding: 6px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.btn-reject:hover { background: rgba(239,68,68,0.2); }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
	.empty-subtle { text-align: center; padding: 30px; color: var(--text-tertiary); font-size: 13px; }

	.section { margin-bottom: 32px; }
	.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
	.section-header h2 { margin: 0; font-size: 16px; font-weight: 600; }

	.krs-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
	.krs-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
	.krs-mahasiswa { display: flex; align-items: center; gap: 10px; }
	.krs-nama { font-size: 15px; font-weight: 600; }
	.krs-nim code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.krs-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); }
	.krs-catatan { font-size: 12px; color: var(--text-tertiary); font-style: italic; padding: 6px 8px; background: var(--bg-secondary); border-radius: 6px; }
	.krs-courses { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
	.course-chip { padding: 3px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; font-size: 11px; color: var(--text-secondary); }
	.krs-actions { display: flex; gap: 8px; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-num { text-align: center; }
	.cell-date { color: var(--text-tertiary); font-size: 12px; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(98,102,109,0.1); color: var(--text-quaternary); }
	.status-approved { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-rejected { background: rgba(239,68,68,0.1); color: #ef4444; }
</style>
