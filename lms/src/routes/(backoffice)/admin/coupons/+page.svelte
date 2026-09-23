<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Card, CardContent, Alert, Button, Input, Modal, Select, Spinner, EmptyState, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '$lib/components/ui';

	const token = $derived(browser ? localStorage.getItem('token') || '' : '');
	function authHeaders() {
		return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
	}

	let loading = $state(true);
	let error = $state('');
	let coupons = $state<any[]>([]);
	let bundles = $state<any[]>([]);
	let modal = $state<any>(null);
	let saving = $state(false);

	onMount(async () => {
		if (!browser) return;
		await Promise.all([loadCoupons(), loadBundles()]);
	});

	async function loadCoupons() {
		loading = true;
		try {
			const res = await fetch('/api/admin/coupons', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) coupons = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function loadBundles() {
		try {
			const res = await fetch('/api/admin/bundles', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) bundles = json.data || [];
		} catch { /* ignore */ }
	}

	async function save() {
		if (!modal?.code || !modal?.discount_value) return;
		saving = true;
		try {
			const res = await fetch('/api/admin/coupons', {
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify(modal),
			});
			if (res.ok) {
				modal = null;
				loadCoupons();
			} else {
				const j = await res.json().catch(() => null);
				error = j?.error || 'Gagal simpan';
			}
		} catch { /* ignore */ } finally {
			saving = false;
		}
	}

	async function toggle(c: any) {
		try {
			await fetch(`/api/admin/coupons/${c.id}`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ is_active: c.is_active == 1 ? 0 : 1 }),
			});
			loadCoupons();
		} catch { /* ignore */ }
	}

	async function remove(c: any) {
		if (!confirm(`Hapus kupon "${c.code}"?`)) return;
		try {
			await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE', headers: authHeaders() });
			loadCoupons();
		} catch { /* ignore */ }
	}

	function isExpired(c: any): boolean {
		return !!c.expires_at && new Date(c.expires_at).getTime() < Date.now();
	}
</script>

<svelte:head>
	<title>Kupon — Admin</title>
</svelte:head>

<div class="coupons-admin">
	<div class="header-row">
		<h1>🎟️ Kupon & Promo</h1>
		<Button size="sm" onclick={() => modal = { discount_type: 'percent', discount_value: 10, max_uses: 0, is_active: 1 }}>+ Buat Kupon</Button>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	{#if modal}
		<Modal onclose={() => modal = null}>
			<div class="modal-form">
				<h3>Buat Kupon</h3>
				<label>Kode</label>
				<Input bind:value={modal.code} placeholder="DISKON50" />
				<label>Judul</label>
				<Input bind:value={modal.title} placeholder="Promo Awal Tahun" />
				<label>Tipe Diskon</label>
				<Select bind:value={modal.discount_type}>
					<option value="percent">Persen (%)</option>
					<option value="fixed">Nominal (Rp)</option>
				</Select>
				<label>Nilai Diskon ({modal.discount_type === 'percent' ? '%' : 'Rp'})</label>
				<Input type="number" bind:value={modal.discount_value} min={1} max={modal.discount_type === 'percent' ? 100 : 1000000} />
				<label>Target (kosong = semua)</label>
				<Select bind:value={modal.bundle_id}>
					<option value="">— Semua item —</option>
					{#each bundles as b}
						<option value={b.id}>{b.title}</option>
					{/each}
				</Select>
				<label>Maks Pemakaian (0 = unlimited)</label>
				<Input type="number" bind:value={modal.max_uses} min={0} />
				<label>Berlaku Sampai</label>
				<Input type="datetime-local" bind:value={modal.expires_at} />
				<div class="modal-actions">
					<Button onclick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
					<Button variant="ghost" onclick={() => modal = null}>Batal</Button>
				</div>
			</div>
		</Modal>
	{/if}

	{#if loading}
		<div class="loading"><Spinner /> Memuat...</div>
	{:else if coupons.length === 0}
		<EmptyState title="Belum ada kupon" description="Buat kupon promo pertama" />
	{:else}
		<Card>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Kode</TableHead>
							<TableHead>Diskon</TableHead>
							<TableHead>Target</TableHead>
							<TableHead>Pemakaian</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each coupons as c}
							<TableRow>
								<TableCell><strong>{c.code}</strong>{#if c.title}<div class="sub">{c.title}</div>{/if}</TableCell>
								<TableCell>{c.discount_type === 'percent' ? `${c.discount_value}%` : `Rp ${Number(c.discount_value).toLocaleString('id-ID')}`}</TableCell>
								<TableCell>{c.bundle_title || 'Semua'}</TableCell>
								<TableCell>{c.redemption_count}/{c.max_uses > 0 ? c.max_uses : '∞'}</TableCell>
								<TableCell>
									<span class:st-active={c.is_active == 1 && !isExpired(c)} class:st-inactive={c.is_active == 0 || isExpired(c)}>
										{c.is_active == 0 ? 'Nonaktif' : isExpired(c) ? 'Kedaluwarsa' : 'Aktif'}
									</span>
								</TableCell>
								<TableCell>
									<Button variant="secondary" size="sm" onclick={() => toggle(c)}>{c.is_active == 1 ? 'Nonaktifkan' : 'Aktifkan'}</Button>
									<Button variant="danger" size="sm" onclick={() => remove(c)}>Hapus</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	.coupons-admin { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
	.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
	.header-row h1 { font-size: 22px; margin: 0; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.modal-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 4px; max-height: 70vh; overflow-y: auto; }
	.modal-form label { font-size: 13px; font-weight: 600; margin-top: 6px; }
	.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
	.sub { font-size: 11px; color: var(--text-muted); }
	.st-active { color: var(--success); font-weight: 600; }
	.st-inactive { color: var(--danger); font-weight: 600; }
</style>
