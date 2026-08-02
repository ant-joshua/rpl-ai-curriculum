<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Card, CardContent, Alert, Button, Input, Modal, Spinner, EmptyState } from '$lib/components/ui';

	const token = $derived(browser ? localStorage.getItem('token') || '' : '');
	function authHeaders() {
		return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
	}

	let loading = $state(true);
	let error = $state('');
	let bundles = $state<any[]>([]);
	let offerings = $state<any[]>([]);
	let modal = $state<any>(null);
	let saving = $state(false);

	onMount(async () => {
		if (!browser) return;
		await Promise.all([loadBundles(), loadOfferings()]);
	});

	async function loadBundles() {
		loading = true;
		try {
			const res = await fetch('/api/admin/bundles', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) bundles = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function loadOfferings() {
		try {
			const res = await fetch('/api/admin/offerings?limit=100', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) offerings = json.data || [];
		} catch { /* ignore */ }
	}

	async function save() {
		if (!modal?.title || !modal?.offering_ids?.length) return;
		saving = true;
		try {
			const res = await fetch('/api/admin/bundles', {
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify(modal),
			});
			if (res.ok) {
				modal = null;
				loadBundles();
			} else {
				const j = await res.json().catch(() => null);
				error = j?.error || 'Gagal simpan';
			}
		} catch { /* ignore */ } finally {
			saving = false;
		}
	}

	async function toggle(b: any) {
		try {
			await fetch(`/api/admin/bundles/${b.id}`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ is_active: b.is_active == 1 ? 0 : 1 }),
			});
			loadBundles();
		} catch { /* ignore */ }
	}

	async function remove(b: any) {
		if (!confirm(`Hapus paket "${b.title}"?`)) return;
		try {
			await fetch(`/api/admin/bundles/${b.id}`, { method: 'DELETE', headers: authHeaders() });
			loadBundles();
		} catch { /* ignore */ }
	}

	function toggleOffering(oid: string) {
		if (!modal.offering_ids) modal.offering_ids = [];
		const idx = modal.offering_ids.indexOf(oid);
		if (idx >= 0) modal.offering_ids.splice(idx, 1);
		else modal.offering_ids.push(oid);
	}
</script>

<svelte:head>
	<title>Paket Kursus — Admin</title>
</svelte:head>

<div class="bundles-admin">
	<div class="header-row">
		<h1>📦 Paket Kursus</h1>
		<Button size="sm" onclick={() => modal = { offering_ids: [], price: 0, is_active: 1 }}>+ Buat Paket</Button>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	{#if modal}
		<Modal onclose={() => modal = null}>
			<div class="modal-form">
				<h3>Buat Paket</h3>
				<label>Judul</label>
				<Input bind:value={modal.title} placeholder="Misal: Fullstack Web Developer" />
				<label>Deskripsi</label>
				<Input bind:value={modal.description} placeholder="Deskripsi paket" />
				<label>Slug</label>
				<Input bind:value={modal.slug} placeholder="fullstack-web" />
				<label>Harga (IDR)</label>
				<Input type="number" bind:value={modal.price} placeholder="0 = gratis" min={0} />
				<label>Harga Asli (IDR)</label>
				<Input type="number" bind:value={modal.original_price} placeholder="Total harga normal" min={0} />
				<label>Ikon</label>
				<Input bind:value={modal.cover_icon} placeholder="📦" />
				<label>Pilih Kursus ({modal.offering_ids?.length || 0})</label>
				<div class="offering-picker">
					{#each offerings as o}
						<label class="pick-item">
							<input type="checkbox" checked={modal.offering_ids?.includes(o.id)} onclick={() => toggleOffering(o.id)} />
							<span>{o.name || o.title}</span>
						</label>
					{/each}
				</div>
				<div class="modal-actions">
					<Button onclick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
					<Button variant="ghost" onclick={() => modal = null}>Batal</Button>
				</div>
			</div>
		</Modal>
	{/if}

	{#if loading}
		<div class="loading"><Spinner /> Memuat...</div>
	{:else if bundles.length === 0}
		<EmptyState title="Belum ada paket" description="Buat paket kursus pertama" />
	{:else}
		<Card>
			<CardContent>
				<table class="bundle-table">
					<thead>
						<tr>
							<th>Judul</th>
							<th>Kursus</th>
							<th>Harga</th>
							<th>Status</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each bundles as b}
							<tr>
								<td><strong>{b.cover_icon || '📦'} {b.title}</strong></td>
								<td>{b.item_count} kursus</td>
								<td>Rp {Number(b.price || 0).toLocaleString('id-ID')}</td>
								<td>
									<span class:st-active={b.is_active == 1} class:st-inactive={b.is_active == 0}>
										{b.is_active == 1 ? 'Aktif' : 'Nonaktif'}
									</span>
								</td>
								<td>
									<Button variant="secondary" size="sm" onclick={() => toggle(b)}>{b.is_active == 1 ? 'Nonaktifkan' : 'Aktifkan'}</Button>
									<Button variant="danger" size="sm" onclick={() => remove(b)}>Hapus</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	.bundles-admin { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
	.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
	.header-row h1 { font-size: 22px; margin: 0; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.modal-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 4px; max-height: 70vh; overflow-y: auto; }
	.modal-form label { font-size: 13px; font-weight: 600; margin-top: 6px; }
	.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
	.bundle-table { width: 100%; border-collapse: collapse; }
	.bundle-table th, .bundle-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 13px; }
	.st-active { color: #16a34a; font-weight: 600; }
	.st-inactive { color: #dc2626; font-weight: 600; }
	.offering-picker { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
	.pick-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 400; cursor: pointer; }
</style>
