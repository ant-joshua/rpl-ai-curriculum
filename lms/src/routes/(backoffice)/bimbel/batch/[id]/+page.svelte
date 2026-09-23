<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Skeleton, EmptyState, Badge, Input, Button, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '$lib/components/ui';
	import { page } from '$app/stores';
	import { t } from '$lib/stores/i18n';

	type Student = {
		id: string;
		name: string;
		nis: string;
		joinedAt: string;
	};

	let loading = $state(true);
	let error = $state('');
	let batch: any = $state(null);
	let students: Student[] = $state([]);
	let loadingEnroll = $state(false);

	const batchId = $derived($page.params.id);

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true; error = '';
		try {
			const [resBatch, resStudents] = await Promise.all([
				fetch(`/api/bimbel/batch/${batchId}`),
				fetch(`/api/bimbel/batch/${batchId}/enroll`),
			]);
			const [jsonBatch, jsonStudents] = await Promise.all([
				resBatch.json(), resStudents.json(),
			]);
			if (jsonBatch.success) batch = jsonBatch.data;
			else { error = jsonBatch.error || 'Gagal memuat batch'; return; }
			if (jsonStudents.success) students = jsonStudents.data || [];
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	async function unenrollStudent(studentId: string) {
		if (!confirm('Yakin ingin mengeluarkan siswa ini dari batch?')) return;
		try {
			const res = await fetch(`/api/bimbel/batch/${batchId}/enroll/${studentId}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				students = students.filter(s => s.id !== studentId);
			} else error = json.error || 'Gagal mengeluarkan siswa';
		} catch { error = 'Gagal menghapus siswa'; }
	}

	let enrollStudentId = $state('');
	let showEnroll = $state(false);
	let enrollSaving = $state(false);
	let studentSearch = $state('');
	function toggleEnroll() { showEnroll = !showEnroll; }

	const filteredStudents = $derived(
		studentSearch
			? students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.nis && s.nis.includes(studentSearch)))
			: students
	);

	async function enrollStudent() {
		if (!enrollStudentId.trim()) return;
		loadingEnroll = true;
		try {
			const res = await fetch(`/api/bimbel/batch/${batchId}/enroll`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ studentId: enrollStudentId.trim() }),
			});
			const json = await res.json();
			if (json.success) {
				enrollStudentId = '';
				showEnroll = false;
				loadData();
			} else error = json.error || 'Gagal mendaftarkan siswa';
		} catch { error = 'Gagal mendaftarkan siswa'; }
		finally { loadingEnroll = false; }
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active': return 'success';
			case 'completed': return 'info';
			case 'cancelled': return 'danger';
			default: return 'default';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'active': return t('batch.status_active');
			case 'completed': return t('batch.status_completed');
			case 'cancelled': return t('batch.status_cancelled');
			default: return status;
		}
	}
</script>

<svelte:head>
	<title>{batch?.name || t('batch.detail')} — Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel/batch">← {t('batch.breadcrumb')}</a></div>

		{#if loading}
			<Skeleton variant="block" count={1} />
		{:else if error}
			<div class="error-state">{error}</div>
		{:else if batch}
			<div class="batch-header">
				<div>
					<h1>{batch.name}</h1>
					<p class="subtitle">
						{t('batch.type_label')}: {batch.type || '-'}
						<span class="sep">·</span>
						<Badge variant={getStatusBadge(batch.status)}>{getStatusLabel(batch.status)}</Badge>
						<span class="sep">·</span>
						{students.length} {t('batch.student_count_unit')}
					</p>
				</div>
			</div>

			<div class="toolbar">
				<Input type="text" placeholder={t('batch.search_placeholder')} bind:value={studentSearch} />
				<Button variant="primary" size="sm" onclick={toggleEnroll}>
					{showEnroll ? t('batch.toggle_close') : t('batch.enroll_student')}
				</Button>
				<Button variant="ghost" size="sm" onclick={loadData}>🔄 {t('common.refresh')}</Button>
			</div>

			{#if showEnroll}
				<div class="enroll-box">
					<Input type="text" placeholder={t('batch.student_id_placeholder')} bind:value={enrollStudentId} />
					<Button variant="primary" size="sm" onclick={enrollStudent} disabled={loadingEnroll || !enrollStudentId.trim()}>
						{loadingEnroll ? t('batch.enrolling') : t('batch.enroll')}
					</Button>
				</div>
			{/if}

			{#if students.length === 0}
				<EmptyState icon="👨‍🎓" title={t('batch.no_students_title')} description={t('batch.no_students_desc')} />
			{:else if filteredStudents.length === 0}
				<EmptyState icon="🔍" title={t('common.not_found')} description={t('batch.no_students_match')} />
			{:else}
				<div class="table-wrap">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead class="col-num">{t('batch.col_no')}</TableHead>
								<TableHead class="col-name">{t('batch.col_name')}</TableHead>
								<TableHead class="col-nis">{t('batch.col_nis')}</TableHead>
								<TableHead class="col-date">{t('batch.col_date')}</TableHead>
								<TableHead class="col-action"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each filteredStudents as s, i}
								<TableRow>
									<TableCell class="col-num">{i + 1}</TableCell>
									<TableCell class="col-name">{s.name}</TableCell>
									<TableCell class="col-nis">{s.nis || '-'}</TableCell>
									<TableCell class="col-date">{formatDate(s.joinedAt)}</TableCell>
									<TableCell class="col-action">
										<Button variant="danger" size="sm" onclick={() => unenrollStudent(s.id)}>{t('batch.remove')}</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.page { max-width: 860px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.batch-header { margin-bottom: 20px; }
	.batch-header h1 { font-size: 24px; margin: 0 0 8px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.sep { color: var(--text-quaternary); }

	.toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
	.search-input {
		flex: 1; max-width: 280px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

	.enroll-box { display: flex; gap: 8px; margin-bottom: 16px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; align-items: center; }
	.input-field {
		flex: 1; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit;
	}
	.input-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }

	:global(.col-num) { width: 40px; color: var(--text-tertiary); }
	:global(.col-name) { font-weight: 500; }
	:global(.col-nis) { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
	:global(.col-date) { color: var(--text-tertiary); font-size: 12px; }
	:global(.col-action) { text-align: right; }
</style>
