import type { PageLoad } from './$types';
import { modules } from '$lib/stores/modules';

interface Question {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
	const blockId = parseInt(params.id, 10);
	const blockSize = 5;
	const totalModules = modules.length;
	const totalBlocks = Math.ceil(totalModules / blockSize);

	if (isNaN(blockId) || blockId < 0 || blockId >= totalBlocks) {
		return { questions: [], blockId, error: 'Invalid block' };
	}

	const start = blockId * blockSize;
	const end = Math.min(start + blockSize, totalModules);
	const blockMods = modules.slice(start, end);

	try {
		const res = await fetch('/content/quiz.json');
		const quizData: any[] = await res.json();

		// Collect all questions from all sessions in these modules
		const allQuestions: Question[] = [];
		for (const mod of blockMods) {
			const qmod = quizData.find(q => q.module_slug === mod.slug);
			if (!qmod) continue;
			for (const session of qmod.sessions) {
				for (const q of session.questions) {
					allQuestions.push(q);
				}
			}
		}

		// Shuffle and pick 10 (or all if less)
		const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, 10);

		return { questions: selected, blockId, error: null };
	} catch {
		return { questions: [], blockId, error: 'Failed to load questions' };
	}
};
