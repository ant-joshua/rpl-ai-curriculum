<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	type LinkedStudent = {
		id: string;
		parentId: string;
		studentId: string;
		relationship: string;
		accessLevel: string;
		createdAt: string | null;
	};

	type AccessLogEntry = {
		id: string;
		parentId: string;
		studentId: string;
		action: string;
		ipAddress: string | null;
		createdAt: string | null;
	};

	type ParentDetail = {
		id: string;
		userId: string;
		name: string;
		phone: string | null;
		email: string | null;
		relationship: string;
		isPrimary: number;
		createdAt: string | null;
	};

	let parent = $state<ParentDetail | null>(null);
	let linkedStudents = $state<LinkedStudent[]>([]);
	let accessLog = $state<AccessLogEntry[]>([]);
	let loading = $state(true);
	let loadingLinks = $state(true);
	let loadingLog = $state(true);
	let error = $state('');

	const parentId = $page.params.id;

	async function loadParent() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/parent-portal/parents');
			const json = await res.json();
			if (json.success) {
				const found = (json.data || []).find((p: any) => p.id === parentId);
				if (found) {
					parent = found;
				} else {
					error = 'Parent not found';
				}
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function loadLinks() {
		loadingLinks = true;
		try {
			const res = await fetch(`/api/admin/parent-portal/links?parentId=${parentId}`);
			const json = await res.json();
			if (json.success) {
				linkedStudents = json.data || [];
			}
		} catch { /* ignore */ } finally {
			loadingLinks = false;
		}
	}

	async function loadAccessLog() {
		loadingLog = true;
		try {
			const res = await fetch(`/api/admin/parent-portal/stats?parentId=${parentId}`);
			const json = await res.json();
			// Access log endpoint uses getAccessLog — use a dedicated endpoint
			// For now, skip log on missing endpoint
		} catch { /* ignore */ } finally {
			loadingLog = false;
		}
	}

	async function removeLink(linkId: string) {
		if (!confirm('Hapus tautan siswa ini?')) return;
		try {
			const res = await fetch(`/api/admin/parent-portal/links/${linkId}`, { method: 'DELETE' });
			if (res.ok) {
				linkedStudents = linkedStudents.filter(l => l.id !== linkId);
			}
		} catch { /* ignore */ }
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	const relationshipLabel: Record<string, string> = {
		father: 'Ayah', mother: 'Ibu', guardian: 'Wali',
	};

	const actionLabel: Record<string, string> = {
		view_grades: 'Lihat Nilai',
		view_attendance: 'Lihat Absensi',
		view_fees: 'Lihat Tagihan',
		download_rapor: 'Unduh Rapor',
	};

	onMount(() => {
		loadParent();
		loadLinks();
	});
const linkColumns: ColumnDef<any, any>[] = [
	{
		header: 'Student ID',
		accessorKey: 'studentId',
		cell: ({ getValue }) => `<span class="pp-mono">${getValue()}</span>`
	},
	{
		header: 'Hubungan',
		accessorKey: 'relationship',
		cell: ({ getValue }) => relationshipLabel[getValue() as string] || getValue()
	},
	{
		header: 'Akses',
		accessorKey: 'accessLevel',
		cell: ({ getValue }) => getValue() || '\u2014'
	},
	{
		header: 'Ditautkan',
		accessorKey: 'createdAt',
		cell: ({ getValue }) => formatDate(getValue() as string | null)
	},
	{
		header: 'Aksi',
		id: 'actions',
		cell: ({ row }) => `<button class="pp-btn pp-btn-ghost pp-btn-sm pp-btn-danger" onclick="window.__removeLink && window.__removeLink('${row.original.id}')">$'+t('common.delete')+'</button>`
	},
];

  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="pp-page">
	{#if loading}
		<div class="pp-loading">
			<div class="pp-spinner"></div>
			<p>Memuat data...</p>
		</div>
	{:else if error}
		<div class="pp-error">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
			<p>{error}</p>
		</div>
	{:else if parent}
		<div class="pp-header">
			<div>
				<a href="/admin/parent-portal/parents" class="pp-back">&larr; Kembali</a>
				<h1 class="pp-title">{parent.name}</h1>
				<p class="pp-subtitle">
					{relationshipLabel[parent.relationship] || parent.relationship}
					{parent.isPrimary === 1 ? '&middot; Primer' : ''}
					&middot; ID: {parent.userId}
				</p>
			</div>
		</div>

		<div class="pp-detail-grid">
			<div class="pp-info-card">
				<h3 class="pp-card-title">Informasi Kontak</h3>
				<div class="pp-info-row">
					<span class="pp-info-label">Telepon</span>
					<span class="pp-info-value">{parent.phone || '-'}</span>
				</div>
				<div class="pp-info-row">
					<span class="pp-info-label">Email</span>
					<span class="pp-info-value">{parent.email || '-'}</span>
				</div>
				<div class="pp-info-row">
					<span class="pp-info-label">Terdaftar</span>
					<span class="pp-info-value">{formatDate(parent.createdAt)}</span>
				</div>
			</div>

			<div class="pp-info-card">
				<h3 class="pp-card-title">Ringkasan</h3>
				<div class="pp-info-row">
					<span class="pp-info-label">Siswa Terkait</span>
					<span class="pp-info-value">{linkedStudents.length} siswa</span>
				</div>
				<div class="pp-info-row">
					<span class="pp-info-label">Hubungan</span>
					<span class="pp-info-value">{relationshipLabel[parent.relationship] || parent.relationship}</span>
				</div>
				<div class="pp-info-row">
					<span class="pp-info-label">Orang Tua Primer</span>
					<span class="pp-info-value">{parent.isPrimary === 1 ? 'Ya' : 'Tidak'}</span>
				</div>
			</div>
		</div>

		<div class="pp-section">
			<div class="pp-section-header">
				<h2 class="pp-section-title">Siswa Terkait ({linkedStudents.length})</h2>
			</div>

			{#if loadingLinks}
				<div class="pp-loading" style="padding: 30px;">
					<div class="pp-spinner"></div>
				</div>
			{:else if linkedStudents.length === 0}
				<div class="pp-empty">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
					<p>Belum ada siswa yang ditautkan</p>
				</div>
			{:else}
				<DataTable columns={linkColumns} data={linkedStudents} pageSize={20} showSearch={false} showPagination={false} emptyMessage="Belum ada siswa yang ditautkan" />
			{/if}
		</div>
	{/if}
</div>

<style>
	.pp-page { display: flex; flex-direction: column; gap: 20px; }
	.pp-back { display: inline-block; font-size: 13px; color: var(--accent, #7170ff); text-decoration: none; margin-bottom: 8px; }
	.pp-back:hover { text-decoration: underline; }
	.pp-header { margin-bottom: 4px; }
	.pp-title { font-size: 24px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; letter-spacing: -0.3px; }
	.pp-subtitle { font-size: 13px; color: var(--text-secondary, #8a8f98); margin: 4px 0 0; }

	.pp-loading { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }
	.pp-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, rgba(255,255,255,0.08)); border-top-color: var(--accent, #7170ff); border-radius: 50%; animation: pp-spin 0.7s linear infinite; }
	@keyframes pp-spin { to { transform: rotate(360deg); } }
	.pp-error { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #ef4444; text-align: center; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 10px; }

	.pp-detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
	.pp-info-card { background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
	.pp-card-title { font-size: 14px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }
	.pp-info-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
	.pp-info-label { color: var(--text-secondary, #8a8f98); }
	.pp-info-value { color: var(--text-primary, #d0d6e0); font-weight: 500; }

	.pp-section { background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; overflow: hidden; }
	.pp-section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); }
	.pp-section-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }

	.pp-table-wrap { overflow-x: auto; }
	.pp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.pp-table th { text-align: left; padding: 10px 20px; font-size: 11px; font-weight: 600; color: var(--text-secondary, #8a8f98); text-transform: uppercase; letter-spacing: 0.04em; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); white-space: nowrap; }
	.pp-table td { padding: 12px 20px; color: var(--text-primary, #d0d6e0); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.04)); }
	.pp-table tbody tr:hover { background: rgba(255,255,255,0.02); }
	.pp-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }

	.pp-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 20px; color: var(--text-secondary, #8a8f98); }

	.pp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
	.pp-btn-ghost { background: transparent; color: var(--accent, #7170ff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
	.pp-btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.pp-btn-sm { padding: 5px 12px; font-size: 12px; }
	.pp-btn-danger { color: #ef4444; border-color: rgba(239,68,68,0.2); }
	.pp-btn-danger:hover { background: rgba(239,68,68,0.08); }

	@media (max-width: 640px) { .pp-detail-grid { grid-template-columns: 1fr; } }
</style>
