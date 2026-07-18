<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge, DataTable, Button } from '$lib/components/ui/index.js';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	type Student = {
		id: string;
		name: string;
		package: string;
		remainingSessions: number;
		totalSessions: number;
		joinDate: string;
		status: string;
	};

	let loading = $state(true);
	let error = $state('');
	let students: Student[] = $state([]);

	onMount(() => {
		if (!browser) return;
		loadStudents();
	});

	async function loadStudents() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/tutor/siswa');
			const json = await res.json();
			if (json.success) students = json.data || [];
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Nama', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
		{ header: 'Paket', accessorKey: 'package', cell: ({ getValue }) => `<span style="color:var(--text-secondary)">${(getValue() as string) || '-'}</span>` },
		{ header: 'Sisa Sesi', accessorKey: 'remainingSessions', cell: ({ row }) => `<span style="font-weight:600">${row.original.remainingSessions}/${row.original.totalSessions}</span>` },
		{ header: 'Tanggal Daftar', accessorKey: 'joinDate', cell: ({ getValue }) => `<span style="color:var(--text-tertiary);font-size:12px">${formatDate(getValue() as string)}</span>` },
		{
			header: 'Status', accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const colors: Record<string, string> = { active: '#10b981', paused: '#f59e0b', completed: '#5e6ad2' };
				const labels: Record<string, string> = { active: 'Aktif', paused: 'Jeda', completed: 'Selesai' };
				const c = colors[s] || '#888';
				return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;background:${c}20;color:${c}">${labels[s] || s}</span>`;
			}
		},
		{
			header: '', accessorKey: 'id', enableSorting: false,
			cell: ({ getValue }) => `<a href="/tutor/siswa/${getValue()}" style="color:var(--accent);text-decoration:none;font-weight:500;font-size:12px">${t('common.detail')} →</a>`
		},
	];
</script>

<svelte:head>
	<title>Data Siswa — Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/tutor">← {t('tutor.dashboard')}</a></div>
		<h1>{t('tutor.data_siswa')}</h1>
		<p class="subtitle">{t('tutor.data_siswa_desc')}</p>
	</div>

	<div class="toolbar">
		<button class="btn btn-secondary btn-sm" onclick={loadStudents}>{t('common.refresh')}</button>
	</div>

	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if students.length === 0}
		<EmptyState icon="👨‍🎓" title={t('tutor.belum_ada_siswa')} description={t('tutor.belum_ada_siswa_desc')} />
	{:else}
		<DataTable {columns} data={students} pageSize={15} showSearch={true} searchPlaceholder={t('tutor.cari_siswa')} />
	{/if}
</div>

<style>
	.page { max-width: 960px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.toolbar { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
