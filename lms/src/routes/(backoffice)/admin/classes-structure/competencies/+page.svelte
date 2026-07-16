<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: any } = $props();

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
</script>

<div class="page-header">
	<h2>Kompetensi Dasar</h2>
	<button class="btn btn-primary" onclick={() => openForm()}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
		Tambah KD
	</button>
</div>

<div class="filters">
	<select onchange={filterSubject} class="filter-select">
		<option value="">Semua Mata Pelajaran</option>
		{#each data.subjects as s}
			<option value={s.id} selected={data.filters.subjectId === s.id}>{s.name}</option>
		{/each}
	</select>
	<select onchange={filterType} class="filter-select">
		<option value="">Semua Tipe</option>
		<option value="pengetahuan" selected={data.filters.type === 'pengetahuan'}>Pengetahuan</option>
		<option value="keterampilan" selected={data.filters.type === 'keterampilan'}>Keterampilan</option>
	</select>
</div>

<div class="table-wrap">
	<table class="data-table">
		<thead>
			<tr>
				<th>Code</th>
				<th>Mata Pelajaran</th>
				<th>Tipe</th>
				<th>Deskripsi</th>
				<th>Semester</th>
			</tr>
		</thead>
		<tbody>
			{#if data.kds.length === 0}
				<tr><td colspan="5" class="empty-cell">Belum ada Kompetensi Dasar</td></tr>
			{:else}
				{#each data.kds as kd (kd.id)}
					<tr class="clickable" onclick={() => openForm(kd)}>
						<td><code>{kd.code}</code></td>
						<td>{kd.subject_name}</td>
						<td><span class="tag tag-{kd.competence_type}">{kd.competence_type}</span></td>
						<td class="desc-cell">{kd.description.length > 60 ? kd.description.slice(0, 60) + '...' : kd.description}</td>
						<td>{kd.semester || '—'}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

{#if showForm}
	<div class="modal-overlay" onclick={closeForm} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>{editingId ? 'Edit Kompetensi Dasar' : 'Tambah Kompetensi Dasar'}</h3>
			{#if error}<div class="error-banner">{error}</div>{/if}
			<form onsubmit={(e) => { e.preventDefault(); save(); }}>
				<div class="form-grid">
					<div class="form-group">
						<label>Mata Pelajaran</label>
						<select bind:value={form.subject_id} required>
							<option value="">Pilih</option>
							{#each data.subjects as s}
								<option value={s.id}>{s.name}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label>Code (e.g., 3.1, 4.2)</label>
						<input type="text" bind:value={form.code} required placeholder="3.1" />
					</div>
					<div class="form-group">
						<label>Tipe Kompetensi</label>
						<select bind:value={form.competence_type} required>
							<option value="pengetahuan">Pengetahuan</option>
							<option value="keterampilan">Keterampilan</option>
						</select>
					</div>
					<div class="form-group">
						<label>Tipe</label>
						<select bind:value={form.type}>
							<option value="umum">Umum</option>
							<option value="inti">Inti</option>
							<option value="pengayaan">Pengayaan</option>
						</select>
					</div>
					<div class="form-group full-width">
						<label>Deskripsi</label>
						<textarea bind:value={form.description} required rows="3"></textarea>
					</div>
					<div class="form-group">
						<label>Semester</label>
						<select bind:value={form.semester}>
							<option value="">—</option>
							<option value="1">1</option>
							<option value="2">2</option>
						</select>
					</div>
					<div class="form-group full-width">
						<label>Topics (optional)</label>
						<input type="text" bind:value={form.topics} placeholder="Comma separated" />
					</div>
				</div>
				<div class="modal-actions">
					<button type="button" class="btn" onclick={closeForm}>Batal</button>
					<button type="submit" class="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
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
	.data-table { width: 100%; border-collapse: collapse; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; }
	.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 13px; }
	.data-table th { color: var(--text-secondary); font-weight: 500; background: var(--bg-tertiary); }
	.data-table td { color: var(--text-primary); }
	.data-table tr.clickable:hover { background: var(--bg-tertiary); cursor: pointer; }
	.empty-cell { text-align: center; color: var(--text-secondary); padding: 32px; }
	.desc-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); }
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
