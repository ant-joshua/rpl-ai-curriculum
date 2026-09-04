// AI Complete Course — 19 modules
// Source: lms/content/slides/ai-course/

export interface AiModule {
	slug: string;
	index: number;
	title: string;
	description: string;
	icon: string;
	level: 'Pemula' | 'Intermediate' | 'Advanced';
	duration: string;
}

export const aiModules: AiModule[] = [
	{
		slug: '01-apa-itu-ai',
		index: 1,
		title: 'Apa itu AI?',
		description: 'Definisi, cara kerja, model-model AI populer, mitos vs fakta.',
		icon: '🤖',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '02-jenis-jenis-ai',
		index: 2,
		title: 'Jenis-jenis AI',
		description: 'Text, image, audio, multimodal — serta supervised, unsupervised, RLHF.',
		icon: '🧬',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '03-cara-pakai-ai',
		index: 3,
		title: 'Cara Pakai AI',
		description: 'Step-by-step: pilih platform, buat account, mulai ngobrol.',
		icon: '🚀',
		level: 'Pemula',
		duration: '20 menit',
	},
	{
		slug: '04-prompt-engineering-dasar',
		index: 4,
		title: 'Prompt Engineering Dasar',
		description: '10 teknik prompting: zero-shot, few-shot, CoT, CRISPE framework.',
		icon: '✍️',
		level: 'Intermediate',
		duration: '45 menit',
	},
	{
		slug: '05-prompt-engineering-lanjutan',
		index: 5,
		title: 'Prompt Engineering Lanjutan',
		description: 'Tree of Thought, ReAct, meta-prompting, anti-hallucination.',
		icon: '🧠',
		level: 'Advanced',
		duration: '60 menit',
	},
	{
		slug: '06-ai-agents',
		index: 6,
		title: 'AI Agents',
		description: 'Agent vs chat biasa, cara kerja, tools, function calling, multi-agent.',
		icon: '⚙️',
		level: 'Advanced',
		duration: '45 menit',
	},
	{
		slug: '07-use-case-seharihari',
		index: 7,
		title: 'Use Case Sehari-hari',
		description: 'Masak, keuangan, jadwal, komunikasi, brainstorming, hiburan.',
		icon: '🏠',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '08-use-case-smk',
		index: 8,
		title: 'Use Case SMK & Sekolah',
		description: 'Belajar, praktikum, debug, proposal, PKL, CV, interview.',
		icon: '🎒',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '09-use-case-kuliah',
		index: 9,
		title: 'Use Case Kuliah',
		description: 'Jurnal, makalah, data, skripsi, organisasi kampus.',
		icon: '🎓',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '10-use-case-kerja',
		index: 10,
		title: 'Use Case Kerja & Profesional',
		description: 'Email, meeting, laporan, data analysis, manajemen proyek.',
		icon: '💼',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '11-ai-untuk-coding-dasar',
		index: 11,
		title: 'AI untuk Coding (Pemula)',
		description: 'Belajar syntax, debug, function, CRUD app pertama.',
		icon: '💻',
		level: 'Intermediate',
		duration: '45 menit',
	},
	{
		slug: '12-ai-untuk-coding-lanjutan',
		index: 12,
		title: 'AI untuk Coding (Lanjutan)',
		description: 'Refactoring, architecture, DB schema, full-stack building.',
		icon: '🏗️',
		level: 'Advanced',
		duration: '60 menit',
	},
	{
		slug: '13-ai-untuk-presentasi',
		index: 13,
		title: 'AI untuk Presentasi',
		description: 'Outline, konten, speaker notes, desain, pitch deck.',
		icon: '📊',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '14-ai-untuk-desain-grafis',
		index: 14,
		title: 'AI untuk Desain Grafis',
		description: 'Canva AI, Midjourney, DALL-E, Figma, logo, social media.',
		icon: '🎨',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '15-ai-untuk-data-science',
		index: 15,
		title: 'AI untuk Data Science',
		description: 'Pandas, matplotlib, statistical analysis, ML basics, dashboard.',
		icon: '📈',
		level: 'Advanced',
	duration: '45 menit',
	},
	{
		slug: '16-ai-untuk-bahasa-asing',
		index: 16,
		title: 'AI untuk Bahasa Asing',
		description: 'Conversation, grammar, vocabulary, TOEFL/IELTS prep.',
		icon: '🌍',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '17-ai-untuk-osint-research',
		index: 17,
		title: 'AI untuk OSINT & Research',
		description: 'Perplexity, fact-checking, literature review, market research.',
		icon: '🔍',
		level: 'Intermediate',
		duration: '35 menit',
	},
	{
		slug: '18-ai-untuk-video-musik',
		index: 18,
		title: 'AI untuk Video & Musik',
		description: 'CapCut AI, Runway, Suno, podcast, script writing.',
		icon: '🎬',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '19-ai-ethics-safety',
		index: 19,
		title: 'AI Ethics & Safety',
		description: 'Deepfakes, bias, privacy, regulasi, responsible AI use.',
		icon: '⚖️',
		level: 'Pemula',
		duration: '30 menit',
	},
];

export function getAiModule(slug: string): AiModule | undefined {
	return aiModules.find(m => m.slug === slug);
}

export function getNextModule(slug: string): AiModule | undefined {
	const idx = aiModules.findIndex(m => m.slug === slug);
	return idx >= 0 && idx < aiModules.length - 1 ? aiModules[idx + 1] : undefined;
}

export function getPrevModule(slug: string): AiModule | undefined {
	const idx = aiModules.findIndex(m => m.slug === slug);
	return idx > 0 ? aiModules[idx - 1] : undefined;
}
