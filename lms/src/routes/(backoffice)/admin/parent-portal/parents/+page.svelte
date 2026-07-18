<script lang="ts">
	import { onMount } from 'svelte';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	type Parent = {
		id: string;
		userId: string;
		name: string;
		phone: string | null;
		email: string | null;
		relationship: string;
		isPrimary: number;
		createdAt: string | null;
		linkedStudents: number;
	};

	let parents = $state<Parent[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingId = $state('');
	let saving = $state(false);

	let formUserId = $state('');
	let formName = $state('');
	let formPhone = $state('');
	let formEmail = $state('');
	let formRelationship = $state('father');
	let formIsPrimary = $state(false);

	const relationshipOptions = [
		{ value: 'father', label: 'Ayah' },
		{ value: 'mother', label: 'Ibu' },
		{ value: 'guardian', label: 'Wali' },
	];

	async function loadParents() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/parent-portal/parents');
			const json = await res.json();
			if (json.success) {
				parents = json.data || [];
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editingId = '';
		formUserId = '';
		formName = '';
		formPhone = '';
		formEmail = '';
		formRelationship = 'father';
		formIsPrimary = false;
		showModal = true;
	}

	function openEdit(p: Parent) {
		editingId = p.id;
		formUserId = p.userId;
		formName = p.name;
		formPhone = p.phone || '';
		formEmail = p.email || '';
		formRelationship = p.relationship;
		formIsPrimary = p.isPrimary === 1;
		showModal = true;
	}

	async function submitForm() {
		saving = true;
		try {
			const payload = {
				userId: formUserId,
				name: formName,
				phone: formPhone || undefined,
				email: formEmail || undefined,
				relationship: formRelationship,
				isPrimary: formIsPrimary ? 1 : 0,
			};
			const url = editingId
				? `/api/admin/parent-portal/parents/${editingId}`
				: '/api/admin/parent-portal/parents';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				showModal = false;
				loadParents();
			} else {
				error = json.error || 'Gagal menyimpan';
			}
		} catch {
			error = 'Gagal menyimpan data';
		} finally {
			saving = false;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	const relationshipLabel: Record<string, string> = {
		father: 'Ayah', mother: 'Ibu', guardian: 'Wali',
	};

	onMount(loadParents);
const parentColumns: ColumnDef<any, any>[] = [
	{
		header: 'Nama',
		accessorKey: 'name',
		cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
	},
	{
		header: 'Telepon',
		accessorKey: 'phone',
		cell: ({ getValue }) => (getValue() as string) || '\u2014'
	},
	{
		header: 'Email',
		accessorKey: 'email',
		cell: ({ getValue }) => (getValue() as string) || '\u2014'
	},
	{
		header: 'Hubungan',
		accessorKey: 'relationship',
		cell: ({ getValue }) => {
			const v = getValue() as string;
			return relationshipOptions.find(o => o.value === v)?.label || v;
		}
	},
	{
		header: 'Primer',
		accessorKey: 'isPrimary',
		cell: ({ getValue }) => {
			const v = getValue() as number;
			return v === 1 ? '<span style="color:#10b981;font-weight:600">Ya</span>' : '<span style="color:var(--text-secondary)">Tidak</span>';
		}
	},
	{
		header: 'Siswa Terkait',
		accessorKey: 'linkedStudents',
		cell: ({ getValue }) => `<span style="font-weight:600">${getValue()}</span>`
	},
	{
		header: 'Aksi',
		id: 'actions',
		cell: ({ row }) => {
			const p = row.original;
			return `<a href="/admin/parent-portal/parents/${p.id}" class="btn-small">Detail</a>`;
		}
	},
];

</script>

<div class="pp-page">
	<div class="pp-header">
		<div>
			<h1 class="pp-title">Orang Tua / Wali</h1>
			<p class="pp-subtitle">Daftar akun orang tua dan wali murid</p>
		</div>
		<button class="pp-btn pp-btn-primary" onclick={openCreate}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Tambah Orang Tua
		</button>
	</div>

	{#if loading}
		<div class="pp-loading">
			<div class="pp-spinner"></div>
			<p>Memuat data...</p>
		</div>
	{:else if error}
		<div class="pp-error">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
			<p>{error}</p>
			<button class="pp-btn pp-btn-ghost" onclick={loadParents}>Coba Lagi</button>
		</div>
	{:else if parents.length === 0}
		<div class="pp-empty">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
			<p>Belum ada orang tua terdaftar</p>
			<button class="pp-btn pp-btn-primary" onclick={openCreate}>Tambah Orang Tua Pertama</button>
		</div>
	{:else}
		<div class="pp-table-wrap">
			<table class="pp-table">
				<thead>
					<tr>
						<th>Nama</th>
						<th>Hubungan</th>
						<th>Kontak</th>
						<th>Primer</th>
						<th>Tautan Siswa</th>
						<th>Dibuat</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each parents as p}
						<tr>
							<td class="pp-name-cell">
								<a href="/admin/parent-portal/parents/{p.id}" class="pp-link">{p.name}</a>
							</td>
							<td>{relationshipLabel[p.relationship] || p.relationship}</td>
							<td class="pp-mono">{p.phone || p.email || '-'}</td>
							<td>{p.isPrimary === 1 ? 'Ya' : '-'}</td>
							<td>{p.linkedStudents} siswa</td>
							<td>{formatDate(p.createdAt)}</td>
							<td>
								<button class="pp-btn pp-btn-ghost pp-btn-sm" onclick={() => openEdit(p)}>Edit</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="pp-overlay" onclick={() => showModal = false}>
		<div class="pp-modal" onclick={(e) => e.stopPropagation()}>
			<div class="pp-modal-header">
				<h3>{editingId ? 'Edit Orang Tua' : 'Tambah Orang Tua'}</h3>
				<button class="pp-btn-close" onclick={() => showModal = false}>&times;</button>
			</div>
			<form class="pp-form" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
				<div class="pp-field">
					<label class="pp-label">User ID</label>
					<input class="pp-input" bind:value={formUserId} placeholder="user_id" required disabled={!!editingId} />
				</div>
				<div class="pp-field">
					<label class="pp-label">Nama Lengkap</label>
					<input class="pp-input" bind:value={formName} placeholder="Nama orang tua" required />
				</div>
				<div class="pp-row">
					<div class="pp-field">
						<label class="pp-label">No. Telepon</label>
						<input class="pp-input" bind:value={formPhone} placeholder="08xxxxxxxxxx" />
					</div>
					<div class="pp-field">
						<label class="pp-label">Email</label>
						<input class="pp-input" bind:value={formEmail} type="email" placeholder="email@example.com" />
					</div>
				</div>
				<div class="pp-row">
					<div class="pp-field">
						<label class="pp-label">Hubungan</label>
						<select class="pp-input" bind:value={formRelationship}>
							{#each relationshipOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="pp-field">
						<label class="pp-label">&nbsp;</label>
						<label class="pp-checkbox">
							<input type="checkbox" bind:checked={formIsPrimary} />
							<span>Orang Tua Primer</span>
						</label>
					</div>
				</div>
				<div class="pp-modal-actions">
					<button type="button" class="pp-btn pp-btn-ghost" onclick={() => showModal = false}>Batal</button>
					<button type="submit" class="pp-btn pp-btn-primary" disabled={saving}>
						{saving ? 'Menyimpan...' : 'Simpan'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.pp-page { display: flex; flex-direction: column; gap: 20px; }
	.pp-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
	.pp-title { font-size: 24px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; letter-spacing: -0.3px; }
	.pp-subtitle { font-size: 13px; color: var(--text-secondary, #8a8f98); margin: 4px 0 0; }

	.pp-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); }
	.pp-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, rgba(255,255,255,0.08)); border-top-color: var(--accent, #7170ff); border-radius: 50%; animation: pp-spin 0.7s linear infinite; }
	@keyframes pp-spin { to { transform: rotate(360deg); } }

	.pp-error { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #ef4444; text-align: center; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 10px; }

	.pp-table-wrap { background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; overflow: hidden; }
	.pp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.pp-table th { text-align: left; padding: 10px 20px; font-size: 11px; font-weight: 600; color: var(--text-secondary, #8a8f98); text-transform: uppercase; letter-spacing: 0.04em; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); white-space: nowrap; }
	.pp-table td { padding: 12px 20px; color: var(--text-primary, #d0d6e0); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.04)); }
	.pp-table tbody tr:hover { background: rgba(255,255,255,0.02); }
	.pp-name-cell { font-weight: 500; }
	.pp-link { color: var(--accent, #7170ff); text-decoration: none; }
	.pp-link:hover { text-decoration: underline; }
	.pp-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }

	.pp-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 20px; color: var(--text-secondary, #8a8f98); background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 10px; }

	/* Buttons */
	.pp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
	.pp-btn-primary { background: var(--accent, #7170ff); color: #fff; }
	.pp-btn-primary:hover { background: #5f5ee6; }
	.pp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.pp-btn-ghost { background: transparent; color: var(--accent, #7170ff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
	.pp-btn-ghost:hover { background: rgba(255,255,255,0.04); }
	.pp-btn-sm { padding: 5px 12px; font-size: 12px; }

	/* Modal */
	.pp-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
	.pp-modal { background: var(--bg-secondary, #1a1b1e); border: 1px solid var(--border-color, rgba(255,255,255,0.12)); border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
	.pp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
	.pp-modal-header h3 { font-size: 17px; font-weight: 600; color: var(--text-primary, #f7f8f8); margin: 0; }
	.pp-btn-close { background: none; border: none; color: var(--text-secondary, #8a8f98); font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
	.pp-btn-close:hover { color: var(--text-primary, #f7f8f8); }

	.pp-form { display: flex; flex-direction: column; gap: 16px; padding: 20px 24px 24px; }
	.pp-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.pp-label { font-size: 12px; font-weight: 500; color: var(--text-secondary, #8a8f98); }
	.pp-input { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color, rgba(255,255,255,0.1)); background: var(--bg-primary, #141517); color: var(--text-primary, #f7f8f8); font-size: 13px; outline: none; transition: border-color 0.15s; }
	.pp-input:focus { border-color: var(--accent, #7170ff); }
	.pp-input::placeholder { color: var(--text-secondary, #8a8f98); }
	.pp-row { display: flex; gap: 12px; }
	.pp-checkbox { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary, #d0d6e0); cursor: pointer; margin-top: 16px; }
	.pp-checkbox input { width: 16px; height: 16px; accent-color: var(--accent, #7170ff); }

	.pp-modal-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }

	@media (max-width: 640px) { .pp-row { flex-direction: column; } }
</style>
