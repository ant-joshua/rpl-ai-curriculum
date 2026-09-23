<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Card, CardContent, Alert, Button, Input, Modal, EmptyState, Table, TableHeader, TableHead, TableBody, TableRow, TableCell, Skeleton, ConfirmDialog, toast } from '$lib/components/ui';
	import { api } from '$lib/utils/api';
	import { useConfirmDialog } from '$lib/composables';

	let loading = $state(true);
	let error = $state('');
	let bundles = $state<any[]>([]);
	let offerings = $state<any[]>([]);
	let modal = $state<any>(null);
	let saving = $state(false);

	const deleteConfirm = useConfirmDialog<any>({
		title: (b) => 'Hapus Paket Kursus?',
		message: (b) => `Hapus paket "${b.title}"? Kursus di dalamnya tidak akan terhapus.`,
		confirmText: '🗑️ Hapus Paket',
		variant: 'danger',
		onConfirm: async (b) => {
			const res = await api.delete(`/api/admin/bundles/${b.id}`);
			if (!res.success) throw new Error(res.error || 'Gagal menghapus paket');
			await loadBundles();
		},
		successMessage: 'Paket berhasil dihapus',
	});

	onMount(async () => {
		if (!browser) return;
		await Promise.all([loadBundles(), loadOfferings()]);
	});

	async function loadBundles() {
		loading = true;
		try {
			const res = await api.get<any[]>('/api/admin/bundles');
			if (res.success) bundles = res.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function loadOfferings() {
		try {
			const res = await api.get<any[]>('/api/admin/offerings?limit=100');
			if (res.success) offerings = res.data || [];
		} catch { /* ignore */ }
	}

	async function save() {
		if (!modal?.title || !modal?.slug) return;
		saving = true;
		try {
			const res = await api.post('/api/admin/bundles', modal);
			if (!res.success) throw new Error(res.error || 'Gagal menyimpan paket');
			modal = null;
			toast.success('Paket kursus berhasil disimpan');
			loadBundles();
		} catch (e: any) {
			error = e.message;
			toast.error(e.message);
		} finally {
			saving = false;
		}
	}

	async function toggle(b: any) {
		try {
			await api.patch(`/api/admin/bundles/${b.id}`, { is_active: b.is_active == 1 ? 0 : 1 });
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
		<Skeleton variant="table-row" count={5} />
	{:else if bundles.length === 0}
		<EmptyState title="Belum ada paket" description="Buat paket kursus pertama" />
	{:else}
		<Card>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Judul</TableHead>
							<TableHead>Kursus</TableHead>
							<TableHead>Harga</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each bundles as b}
							<TableRow>
								<TableCell><strong>{b.cover_icon || '📦'} {b.title}</strong></TableCell>
								<TableCell>{b.item_count} kursus</TableCell>
								<TableCell>Rp {Number(b.price || 0).toLocaleString('id-ID')}</TableCell>
								<TableCell>
									<span class:st-active={b.is_active == 1} class:st-inactive={b.is_active == 0}>
										{b.is_active == 1 ? 'Aktif' : 'Nonaktif'}
									</span>
								</TableCell>
								<TableCell>
									<Button variant="secondary" size="sm" onclick={() => toggle(b)}>{b.is_active == 1 ? 'Nonaktifkan' : 'Aktifkan'}</Button>
									<Button variant="danger" size="sm" onclick={() => deleteConfirm.ask(b)}>Hapus</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	{/if}
</div>

<ConfirmDialog {...deleteConfirm.dialogProps} />

<style>
	.bundles-admin { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
	.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
	.header-row h1 { font-size: 22px; margin: 0; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.modal-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 4px; max-height: 70vh; overflow-y: auto; }
	.modal-form label { font-size: 13px; font-weight: 600; margin-top: 6px; }
	.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
	.st-active { color: var(--success); font-weight: 600; }
	.st-inactive { color: var(--danger); font-weight: 600; }
	.offering-picker { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
	.pick-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 400; cursor: pointer; }
</style>
