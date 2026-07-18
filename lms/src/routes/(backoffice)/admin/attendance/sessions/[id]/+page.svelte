<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Button, DataTable, Input, Select, StatCard } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type SessionDetail = {
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
		location_required: boolean;
		location_lat: number | null;
		location_lng: number | null;
		notes: string | null;
		created_at: string;
		records: any[];
	};

	let session = $state<SessionDetail | null>(null);
	let loading = $state(true);
	let error = $state('');
	let closing = $state(false);
	let showManualCheckIn = $state(false);
	let manualStudentId = $state('');
	let manualStatus = $state<'present' | 'late' | 'absent' | 'excused'>('present');
	let checkingIn = $state(false);
	let checkInResult = $state('');
	let refreshInterval = $state<ReturnType<typeof setInterval> | null>(null);

	const sessionId = $derived($page.params.id);

	const statusCounts = $derived(() => {
		const records = session?.records || [];
		return {
			present: records.filter((r: any) => r.status === 'present').length,
			late: records.filter((r: any) => r.status === 'late').length,
			absent: records.filter((r: any) => r.status === 'absent').length,
			excused: records.filter((r: any) => r.status === 'excused').length,
			total: records.length
		};
	});

	onMount(() => {
		if (!browser) return;
		loadSession();
		refreshInterval = setInterval(() => {
			if (session?.status === 'active') loadSession();
		}, 10000);
		return () => {
			if (refreshInterval) clearInterval(refreshInterval);
		};
	});

	async function loadSession() {
		loading = !session;
		error = '';
		try {
			const res = await fetch(`/api/admin/attendance/sessions/${sessionId}`);
			const json = await res.json();
			if (json.success) {
				session = json.data;
			} else {
				error = json.error || 'Gagal memuat sesi';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function closeSession() {
		if (!confirm('Tutup sesi ini? Siswa tidak akan bisa check-in lagi.')) return;
		closing = true;
		try {
			const res = await fetch(`/api/admin/attendance/sessions/${sessionId}`, {
				method: 'PUT'
			});
			const json = await res.json();
			if (json.success) {
				session = json.data;
			}
		} catch {} finally {
			closing = false;
		}
	}

	async function manualCheckIn() {
		if (!manualStudentId.trim()) return;
		checkingIn = true;
		checkInResult = '';
		try {
			const res = await fetch(`/api/admin/attendance/sessions/${sessionId}/check-in`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					student_id: manualStudentId.trim(),
					method: 'manual',
					status: manualStatus
				})
			});
			const json = await res.json();
			if (json.success) {
				checkInResult = `✓ Check-in berhasil untuk siswa`;
				manualStudentId = '';
				await loadSession();
			} else {
				checkInResult = `✗ ${json.error || 'Gagal check-in'}`;
			}
		} catch {
			checkInResult = '✗ Gagal terhubung ke server';
		} finally {
			checkingIn = false;
		}
	}

	function formatDate(d: string) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function formatTime(t: string) {
		return t || '—';
	}

	function getStatusLabel(s: string) {
		switch (s) {
			case 'present': return 'Hadir';
			case 'late': return 'Terlambat';
			case 'absent': return 'Absen';
			case 'excused': return 'Izin/Sakit';
			default: return s;
		}
	}

	const statusColorMap: Record<string, string> = {
		present: 'background: rgba(34,197,94,0.12); color: #22c55e',
		late: 'background: rgba(245,158,11,0.12); color: #f59e0b',
		absent: 'background: rgba(239,68,68,0.12); color: #ef4444',
		excused: 'background: rgba(139,92,246,0.12); color: #8b5cf6',
	};

	const recordColumns: ColumnDef<any, any>[] = [
		{
			header: 'No', id: 'no',
			cell: ({ row }) => String(row.index + 1)
		},
		{
			header: 'Nama Siswa', id: 'nama',
			cell: ({ row }) => `<span style="font-weight:600">${row.original.student_name || row.original.student_id}</span>`
		},
		{
			header: 'NIS', accessorKey: 'nis',
			cell: ({ getValue }) => `<span style="font-family:monospace;font-size:12px">${getValue() || '—'}</span>`
		},
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				return `<span class="badge" style="${statusColorMap[s] || ''}">${getStatusLabel(s)}</span>`;
			}
		},
		{
			header: 'Metode', accessorKey: 'method',
			cell: ({ getValue }) => `<span style="font-family:monospace;font-size:12px">${getValue()}</span>`
		},
		{
			header: 'Waktu Check-in', accessorKey: 'check_in_time',
			cell: ({ getValue }) => {
				const v = getValue();
				const t = v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
				return `<span style="font-family:monospace;font-size:11px;color:var(--text-secondary)">${t}</span>`;
			}
		},
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/admin/attendance/sessions">← Sesi Presensi</a></div>
			<h1>📌 Detail Sesi Presensi</h1>
		</div>
		<div class="header-actions">
			{#if session?.status === 'active'}
				<Button variant="danger" onclick={closeSession} disabled={closing}>
					{closing ? 'Menutup...' : 'Tutup Sesi'}
				</Button>
			{/if}
		</div>
	</div>

	{#if loading && !session}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Memuat data sesi...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<Icon name="alert-circle" size={24} />
			<p>{error}</p>
			<Button variant="secondary" onclick={loadSession}>{t('common.retry')}</Button>
		</div>
	{:else if session}
		<!-- Session Info -->
		<div class="session-info">
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">{t('common.status')}</span>
					<span class="badge {session.status === 'active' ? 'badge-active' : 'badge-closed'}">
						{session.status === 'active' ? '🟢 Aktif' : '⚫ Selesai'}
					</span>
				</div>
				<div class="info-item">
					<span class="info-label">{t('admin.tanggal')}</span>
					<span class="info-value">{formatDate(session.session_date)}</span>
				</div>
				<div class="info-item">
					<span class="info-label">{t('admin.waktu')}</span>
					<span class="info-value">{formatTime(session.start_time)} {session.end_time ? `- ${session.end_time}` : ''}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Kelas</span>
					<span class="info-value">{session.class_name || '—'}</span>
				</div>
				<div class="info-item">
					<span class="info-label">{t('admin.mata_kuliah')}</span>
					<span class="info-value">{session.subject_name || '—'}</span>
				</div>
				<div class="info-item">
					<span class="info-label">{t('admin.tahun_ajaran')}</span>
					<span class="info-value">{session.academic_year} / Semester {session.semester}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Pembuat</span>
					<span class="info-value">{session.creator_name || '—'}</span>
				</div>
				{#if session.notes}
					<div class="info-item info-item--full">
						<span class="info-label">{t('admin.catatan')}</span>
						<span class="info-value">{session.notes}</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- QR Code Display -->
		{#if session.status === 'active'}
			<div class="qr-section">
				<h2 class="section-title">QR Code Presensi</h2>
				<div class="qr-card">
					<div class="qr-label">Scan QR ini untuk check-in</div>
					<div class="qr-display">
						<div class="qr-token">{session.qr_token}</div>
					</div>
					<div class="qr-meta">
						<span>Session: {session.id.slice(0, 8)}...</span>
						<span>{session.session_date} {session.start_time}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Stats -->
		<div class="record-stats">
			<StatCard icon="✅" value={statusCounts().present} label="Hadir" color="#22c55e" />
			<StatCard icon="🕐" value={statusCounts().late} label="Terlambat" color="#f59e0b" />
			<StatCard icon="❌" value={statusCounts().absent} label="Absen" color="#ef4444" />
			<StatCard icon="📝" value={statusCounts().excused} label="Izin/Sakit" color="#8b5cf6" />
			<StatCard icon="📊" value={statusCounts().total} label="Total Check-in" />
		</div>

		<!-- Manual Check-In -->
		{#if session.status === 'active'}
			<div class="manual-section">
				<div class="section-header" role="button" tabindex="0" onclick={() => showManualCheckIn = !showManualCheckIn}>
					<h2 class="section-title">Check-in Manual</h2>
					<Icon name={showManualCheckIn ? 'chevron-down' : 'chevron-down'} size={18} />
				</div>
				{#if showManualCheckIn}
					<div class="manual-form">
						<div class="form-row">
							<div class="form-group">
<Input label="Student ID" bind:value={manualStudentId} placeholder="ID siswa..." />
							</div>
							<div class="form-group">
<Select label={t('common.status')} bind:value={manualStatus} options={[{ value: "present", label: t('admin.hadir') }, { value: "late", label: t('admin.terlambat') }, { value: "absent", label: t('admin.absen') }, { value: "excused", label: "Izin/Sakit" }]} />
							</div>
							<div class="form-group">
								<Button
									class="btn-primary"
									onclick={manualCheckIn}
									disabled={checkingIn || !manualStudentId.trim()}
								>
									{checkingIn ? '...' : 'Check-in'}
								</Button>
							</div>
						</div>
						{#if checkInResult}
							<div class="checkin-result {checkInResult.startsWith('✓') ? 'result-success' : 'result-error'}">
								{checkInResult}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Attendance Records -->
		<div class="section">
			<h2 class="section-title">Daftar Kehadiran ({session.records?.length ?? 0})</h2>
			{#if (session.records || []).length === 0}
				<div class="empty-state">
					<Icon name="users" size={40} />
					<p>Belum ada siswa check-in</p>
				</div>
			{:else}
				<DataTable columns={recordColumns} data={session.records || []} pageSize={20} showSearch={true} searchPlaceholder="Cari siswa..." />
			{/if}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header {
		display: flex; justify-content: space-between; align-items: flex-start;
		margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
	}
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0; }

	.btn-danger {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 16px; background: rgba(239,68,68,0.12); color: #ef4444;
		border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; cursor: pointer;
		font-size: 13px; font-weight: 500;
	}
	.btn-danger:hover { background: rgba(239,68,68,0.2); }
	.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

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

	.session-info {
		padding: 20px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; margin-bottom: 24px;
	}
	.info-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;
	}
	.info-item { display: flex; flex-direction: column; gap: 4px; }
	.info-item--full { grid-column: 1 / -1; }
	.info-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.info-value { font-size: 14px; color: var(--text); }

	.badge {
		display: inline-block; padding: 3px 8px; border-radius: 6px;
		font-size: 11px; font-weight: 600;
	}
	.badge-active { background: rgba(34,197,94,0.12); color: #22c55e; }
	.badge-closed { background: rgba(156,163,175,0.12); color: #9ca3af; }

	.qr-section { margin-bottom: 24px; }
	.section-title { font-size: 16px; font-weight: 600; color: var(--text); margin: 0 0 12px; }
	.section-header {
		display: flex; justify-content: space-between; align-items: center;
		cursor: pointer; padding: 12px 0;
	}

	.qr-card {
		background: var(--surface); border: 2px dashed var(--accent);
		border-radius: 16px; padding: 32px; text-align: center;
		box-shadow: 0 0 40px rgba(94,106,210,0.1);
	}
	.qr-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
	.qr-display {
		background: var(--bg-secondary); border-radius: 12px; padding: 24px;
		margin: 0 auto; max-width: 400px;
	}
	.qr-token {
		font-family: monospace; font-size: 28px; font-weight: 800; color: var(--text);
		word-break: break-all; letter-spacing: 2px; line-height: 1.4;
	}
	.qr-meta {
		display: flex; justify-content: center; gap: 16px; margin-top: 16px;
		font-size: 12px; color: var(--text-secondary);
	}

	.record-stats {
		display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
	}

	.section { margin-bottom: 32px; }

	.manual-section { margin-bottom: 24px; }
	.manual-form {
		padding: 16px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 10px; margin-top: 8px;
	}
	.form-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
	.form-group { display: flex; flex-direction: column; gap: 4px; }
	.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
	.form-group input, .form-group select {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.form-group input:focus, .form-group select:focus {
		outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.btn-primary {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 16px; background: var(--accent); color: #fff;
		border: none; border-radius: 8px; cursor: pointer;
		font-size: 13px; font-weight: 500;
	}
	.btn-primary:hover { background: var(--accent-hover); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.checkin-result {
		margin-top: 8px; padding: 8px 12px; border-radius: 6px; font-size: 13px;
	}
	.result-success { background: rgba(34,197,94,0.1); color: #22c55e; }
	.result-error { background: rgba(239,68,68,0.1); color: #ef4444; }
</style>
