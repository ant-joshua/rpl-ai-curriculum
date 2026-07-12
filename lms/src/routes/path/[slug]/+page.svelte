<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';
	import { modules, type Module } from '$lib/stores/modules';
	import { paths, getPathBySlug, computePathProgress, findNextSession } from '$lib/stores/paths';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let { data } = $props();
	let path = $derived(data.path);

	let isCompleted = $derived((modSlug: string, sessionId: string) =>
		progress.isSessionCompleted(modSlug, sessionId)
	);

	let pathProgress = $derived(computePathProgress(path.slug, isCompleted));

	let pathModules = $derived(
		path.modules
			.map((slug: string) => modules.find((m: Module) => m.slug === slug))
			.filter(Boolean) as Module[]
	);

	let firstIncomplete = $derived(findNextSession(path.slug, isCompleted));

	let moduleProgressMap = $derived(
		Object.fromEntries(
			pathModules.map(m => [m.slug, progress.getModuleProgress(m.slug)])
		)
	);

	let hasProgress = $derived(pathProgress.completed > 0);

	let relatedPaths = $derived(
		paths.filter(p =>
			p.slug !== path.slug &&
			(p.prerequisites?.includes(path.slug) ||
			 path.prerequisites?.includes(p.slug))
		)
	);

	function goToModule(slug: string) {
		goto(`/module/${slug}`);
	}

	function startPath() {
		if (firstIncomplete) {
			goto(`/module/${firstIncomplete.moduleSlug}`);
		} else if (pathModules.length > 0) {
			goto(`/module/${pathModules[0].slug}`);
		}
	}
</script>

