<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Card, CardContent, Alert, Button, Input, Modal, Select, Spinner, EmptyState } from '$lib/components/ui';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	const token = $derived(browser ? localStorage.getItem('token') || '' : '');
	function authHeaders() {
		return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
	}

	let loading = $state(true);
	let error = $state('');
	let sessions = $state<any[]>([]);
	let offerings = $state<any[]>([]);
	let modal = $state<any>(null);
	let saving = $state(false);

	onMount(async () => {
		if (!browser) return;
		await Promise.all([loadSessions(), loadOfferings()]);
	});

	async function loadSessions() {
		loading = true;
		try {
			const res = await fetch('/api/admin/live-classes', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) sessions = json.data || [];
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
		if (!modal?.course_offering_id || !modal?.title || !modal?.start_at) return;
		saving = true;
		try {
			const res = await fetch('/api/admin/live-classes', {
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify(modal),
			});
			if (res.ok) {
				modal = null;
				loadSessions();
			} else {
				const j = await res.json().catch(() => null);
				error = j?.error || 'Gagal simpan';
			}
		} catch { /* ignore */ } finally {
			saving = false;
		}
	}

	async function setStatus(s: any, status: string) {
		try {
			await fetch(`/api/admin/live-classes/${s.id}`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ status }),
			});
			loadSessions();
		} catch { /* ignore */ }
	}

	async function remove(s: any) {
		if (!confirm(`Hapus kelas live "${s.title}"?`)) return;
		try {
			await fetch(`/api/admin/live-classes/${s.id}`, { method: 'DELETE', headers: authHeaders() });
			loadSessions();
		} catch { /* ignore */ }
	}

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Judul', accessorKey: 'title', cell: ({ getValue }) => `<strong>${getValue() || ''}</strong>` },
		{ header: 'Kursus', accessorKey: 'offering_name', cell: ({ getValue }) => getValue() || '-' },
		{ header: 'Mulai', accessorKey: 'start_at', cell: ({ getValue }) => String(getValue() || '').replace('T', ' ').slice(0, 16) },
		{ header: 'Durasi', accessorKey: 'duration_minutes', cell: ({ getValue }) => `${getValue() || 0}m` },
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const v = getValue() as string;
				const colors: Record<string, string> = {
					scheduled: '#2563eb', live: '#dc2626', ended: '#6b7280', cancelled: '#9ca3af'
				};
				return `<span style="color:${colors[v] || '#6b7280'};font-weight:600">${v}</span>`;
			}
		},
	];
</script>

<svelte:head>
	<title>Kelas Live — Admin</title>
</svelte:head>

<div class="live-admin">
	<div class="header-row">
		<h1>📺 Kelas Live</h1>
		<Button size="sm" onclick={() => modal = { status: 'scheduled', duration_minutes: 60 }}>+ Buat Kelas Live</Button>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	{#if modal}
		<Modal onclose={() => modal = null}>
			<div class="modal-form">
				<h3>Buat Kelas Live</h3>
				<label>Kursus</label>
				<Select bind:value={modal.course_offering_id}>
					<option value="">— Pilih kursus —</option>
					{#each offerings as o}
						<option value={o.id}>{o.name || o.title}</option>
					{/each}
				</Select>
				<label>Judul</label>
				<Input bind:value={modal.title} placeholder="Misal: Review UTS — Pemrograman Web" />
				<label>Deskripsi</label>
				<Input bind:value={modal.description} placeholder="Deskripsi singkat" />
				<label>Mulai (YYYY-MM-DDTHH:MM)</label>
				<Input type="datetime-local" bind:value={modal.start_at} />
				<label>Durasi (menit)</label>
				<Input type="number" bind:value={modal.duration_minutes} min={15} max={300} />
				<label>Link Join (Zoom/Meet)</label>
				<Input bind:value={modal.join_url} placeholder="https://zoom.us/j/..." />
				<label>Link Rekaman</label>
				<Input bind:value={modal.recording_url} placeholder="https://youtube.com/..." />
				<div class="modal-actions">
					<Button onclick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
					<Button variant="ghost" onclick={() => modal = null}>Batal</Button>
				</div>
			</div>
		</Modal>
	{/if}

	{#if loading}
		<div class="loading"><Spinner /> Memuat...</div>
	{:else if sessions.length === 0}
		<EmptyState title="Belum ada kelas live" description="Buat kelas live pertama" />
	{:else}
		<Card>
			<CardContent>
				<div class="table-wrap">
					<table class="live-table">
						<thead>
							<tr>
								<th>Judul</th>
								<th>Kursus</th>
								<th>Mulai</th>
								<th>Durasi</th>
								<th>Status</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each sessions as s}
								<tr>
									<td><strong>{s.title}</strong></td>
									<td>{s.offering_name || '-'}</td>
									<td>{String(s.start_at || '').replace('T', ' ').slice(0, 16)}</td>
									<td>{s.duration_minutes}m</td>
									<td>
										<span class="status-pill" class:st-live={s.status === 'live'} class:st-scheduled={s.status === 'scheduled'}>
											{s.status}
										</span>
									</td>
									<td>
										<div class="row-actions">
											{#if s.status === 'scheduled'}
												<Button variant="secondary" size="sm" onclick={() => setStatus(s, 'live')}>Mulai</Button>
											{:else if s.status === 'live'}
												<Button variant="secondary" size="sm" onclick={() => setStatus(s, 'ended')}>Akhiri</Button>
											{/if}
											{#if s.join_url}
												<a class="join-link" href={s.join_url} target="_blank" rel="noopener">Link</a>
											{/if}
											<Button variant="danger" size="sm" onclick={() => remove(s)}>Hapus</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	.live-admin { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
	.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
	.header-row h1 { font-size: 22px; margin: 0; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.modal-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 4px; }
	.modal-form label { font-size: 13px; font-weight: 600; margin-top: 6px; }
	.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
	.table-wrap { overflow-x: auto; }
	.live-table { width: 100%; border-collapse: collapse; }
	.live-table th, .live-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 13px; }
	.status-pill { padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e2e8f0; color: #475569; }
	.status-pill.st-live { background: #fee2e2; color: #dc2626; }
	.status-pill.st-scheduled { background: #dbeafe; color: #2563eb; }
	.row-actions { display: flex; gap: 6px; align-items: center; }
	.join-link { font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 600; }
</style>
