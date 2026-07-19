<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import RichEditor from '$lib/components/RichEditor.svelte';
import { addToast } from '$lib/stores/toast.svelte';

	let projects: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let editModal = $state<{ type: string; data: any } | null>(null);
	let tab = $state<'all' | 'draft' | 'published'>('all');

	onMount(() => {
		if (!browser) return;
		loadProjects();
	});

	async function loadProjects() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/projects');
			const json = await res.json();
			if (json.success) projects = json.data;
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	async function saveProject(data: any) {
		try {
			const res = await fetch('/api/admin/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (json.success) { editModal = null; loadProjects(); addToast('Project created', 'success'); }
			else addToast('Error: ' + (json.error || 'Unknown'), 'error');
		} catch { addToast('Error saving', 'error'); }
	}

	async function updateProject(slug: string, data: any) {
		try {
			const res = await fetch(`/api/admin/projects/${slug}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (json.success) { editModal = null; loadProjects(); addToast('Project updated', 'success'); }
			else addToast('Error: ' + (json.error || 'Unknown'), 'error');
		} catch { addToast('Error updating', 'error'); }
	}

	async function deleteProject(slug: string) {
		if (!confirm(`Delete project "${slug}"?`)) return;
		try {
			await fetch(`/api/admin/projects/${slug}`, { method: 'DELETE' });
			loadProjects();
			addToast('Project deleted', 'success');
		} catch { addToast('Error deleting', 'error'); }
	}

	async function toggleStatus(slug: string, current: string) {
		const newStatus = current === 'published' ? 'draft' : 'published';
		await updateProject(slug, { status: newStatus });
	}

	function openNew() {
		editModal = { type: 'project', data: { key: '', title: '', description: '', techs: '', difficulty: 'beginner', timeEstimate: '', steps: [], status: 'draft' } };
	}
	function openEdit(p: any) {
		editModal = { type: 'project', data: { key: p.key, title: p.title, description: p.description || '', techs: Array.isArray(p.techs) ? p.techs.join(', ') : p.techs || '', difficulty: p.difficulty || 'beginner', timeEstimate: p.timeEstimate || '', steps: p.steps || [], status: p.status || 'draft' } };
	}

	let editingStepIdx = $state<number | null>(null);

	function addStep() {
		const d = editModal!.data;
		d.steps = [...d.steps, { id: `step-${d.steps.length + 1}`, title: '', instruction: '' }];
	}
	function removeStep(idx: number) {
		const d = editModal!.data;
		d.steps = d.steps.filter((_: any, i: number) => i !== idx);
	}

	let filtered = $derived(projects.filter(p => tab === 'all' || p.status === tab));
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="projects-page">
	<div class="header-row">
		<h1>🚀 Project Management</h1>
		<Button size="sm" class="btn" onclick={loadProjects}>🔄 Refresh</Button>
	</div>

	{#if loading}
		<div class="loading">Loading projects...</div>
	{:else if error}
		<div><p>{error}</p><Button class="error-state" onclick={loadProjects}>{t('common.retry')}</Button></div>
	{:else}
		<div class="section-header">
			<div class="tabs">
				<button class="tab" class:active={tab === 'all'} onclick={() => tab = 'all'}>All ({projects.length})</button>
				<button class="tab" class:active={tab === 'published'} onclick={() => tab = 'published'}>Published ({projects.filter(p => p.status === 'published').length})</button>
				<button class="tab" class:active={tab === 'draft'} onclick={() => tab = 'draft'}>Drafts ({projects.filter(p => p.status === 'draft' || !p.status).length})</button>
			</div>
			<Button variant="primary" class="btn" onclick={openNew}>{t('admin.new_project')}</Button>
		</div>

		<div class="project-grid">
			{#each filtered as p}
				<div class="project-card">
					<div class="card-header">
						<span class="card-title">{p.title || p.key}</span>
						<span class="card-status" class:published={p.status === 'published'} class:draft={p.status !== 'published'}>
							{p.status || 'draft'}
						</span>
					</div>
					<p class="card-desc">{p.description?.slice(0, 120) || 'No description'}</p>
					<div class="card-meta">
						<span class="card-badge {p.difficulty}">{p.difficulty}</span>
						<span>{p.steps?.length || 0} steps</span>
						<span>{p.timeEstimate || '-'}</span>
					</div>
					<div class="card-techs">
						{(Array.isArray(p.techs) ? p.techs : []).map((t: string) => `<span class="tech-tag">${t}</span>`).join(' ')}
					</div>
					<div class="card-actions">
						<Button size="sm" class="btn" onclick={() => openEdit(p)}>✏️ Edit</Button>
						<Button size="sm" class="btn" onclick={() => toggleStatus(p.key, p.status || 'draft')}>
							{p.status === 'published' ? '📥 Unpublish' : '📤 Publish'}
						</Button>
						<Button variant="danger" size="sm" class="btn" onclick={() => deleteProject(p.key)}>🗑️</Button>
					</div>
				</div>
			{/each}
			{#if filtered.length === 0}
				<p class="empty">{t('admin.no_projects')}</p>
			{/if}
		</div>
	{/if}
</div>

<!-- Edit Modal -->
{#if editModal}
	{@const d = editModal.data}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => editModal = null} role="button" tabindex="-1">
		<div class="modal modal-wide" onclick={(e) => e.stopPropagation()} role="dialog">
			<div class="modal-header">
				<h2>{d.key ? 'Edit' : 'New'} Project</h2>
				<Button class="modal-close" onclick={() => editModal = null}>✕</Button>
			</div>
			<div class="modal-body">
				<div class="form-grid">
					<label>
						<span>Key (slug)</span>
<Input bind:value={d.key} placeholder="my-project" disabled />
					</label>
					<label>
						<span>Title</span>
<Input bind:value={d.title} placeholder="Project Title" />
					</label>
					<label class="full-width">
						<span>Description</span>
						<RichEditor
							content={d.description}
							placeholder="Project description with rich formatting..."
							onUpdate={(html) => d.description = html}
						/>
					</label>
					<label>
						<span>Techs (comma separated)</span>
<Input bind:value={d.techs} placeholder="HTML, CSS, JS" />
					</label>
					<label>
						<span>Difficulty</span>
<Select bind:value={d.difficulty} options={[{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }]} />
					</label>
					<label>
						<span>Time Estimate</span>
<Input bind:value={d.timeEstimate} placeholder="2 hours" />
					</label>
				</div>

				<!-- Steps Editor -->
				<div class="steps-section">
					<div class="steps-header">
						<h3>Steps ({d.steps.length})</h3>
						<Button size="sm" class="btn" onclick={addStep}>+ Add Step</Button>
					</div>
					{#each d.steps as step, idx}
						<div class="step-editor">
							<div class="step-header">
								<span class="step-num">Step {idx + 1}</span>
								<Button variant="danger" size="sm" onclick={() => removeStep(idx)}>✕</Button>
							</div>
<Input bind:value={step.id} placeholder="step-id" class="step-id" />
<Input bind:value={step.title} placeholder="Step title" />
							<RichEditor
								content={step.instruction}
								placeholder="Step instructions with rich formatting..."
								onUpdate={(html) => step.instruction = html}
							/>
						</div>
					{/each}
				</div>

				<div class="modal-actions">
					<Button class="btn" onclick={() => editModal = null}>{t('common.cancel')}</Button>
					<Button onclick={() => d.key ? updateProject(d.key, {
						title: d.title,
						description: d.description,
						techs: typeof d.techs === 'string' ? d.techs.split(',').map((t: string) => t.trim()).filter(Boolean) : d.techs,
						difficulty: d.difficulty,
						timeEstimate: d.timeEstimate,
						steps: d.steps,
						status: d.status,
					}) : saveProject({
						key: d.key,
						title: d.title,
						description: d.description,
						techs: typeof d.techs === 'string' ? d.techs.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
						difficulty: d.difficulty,
						timeEstimate: d.timeEstimate,
						steps: d.steps,
						status: d.status,
					})}>{t('common.save')}</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.projects-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	.loading, .error-state { text-align: center; padding: 60px; color: var(--text-secondary); }

	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
	.tabs { display: flex; gap: 4px; background: var(--bg-secondary); border-radius: 8px; padding: 3px; }
	.tab { padding: 7px 14px; border: none; border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; }
	.tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

	.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
	.project-card {
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
		padding: 16px; display: flex; flex-direction: column; gap: 8px;
	}
	.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
	.card-title { font-weight: 600; font-size: 14px; }
	.card-status { font-size: 10px; padding: 2px 10px; border-radius: 10px; font-weight: 600; text-transform: uppercase; }
	.card-status.published { background: #d1fae5; color: #065f46; }
	.card-status.draft { background: #f3f4f6; color: #64748b; }
	.card-desc { font-size: 12px; color: var(--text-secondary); }
	.card-meta { display: flex; gap: 10px; font-size: 12px; align-items: center; }
	.card-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; text-transform: capitalize; }
	.card-badge.beginner { background: #dbeafe; color: #1d4ed8; }
	.card-badge.intermediate { background: #fef3c7; color: #b45309; }
	.card-badge.advanced { background: #fce7f3; color: #be185d; }
	.card-techs { display: flex; flex-wrap: wrap; gap: 4px; }
	:global(.tech-tag) { font-size: 10px; padding: 2px 8px; background: var(--bg-secondary); border-radius: 6px; color: var(--text-secondary); }
	.card-actions { display: flex; gap: 6px; margin-top: 4px; }
	.empty { color: var(--text-secondary); text-align: center; padding: 40px; grid-column: 1 / -1; }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
	.modal-wide { max-width: 640px; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 0; }
	.modal-header h2 { font-size: 18px; font-weight: 600; }
	.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-secondary); }
	.modal-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 16px; }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.form-grid .full-width { grid-column: 1 / -1; }
	.modal-body label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 500; }
	.modal-body input, .modal-body select, .modal-body textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 13px; }
	.modal-body textarea { font-family: inherit; resize: vertical; }

	.steps-section { border-top: 1px solid var(--border); padding-top: 14px; }
	.steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.steps-header h3 { font-size: 14px; font-weight: 600; }
	.step-editor { border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px; }
	.step-header { display: flex; justify-content: space-between; align-items: center; }
	.step-num { font-weight: 600; font-size: 13px; color: var(--accent); }
	.step-id { font-family: monospace; font-size: 12px; }
	.step-editor input, .step-editor textarea { padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 12px; }
	.step-editor textarea { font-family: inherit; }

	.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

	.btn { display: inline-block; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer; }
	.btn-sm { padding: 5px 10px; font-size: 12px; }
	.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn-danger { background: var(--danger); color: #fff; border-color: var(--danger); }
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.form-grid { grid-template-columns: 1fr; }
		.project-grid { grid-template-columns: 1fr; }
	}
</style>
