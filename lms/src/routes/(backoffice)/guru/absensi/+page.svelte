<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, Select, Button } from '$lib/components/ui/index.js';
	import { page } from '$app/stores';

	type Student = {
		id: string;
		name: string;
		nis: string;
		status: 'hadir' | 'sakit' | 'izin' | 'alpha' | 'dispensasi' | 'terlambat';
		reason: string;
		time_in: string;
		mnt_late: number;
	};

	const statusOptions = [
		{ value: 'hadir', label: 'Hadir', color: 'var(--success)' },
		{ value: 'sakit', label: 'Sakit', color: 'var(--warning)' },
		{ value: 'izin', label: 'Izin', color: 'var(--info)' },
		{ value: 'alpha', label: 'Alpha', color: 'var(--danger)' },
		{ value: 'dispensasi', label: 'Dispensasi', color: '#8b5cf6' },
		{ value: 'terlambat', label: 'Terlambat', color: '#f97316' },
	] as const;

	let classes: any[] = $state([]);
	let subjects: any[] = $state([]);
	let students: Student[] = $state([]);
	let loadingClasses = $state(true);
	let loadingStudents = $state(false);
	let error = $state('');
	let saveError = $state('');
	let saving = $state(false);
	let saved = $state(false);

	let selectedClassId = $state('');
	let selectedSubjectId = $state('');
	let selectedDate = $state(new Date().toISOString().split('T')[0]);

	let today = $derived(new Date().toISOString().split('T')[0]);

	onMount(() => {
		if (!browser) return;
		loadClasses();
	});

	async function loadClasses() {
		loadingClasses = true;
		error = '';
		try {
			const res = await fetch('/api/guru/kelas');
			const json = await res.json();
			if (json.success) classes = json.data || [];
			else error = json.error || 'Gagal memuat kelas';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loadingClasses = false; }
	}

	async function loadSubjects() {
		if (!selectedClassId) { subjects = []; return; }
		try {
			const res = await fetch(`/api/guru/kelas/${selectedClassId}/subjects`);
			const json = await res.json();
			if (json.success) subjects = json.data || [];
		} catch { subjects = []; }
	}

	async function loadStudents() {
		if (!selectedClassId || !selectedDate) return;
		loadingStudents = true;
		error = '';
		saved = false;
		try {
			let url = `/api/guru/absensi?class_id=${selectedClassId}&date=${selectedDate}`;
			if (selectedSubjectId) url += `&subject_id=${selectedSubjectId}`;
			const res = await fetch(url);
			const json = await res.json();
			if (json.success) {
				students = (json.data || []).map((s: any) => ({
					id: s.id,
					name: s.name || s.nama || s.student_name,
					nis: s.nis || s.nisn || '',
					status: s.status || 'hadir',
					reason: s.reason || '',
					time_in: s.time_in || '',
					mnt_late: s.mnt_late ?? s.minutes_late ?? 0,
				}));
			} else error = json.error || 'Gagal memuat data siswa';
		} catch { error = 'Gagal memuat data siswa'; }
		finally { loadingStudents = false; }
	}

	function handleClassChange() {
		selectedSubjectId = '';
		students = [];
		loadSubjects();
		if (selectedDate) loadStudents();
	}

	function handleDateChange() {
		if (selectedClassId) loadStudents();
	}

	function handleSubjectChange() {
		if (selectedClassId && selectedDate) loadStudents();
	}

	function setStatus(student: Student, status: Student['status']) {
		student.status = status;
		if (status !== 'terlambat' && status !== 'sakit' && status !== 'izin' && status !== 'dispensasi') {
			student.reason = '';
			student.mnt_late = 0;
		}
		if (status !== 'terlambat') {
			student.mnt_late = 0;
		}
	}

	async function simpan() {
		if (!selectedClassId || !selectedDate || students.length === 0) {
			saveError = 'Pilih kelas, tanggal, dan pastikan data siswa tersedia';
			return;
		}
		saving = true;
		saveError = '';
		saved = false;
		try {
			const payload = {
				class_id: selectedClassId,
				date: selectedDate,
				subject_id: selectedSubjectId || undefined,
				students: students.map(s => ({
					student_id: s.id,
					status: s.status,
					reason: s.reason || undefined,
					time_in: s.time_in || undefined,
					mnt_late: s.status === 'terlambat' ? s.mnt_late : undefined,
				})),
			};
			const res = await fetch('/api/guru/absensi', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				saved = true;
				setTimeout(() => saved = false, 3000);
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan saat menyimpan'; }
		finally { saving = false; }
	}

	function resetForm() {
		selectedSubjectId = '';
		students = students.map(s => ({ ...s, status: 'hadir' as const, reason: '', time_in: '', mnt_late: 0 }));
		saveError = '';
		saved = false;
	}

	function getStatusStyle(status: string): string {
		const opt = statusOptions.find(o => o.value === status);
		return opt ? opt.color : 'var(--text)';
	}

	function getStatusLetter(status: string): string {
		switch (status) {
			case 'hadir': return 'H';
			case 'sakit': return 'S';
			case 'izin': return 'I';
			case 'alpha': return 'A';
			case 'dispensasi': return 'D';
			case 'terlambat': return 'T';
			default: return '-';
		}
	}
</script>

<svelte:head>
	<title>Absensi — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/guru">← Dashboard Guru</a></div>
			<h1>📋 Input Absensi</h1>
			<p class="subtitle">Catat kehadiran siswa per hari</p>
		</div>
		<a href="/guru/absensi/rekap" class="btn-outline">📊 Rekap Bulanan →</a>
	</div>

	<div class="filters">
		<div class="filter-group">
			<label for="class-select">Kelas</label>
			<Select options={classes.map(c => ({ value: c.id, label: c.class_name || c.name }))} bind:value={selectedClassId} onchange={handleClassChange} disabled={loadingClasses} placeholder="— Pilih Kelas —" />
		</div>
		<div class="filter-group">
			<label for="date-picker">Tanggal</label>
			<input id="date-picker" type="date" bind:value={selectedDate} onchange={handleDateChange} max={today} />
		</div>
		<div class="filter-group">
			<label for="subject-select">Mata Pelajaran (opsional)</label>
			<Select options={subjects.map(s => ({ value: s.id, label: s.subject_name || s.name }))} bind:value={selectedSubjectId} onchange={handleSubjectChange} placeholder="— Semua Mapel —" />
		</div>
	</div>

	{#if loadingClasses}
		<Loading message="Memuat kelas..." />
	{:else if error && students.length === 0}
		<div class="error-state">{error}</div>
	{:else if !selectedClassId}
		<EmptyState icon="📋" title="Pilih Kelas" description="Pilih kelas dan tanggal untuk mulai mencatat absensi." />
	{:else if loadingStudents}
		<Loading message="Memuat data siswa..." />
	{:else if students.length === 0}
		<EmptyState icon="👤" title="Tidak Ada Data" description="Tidak ada siswa ditemukan untuk kelas dan tanggal ini." />
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th class="col-no">No</th>
						<th class="col-name">Nama Siswa</th>
						<th class="col-nis">NIS</th>
						<th class="col-status">Status</th>
						<th class="col-reason">Keterangan</th>
						<th class="col-time">Jam Masuk</th>
						<th class="col-late">Telat (mnt)</th>
					</tr>
				</thead>
				<tbody>
					{#each students as student, i}
						<tr>
							<td class="col-no">{i + 1}</td>
							<td class="col-name">{student.name}</td>
							<td class="col-nis">{student.nis || '—'}</td>
							<td class="col-status">
								<div class="status-group">
									{#each statusOptions as opt}
										<label class="status-radio" style:border-color={student.status === opt.value ? opt.color : 'transparent'}>
											<input
												type="radio"
												name="status-{student.id}"
												value={opt.value}
												checked={student.status === opt.value}
												onchange={() => setStatus(student, opt.value)}
											/>
											<span class="status-dot" style:background={opt.color}></span>
											<span class="status-label">{opt.label}</span>
										</label>
									{/each}
								</div>
							</td>
							<td class="col-reason">
								<input
									type="text"
									bind:value={student.reason}
									placeholder={student.status === 'sakit' ? 'Cth: Demam' : student.status === 'izin' ? 'Cth: Acara keluarga' : student.status === 'dispensasi' ? 'Cth: Tugas sekolah' : student.status === 'terlambat' ? 'Alasan terlambat' : '—'}
									disabled={student.status === 'hadir' || student.status === 'alpha'}
								/>
							</td>
							<td class="col-time">
								<input
									type="time"
									bind:value={student.time_in}
									disabled={student.status === 'alpha'}
								/>
							</td>
							<td class="col-late">
								<input
									type="number"
									bind:value={student.mnt_late}
									min="0"
									max="999"
									disabled={student.status !== 'terlambat'}
									class:input-hidden={student.status !== 'terlambat'}
								/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="summary-bar">
			<span class="summary-item">H: <strong style="color: var(--success)">{students.filter(s => s.status === 'hadir').length}</strong></span>
			<span class="summary-item">S: <strong style="color: var(--warning)">{students.filter(s => s.status === 'sakit').length}</strong></span>
			<span class="summary-item">I: <strong style="color: var(--info)">{students.filter(s => s.status === 'izin').length}</strong></span>
			<span class="summary-item">A: <strong style="color: var(--danger)">{students.filter(s => s.status === 'alpha').length}</strong></span>
			<span class="summary-item">D: <strong style="color: #8b5cf6">{students.filter(s => s.status === 'dispensasi').length}</strong></span>
			<span class="summary-item">T: <strong style="color: #f97316">{students.filter(s => s.status === 'terlambat').length}</strong></span>
		</div>

		{#if saveError}
			<div class="form-error">{saveError}</div>
		{/if}
		{#if saved}
			<div class="form-success">✓ Data absensi berhasil disimpan!</div>
		{/if}

		<div class="actions">
			<Button onclick={simpan} disabled={saving} variant="secondary">
				{saving ? 'Menyimpan...' : '💾 Simpan'}
			</Button>
			<Button onclick={resetForm} variant="ghost">↺ Reset</Button>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 180px; }
	.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-group select, .filter-group input {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-group select:focus, .filter-group input:focus {
		outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); margin-bottom: 12px; }
	table { width: 100%; border-collapse: collapse; min-width: 800px; }
	th {
		text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; white-space: nowrap; background: var(--bg-secondary); position: sticky; top: 0;
	}
	td { padding: 8px 10px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(255,255,255,0.02); }
	.col-no { width: 40px; text-align: center; }
	.col-name { min-width: 160px; font-weight: 500; }
	.col-nis { width: 100px; color: var(--text-tertiary); font-size: 12px; }
	.col-status { min-width: 480px; }
	.col-reason { min-width: 140px; }
	.col-time { width: 100px; }
	.col-late { width: 90px; }

	.status-group { display: flex; flex-wrap: wrap; gap: 4px; }
	.status-radio {
		display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px;
		border: 1.5px solid transparent; border-radius: 6px; cursor: pointer;
		transition: all 0.1s; font-size: 11px; background: var(--bg);
	}
	.status-radio:hover { background: var(--surface-hover); }
	.status-radio input { display: none; }
	.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
	.status-label { white-space: nowrap; }

	td input[type="text"], td input[type="time"], td input[type="number"] {
		width: 100%; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px;
		background: var(--bg); color: var(--text); font-size: 12px; font-family: inherit; box-sizing: border-box;
	}
	td input:focus { outline: none; border-color: var(--accent); }
	td input:disabled { opacity: 0.4; cursor: not-allowed; }
	.input-hidden { opacity: 0.3 !important; }

	.summary-bar { display: flex; gap: 16px; padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 12px; flex-wrap: wrap; }
	.summary-item { font-size: 13px; color: var(--text-secondary); }
	.summary-item strong { font-size: 15px; }

	.form-error { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
	.form-success { padding: 10px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }

	.actions { display: flex; gap: 8px; align-items: center; }
	.btn-secondary { padding: 8px 20px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
	.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-secondary:hover:not(:disabled) { background: var(--accent-hover); }
	.btn-ghost { padding: 8px 16px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.btn-outline { padding: 8px 14px; background: transparent; color: var(--accent); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
	.btn-outline:hover { border-color: var(--accent); background: var(--accent-dim); }
</style>
