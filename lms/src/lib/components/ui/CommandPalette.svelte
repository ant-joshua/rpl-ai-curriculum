<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	interface PaletteItem {
		id: string;
		title: string;
		description: string;
		href: string;
		category: 'Modules' | 'Exercises' | 'Quizzes' | 'Pages';
		keywords: string;
		icon: string;
	}

	let {
		show = false,
		onclose,
	}: {
		show?: boolean;
		onclose?: () => void;
	} = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();

	// Focus input when opened
	$effect(() => {
		if (show && browser) {
			requestAnimationFrame(() => {
				inputEl?.focus();
			});
		} else if (!show) {
			query = '';
			selectedIndex = 0;
		}
	});

	const pages: PaletteItem[] = [
		{ id: 'dashboard', title: 'Dashboard', description: 'Halaman utama', href: '/', category: 'Pages', keywords: 'home beranda dashboard main', icon: '🏠' },
		{ id: 'catalog', title: 'Catalog', description: 'Jelajahi kursus & modul', href: '/catalog', category: 'Modules', keywords: 'catalog courses kursus modul belajar materi', icon: '📚' },
		{ id: 'path', title: 'Learning Path', description: 'Learning path & roadmap', href: '/path', category: 'Modules', keywords: 'path roadmap learning jalur belajar', icon: '🗺️' },
		{ id: 'progress', title: 'Progress', description: 'Progress & kemajuan belajar', href: '/progress', category: 'Modules', keywords: 'progress perkembangan kemajuan', icon: '📈' },
		{ id: 'planner', title: 'Planner', description: 'Kalender & jadwal belajar', href: '/planner', category: 'Pages', keywords: 'planner kalender schedule jadwal', icon: '📅' },
		{ id: 'announcements', title: 'Announcements', description: 'Pengumuman & pesan', href: '/announcements', category: 'Pages', keywords: 'announcements pengumuman messages broadcast info', icon: '📢' },
		{ id: 'search', title: 'Search', description: 'Cari semua materi', href: '/search', category: 'Pages', keywords: 'search cari pencarian find lookup', icon: '🔍' },
		{ id: 'tutor', title: 'AI Tutor', description: 'Tanya jawab dengan AI', href: '/tutor', category: 'Pages', keywords: 'tutor ai tanya jawab bantuan bot', icon: '🤖' },
		{ id: 'flashcards', title: 'Flashcards', description: 'Kartu belajar interaktif', href: '/flashcards', category: 'Quizzes', keywords: 'flashcards kartu quiz kuis hafalan', icon: '🃏' },
		{ id: 'exercises', title: 'Exercises', description: 'Latihan coding', href: '/exercises', category: 'Exercises', keywords: 'exercises latihan coding programming tugas', icon: '💻' },
		{ id: 'challenges', title: 'Challenges', description: 'Tantangan coding', href: '/challenges', category: 'Exercises', keywords: 'challenges tantangan coding lomba', icon: '🏆' },
		{ id: 'mini-projects', title: 'Mini Projects', description: 'Mini proyek praktik', href: '/mini-projects', category: 'Exercises', keywords: 'mini projects proyek kecil praktik', icon: '📦' },
		{ id: 'projects', title: 'Projects', description: 'Proyek portofolio', href: '/projects', category: 'Exercises', keywords: 'projects proyek portofolio final', icon: '🚀' },
		{ id: 'videos', title: 'Videos', description: 'Video pembelajaran', href: '/videos', category: 'Pages', keywords: 'videos video belajar multimedia', icon: '🎬' },
		{ id: 'badges', title: 'Badges', description: 'Lencana prestasi', href: '/badges', category: 'Pages', keywords: 'badges lencana prestasi achievement medal', icon: '🏅' },
		{ id: 'leaderboard', title: 'Leaderboard', description: 'Papan peringkat', href: '/leaderboard', category: 'Pages', keywords: 'leaderboard papan peringkat score ranking', icon: '🏆' },
		{ id: 'glossary', title: 'Glossary', description: 'Glosarium istilah teknis', href: '/glossary', category: 'Pages', keywords: 'glossary glosarium istilah kamus definisi', icon: '📖' },
		{ id: 'insights', title: 'Insights', description: 'Wawasan & analitik', href: '/insights', category: 'Pages', keywords: 'insights wawasan analytics statistik', icon: '💡' },
		{ id: 'study', title: 'Study Timer', description: 'Timer fokus & pomodoro', href: '/study', category: 'Pages', keywords: 'study pomodoro timer fokus waktu belajar', icon: '⏱️' },
		{ id: 'profile', title: 'Profile', description: 'Profil pengguna', href: '/my/profile', category: 'Pages', keywords: 'profile profil user akun', icon: '👤' },
		{ id: 'grades', title: 'Grades', description: 'Nilai & rapor', href: '/my/grades', category: 'Pages', keywords: 'grades nilai rapor academic score', icon: '📊' },
		{ id: 'certificates', title: 'Certificates', description: 'Sertifikat kelulusan', href: '/my/certificates', category: 'Pages', keywords: 'certificates sertifikat kelulusan ijazah', icon: '🎓' },
		{ id: 'settings', title: 'Settings', description: 'Pengaturan akun', href: '/my/settings', category: 'Pages', keywords: 'settings pengaturan config preferences', icon: '⚙️' },
		{ id: 'schedule', title: 'Schedule', description: 'Jadwal pribadi', href: '/my/schedule', category: 'Pages', keywords: 'schedule jadwal agenda', icon: '📋' },
		{ id: 'practice', title: 'Practice', description: 'Latihan mandiri', href: '/my/practice', category: 'Exercises', keywords: 'practice latihan mandiri drill', icon: '✏️' },
		{ id: 'my-progress', title: 'My Progress', description: 'Detail progress pribadi', href: '/my/progress', category: 'Pages', keywords: 'my progress detail pribadi', icon: '📉' },
		{ id: 'my-dashboard', title: 'My Dashboard', description: 'Dashboard pribadi', href: '/my/dashboard', category: 'Pages', keywords: 'my dashboard pribadi custom', icon: '📊' },
	];

	const categories = ['Modules', 'Exercises', 'Quizzes', 'Pages'] as const;

	function matches(item: PaletteItem, q: string): boolean {
		if (!q.trim()) return true;
		const lq = q.toLowerCase();
		return (
			item.title.toLowerCase().includes(lq) ||
			item.description.toLowerCase().includes(lq) ||
			item.keywords.toLowerCase().includes(lq)
		);
	}

	let filteredItems = $derived(pages.filter(p => matches(p, query)));

	// Group by category preserving order
	let grouped = $derived.by(() => {
		const groups: Record<string, PaletteItem[]> = {};
		for (const cat of categories) {
			const items = filteredItems.filter(i => i.category === cat);
			if (items.length > 0) groups[cat] = items;
		}
		return groups;
	});

	// Flat list for keyboard index
	let flatItems = $derived.by(() => {
		const result: PaletteItem[] = [];
		for (const cat of categories) {
			result.push(...filteredItems.filter(i => i.category === cat));
		}
		return result;
	});

	// Reset selection when results change — store flag to allow user override
	let isUserNavigating = $state(false);

	$effect(() => {
		filteredItems;
		if (!isUserNavigating) {
			selectedIndex = 0;
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose?.();
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			isUserNavigating = true;
			selectedIndex = Math.min(selectedIndex + 1, flatItems.length - 1);
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			isUserNavigating = true;
			selectedIndex = Math.max(selectedIndex - 1, 0);
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			const item = flatItems[selectedIndex];
			if (item) navigateTo(item);
			return;
		}
	}

	function navigateTo(item: PaletteItem) {
		onclose?.();
		goto(item.href);
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose?.();
	}

	function categoryLabel(cat: string): string {
		const labels: Record<string, string> = {
			Modules: 'Modul',
			Exercises: 'Latihan',
			Quizzes: 'Kuis',
			Pages: 'Halaman',
		};
		return labels[cat] || cat;
	}

	function categoryColor(cat: string): string {
		const colors: Record<string, string> = {
			Modules: 'badge-module',
			Exercises: 'badge-exercise',
			Quizzes: 'badge-quiz',
			Pages: 'badge-page',
		};
		return colors[cat] || '';
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="palette-overlay"
		onclick={handleOverlayClick}
		transition:fade={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
		aria-label="Command palette"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="palette-modal"
			transition:scale={{ start: 0.95, duration: 200 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Search input -->
			<div class="palette-search">
				<svg class="palette-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
				</svg>
				<input
					bind:this={inputEl}
					type="text"
					class="palette-input"
					placeholder="Cari halaman, modul, latihan..."
					bind:value={query}
					onkeydown={handleKeydown}
					oninput={() => { isUserNavigating = false; }}
					aria-label="Search pages and content"
					spellcheck="false"
					autocomplete="off"
				/>
				<div class="palette-input-hints">
					<kbd>Esc</kbd>
				</div>
			</div>

			<!-- Results -->
			<div class="palette-results" class:palette-results--empty={flatItems.length === 0}>
				{#if flatItems.length === 0}
					<div class="palette-empty">
						<span class="palette-empty-icon">😕</span>
						<span class="palette-empty-text">Tidak ada hasil untuk "{query}"</span>
					</div>
				{:else}
					{#each categories as cat}
						{@const items = filteredItems.filter(i => i.category === cat)}
						{#if items.length > 0}
							<div class="palette-group">
								<div class="palette-group-label">{categoryLabel(cat)}</div>
								{#each items as item (item.id)}
									{@const flatIdx = flatItems.indexOf(item)}
									<button
										class="palette-item"
										class:palette-item--selected={flatIdx === selectedIndex}
										onclick={() => navigateTo(item)}
										onmouseenter={() => { selectedIndex = flatIdx; isUserNavigating = true; }}
										type="button"
									>
										<span class="palette-item-icon">{item.icon}</span>
										<div class="palette-item-text">
											<span class="palette-item-title">{item.title}</span>
											<span class="palette-item-desc">{item.description}</span>
										</div>
										<span class="palette-item-badge {categoryColor(item.category)}">{categoryLabel(item.category)}</span>
									</button>
								{/each}
							</div>
						{/if}
					{/each}
				{/if}
			</div>

			<!-- Footer keyboard hints -->
			<div class="palette-footer">
				<div class="palette-footer-hints">
					<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
					<span><kbd>⏎</kbd> Open</span>
					<span><kbd>Esc</kbd> Close</span>
				</div>
				{#if query.trim()}
					<span class="palette-footer-count">{flatItems.length} hasil</span>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		padding-top: 12vh;
	}

	.palette-modal {
		width: 100%;
		max-width: 580px;
		background: #ffffff;
		border: 1px solid #E2E8F0;
		border-radius: 16px;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.04),
			0 8px 32px rgba(0, 0, 0, 0.12),
			0 24px 64px rgba(0, 0, 0, 0.08);
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: palette-in 0.15s ease;
	}

	@keyframes palette-in {
		from { opacity: 0; transform: translateY(-8px) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* ===== Search input ===== */
	.palette-search {
		position: relative;
		display: flex;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 1px solid #E2E8F0;
		flex-shrink: 0;
	}

	.palette-search-icon {
		position: absolute;
		left: 20px;
		color: #94a3b8;
		pointer-events: none;
		flex-shrink: 0;
	}

	.palette-input {
		width: 100%;
		padding: 10px 80px 10px 36px;
		font-size: 16px;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-weight: 500;
		color: #1a1a2e;
		background: transparent;
		border: none;
		outline: none;
		line-height: 1.4;
	}

	.palette-input::placeholder {
		color: #94a3b8;
		font-weight: 400;
	}

	.palette-input-hints {
		position: absolute;
		right: 20px;
		display: flex;
		align-items: center;
		gap: 4px;
		pointer-events: none;
		flex-shrink: 0;
	}

	.palette-input-hints kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 24px;
		padding: 0 6px;
		font-size: 11px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-weight: 600;
		color: #94a3b8;
		background: #F1F5F9;
		border: 1px solid #E2E8F0;
		border-radius: 5px;
		line-height: 1;
	}

	/* ===== Results ===== */
	.palette-results {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
		scroll-behavior: smooth;
	}

	.palette-results--empty {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
	}

	.palette-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 32px;
		color: #94a3b8;
	}

	.palette-empty-icon {
		font-size: 28px;
	}

	.palette-empty-text {
		font-size: 14px;
		font-weight: 500;
	}

	/* ===== Category group ===== */
	.palette-group {
		padding: 4px 0;
	}

	.palette-group-label {
		font-size: 11px;
		font-weight: 600;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 8px 20px 4px;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* ===== Item ===== */
	.palette-item {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 8px 20px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
		font-family: inherit;
	}

	.palette-item:hover,
	.palette-item--selected {
		background: rgba(79, 70, 229, 0.08);
	}

	.palette-item-icon {
		font-size: 18px;
		width: 28px;
		text-align: center;
		flex-shrink: 0;
		line-height: 1;
	}

	.palette-item-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.palette-item-title {
		font-size: 14px;
		font-weight: 590;
		color: #1a1a2e;
		font-feature-settings: 'cv01', 'ss03';
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.palette-item-desc {
		font-size: 12px;
		color: #94a3b8;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.palette-item-badge {
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 500;
		padding: 2px 8px;
		border-radius: 20px;
		line-height: 1.4;
		letter-spacing: 0.01em;
	}

	.badge-module {
		background: rgba(79, 70, 229, 0.1);
		color: #4F46E5;
	}

	.badge-exercise {
		background: rgba(34, 197, 94, 0.1);
		color: #16A34A;
	}

	.badge-quiz {
		background: rgba(245, 158, 11, 0.1);
		color: #D97706;
	}

	.badge-page {
		background: rgba(100, 116, 139, 0.1);
		color: #475569;
	}

	/* ===== Footer ===== */
	.palette-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 20px;
		border-top: 1px solid #E2E8F0;
		flex-shrink: 0;
	}

	.palette-footer-hints {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.palette-footer-hints span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: #94a3b8;
	}

	.palette-footer-hints kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		font-size: 10px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-weight: 600;
		color: #94a3b8;
		background: #F1F5F9;
		border: 1px solid #E2E8F0;
		border-radius: 4px;
		line-height: 1;
	}

	.palette-footer-count {
		font-size: 11px;
		color: #94a3b8;
	}

	/* ===== Scrollbar ===== */
	.palette-results::-webkit-scrollbar {
		width: 6px;
	}
	.palette-results::-webkit-scrollbar-track {
		background: transparent;
	}
	.palette-results::-webkit-scrollbar-thumb {
		background: #E2E8F0;
		border-radius: 3px;
	}
	.palette-results::-webkit-scrollbar-thumb:hover {
		background: #CBD5E1;
	}

	/* ===== Mobile: fullscreen ===== */
	@media (max-width: 768px) {
		.palette-overlay {
			padding: 0;
			align-items: stretch;
			background: rgba(0, 0, 0, 0.5);
		}

		.palette-modal {
			max-width: 100%;
			max-height: 100%;
			border-radius: 0;
			border: none;
			margin-top: 60px;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
		}

		.palette-input {
			font-size: 15px;
		}
	}
</style>
