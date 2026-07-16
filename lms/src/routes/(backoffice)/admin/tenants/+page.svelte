<script lang="ts">
	import { onMount } from 'svelte';
	let tenants: any[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		const res = await fetch('/api/admin/tenants');
		if (!res.ok) {
			error = 'Gagal memuat data tenant';
			loading = false;
			return;
		}
		const data = await res.json();
		tenants = data.tenants || [];
		loading = false;
	});
</script>

<div class="page">
	<div class="header">
		<h1>Tenants</h1>
		<a href="/admin/tenants/new" class="btn-primary">+ Tenant Baru</a>
	</div>

	<div class="card">
		{#if loading}
			<div class="skeleton-list">
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
			</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if tenants.length === 0}
			<div class="empty">
				<p>Belum ada tenant</p>
				<a href="/admin/tenants/new" class="btn-primary">Buat Tenant Pertama</a>
			</div>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Nama</th>
							<th>Slug</th>
							<th>Tipe</th>
							<th>Status</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each tenants as tenant}
							<tr>
								<td>{tenant.name}</td>
								<td><code>{tenant.slug}</code></td>
								<td><span class="badge badge-{tenant.type}">{tenant.type}</span></td>
								<td>
									<span class="status" class:active={tenant.is_active}>
										{tenant.is_active ? 'Aktif' : 'Nonaktif'}
									</span>
								</td>
								<td>
									<a href="/admin/tenants/{tenant.id}" class="btn-small">Detail</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
	.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.header h1 { margin: 0; font-size: 1.5rem; color: var(--text-primary); }
	.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
	.btn-small { color: var(--accent); text-decoration: none; font-size: 0.85rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
	td { padding: 0.75rem 1rem; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border); }
	code { background: var(--bg-code); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85em; }
	.badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
	.badge-lms { background: #6366f1; color: #fff; }
	.badge-academic_k13 { background: #10b981; color: #fff; }
	.badge-university { background: #f59e0b; color: #fff; }
	.badge-bimbel { background: #8b5cf6; color: #fff; }
	.badge-tutor { background: #ec4899; color: #fff; }
	.status { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: var(--text-secondary); }
	.status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
	.status.active::before { background: #10b981; }
	.status.active { color: var(--text-primary); }
	.error { color: #ef4444; padding: 1rem; }
	.empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
	.skeleton-list { display: flex; flex-direction: column; gap: 1rem; }
	.skeleton-row { height: 3rem; background: var(--bg-code); border-radius: 8px; }
</style>
