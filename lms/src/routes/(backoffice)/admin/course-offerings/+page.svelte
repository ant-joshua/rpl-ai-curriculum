<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Button, Card, CardContent, Loading, EmptyState } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let offerings: any[] = $state([]);
	let instructors: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let savingId = $state<string | null>(null);

	onMount(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [offRes, instRes] = await Promise.all([
				fetch('/api/admin/course-offerings'),
				fetch('/api/admin/users/instructors'),
			]);
			const offJson = await offRes.json();
			const instJson = await instRes.json();
			if (offJson.success) offerings = offJson.data || [];
			else error = offJson.error || 'Gagal memuat offering';
			if (instJson.success) instructors = instJson.data || [];
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function assignInstructor(offeringId: string, instructorId: string) {
		savingId = offeringId;
		try {
			const res = await fetch('/api/admin/course-offerings/assign-instructor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ offering_id: offeringId, instructor_id: instructorId }),
			});
			const json = await res.json();
			if (json.success) {
				offerings = offerings.map(o =>
					o.id === offeringId ? { ...o, instructor_id: instructorId || null } : o
				);
			} else {
				alert(json.error || 'Gagal menetapkan instruktur');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			savingId = null;
		}
	}

	function getInstructorName(id: string | null): string {
		if (!id) return '—';
		const inst = instructors.find(i => i.id === id);
		return inst ? inst.name : '—';
	}

	const instructorOptions = $derived([
		{ value: '', label: '— Pilih Instruktur —' },
		...instructors.map(i => ({ value: i.id, label: `${i.name} (${i.email})` })),
	]);

	function renderAssignSelect(offering: any): string {
		const current = offering.instructor_id || '';
		let html = `<select class="instructor-select" data-offering-id="${offering.id}" style="padding:6px 10px;font-size:13px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);outline:none;min-width:200px;cursor:pointer">`;
		html += `<option value="">— Pilih Instruktur —</option>`;
		for (const inst of instructors) {
			const sel = inst.id === current ? ' selected' : '';
			html += `<option value="${inst.id}"${sel}>${inst.name} (${inst.email})</option>`;
		}
		html += `</select>`;
		if (savingId === offering.id) {
			html += `<span style="font-size:12px;color:var(--accent);white-space:nowrap">Menyimpan...</span>`;
		}
		return html;
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Nama',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
		},
		{
			header: 'Kode',
			accessorKey: 'code',
			cell: ({ getValue }) => {
				const code = getValue() as string;
				return code ? `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${code}</code>` : '<span>—</span>';
			}
		},
		{
			header: 'Instruktur Saat Ini',
			accessorKey: 'instructor_id',
			cell: ({ getValue }) => `<span style="font-size:13px;color:var(--text-secondary)">${getInstructorName(getValue() as string)}</span>`
		},
		{
			header: 'Atur Instruktur',
			accessorKey: 'id',
			cell: ({ getValue, row }) => {
				const id = getValue() as string;
				const current = row.original.instructor_id || '';
				let html = `<div style="display:flex;align-items:center;gap:8px">`;
				html += `<select class="dt-instructor-select" data-offering-id="${id}" style="padding:6px 10px;font-size:13px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);outline:none;min-width:200px;cursor:pointer">`;
				html += `<option value="">— Pilih Instruktur —</option>`;
				for (const inst of instructors) {
					const sel = inst.id === current ? ' selected' : '';
					html += `<option value="${inst.id}"${sel}>${inst.name} (${inst.email})</option>`;
				}
				html += `</select>`;
				if (savingId === id) {
					html += `<span style="font-size:12px;color:var(--accent);white-space:nowrap">Menyimpan...</span>`;
				}
				html += `</div>`;
				return html;
			}
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const status = (getValue() as string) || '—';
				const colors: Record<string, string> = {
					active: 'background:rgba(16,185,129,0.1);color:#10b981',
					draft: 'background:rgba(98,102,109,0.1);color:var(--text-quaternary)',
				};
				const style = colors[status] || 'background:rgba(245,158,11,0.1);color:#f59e0b';
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;${style}">${status}</span>`;
			}
		},
	];

	function handleAssign(e: Event) {
		const target = e.target as HTMLSelectElement;
		if (!target.matches('.dt-instructor-select')) return;
		const offeringId = target.dataset.offeringId;
		if (offeringId) assignInstructor(offeringId, target.value);
	}
</script>

<svelte:head>
	<title>Course Offerings — Admin</title>
</svelte:head>

<div class="page" onchange={handleAssign}>
	<div class="page-header">
		<div>
			<h1>Course Offerings</h1>
			<p class="subtitle">Atur instruktur untuk setiap course offering</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄 Refresh</button>
		</div>
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Card>
			<CardContent>
				<div class="error-state">
					<p class="error-text">{error}</p>
					<Button onclick={loadData}>Coba Lagi</Button>
				</div>
			</CardContent>
		</Card>
	{:else if offerings.length === 0}
		<EmptyState icon="📚" title="Tidak ada course offerings" description="Belum ada course offerings yang tersedia." />
	{:else}
		<DataTable
			{columns}
			data={offerings}
			showSearch={false}
			showPagination={false}
			emptyMessage="Tidak ada course offerings"
		/>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.error-state { text-align: center; padding: 20px; }
	.error-text { color: #ef4444; margin-bottom: 12px; font-size: 14px; }
</style>
