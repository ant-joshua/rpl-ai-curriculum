// AI Complete Course — 19 modules + exercises
// Source: lms/content/slides/ai-course/

export interface AiModule {
	slug: string;
	exerciseSlug: string;
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
		exerciseSlug: '01-latihan-pengenalan-ai',
		index: 1,
		title: 'Apa itu AI?',
		description: 'Definisi, cara kerja, model-model AI populer, mitos vs fakta.',
		icon: '🤖',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '02-jenis-jenis-ai',
		exerciseSlug: '02-latihan-jenis-ai',
		index: 2,
		title: 'Jenis-jenis AI',
		description: 'Text, image, audio, multimodal — serta supervised, unsupervised, RLHF.',
		icon: '🧬',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '03-cara-pakai-ai',
		exerciseSlug: '03-latihan-cara-pakai',
		index: 3,
		title: 'Cara Pakai AI',
		description: 'Step-by-step: pilih platform, buat account, mulai ngobrol.',
		icon: '🚀',
		level: 'Pemula',
		duration: '20 menit',
	},
	{
		slug: '04-prompt-engineering-dasar',
		exerciseSlug: '04-latihan-prompt-dasar',
		index: 4,
		title: 'Prompt Engineering Dasar',
		description: '10 teknik prompting: zero-shot, few-shot, CoT, CRISPE framework.',
		icon: '✍️',
		level: 'Intermediate',
		duration: '45 menit',
	},
	{
		slug: '05-prompt-engineering-lanjutan',
		exerciseSlug: '05-latihan-prompt-lanjutan',
		index: 5,
		title: 'Prompt Engineering Lanjutan',
		description: 'Tree of Thought, ReAct, meta-prompting, anti-hallucination.',
		icon: '🧠',
		level: 'Advanced',
		duration: '60 menit',
	},
	{
		slug: '06-ai-agents',
		exerciseSlug: '06-latihan-agents',
		index: 6,
		title: 'AI Agents',
		description: 'Agent vs chat biasa, cara kerja, tools, function calling, multi-agent.',
		icon: '⚙️',
		level: 'Advanced',
		duration: '45 menit',
	},
	{
		slug: '07-use-case-seharihari',
		exerciseSlug: '07-latihan-seharihari',
		index: 7,
		title: 'Use Case Sehari-hari',
		description: 'Masak, keuangan, jadwal, komunikasi, brainstorming, hiburan.',
		icon: '🏠',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '08-use-case-smk',
		exerciseSlug: '08-latihan-smk',
		index: 8,
		title: 'Use Case SMK & Sekolah',
		description: 'Belajar, praktikum, debug, proposal, PKL, CV, interview.',
		icon: '🎒',
		level: 'Pemula',
		duration: '30 menit',
	},
	{
		slug: '09-use-case-kuliah',
		exerciseSlug: '09-latihan-kuliah',
		index: 9,
		title: 'Use Case Kuliah',
		description: 'Jurnal, makalah, data, skripsi, organisasi kampus.',
		icon: '🎓',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '10-use-case-kerja',
		exerciseSlug: '10-latihan-kerja',
		index: 10,
		title: 'Use Case Kerja & Profesional',
		description: 'Email, meeting, laporan, data analysis, manajemen proyek.',
		icon: '💼',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '11-ai-untuk-coding-dasar',
		exerciseSlug: '11-latihan-coding-dasar',
		index: 11,
		title: 'AI untuk Coding (Pemula)',
		description: 'Belajar syntax, debug, function, CRUD app pertama.',
		icon: '💻',
		level: 'Intermediate',
		duration: '45 menit',
	},
	{
		slug: '12-ai-untuk-coding-lanjutan',
		exerciseSlug: '12-latihan-coding-lanjutan',
		index: 12,
		title: 'AI untuk Coding (Lanjutan)',
		description: 'Refactoring, architecture, DB schema, full-stack building.',
		icon: '🏗️',
		level: 'Advanced',
		duration: '60 menit',
	},
	{
		slug: '13-ai-untuk-presentasi',
		exerciseSlug: '13-latihan-presentasi',
		index: 13,
		title: 'AI untuk Presentasi',
		description: 'Outline, konten, speaker notes, desain, pitch deck.',
		icon: '📊',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '14-ai-untuk-desain-grafis',
		exerciseSlug: '14-latihan-desain',
		index: 14,
		title: 'AI untuk Desain Grafis',
		description: 'Canva AI, Midjourney, DALL-E, Figma, logo, social media.',
		icon: '🎨',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '15-ai-untuk-data-science',
		exerciseSlug: '15-latihan-data-science',
		index: 15,
		title: 'AI untuk Data Science',
		description: 'Pandas, matplotlib, statistical analysis, ML basics, dashboard.',
		icon: '📈',
		level: 'Advanced',
		duration: '45 menit',
	},
	{
		slug: '16-ai-untuk-bahasa-asing',
		exerciseSlug: '16-latihan-bahasa',
		index: 16,
		title: 'AI untuk Bahasa Asing',
		description: 'Conversation, grammar, vocabulary, TOEFL/IELTS prep.',
		icon: '🌍',
		level: 'Pemula',
		duration: '25 menit',
	},
	{
		slug: '17-ai-untuk-osint-research',
		exerciseSlug: '17-latihan-research',
		index: 17,
		title: 'AI untuk OSINT & Research',
		description: 'Perplexity, fact-checking, literature review, market research.',
		icon: '🔍',
		level: 'Intermediate',
		duration: '35 menit',
	},
	{
		slug: '18-ai-untuk-video-musik',
		exerciseSlug: '18-latihan-video-musik',
		index: 18,
		title: 'AI untuk Video & Musik',
		description: 'CapCut AI, Runway, Suno, podcast, script writing.',
		icon: '🎬',
		level: 'Intermediate',
		duration: '30 menit',
	},
	{
		slug: '19-ai-ethics-safety',
		exerciseSlug: '19-latihan-ethics',
		index: 19,
		title: 'AI Ethics & Safety',
		description: 'Deepfakes, bias, privacy, regulasi, responsible AI use.',
		icon: '⚖️',
		level: 'Pemula',
		duration: '30 menit',
	},
];

export const finalProject = {
	slug: '20-final-project',
	title: 'Final Project',
	description: 'Pilih 1 dari 5 project untuk mendemonstrasikan pemahaman AI kamu.',
	icon: '🏆',
};

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
