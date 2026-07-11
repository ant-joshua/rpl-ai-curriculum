export interface QuizQuestion {
	question: string;
	options: string[];
	correctIndex: number;
	explanation?: string;
}

/**
 * Parse quiz content from markdown/frontmatter HTML quiz blocks.
 * Handles the format used in quiz.md files across all modules:
 *
 * ```md
 * <div class="quiz">
 *
 * **1. Apa singkatan dari API?**
 *
 * - [ ] Application Programming Integration
 * - [x] Application Programming Interface
 * - [ ] Automated Program Interface
 * - [ ] Application Protocol Interface
 * ...
 * </div>
 * ```
 */
export function parseQuizHtml(markdown: string): QuizQuestion[] {
	const questions: QuizQuestion[] = [];

	// Extract content inside <div class="quiz"> ... </div>
	const quizRegex = /<div\s+class="quiz"[^>]*>([\s\S]*?)<\/div>/gi;
	let match: RegExpExecArray | null;

	while ((match = quizRegex.exec(markdown)) !== null) {
		const quizContent = match[1];
		const parsed = parseQuizBlock(quizContent);
		questions.push(...parsed);
	}

	return questions;
}

/**
 * Parse a single quiz div's inner content.
 * Splits by question headers (**N. ...**) and collects options.
 */
function parseQuizBlock(html: string): QuizQuestion[] {
	const questions: QuizQuestion[] = [];

	// Split on question markers: **N. ...**
	// We match ** optionally preceded by whitespace, with a number and dot
	const questionRegex = /\*\*(\d+)[.)]\s*(.*?)\*\*/g;
	const segments: { num: number; question: string; rest: string }[] = [];

	let lastIndex = 0;
	let qMatch: RegExpExecArray | null;

	while ((qMatch = questionRegex.exec(html)) !== null) {
		const num = parseInt(qMatch[1], 10);
		const question = qMatch[2].trim();
		const startIdx = qMatch.index + qMatch[0].length;

		// The content between this question and the next one contains options
		const nextMatch = questionRegex.exec(html);
		// Reset lastIndex to avoid skipping
		questionRegex.lastIndex = startIdx;

		// Find the next question or end of string
		const nextQMatch = questionRegex.exec(html);
		const endIdx = nextQMatch ? nextQMatch.index : html.length;

		// Reset lastIndex so outer loop continues correctly
		questionRegex.lastIndex = endIdx;

		const rest = html.slice(startIdx, endIdx).trim();

		segments.push({ num, question, rest });
	}

	for (const seg of segments) {
		const options = parseOptions(seg.rest);
		const correctIndex = options.findIndex((o) => o.correct);

		if (options.length > 0) {
			questions.push({
				question: seg.question,
				options: options.map((o) => o.text),
				correctIndex: correctIndex >= 0 ? correctIndex : 0, // fallback to first
			});
		}
	}

	return questions;
}

interface OptionItem {
	text: string;
	correct: boolean;
}

/**
 * Parse list items like:
 * - [ ] text
 * - [x] text
 */
function parseOptions(html: string): OptionItem[] {
	const options: OptionItem[] = [];

	// Match - [ ] or - [x] lines
	const optionRegex = /-\s*\[\s*(x|X|\s)?\s*\]\s*(.*?)$/gm;
	let match: RegExpExecArray | null;

	while ((match = optionRegex.exec(html)) !== null) {
		const isCorrect = match[1]?.toLowerCase() === 'x';
		const text = match[2].trim();
		if (text) {
			options.push({ text, correct: isCorrect });
		}
	}

	return options;
}
