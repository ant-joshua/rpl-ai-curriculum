<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let templates = $state<any[]>([]);
	let categoryFilter = $state('');
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let saving = $state(false);

	let formName = $state('');
	let formCategory = $state('general');
	let formSubject = $state('');
	let formBody = $state('');
	let formChannelType = $state('in_app');
	let previewMode = $state(false);

	const categories = ['general', 'academic', 'payment', 'announcement', 'reminder', 'system'];

	onMount(() => {
		if (browser) loadTemplates();
	});

	async function loadTemplates() {
		loading = true;
		error = '';
		try {
			const params = categoryFilter ? `?category=${categoryFilter}` : '';
			const res = await fetch('/api/admin/notifications/templates' + params);
			const json = await res.json();
			if (json.success) {
				templates = json.data || [];
			} else {
				error = 'Gagal memuat template';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		formName = '';
		formCategory = 'general';
		formSubject = '';
		formBody = '';
		formChannelType = 'in_app';
		editingId = null;
		previewMode = false;
	}

	function openCreate() {
		resetForm();
		showForm = true;
	}

	function openEdit(t: any) {
		editingId = t.id;
		formName = t.name;
		formCategory = t.category || 'general';
		formSubject = t.subject || '';
		formBody = t.body;
		formChannelType = t.channel_type || 'in_app';
		showForm = true;
	}

	function cancelForm() {
		showForm = false;
		resetForm();
	}

	async function saveTemplate() {
		if (!formName || !formBody) return;
		saving = true;
		try {
			const payload = {
				name: formName,
				category: formCategory,
				subject: formSubject || undefined,
				body: formBody,
				channelType: formChannelType,
			};
			const url = editingId
				? `/api/admin/notifications/templates/${editingId}`
				: '/api/admin/notifications/templates';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				showForm = false;
				resetForm();
				await loadTemplates();
			} else {
				error = json.error || 'Gagal menyimpan template';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			saving = false;
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
		} catch { return d; }
	}

	function categoryBadge(cat: string): string {
		switch (cat) {
			case 'academic': return 'cat-academic';
			case 'payment': return 'cat-payment';
			case 'announcement': return 'cat-announcement';
			case 'reminder': return 'cat-reminder';
			case 'system': return 'cat-system';
			default: return 'cat-general';
		}
	}
</script>

<svelte:head>
	<title>Notification Templates — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Notification Templates</h1>
			<p class="subtitle">Kelola template notifikasi per kategori</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadTemplates}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Template</button>
		</div>
	</div>

	<!-- Category filter -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={categoryFilter === ''} onclick={() => { categoryFilter = ''; loadTemplates(); }}>
			All
		</button>
		{#each categories as cat}
			<button class="filter-btn" class:active={categoryFilter === cat} onclick={() => { categoryFilter = cat; loadTemplates(); }}>
				{cat}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadTemplates}>Coba Lagi</button>
		</div>
	{/if}

	<!-- Template Form Modal -->
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
						<label class="form-label">Nama</label>
						<input class="form-input" bind:value={formName} placeholder="e.g. Welcome Email" />
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">Kategori</label>
							<select class="form-input" bind:value={formCategory}>
								{#each categories as cat}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="form-label">Channel Type</label>
							<select class="form-input" bind:value={formChannelType}>
								<option value="in_app">In-App</option>
								<option value="email">Email</option>
								<option value="sms">SMS</option>
								<option value="push">Push</option>
							</select>
						</div>
					</div>
					<div class="form-row">
						<label class="form-label">Subject (opsional)</label>
						<input class="form-input" bind:value={formSubject} placeholder="Email subject line" />
					</div>
					<div class="form-row">
						<div class="form-label-row">
							<label class="form-label">Body</label>
							<button class="btn-text" onclick={() => previewMode = !previewMode}>
								{previewMode ? 'Edit' : 'Preview'}
							</button>
						</div>
						{#if previewMode}
							<div class="preview-box">{formBody || '(kosong)'}</div>
						{:else}
							<textarea class="form-textarea" bind:value={formBody} rows="6" placeholder="Notification body content..."></textarea>
						{/if}
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={cancelForm}>Batal</button>
					<button class="btn-primary" onclick={saveTemplate} disabled={saving || !formName || !formBody}>
						{saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat Template'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Templates List -->
	{#if loading}
		<div class="loading">Memuat template...</div>
	{:else if templates.length === 0}
		<div class="empty-state">
			<p>Belum ada template notifikasi</p>
			<button class="btn-primary" onclick={openCreate}>Buat Template Pertama</button>
		</div>
	{:else}
		<div class="templates-grid">
			{#each templates as t}
				<div class="template-card">
					<div class="template-card-header">
						<h4 class="template-name">{t.name}</h4>
						<span class="category-badge {categoryBadge(t.category)}">{t.category || 'general'}</span>
					</div>
					{#if t.subject}
						<p class="template-subject">Subject: {t.subject}</p>
					{/if}
					<div class="template-body-preview">
						{t.body?.length > 120 ? t.body.slice(0, 120) + '...' : t.body}
					</div>
					<div class="template-meta">
						<span class="channel-type-badge">{t.channel_type || 'in_app'}</span>
						<span class="template-date">{formatDate(t.created_at)}</span>
					</div>
					<div class="template-actions">
						<button class="btn-text" onclick={() => openEdit(t)}>Edit</button>
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
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-text { background: none; border: none; color: var(--accent); font-size: 12px; cursor: pointer; padding: 0; }
	.btn-text:hover { text-decoration: underline; }

	/* Filter bar */
	.filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-btn {
		padding: 6px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200;
		display: flex; align-items: center; justify-content: center;
		backdrop-filter: blur(4px);
	}
	.modal {
		background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
		width: 560px; max-width: 95vw; max-height: 85vh; overflow-y: auto;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 18px 20px; border-bottom: 1px solid var(--border);
	}
	.modal-header h3 { margin: 0; font-size: 16px; }
	.btn-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
	.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }

	.form-row { display: flex; flex-direction: column; gap: 6px; }
	.form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
	.form-label-row { display: flex; justify-content: space-between; align-items: center; }
	.form-input, .form-textarea {
		width: 100%; padding: 10px 12px; font-size: 13px;
		background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px;
		color: var(--text); outline: none; font-family: inherit;
	}
	.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
	textarea.form-textarea { resize: vertical; }
	.preview-box {
		padding: 14px; background: var(--bg-secondary); border: 1px solid var(--border);
		border-radius: 8px; font-size: 13px; color: var(--text); white-space: pre-wrap;
		min-height: 100px;
	}

	/* Templates Grid */
	.templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
	.template-card {
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
		padding: 18px; display: flex; flex-direction: column; gap: 10px;
		transition: border-color 0.15s;
	}
	.template-card:hover { border-color: var(--accent); }
	.template-card-header { display: flex; justify-content: space-between; align-items: center; }
	.template-name { margin: 0; font-size: 14px; font-weight: 600; }
	.template-subject { margin: 0; font-size: 12px; color: var(--text-secondary); }
	.template-body-preview {
		font-size: 13px; color: var(--text-secondary); line-height: 1.5;
		background: var(--bg-secondary); padding: 12px; border-radius: 8px;
		max-height: 80px; overflow: hidden;
	}
	.template-meta { display: flex; justify-content: space-between; align-items: center; }
	.template-date { font-size: 11px; color: var(--text-secondary); }
	.template-actions { display: flex; justify-content: flex-end; gap: 8px; }

	.category-badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
	}
	.cat-general { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.cat-academic { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.cat-payment { background: rgba(16,185,129,0.1); color: #10b981; }
	.cat-announcement { background: rgba(245,158,11,0.1); color: #f59e0b; }
	.cat-reminder { background: rgba(139,92,246,0.1); color: #8b5cf6; }
	.cat-system { background: rgba(239,68,68,0.1); color: #ef4444; }

	.channel-type-badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 10px; font-weight: 600; text-transform: uppercase;
		background: rgba(59,130,246,0.1); color: #3b82f6;
	}

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; margin-bottom: 16px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; font-size: 13px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
</style>
