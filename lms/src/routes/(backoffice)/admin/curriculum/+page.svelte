<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	interface Offering {
		id: string;
		name: string;
		code: string;
		status: string;
	}

	interface Lesson {
		id: string;
		title: string;
		slug: string;
		course_offering_id: string;
		order_index: number;
		status: string;
		is_optional: number;
		duration_minutes: number | null;
		offering_name: string | null;
	}

	import { Button, Select, Badge, Alert, Skeleton, EmptyState } from '$lib/components/ui';

	let { data }: {
		data: {
			offerings: Offering[];
			lessons: Lesson[];
		}
	} = $props();

	let selectedOfferingId = $state('');
	let lessons = $state<Lesson[]>([]);
	let saving = $state(false);
	let saveStatus = $state<'idle' | 'saved' | 'saving' | 'error'>('idle');
	let errorMsg = $state('');
	let dragIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	let offeringOptions = $derived([
		{ value: '', label: '— Pilih Course Offering —' },
		...data.offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` }))
	]);

	let filteredLessons = $derived(
		selectedOfferingId ? data.lessons.filter(l => l.course_offering_id === selectedOfferingId) : []
	);

	let offering = $derived(
		data.offerings.find(o => o.id === selectedOfferingId)
	);

	// Initialise local lessons when offering changes
	$effect(() => {
		if (selectedOfferingId) {
			lessons = filteredLessons.map(l => ({ ...l }));
			saveStatus = 'idle';
		} else {
			lessons = [];
		}
	});

	// Debounced auto-save
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	function scheduleSave() {
		clearTimeout(debounceTimer);
		saveStatus = 'idle';
		debounceTimer = setTimeout(() => doSave(), 600);
	}

	async function doSave() {
		if (lessons.length === 0) return;
		saveStatus = 'saving';
		saving = true;
		errorMsg = '';
		try {
			const order = lessons.map((l, i) => ({ id: l.id, order_index: i }));
			const res = await fetch('/api/admin/lessons/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order }),
			});
			const json = await res.json();
			if (json.success) {
				saveStatus = 'saved';
				// Update order_index on local objects to match
				lessons = lessons.map((l, i) => ({ ...l, order_index: i }));
			} else {
				saveStatus = 'error';
				errorMsg = json.error || 'Gagal menyimpan urutan';
			}
		} catch {
			saveStatus = 'error';
			errorMsg = 'Gagal terhubung ke server';
		} finally {
			saving = false;
			if (saveStatus === 'saved') {
				setTimeout(() => { if (saveStatus === 'saved') saveStatus = 'idle'; }, 2000);
			}
		}
	}

	// --- Drag & Drop handlers ---
	function handleDragStart(e: DragEvent, index: number) {
		dragIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === index) return;
		dragOverIndex = index;

		// Reorder locally for visual feedback
		const reordered = [...lessons];
		const [moved] = reordered.splice(dragIndex, 1);
		reordered.splice(index, 0, moved);
		lessons = reordered;
		dragIndex = index;
	}

	function handleDragEnd() {
		dragIndex = null;
		dragOverIndex = null;
		scheduleSave();
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function statusClass(s: string): string {
		const m: Record<string, string> = { published: 'status--active', draft: 'status--draft', archived: 'status--archived' };
		return m[s] || 'status--draft';
	}

	// Move lesson up/down buttons (keyboard/accessibility)
	function moveUp(index: number) {
		if (index <= 0) return;
		const reordered = [...lessons];
		[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
		lessons = reordered;
		scheduleSave();
	}

	function moveDown(index: number) {
		if (index >= lessons.length - 1) return;
		const reordered = [...lessons];
		[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
		lessons = reordered;
		scheduleSave();
	}

	let saveLabel = $derived.by(() => {
		switch (saveStatus) {
			case 'saving': return '💾 Menyimpan...';
			case 'saved': return '✅ Tersimpan';
			case 'error': return '❌ Gagal simpan';
			default: return '';
		}
	});
</script>

<svelte:head>
	<title>📋 Curriculum Builder — Admin — RPL AI Curriculum</title>
</svelte:head>

<div class="curriculum-page">
	<div class="page-header">
		<div>
			<h1>📋 Curriculum Builder</h1>
			<p class="page-desc">Drag & drop untuk mengurutkan pelajaran. Perubahan otomatis tersimpan.</p>
		</div>
	</div>

	<!-- Offering selector -->
	<div class="selector-bar">
		<Select options={offeringOptions} bind:value={selectedOfferingId} />
		{#if selectedOfferingId}
			<span class="lesson-count">{filteredLessons.length} pelajaran</span>
		{/if}
	</div>

	{#if !selectedOfferingId}
		<EmptyState
			icon="👆"
			title="Pilih Course Offering"
			description="Pilih course offering di atas untuk mulai mengatur urutan pelajaran."
		/>
	{:else if filteredLessons.length === 0}
		<EmptyState
			icon="📭"
			title="Tidak ada pelajaran"
			description="Offering ini belum memiliki pelajaran. Buat lesson terlebih dahulu."
		/>
	{:else}
		<!-- Save status bar -->
		{#if saveLabel}
			<div class="save-bar" class:save-bar--error={saveStatus === 'error'}>
				<span>{saveLabel}</span>
				{#if errorMsg}
					<span class="save-error-detail">{errorMsg}</span>
				{/if}
			</div>
		{/if}

		<!-- Lesson list (drag & drop) -->
		<div class="lesson-sortable-list" role="list" aria-label="Daftar pelajaran">
			{#each lessons as lesson, i (lesson.id)}
				<div
					class="lesson-drag-item"
					class:dragging={dragIndex === i}
					class:drag-over={dragOverIndex === i}
					draggable="true"
					role="listitem"
					aria-label="{lesson.title}, urutan ke-{i + 1}"
					tabindex="0"
					ondragstart={(e) => handleDragStart(e, i)}
					ondragover={(e) => handleDragOver(e, i)}
					ondragend={handleDragEnd}
					ondragleave={handleDragLeave}
					onkeydown={(e) => {
						if (e.key === 'ArrowUp') { e.preventDefault(); moveUp(i); }
						if (e.key === 'ArrowDown') { e.preventDefault(); moveDown(i); }
					}}
				>
					<div class="drag-handle" aria-hidden="true">
						<span class="handle-dots">⠿</span>
					</div>

					<div class="lesson-order-number">{i + 1}</div>

					<div class="lesson-info">
						<span class="lesson-drag-title">{lesson.title}</span>
						<div class="lesson-meta">
							<Badge variant={lesson.status === 'published' ? 'success' : lesson.status === 'draft' ? 'warning' : 'default'}>{lesson.status}</Badge>
							{#if lesson.is_optional}
								<Badge variant="default">⚡ Tambahan</Badge>
							{/if}
							{#if lesson.duration_minutes}
								<span class="meta-duration">⏱ {lesson.duration_minutes}m</span>
							{/if}
						</div>
					</div>

					<div class="lesson-move-btns">
						<Button
							class="move-btn"
							disabled={i === 0}
							onclick={() => moveUp(i)}
							aria-label="Pindahkan ke atas"
							title="Naik"
						>↑</Button>
						<Button
							class="move-btn"
							disabled={i === lessons.length - 1}
							onclick={() => moveDown(i)}
							aria-label="Pindahkan ke bawah"
							title="Turun"
						>↓</Button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Bottom save info -->
		<div class="bottom-info">
			<span class="order-hint">💡 Seret item atau gunakan tombol ↑↓ untuk mengubah urutan. Perubahan auto-save.</span>
		</div>
	{/if}
</div>

<style>
	.curriculum-page {
		max-width: 860px;
	}
	.page-header {
		margin-bottom: 24px;
	}
	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
	}
	.page-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.selector-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
	}
	.lesson-count {
		font-size: 13px;
		color: var(--text-secondary);
		white-space: nowrap;
		background: var(--bg-secondary);
		padding: 4px 10px;
		border-radius: 20px;
	}

	/* Save status bar */
	.save-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		margin-bottom: 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		background: var(--accent-dim, rgba(59, 130, 246, 0.1));
		color: var(--accent, #3b82f6);
		border: 1px solid var(--accent-dim, rgba(59, 130, 246, 0.2));
	}
	.save-bar--error {
		background: rgba(239, 68, 68, 0.1);
		color: var(--danger, #ef4444);
		border-color: rgba(239, 68, 68, 0.2);
	}
	.save-error-detail {
		font-weight: 400;
		opacity: 0.8;
	}

	/* Sortable list */
	.lesson-sortable-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.lesson-drag-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: all 0.15s ease;
		cursor: grab;
		user-select: none;
	}
	.lesson-drag-item:hover {
		border-color: var(--accent-dim, rgba(59, 130, 246, 0.3));
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
	}
	.lesson-drag-item:active {
		cursor: grabbing;
	}
	.lesson-drag-item.dragging {
		opacity: 0.5;
		background: var(--bg-secondary);
		border-style: dashed;
	}
	.lesson-drag-item.drag-over {
		border-color: var(--accent, #3b82f6);
		background: var(--accent-dim, rgba(59, 130, 246, 0.06));
		box-shadow: 0 0 0 2px var(--accent-dim, rgba(59, 130, 246, 0.2));
	}

	.drag-handle {
		flex-shrink: 0;
		color: var(--text-tertiary, #9ca3af);
		font-size: 18px;
		line-height: 1;
		padding: 2px;
	}
	.handle-dots {
		letter-spacing: 2px;
	}

	.lesson-order-number {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--bg-secondary);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.lesson-info {
		flex: 1;
		min-width: 0;
	}
	.lesson-drag-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
		display: block;
		margin-bottom: 4px;
	}
	.lesson-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.meta-duration {
		font-size: 12px;
		color: var(--text-tertiary, #9ca3af);
	}

	.lesson-move-btns {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex-shrink: 0;
	}
	.move-btn {
		width: 26px;
		height: 22px;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.1s;
	}
	.move-btn:hover:not(:disabled) {
		background: var(--hover);
		border-color: var(--accent-dim);
		color: var(--accent);
	}
	.move-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.bottom-info {
		margin-top: 20px;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border-radius: 8px;
	}
	.order-hint {
		font-size: 13px;
		color: var(--text-secondary);
	}
</style>
