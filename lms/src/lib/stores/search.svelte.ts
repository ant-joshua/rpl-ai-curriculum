import { modules, type Module } from './modules';

export interface SearchResult {
	slug: string;
	dirName: string;
	title: string;
	matchType: 'module' | 'session' | 'content' | 'exercise' | 'video' | 'flashcard' | 'project';
	matchPreview: string;
	sessionId?: string;
	moduleSlug?: string;
	difficulty?: string;
}

export interface GroupedSearchResults {
	modules: SearchResult[];
	sessions: SearchResult[];
	contents: SearchResult[];
	exercises: SearchResult[];
	videos: SearchResult[];
	flashcards: SearchResult[];
	projects: SearchResult[];
	total: number;
}

const contentCache = new Map<string, Record<string, string>>();
const pendingFetches = new Map<string, Promise<Record<string, string> | null>>();
let exercisesCache: any[] | null = null;
let videosCache: Record<string, { title: string; videos: { id: string; title: string; duration?: string }[] }> | null = null;
let projectsCache: any[] | null = null;
let flashcardsCache: Record<string, { title: string; dirName: string; quizCount: number; questions: { question: string; answer: string }[] }> | null = null;

async function getContent(dirName: string): Promise<Record<string, string> | null> {
	if (contentCache.has(dirName)) return contentCache.get(dirName)!;
	if (pendingFetches.has(dirName)) return pendingFetches.get(dirName)!;

	const promise = (async () => {
		try {
			const res = await fetch(`/content/${dirName}.json`);
			if (!res.ok) {
				contentCache.set(dirName, {});
				return null;
			}
			const data: Record<string, string> = await res.json();
			contentCache.set(dirName, data);
			return data;
		} catch {
			contentCache.set(dirName, {});
			return null;
		}
	})();

	pendingFetches.set(dirName, promise);
	return promise;
}

async function getExercises(): Promise<any[]> {
	if (exercisesCache) return exercisesCache;
	try {
		const res = await fetch('/content/exercises.json');
		if (!res.ok) return [];
		const data = await res.json();
		exercisesCache = data.exercises || [];
		return exercisesCache;
	} catch {
		return [];
	}
}

async function getVideos(): Promise<Record<string, { title: string; videos: { id: string; title: string; duration?: string }[] }>> {
	if (videosCache) return videosCache;
	try {
		const res = await fetch('/content/videos.json');
		if (!res.ok) return {};
		const data = await res.json();
		videosCache = data.modules || {};
		return videosCache;
	} catch {
		return {};
	}
}

async function getProjects(): Promise<any[]> {
	if (projectsCache) return projectsCache;
	try {
		const res = await fetch('/content/projects.json');
		if (!res.ok) return [];
		const data = await res.json();
		projectsCache = Array.isArray(data) ? data : [];
		return projectsCache;
	} catch {
		return [];
	}
}

async function getFlashcards(): Promise<Record<string, { title: string; dirName: string; quizCount: number; questions: { question: string; answer: string }[] }>> {
	if (flashcardsCache) return flashcardsCache;
	try {
		const res = await fetch('/content/quiz-index.json');
		if (!res.ok) return {};
		const data = await res.json();
		flashcardsCache = data || {};
		return flashcardsCache;
	} catch {
		return {};
	}
}

function highlightMatch(text: string, query: string): string {
	if (!text || !query) return text || '';
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();
	const idx = lowerText.indexOf(lowerQuery);
	if (idx < 0) return text.slice(0, 200);
	const start = Math.max(0, idx - 40);
	const end = Math.min(text.length, idx + query.length + 100);
	let preview = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
	const lowerPreview = preview.toLowerCase();
	const matchIdx = lowerPreview.indexOf(lowerQuery);
	if (matchIdx >= 0) {
		preview = preview.slice(0, matchIdx) +
			'<mark>' + preview.slice(matchIdx, matchIdx + query.length) + '</mark>' +
			preview.slice(matchIdx + query.length);
	}
	return preview;
}

/**
 * Search modules, sessions, content, exercises, videos, and flashcards.
 * Returns grouped results with total count.
 * Supports filtering by type via the filter param.
 */
