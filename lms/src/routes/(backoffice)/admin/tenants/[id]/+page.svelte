<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let tenant: any = null;
	let loading = true;
	let error = '';
	let config = '';
	let saved = false;

	let tenantId = $derived($page.params.id);

	onMount(() => loadTenant());

	async function loadTenant() {
		loading = true;
		try {
			const res = await fetch(`/api/admin/tenants/${tenantId}`);
			if (!res.ok) {
				error = 'Tenant tidak ditemukan';
				loading = false;
				return;
			}
			tenant = await res.json();
			config = JSON.stringify(JSON.parse(tenant.config || '{}'), null, 2);
			loading = false;
		} catch {
			error = 'Gagal memuat data';
			loading = false;
		}
	}

	async function saveConfig() {
		saved = false;
		try {
			JSON.parse(config);
		} catch {
			error = 'Format JSON tidak valid';
			return;
		}
		const res = await fetch(`/api/admin/tenants/${tenantId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ config }),
		});
		if (res.ok) {
			saved = true;
			error = '';
			setTimeout(() => saved = false, 3000);
		} else {
			const data = await res.json();
			error = data.error || 'Gagal menyimpan';
		}
	}

	async function toggleActive() {
		const action = tenant.is_active ? 'deactivate' : 'activate';
		const res = await fetch(`/api/admin/tenants/${tenantId}/${action}`, { method: 'POST' });
		if (res.ok) {
			tenant.is_active = !tenant.is_active;
		}
	}

	async function deleteTenant() {
		if (!confirm('Yakin hapus tenant ini? Data terkait akan ikut terhapus.')) return;
		const res = await fetch(`/api/admin/tenants/${tenantId}`, { method: 'DELETE' });
		if (res.ok) {
			goto('/admin/tenants');
		}
	}
</script>

<div class="page">
	{#if loading}
		<div class="card"><div class="skeleton"></div></div>
	{:else if error}
		<div class="card"><div class="error">{error}</div></div>
	{:else if tenant}
		<div class="header">
			<div>
				<h1>{tenant.name}</h1>
				<div class="meta">
					<code>/t/{tenant.slug}/</code>
					<span class="badge badge-{tenant.type}">{tenant.type}</span>
					<span class="status" class:active={tenant.is_active}>{tenant.is_active ? 'Aktif' : 'Nonaktif'}</span>
				</div>
			</div>
			<div class="header-actions">
				<button class="btn-small" onclick={toggleActive}>
					{tenant.is_active ? 'Nonaktifkan' : 'Aktifkan'}
				</button>
				<button class="btn-small btn-danger" onclick={deleteTenant}>Hapus</button>
			</div>
		</div>

		<div class="card">
			<h2>Konfigurasi Grade</h2>
			<div class="config-grid">
				<div class="config-item">
					<label>Bobot PH</label>
					<input type="number" bind:value={gradeWeights.ph} min="0" max="100" />
				</div>
			</div>
		</div>

		<div class="card">
			<h2>Raw Config (JSON)</h2>
			<textarea bind:value={config} rows="12" class="config-json"></textarea>
			<div class="actions">
				<button class="btn-primary" onclick={saveConfig}>Simpan Config</button>
				{#if saved}<span class="saved">✓ Tersimpan</span>{/if}
			</div>
		</div>

		<div class="card">
			<h2>Preview Tenant</h2>
			<p>Kunjungi <a href="/t/{tenant.slug}/dashboard" target="_blank">/t/{tenant.slug}/dashboard</a> untuk melihat halaman tenant.</p>
		</div>
	{/if}
</div>

<script context="module" lang="ts">
	let gradeWeights = $state({ ph: 60, pts: 20, pas: 20 });
</script>

<style>
	.page { padding: 2rem; max-width: 800px; margin: 0 auto; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
	h1 { margin: 0; font-size: 1.5rem; color: var(--text-primary); }
	.meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); }
	code { background: var(--bg-code); padding: 0.2rem 0.5rem; border-radius: 4px; }
	.badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
	.badge-lms { background: #5e6ad2; color: #fff; }
	.badge-academic_k13 { background: #10b981; color: #fff; }
	.status { display: inline-flex; align-items: center; gap: 0.35rem; }
	.status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
	.status.active::before { background: #10b981; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
	.card h2 { margin: 0 0 1rem; font-size: 1rem; color: var(--text-primary); }
	.config-json { width: 100%; background: var(--bg-code); border: 1px solid var(--border); border-radius: 8px; padding: 0.8rem; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); resize: vertical; }
	.actions { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
	.btn-primary { padding: 0.5rem 1rem; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
	.btn-small { padding: 0.4rem 0.8rem; background: var(--bg-code); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
	.btn-danger { color: #ef4444; border-color: #ef4444; }
	.saved { color: #10b981; font-size: 0.85rem; }
	.error { color: #ef4444; }
	.header-actions { display: flex; gap: 0.5rem; }
</style>