<div class="path-detail" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<header class="path-header" style="background: linear-gradient(135deg, {path.color}22, {path.colorEnd}22)">
		<a href="/path" class="back-link">&larr; Semua Path</a>
		<div class="path-header-content">
			<span class="path-icon">{path.icon}</span>
			<div class="path-header-info">
				<h1>{path.title}</h1>
				<p class="path-desc">{path.description}</p>
				<div class="path-meta">
					<span class="level-badge">{path.level}</span>
					<span class="session-count">{path.estimatedSessions} sesi</span>
					<span class="module-count">{pathModules.length} modul</span>
				</div>
			</div>
		</div>
		<div class="path-progress-section">
			<div class="path-progress-bar">
				<div class="progress-track-large">
					<div class="progress-fill" style="width: {pathProgress.pct}%; background: linear-gradient(90deg, {path.color}, {path.colorEnd})"></div>
				</div>
				<span class="progress-text">{pathProgress.completed}/{pathProgress.total} sesi ({pathProgress.pct}%)</span>
			</div>
			{#if !hasProgress}
				<button class="start-btn" onclick={startPath} style="--start-color: {path.color}">
					Mulai Path Ini 🚀
				</button>
			{:else if firstIncomplete}
				<button class="continue-btn" onclick={() => goto(`/module/${firstIncomplete.moduleSlug}`)} style="--start-color: {path.color}">
					▶️ Lanjut Belajar — {firstIncomplete.moduleTitle}
				</button>
			{:else}
				<div class="completed-badge">🎉 Semua selesai!</div>
			{/if}
		</div>
	</header>

	<!-- Prerequisites -->
	{#if path.prerequisites && path.prerequisites.length > 0}
		<section class="prereq-section">
			<h2>📋 Prasyarat</h2>
			<p class="prereq-note">Selesaikan path berikut sebelum memulai path ini:</p>
			<div class="prereq-list">
				{#each path.prerequisites as prereqSlug}
					{@const prereqPath = getPathBySlug(prereqSlug)}
					{#if prereqPath}
						<a href="/path/{prereqPath.slug}" class="prereq-card">
							<span class="prereq-icon">{prereqPath.icon}</span>
							<div class="prereq-info">
								<span class="prereq-title">{prereqPath.title}</span>
								<span class="prereq-level">{prereqPath.level}</span>
							</div>
							<span class="prereq-arrow">&rarr;</span>
						</a>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	<!-- Module Checklist -->
	<section class="module-checklist-section">
		<h2>📚 Modul dalam Path Ini</h2>
		<div class="module-checklist">
			{#each pathModules as mod, i}
				{@const modPct = moduleProgressMap[mod.slug] ?? 0}
				{@const allDone = modPct === 100}
				{@const isFirstIncomplete = firstIncomplete && firstIncomplete.moduleSlug === mod.slug && modPct < 100}
				<button class="module-row" class:all-done={allDone} onclick={() => goToModule(mod.slug)}>
					<div class="module-row-left">
						<span class="module-index">{i + 1}</span>
						<span class="module-check" class:done={allDone}>
							{allDone ? '✅' : '⬜'}
						</span>
						<div class="module-info">
							<h3 class="module-title">{mod.title}</h3>
							<span class="module-meta">{mod.sessions.length} sesi</span>
						</div>
					</div>
					<div class="module-row-right">
						<div class="module-progress-bar">
							<div class="progress-track-small">
								<div class="progress-fill" style="width: {modPct}%; background: linear-gradient(90deg, {path.color}, {path.colorEnd})"></div>
							</div>
						</div>
						{#if isFirstIncomplete}
							<span class="continue-tag" style="background: {path.color}">▶️ Lanjut Belajar</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</section>

	<!-- Related Paths -->
	{#if relatedPaths.length > 0}
		<section class="related-section">
			<h2>🔗 Path Terkait</h2>
			<div class="related-grid">
				{#each relatedPaths as rp}
					<a href="/path/{rp.slug}" class="related-card" style="--rp-color: {rp.color}; --rp-color-end: {rp.colorEnd}">
						<div class="related-card-bg" style="background: linear-gradient(135deg, {rp.color}22, {rp.colorEnd}22)"></div>
						<span class="related-icon">{rp.icon}</span>
						<h3>{rp.title}</h3>
						<p>{rp.description}</p>
						<span class="related-meta">{rp.estimatedSessions} sesi</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.path-detail {
		max-width: 900px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: 8px;
		text-decoration: none !important;
	}
	.back-link:hover { color: var(--accent); }

	.path-header {
		border-radius: 16px;
		padding: 28px;
		margin-bottom: 24px;
		border: 1px solid var(--border);
	}

	.path-header-content {
		display: flex;
		align-items: flex-start;
		gap: 18px;
		margin-bottom: 20px;
	}

	.path-icon {
		font-size: 48px;
		line-height: 1;
		flex-shrink: 0;
	}

	.path-header-info { flex: 1; }

	.path-header-info h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.path-desc {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 10px;
		line-height: 1.5;
	}

	.path-meta {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.level-badge {
		font-size: 11px;
		font-weight: 600;
		background: var(--accent-dim);
		color: var(--accent);
		padding: 3px 10px;
		border-radius: 12px;
	}

	.session-count, .module-count {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.path-progress-section {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.path-progress-bar {
		flex: 1;
		min-width: 200px;
	}

	.progress-track-large {
		height: 8px;
		background: var(--border);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 4px;
	}

	.progress-track-large .progress-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.4s ease;
	}

	.progress-text {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.start-btn, .continue-btn {
		padding: 10px 20px;
		border-radius: 10px;
		border: none;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		font-family: inherit;
	}

	.start-btn {
		background: var(--start-color, var(--accent));
		color: #fff;
	}
	.start-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.continue-btn {
		background: var(--start-color, var(--accent));
		color: #fff;
	}
	.continue-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.completed-badge {
		font-size: 14px;
		font-weight: 600;
		color: var(--success, #22c55e);
		padding: 8px 16px;
		background: rgba(34, 197, 94, 0.1);
		border-radius: 10px;
	}

	/* Prerequisites */
	.prereq-section {
		margin-bottom: 24px;
	}

	.prereq-section h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.prereq-note {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}

	.prereq-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.prereq-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		text-decoration: none !important;
		transition: border-color 0.15s ease;
	}
	.prereq-card:hover {
		border-color: var(--accent);
	}

	.prereq-icon { font-size: 24px; }
	.prereq-info { flex: 1; }
	.prereq-title {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.prereq-level {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.prereq-arrow {
		font-size: 18px;
		color: var(--text-secondary);
	}

	/* Module Checklist */
	.module-checklist-section {
		margin-bottom: 24px;
	}

	.module-checklist-section h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.module-checklist {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.module-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		text-align: left;
		font-family: inherit;
		color: var(--text);
	}
	.module-row:hover {
		border-color: var(--accent);
		background: var(--hover);
	}
	.module-row.all-done {
		opacity: 0.7;
	}

	.module-row-left {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	.module-index {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		width: 24px;
		text-align: center;
		flex-shrink: 0;
	}

	.module-check {
		font-size: 16px;
		flex-shrink: 0;
	}
	.module-check.done { opacity: 1; }

	.module-info {
		flex: 1;
		min-width: 0;
	}
	.module-title {
		font-size: 14px;
		font-weight: 600;
		margin: 0 0 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.module-meta {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.module-row-right {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
	}

	.module-progress-bar {
		width: 100px;
	}

	.progress-track-small {
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}
	.progress-track-small .progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.continue-tag {
		font-size: 11px;
		font-weight: 600;
		color: #fff;
		padding: 3px 10px;
		border-radius: 8px;
		white-space: nowrap;
	}

	/* Related paths */
	.related-section {
		margin-bottom: 24px;
	}

	.related-section h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 12px;
	}

	.related-card {
		position: relative;
		padding: 20px;
		border-radius: 12px;
		border: 1px solid var(--border);
		text-decoration: none !important;
		transition: all 0.2s ease;
		overflow: hidden;
	}
	.related-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.15);
	}

	.related-card-bg {
		position: absolute;
		inset: 0;
		opacity: 0.06;
	}

	.related-icon {
		position: relative;
		font-size: 28px;
		display: block;
		margin-bottom: 8px;
	}

	.related-card h3 {
		position: relative;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 4px;
	}

	.related-card p {
		position: relative;
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		margin-bottom: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.related-meta {
		position: relative;
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
	}

	@media (max-width: 640px) {
		.path-header { padding: 20px; }
		.path-header-content { flex-direction: column; }
		.path-icon { font-size: 36px; }
		.path-header-info h1 { font-size: 20px; }
		.path-progress-section { flex-direction: column; align-items: stretch; }
		.module-row { flex-direction: column; align-items: flex-start; gap: 8px; }
		.module-row-right { width: 100%; justify-content: space-between; }
		.module-progress-bar { flex: 1; }
		.related-grid { grid-template-columns: 1fr; }
	}
</style>
