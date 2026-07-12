<script lang="ts">
	import { modules, type Module, type Session } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { goto } from '$app/navigation';

	type Level = 'Beginner' | 'Intermediate' | 'Advanced';

	const LEVEL_META: Record<Level, { icon: string; color: string; gradient: string }> = {
		Beginner: { icon: '🌱', color: 'var(--level-beginner)', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
		Intermediate: { icon: '📐', color: 'var(--level-intermediate)', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
		Advanced: { icon: '🚀', color: 'var(--level-advanced)', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
	};

	// --- Section 1: level cards ---
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
				sessions: mods.reduce((acc, m) => acc + m.sessions.length, 0),
				icon: LEVEL_META[level].icon,
				gradient: LEVEL_META[level].gradient,
			};
		})
	);

	// --- Section 2: vertical timeline ---
	interface TimelineModule {
		index: number;
		slug: string;
		dirName: string;
		title: string;
		description: string;
		level: Level;
		sessions: Session[];
		pct: number;
	}

	let moduleProgress = $derived<TimelineModule[]>(
		modules.map((m) => ({
			index: m.index,
			slug: m.slug,
			dirName: m.dirName,
			title: m.title,
			description: m.description,
			level: m.level as Level,
			sessions: m.sessions,
			pct: progress.getModuleProgress(m.slug),
		}))
	);

	let totalSessions = $derived(modules.reduce((acc, m) => acc + m.sessions.length, 0));
	let totalModules = $derived(modules.length);
	let completedModules = $derived(progress.completedCount);

	// crude word estimate: ~500 words / session
	let estimatedMinutes = $derived(Math.ceil((totalSessions * 500) / 200));

	function getLevelMeta(level: string) {
		return LEVEL_META[level as Level];
	}

	function goToModule(slug: string) {
		goto(`/module/${slug}`);
	}
</script>

