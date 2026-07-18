<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let instances = $state<any[]>([]);
	let templates = $state<any[]>([]);
	let statusFilter = $state('');

	let showForm = $state(false);
	let saving = $state(false);
	let formTemplateId = $state('');
	let formTitle = $state('');
	let formTargetType = $state('');
	let formTargetId = $state('');
	let formStartDate = $state('');
	let formEndDate = $state('');

	const statuses = ['draft', 'active', 'closed', 'archived'];
	const targetTypes = ['', 'course', 'class', 'department', 'all'];

	onMount(() => {
		if (browser) loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [instRes, tmplRes] = await Promise.all([
				fetch('/api/admin/survey/instances' + (statusFilter ? `?status=${statusFilter}` : '')),
				fetch('/api/admin/survey/templates'),
			]);
			const instJson = await instRes.json();
			const tmplJson = await tmplRes.json();
			if (instJson.success) instances = instJson.data || [];
			if (tmplJson.success) templates = tmplJson.data || [];
			if (!instJson.success) error = 'Gagal memuat instance';
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		formTemplateId = '';
		formTitle = '';
		formTargetType = '';
		formTargetId = '';
		formStartDate = '';
		formEndDate = '';
	}

	function openCreate() {
		resetForm();
		showForm = true;
	}

	function cancelForm() {
		showForm = false;
	}

	async function saveInstance() {
		if (!formTitle || !formTemplateId) return;
		saving = true;
		try {
			const payload: any = {
				templateId: formTemplateId,
				title: formTitle,
			};
			if (formTargetType) payload.targetType = formTargetType;
			if (formTargetId) payload.targetId = formTargetId;
			if (formStartDate) payload.startDate = new Date(formStartDate).toISOString();
			if (formEndDate) payload.endDate = new Date(formEndDate).toISOString();

			const res = await fetch('/api/admin/survey/instances', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				showForm = false;
				resetForm();
				await loadAll();
			} else {
				error = json.error || 'Gagal membuat survei';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			saving = false;
		}
	}

	async function updateStatus(id: string, status: string) {
		try {
			const res = await fetch(`/api/admin/survey/instances/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			const json = await res.json();
			if (json.success) {
				await loadAll();
			} else {
				error = json.error || 'Gagal update status';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
	}

	function statusColor(s: string): string {
		switch (s) {
			case 'active': return 'status-active';
			case 'closed': return 'status-closed';
			case 'draft': return 'status-draft';
			case 'archived': return 'status-archived';
			default: return 'status-draft';
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
		} catch { return d; }
	}

	function templateName(id: string): string {
		return templates.find((t: any) => t.id === id)?.name || id.slice(0, 8) + '...';
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Survey Instances</h1>
			<p class="subtitle">Kelola instance survei dan status</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadAll}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Survei Baru</button>
		</div>
	</div>

	<!-- Status filter -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={statusFilter === ''} onclick={() => { statusFilter = ''; loadAll(); }}>
			All
		</button>
		{#each statuses as s}
			<button class="filter-btn" class:active={statusFilter === s} onclick={() => { statusFilter = s; loadAll(); }}>
				{s}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadAll}>{t('common.retry')}</button>
		</div>
	{/if}

	<!-- Create Modal -->
	{#if showForm}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={cancelForm}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Buat Survei Baru</h3>
					<button class="btn-close" onclick={cancelForm}>✕</button>
				</div>
				<div class="modal-body">
					<div class="form-row">
						<label class="form-label">Template</label>
						<select class="form-input" bind:value={formTemplateId}>
							<option value="">Pilih template...</option>
							{#each templates as t}
								<option value={t.id}>{t.name} ({t.survey_type})</option>
							{/each}
						</select>
					</div>
					<div class="form-row">
						<label class="form-label">Judul Survei</label>
						<input class="form-input" bind:value={formTitle} placeholder="e.g. Course Feedback Q1 2026" />
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">Target Type</label>
							<select class="form-input" bind:value={formTargetType}>
								<option value="">—</option>
								{#each targetTypes.slice(1) as tt}
									<option value={tt}>{tt}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="form-label">Target ID (opsional)</label>
							<input class="form-input" bind:value={formTargetId} placeholder="course/class id" />
						</div>
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">Mulai</label>
							<input class="form-input" type="date" bind:value={formStartDate} />
						</div>
						<div>
							<label class="form-label">{t('admin.selesai')}</label>
							<input class="form-input" type="date" bind:value={formEndDate} />
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={cancelForm}>{t('common.cancel')}</button>
					<button class="btn-primary" onclick={saveInstance} disabled={saving || !formTitle || !formTemplateId}>
						{saving ? 'Menyimpan...' : 'Buat Survei'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Instances List -->
	{#if loading}
		<div class="loading">Memuat instance...</div>
	{:else if instances.length === 0}
		<div class="empty-state">
			<p>Belum ada instance survei</p>
			<button class="btn-primary" onclick={openCreate}>Buat Survei Pertama</button>
		</div>
	{:else}
		<div class="instances-list">
			{#each instances as inst}
				<div class="instance-card">
					<div class="instance-main">
						<div class="instance-info">
							<h4 class="i-title">{inst.title}</h4>
							<div class="i-meta">
								<span class="status-badge {statusColor(inst.status)}">{inst.status}</span>
								<span class="i-template">Template: {templateName(inst.template_id)}</span>
								{#if inst.target_type}
									<span class="i-target">🎯 {inst.target_type}{inst.target_id ? `:${inst.target_id.slice(0,12)}` : ''}</span>
								{/if}
							</div>
						</div>
						<div class="instance-dates">
							{#if inst.start_date}
								<span class="i-date">Mulai: {formatDate(inst.start_date)}</span>
							{/if}
							{#if inst.end_date}
								<span class="i-date">Selesai: {formatDate(inst.end_date)}</span>
							{/if}
							<span class="i-date">Dibuat: {formatDate(inst.created_at)}</span>
						</div>
					</div>
					<div class="instance-actions">
						{#if inst.status === 'draft'}
							<button class="btn-small btn-primary-small" onclick={() => updateStatus(inst.id, 'active')}>Aktifkan</button>
						{/if}
						{#if inst.status === 'active'}
							<button class="btn-small" onclick={() => updateStatus(inst.id, 'closed')}>{t('common.close')}</button>
							<a href={`/api/admin/survey/instances/${inst.id}/analytics`} target="_blank" class="btn-small">Analytics</a>
						{/if}
						{#if inst.status === 'closed'}
							<button class="btn-small" onclick={() => updateStatus(inst.id, 'archived')}>Arsipkan</button>
						{/if}
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
	.btn-primary-small { padding: 4px 10px; background: var(--accent); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-small { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 11px; cursor: pointer; text-decoration: none; display: inline-block; }
	.btn-small:hover { background: var(--surface-hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

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
		width: 540px; max-width: 95vw; max-height: 85vh; overflow-y: auto;
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
	.form-input { width: 100%; padding: 10px 12px; font-size: 13px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text); outline: none; font-family: inherit; box-sizing: border-box; }
	.form-input:focus { border-color: var(--accent); }

	/* Instance Cards */
	.instances-list { display: flex; flex-direction: column; gap: 12px; }
	.instance-card {
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
		padding: 16px 18px; transition: border-color 0.15s;
	}
	.instance-card:hover { border-color: var(--accent-dim); }
	.instance-main { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
	.instance-info { flex: 1; min-width: 200px; }
	.i-title { margin: 0 0 6px; font-size: 15px; font-weight: 600; }
	.i-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
	.i-template { font-size: 12px; color: var(--text-secondary); }
	.i-target { font-size: 12px; color: var(--text-secondary); }
	.instance-dates { display: flex; flex-direction: column; gap: 2px; text-align: right; }
	.i-date { font-size: 11px; color: var(--text-secondary); }
	.instance-actions { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: capitalize;
	}
	.status-active { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-closed { background: rgba(245,158,11,0.1); color: #f59e0b; }
	.status-draft { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.status-archived { background: rgba(239,68,68,0.1); color: #ef4444; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; margin-bottom: 16px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; font-size: 13px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
</style>
