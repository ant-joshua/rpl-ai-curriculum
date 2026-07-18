<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let rooms: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingId = $state('');
	let saving = $state(false);
	let saveError = $state('');
	let searchQuery = $state('');

	let form = $state({
		name: '', code: '', capacity: 40, building: '', floor: 1, facilities: '', is_active: 1
	});

	let filteredRooms = $derived.by(() => {
		if (!searchQuery.trim()) return rooms;
		const q = searchQuery.toLowerCase();
		return rooms.filter(r =>
			(r.name || '').toLowerCase().includes(q) ||
			(r.code || '').toLowerCase().includes(q) ||
			(r.building || '').toLowerCase().includes(q) ||
			(r.facilities || '').toLowerCase().includes(q)
		);
	});
	let activeCount = $derived(rooms.filter(r => r.is_active).length);

	onMount(() => { if (browser) loadRooms(); });

	async function loadRooms() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/exam-scheduler/rooms');
			const json = await res.json();
			if (json.success) rooms = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openCreate() {
		editingId = '';
		form = { name: '', code: '', capacity: 40, building: '', floor: 1, facilities: '', is_active: 1 };
		showModal = true; saveError = '';
	}

	function openEdit(room: any) {
		editingId = room.id;
		form = {
			name: room.name,
			code: room.code || '',
			capacity: room.capacity || 40,
			building: room.building || '',
			floor: room.floor || 1,
			facilities: room.facilities || '',
			is_active: room.is_active ?? 1
		};
		showModal = true; saveError = '';
	}

	function closeModal() { showModal = false; editingId = ''; saveError = ''; }

	async function save() {
		if (!form.name.trim()) { saveError = 'Nama ruangan wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const url = editingId
				? `/api/admin/exam-scheduler/rooms/${editingId}`
				: '/api/admin/exam-scheduler/rooms';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			const json = await res.json();
			if (json.success) { closeModal(); loadRooms(); }
			else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Gagal terhubung ke server'; }
		finally { saving = false; }
	}

	async function deleteRoom(id: string) {
		if (!confirm('Hapus ruangan ini?')) return;
		try {
			const res = await fetch(`/api/admin/exam-scheduler/rooms/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) loadRooms();
			else alert(json.error || 'Gagal menghapus');
		} catch { alert('Terjadi kesalahan'); }
	}

	function parseFacilities(raw: any): string {
		if (!raw) return '—';
		try {
			const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
			if (Array.isArray(parsed)) return parsed.join(', ');
			return String(parsed);
		} catch { return String(raw); }
	}
const roomColumns: ColumnDef<any, any>[] = [
	{
		header: 'Nama',
		accessorKey: 'name',
		cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
	},
	{
		header: 'Kode',
		accessorKey: 'code',
		cell: ({ getValue }) => {
			const v = getValue() as string;
			return v ? `<code>${v}</code>` : '\u2014';
		}
	},
	{
		header: 'Kapasitas',
		accessorKey: 'capacity',
		cell: ({ getValue }) => getValue() ?? '\u2014'
	},
	{
		header: 'Gedung',
		accessorKey: 'building',
		cell: ({ getValue }) => (getValue() as string) || '\u2014'
	},
	{
		header: 'Lantai',
		accessorKey: 'floor',
		cell: ({ getValue }) => getValue() || '\u2014'
	},
	{
		header: 'Fasilitas',
		accessorKey: 'facilities',
		cell: ({ getValue }) => `<span style="font-size:12px;color:var(--text-secondary)">${parseFacilities(getValue())}</span>`
	},
	{
		header: 'Status',
		accessorKey: 'is_active',
		cell: ({ getValue }) => {
			const active = getValue();
			return active
				? '<span class="badge badge-active">'+t('common.active')+'</span>'
				: '<span class="badge badge-inactive">Nonaktif</span>';
		}
	},
	{
		header: 'Aksi',
		id: 'actions',
		cell: ({ row }) => {
			const r = row.original;
			return `<div style="display:flex;gap:8px"><button class="btn-sm" onclick="window.__editRoom && window.__editRoom('${r.id}')">$'+t('common.edit')+'</button><button class="btn-sm btn-danger" onclick="window.__deleteRoom && window.__deleteRoom('${r.id}')">Hapus</button></div>`;
		}
	},
];

  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h2>Ruangan Ujian</h2>
			<p class="page-desc">{rooms.length} ruangan · {activeCount} aktif</p>
		</div>
		<Button variant="primary" class="btn" onclick={openCreate}>+ Tambah Ruangan</Button>
	</div>

	{#if !loading && rooms.length > 0}
		<div class="search-bar">
<Input bind:value={searchQuery} placeholder="🔍 Cari ruangan..." class="search-input" />
		</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button class="btn" onclick={loadRooms}>{t('common.retry')}</Button>
		</div>
	{:else if rooms.length === 0}
		<div class="empty-state">
			<p>Belum ada ruangan ujian</p>
			<Button variant="primary" class="btn" onclick={openCreate}>Tambah Ruangan Pertama</Button>
		</div>
	{:else if filteredRooms.length === 0}
		<div class="empty-state">
			<p>Tidak ada ruangan yang cocok dengan pencarian</p>
		</div>
	{:else}
		<DataTable columns={roomColumns} data={rooms} pageSize={20} showSearch={false} searchPlaceholder="Cari ruangan..." emptyMessage="Belum ada ruangan" />
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" onclick={closeModal} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>{editingId ? 'Edit Ruangan' : 'Tambah Ruangan'}</h3>
			{#if saveError}<div class="error-banner">{saveError}</div>{/if}
			<form onsubmit={(e) => { e.preventDefault(); save(); }}>
				<div class="form-grid">
					<div class="form-group">
<Input label="Nama Ruangan *" bind:value={form.name} placeholder="Ruang Aula" required />
					</div>
					<div class="form-group">
<Input label={t('common.code')} bind:value={form.code} placeholder="AULA-01" />
					</div>
					<div class="form-group">
						<label for="room-capacity">{t('admin.kapasitas')}</label>
						<input id="room-capacity" type="number" bind:value={form.capacity} min="1" required />
					</div>
					<div class="form-group">
<Input label="Gedung" bind:value={form.building} placeholder="Gedung A" />
					</div>
					<div class="form-group">
						<label for="room-floor">Lantai</label>
						<input id="room-floor" type="number" bind:value={form.floor} min="0" />
					</div>
					<div class="form-group">
<Input label="Fasilitas (koma dipisah)" bind:value={form.facilities} placeholder="AC, Proyektor, CCTV" />
					</div>
				</div>
				<div class="modal-actions">
					<Button class="btn" type="button" onclick={closeModal}>{t('common.cancel')}</Button>
					<Button variant="primary" class="btn" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.page { padding: 24px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--text-primary); }
	.page-desc { color: var(--text-secondary); font-size: 13px; margin: 4px 0 0; }
	.search-bar { margin-bottom: 16px; }
	.search-input { width: 100%; max-width: 360px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; }
	.search-input:focus { outline: none; border-color: var(--accent); }
	.loading, .error-state, .empty-state { text-align: center; padding: 48px; color: var(--text-secondary); }
	.table-wrap { overflow-x: auto; }
	.data-table { width: 100%; border-collapse: collapse; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; }
	.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 13px; }
	.data-table th { color: var(--text-secondary); font-weight: 500; background: var(--bg-tertiary); }
	.data-table td { color: var(--text-primary); }
	.font-medium { font-weight: 500; }
	.facilities { font-size: 12px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.actions { display: flex; gap: 8px; }
	code { font-size: 12px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; }
	.badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
	.badge-active { background: rgba(16,185,129,0.15); color: #10b981; }
	.badge-inactive { background: rgba(107,114,128,0.15); color: #8a8f98; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; width: 90%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal h3 { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: var(--text-primary); }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
	input { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; }
	input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); }
	.error-banner { background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.3); color: #ff4757; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
	.btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; cursor: pointer; }
	.btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-sm { padding: 4px 10px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; }
	.btn-sm:hover { background: var(--bg-tertiary); }
	.btn-danger { color: #ef4444; border-color: rgba(239,68,68,0.3); }
	.btn-danger:hover { background: rgba(239,68,68,0.1); }
</style>