<div class="path-page">
	<!-- Section 1: Visual Path Overview -->
	<section class="level-overview">
		<div class="level-cards">
			{#each levelStats as stat, i}
				<div
					class="level-card animate-in"
					style="--level-grad: {stat.gradient}; --anim-delay: {i * 0.12}s"
				>
					<div class="level-card-bg" style="background: {stat.gradient}"></div>
					<div class="level-card-content">
						<span class="level-icon">{stat.icon}</span>
						<h2 class="level-name">{stat.level}</h2>
						<div class="level-meta">
							<span class="level-stat">
								<strong>{stat.count}</strong> modul
							</span>
							<span class="level-stat">
								<strong>{stat.sessions}</strong> sesi
							</span>
						</div>
					</div>
					{#if i < levelStats.length - 1}
						<div class="level-arrow" aria-hidden="true">
							<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
								<path d="M8 20h22M22 12l10 8-10 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Section 2: Module Timeline -->
	<section class="module-timeline">
		<h2 class="section-title">
			<span class="section-icon">📋</span>
			Module Timeline
			<span class="section-badge">{totalModules} modul</span>
		</h2>

		<div class="timeline-track">
			{#each moduleProgress as mod, i (mod.slug)}
				{@const levelMeta = getLevelMeta(mod.level)}
				{@const prevLevel = i > 0 ? moduleProgress[i - 1].level : null}

				<!-- Level separator -->
				{#if i > 0 && prevLevel !== mod.level}
					<div class="level-separator">
						<div class="separator-line"></div>
						<span class="separator-label" style="--label-color: {levelMeta.color}">
							{levelMeta.icon} {mod.level}
						</span>
					</div>
				{/if}

				<button
					class="timeline-module"
					onclick={() => goToModule(mod.slug)}
					style="--level-color: {levelMeta.color}"
				>
					<div class="timeline-line-connector"></div>
					<div class="timeline-dot" style="background: {levelMeta.color}">
						<span class="timeline-index">{mod.index + 1}</span>
					</div>
					<div class="timeline-card">
						<div class="timeline-card-top">
							<span class="timeline-level-badge" style="background: {levelMeta.color}">
								{levelMeta.icon} {mod.level}
							</span>
							<span class="timeline-sessions">{mod.sessions.length} sesi</span>
						</div>
						<h3 class="timeline-title">{mod.title}</h3>
						<div class="timeline-progress">
							<div class="progress-track">
								<div
									class="progress-fill"
									style="width: {mod.pct}%; background: {levelMeta.color}"
								></div>
							</div>
							<span class="progress-pct">{mod.pct}%</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</section>

	<!-- Section 3: Quick Stats Footer -->
	<section class="stats-footer">
		<div class="stat-card">
			<span class="stat-icon">📦</span>
			<div class="stat-body">
				<span class="stat-value">{totalModules}</span>
				<span class="stat-label">Total Modul</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">📝</span>
			<div class="stat-body">
				<span class="stat-value">{totalSessions}</span>
				<span class="stat-label">Total Sesi</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">⏱️</span>
			<div class="stat-body">
				<span class="stat-value">{estimatedMinutes}</span>
				<span class="stat-label">Perkiraan Menit</span>
			</div>
		</div>
		<div class="stat-card stat-progress">
			<span class="stat-icon">✅</span>
			<div class="stat-body">
				<span class="stat-value">{completedModules}/{totalModules}</span>
				<span class="stat-label">Modul Selesai</span>
			</div>
		</div>
	</section>
</div>

<style>
	/* ─── CSS Variables (dark theme) ─── */
	.path-page {
		--level-beginner: #22c55e;
		--level-intermediate: #3b82f6;
		--level-advanced: #a855f7;
	}

	/* ─── Section 1 — Level Overview ─── */
	.level-overview {
		margin-bottom: 48px;
	}

	.level-cards {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24px;
		position: relative;
	}

	.level-card {
		position: relative;
		flex: 1;
		max-width: 320px;
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--border);
		cursor: default;
		opacity: 0;
		transform: translateY(24px);
		animation: cardEntrance 0.5s ease forwards;
		animation-delay: var(--anim-delay, 0s);
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.level-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
	}

	.level-card-bg {
		position: absolute;
		inset: 0;
		opacity: 0.08;
	}

	.level-card-content {
		position: relative;
		padding: 28px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		z-index: 1;
	}

	.level-icon {
		font-size: 40px;
		line-height: 1;
	}

	.level-name {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.level-meta {
		display: flex;
		gap: 16px;
		margin-top: 4px;
	}

	.level-stat {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.level-stat strong {
		color: var(--text);
		font-weight: 700;
		font-size: 1rem;
	}

	.level-arrow {
		position: absolute;
		right: -36px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-secondary);
		opacity: 0.4;
		z-index: 2;
		pointer-events: none;
	}

	/* ─── Section 2 — Timeline ─── */
	.module-timeline {
		margin-bottom: 48px;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 28px;
	}

	.section-icon {
		font-size: 1.4rem;
	}

	.section-badge {
		margin-left: auto;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--accent-dim);
		color: var(--accent-secondary);
		padding: 4px 12px;
		border-radius: 20px;
	}

	.timeline-track {
		position: relative;
		padding-left: 50px;
		max-height: 70vh;
		overflow-y: auto;
		scroll-snap-type: y proximity;
		padding-right: 8px;
	}

	.timeline-track::-webkit-scrollbar {
		width: 5px;
	}

	.timeline-track::-webkit-scrollbar-track {
		background: transparent;
	}

	.timeline-track::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 3px;
	}

	/* Vertical connecting line */
	.timeline-track::before {
		content: '';
		position: absolute;
		left: 24px;
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
		gap: 16px;
		margin: 20px 0 12px -50px;
		scroll-snap-align: start;
	}

	.separator-line {
		flex: 1;
		height: 2px;
		border-radius: 1px;
		background: var(--border);
	}

	.separator-label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 4px 14px;
		border-radius: 20px;
		background: color-mix(in srgb, var(--label-color) 12%, var(--surface));
		color: var(--label-color);
		white-space: nowrap;
	}

	/* Module entry */
	.timeline-module {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 12px;
		border: none;
		background: none;
		padding: 0;
		width: 100%;
		text-align: left;
		cursor: pointer;
		scroll-snap-align: start;
	}

	.timeline-line-connector {
		position: absolute;
		left: -26px;
		top: 20px;
		width: 14px;
		height: 2px;
		background: var(--border);
	}

	.timeline-dot {
		position: relative;
		z-index: 1;
		width: 36px;
		min-width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 8px;
		transition: transform 0.2s ease;
	}

	.timeline-module:hover .timeline-dot {
		transform: scale(1.15);
	}

	.timeline-index {
		font-size: 0.72rem;
		font-weight: 700;
		color: #fff;
	}

	.timeline-card {
		flex: 1;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 12px 16px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.timeline-module:hover .timeline-card {
		border-color: var(--level-color);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.timeline-card-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.timeline-level-badge {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 10px;
		color: #fff;
		white-space: nowrap;
	}

	.timeline-sessions {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-left: auto;
	}

	.timeline-title {
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 8px;
		line-height: 1.4;
	}

	.timeline-progress {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.progress-track {
		flex: 1;
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.progress-pct {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
		min-width: 30px;
		text-align: right;
	}

	/* ─── Section 3 — Stats Footer ─── */
	.stats-footer {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.stat-icon {
		font-size: 28px;
		line-height: 1;
	}

	.stat-body {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.3rem;
		font-weight: 800;
		color: var(--text);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.78rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.stat-progress .stat-value {
		color: var(--accent);
	}

	/* ─── Animations ─── */
	@keyframes cardEntrance {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ─── Responsive ─── */
	@media (max-width: 900px) {
		.level-cards {
			flex-direction: column;
			gap: 12px;
		}

		.level-card {
			max-width: 100%;
			width: 100%;
		}

		.level-arrow {
			position: relative;
			right: auto;
			top: auto;
			transform: rotate(90deg);
			display: flex;
			justify-content: center;
			padding: 4px 0;
		}

		.stats-footer {
			grid-template-columns: repeat(2, 1fr);
			gap: 20px;
		}
	}

	@media (max-width: 480px) {
		.stats-footer {
			grid-template-columns: 1fr;
		}

		.timeline-track {
			padding-left: 40px;
		}

		.timeline-track::before {
			left: 18px;
		}

		.timeline-line-connector {
			left: -20px;
			width: 10px;
		}

		.timeline-dot {
			width: 30px;
			min-width: 30px;
			height: 30px;
			margin-top: 6px;
		}

		.timeline-index {
			font-size: 0.65rem;
		}
	}
</style>
