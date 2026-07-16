<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, Badge, Modal, Input, Textarea, Select, EmptyState, Alert, Loading } from '$lib/components/ui/index.js';

	interface Template {
		id: string;
		name: string;
		description: string | null;
		education_level: string | null;
		html_template: string;
		css_style: string | null;
		is_default: number;
		created_at: string;
		updated_at: string;
	}

	let templates = $state<Template[]>([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');

	// Create / Edit state
	let showModal = $state(false);
	let editingId = $state<string | null>(null);
	let formName = $state('');
	let formDescription = $state('');
	let formEducationLevel = $state('');
	let formHtmlTemplate = $state('');
	let formCssStyle = $state('');
	let formIsDefault = $state(false);
	let submitting = $state(false);

	// Delete state
	let deletingId = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;
		loadTemplates();
	});

	async function loadTemplates() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/report-cards/templates');
			const json = await res.json();
			if (json.success) templates = json.data || [];
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load templates'; }
		finally { loading = false; }
	}

	const educationLevelOptions = [
		{ value: '', label: 'All Levels' },
		{ value: 'sd', label: 'SD (Elementary)' },
		{ value: 'smp', label: 'SMP (Middle)' },
		{ value: 'sma', label: 'SMA (High)' },
		{ value: 'smk', label: 'SMK (Vocational)' },
	];

	function openCreate() {
		editingId = null;
		formName = '';
		formDescription = '';
		formEducationLevel = '';
		formHtmlTemplate = '<html>\n<body>\n  <h1>Report Card</h1>\n  <p>Student: {{student_name}}</p>\n</body>\n</html>';
		formCssStyle = '';
		formIsDefault = false;
		error = '';
		success = '';
		showModal = true;
	}

	async function openEdit(template: Template) {
		editingId = template.id;
		formName = template.name;
		formDescription = template.description || '';
		formEducationLevel = template.education_level || '';
		formHtmlTemplate = template.html_template;
		formCssStyle = template.css_style || '';
		formIsDefault = template.is_default === 1;
		error = '';
		success = '';
		showModal = true;
	}

	async function saveTemplate() {
		if (!formName.trim() || !formHtmlTemplate.trim()) {
			error = 'Name and HTML Template are required';
			return;
		}
		submitting = true;
		error = '';
		success = '';
		try {
			const isUpdate = !!editingId;
			const url = isUpdate ? `/api/admin/report-cards/templates` : '/api/admin/report-cards/templates';
			const res = await fetch(url, {
				method: isUpdate ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName.trim(),
					description: formDescription.trim() || undefined,
					education_level: formEducationLevel || undefined,
					html_template: formHtmlTemplate,
					css_style: formCssStyle.trim() || undefined,
					is_default: formIsDefault,
				}),
			});
			const json = await res.json();
			if (json.success) {
				success = isUpdate ? 'Template updated' : 'Template created';
				showModal = false;
				await loadTemplates();
			} else {
				error = json.error || 'Failed to save';
			}
		} catch {
			error = 'Failed to connect to server';
		}
		submitting = false;
	}

	function confirmDelete(id: string) {
		deletingId = id;
	}

	async function doDelete() {
		if (!deletingId) return;
		try {
			const res = await fetch(`/api/admin/report-cards/templates`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: deletingId }),
			});
			const json = await res.json();
			if (json.success) {
				templates = templates.filter(t => t.id !== deletingId);
				success = 'Template deleted';
			} else {
				error = json.error || 'Failed to delete';
			}
		} catch {
			error = 'Failed to connect';
		}
		deletingId = null;
	}

	function cancelDelete() { deletingId = null; }

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric'
			});
		} catch { return d; }
	}
</script>

<svelte:head>
	<title>Report Card Templates — Admin</title>
</svelte:head>

