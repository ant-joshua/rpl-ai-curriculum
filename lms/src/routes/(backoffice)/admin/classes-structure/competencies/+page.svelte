<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, DataTable, Input, Select, Textarea } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: any } = $props();

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Code',
			accessorKey: 'code',
			cell: ({ getValue }) => `<code>${getValue()}</code>`
		},
		{ header: 'Mata Pelajaran', accessorKey: 'subject_name' },
		{
			header: 'Tipe',
			accessorKey: 'competence_type',
			cell: ({ getValue }) => {
				const t = getValue() as string;
				const cls = t === 'pengetahuan' ? 'tag-pengetahuan' : 'tag-keterampilan';
				return `<span class="tag ${cls}">${t}</span>`;
			}
		},
		{
			header: 'Deskripsi',
			accessorKey: 'description',
			cell: ({ getValue }) => {
				const v = getValue() as string;
				return v.length > 60 ? v.slice(0, 60) + '...' : v;
			}
		},
		{
			header: 'Semester',
			accessorKey: 'semester',
			cell: ({ getValue }) => (getValue() as number | null) ?? '—'
		}
	];

	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state({
		subject_id: data.filters.subjectId || '',
		competence_type: 'pengetahuan',
		code: '',
		type: 'umum',
		description: '',
		grade_level_id: '',
		semester: '',
		topics: ''
	});
	let error = $state('');
	let saving = $state(false);

	function openForm(kd?: any) {
		if (kd) {
			editingId = kd.id;
			form = {
				subject_id: kd.subject_id,
				competence_type: kd.competence_type,
				code: kd.code,
				type: kd.type || 'umum',
				description: kd.description,
				grade_level_id: kd.grade_level_id || '',
				semester: kd.semester ? String(kd.semester) : '',
				topics: kd.topics || ''
			};
		} else {
			editingId = null;
			form = { subject_id: data.filters.subjectId || '', competence_type: 'pengetahuan', code: '', type: 'umum', description: '', grade_level_id: '', semester: '', topics: '' };
		}
		showForm = true;
		error = '';
	}

	function closeForm() { showForm = false; editingId = null; error = ''; }

	async function save() {
		saving = true;
		error = '';
		try {
			const res = await fetch('/api/admin/classes-structure/competencies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					subject_id: form.subject_id,
					kds: [{
						code: form.code,
						competence_type: form.competence_type,
						description: form.description,
						type: form.type,
						grade_level_id: form.grade_level_id || undefined,
						semester: form.semester ? Number(form.semester) : undefined,
						topics: form.topics || undefined
					}]
				})
			});
			const result = await res.json();
			if (result.success) {
				closeForm();
				invalidateAll();
			} else {
				error = result.error || 'Gagal menyimpan';
			}
		} catch {
			error = 'Gagal menyimpan';
		} finally {
			saving = false;
		}
	}

	function filterSubject(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const params = new URLSearchParams($page.url.searchParams);
		if (val) params.set('subject_id', val); else params.delete('subject_id');
		goto(`/admin/classes-structure/kd?${params.toString()}`);
	}

	function filterType(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const params = new URLSearchParams($page.url.searchParams);
		if (val) params.set('type', val); else params.delete('type');
		goto(`/admin/classes-structure/kd?${params.toString()}`);
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="page-header">
	<h2>{t('admin.kompetensi_dasar')}</h2>
	<Button variant="primary" class="btn" onclick={() => openForm()}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
		Tambah KD
	</Button>
</div>

<div class="filters">
	<select onchange={filterSubject} class="filter-select">
		<option value="">Semua Mata Pelajaran</option>
		{#each data.subjects as s}
			<option value={s.id} selected={data.filters.subjectId === s.id}>{s.name}</option>
		{/each}
	</select>
	<select onchange={filterType} class="filter-select">
		<option value="">{t('exercises.all_types')}</option>
		<option value="pengetahuan" selected={data.filters.type === 'pengetahuan'}>Pengetahuan</option>
		<option value="keterampilan" selected={data.filters.type === 'keterampilan'}>Keterampilan</option>
	</select>
</div>

<div class="table-wrap">
	<DataTable {columns} data={data.kds} onRowClick={(row) => openForm(row)} pageSize={20} showSearch={true} searchPlaceholder="Cari kompetensi..." emptyMessage="Belum ada Kompetensi Dasar" emptyIcon="📋" />
</div>

{#if showForm}
	<div class="modal-overlay" onclick={closeForm} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>{editingId ? 'Edit Kompetensi Dasar' : 'Tambah Kompetensi Dasar'}</h3>
			{#if error}<div class="error-banner">{error}</div>{/if}
			<form onsubmit={(e) => { e.preventDefault(); save(); }}>
				<div class="form-grid">
					<div class="form-group">
						<label>{t('admin.mapel')}</label>
<Select bind:value={form.subject_id} required options={data.subjects.map((s) => ({ value: s.id, label: s.name }))} />
					</div>
					<div class="form-group">
						<label>Code (e.g., 3.1, 4.2)</label>
<Input bind:value={form.code} placeholder="3.1" required />
					</div>
					<div class="form-group">
						<label>Tipe Kompetensi</label>
<Select bind:value={form.competence_type} required options={[{ value: "pengetahuan", label: "Pengetahuan" }, { value: "keterampilan", label: "Keterampilan" }]} />
					</div>
					<div class="form-group">
						<label>{t('admin.tipe')}</label>
<Select bind:value={form.type} options={[{ value: "umum", label: "Umum" }, { value: "inti", label: "Inti" }, { value: "pengayaan", label: "Pengayaan" }]} />
					</div>
					<div class="form-group full-width">
						<label>{t('common.description')}</label>
<Textarea bind:value={form.description} rows=3 required />
					</div>
					<div class="form-group">
						<label>{t('admin.semester')}</label>
<Select bind:value={form.semester} options={[{ value: "", label: "—" }, { value: "1", label: "1" }, { value: "2", label: "2" }]} />
					</div>
					<div class="form-group full-width">
						<label>Topics (optional)</label>
<Input bind:value={form.topics} placeholder="Comma separated" />
					</div>
				</div>
				<div class="modal-actions">
					<Button class="btn" type="button" onclick={closeForm}>{t('common.cancel')}</Button>
					<Button variant="primary" class="btn" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.page-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 16px; }
	.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--text-primary); }
	.filters { padding: 0 24px 16px; display: flex; gap: 12px; }
	.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; }
	.table-wrap { padding: 0 24px; }
	code { font-size: 12px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; }
	.tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
	.tag-pengetahuan { background: rgba(108, 92, 231, 0.15); color: #a29bfe; }
	.tag-keterampilan { background: rgba(0, 184, 148, 0.15); color: #00b894; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
	.modal { background: var(--bg-primary); border-radius: 16px; padding: 24px; width: 90%; max-width: 560px; max-height: 85vh; overflow-y: auto; }
	.modal h3 { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: var(--text-primary); }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	.form-group.full-width { grid-column: 1 / -1; }
	label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
	input, select, textarea { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; font-family: inherit; }
	textarea { resize: vertical; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); }
	.error-banner { background: rgba(255, 71, 87, 0.1); border: 1px solid rgba(255, 71, 87, 0.3); color: #ff4757; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
	.btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
	.btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
