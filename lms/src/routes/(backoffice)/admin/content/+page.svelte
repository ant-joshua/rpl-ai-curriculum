<script lang="ts">
	import { browser } from '$app/environment';

	interface Session {
		id: string;
		title: string;
	}

	interface Module {
		index: number;
		slug: string;
		dirName: string;
		title: string;
		description: string;
		level: string;
		sessions: Session[];
	}

	interface ContentBlock {
		id: string;
		type: string;
		title: string;
		body: string | null;
		body_html: string | null;
		meta: string;
		order_index: number;
		visibility: string;
		created_at: string;
		updated_at: string;
		lesson_id: string | null;
		lesson_offering_id: string | null;
		lesson_title: string | null;
		lesson_slug: string | null;
		lesson_status: string | null;
		lesson_order: number | null;
	}

	interface Lesson {
		id: string;
		title: string;
		slug: string;
		course_offering_id: string;
		content_block_id: string | null;
		order_index: number;
		status: string;
		offering_name: string | null;
	}

	interface Offering {
		id: string;
		name: string;
		code: string;
		course_id: string;
	}

	import {
		SearchInput, Select, Button, Badge, SearchBar, PageHeader, StatCard,
		Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
		Modal, Input, Alert
	} from '$lib/components/ui';

	let { data }: {
		data: {
			modules: Module[];
			contentBlocks: ContentBlock[];
			lessons: Lesson[];
			offerings: Offering[];
		}
	} = $props();

	const visibilityOptions = [
		{ value: 'all', label: 'All visibility' },
		{ value: 'published', label: 'Published' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Archived' },
	];

	let moduleOptions = $derived([
		{ value: 'all', label: 'All modules' },
		...data.modules.map(m => ({ value: m.slug, label: m.title }))
	]);

	let searchQuery = $state('');
	let visibilityFilter = $state<string>('all');
	let selectedModule = $state<string>('all');

	// Linking modal
	let showLinkModal = $state(false);
	let linkingBlockId = $state('');
	let linkOfferingId = $state('');
	let linkLessonId = $state('');
	let linkSubmitting = $state(false);
	let linkError = $state('');
	let linkSuccess = $state('');

	// Edit metadata modal
	let showEditModal = $state(false);
	let editingBlock = $state<ContentBlock | null>(null);
	let editTitle = $state('');
	let editType = $state('text');
	let editVisibility = $state('draft');
	let editSubmitting = $state(false);
	let editError = $state('');
	let editSuccess = $state('');

	let filteredBlocks = $derived(
		data.contentBlocks.filter(cb => {
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				if (!cb.title.toLowerCase().includes(q) && !cb.id.toLowerCase().includes(q)) return false;
			}
			if (visibilityFilter !== 'all' && cb.visibility !== visibilityFilter) return false;
			if (selectedModule !== 'all') {
				const mod = data.modules.find(m => m.slug === selectedModule);
				if (mod) {
					const sessionIds = mod.sessions.map(s => s.id);
					const matched = sessionIds.some(sid => cb.id.includes(sid));
					if (!matched) return false;
				}
			}
			return true;
		})
	);

	let unlinkedBlocks = $derived(
		filteredBlocks.filter(cb => !cb.lesson_id)
	);

	let linkedBlocks = $derived(
		filteredBlocks.filter(cb => cb.lesson_id)
	);

	let lessonsByOffering = $derived(
		linkOfferingId
			? data.lessons.filter(l => l.course_offering_id === linkOfferingId)
			: []
	);

	function getModuleForSession(sessionId: string): Module | undefined {
		return data.modules.find(m => m.sessions.some(s => s.id === sessionId));
	}

	function getModuleForBlock(cb: ContentBlock): Module | undefined {
		// Match by content_block id prefix pattern: cb-<sessionId>
		const sessionId = cb.id.replace(/^cb-/, '');
		return getModuleForSession(sessionId);
	}

	function getTypeIcon(t: string): string {
		const icons: Record<string, string> = {
			text: '📝',
			video: '🎬',
			code: '💻',
			embed: '🔗',
			quiz: '❓',
		};
		return icons[t] || '📄';
	}

	// Linking
	function openLinkModal(cb: ContentBlock) {
		linkingBlockId = cb.id;
		linkOfferingId = '';
		linkLessonId = '';
		linkError = '';
		linkSuccess = '';
		showLinkModal = true;
	}

	async function doLink() {
		if (!linkLessonId) {
			linkError = 'Pilih lesson';
			return;
		}
		linkSubmitting = true;
		linkError = '';
		linkSuccess = '';
		try {
			const res = await fetch(`/api/admin/lessons/${linkLessonId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content_block_id: linkingBlockId }),
			});
			const json = await res.json();
			if (json.success) {
				linkSuccess = 'Content block berhasil di-link ke lesson';
				setTimeout(() => {
					showLinkModal = false;
					window.location.reload();
				}, 800);
			} else {
				linkError = json.error || 'Gagal link';
			}
		} catch {
			linkError = 'Gagal terhubung ke server';
		}
		linkSubmitting = false;
	}

	async function unlinkBlock(cb: ContentBlock) {
		if (!cb.lesson_id) return;
		if (!confirm(`Putuskan link content block "${cb.title}" dari lesson "${cb.lesson_title}"?`)) return;
		try {
			const res = await fetch(`/api/admin/lessons/${cb.lesson_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content_block_id: null }),
			});
			const json = await res.json();
			if (json.success) {
				window.location.reload();
			} else {
				alert('Gagal: ' + (json.error || 'Unknown'));
			}
		} catch {
			alert('Gagal terhubung ke server');
		}
	}

	// Edit metadata
	function openEditModal(cb: ContentBlock) {
		editingBlock = cb;
		editTitle = cb.title;
		editType = cb.type;
		editVisibility = cb.visibility;
		editError = '';
		editSuccess = '';
		showEditModal = true;
	}

	async function doEditMetadata() {
		if (!editingBlock) return;
		if (!editTitle.trim()) {
			editError = 'Title wajib diisi';
			return;
		}
		editSubmitting = true;
		editError = '';
		editSuccess = '';
		try {
			const res = await fetch(`/api/admin/content-blocks/${editingBlock.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: editTitle.trim(),
					type: editType,
					visibility: editVisibility,
				}),
			});
			const json = await res.json();
			if (json.success) {
				editSuccess = 'Metadata berhasil diupdate';
				setTimeout(() => {
					showEditModal = false;
					window.location.reload();
				}, 800);
			} else {
				editError = json.error || 'Gagal update';
			}
		} catch {
			editError = 'Gagal terhubung ke server';
		}
		editSubmitting = false;
	}

	async function deleteBlock(cb: ContentBlock) {
		if (!confirm(`Hapus content block "${cb.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
		try {
			const res = await fetch(`/api/admin/content-blocks/${cb.id}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (json.success) {
				window.location.reload();
			} else {
				alert('Gagal: ' + (json.error || 'Unknown'));
			}
		} catch {
			alert('Gagal terhubung ke server');
		}
	}
</script>

<svelte:head>
	<title>📚 Content — Admin</title>
</svelte:head>

<div class="content-page">
	<div class="stats-row">
		<StatCard icon="📦" value={data.modules.length} label="Modul" />
		<StatCard icon="🧩" value={data.contentBlocks.length} label="Content Blocks" />
		<StatCard icon="📖" value={data.lessons.length} label="Lessons" />
	</div>
	<PageHeader title="📚 Content Management" subtitle="Kelola modules, link content blocks ke lessons, edit metadata" />

	<!-- Modules Accordion -->
	<section class="section">
		<h2 class="section-title">📦 Modules ({data.modules.length})</h2>
		<div class="module-grid">
			{#each data.modules as mod (mod.slug)}
				<details class="module-card">
					<summary>
						<div class="mod-summary">
							<span class="mod-title">{mod.title}</span>
							<span class="card-badge {mod.level.toLowerCase()}">{mod.level}</span>
						</div>
						<div class="mod-meta">
							<span class="mod-slug">{mod.slug}</span>
							<span class="mod-sessions">{mod.sessions.length} sesi</span>
						</div>
					</summary>
					<div class="module-sessions">
						<p class="mod-desc">{mod.description}</p>
						<table class="session-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Sesi</th>
									<th>Content Block</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{#each mod.sessions as sess, i}
									{@const cbId = `cb-${sess.id}`}
									{@const cb = data.contentBlocks.find(c => c.id === cbId)}
									<tr>
										<td>{i + 1}</td>
										<td>{sess.title}<br><code class="sess-id">{sess.id}</code></td>
										<td>
											{#if cb}
												<span class="cb-link">{cb.id}</span>
												{#if cb.lesson_id}
													<span class="linked-badge">→ {cb.lesson_title}</span>
												{:else}
													<span class="unlinked-badge">No lesson</span>
												{/if}
											{:else}
												<span class="no-cb">—</span>
											{/if}
										</td>
										<td>
											{#if cb}
												<Badge variant={cb.visibility === 'published' ? 'success' : cb.visibility === 'draft' ? 'warning' : 'default'}>{cb.visibility}</Badge>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</details>
			{/each}
		</div>
	</section>

	<!-- Content Blocks Table -->
	<section class="section">
		<h2 class="section-title">🧩 Content Blocks ({filteredBlocks.length})</h2>

		<div class="filter-bar">
			<SearchBar bind:value={searchQuery} placeholder="Cari title atau ID..." />
			<Select options={visibilityOptions} bind:value={visibilityFilter} />
			<Select options={moduleOptions} bind:value={selectedModule} />
		</div>

		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Visibility</TableHead>
					<TableHead>Linked Lesson</TableHead>
					<TableHead>Order</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if filteredBlocks.length === 0}
					<TableRow>
						<TableCell colspan="6" class="empty-cell">No content blocks found</TableCell>
					</TableRow>
				{:else}
					{#each filteredBlocks as cb (cb.id)}
						<TableRow>
							<TableCell class="cell-title">
								<span class="block-title">{cb.title}</span>
								<code class="block-id">{cb.id}</code>
							</TableCell>
							<TableCell><span class="type-badge">{getTypeIcon(cb.type)} {cb.type}</span></TableCell>
							<TableCell>
								<Badge variant={cb.visibility === 'published' ? 'success' : cb.visibility === 'draft' ? 'warning' : 'default'}>{cb.visibility}</Badge>
							</TableCell>
							<TableCell>
								{#if cb.lesson_id}
									<div class="linked-lesson">
										<span class="lesson-name">{cb.lesson_title}</span>
										<code class="lesson-status {cb.lesson_status}">{cb.lesson_status}</code>
										<Button variant="ghost" size="sm" onclick={() => unlinkBlock(cb)}>✕</Button>
									</div>
								{:else}
									<Button variant="outline" size="sm" onclick={() => openLinkModal(cb)}>🔗 Link ke lesson</Button>
								{/if}
							</TableCell>
							<TableCell class="cell-order">{cb.order_index}</TableCell>
							<TableCell class="cell-actions">
								<Button size="sm" onclick={() => openEditModal(cb)}>✏️ Edit</Button>
								<Button variant="danger" size="sm" onclick={() => deleteBlock(cb)}>🗑️</Button>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</section>

	<!-- Unlinked blocks summary -->
	<section class="section">
		<h2 class="section-title">⚠️ Unlinked Content Blocks ({unlinkedBlocks.length})</h2>
		{#if unlinkedBlocks.length === 0}
			<p class="empty-note">Semua content blocks sudah ter-link ke lesson.</p>
		{:else}
			<div class="unlinked-list">
				{#each unlinkedBlocks as cb (cb.id)}
					<div class="unlinked-item">
						<span class="ul-title">{cb.title}</span>
						<code class="ul-id">{cb.id}</code>
						<Button size="sm" onclick={() => openLinkModal(cb)}>🔗 Link</Button>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<!-- Link Modal -->
{#if showLinkModal}
	<Modal
		open={showLinkModal}
		title="🔗 Link Content Block ke Lesson"
		onclose={() => { if (!linkSubmitting) showLinkModal = false; }}
	>
		<p class="modal-desc">
			Linking <code>{linkingBlockId}</code>
		</p>
		{#if linkError}
			<Alert variant="danger">{linkError}</Alert>
		{/if}
		{#if linkSuccess}
			<Alert variant="success">{linkSuccess}</Alert>
		{/if}
		<label class="form-group">
			<span>Course Offering</span>
			<Select bind:value={linkOfferingId}
				options={data.offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` }))}
				placeholder="Pilih offering..." />
		</label>
		<label class="form-group">
			<span>Lesson</span>
			<Select bind:value={linkLessonId} disabled={!linkOfferingId}
				options={lessonsByOffering.map(l => ({ value: l.id, label: `${l.order_index}. ${l.title} (${l.status})` }))}
				placeholder="Pilih lesson..." />
		</label>
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showLinkModal = false} disabled={linkSubmitting}>Batal</Button>
			<Button onclick={doLink} disabled={linkSubmitting || !linkLessonId}>
				{linkSubmitting ? 'Menyimpan...' : '🔗 Link'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<!-- Edit Metadata Modal -->
{#if showEditModal && editingBlock}
	<Modal
		open={showEditModal}
		title="✏️ Edit Metadata"
		onclose={() => { if (!editSubmitting) showEditModal = false; }}
	>
		<p class="modal-desc">
			Editing <code>{editingBlock.id}</code>
		</p>
		{#if editError}
			<Alert variant="danger">{editError}</Alert>
		{/if}
		{#if editSuccess}
			<Alert variant="success">{editSuccess}</Alert>
		{/if}
		<label class="form-group">
			<span>Title</span>
			<Input bind:value={editTitle} placeholder="Content block title" />
		</label>
		<label class="form-group">
			<span>Type</span>
			<Select bind:value={editType}
				options={[
					{ value: 'text', label: '📝 Text' },
					{ value: 'video', label: '🎬 Video' },
					{ value: 'code', label: '💻 Code' },
					{ value: 'embed', label: '🔗 Embed' },
					{ value: 'quiz', label: '❓ Quiz' },
				]} />
		</label>
		<label class="form-group">
			<span>Visibility</span>
			<Select bind:value={editVisibility}
				options={[
					{ value: 'draft', label: 'Draft' },
					{ value: 'published', label: 'Published' },
					{ value: 'archived', label: 'Archived' },
				]} />
		</label>
		{#snippet footer()}
			<Button variant="secondary" onclick={() => showEditModal = false} disabled={editSubmitting}>Batal</Button>
			<Button onclick={doEditMetadata} disabled={editSubmitting}>
				{editSubmitting ? 'Menyimpan...' : '💾 Simpan'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.content-page { max-width: 1200px; }

	.stats-row {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 28px;
		gap: 16px;
		flex-wrap: wrap;
	}
	.header-stats { display: flex; gap: 8px; flex-wrap: wrap; }
	.stat-badge {
		font-size: 12px;
		padding: 4px 12px;
		border-radius: 20px;
		background: var(--accent-dim);
		color: var(--accent);
		font-weight: 600;
		white-space: nowrap;
	}

	.section { margin-bottom: 32px; }
	.section-title {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 14px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	/* Module grid */
	.module-grid { display: flex; flex-direction: column; gap: 8px; }
	.module-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.module-card summary {
		padding: 14px 16px;
		cursor: pointer;
		list-style: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.module-card summary::-webkit-details-marker { display: none; }
	.module-card[open] summary { border-bottom: 1px solid var(--border); }
	.mod-summary { display: flex; align-items: center; gap: 8px; }
	.mod-title { font-weight: 600; font-size: 14px; }
	.mod-meta { display: flex; gap: 10px; font-size: 11px; color: var(--text-secondary); }
	.mod-slug { font-family: monospace; }
	.mod-sessions { white-space: nowrap; }
	.mod-desc { font-size: 13px; color: var(--text-secondary); padding: 0 16px 12px; margin: 0; }

	.module-sessions { padding: 8px 16px 16px; }

	.session-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.session-table th, .session-table td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--border); }
	.session-table th { font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px; }
	.sess-id { font-size: 10px; opacity: 0.6; }
	.cb-link { font-family: monospace; font-size: 11px; display: block; }
	.linked-badge { font-size: 11px; color: #22c55e; }
	.unlinked-badge { font-size: 11px; color: var(--text-secondary); }
	.no-cb { color: var(--text-secondary); font-size: 12px; }

	/* Filter bar */
	.filter-bar {
		display: flex;
		gap: 10px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}

	.cell-title { min-width: 200px; }
	.block-title { display: block; font-weight: 500; }
	.block-id { font-size: 10px; color: var(--text-secondary); }
	.cell-order { text-align: center; font-family: monospace; }

	.type-badge { font-size: 12px; white-space: nowrap; }

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

	.linked-lesson { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.lesson-name { font-weight: 500; }
	.lesson-status { font-size: 10px; padding: 1px 6px; border-radius: 6px; }
	.lesson-status.published { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
	.lesson-status.draft { background: rgba(234, 179, 8, 0.1); color: #ca8a04; }
	.lesson-status.archived { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

	.cell-actions { display: flex; gap: 4px; white-space: nowrap; }

	/* Unlinked section */
	.unlinked-list { display: flex; flex-direction: column; gap: 6px; }
	.unlinked-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 13px;
	}
	.ul-title { font-weight: 500; flex: 1; }
	.ul-id { font-size: 11px; color: var(--text-secondary); font-family: monospace; }
	.empty-note { font-size: 13px; color: var(--text-secondary); padding: 8px 0; }

	.form-group {
		display: flex; flex-direction: column; gap: 5px;
		font-size: 13px; font-weight: 500; color: var(--text);
		margin-bottom: 12px;
	}
	.modal-desc { font-size: 13px; color: var(--text-secondary); margin: 0 0 12px; }
	.modal-desc code { font-family: monospace; font-size: 11px; background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; }

	@media (max-width: 768px) {
		.page-header { flex-direction: column; }
		.filter-bar { flex-direction: column; }
		.filter-bar select { width: 100%; }
	}
</style>
