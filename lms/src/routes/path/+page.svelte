<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { modules, type Module, type Session } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { paths, computePathProgress } from '$lib/stores/paths';
	import { goto } from '$app/navigation';
	import { StatCard } from '$lib/components/ui';

	type Level = 'Beginner' | 'Intermediate' | 'Advanced';

	const LEVEL_META: Record<Level, { icon: string; color: string; bg: string; gradient: string }> = {
		Beginner: { icon: '🌱', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
		Intermediate: { icon: '📐', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
		Advanced: { icon: '🚀', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
	};

	let isCompleted = $derived((modSlug: string, sessionId: string) =>
		progress.isSessionCompleted(modSlug, sessionId)
	);

	let pathProgressMap = $derived(
		Object.fromEntries(
			paths.map(p => [p.slug, computePathProgress(p.slug, isCompleted)])
		)
	);

	let totalSessions = $derived(modules.reduce((acc: number, m: Module) => acc + m.sessions.length, 0));
	let totalModules = $derived(modules.length);
	let completedModules = $derived(progress.completedCount);

	let activeTab = $state<'paths' | 'timeline'>('timeline');

	let levelModules = $derived<Record<Level, Module[]>>({
		Beginner: modules.filter((m) => m.level === 'Beginner'),
		Intermediate: modules.filter((m) => m.level === 'Intermediate'),
		Advanced: modules.filter((m) => m.level === 'Advanced'),
	});

	let levelStats = $derived(
		(Object.keys(levelModules) as Level[]).map((level) => {
			const mods = levelModules[level];
			return {
				level,
				count: mods.length,
				sessions: mods.reduce((acc: number, m: Module) => acc + m.sessions.length, 0),
				completed: mods.filter((m: Module) => progress.getModuleProgress(m.slug) === 100).length,
			};
		})
	);

	interface TimelineModule {
		index: number;
		slug: string;
		title: string;
		description: string;
		level: Level;
		sessions: Session[];
		pct: number;
		completedSessions: number;
	}

	let moduleProgress = $derived<TimelineModule[]>(
		modules.map((m) => {
			const pct = progress.getModuleProgress(m.slug);
			const completedCount = Math.round((pct / 100) * m.sessions.length);
			return {
				index: m.index,
				slug: m.slug,
				title: m.title,
				description: m.description,
				level: m.level as Level,
				sessions: m.sessions,
				pct,
				completedSessions: completedCount,
			};
		})
	);

	let estimatedMinutes = $derived(Math.ceil((totalSessions * 500) / 200));

	function goToModule(slug: string) {
		goto(`/module/${slug}`);
	}

	function goToPath(slug: string) {
		goto(`/path/${slug}`);
	}
</script>

<div class="path-page">
	<!-- Header -->
	<header class="page-header">
		<div class="header-text">
			<h1>{t('path.header_title')}</h1>
			<p class="header-subtitle">{t('path.subtitle')}</p>
		</div>
		<div class="header-stats">
			<StatCard icon="📦" value={totalModules} label="Modul" />
			<StatCard icon="✅" value="{completedModules}/{totalModules}" label="Selesai" />
			<StatCard icon="📝" value={totalSessions} label="Sesi" />
			<StatCard icon="⏱️" value={estimatedMinutes} label="Menit" />
		</div>
	</header>

	<!-- Level Overview -->
	<section class="level-overview">
		<div class="level-cards">
			{#each levelStats as stat, i}
				{@const meta = LEVEL_META[stat.level]}
				<div class="level-card" style="--level-color: {meta.color}; --level-bg: {meta.bg}; --anim-delay: {i * 0.1}s">
					<div class="level-card-header">
						<span class="level-icon">{meta.icon}</span>
						<div class="level-info">
							<h2 class="level-name">
								{stat.level === 'Beginner' ? t('path.beginner') : stat.level === 'Intermediate' ? t('path.intermediate') : t('path.advanced')}
							</h2>
							<span class="level-meta-text">{stat.count} modul · {stat.sessions} sesi</span>
						</div>
						<span class="level-completed-badge" class:all-done={stat.completed === stat.count}>
							{stat.completed}/{stat.count}
						</span>
					</div>
					<div class="level-progress-track">
						<div
							class="level-progress-fill"
							style="width: {stat.count > 0 ? (stat.completed / stat.count) * 100 : 0}%; background: {meta.color}"
						></div>
					</div>
					{#if i < levelStats.length - 1}
						<div class="level-arrow" aria-hidden="true">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Tab bar -->
	<div class="tab-bar">
		<button
			class="tab-btn"
			class:active={activeTab === 'timeline'}
			onclick={() => activeTab = 'timeline'}
		>📋 {t('path.tab_timeline')}</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'paths'}
			onclick={() => activeTab = 'paths'}
		>🗺️ {t('path.tab_paths')}</button>
	</div>

	{#if activeTab === 'timeline'}
		<!-- === TIMELINE VIEW === -->
		<section class="module-timeline">
			<h2 class="section-title">
				<span>{t('path.timeline_title')}</span>
				<span class="section-badge">{totalModules} modul</span>
			</h2>

			<div class="timeline-track">
				{#each moduleProgress as mod, i (mod.slug)}
					{@const meta = LEVEL_META[mod.level]}
					{@const prevLevel = i > 0 ? moduleProgress[i - 1].level : null}

					{#if i > 0 && prevLevel !== mod.level}
						<div class="level-separator">
							<div class="separator-line"></div>
							<span class="separator-label" style="--label-color: {meta.color}">
								{meta.icon}
								{mod.level === 'Beginner' ? t('path.beginner') : mod.level === 'Intermediate' ? t('path.intermediate') : t('path.advanced')}
							</span>
							<div class="separator-line"></div>
						</div>
					{/if}

					<button
						class="timeline-module"
						onclick={() => goToModule(mod.slug)}
						style="--level-color: {meta.color}"
					>
						<div class="timeline-line-connector"></div>
						<div class="timeline-dot" style="background: {meta.color}">
							<span class="timeline-index">{mod.index + 1}</span>
						</div>
						<div class="timeline-card">
							<div class="timeline-card-top">
								<span class="timeline-level-badge" style="background: {meta.bg}; color: {meta.color}">
									{meta.icon}
									{mod.level === 'Beginner' ? t('path.beginner') : mod.level === 'Intermediate' ? t('path.intermediate') : t('path.advanced')}
								</span>
								<span class="timeline-sessions">{mod.completedSessions}/{mod.sessions.length} {t('path.sessions_unit')}</span>
							</div>
							<h3 class="timeline-title">{mod.title}</h3>
							<p class="timeline-desc">{mod.description}</p>
							<div class="timeline-progress">
								<div class="progress-track">
									<div
										class="progress-fill"
										style="width: {mod.pct}%; background: {meta.color}"
									></div>
								</div>
								<span class="progress-pct">{mod.pct}%</span>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{:else}
		<!-- === PATHS VIEW === -->
		<section class="paths-section">
			<h2 class="section-title">
				<span>{t('path.header_title')}</span>
				<span class="section-badge">{paths.length} Path</span>
			</h2>

			<div class="paths-grid">
				{#each paths as path, i}
					{@const pp = pathProgressMap[path.slug]}
					<button
						class="path-card"
						style="--path-color: {path.color}; --path-color-end: {path.colorEnd}; --anim-delay: {i * 0.06}s"
						onclick={() => goToPath(path.slug)}
					>
						<div class="path-card-bg" style="background: linear-gradient(135deg, {path.color}12, {path.colorEnd}12)"></div>
						<div class="path-card-top">
							<span class="path-card-icon">{path.icon}</span>
							<span class="path-card-level" style="color: {path.color}; background: {path.color}15">{path.level}</span>
						</div>
						<h3 class="path-card-title">{path.title}</h3>
						<p class="path-card-desc">{path.description}</p>
						<div class="path-card-meta">
							<span class="path-card-sessions">{path.estimatedSessions} {t('path.sessions_unit')}</span>
							{#if path.prerequisites && path.prerequisites.length > 0}
								<span class="path-card-prereq">Prasyarat</span>
							{/if}
						</div>
						<div class="path-card-progress">
							<div class="progress-track">
								<div
									class="progress-fill"
									style="width: {pp.pct}%; background: linear-gradient(90deg, {path.color}, {path.colorEnd})"
								></div>
							</div>
							<span class="progress-pct">{pp.pct}%</span>
						</div>
						{#if pp.completed > 0 && pp.pct < 100}
							<div class="path-card-footer">
								<span class="continue-link" style="color: {path.color}">{t('path.continue')} →</span>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	/* ─── Page ─── */
	.path-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	/* ─── Header ─── */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 20px;
		margin-bottom: 28px;
	}

	.header-text h1 {
		font-size: 24px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
	}

	.header-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	.header-stats {
		display: flex;
		gap: 12px;
		flex-shrink: 0;
	}

	/* ─── Level Overview ─── */
	.level-overview {
		margin-bottom: 28px;
	}

	.level-cards {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.level-card {
		position: relative;
		flex: 1;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		transition: all 0.2s ease;
		animation: fadeSlideIn 0.4s ease forwards;
		animation-delay: var(--anim-delay, 0s);
		opacity: 0;
		transform: translateY(12px);
	}

	.level-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		border-color: var(--level-color);
	}

	.level-card-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.level-icon {
		font-size: 28px;
		line-height: 1;
	}

	.level-info {
		flex: 1;
		min-width: 0;
	}

	.level-name {
		font-size: 14px;
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.level-meta-text {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.level-completed-badge {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-secondary);
		background: var(--bg);
		padding: 2px 8px;
		border-radius: 8px;
		white-space: nowrap;
	}

	.level-completed-badge.all-done {
		color: #22C55E;
		background: rgba(34, 197, 94, 0.1);
	}

	.level-progress-track {
		height: 4px;
		background: var(--bg);
		border-radius: 2px;
		overflow: hidden;
	}

	.level-progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.5s ease;
	}

	.level-arrow {
		position: absolute;
		right: -20px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-secondary);
		opacity: 0.3;
		z-index: 2;
		pointer-events: none;
	}

	/* ─── Tab bar ─── */
	.tab-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
	}

	.tab-btn {
		flex: 1;
		padding: 10px 16px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: inherit;
	}

	.tab-btn:hover {
		color: var(--text);
		background: var(--bg);
	}

	.tab-btn.active {
		background: var(--accent-dim, rgba(79, 70, 229, 0.1));
		color: var(--accent, #4F46E5);
	}

	/* ─── Section title ─── */
	.section-title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 16px;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 20px;
	}

	.section-badge {
		margin-left: auto;
		font-size: 11px;
		font-weight: 600;
		background: var(--bg);
		color: var(--text-secondary);
		padding: 3px 10px;
		border-radius: 12px;
	}

	/* ════════════════════════════════════════════
	   TIMELINE
	   ════════════════════════════════════════════ */

	.module-timeline {
		margin-bottom: 48px;
	}

	.timeline-track {
		position: relative;
		padding-left: 50px;
		max-height: 75vh;
		overflow-y: auto;
		scroll-snap-type: y proximity;
		padding-right: 8px;
	}

	.timeline-track::-webkit-scrollbar { width: 4px; }
	.timeline-track::-webkit-scrollbar-track { background: transparent; }
	.timeline-track::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

	.timeline-track::before {
		content: '';
		position: absolute;
		left: 23px;
		top: 8px;
		bottom: 8px;
		width: 2px;
		background: var(--border);
		z-index: 0;
	}

	/* Level separator */
	.level-separator {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 24px 0 16px -50px;
		scroll-snap-align: start;
	}

	.separator-line {
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.separator-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 4px 14px;
		border-radius: 20px;
		background: var(--level-bg, var(--bg));
		color: var(--level-color);
		white-space: nowrap;
	}

	/* Module card */
	.timeline-module {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 14px;
		margin-bottom: 10px;
		border: none;
		background: none;
		padding: 0;
		width: 100%;
		text-align: left;
		cursor: pointer;
		scroll-snap-align: start;
		font-family: inherit;
	}

	.timeline-line-connector {
		position: absolute;
		left: -27px;
		top: 18px;
		width: 14px;
		height: 2px;
		background: var(--border);
	}

	.timeline-dot {
		position: relative;
		z-index: 1;
		width: 34px;
		min-width: 34px;
		height: 34px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 14px;
		transition: transform 0.2s ease;
		box-shadow: 0 0 0 3px var(--surface);
	}

	.timeline-module:hover .timeline-dot {
		transform: scale(1.12);
	}

	.timeline-index {
		font-size: 11px;
		font-weight: 700;
		color: #fff;
	}

	.timeline-card {
		flex: 1;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 14px 16px;
		transition: all 0.2s ease;
	}

	.timeline-module:hover .timeline-card {
		border-color: var(--level-color);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		transform: translateY(-1px);
	}

	.timeline-card-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.timeline-level-badge {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 6px;
		white-space: nowrap;
	}

	.timeline-sessions {
		font-size: 11px;
		color: var(--text-secondary);
		margin-left: auto;
	}

	.timeline-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 2px;
		line-height: 1.4;
	}

	.timeline-desc {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 0 0 8px;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.timeline-progress {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.progress-track {
		flex: 1;
		height: 4px;
		background: var(--bg);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.progress-pct {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		min-width: 32px;
		text-align: right;
	}

	/* ════════════════════════════════════════════
	   PATHS GRID
	   ════════════════════════════════════════════ */

	.paths-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.path-card {
		position: relative;
		padding: 20px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: var(--text);
		overflow: hidden;
		transition: all 0.2s ease;
		animation: fadeSlideIn 0.4s ease forwards;
		animation-delay: var(--anim-delay, 0s);
		opacity: 0;
		transform: translateY(12px);
		width: 100%;
	}

	.path-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
		border-color: var(--path-color);
	}

	.path-card-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.path-card-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		position: relative;
	}

	.path-card-icon {
		font-size: 28px;
		line-height: 1;
	}

	.path-card-level {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 6px;
		white-space: nowrap;
	}

	.path-card-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0 0 4px;
		position: relative;
	}

	.path-card-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.5;
		margin: 0 0 10px;
		position: relative;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.path-card-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		position: relative;
	}

	.path-card-sessions {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.path-card-prereq {
		font-size: 10px;
		font-weight: 600;
		color: #F59E0B;
		background: rgba(245, 158, 11, 0.08);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.path-card-progress {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}

	.path-card-progress .progress-track {
		flex: 1;
		height: 6px;
		background: var(--bg);
		border-radius: 3px;
		overflow: hidden;
	}

	.path-card-progress .progress-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.5s ease;
	}

	.path-card-progress .progress-pct {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		min-width: 32px;
		text-align: right;
	}

	.path-card-footer {
		margin-top: 8px;
		position: relative;
	}

	.continue-link {
		font-size: 12px;
		font-weight: 600;
	}

	/* ─── Animations ─── */
	@keyframes fadeSlideIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ─── Responsive ─── */
	@media (max-width: 900px) {
		.level-cards {
			flex-direction: column;
			gap: 8px;
		}

		.level-arrow {
			position: relative;
			right: auto;
			top: auto;
			transform: rotate(90deg);
			display: flex;
			justify-content: center;
			padding: 2px 0;
		}

		.paths-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.path-page {
			padding: 16px 12px;
		}

		.page-header {
			flex-direction: column;
			gap: 12px;
		}

		.header-stats {
			width: 100%;
			justify-content: space-around;
		}

		.paths-grid {
			grid-template-columns: 1fr;
		}

		.timeline-track {
			padding-left: 40px;
		}

		.timeline-track::before {
			left: 17px;
		}

		.timeline-line-connector {
			left: -21px;
			width: 10px;
		}

		.timeline-dot {
			width: 28px;
			min-width: 28px;
			height: 28px;
			margin-top: 12px;
		}

		.timeline-index {
			font-size: 10px;
		}
	}
</style>
