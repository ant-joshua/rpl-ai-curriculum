// Video entries parsed from curriculum — both planned and published.
// Source: video-guide/README.md + actual YouTube links found in curriculum content.
//
// When videos are published, add the real YouTube URL here.
// The moduleSlug maps to the module slug in modules.ts.

export interface VideoEntry {
	moduleSlug?: string;
	title: string;
	url?: string; // empty until published
	platform: 'youtube' | 'other' | 'planned';
	description?: string;
	duration?: string;
	sessionId?: string;
}

/**
 * All video entries for the curriculum.
 * Sourced from video-guide/README.md "Struktur Video per Modul" section.
 *
 * Wave 1 — Fundamental (Modul 00-07)
 *
 * When a video is published on YouTube, set its `url` and `platform: 'youtube'`.
 */
export const videos: VideoEntry[] = [
	// ── Modul 00 — Pengenalan ────────────────────────────────────
	{
		moduleSlug: 'fundamentals',
		title: 'Apa itu RPL AI?',
		description: 'Kurikulum, tujuan, learning path — Tour curriculum, install tools',
		duration: '8 min',
		platform: 'planned',
		sessionId: '00-how-to-learn',
	},
	{
		moduleSlug: 'fundamentals',
		title: 'Setup Environment',
		description: 'Terminal, VS Code, Node.js, Git — Install semua tools dari 0',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-internet-http',
	},
	{
		moduleSlug: 'fundamentals',
		title: 'Cara Belajar Efektif',
		description: 'Active recall, project-based, pomodoro — Bikin study plan',
		duration: '6 min',
		platform: 'planned',
		sessionId: '02-api-database-deploy',
	},
	{
		moduleSlug: 'fundamentals',
		title: 'Tools Overview',
		description: 'VS Code extensions, terminal, ChatGPT — Bikin workspace + productivity setup',
		duration: '8 min',
		platform: 'planned',
	},

	// ── Modul 01 — JavaScript Dasar ──────────────────────────────
	{
		moduleSlug: 'js-fundamentals',
		title: 'Variable & Tipe Data',
		description: 'let/const, string, number, boolean, null/undefined — Console log berbagai tipe',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-variables-types',
	},
	{
		moduleSlug: 'js-fundamentals',
		title: 'Function & Scope',
		description: 'Function declaration, arrow function, closure — Bikin kalkulator sederhana',
		duration: '12 min',
		platform: 'planned',
		sessionId: '04-functions',
	},
	{
		moduleSlug: 'js-fundamentals',
		title: 'Array & Object',
		description: 'Array methods (map, filter, reduce), object spread — Manipulasi data array mahasiswa',
		duration: '12 min',
		platform: 'planned',
		sessionId: '03-arrays-objects',
	},
	{
		moduleSlug: 'js-fundamentals',
		title: 'Async JavaScript',
		description: 'Callback, Promise, async/await, try/catch — Fetch data dari API publik',
		duration: '14 min',
		platform: 'planned',
		sessionId: '05-async-errors',
	},

	// ── Modul 02 — TypeScript ───────────────────────────────────
	{
		moduleSlug: 'typescript',
		title: 'Type System',
		description: 'Type annotation, interface, type alias — Migrasi JS → TS',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-basics',
	},
	{
		moduleSlug: 'typescript',
		title: 'Generics & Utility Types',
		description: 'Generic function, Partial, Pick, Omit — Bikin API response type',
		duration: '12 min',
		platform: 'planned',
		sessionId: '03-functions-generics',
	},
	{
		moduleSlug: 'typescript',
		title: 'Advanced Types',
		description: 'Union, intersection, discriminated union, type guard — Bikin state machine',
		duration: '10 min',
		platform: 'planned',
		sessionId: '02-types-interfaces',
	},
	{
		moduleSlug: 'typescript',
		title: 'TypeScript with Node',
		description: 'tsconfig, tsx, build process — Setup TS project dari 0',
		duration: '10 min',
		platform: 'planned',
		sessionId: '04-tsconfig-project',
	},

	// ── Modul 03 — Web Development (HTML/CSS) ───────────────────
	{
		moduleSlug: 'web-basics',
		title: 'HTML Semantic & Accessibility',
		description: 'Semantic tags, ARIA, form validation — Bikin halaman profil',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-html-css',
	},
	{
		moduleSlug: 'web-basics',
		title: 'CSS Layout',
		description: 'Flexbox, Grid, responsive design — Bikin card layout responsive',
		duration: '12 min',
		platform: 'planned',
		sessionId: '01-html-css',
	},
	{
		moduleSlug: 'web-basics',
		title: 'CSS Framework (Tailwind)',
		description: 'Utility-first, config, responsive utility — Rebuild card pake Tailwind',
		duration: '10 min',
		platform: 'planned',
		sessionId: '02-tailwind',
	},
	{
		moduleSlug: 'web-basics',
		title: 'Deploy Website',
		description: 'Vercel, Netlify, custom domain — Deploy portfolio',
		duration: '8 min',
		platform: 'planned',
		sessionId: '03-dom-fetch',
	},

	// ── Modul 04 — Backend Development ──────────────────────────
	{
		moduleSlug: 'node-express',
		title: 'Express.js Dasar',
		description: 'Routes, middleware, request/response — Bikin server hello world',
		duration: '12 min',
		platform: 'planned',
		sessionId: '02-express-api',
	},
	{
		moduleSlug: 'node-express',
		title: 'REST API Design',
		description: 'REST principles, CRUD, status codes — Bikin API notes',
		duration: '12 min',
		platform: 'planned',
		sessionId: '04-rest-crud',
	},
	{
		moduleSlug: 'node-express',
		title: 'Database & ORM',
		description: 'PostgreSQL, Prisma ORM, migration — Connect API ke database',
		duration: '14 min',
		platform: 'planned',
		sessionId: '03-database',
	},
	{
		moduleSlug: 'node-express',
		title: 'Middleware & Security',
		description: 'Auth JWT, CORS, rate limiting, helmet — Proteksi API',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-node-setup',
	},

	// ── Modul 05 — Git & GitHub ─────────────────────────────────
	{
		moduleSlug: 'git-deploy',
		title: 'Git Dasar',
		description: 'init, add, commit, status, log — Buat repo + commit pertama',
		duration: '12 min',
		platform: 'planned',
		sessionId: '01-git-basics',
	},
	{
		moduleSlug: 'git-deploy',
		title: 'Branching & Merge',
		description: 'branch, checkout, merge, conflict — Kerja pake git flow',
		duration: '12 min',
		platform: 'planned',
		sessionId: '02-github-collab',
	},
	{
		moduleSlug: 'git-deploy',
		title: 'Remote & Collaboration',
		description: 'remote, push, pull, PR, fork — Contribusi ke open source',
		duration: '12 min',
		platform: 'planned',
		sessionId: '02-github-collab',
	},
	{
		moduleSlug: 'git-deploy',
		title: 'Git Advanced',
		description: 'rebase, stash, bisect, hooks — Clean up messy history',
		duration: '10 min',
		platform: 'planned',
		sessionId: '03-deploy',
	},

	// ── Modul 06 — Database ─────────────────────────────────────
	// No direct module slug match for a dedicated "Database" module in modules.ts
	// Database topics are spread across node-express, advanced-database etc.
	// We reference the closest match or leave moduleSlug empty.
	{
		title: 'Relational Database',
		description: 'Table, relation, SQL query (SELECT, JOIN) — Query dummy data',
		duration: '12 min',
		platform: 'planned',
	},
	{
		title: 'Prisma ORM',
		description: 'Schema, migration, CRUD — Bikin schema e-commerce',
		duration: '12 min',
		platform: 'planned',
	},
	{
		title: 'Query Optimization',
		description: 'Index, EXPLAIN, N+1 problem — Optimasi query lambat',
		duration: '10 min',
		platform: 'planned',
	},
	{
		title: 'NoSQL & Redis',
		description: 'Document DB, Redis caching — Implement cache',
		duration: '10 min',
		platform: 'planned',
	},

	// ── Modul 07 — Mastra AI Framework ──────────────────────────
	{
		moduleSlug: 'mastra-ai',
		title: 'Agent Dasar',
		description: 'Agent, prompt, model provider — Bikin agent pertama',
		duration: '10 min',
		platform: 'planned',
		sessionId: '01-mastra-intro',
	},
	{
		moduleSlug: 'mastra-ai',
		title: 'Tools & Memory',
		description: 'Tool definition, memory, context — Agent kalkulator + memory',
		duration: '12 min',
		platform: 'planned',
		sessionId: '02-agent-tools',
	},
	{
		moduleSlug: 'mastra-ai',
		title: 'Workflow & RAG',
		description: 'Workflow pipeline, RAG pattern — Bikin writer → editor pipeline',
		duration: '12 min',
		platform: 'planned',
		sessionId: '04-agent-rag',
	},
	{
		moduleSlug: 'mastra-ai',
		title: 'Multi-Agent & Evaluation',
		description: 'Orchestrator, eval metrics, guardrails — Bikin research team',
		duration: '14 min',
		platform: 'planned',
		sessionId: '05-agent-workflows',
	},

	// ── Module 08 — React Dasar ────────────────────────────────
	{
		moduleSlug: 'frontend-frameworks',
		title: 'Component & JSX',
		description: 'Functional component, props, children — Bikin component Button, Card',
		duration: '12 min',
		platform: 'planned',
		sessionId: '01-react-basics',
	},
	{
		moduleSlug: 'frontend-frameworks',
		title: 'State & Event',
		description: 'useState, onChange, onClick, form — Bikin counter + form input',
		duration: '14 min',
		platform: 'planned',
		sessionId: '02-react-hooks',
	},
	{
		moduleSlug: 'frontend-frameworks',
		title: 'Effect & Lifecycle',
		description: 'useEffect, cleanup, dependency array — Bikin data fetching',
		duration: '12 min',
		platform: 'planned',
		sessionId: '02-react-hooks',
	},
	{
		moduleSlug: 'frontend-frameworks',
		title: 'React Router',
		description: 'BrowserRouter, Route, Link, params — Bikin multi-page app',
		duration: '10 min',
		platform: 'planned',
		sessionId: '03-nextjs-frameworks',
	},

	// ── Actual published video found in curriculum ──────────────
	// From: 23-system-runtime/01-event-loop.md
	{
		moduleSlug: 'system-runtime',
		title: 'What the heck is the event loop anyway? (JSConf)',
		description: 'Philip Roberts explains the JavaScript event loop — a must-watch for understanding async JS.',
		url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
		platform: 'youtube',
		sessionId: '01-event-loop',
	},
];

/**
 * Get videos filtered by module slug.
 */
export function getVideosByModule(slug: string): VideoEntry[] {
	return videos.filter((v) => v.moduleSlug === slug);
}

/**
 * Get only videos that have a published URL.
 */
export function getPublishedVideos(): VideoEntry[] {
	return videos.filter((v) => v.url);
}

/**
 * Get all videos (published or planned) grouped by module.
 */
export function getVideosGroupedByModule(): Record<string, VideoEntry[]> {
	const grouped: Record<string, VideoEntry[]> = {};
	for (const v of videos) {
		const key = v.moduleSlug ?? '__other';
		if (!grouped[key]) grouped[key] = [];
		grouped[key].push(v);
	}
	return grouped;
}