export async function searchModules(query: string, filterType?: string): Promise<GroupedSearchResults> {
	const q = query.toLowerCase().trim();
	if (!q) return { modules: [], sessions: [], contents: [], exercises: [], videos: [], flashcards: [], total: 0 };

	const grouped: GroupedSearchResults = {
		modules: [],
		sessions: [],
		contents: [],
		exercises: [],
		videos: [],
		flashcards: [],
		projects: [],
		total: 0,
	};

	const modulesToFetch: Module[] = [];

	// — Search modules & sessions —
	for (const mod of modules) {
		const titleLower = mod.title.toLowerCase();
		const descLower = mod.description.toLowerCase();

		// Module title & description match
		if ((!filterType || filterType === 'module') && (titleLower.includes(q) || descLower.includes(q))) {
			grouped.modules.push({
				slug: mod.slug,
				dirName: mod.dirName,
				title: mod.title,
				matchType: 'module',
				matchPreview: mod.description.slice(0, 150),
			});
		}

		// Session title match
		if (!filterType || filterType === 'session') {
			for (const session of mod.sessions) {
				if (session.title.toLowerCase().includes(q)) {
					grouped.sessions.push({
						slug: mod.slug,
						dirName: mod.dirName,
						title: session.title,
						matchType: 'session',
						matchPreview: mod.title,
						sessionId: session.id,
					});
				}
			}
		}

		// Queue content fetch if not cached
		if (!contentCache.has(mod.dirName)) {
			modulesToFetch.push(mod);
		}
	}

	// — Fetch uncached content in parallel —
	if (modulesToFetch.length > 0) {
		await Promise.all(modulesToFetch.map((m) => getContent(m.dirName)));
	}

	// — Search session content —
	if (!filterType || filterType === 'content') {
		for (const mod of modules) {
			const content = contentCache.get(mod.dirName);
			if (!content) continue;

			for (const [key, text] of Object.entries(content)) {
				const lowerText = text.toLowerCase();
				if (lowerText.includes(q)) {
					const matchingSession = mod.sessions.find((s) => s.id === key);
					grouped.contents.push({
						slug: mod.slug,
						dirName: mod.dirName,
						title: matchingSession?.title ?? key,
						matchType: 'content',
						matchPreview: highlightMatch(text, q),
						sessionId: key,
					});
				}
			}
		}
	}

	// — Search exercises —
	if (!filterType || filterType === 'exercise') {
		const exercises = await getExercises();
		for (const ex of exercises) {
			const titleLower = ex.title.toLowerCase();
			const descLower = (ex.description || '').toLowerCase();
			if (titleLower.includes(q) || descLower.includes(q)) {
				grouped.exercises.push({
					slug: ex.slug,
					dirName: '',
					title: ex.title,
					matchType: 'exercise',
					matchPreview: highlightMatch(ex.description || '', q),
					moduleSlug: ex.moduleSlug,
					difficulty: ex.difficulty,
				});
			}
		}
	}

	// — Search videos —
	if (!filterType || filterType === 'video') {
		const videos = await getVideos();
		for (const [moduleSlug, modData] of Object.entries(videos)) {
			for (const video of modData.videos) {
				if (video.title.toLowerCase().includes(q)) {
					grouped.videos.push({
						slug: moduleSlug,
						dirName: '',
						title: video.title,
						matchType: 'video',
						matchPreview: `Video · ${video.duration || ''} · ${modData.title}`,
						moduleSlug: moduleSlug,
					});
				}
			}
		}
	}

	// — Search projects —
	if (!filterType || filterType === 'project') {
		const projects = await getProjects();
		for (const p of projects) {
			const titleLower = p.title.toLowerCase();
			const descLower = (p.description || '').toLowerCase();
			const techsLower = (Array.isArray(p.techs) ? p.techs.join(' ') : '').toLowerCase();
			if (titleLower.includes(q) || descLower.includes(q) || techsLower.includes(q)) {
				grouped.projects.push({
					slug: p.slug,
					dirName: '',
					title: p.title,
					matchType: 'project',
					matchPreview: highlightMatch(p.description || '', q),
					difficulty: p.difficulty,
				});
			}
		}
	}

	// — Search flashcards —
	if (!filterType || filterType === 'flashcard') {
		const quizIndex = await getFlashcards();
		for (const [, modData] of Object.entries(quizIndex)) {
			for (const flashQ of modData.questions) {
				if (flashQ.question.toLowerCase().includes(q)) {
					const slug = modData.dirName.replace(/^\d{2}-/, '');
					grouped.flashcards.push({
						slug,
						dirName: modData.dirName,
						title: flashQ.question,
						matchType: 'flashcard',
						matchPreview: `🃏 ${flashQ.answer}`,
						moduleSlug: slug,
					});
				}
			}
		}
	}

	// — Compute total and cap per-group —
	const MAX_PER_GROUP = 10;
	for (const key of ['modules', 'sessions', 'contents', 'exercises', 'videos', 'flashcards', 'projects'] as const) {
		if (grouped[key].length > MAX_PER_GROUP) {
			grouped[key] = grouped[key].slice(0, MAX_PER_GROUP);
		}
	}

	grouped.total = grouped.modules.length + grouped.sessions.length + grouped.contents.length +
		grouped.exercises.length + grouped.videos.length + grouped.flashcards.length + grouped.projects.length;

	return grouped;
}
