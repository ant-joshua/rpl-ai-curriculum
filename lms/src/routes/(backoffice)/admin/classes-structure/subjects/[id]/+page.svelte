<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, DataTable, Input, Select, Textarea } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let mapel: any = $state(null);
	let kdList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let mapelId = $derived($page.params.id);

	// Add KD form
	let showForm = $state(false);
	let formCode = $state('');
	let formType = $state('pengetahuan');
	let formCompetenceType = $state('3');
	let formDescription = $state('');
	let formSemester = $state(1);
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => {
		if (browser) {
			(window as any).__deleteKD = deleteKD;
			loadData();
		}
	});

	async function loadData() {
		loading = true; error = '';
		try {
			const [mapelRes, kdRes] = await Promise.all([
				fetch(`/api/admin/classes-structure/subjects/${mapelId}`),
				fetch(`/api/admin/classes-structure/subjects/${mapelId}/kd`),
			]);
			const mjson = await mapelRes.json();
			const kjson = await kdRes.json();
			if (mjson.success) mapel = mjson.data; else error = mjson.error || 'Mapel tidak ditemukan';
			if (kjson.success) kdList = kjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openForm() {
		formCode = ''; formType = 'pengetahuan'; formCompetenceType = '3';
		formDescription = ''; formSemester = 1; saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formCode.trim() || !formDescription.trim()) {
			saveError = 'Kode KD dan deskripsi wajib diisi';
			return;
		}
		saving = true; saveError = '';
		try {
			const res = await fetch(`/api/admin/classes-structure/subjects/${mapelId}/kd`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code: formCode.trim(),
					type: formType,
					competence_type: formCompetenceType,
					description: formDescription.trim(),
					semester: formSemester,
				}),
			});
			const json = await res.json();
			if (json.success) {
				kdList = [...kdList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan KD';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function deleteKD(kdId: string) {
		if (!confirm('Yakin hapus KD ini?')) return;
		try {
			const res = await fetch(`/api/admin/classes-structure/subjects/${mapelId}/kd/${kdId}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) kdList = kdList.filter(k => k.id !== kdId);
		} catch { /* ignore */ }
	}

	const typeLabels: Record<string, string> = {
		pengetahuan: 'Pengetahuan', keterampilan: 'Keterampilan', sikap: 'Sikap',
	};

	const typeColors: Record<string, string> = {
		pengetahuan: 'background: rgba(94,106,210,0.1); color: #5e6ad2',
		keterampilan: 'background: rgba(16,185,129,0.1); color: #10b981',
		sikap: 'background: rgba(245,158,11,0.1); color: #f59e0b',
	};

	const compTypeLabels: Record<string, string> = {
		'3': 'KI-3 Pengetahuan', '4': 'KI-4 Keterampilan', '1': 'KI-1 Spiritual', '2': 'KI-2 Sosial',
	};

	const compTypeColors: Record<string, string> = {
		'3': 'background: rgba(94,106,210,0.1); color: #5e6ad2',
		'4': 'background: rgba(16,185,129,0.1); color: #10b981',
		'1': 'background: rgba(245,158,11,0.1); color: #f59e0b',
		'2': 'background: rgba(236,72,153,0.1); color: #ec4899',
	};

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Kode', accessorKey: 'code',
			cell: ({ getValue }) => `<code class="kd-code">${getValue()}</code>`
		},
		{
			header: 'Tipe', accessorKey: 'type',
			cell: ({ getValue }) => {
				const t = getValue() as string;
				return `<span class="type-badge" style="${typeColors[t] || typeColors['pengetahuan']}">${typeLabels[t] || t}</span>`;
			}
		},
		{
			header: 'KI', id: 'ki',
			cell: ({ row }) => {
				const ct = row.original.competence_type || row.original.competenceType;
				const ctStr = String(ct || '');
				return `<span class="comp-badge" style="${compTypeColors[ctStr] || ''}">${compTypeLabels[ctStr] || ct || ''}</span>`;
			}
		},
		{ header: 'Deskripsi', accessorKey: 'description', cell: ({ getValue }) => `<span style="max-width:350px;white-space:normal;line-height:1.5;color:var(--text-secondary)">${getValue()}</span>` },
		{ header: 'Semester', accessorKey: 'semester', cell: ({ getValue }) => `<span style="text-align:center">Smt ${getValue() || 1}</span>` },
		{
			header: 'Aksi', id: 'aksi',
			cell: ({ row }) => `<button class="btn-danger-icon" onclick="window.__deleteKD('${row.original.id}')" title="Hapus KD">✕</button>`
		},
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<a href="/admin/classes-structure/mapel" class="btn-primary">{t('admin.kembali')}</a>
		</div>
	{:else if mapel}
		<div class="header">
			<div>
				<a href="/admin/classes-structure/mapel" class="back-link">← Mata Pelajaran</a>
				<h1>{mapel.name}</h1>
				<div class="meta">
					<code>{mapel.code || '—'}</code>
					<span class="type-badge" style={typeColors[mapel.type] || typeColors['pengetahuan']}>
						{typeLabels[mapel.type] || mapel.type || '—'}
					</span>
					<span class="meta-item">Kelompok: {mapel.group_name || mapel.groupName || '—'}</span>
					<span class="meta-item">JP/mgg: {mapel.min_hours_per_week ?? mapel.minHoursPerWeek ?? '—'}</span>
				</div>
			</div>
		</div>

		<div class="info-grid">
			<div class="info-card">
				<span class="info-label">{t('admin.tingkat')}</span>
				<span class="info-value">{mapel.grade_level_name || mapel.gradeLevelName || 'Semua'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">{t('admin.jurusan')}</span>
				<span class="info-value">{mapel.major_name || mapel.majorName || 'Semua'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Jumlah KD</span>
				<span class="info-value">{kdList.length}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Kurikulum</span>
				<span class="info-value">{mapel.curriculum || 'K13'}</span>
			</div>
		</div>

		<!-- KD List -->
		<div class="card">
			<div class="card-header">
				<h2>🎯 Kompetensi Dasar (KD)</h2>
				<div class="card-header-actions">
					<span class="badge-count">{kdList.length} KD</span>
					<Button variant="primary" size="sm" onclick={openForm}>+ Tambah KD</Button>
				</div>
			</div>

			{#if kdList.length === 0}
				<div class="empty-sub">
					<p>Belum ada KD untuk mata pelajaran ini</p>
				</div>
			{:else}
				<DataTable {columns} data={kdList} pageSize={20} showSearch={true} searchPlaceholder="Cari KD..." />
			{/if}
		</div>

		<!-- Mapel Description -->
		{#if mapel.description}
			<div class="card card-desc">
				<h2>{t('common.description')}</h2>
				<p>{mapel.description}</p>
			</div>
		{/if}
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Tambah KD Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field-row">
					<div class="field">
<Input label="Kode KD" bind:value={formCode} placeholder="Cth: 3.1" />
					</div>
					<div class="field">
<Select label={t('admin.semester')} bind:value={formSemester} />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
<Select label="Tipe KD" bind:value={formType} options={[{ value: "pengetahuan", label: "Pengetahuan" }, { value: "keterampilan", label: "Keterampilan" }, { value: "sikap", label: "Sikap" }]} />
					</div>
					<div class="field">
<Select label="Kompetensi Inti" bind:value={formCompetenceType} options={[{ value: "1", label: "KI-1 (Spiritual)" }, { value: "2", label: "KI-2 (Sosial)" }, { value: "3", label: "KI-3 (Pengetahuan)" }, { value: "4", label: "KI-4 (Keterampilan)" }]} />
					</div>
				</div>
				<div class="field">
<Textarea label="Deskripsi KD" placeholder="Deskripsi kompetensi dasar..." bind:value={formDescription} rows=4 />
				</div>
			</div>
			<div class="modal-footer">
				<Button variant="secondary" onclick={closeForm}>{t('common.cancel')}</Button>
				<Button variant="primary" onclick={submitForm} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan KD'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1000px; }
	.header { margin-bottom: 24px; }
	.back-link { color: var(--text-secondary); text-decoration: none; font-size: 13px; display: inline-block; margin-bottom: 8px; }
	.back-link:hover { color: var(--accent); }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
	.meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 13px; color: var(--text-secondary); }
	.meta-item { display: flex; align-items: center; gap: 4px; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.kd-code { font-weight: 600; background: rgba(94,106,210,0.1); color: #5e6ad2; }

	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; }
	.error-msg { color: #ef4444; margin-bottom: 16px; }
	.btn-primary { display: inline-block; padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-sm { padding: 6px 12px; font-size: 12px; }

	.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: 24px; }
	.info-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
	.info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); font-weight: 600; }
	.info-value { font-size: 16px; font-weight: 600; color: var(--text); }
	.type-badge, .comp-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
	.card-desc { padding: 18px; }
	.card-desc h2 { font-size: 14px; font-weight: 600; margin: 0 0 8px; }
	.card-desc p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; }
	.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.card-header h2 { margin: 0; font-size: 15px; font-weight: 600; }
	.card-header-actions { display: flex; align-items: center; gap: 10px; }
	.badge-count { font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 3px 10px; border-radius: 20px; }
	.empty-sub { text-align: center; padding: 40px; color: var(--text-secondary); }
	.btn-danger-icon { background: none; border: 1px solid transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
	.btn-danger-icon:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 540px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; resize: vertical; font-family: inherit; }
	.field textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field-row { display: flex; gap: 12px; }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>
