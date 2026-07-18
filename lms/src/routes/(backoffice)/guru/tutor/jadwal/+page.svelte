<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, Modal, Input, Textarea, Button, Select } from '$lib/components/ui/index.js';

	type Session = {
		id: string;
		studentName: string;
		date: string;
		startTime: string;
		endTime: string;
		status: string;
		subject: string;
		notes?: string;
	};

	const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
	const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

	let loading = $state(true);
	let error = $state('');
	let sessions: Session[] = $state([]);
	let weekOffset = $state(0);
	let showModal = $state(false);
	let editingSession: Session | null = $state(null);
	let saving = $state(false);

	let weekLabel = $derived(() => {
		const start = weekStart();
		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	});

	function weekStart() {
		const now = new Date();
		const day = now.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		const monday = new Date(now);
		monday.setDate(now.getDate() + diff + weekOffset * 7);
		monday.setHours(0, 0, 0, 0);
		return monday;
	}

	onMount(() => {
		if (!browser) return;
		loadSessions();
	});

	async function loadSessions() {
		loading = true; error = '';
		try {
			const start = weekStart();
			const end = new Date(start); end.setDate(start.getDate() + 6);
			const res = await fetch(`/api/tutor/sesi?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`);
			const json = await res.json();
			if (json.success) sessions = json.data || [];
			else error = json.error || 'Gagal memuat jadwal';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function prevWeek() { weekOffset--; loadSessions(); }
	function nextWeek() { weekOffset++; loadSessions(); }
	function thisWeek() { weekOffset = 0; loadSessions(); }

	function getDaySessions(dayIdx: number): Session[] {
		const start = weekStart();
		const date = new Date(start);
		date.setDate(start.getDate() + dayIdx);
		const ds = date.toISOString().split('T')[0];
		return sessions.filter(s => s.date === ds);
	}

	function getSessionStyle(s: Session): string {
		switch (s.status) {
			case 'done': return 'background: rgba(16,185,129,0.15); border-left: 3px solid var(--success);';
			case 'cancelled': return 'background: rgba(239,68,68,0.1); border-left: 3px solid var(--danger); opacity: 0.6;';
			case 'in_progress': return 'background: rgba(94,106,210,0.15); border-left: 3px solid var(--accent);';
			default: return 'background: rgba(255,255,255,0.03); border-left: 3px solid var(--text-tertiary);';
		}
	}

	function openNewSession() {
		editingSession = null;
		openModal();
	}

	function openEditSession(s: Session) {
		editingSession = s;
		openModal();
	}

	let formStudent = $state('');
	let formDate = $state('');
	let formStart = $state('');
	let formEnd = $state('');
	let formSubject = $state('');
	let formNotes = $state('');

	function openModal() {
		showModal = true;
		if (editingSession) {
			formStudent = editingSession.studentName;
			formDate = editingSession.date;
			formStart = editingSession.startTime;
			formEnd = editingSession.endTime;
			formSubject = editingSession.subject;
			formNotes = editingSession.notes || '';
		} else {
			formStudent = ''; formDate = new Date().toISOString().split('T')[0];
			formStart = '09:00'; formEnd = '10:00'; formSubject = ''; formNotes = '';
		}
	}

	function closeModal() {
		showModal = false;
		editingSession = null;
	}

	async function saveSession() {
		if (!formStudent || !formDate || !formStart || !formEnd) return;
		saving = true;
		try {
			const body = {
				id: editingSession?.id,
				studentName: formStudent, date: formDate,
				startTime: formStart, endTime: formEnd,
				subject: formSubject, notes: formNotes,
			};
			const res = await fetch('/api/tutor/sesi', {
				method: editingSession ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) { closeModal(); loadSessions(); }
			else error = json.error || 'Gagal menyimpan';
		} catch { error = 'Gagal menyimpan sesi'; }
		finally { saving = false; }
	}
</script>

<svelte:head>
	<title>Jadwal Privat — Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/tutor">← Tutor Dashboard</a></div>
		<h1>📅 Jadwal Sesi Privat</h1>
		<p class="subtitle">Kelola jadwal les privat mingguan</p>
	</div>

	<div class="week-nav">
		<button class="btn btn-ghost btn-sm" onclick={prevWeek}>‹ Sebelumnya</button>
		<button class="btn btn-ghost btn-sm" onclick={thisWeek}>Minggu Ini</button>
		<button class="btn btn-ghost btn-sm" onclick={nextWeek}>Berikutnya ›</button>
		<span class="week-label">{weekLabel()}</span>
		<button class="btn btn-secondary btn-sm" onclick={openNewSession} style="margin-left: auto;">+ Tambah Sesi</button>
	</div>

	{#if loading}
		<Loading message="Memuat jadwal..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else}
		<div class="calendar-wrap">
			<div class="calendar-grid">
				<div class="cal-header cal-corner"></div>
				{#each DAYS as day, i}
					<div class="cal-header">{day}</div>
				{/each}

				{#each HOURS as hour}
					<div class="cal-time">{hour}</div>
					{#each DAYS as _, dayIdx}
						{@const daySessions = getDaySessions(dayIdx).filter(s => s.startTime.slice(0, 5) === hour)}
						<div class="cal-cell" class:has-sessions={daySessions.length > 0}>
							{#each daySessions as s}
								<button class="session-block" style={getSessionStyle(s)} onclick={() => openEditSession(s)}>
									<span class="session-time">{s.startTime.slice(0,5)}-{s.endTime.slice(0,5)}</span>
									<span class="session-name">{s.studentName}</span>
									{#if s.subject}
										<span class="session-subject">{s.subject}</span>
									{/if}
								</button>
							{/each}
						</div>
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</div>

<Modal open={showModal} title={editingSession ? 'Edit Sesi' : 'Tambah Sesi'} onclose={closeModal}>
	<div class="form-group">
		<label for="form-student">Nama Siswa</label>
		<input id="form-student" class="input-field" bind:value={formStudent} placeholder="Nama siswa" />
	</div>
	<div class="form-group">
		<label for="form-date">Tanggal</label>
		<input id="form-date" class="input-field" type="date" bind:value={formDate} />
	</div>
	<div class="form-row">
		<div class="form-group">
			<label for="form-start">Mulai</label>
			<input id="form-start" class="input-field" type="time" bind:value={formStart} />
		</div>
		<div class="form-group">
			<label for="form-end">Selesai</label>
			<input id="form-end" class="input-field" type="time" bind:value={formEnd} />
		</div>
	</div>
	<div class="form-group">
		<label for="form-subject">Mata Pelajaran</label>
		<input id="form-subject" class="input-field" bind:value={formSubject} placeholder="Matematika / Fisika / ..." />
	</div>
	<div class="form-group">
		<label for="form-notes">Catatan</label>
		<textarea id="form-notes" class="input-field textarea" bind:value={formNotes} placeholder="Catatan sesi" rows={3}></textarea>
	</div>
	<div class="modal-actions">
		<button class="btn btn-ghost" onclick={closeModal}>Batal</button>
		<button class="btn btn-secondary" onclick={saveSession} disabled={saving}>
			{saving ? 'Menyimpan...' : (editingSession ? 'Simpan' : 'Tambah')}
		</button>
	</div>
</Modal>

<style>
	.page { max-width: 1100px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.week-nav { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
	.week-label { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0 8px; }

	.calendar-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.calendar-grid {
		display: grid;
		grid-template-columns: 60px repeat(7, 1fr);
		min-width: 700px;
	}
	.cal-header {
		padding: 10px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
		color: var(--text-secondary); font-weight: 600; text-align: center;
		border-bottom: 1px solid var(--border); background: var(--bg-secondary);
	}
	.cal-corner { border-right: 1px solid var(--border); }
	.cal-time {
		padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); text-align: right;
		border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);
		height: 40px;
	}
	.cal-cell {
		padding: 2px; border-bottom: 1px solid var(--border-subtle); min-height: 40px;
		display: flex; flex-direction: column; gap: 2px;
	}
	.cal-cell.has-sessions { background: rgba(255,255,255,0.01); }

	.session-block {
		display: flex; flex-direction: column; gap: 1px;
		padding: 4px 6px; border-radius: 4px; border: none;
		font-size: 10px; cursor: pointer; text-align: left; width: 100%;
		transition: opacity 0.15s; font-family: inherit; color: var(--text);
	}
	.session-block:hover { filter: brightness(1.3); }
	.session-time { font-weight: 600; font-size: 9px; color: var(--text-secondary); }
	.session-name { font-weight: 600; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.session-subject { font-size: 9px; color: var(--text-tertiary); }

	.form-group { display: flex; flex-direction: column; gap: 4px; }
	.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.input-field {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.input-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.textarea { resize: vertical; min-height: 60px; }
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-ghost { background: transparent; color: var(--text-secondary); }
	.btn-ghost:hover { background: rgba(255,255,255,0.05); color: var(--text); }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
