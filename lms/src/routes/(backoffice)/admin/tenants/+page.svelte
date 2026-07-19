<script lang="ts">
	import { onMount } from 'svelte';
	import { DataTable, PageHeader } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let tenants: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

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

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Nama', accessorKey: 'name' },
		{
			header: 'Slug',
			accessorKey: 'slug',
			cell: ({ getValue }) => `<code>${getValue()}</code>`
		},
		{
			header: 'Tipe',
			accessorKey: 'type',
			cell: ({ getValue }) => {
				const type = getValue() as string;
				const colors: Record<string, string> = {
					lms: 'background:#4F46E5;color:#fff',
					academic_k13: 'background:#10b981;color:#fff',
					university: 'background:#f59e0b;color:#fff',
					bimbel: 'background:#8b5cf6;color:#fff',
					tutor: 'background:#ec4899;color:#fff',
				};
				return `<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.8rem;font-weight:500;${colors[type] || 'background:var(--bg-secondary);color:var(--text-secondary)'}">${type}</span>`;
			}
		},
		{
			header: 'Status',
			accessorKey: 'is_active',
			cell: ({ getValue }) => {
				const active = getValue();
				const color = active ? '#10b981' : '#ef4444';
				const label = active ? 'Aktif' : 'Nonaktif';
				return `<span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.85rem;color:${active ? 'var(--text-primary)' : 'var(--text-secondary)'}"><span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>${label}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ getValue }) => `<a href="/admin/tenants/${getValue()}" style="color:var(--accent);text-decoration:none;font-size:0.85rem;font-weight:500">Detail</a>`
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<PageHeader title={t('admin.tenants')} subtitle="Kelola data tenant">
		{#snippet action()}
			<a href="/admin/tenants/new" class="btn-primary">{t('admin.tenant_baru')}</a>
		{/snippet}
	</PageHeader>

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
				<p>{t('admin.belum_ada_tenant')}</p>
				<a href="/admin/tenants/new" class="btn-primary">{t('admin.buat_tenant_pertama')}</a>
			</div>
		{:else}
			<div class="table-container">
				<DataTable {columns} data={tenants} pageSize={20} showSearch={true} searchPlaceholder="Cari tenant..." />
			</div>
		{/if}
	</div>
</div>

<style>
	.page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
	.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
	.table-container { overflow-x: auto; }
	.error { color: #ef4444; padding: 1rem; }
	.empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
	.skeleton-list { display: flex; flex-direction: column; gap: 1rem; }
	.skeleton-row { height: 3rem; background: var(--bg-code); border-radius: 8px; }
</style>
