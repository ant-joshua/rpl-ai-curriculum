<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let exams: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');

	// Filters
	let filterStatus = $state('');
	let filterSearch = $state('');

	// Create modal
	let showModal = $state(false);
	let formName = $state('');
	let formDescription = $state('');
	let formDate = $state('');
	let formStartTime = $state('');
	let formEndTime = $state('');
	let formRoomId = $state('');
	let formTypeId = $state('');
	let formExamType = $state('');
	let formStatus = $state('draft');
	let formMaxParticipants = $state('');
	let saving = $state(false);
	let saveError = $state('');

	// Rooms & types for selects
	let rooms: any[] = $state([]);
	let examTypes: any[] = $state([]);

	onMount(() => {
		if (browser) {
			loadExams();
			loadRooms();
			loadTypes();
		}
	});

	async function loadExams() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/exam-scheduler/exams');
			const json = await res.json();
			if (json.success) exams = json.data || [];
			else error = json.error || 'Gagal memuat data ujian';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	async function loadRooms() {
		try {
			const res = await fetch('/api/admin/exam-scheduler/rooms');
			const json = await res.json();
			if (json.success) rooms = json.data || [];
		} catch { /* ignore */ }
	}

	async function loadTypes() {
		try {
			const res = await fetch('/api/admin/exam-scheduler/types');
			const json = await res.json();
			if (json.success) examTypes = json.data || [];
		} catch { /* ignore */ }
	}

	let filteredExams = $derived.by(() => {
		let list = exams;
		if (filterStatus) list = list.filter(e => e.status === filterStatus);
		if (filterSearch.trim()) {
			const q = filterSearch.toLowerCase();
			list = list.filter(e => (e.name || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
		}
		return list;
	});

	function openCreate() {
		formName = ''; formDescription = ''; formDate = '';
		formStartTime = ''; formEndTime = ''; formRoomId = '';
		formTypeId = ''; formExamType = ''; formStatus = 'draft';
		formMaxParticipants = ''; saveError = ''; showModal = true;
	}

	function closeModal() { showModal = false; }

	async function submitCreate() {
		if (!formName.trim()) { saveError = 'Nama ujian wajib diisi'; return; }
		if (!formDate) { saveError = 'Tanggal ujian wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const body: Record<string, string> = {
				name: formName.trim(),
				description: formDescription.trim(),
				date: formDate,
				start_time: formStartTime,
				end_time: formEndTime,
				status: formStatus,
			};
			if (formRoomId) body.room_id = formRoomId;
			if (formTypeId) body.type_id = formTypeId;
			if (formExamType.trim()) body.exam_type = formExamType.trim();
			if (formMaxParticipants) body.max_participants = formMaxParticipants;

			const res = await fetch('/api/admin/exam-scheduler/exams', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				exams = [json.data, ...exams];
				closeModal();
				success = 'Ujian berhasil dibuat';
				setTimeout(() => success = '', 3000);
			} else {
				saveError = json.error || 'Gagal menyimpan';
			}
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function deleteExam(id: string) {
		if (!confirm('Hapus jadwal ujian ini?')) return;
		try {
			const res = await fetch(`/api/admin/exam-scheduler/exams/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				exams = exams.filter(e => e.id !== id);
				success = 'Ujian berhasil dihapus';
				setTimeout(() => success = '', 3000);
			} else alert(json.error || 'Gagal menghapus');
		} catch { alert('Terjadi kesalahan'); }
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

	// Expose delete handler for DataTable inline HTML buttons
	$effect(() => {
		(window as any).__deleteExam = deleteExam;
		return () => { delete (window as any).__deleteExam; };
	});

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Nama Ujian',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue() || ''}</span>`
		},
		{
			header: 'Tanggal',
			accessorKey: 'date',
			cell: ({ getValue }) => formatDate(getValue() as string)
		},
		{
			header: 'Jam',
			accessorKey: 'start_time',
			cell: ({ row }) => {
				const e = row.original;
				return `${e.start_time || '—'}${e.end_time ? ` - ${e.end_time}` : ''}`;
			}
		},
		{
			header: 'Ruangan',
			accessorKey: 'room_id',
			cell: ({ row }) => {
				const e = row.original;
				return rooms.find((r: any) => r.id === e.room_id)?.name || e.room_id?.slice(0, 8) || '—';
			}
		},
		{
			header: 'Tipe',
			accessorKey: 'exam_type',
			cell: ({ row }) => {
				const e = row.original;
				return e.exam_type || examTypes.find((t: any) => t.id === e.type_id)?.name || '—';
			}
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const colors: Record<string, string> = {
					draft: 'background:rgba(98,102,109,0.15);color:#8a8f98',
					published: 'background:rgba(16,185,129,0.1);color:#10b981',
					ongoing: 'background:rgba(59,130,246,0.1);color:#3b82f6',
					completed: 'background:rgba(139,92,246,0.1);color:#8b5cf6',
					cancelled: 'background:rgba(239,68,68,0.1);color:#ef4444',
				};
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:capitalize;${colors[s] || colors.draft}">${s}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			enableSorting: false,
			cell: ({ getValue }) => {
				return `<button onclick="window.__deleteExam('${getValue()}')" style="padding:4px 10px;border:1px solid rgba(239,68,68,0.2);border-radius:6px;background:transparent;color:#ef4444;font-size:12px;cursor:pointer">{t('common.delete')}</button>`;
			}
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>Ujian — Exam Scheduler</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Jadwal Ujian</h1>
			<p class="subtitle">Kelola jadwal ujian dan penilaian</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadExams}>🔄</Button>
			<Button variant="primary" onclick={openCreate}>+ Ujian Baru</Button>
		</div>
	</div>

	{#if success}
		<div class="success-msg">{success}</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat data ujian...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadExams}>{t('common.retry')}</Button>
		</div>
	{:else}
		<!-- Filters -->
		<div class="filters">
<Input  />
				type="text"
				class="filter-input"
				placeholder="🔍 Cari ujian..."
				bind:value={filterSearch}
			/>
<Select bind:value={filterStatus} options={[{ value: "", label: "Semua Status" }, { value: "draft", label: t('admin.draft') }, { value: "published", label: t('admin.published') }, { value: "ongoing", label: t('admin.ongoing') }, { value: "completed", label: t('admin.completed') }, { value: "cancelled", label: t('admin.cancelled') }]} />
			<span class="filter-count">{filteredExams.length} ujian</span>
		</div>

		{#if filteredExams.length === 0}
			<div class="empty-state">
				{#if exams.length === 0}
					<p>Belum ada jadwal ujian</p>
					<Button variant="primary" onclick={openCreate}>Buat Ujian Pertama</Button>
				{:else}
					<p>Tidak ada ujian yang cocok dengan filter</p>
				{/if}
			</div>
		{:else}
			<div class="card">
				<div class="table-container">
					<DataTable {columns} data={filteredExams} pageSize={15} showSearch={false} />
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Create Modal -->
{#if showModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeModal} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Ujian Baru</h2>
				<Button class="modal-close" onclick={closeModal}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="form-grid">
					<div class="field field--full">
<Input label="Nama Ujian *" bind:value={formName} placeholder="Cth: UTS Pemrograman Web" />
					</div>
					<div class="field field--full">
<Input label={t('common.description')} bind:value={formDescription} placeholder="Deskripsi singkat ujian" />
					</div>
					<div class="field">
						<label for="exam-date">Tanggal *</label>
						<input id="exam-date" type="date" bind:value={formDate} />
					</div>
					<div class="field">
<Select label={t('admin.tipe_ujian')} bind:value={formExamType} options={[{ value: "", label: "— Pilih —" }, { value: "UTS", label: "UTS" }, { value: "UAS", label: "UAS" }, { value: "Quiz", label: "Quiz" }, { value: "Praktikum", label: "Praktikum" }, { value: "Lainnya", label: "Lainnya" }]} />
					</div>
					<div class="field">
						<label for="exam-start">Jam Mulai</label>
						<input id="exam-start" type="time" bind:value={formStartTime} />
					</div>
					<div class="field">
						<label for="exam-end">Jam Selesai</label>
						<input id="exam-end" type="time" bind:value={formEndTime} />
					</div>
					<div class="field">
<Select label={t('admin.ruangan')} bind:value={formRoomId} options={rooms.map((room) => ({ value: room.id, label: `${room.name} (kap. ${room.capacity || '?'})` }))} />
					</div>
					<div class="field">
						<label for="exam-max">Max Peserta</label>
						<input id="exam-max" type="number" bind:value={formMaxParticipants} placeholder="Opsional" min="1" />
					</div>
					<div class="field">
<Select label={t('common.status')} bind:value={formStatus} options={[{ value: "draft", label: t('admin.draft') }, { value: "published", label: t('admin.published') }, { value: "ongoing", label: t('admin.ongoing') }, { value: "completed", label: t('admin.completed') }, { value: "cancelled", label: t('admin.cancelled') }]} />
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<Button variant="secondary" onclick={closeModal}>{t('common.cancel')}</Button>
				<Button variant="primary" onclick={submitCreate} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.btn-delete { padding: 4px 10px; border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; background: transparent; color: #ef4444; font-size: 12px; cursor: pointer; }
	.btn-delete:hover { background: rgba(239,68,68,0.1); }

	.success-msg { padding: 10px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }

	/* Filters */
	.filters { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
	.filter-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; min-width: 200px; }
	.filter-input:focus { outline: none; border-color: var(--accent); }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.filter-select:focus { outline: none; border-color: var(--accent); }
	.filter-count { font-size: 13px; color: var(--text-secondary); margin-left: auto; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-actions { white-space: nowrap; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
	.status-draft { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.status-published { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-ongoing { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-completed { background: rgba(139,92,246,0.1); color: #8b5cf6; }
	.status-cancelled { background: rgba(239,68,68,0.1); color: #ef4444; }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }

	/* Form */
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.field { display: flex; flex-direction: column; gap: 4px; }
	.field--full { grid-column: 1 / -1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>
