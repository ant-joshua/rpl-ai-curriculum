<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Button, DataTable, Input, Select, Textarea } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type Session = {
		id: string;
		class_subject_id: string;
		class_name: string;
		subject_name: string;
		creator_name: string;
		academic_year: string;
		semester: number;
		session_date: string;
		start_time: string;
		end_time: string | null;
		status: 'active' | 'closed';
		qr_token: string;
		notes: string | null;
		created_at: string;
	};

	let sessions = $state<Session[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');
	let showCreateModal = $state(false);
	let closingId = $state<string | null>(null);
	let closingError = $state('');

	// Create form
	let formClassSubjectId = $state('');
	let formAcademicYear = $state(String(new Date().getFullYear()));
	let formSemester = $state(1);
	let formDate = $state(new Date().toISOString().split('T')[0]);
	let formStartTime = $state(
		new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
	);
	let formNotes = $state('');
	let formCreating = $state(false);
	let createdSession = $state<Session | null>(null);
	let formError = $state('');

	// Filter
	let filterStatus = $state('');
	let filterDate = $state('');
	let currentPage = $state(1);

	const classSubjects = $state<{ id: string; name: string }[]>([]);

	onMount(() => {
		if (!browser) return;
		loadSessions();
		loadClassSubjects();
	});

	async function loadClassSubjects() {
		try {
			const res = await fetch('/api/admin/class-sessions');
			const json = await res.json();
			if (json.success) {
				classSubjects.length = 0;
				for (const cs of json.data || []) {
					classSubjects.push({ id: cs.id, name: `${cs.class_name || ''} - ${cs.subject_name || ''}` });
				}
			}
		} catch {}
	}

	async function loadSessions() {
		loading = true;
		error = '';
		try {
			let url = `/api/admin/attendance/sessions?page=${currentPage}&limit=20`;
			if (filterStatus) url += `&status=${filterStatus}`;
			if (filterDate) url += `&date=${filterDate}`;

			const res = await fetch(url);
			const json = await res.json();
			if (json.success) {
				sessions = json.data || [];
				total = json.total || 0;
			} else {
				error = json.error || 'Gagal memuat sesi';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function createSession() {
		formCreating = true;
		formError = '';
		createdSession = null;
		try {
			const res = await fetch('/api/admin/attendance/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					class_subject_id: formClassSubjectId,
					academic_year: formAcademicYear,
					semester: formSemester,
					session_date: formDate,
					start_time: formStartTime,
					notes: formNotes || undefined
				})
			});
			const json = await res.json();
			if (json.success) {
				createdSession = json.data;
				await loadSessions();
			} else {
				formError = json.error || 'Gagal membuat sesi';
			}
		} catch {
			formError = 'Gagal terhubung ke server';
		} finally {
			formCreating = false;
		}
	}

	async function closeSession(sessionId: string) {
		closingId = sessionId;
		closingError = '';
		try {
			const res = await fetch(`/api/admin/attendance/sessions/${sessionId}`, {
				method: 'PUT'
			});
			const json = await res.json();
			if (json.success) {
				await loadSessions();
			} else {
				closingError = json.error || 'Gagal menutup sesi';
			}
		} catch {
			closingError = 'Gagal terhubung ke server';
		} finally {
			closingId = null;
		}
	}

	function formatDate(d: string) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function resetForm() {
		formClassSubjectId = '';
		formAcademicYear = String(new Date().getFullYear());
		formSemester = 1;
		formDate = new Date().toISOString().split('T')[0];
		formStartTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
		formNotes = '';
		formError = '';
		createdSession = null;
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Tanggal',
			accessorKey: 'session_date',
			cell: ({ row }) => formatDate(row.original.session_date)
		},
		{
			header: 'Kelas',
			accessorKey: 'class_name',
			cell: ({ getValue }) => `<span style="font-weight:600">${(getValue() as string) || '—'}</span>`
		},
		{
			header: 'Mata Kuliah',
			accessorKey: 'subject_name',
			cell: ({ getValue }) => (getValue() as string) || '—'
		},
		{
			header: 'Waktu',
			accessorKey: 'start_time',
			cell: ({ row }) => {
				const s = row.original;
				return `<span style="font-family:monospace;font-size:12px">${s.start_time}${s.end_time ? ` - ${s.end_time}` : ''}</span>`;
			}
		},
		{
			header: 'Pembuat',
			accessorKey: 'creator_name',
			cell: ({ getValue }) => (getValue() as string) || '—'
		},
		{
			header: 'QR Token',
			accessorKey: 'qr_token',
			cell: ({ getValue }) => {
				const token = getValue() as string;
				return `<span style="font-family:monospace;font-size:11px;color:var(--text-secondary)">${token?.slice(0, 8)}...</span>`;
			}
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const status = getValue() as string;
				const isActive = status === 'active';
				const bg = isActive ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)';
				const color = isActive ? '#22c55e' : '#9ca3af';
				const label = isActive ? '🟢 Aktif' : '⚫ Selesai';
				return `<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color}">${label}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ row }) => {
				const s = row.original;
				let html = `<a href="/admin/attendance/sessions/${s.id}" style="padding:4px 10px;background:var(--bg-secondary);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px;text-decoration:none">Detail</a>`;
				if (s.status === 'active') {
					html += ` <button onclick="window.__closeSession('${s.id}')" style="padding:4px 10px;background:transparent;color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;font-size:12px;cursor:pointer;margin-left:4px">$'+t('common.close')+'</button>`;
				}
				return html;
			}
		}
	];

	// Expose closeSession for inline HTML buttons
	$effect(() => {
		(window as any).__closeSession = closeSession;
		return () => { delete (window as any).__closeSession; };
	});
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>Sesi Presensi — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/admin/attendance">← Attendance System</a></div>
			<h1>📅 Sesi Presensi</h1>
			<p class="subtitle">{t('admin.kelola_sesi')}</p>
		</div>
		<Button variant="primary" onclick={() => { showCreateModal = true; resetForm(); }}>
			<Icon name="calendar" size={16} />
			Buat Sesi Baru
		</Button>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="filter-group">
<Select label={t('common.status')} bind:value={filterStatus} onchange={loadSessions} options={[{ value: "", label: t('common.all') }, { value: "active", label: t('common.active') }, { value: "closed", label: t('admin.selesai') }]} />
		</div>
		<div class="filter-group">
			<label for="filter-date">{t('admin.tanggal')}</label>
			<input id="filter-date" type="date" bind:value={filterDate} onchange={loadSessions} />
		</div>
		<div class="filter-action">
			<Button class="btn-outline" onclick={loadSessions}>
				<Icon name="search" size={14} />
				Filter
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>{t('admin.memuat_sesi')}</p>
		</div>
	{:else if error}
		<div class="error-state">
			<Icon name="alert-circle" size={24} />
			<p>{error}</p>
			<Button variant="secondary" onclick={loadSessions}>{t('common.retry')}</Button>
		</div>
	{:else if sessions.length === 0}
		<div class="empty-state">
			<Icon name="calendar" size={48} />
			<p>{t('admin.belum_ada_sesi')}</p>
			<Button variant="secondary" onclick={() => { showCreateModal = true; resetForm(); }}>
				Buat Sesi Pertama
			</Button>
		</div>
	{:else}
		<div class="table-wrap">
			<DataTable
				{columns}
				data={sessions}
				showSearch={false}
				showPagination={false}
				emptyMessage="Tidak ada sesi"
			/>
		</div>

		<!-- Pagination -->
		{#if total > 20}
			<div class="pagination">
				<Button
					class="btn-outline btn-sm"
					disabled={currentPage <= 1}
					onclick={() => { currentPage--; loadSessions(); }}
				>{t('admin.prev')}</Button>
				<span class="page-info">Halaman {currentPage} / {Math.ceil(total / 20)}</span>
				<Button
					class="btn-outline btn-sm"
					disabled={currentPage * 20 >= total}
					onclick={() => { currentPage++; loadSessions(); }}
				>{t('admin.next_page')}</Button>
			</div>
		{/if}
	{/if}
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div class="modal-overlay" onclick={() => showCreateModal = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{t('admin.buat_sesi_baru')}</h3>
				<Button class="modal-close" onclick={() => showCreateModal = false}>
					<Icon name="x" size={18} />
				</Button>
			</div>

			{#if createdSession}
				<div class="created-success">
					<Icon name="check-square" size={32} />
					<h4>{t('admin.sesi_berhasil_dibuat')}</h4>
					<p>{t('admin.qr_token')}</p>
					<div class="qr-display">
						<div class="qr-text">{createdSession.qr_token}</div>
					</div>
					<div class="modal-actions">
						<a href="/admin/attendance/sessions/{createdSession.id}" class="btn-primary">
							Lihat Detail
						</a>
						<Button class="btn-outline" onclick={() => { createdSession = null; resetForm(); }}>
							Buat Lagi
						</Button>
					</div>
				</div>
			{:else}
				<form class="modal-form" onsubmit={(e) => { e.preventDefault(); createSession(); }}>
					<div class="form-group">
<Select label="Kelas / Mata Kuliah *" bind:value={formClassSubjectId} required options={classSubjects.map((cs) => ({ value: cs.id, label: cs.name }))} />
					</div>

					<div class="form-row">
						<div class="form-group">
<Input label="Tahun Ajaran *" bind:value={formAcademicYear} placeholder="2025" required />
						</div>
						<div class="form-group">
<Select label="Semester *" bind:value={formSemester} />
						</div>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="cs-date">{t('admin.tanggal')}</label>
							<input id="cs-date" type="date" bind:value={formDate} />
						</div>
						<div class="form-group">
							<label for="cs-time">{t('admin.waktu_mulai')}</label>
							<input id="cs-time" type="time" bind:value={formStartTime} />
						</div>
					</div>

					<div class="form-group">
<Textarea label={t('admin.catatan')} placeholder="Opsional..." bind:value={formNotes} rows=2 />
					</div>

					{#if formError}
						<div class="form-error">{formError}</div>
					{/if}

					<div class="modal-actions">
						<Button class="btn-outline" type="button" onclick={() => showCreateModal = false}>{t('common.cancel')}</Button>
						<Button variant="primary" type="submit" disabled={formCreating}>
							{formCreating ? 'Membuat...' : 'Buat Sesi'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1200px; }
	.page-header {
		display: flex; justify-content: space-between; align-items: flex-start;
		margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
	}
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }

	.btn-primary {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 16px; background: var(--accent); color: #fff;
		border: none; border-radius: 8px; cursor: pointer;
		font-size: 13px; font-weight: 500; text-decoration: none;
	}
	.btn-primary:hover { background: var(--accent-hover); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-outline {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 14px; background: transparent; color: var(--accent);
		border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 13px;
	}
	.btn-outline:hover { border-color: var(--accent); background: var(--accent-dim); }

	.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
	.filter-group { display: flex; flex-direction: column; gap: 4px; }
	.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.filter-group select, .filter-group input {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.filter-action { padding-top: 18px; }

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

	.btn-secondary {
		padding: 8px 16px; background: var(--accent); color: #fff;
		border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
	}

	.table-wrap {
		overflow-x: auto; border: 1px solid var(--border);
		border-radius: 10px; background: var(--surface);
	}

	.actions { display: flex; gap: 6px; align-items: center; }
	.btn-sm {
		padding: 4px 10px; background: var(--bg-secondary); color: var(--text);
		border: 1px solid var(--border); border-radius: 6px; cursor: pointer;
		font-size: 12px; text-decoration: none; display: inline-block; font-family: inherit;
	}
	.btn-sm:hover { border-color: var(--accent); color: var(--accent); }
	.btn-sm.btn-close { color: var(--danger); border-color: rgba(239,68,68,0.3); }
	.btn-sm.btn-close:hover { background: rgba(239,68,68,0.1); border-color: var(--danger); }

	.pagination {
		display: flex; justify-content: center; align-items: center; gap: 12px;
		margin-top: 16px;
	}
	.page-info { font-size: 13px; color: var(--text-secondary); }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6);
		backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
		z-index: 200; padding: 20px;
	}
	.modal {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 16px; width: 100%; max-width: 520px;
		box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
		max-height: 90vh; overflow-y: auto;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 20px 24px; border-bottom: 1px solid var(--border);
	}
	.modal-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
	.modal-close {
		background: none; border: none; color: var(--text-secondary); cursor: pointer;
		padding: 4px; border-radius: 4px;
	}
	.modal-close:hover { color: var(--text); background: rgba(255,255,255,0.05); }

	.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
	.form-group { display: flex; flex-direction: column; gap: 4px; }
	.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.form-group select, .form-group input, .form-group textarea {
		padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.form-group textarea { resize: vertical; }
	.form-group select:focus, .form-group input:focus, .form-group textarea:focus {
		outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim);
	}
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.form-error { color: var(--danger); font-size: 13px; padding: 8px; background: rgba(239,68,68,0.08); border-radius: 6px; }

	.modal-actions {
		display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px;
		border-top: 1px solid var(--border);
	}

	.created-success {
		padding: 32px 24px; text-align: center; display: flex; flex-direction: column;
		align-items: center; gap: 12px;
	}
	.created-success h4 { font-size: 16px; margin: 8px 0 0; }
	.created-success p { color: var(--text-secondary); font-size: 13px; margin: 0; }

	.qr-display {
		padding: 20px; background: var(--bg-secondary); border: 2px dashed var(--border);
		border-radius: 12px; width: 100%; margin: 8px 0;
	}
	.qr-text {
		font-family: monospace; font-size: 18px; font-weight: 700; color: var(--text);
		word-break: break-all; text-align: center; letter-spacing: 1px;
	}
</style>
