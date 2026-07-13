<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let modules: any[] = $state([]);
	let exercises: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let tab = $state<'modules' | 'exercises' | 'flashcards'>('modules');
	let editModal = $state<{ type: string; data: any } | null>(null);

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [modRes, exRes] = await Promise.all([
				fetch('/api/admin/modules'),
				fetch('/api/admin/exercises'),
			]);
			const modJson = await modRes.json();
			const exJson = await exRes.json();
			if (modJson.success) modules = modJson.data;
			if (exJson.success) exercises = exJson.data;
		} catch (e) {
			error = 'Failed to load content';
		} finally {
			loading = false;
		}
	}

	async function saveModule(data: any) {
		try {
			const res = await fetch('/api/admin/modules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (json.success) {
				editModal = null;
				loadAll();
			} else {
				alert('Error: ' + (json.error || 'Unknown'));
			}
		} catch (e) {
			alert('Error saving module');
		}
	}

	async function updateModule(slug: string, data: any) {
		try {
			const res = await fetch(`/api/admin/modules/${slug}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (json.success) {
				editModal = null;
				loadAll();
			} else {
				alert('Error: ' + (json.error || 'Unknown'));
			}
		} catch (e) {
			alert('Error updating module');
		}
	}

	async function deleteModule(slug: string) {
		if (!confirm(`Delete module "${slug}"?`)) return;
		try {
			await fetch(`/api/admin/modules/${slug}`, { method: 'DELETE' });
			loadAll();
		} catch (e) {
			alert('Error deleting module');
		}
	}

	async function deleteExercise(id: string) {
		if (!confirm('Delete this exercise?')) return;
		try {
			await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
			loadAll();
		} catch (e) {
			alert('Error deleting exercise');
		}
	}

	function openNewModule() {
		editModal = { type: 'module', data: { key: '', title: '', description: '', level: 'Beginner', techs: [], sessions: [] } };
	}
	function openEditModule(m: any) {
		editModal = { type: 'module', data: { key: m.key, title: m.title, description: m.description || '', level: m.level || m.difficulty || 'Beginner', techs: m.techs || [], sessions: m.sessions || [] } };
	}
	function openNewExercise() {
		editModal = { type: 'exercise', data: { key: '', title: '', description: '', difficulty: 'Beginner', moduleSlug: '', content: '', hasCode: false } };
	}

	async function saveExercise(data: any) {
		try {
			const res = await fetch('/api/admin/exercises', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (json.success) {
				editModal = null;
				loadAll();
			} else {
				alert('Error: ' + (json.error || 'Unknown'));
			}
		} catch (e) {
			alert('Error saving exercise');
		}
	}
</script>

<svelte:head>
	<title>📚 Content Management — Admin</title>
</svelte:head>

<div class="content-page">
	<div class="header-row">
		<h1>📚 Content Management</h1>
		<div class="tabs">
			<button class="tab" class:active={tab === 'modules'} onclick={() => tab = 'modules'}>
				Modules ({modules.length})
			</button>
			<button class="tab" class:active={tab === 'exercises'} onclick={() => tab = 'exercises'}>
				Exercises ({exercises.length})
			</button>
			<button class="tab" class:active={tab === 'flashcards'} onclick={() => tab = 'flashcards'}>
				Flashcards
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Loading content...</div>
	{:else if error}
		<div class="error-state"><p>{error}</p><button onclick={loadAll} class="btn">Retry</button></div>
	{:else}

		<!-- Modules Tab -->
		{#if tab === 'modules'}
			<div class="section-header">
				<span class="section-count">{modules.length} modules</span>
				<button onclick={openNewModule} class="btn btn-primary">+ New Module</button>
			</div>
			<div class="content-list">
				{#each modules as mod}
					<div class="content-card">
						<div class="card-header">
							<span class="card-title">{mod.title || mod.key}</span>
							<span class="card-badge {mod.level?.toLowerCase() || 'beginner'}">{mod.level || mod.difficulty || 'Beginner'}</span>
						</div>
						<p class="card-desc">{mod.description || 'No description'}</p>
						<div class="card-meta">
							<span class="card-slug">{mod.key}</span>
							<span class="card-sessions">{mod.sessions?.length || 0} sessions</span>
						</div>
						<div class="card-actions">
							<button onclick={() => openEditModule(mod)} class="btn btn-sm">✏️ Edit</button>
							<button onclick={() => deleteModule(mod.key)} class="btn btn-sm btn-danger">🗑️ Delete</button>
						</div>
					</div>
				{/each}
				{#if modules.length === 0}
					<p class="empty">No modules yet. Click "+ New Module" to create one.</p>
				{/if}
			</div>
		{/if}

		<!-- Exercises Tab -->
		{#if tab === 'exercises'}
			<div class="section-header">
				<span class="section-count">{exercises.length} exercises</span>
				<button onclick={openNewExercise} class="btn btn-primary">+ New Exercise</button>
			</div>
			<div class="content-list">
				{#each exercises as ex}
					<div class="content-card">
						<div class="card-header">
							<span class="card-title">{ex.title || ex.key}</span>
							<span class="card-badge {ex.difficulty?.toLowerCase() || 'beginner'}">{ex.difficulty || 'Beginner'}</span>
						</div>
						<p class="card-desc">{ex.description?.slice(0, 120) || 'No description'}</p>
						<div class="card-meta">
							<span class="card-slug">{ex.key}</span>
							<span class="card-sessions">Module: {ex.moduleSlug || '-'}</span>
						</div>
						<div class="card-actions">
							<button onclick={() => deleteExercise(ex.id)} class="btn btn-sm btn-danger">🗑️ Delete</button>
						</div>
					</div>
				{/each}
				{#if exercises.length === 0}
					<p class="empty">No exercises yet.</p>
				{/if}
			</div>
		{/if}

		<!-- Flashcards Tab -->
		{#if tab === 'flashcards'}
			<div class="placeholder-tab">
				<span class="placeholder-icon">🃏</span>
				<p>Flashcard management coming soon.</p>
			</div>
		{/if}
	{/if}
</div>

<!-- Edit Modal -->
{#if editModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => editModal = null} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog">
			<div class="modal-header">
				<h2>{editModal.data.key ? 'Edit' : 'New'} {editModal.type === 'module' ? 'Module' : 'Exercise'}</h2>
				<button onclick={() => editModal = null} class="modal-close">✕</button>
			</div>
			<div class="modal-body">
				{#if editModal.type === 'module'}
					{@const d = editModal.data}
					<label>
						<span>Key (slug)</span>
						<input type="text" bind:value={d.key} placeholder="my-module-slug" disabled={!!d.key} />
					</label>
					<label>
						<span>Title</span>
						<input type="text" bind:value={d.title} placeholder="Module Title" />
					</label>
					<label>
						<span>Description</span>
						<textarea bind:value={d.description} rows={3} placeholder="Module description"></textarea>
					</label>
					<label>
						<span>Level</span>
						<select bind:value={d.level}>
							<option value="Beginner">Beginner</option>
							<option value="Intermediate">Intermediate</option>
							<option value="Advanced">Advanced</option>
						</select>
					</label>
					<label>
						<span>Techs (comma separated)</span>
						<input type="text" bind:value={d.techs} placeholder="HTML, CSS, JavaScript" />
					</label>
					<div class="modal-actions">
						<button onclick={() => editModal = null} class="btn">Cancel</button>
						<button onclick={() => d.key ? updateModule(d.key, {
							title: d.title,
							description: d.description,
							level: d.level,
							techs: typeof d.techs === 'string' ? d.techs.split(',').map((t: string) => t.trim()).filter(Boolean) : d.techs,
						}) : saveModule({
							key: d.key,
							title: d.title,
							description: d.description,
							level: d.level,
							techs: typeof d.techs === 'string' ? d.techs.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
							sessions: [],
						})} class="btn btn-primary">Save</button>
					</div>
				{:else}
					{@const d = editModal.data}
					<label>
						<span>Key (slug)</span>
						<input type="text" bind:value={d.key} placeholder="my-exercise-slug" />
					</label>
					<label>
						<span>Title</span>
						<input type="text" bind:value={d.title} placeholder="Exercise Title" />
					</label>
					<label>
						<span>Description</span>
						<textarea bind:value={d.description} rows={2}></textarea>
					</label>
					<label>
						<span>Module Slug</span>
						<input type="text" bind:value={d.moduleSlug} placeholder="module-slug" />
					</label>
					<label>
						<span>Difficulty</span>
						<select bind:value={d.difficulty}>
							<option value="Beginner">Beginner</option>
							<option value="Intermediate">Intermediate</option>
							<option value="Advanced">Advanced</option>
						</select>
					</label>
					<div class="modal-actions">
						<button onclick={() => editModal = null} class="btn">Cancel</button>
						<button onclick={() => saveExercise(d)} class="btn btn-primary">Save</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.content-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	.loading, .error-state { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state p { color: var(--danger); margin-bottom: 12px; }

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		gap: 16px;
		flex-wrap: wrap;
	}

	.tabs { display: flex; gap: 4px; background: var(--bg-secondary); border-radius: 8px; padding: 3px; }
	.tab {
		padding: 7px 16px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}
	.tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
	.tab:hover:not(.active) { color: var(--text); }

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
	}
	.section-count { font-size: 13px; color: var(--text-secondary); }

	.content-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }

	.content-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
	.card-title { font-weight: 600; font-size: 14px; }
	.card-badge {
		font-size: 10px;
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.card-badge.beginner { background: #dbeafe; color: #1d4ed8; }
	.card-badge.intermediate { background: #fef3c7; color: #b45309; }
	.card-badge.advanced { background: #fce7f3; color: #be185d; }
	.card-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
	.card-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-secondary); }
	.card-slug { font-family: monospace; }
	.card-actions { display: flex; gap: 6px; margin-top: 4px; }

	.empty { color: var(--text-secondary); font-size: 13px; padding: 40px; text-align: center; }

	.placeholder-tab { text-align: center; padding: 60px; color: var(--text-secondary); }
	.placeholder-icon { font-size: 48px; display: block; margin-bottom: 12px; }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.5);
		display: flex; align-items: center; justify-content: center;
		z-index: 1000; padding: 20px;
	}
	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		width: 100%;
		max-width: 480px;
		max-height: 90vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px 0;
	}
	.modal-header h2 { font-size: 18px; font-weight: 600; }
	.modal-close {
		background: none; border: none; font-size: 18px;
		cursor: pointer; color: var(--text-secondary); padding: 4px;
	}
	.modal-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 12px; }
	.modal-body label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 500; color: var(--text); }
	.modal-body input, .modal-body select, .modal-body textarea {
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
	}
	.modal-body textarea { font-family: inherit; resize: vertical; }
	.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

	.btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--bg-secondary);
		color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
	}
	.btn-sm { padding: 5px 10px; font-size: 12px; }
	.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn-danger { background: var(--danger); color: #fff; border-color: var(--danger); }
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.content-list { grid-template-columns: 1fr; }
	}
</style>