<div class="templates-page">
	<div class="page-header">
		<div>
			<h1>📝 Report Card Templates</h1>
			<p class="page-desc">Design HTML templates for student report cards</p>
		</div>
		<Button onclick={openCreate}>➕ Create Template</Button>
	</div>

	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}
	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	{#if loading}
		<Loading message="Loading templates..." />
	{:else if templates.length === 0}
		<EmptyState icon="📝" title="No Templates" description="Create your first report card template." />
	{:else}
		<div class="template-list">
			{#each templates as tpl (tpl.id)}
				<div class="template-card">
					<div class="template-header">
						<div class="template-info">
							<div class="template-title-row">
								<h3>{tpl.name}</h3>
								{#if tpl.is_default === 1}<Badge variant="primary">Default</Badge>{/if}
								{#if tpl.education_level}<Badge variant="outline">{tpl.education_level.toUpperCase()}</Badge>{/if}
							</div>
							<p class="template-desc">{tpl.description || 'No description'}</p>
							<div class="template-meta">
								<span>Updated: {formatDate(tpl.updated_at)}</span>
							</div>
						</div>
						<div class="template-actions">
							<Button size="sm" variant="ghost" onclick={() => openEdit(tpl)}>✏️ Edit</Button>
							<Button size="sm" variant="ghost" onclick={() => confirmDelete(tpl.id)}>🗑️</Button>
						</div>
					</div>
					<div class="template-preview">
						<pre class="template-code-preview"><code>{tpl.html_template.slice(0, 300)}{tpl.html_template.length > 300 ? '...' : ''}</code></pre>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<Modal open={showModal} title={editingId ? 'Edit Template' : 'Create Template'} onclose={() => showModal = false}>
		<Input label="Name" bind:value={formName} placeholder="e.g. Standard K13 Report" />
		<Input label="Description" bind:value={formDescription} placeholder="Optional description" />
		<Select label="Education Level" options={educationLevelOptions} bind:value={formEducationLevel} />

		<div class="field-group">
			<label class="field-label" for="html-template">HTML Template</label>
			<textarea
				class="html-editor"
				bind:value={formHtmlTemplate}
				rows={12}
				placeholder="<html>...</html>"
				spellcheck="false"
				id="html-template"
			></textarea>
			<p class="field-hint">Use {'{{'}variable}} placeholders: {'{{'}student_name}}, {'{{'}class_name}}, {'{{'}academic_year}}, {'{{'}semester}}, etc.</p>
		</div>

		<Textarea label="CSS Style (optional)" bind:value={formCssStyle} placeholder={'body { font-family: ... }'} rows={4} />

		<label class="checkbox-field">
			<input type="checkbox" bind:checked={formIsDefault} />
			<span>Set as default template</span>
		</label>

		{#snippet footer()}
			<Button variant="secondary" onclick={() => showModal = false} disabled={submitting}>Cancel</Button>
			<Button onclick={saveTemplate} disabled={submitting}>
				{submitting ? 'Saving...' : editingId ? '💾 Update' : '💾 Create'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<!-- Delete Confirmation -->
{#if deletingId}
	<Modal open={!!deletingId} title="Delete Template?" onclose={cancelDelete}>
		<p>This action cannot be undone.</p>
		{#snippet footer()}
			<Button variant="secondary" onclick={cancelDelete}>Cancel</Button>
			<Button variant="danger" onclick={doDelete}>🗑️ Delete</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.templates-page { max-width: 900px; }

	h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.template-list { display: flex; flex-direction: column; gap: 12px; }
	.template-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.template-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}
	.template-info { flex: 1; }
	.template-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 4px;
	}
	.template-title-row h3 { margin: 0; font-size: 16px; font-weight: 600; }
	.template-desc { margin: 4px 0; font-size: 13px; color: var(--text-secondary); }
	.template-meta { font-size: 12px; color: var(--text-secondary); }
	.template-actions { display: flex; gap: 4px; flex-shrink: 0; }

	.template-preview {
		margin-top: 12px;
	}
	.template-code-preview {
		background: rgba(0,0,0,0.2);
		border: 1px solid rgba(255,255,255,0.05);
		border-radius: 6px;
		padding: 12px;
		font-size: 12px;
		line-height: 1.5;
		overflow-x: auto;
		color: #8a8f98;
		font-family: 'SF Mono', 'Fira Code', monospace;
		max-height: 120px;
		overflow-y: auto;
	}
	.template-code-preview code { white-space: pre-wrap; }

	.html-editor {
		width: 100%;
		padding: 0.75rem;
		font-size: 13px;
		line-height: 1.5;
		color: #f7f8f8;
		background: rgba(0,0,0,0.4);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 6px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		resize: vertical;
		box-sizing: border-box;
	}
	.html-editor:focus {
		outline: none;
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}
	.field-group { display: flex; flex-direction: column; gap: 6px; }
	.field-label {
		font-size: 12px;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}
	.field-hint { font-size: 11px; color: #62666d; margin: 0; }

	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		cursor: pointer;
	}
	.checkbox-field input { accent-color: #5e6ad2; }
</style>
