<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let assignments: any[] = $state([]);
	let kelasList: any[] = $state([]);
	let mapelList: any[] = $state([]);
	let guruList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterKelas = $state('');
	let filterMapel = $state('');

	let showForm = $state(false);
	let formClassId = $state('');
	let formSubjectId = $state('');
	let formTeacherId = $state('');
	let formSemester = $state(1);
	let formTotalHours = $state(2);
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [assignRes, kelasRes, mapelRes, guruRes] = await Promise.all([
				fetch('/api/admin/classes-structure/teacher-subjects'),
				fetch('/api/admin/classes-structure/classes'),
				fetch('/api/admin/classes-structure/subjects'),
				fetch('/api/admin/classes-structure/teachers'),
			]);
			const aj = await assignRes.json();
			const kj = await kelasRes.json();
			const mj = await mapelRes.json();
			const gj = await guruRes.json();
			if (aj.success) assignments = aj.data; else error = aj.error || 'Gagal memuat';
			if (kj.success) kelasList = kj.data;
			if (mj.success) mapelList = mj.data;
			if (gj.success) guruList = gj.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function getKelasName(id: string) {
		return kelasList.find(k => k.id === id)?.name || '—';
	}
	function getMapelName(id: string) {
		return mapelList.find(m => m.id === id)?.name || '—';
	}
	function getGuruName(id: string) {
		return guruList.find(g => g.id === id)?.display_name || guruList.find(g => g.id === id)?.name || guruList.find(g => g.id === id)?.username || id?.slice(0, 12) || '—';
	}

	let filtered = $derived(
		assignments.filter(a => {
			if (filterKelas && (a.class_id || a.classId) !== filterKelas) return false;
			if (filterMapel && (a.subject_id || a.subjectId) !== filterMapel) return false;
			return true;
		})
	);

	function openForm() {
		formClassId = ''; formSubjectId = ''; formTeacherId = '';
		formSemester = 1; formTotalHours = 2; saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formClassId || !formSubjectId || !formTeacherId) {
			saveError = 'Kelas, mapel, dan guru wajib dipilih';
			return;
		}
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/classes-structure/teacher-subjects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					class_id: formClassId,
					subject_id: formSubjectId,
					teacher_id: formTeacherId,
					semester: formSemester,
					total_hours_per_week: formTotalHours,
				}),
			});
			const json = await res.json();
			if (json.success) {
				assignments = [...assignments, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function deleteAssignment(id: string) {
		if (!confirm('Yakin hapus penugasan ini?')) return;
		try {
			const res = await fetch(`/api/admin/classes-structure/teacher-subjects/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) assignments = assignments.filter(a => a.id !== id);
		} catch { /* ignore */ }
	}
</script>

<svelte:head>
	<title>Guru Mapel — Struktur Kurikulum — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>👨‍🏫 Guru Mapel</h1>
			<p class="subtitle">Penugasan guru per kelas & mata pelajaran</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openForm}>+ Assign Baru</button>
		</div>
	</div>

	<div class="filter-bar">
		<select bind:value={filterKelas} class="filter-select">
			<option value="">Semua Kelas</option>
			{#each kelasList as k}
				<option value={k.id}>{k.name}</option>
			{/each}
		</select>
		<select bind:value={filterMapel} class="filter-select">
			<option value="">Semua Mapel</option>
			{#each mapelList as m}
				<option value={m.id}>{m.name}</option>
			{/each}
		</select>
		<span class="filter-count">{filtered.length} penugasan</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if assignments.length === 0}
		<div class="empty-state">
			<p>Belum ada penugasan guru mapel</p>
			<button class="btn-primary" onclick={openForm}>Assign Pertama</button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Kelas</th>
							<th>Mata Pelajaran</th>
							<th>Guru</th>
							<th>Semester</th>
							<th>JP/mgg</th>
							<th>Status</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each filtered as a}
							<tr>
								<td class="cell-name">{getKelasName(a.class_id || a.classId)}</td>
								<td>{getMapelName(a.subject_id || a.subjectId)}</td>
								<td>{getGuruName(a.teacher_id || a.teacherId)}</td>
								<td class="cell-num">Smt {a.semester || 1}</td>
								<td class="cell-num">{a.total_hours_per_week ?? a.totalHoursPerWeek ?? '—'}</td>
								<td>
									<span class="status-dot" class:active={a.status !== 'inactive'}></span>
								</td>
								<td>
									<button class="btn-danger-icon" onclick={() => deleteAssignment(a.id)} title="Hapus">✕</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Assign Guru Baru</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
					<label for="gm-kelas">Kelas</label>
					<select id="gm-kelas" bind:value={formClassId}>
						<option value="">— Pilih Kelas —</option>
						{#each kelasList as k}
							<option value={k.id}>{k.name}</option>
						{/each}
					</select>
				</div>
				<div class="field">
					<label for="gm-mapel">Mata Pelajaran</label>
					<select id="gm-mapel" bind:value={formSubjectId}>
						<option value="">— Pilih Mapel —</option>
						{#each mapelList as m}
							<option value={m.id}>{m.name}</option>
						{/each}
					</select>
				</div>
				<div class="field">
					<label for="gm-guru">Guru</label>
					<select id="gm-guru" bind:value={formTeacherId}>
						<option value="">— Pilih Guru —</option>
						{#each guruList as g}
							<option value={g.id}>{g.display_name || g.name || g.username || g.id?.slice(0, 12)}</option>
						{/each}
					</select>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="gm-semester">Semester</label>
						<select id="gm-semester" bind:value={formSemester}>
							<option value={1}>Semester 1 (Ganjil)</option>
							<option value={2}>Semester 2 (Genap)</option>
						</select>
					</div>
					<div class="field">
						<label for="gm-hours">JP per Minggu</label>
						<input id="gm-hours" type="number" bind:value={formTotalHours} min="1" max="40" />
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={closeForm}>Batal</button>
				<button class="btn-primary" onclick={submitForm} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1000px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--hover); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.btn-danger-icon { background: none; border: 1px solid transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
	.btn-danger-icon:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); }

	.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; }
	.filter-count { font-size: 13px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-num { text-align: center; }
	.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--text-secondary); }
	.status-dot.active { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.4); }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field select:focus, .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field-row { display: flex; gap: 12px; }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>
