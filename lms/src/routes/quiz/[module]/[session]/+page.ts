import type { PageLoad } from './$types';

interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

interface QuizSession {
	session_id: string;
	questions: QuizQuestion[];
}

interface QuizModule {
	module_slug: string;
	sessions: QuizSession[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	const { module: moduleSlug, session: sessionId } = params;

	try {
		const res = await fetch('/content/quiz.json');
		const quizData: QuizModule[] = await res.json();

		const mod = quizData.find(q => q.module_slug === moduleSlug);
		if (!mod) {
			return { questions: [], moduleSlug, sessionId, error: 'Module not found' };
		}

		// Match by session_id — try exact first, then fallback to matching by title
		let sessionData = mod.sessions.find(s => s.session_id === sessionId);
		if (!sessionData) {
			// Try matching against any session that has this as a title fragment
			sessionData = mod.sessions.find(s => s.session_id.toLowerCase().replace(/\s+/g, '-') === sessionId.toLowerCase());
		}

		if (!sessionData) {
			return { questions: [], moduleSlug, sessionId, error: 'Session not found in quiz data' };
		}

		return {
			questions: sessionData.questions,
			moduleSlug,
			sessionId,
			error: null,
		};
	} catch (e) {
		return { questions: [], moduleSlug, sessionId, error: 'Failed to load quiz data' };
	}
};
