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

	let { data }: {
		data: {
			modules: Module[];
			contentBlocks: ContentBlock[];
			lessons: Lesson[];
			offerings: Offering[];
		}
	} = $props();

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

	function getVisibilityBadgeClass(v: string): string {
		if (v === 'published') return 'badge-published';
		if (v === 'draft') return 'badge-draft';
		return 'badge-archived';
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
	<div class="page-header">
		<div>
			<h1>📚 Content Management</h1>
			<p class="page-desc">Kelola modules, link content blocks ke lessons, edit metadata</p>
		</div>
		<div class="header-stats">
			<span class="stat-badge">{data.modules.length} Modul</span>
			<span class="stat-badge">{data.contentBlocks.length} Content Blocks</span>
			<span class="stat-badge">{data.lessons.length} Lessons</span>
		</div>
	</div>

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
												<span class="visibility-badge {getVisibilityBadgeClass(cb.visibility)}">{cb.visibility}</span>
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
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari title atau ID..."
				class="search-input"
			/>
			<select bind:value={visibilityFilter}>
				<option value="all">All visibility</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
				<option value="archived">Archived</option>
			</select>
			<select bind:value={selectedModule}>
				<option value="all">All modules</option>
				{#each data.modules as mod (mod.slug)}
					<option value={mod.slug}>{mod.title}</option>
				{/each}
			</select>
		</div>

		<div class="table-wrapper">
			<table class="blocks-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Type</th>
						<th>Visibility</th>
						<th>Linked Lesson</th>
						<th>Order</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if filteredBlocks.length === 0}
						<tr>
							<td colspan="6" class="empty-cell">No content blocks found</td>
						</tr>
					{:else}
						{#each filteredBlocks as cb (cb.id)}
							<tr>
								<td class="cell-title">
									<span class="block-title">{cb.title}</span>
									<code class="block-id">{cb.id}</code>
								</td>
								<td><span class="type-badge">{getTypeIcon(cb.type)} {cb.type}</span></td>
								<td>
									<span class="visibility-badge {getVisibilityBadgeClass(cb.visibility)}">{cb.visibility}</span>
								</td>
								<td>
									{#if cb.lesson_id}
										<div class="linked-lesson">
											<span class="lesson-name">{cb.lesson_title}</span>
											<code class="lesson-status {cb.lesson_status}">{cb.lesson_status}</code>
											<button class="btn-unlink" onclick={() => unlinkBlock(cb)} title="Unlink">✕</button>
										</div>
									{:else}
										<button class="btn-link" onclick={() => openLinkModal(cb)}>🔗 Link ke lesson</button>
									{/if}
								</td>
								<td class="cell-order">{cb.order_index}</td>
								<td class="cell-actions">
									<button class="btn btn-sm" onclick={() => openEditModal(cb)}>✏️ Edit</button>
									<button class="btn btn-sm btn-danger" onclick={() => deleteBlock(cb)}>🗑️</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
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
						<button class="btn btn-sm" onclick={() => openLinkModal(cb)}>🔗 Link</button>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<!-- Link Modal -->
{#if showLinkModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => !linkSubmitting && (showLinkModal = false)} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>🔗 Link Content Block ke Lesson</h2>
				<button class="modal-close" onclick={() => showLinkModal = false}>✕</button>
			</div>
			<div class="modal-body">
				<p class="modal-desc">
					Linking <code>{linkingBlockId}</code>
				</p>
				{#if linkError}
					<div class="alert alert-error">{linkError}</div>
				{/if}
				{#if linkSuccess}
					<div class="alert alert-success">{linkSuccess}</div>
				{/if}
				<label class="form-group">
					<span>Course Offering</span>
					<select bind:value={linkOfferingId}>
						<option value="">Pilih offering...</option>
						{#each data.offerings as offer (offer.id)}
							<option value={offer.id}>{offer.name} ({offer.code})</option>
						{/each}
					</select>
				</label>
				<label class="form-group">
					<span>Lesson</span>
					<select bind:value={linkLessonId} disabled={!linkOfferingId}>
						<option value="">Pilih lesson...</option>
						{#each lessonsByOffering as lesson (lesson.id)}
							<option value={lesson.id}>
								{lesson.order_index}. {lesson.title} ({lesson.status})
							</option>
						{/each}
					</select>
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => showLinkModal = false} disabled={linkSubmitting}>Batal</button>
				<button class="btn-primary" onclick={doLink} disabled={linkSubmitting || !linkLessonId}>
					{linkSubmitting ? 'Menyimpan...' : '🔗 Link'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Metadata Modal -->
{#if showEditModal && editingBlock}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => !editSubmitting && (showEditModal = false)} role="dialog">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>✏️ Edit Metadata</h2>
				<button class="modal-close" onclick={() => showEditModal = false}>✕</button>
			</div>
			<div class="modal-body">
				<p class="modal-desc">
					Editing <code>{editingBlock.id}</code>
				</p>
				{#if editError}
					<div class="alert alert-error">{editError}</div>
				{/if}
				{#if editSuccess}
					<div class="alert alert-success">{editSuccess}</div>
				{/if}
				<label class="form-group">
					<span>Title</span>
					<input type="text" bind:value={editTitle} placeholder="Content block title" />
				</label>
				<label class="form-group">
					<span>Type</span>
					<select bind:value={editType}>
						<option value="text">📝 Text</option>
						<option value="video">🎬 Video</option>
						<option value="code">💻 Code</option>
						<option value="embed">🔗 Embed</option>
						<option value="quiz">❓ Quiz</option>
					</select>
				</label>
				<label class="form-group">
					<span>Visibility</span>
					<select bind:value={editVisibility}>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
						<option value="archived">Archived</option>
					</select>
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => showEditModal = false} disabled={editSubmitting}>Batal</button>
				<button class="btn-primary" onclick={doEditMetadata} disabled={editSubmitting}>
					{editSubmitting ? 'Menyimpan...' : '💾 Simpan'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.content-page { max-width: 1200px; }

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
	.search-input {
		flex: 1;
		min-width: 200px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
	}
	.filter-bar select {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		min-width: 150px;
	}

	/* Blocks table */
	.table-wrapper {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow-x: auto;
	}
	.blocks-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.blocks-table th {
		padding: 10px 12px;
		text-align: left;
		font-size: 11px;
		text-transform: uppercase;
		color: var(--text-secondary);
		font-weight: 600;
		letter-spacing: 0.5px;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	.blocks-table td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}
	.blocks-table tr:last-child td { border-bottom: none; }
	.blocks-table tr:hover { background: var(--bg-secondary); }

	.cell-title { min-width: 200px; }
	.block-title { display: block; font-weight: 500; }
	.block-id { font-size: 10px; color: var(--text-secondary); }
	.cell-order { text-align: center; font-family: monospace; }

	.type-badge { font-size: 12px; white-space: nowrap; }
	.visibility-badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.badge-published { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
	.badge-draft { background: rgba(234, 179, 8, 0.1); color: #ca8a04; }
	.badge-archived { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

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

	.btn-unlink {
		background: none;
		border: none;
		cursor: pointer;
		color: #ef4444;
		font-size: 13px;
		padding: 2px 4px;
		opacity: 0.6;
	}
	.btn-unlink:hover { opacity: 1; }

	.btn-link {
		background: rgba(99, 102, 241, 0.1);
		color: var(--accent);
		border: 1px solid var(--accent-dim);
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 11px;
		cursor: pointer;
		white-space: nowrap;
	}
	.btn-link:hover { background: var(--accent-dim); }

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
	.empty-cell { text-align: center; color: var(--text-secondary); padding: 40px !important; }

	/* Buttons */
	.btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--bg-secondary);
		color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
	}
	.btn-sm { padding: 4px 10px; font-size: 12px; }
	.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn-cancel { background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
	.btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
	.btn:hover, .btn-cancel:hover, .btn-primary:hover { opacity: 0.85; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Alerts */
	.alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
	.alert-success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
	.alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

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
		max-width: 500px;
		max-height: 85vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0,0,0,0.3);
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 18px 20px 0;
	}
	.modal-header h2 { font-size: 18px; font-weight: 600; margin: 0; }
	.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-secondary); padding: 4px; }
	.modal-body { padding: 16px 20px; }
	.modal-desc { font-size: 13px; color: var(--text-secondary); margin: 0 0 12px; }
	.modal-desc code { font-family: monospace; font-size: 11px; background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; }
	.modal-footer {
		display: flex; gap: 8px; justify-content: flex-end;
		padding: 0 20px 18px;
	}
	.form-group {
		display: flex; flex-direction: column; gap: 5px;
		font-size: 13px; font-weight: 500; color: var(--text);
		margin-bottom: 12px;
	}
	.form-group input, .form-group select, .form-group textarea {
		padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg); color: var(--text); font-size: 13px;
	}
	.form-group select:disabled { opacity: 0.5; }

	@media (max-width: 768px) {
		.page-header { flex-direction: column; }
		.filter-bar { flex-direction: column; }
		.filter-bar select { width: 100%; }
		.blocks-table { font-size: 12px; }
	}
</style>
