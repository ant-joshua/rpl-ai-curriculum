<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, DataTable } from '$lib/components/ui/index.js';
	import { page } from '$app/stores';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type Session = {
		id: string;
		date: string;
		startTime: string;
		endTime: string;
		subject: string;
		status: string;
		notes?: string;
	};

	type ProgressNote = {
		id: string;
		sessionId: string;
		note: string;
		createdAt: string;
	};

	let loading = $state(true);
	let error = $state('');
	let student: any = $state(null);
	let sessions: Session[] = $state([]);
	let progressNotes: ProgressNote[] = $state([]);
	let activeTab = $state<string>('sessions');

	const studentId = $derived($page.params.studentId);

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true; error = '';
		try {
			const [resStudent, resSessions, resNotes] = await Promise.all([
				fetch(`/api/tutor/siswa/${studentId}`),
				fetch(`/api/tutor/sesi?student_id=${studentId}`),
				fetch(`/api/tutor/siswa/${studentId}/paket`),
			]);
			const [jsonStudent, jsonSessions, jsonNotes] = await Promise.all([
				resStudent.json(), resSessions.json(), resNotes.json(),
			]);
			if (jsonStudent.success) student = jsonStudent.data;
			else { error = jsonStudent.error || 'Gagal memuat data siswa'; return; }
			if (jsonSessions.success) sessions = jsonSessions.data || [];
			if (jsonNotes.success) progressNotes = jsonNotes.data || [];
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active': return 'success';
			case 'paused': return 'warning';
			case 'completed': return 'info';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'active': return 'Aktif';
			case 'paused': return 'Jeda';
			case 'completed': return 'Selesai';
			default: return status;
		}
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatDateTime(d: string) {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function getSessionBadge(status: string) {
		switch (status) {
			case 'done': return '#10b981';
			case 'cancelled': return '#ef4444';
			case 'in_progress': return '#5e6ad2';
			default: return '#888';
		}
	}

	const sessionColumns: ColumnDef<any, any>[] = [
		{ header: 'Tanggal', accessorKey: 'date', cell: ({ getValue }) => `<span style="font-weight:500">${formatDate(getValue() as string)}</span>` },
		{ header: 'Waktu', accessorKey: 'startTime', cell: ({ row }) => `<span style="color:var(--text-secondary)">${row.original.startTime?.slice(0,5)}-${row.original.endTime?.slice(0,5)}</span>` },
		{ header: 'Mapel', accessorKey: 'subject', cell: ({ getValue }) => `<span style="color:var(--text-secondary)">${(getValue() as string) || '-'}</span>` },
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const c = getSessionBadge(s);
				return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;background:${c}20;color:${c}">${s}</span>`;
			}
		},
		{ header: 'Catatan', accessorKey: 'notes', cell: ({ getValue }) => `<span style="color:var(--text-tertiary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${(getValue() as string) || '-'}</span>` },
	];
</script>

<svelte:head>
	<title>{student?.name || 'Detail Siswa'} — Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/tutor/siswa">← Data Siswa</a></div>

		{#if loading}
			<Loading message="Memuat data..." />
		{:else if error}
			<div class="error-state">{error}</div>
		{:else if student}
			<div class="student-header">
				<div class="student-info">
					<h1>{student.name}</h1>
					<p class="subtitle">
						Paket: {student.package || '-'}
						<span class="sep">·</span>
						Sisa sesi: <strong>{student.remainingSessions}/{student.totalSessions}</strong>
						<span class="sep">·</span>
						<Badge variant={getStatusBadge(student.status)}>{getStatusLabel(student.status)}</Badge>
					</p>
				</div>
			</div>

			<div class="tabs">
				<button class="tab" class:tab--active={activeTab === 'sessions'} onclick={() => activeTab = 'sessions'}>
					📋 Riwayat Sesi
				</button>
				<button class="tab" class:tab--active={activeTab === 'notes'} onclick={() => activeTab = 'notes'}>
					📝 Catatan Progres
				</button>
			</div>

			{#if activeTab === 'sessions'}
				{#if sessions.length === 0}
					<EmptyState icon="📋" title="Belum Ada Sesi" description="Belum ada sesi untuk siswa ini." />
				{:else}
					<DataTable columns={sessionColumns} data={sessions} pageSize={10} showSearch={false} showPagination={true} />
				{/if}
			{:else}
				{#if progressNotes.length === 0}
					<EmptyState icon="📝" title="Belum Ada Catatan" description="Belum ada catatan progres." />
				{:else}
					<div class="notes-list">
						{#each progressNotes as n}
							<div class="note-card">
								<div class="note-header">
									<span class="note-date">{formatDateTime(n.createdAt)}</span>
								</div>
								<p class="note-text">{n.note}</p>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</div>

<style>
	.page { max-width: 860px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.student-header { margin-bottom: 24px; }
	.student-info h1 { font-size: 24px; margin: 0 0 8px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.sep { color: var(--text-quaternary); }

	.tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
	.tab {
		padding: 10px 20px; font-size: 14px; font-weight: 500; color: var(--text-secondary);
		background: transparent; border: none; border-bottom: 2px solid transparent;
		cursor: pointer; font-family: inherit; transition: all 0.15s;
	}
	.tab:hover { color: var(--text); }
	.tab--active { color: var(--accent); border-bottom-color: var(--accent); }

	.notes-list { display: flex; flex-direction: column; gap: 8px; }
	.note-card {
		padding: 16px 20px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 10px;
	}
	.note-header { margin-bottom: 8px; }
	.note-date { font-size: 12px; color: var(--text-tertiary); }
	.note-text { margin: 0; font-size: 14px; line-height: 1.6; color: var(--text); white-space: pre-wrap; }
</style>
