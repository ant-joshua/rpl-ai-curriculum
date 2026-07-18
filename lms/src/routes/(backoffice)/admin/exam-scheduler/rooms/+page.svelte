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
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h2>Ruangan Ujian</h2>
			<p class="page-desc">{rooms.length} ruangan · {activeCount} aktif</p>
		</div>
		<button class="btn btn-primary" onclick={openCreate}>+ Tambah Ruangan</button>
	</div>

	{#if !loading && rooms.length > 0}
		<div class="search-bar">
			<input type="text" class="search-input" placeholder="🔍 Cari ruangan..." bind:value={searchQuery} />
		</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<button class="btn" onclick={loadRooms}>Coba Lagi</button>
		</div>
	{:else if rooms.length === 0}
		<div class="empty-state">
			<p>Belum ada ruangan ujian</p>
			<button class="btn btn-primary" onclick={openCreate}>Tambah Ruangan Pertama</button>
		</div>
	{:else if filteredRooms.length === 0}
		<div class="empty-state">
			<p>Tidak ada ruangan yang cocok dengan pencarian</p>
		</div>
	{:else}
		<div class="table-wrap">
			<table class="data-table">
				<thead>
					<tr>
						<th>Nama</th>
						<th>Kode</th>
						<th>Kapasitas</th>
						<th>Gedung</th>
						<th>Lantai</th>
						<th>Fasilitas</th>
						<th>Status</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRooms as r (r.id)}
						<tr>
							<td class="font-medium">{r.name}</td>
							<td><code>{r.code || '—'}</code></td>
							<td>{r.capacity}</td>
							<td>{r.building || '—'}</td>
							<td>{r.floor || '—'}</td>
							<td class="facilities">{parseFacilities(r.facilities)}</td>
							<td>
								<span class="badge {r.is_active ? 'badge-active' : 'badge-inactive'}">
									{r.is_active ? 'Aktif' : 'Nonaktif'}
								</span>
							</td>
							<td class="actions">
								<button class="btn-sm" onclick={() => openEdit(r)}>Edit</button>
								<button class="btn-sm btn-danger" onclick={() => deleteRoom(r.id)}>Hapus</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
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
						<label for="room-name">Nama Ruangan *</label>
						<input id="room-name" type="text" bind:value={form.name} required placeholder="Ruang Aula" />
					</div>
					<div class="form-group">
						<label for="room-code">Kode</label>
						<input id="room-code" type="text" bind:value={form.code} placeholder="AULA-01" />
					</div>
					<div class="form-group">
						<label for="room-capacity">Kapasitas</label>
						<input id="room-capacity" type="number" bind:value={form.capacity} min="1" required />
					</div>
					<div class="form-group">
						<label for="room-building">Gedung</label>
						<input id="room-building" type="text" bind:value={form.building} placeholder="Gedung A" />
					</div>
					<div class="form-group">
						<label for="room-floor">Lantai</label>
						<input id="room-floor" type="number" bind:value={form.floor} min="0" />
					</div>
					<div class="form-group">
						<label for="room-facilities">Fasilitas (koma dipisah)</label>
						<input id="room-facilities" type="text" bind:value={form.facilities} placeholder="AC, Proyektor, CCTV" />
					</div>
				</div>
				<div class="modal-actions">
					<button type="button" class="btn" onclick={closeModal}>Batal</button>
					<button type="submit" class="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
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
