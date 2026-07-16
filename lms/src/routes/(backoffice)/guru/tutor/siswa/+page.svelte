<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

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
	let searchQuery = $state('');

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

	const filtered = $derived(
		searchQuery
			? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: students
	);

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active': return 'success';
			case 'paused': return 'warning';
			case 'completed': return 'info';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'active': return 'Aktif';
			case 'paused': return 'Jeda';
			case 'completed': return 'Selesai';
			default: return status;
		}
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Data Siswa — Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/tutor">← Tutor Dashboard</a></div>
		<h1>👨‍🎓 Data Siswa Privat</h1>
		<p class="subtitle">Daftar siswa, paket, dan sisa sesi</p>
	</div>

	<div class="toolbar">
		<input class="search-input" type="text" placeholder="Cari siswa..." bind:value={searchQuery} />
		<button class="btn btn-secondary btn-sm" onclick={loadStudents}>🔄 Refresh</button>
	</div>

	{#if loading}
		<Loading message="Memuat data siswa..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if students.length === 0}
		<EmptyState icon="👨‍🎓" title="Belum Ada Siswa" description="Belum ada siswa yang terdaftar." />
	{:else if filtered.length === 0}
		<EmptyState icon="🔍" title="Tidak Ditemukan" description="Tidak ada siswa yang cocok dengan pencarian." />
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>No</th>
						<th>Nama</th>
						<th>Paket</th>
						<th>Sisa Sesi</th>
						<th>Tanggal Daftar</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as s, i}
						<tr>
							<td class="col-num">{i + 1}</td>
							<td class="col-name">{s.name}</td>
							<td class="col-pkg">{s.package || '-'}</td>
							<td class="col-remaining">{s.remainingSessions}/{s.totalSessions}</td>
							<td class="col-date">{formatDate(s.joinDate)}</td>
							<td class="col-status">
								<Badge variant={getStatusBadge(s.status)}>{getStatusLabel(s.status)}</Badge>
							</td>
							<td class="col-action">
								<a href="/tutor/siswa/{s.id}" class="link-detail">Detail →</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
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
	.search-input {
		flex: 1; max-width: 300px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; background: var(--bg-secondary);
	}
	td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid var(--border-subtle); }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(255,255,255,0.02); }

	.col-num { width: 40px; color: var(--text-tertiary); }
	.col-name { font-weight: 500; }
	.col-pkg { color: var(--text-secondary); }
	.col-remaining { font-weight: 600; }
	.col-date { color: var(--text-tertiary); font-size: 12px; }
	.col-action { text-align: right; }
	.link-detail { color: var(--accent); text-decoration: none; font-weight: 500; font-size: 12px; }
	.link-detail:hover { text-decoration: underline; }

	.btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
	.btn-secondary { background: var(--accent); color: #fff; }
	.btn-secondary:hover { background: var(--accent-hover); }
	.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
