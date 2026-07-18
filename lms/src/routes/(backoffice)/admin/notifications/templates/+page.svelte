<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let templates = $state<any[]>([]);
	let typeFilter = $state('');
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let saving = $state(false);

	let formCode = $state('');
	let formType = $state('system');
	let formChannels = $state('in_app');
	let formSubject = $state('');
	let formBody = $state('');
	let formVariables = $state('');
	let previewMode = $state(false);

	const types = ['assessment','assignment','attendance','payment','grade','system','announcement'];
	const channelOpts = ['in_app', 'email', 'whatsapp', 'in_app,email', 'in_app,whatsapp', 'in_app,email,whatsapp'];

	onMount(() => {
		if (browser) loadTemplates();
	});

	async function loadTemplates() {
		loading = true; error = '';
		try {
			const params = typeFilter ? `?type=${typeFilter}` : '';
			const res = await fetch('/api/admin/notifications/templates' + params);
			const json = await res.json();
			if (json.success) templates = json.data || [];
			else error = 'Gagal memuat template';
		} catch { error = 'Gagal terhubung ke server';
		} finally { loading = false; }
	}

	function resetForm() {
		formCode = ''; formType = 'system'; formChannels = 'in_app';
		formSubject = ''; formBody = ''; formVariables = '';
		editingId = null; previewMode = false;
	}

	function openCreate() { resetForm(); showForm = true; }

	function openEdit(t: any) {
		editingId = t.id; formCode = t.code; formType = t.type;
		formChannels = t.channels || 'in_app'; formSubject = t.subject || '';
		formBody = t.body_template; formVariables = t.variables || '';
		showForm = true;
	}

	function cancelForm() { showForm = false; resetForm(); }

	async function saveTemplate() {
		if (!formCode || !formBody) return;
		saving = true;
		try {
			const payload: Record<string, any> = {
				code: formCode, type: formType, channels: formChannels,
				subject: formSubject || undefined, body_template: formBody,
			};
			if (formVariables) payload.variables = formVariables;

			const url = editingId
				? `/api/admin/notifications/templates/${editingId}`
				: '/api/admin/notifications/templates';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method, headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) { showForm = false; resetForm(); await loadTemplates(); }
			else error = json.error || 'Gagal menyimpan template';
		} catch { error = 'Gagal terhubung ke server';
		} finally { saving = false; }
	}

	async function deleteTemplate(t: any) {
		if (!confirm(`Hapus template "${t.code}"?`)) return;
		try {
			const res = await fetch(`/api/admin/notifications/templates/${t.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) await loadTemplates();
			else error = json.error || 'Gagal menghapus template';
		} catch { error = 'Gagal terhubung ke server'; }
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try { return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); } catch { return d; }
	}

	function typeBadge(t: string): string {
		const map: Record<string,string> = { assessment:'cat-academic', assignment:'cat-academic', attendance:'cat-attendance', payment:'cat-payment', grade:'cat-grade', system:'cat-system', announcement:'cat-announcement' };
		return map[t] || 'cat-general';
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Template Notifikasi</h1>
			<p class="subtitle">Kelola template pesan notifikasi per tipe</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadTemplates}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Template</button>
		</div>
	</div>

	<!-- Type filter -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={typeFilter === ''} onclick={() => { typeFilter = ''; loadTemplates(); }}>{t('common.all')}</button>
		{#each types as t}
			<button class="filter-btn" class:active={typeFilter === t} onclick={() => { typeFilter = t; loadTemplates(); }}>{t}</button>
		{/each}
	</div>

	{#if error}
		<div class="error-state"><p class="error-msg">{error}</p><button class="btn-primary" onclick={loadTemplates}>{t('common.retry')}</button></div>
	{/if}

	<!-- Form Modal -->
	{#if showForm}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={cancelForm}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>{editingId ? 'Edit Template' : 'Buat Template Baru'}</h3>
					<button class="btn-close" onclick={cancelForm}>✕</button>
				</div>
				<div class="modal-body">
					<div class="form-row">
						<label class="form-label">Kode *</label>
						<input class="form-input" bind:value={formCode} placeholder="contoh: welcome_email" />
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">{t('admin.tipe')}</label>
							<select class="form-input" bind:value={formType}>
								{#each types as t}<option value={t}>{t}</option>{/each}
							</select>
						</div>
						<div>
							<label class="form-label">{t('admin.channel')}</label>
							<select class="form-input" bind:value={formChannels}>
								{#each channelOpts as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
					</div>
					<div class="form-row">
						<label class="form-label">Subjek (untuk email)</label>
						<input class="form-input" bind:value={formSubject} placeholder="Subject email" />
					</div>
					<div class="form-row">
						<div class="form-label-row">
							<label class="form-label">Body Template *</label>
							<button class="btn-text" onclick={() => previewMode = !previewMode}>{previewMode ? 'Edit' : 'Preview'}</button>
						</div>
						{#if previewMode}
							<div class="preview-box">{formBody || '(kosong)'}</div>
						{:else}
							<textarea class="form-textarea" bind:value={formBody} rows="6" placeholder="Gunakan {'{{variable}}'} untuk placeholder"></textarea>
						{/if}
					</div>
					<div class="form-row">
						<label class="form-label">Variabel (JSON array)</label>
						<input class="form-input" bind:value={formVariables} placeholder='["nama","kelas"]' />
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={cancelForm}>{t('common.cancel')}</button>
					<button class="btn-primary" onclick={saveTemplate} disabled={saving || !formCode || !formBody}>
						{saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Templates List -->
	{#if loading}
		<div class="loading">Memuat template...</div>
	{:else if templates.length === 0}
		<div class="empty-state"><p>Belum ada template notifikasi</p><button class="btn-primary" onclick={openCreate}>Buat Template Pertama</button></div>
	{:else}
		<div class="templates-grid">
			{#each templates as t}
				<div class="template-card">
					<div class="template-card-header">
						<h4 class="template-name">{t.code}</h4>
						<span class="type-badge {typeBadge(t.type)}">{t.type}</span>
					</div>
					{#if t.subject}
						<p class="template-subject">Subject: {t.subject}</p>
					{/if}
					<div class="template-body-preview">{t.body_template?.length > 120 ? t.body_template.slice(0, 120) + '...' : t.body_template}</div>
					<div class="template-meta">
						<span class="channel-badge">{t.channels}</span>
						<span>{formatDate(t.created_at)}</span>
					</div>
					<div class="template-actions">
						<button class="btn-text" onclick={() => openEdit(t)}>{t('common.edit')}</button>
						<button class="btn-text btn-text-danger" onclick={() => deleteTemplate(t)}>{t('common.delete')}</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-text { background: none; border: none; color: var(--accent); font-size: 12px; cursor: pointer; padding: 0; }
	.btn-text:hover { text-decoration: underline; }
	.btn-text-danger { color: #ef4444; }
	.btn-text-danger:hover { color: #dc2626; }

	.filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-transform: capitalize; }
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 560px; max-width: 95vw; max-height: 85vh; overflow-y: auto; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
	.modal-header h3 { margin: 0; font-size: 16px; }
	.btn-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
	.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
	.form-row { display: flex; flex-direction: column; gap: 6px; }
	.form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
	.form-label-row { display: flex; justify-content: space-between; align-items: center; }
	.form-input, .form-textarea { width: 100%; padding: 10px 12px; font-size: 13px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text); outline: none; font-family: inherit; }
	.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
	textarea.form-textarea { resize: vertical; }
	.preview-box { padding: 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; color: var(--text); white-space: pre-wrap; min-height: 100px; }

	/* Grid */
	.templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
	.template-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s; }
	.template-card:hover { border-color: var(--accent); }
	.template-card-header { display: flex; justify-content: space-between; align-items: center; }
	.template-name { margin: 0; font-size: 14px; font-weight: 600; font-family: monospace; }
	.template-subject { margin: 0; font-size: 12px; color: var(--text-secondary); }
	.template-body-preview { font-size: 13px; color: var(--text-secondary); line-height: 1.5; background: var(--bg-secondary); padding: 12px; border-radius: 8px; max-height: 80px; overflow: hidden; }
	.template-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary); }
	.template-actions { display: flex; justify-content: flex-end; gap: 12px; }

	.type-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
	.cat-general { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.cat-academic { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.cat-attendance { background: rgba(139,92,246,0.1); color: #8b5cf6; }
	.cat-payment { background: rgba(16,185,129,0.1); color: #10b981; }
	.cat-grade { background: rgba(245,158,11,0.1); color: #f59e0b; }
	.cat-announcement { background: rgba(239,68,68,0.1); color: #ef4444; }
	.cat-system { background: rgba(98,102,109,0.15); color: #8a8f98; }

	.channel-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; background: rgba(59,130,246,0.1); color: #3b82f6; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; margin-bottom: 16px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; font-size: 13px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
</style>
