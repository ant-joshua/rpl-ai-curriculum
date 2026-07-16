<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Loading, EmptyState, Badge, Button } from '$lib/components/ui/index.js';

	let classId = $state('');
	let classInfo: any = $state(null);
	let students: any[] = $state([]);
	let loading = $state(true);
	let generating = $state(false);
	let error = $state('');
	let selectedSemester = $state('1');

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('rapor');
			if (idx !== -1 && parts[idx + 1]) classId = parts[idx + 1];
			const sem = $page.url.searchParams.get('semester');
			if (sem) selectedSemester = sem;
		}
	});

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		if (!classId) { setTimeout(() => loadAll(), 100); return; }
		loading = true;
		error = '';
		try {
			const [clsRes, stRes] = await Promise.all([
				fetch(`/api/guru/rapor/kelas/${classId}?semester=${selectedSemester}`),
				fetch(`/api/guru/rapor/kelas/${classId}/siswa?semester=${selectedSemester}`),
			]);
			const cls = await clsRes.json();
			const st = await stRes.json();
			if (cls.success) classInfo = cls.data;
			if (st.success) students = st.data || [];
			else error = st.error || 'Gagal memuat data siswa';
		} catch { error = 'Gagal memuat data'; }
		finally { loading = false; }
	}

	async function generateRapor(studentId: string) {
		try {
			const res = await fetch('/api/guru/rapor/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					class_id: classId,
					user_id: studentId,
					semester: parseInt(selectedSemester),
				}),
			});
			const json = await res.json();
			if (json.success) {
				loadAll();
			} else {
				alert(json.error || 'Gagal generate rapor');
			}
		} catch { alert('Gagal generate rapor'); }
	}

	async function generateAll() {
		if (!students.length) return;
		generating = true;
		try {
			const promises = students.map(s => 
				fetch('/api/guru/rapor/generate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						class_id: classId,
						user_id: s.id || s.user_id,
						semester: parseInt(selectedSemester),
					}),
				}).then(r => r.json())
			);
			await Promise.all(promises);
			loadAll();
		} catch { /* best-effort */ }
		finally { generating = false; }
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	function statusVariant(status: string): 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline' {
		if (status === 'finalized') return 'success';
		if (status === 'printed') return 'primary';
		return 'outline';
	}

	function getStatusLabel(status: string): string {
		if (status === 'finalized') return 'Finalized';
		if (status === 'printed') return 'Printed';
		return 'Draft';
	}
</script>

<svelte:head>
	<title>Rapor — {classInfo?.name || classInfo?.class_name || 'Loading'} — Wali Kelas — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data rapor..." />
	{:else if error && !classInfo}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/rapor">← Daftar Kelas</a>
				</div>
				<h1>📄 Rapor Siswa</h1>
				<p class="meta">
					{classInfo?.name || classInfo?.class_name}
					{#if classInfo?.grade_level_name}
						<span class="meta-sep">·</span>
						<span>{classInfo.grade_level_name}</span>
					{/if}
				</p>
			</div>
			<div class="header-actions">
				<select class="sem-select" bind:value={selectedSemester} onchange={() => loadAll()}>
					<option value="1">Semester Ganjil</option>
					<option value="2">Semester Genap</option>
				</select>
				<Button onclick={generateAll} disabled={generating || students.length === 0} variant="secondary" size="sm">
					{generating ? '⏳ Generating...' : '⚡ Generate All'}
				</Button>
			</div>
		</div>

		{#if students.length === 0}
			<EmptyState icon="👨‍🎓" message="Belum ada siswa di kelas ini." description="Tambahkan siswa terlebih dahulu pada menu struktur kelas." />
		{:else}
			<div class="table-wrapper">
				<table class="rapor-table">
					<thead>
						<tr>
							<th class="rank-col">No</th>
							<th class="name-col">Nama Siswa</th>
							<th class="status-col">Status</th>
							<th class="action-col">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student, i}
							<tr>
								<td class="rank-col">{i + 1}</td>
								<td class="name-col">
									<span class="student-name">{student.name || student.display_name || 'Siswa'}</span>
								</td>
								<td class="status-col">
									<Badge variant={statusVariant(student.rapor_status || 'draft')}>
										{getStatusLabel(student.rapor_status || 'draft')}
									</Badge>
								</td>
								<td class="action-col">
									<div class="action-group">
										{#if !student.rapor_status || student.rapor_status === 'draft'}
											<Button onclick={() => generateRapor(student.id || student.user_id)} variant="secondary" size="sm">
												Generate
											</Button>
										{/if}
										<a href="/guru/rapor/{classId}/{student.id || student.user_id}?semester={selectedSemester}" class="preview-link">
											<Button variant={student.rapor_status === 'draft' ? 'outline' : 'primary'} size="sm">
												Preview
											</Button>
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 900px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 22px; margin: 0 0 4px; }
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; gap: 6px; }
	.meta-sep { color: var(--text-quaternary); }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
	.rapor-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 400px; }
	.rapor-table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; background: var(--surface); }
	.rapor-table td { padding: 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }

	.rank-col { text-align: center; min-width: 36px; width: 36px; font-weight: 600; font-size: 12px; color: var(--text-secondary); }
	.name-col { min-width: 180px; }
	.student-name { font-weight: 600; font-size: 13px; }
	.status-col { text-align: center; min-width: 90px; }
	.action-col { text-align: right; min-width: 170px; }

	.action-group { display: flex; gap: 6px; justify-content: flex-end; align-items: center; }
	.preview-link { text-decoration: none; }
</style>
