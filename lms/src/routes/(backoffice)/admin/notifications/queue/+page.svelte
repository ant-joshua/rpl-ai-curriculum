<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let loading = $state(true);
	let error = $state('');
	let items = $state<any[]>([]);
	let pagination = $state<any>({ page: 1, totalPages: 1, total: 0 });
	let statusFilter = $state('');
	let channelFilter = $state('');
	let retrying = $state(false);

	const statuses = ['queued', 'processing', 'sent', 'failed'];

	onMount(() => {
		if (browser) loadQueue();
	});

	async function loadQueue() {
		loading = true; error = '';
		try {
			const params = new URLSearchParams({ page: String(pagination.page), limit: '50' });
			if (statusFilter) params.set('status', statusFilter);
			if (channelFilter) params.set('channel', channelFilter);
			const res = await fetch(`/api/admin/notifications/queue?${params}`);
			const json = await res.json();
			if (json.success) {
				items = json.data || [];
				pagination = json.pagination || pagination;
			} else error = 'Gagal memuat queue';
		} catch { error = 'Gagal terhubung ke server';
		} finally { loading = false; }
	}

	async function retryFailed() {
		retrying = true;
		try {
			const res = await fetch('/api/admin/notifications/queue', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'retry-failed', max: 100 }),
			});
			const json = await res.json();
			if (json.success) await loadQueue();
			else error = json.error || 'Gagal retry';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { retrying = false; }
	}

	function statusColor(s: string): string {
		const map: Record<string,string> = { sent:'status-blue', delivered:'status-green', failed:'status-red', pending:'status-yellow', queued:'status-yellow', processing:'status-blue' };
		return map[s] || 'status-yellow';
	}

	function statusBadgeHtml(s: string): string {
		const colors: Record<string, { bg: string; color: string }> = {
			sent: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
			delivered: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
			failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
			pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
			queued: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
			processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
		};
		const c = colors[s] || { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
		return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:capitalize;background:${c.bg};color:${c.color}">${s}</span>`;
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try { return new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); } catch { return d; }
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'User',
			accessorKey: 'user_id',
			cell: ({ getValue }) => {
				const id = getValue() as string;
				return `<span style="font-family:monospace;font-size:12px">${id ? id.slice(0,8) + '...' : '—'}</span>`;
			}
		},
		{
			header: 'Channel',
			accessorKey: 'channel',
			cell: ({ getValue }) => {
				const ch = getValue() as string;
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;text-transform:uppercase;background:rgba(98,102,109,0.15);color:#8a8f98">${ch}</span>`;
			}
		},
		{
			header: 'Subject',
			accessorKey: 'subject',
			cell: ({ getValue }) => {
				const val = getValue() as string;
				return `<span style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${val || '—'}</span>`;
			}
		},
		{
			header: 'Body',
			accessorKey: 'body',
			cell: ({ getValue }) => {
				const body = getValue() as string;
				const truncated = body?.length > 60 ? body.slice(0,60) + '...' : body || '—';
				return `<span style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${truncated}</span>`;
			}
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => statusBadgeHtml(getValue() as string)
		},
		{
			header: 'Attempts',
			accessorKey: 'attempts',
			cell: ({ row }) => {
				const n = row.original;
				return `<span style="text-align:center">${n.attempts}/${n.max_attempts}</span>`;
			}
		},
		{
			header: 'Error',
			accessorKey: 'last_error',
			cell: ({ getValue }) => {
				const err = getValue() as string;
				return `<span style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;color:var(--text-secondary);font-size:12px">${err || '—'}</span>`;
			}
		},
		{
			header: 'Dibuat',
			accessorKey: 'created_at',
			cell: ({ getValue }) => formatDate(getValue() as string)
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📨 Antrian Notifikasi</h1>
			<p class="subtitle">Monitor dan kelola antrian notifikasi keluar</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadQueue}>🔄</Button>
			<Button class="btn-outline" onclick={retryFailed} disabled={retrying}>
				{retrying ? 'Meretry...' : 'Retry Failed'}
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<div class="filter-bar">
		<span class="filter-label">Status:</span>
		<button class="filter-btn" class:active={statusFilter === ''} onclick={() => { statusFilter = ''; pagination.page = 1; loadQueue(); }}>{t('common.all')}</button>
		{#each statuses as s}
			<button class="filter-btn" class:active={statusFilter === s} onclick={() => { statusFilter = s; pagination.page = 1; loadQueue(); }}>{s}</button>
		{/each}
		<span class="filter-label" style="margin-left:12px">Channel:</span>
		<button class="filter-btn" class:active={channelFilter === ''} onclick={() => { channelFilter = ''; pagination.page = 1; loadQueue(); }}>{t('common.all')}</button>
		<button class="filter-btn" class:active={channelFilter === 'in_app'} onclick={() => { channelFilter = 'in_app'; pagination.page = 1; loadQueue(); }}>In-App</button>
		<button class="filter-btn" class:active={channelFilter === 'email'} onclick={() => { channelFilter = 'email'; pagination.page = 1; loadQueue(); }}>{t('register.email')}</button>
		<button class="filter-btn" class:active={channelFilter === 'whatsapp'} onclick={() => { channelFilter = 'whatsapp'; pagination.page = 1; loadQueue(); }}>WhatsApp</button>
	</div>

	{#if error}
		<div><p>{error}</p><Button class="error-state" onclick={loadQueue}>{t('common.retry')}</Button></div>
	{/if}

	{#if loading}
		<div class="loading">{t('common.loading')}</div>
	{:else if items.length === 0}
		<div class="empty-state"><p>Belum ada antrian notifikasi</p></div>
	{:else}
		<div class="card">
			<div class="table-container">
				<DataTable
					{columns}
					data={items}
					showSearch={false}
					showPagination={false}
					emptyMessage="Tidak ada data"
				/>
			</div>
		</div>

		{#if pagination.totalPages > 1}
			<div class="pagination">
				<Button disabled={pagination.page <= 1} onclick={() => { pagination.page--; loadQueue(); }}>←</Button>
				<span class="page-info">{pagination.page}/{pagination.totalPages}</span>
				<Button disabled={pagination.page >= pagination.totalPages} onclick={() => { pagination.page++; loadQueue(); }}>→</Button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1200px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-outline { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-outline:hover:not(:disabled) { background: var(--hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }

	.filter-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
	.filter-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-transform: capitalize; }
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
	.page-info { font-size: 13px; color: var(--text-secondary); }
</style>
