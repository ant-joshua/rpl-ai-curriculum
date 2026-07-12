// Static module registry — 57 modul RPL AI Curriculum
// Sumber: direktori 00-56 di repo induk

export interface Session {
	id: string;
	title: string;
	wordCount?: number;
}

export interface Module {
	index: number;
	slug: string;
	dirName: string;
	title: string;
	description: string;
	level: 'Beginner' | 'Intermediate' | 'Advanced';
	sessions: Session[];
}

function s(title: string, id: string): Session {
	return { id, title };
}

export const modules: Module[] = [
	{
		index: 0,
		slug: 'fundamentals',
		dirName: '00-fundamentals',
		title: 'Fundamental Pemrograman & Web',
		description: 'Pemahaman dasar tentang internet, HTTP, API, database, dan deployment.',
		level: 'Beginner',
		sessions: [
			s('Cara Belajar Efektif', '00-how-to-learn'),
			s('Internet & HTTP', '01-internet-http'),
			s('API, Database & Deploy', '02-api-database-deploy'),
		]
	},
	{
		index: 1,
		slug: 'js-fundamentals',
		dirName: '01-js-fundamentals',
		title: 'JavaScript Fundamentals',
		description: 'Variabel, tipe data, control flow, array, object, fungsi, async & error handling.',
		level: 'Beginner',
		sessions: [
			s('Variabel & Tipe Data', '01-variables-types'),
			s('Control Flow', '02-control-flow'),
			s('Array & Object', '03-arrays-objects'),
			s('Fungsi', '04-functions'),
			s('Async & Error', '05-async-errors'),
		]
	},
	{
		index: 2,
		slug: 'algorithms-data-structures',
		dirName: '02-algorithms-data-structures',
		title: 'Algoritma & Struktur Data',
		description: 'Big O, array, hashtable, stack, queue, linked list, rekursi, sorting, tree, graph.',
		level: 'Intermediate',
		sessions: [
			s('Big O Notation', '01-big-o'),
			s('Array & Hash Table', '02-arrays-hashtables'),
			s('Stack, Queue & Linked List', '03-stacks-queues-linkedlists'),
			s('Rekursi & Sorting', '04-recursion-sorting'),
			s('Tree & Graph', '05-trees-graphs'),
			s('Latihan LeetCode', '06-leetcode-practice'),
		]
	},
	{
		index: 3,
		slug: 'typescript',
		dirName: '03-typescript',
		title: 'TypeScript',
		description: 'Dasar TypeScript, tipe & interface, fungsi generics, konfigurasi proyek.',
		level: 'Beginner',
		sessions: [
			s('Dasar TypeScript', '01-basics'),
			s('Tipe & Interface', '02-types-interfaces'),
			s('Fungsi & Generics', '03-functions-generics'),
			s('Proyek TypeScript', '04-tsconfig-project'),
		]
	},
	{
		index: 4,
		slug: 'web-basics',
		dirName: '04-web-basics',
		title: 'Web Basics (HTML, CSS, Tailwind, DOM)',
		description: 'HTML & CSS dasar, Tailwind CSS, manipulasi DOM & fetch API.',
		level: 'Beginner',
		sessions: [
			s('HTML & CSS', '01-html-css'),
			s('Tailwind CSS', '02-tailwind'),
			s('DOM & Fetch', '03-dom-fetch'),
		]
	},
	{
		index: 5,
		slug: 'git-deploy',
		dirName: '05-git-deploy',
		title: 'Git & Deployment',
		description: 'Git dasar, kolaborasi GitHub, strategi deployment.',
		level: 'Beginner',
		sessions: [
			s('Git Basics', '01-git-basics'),
			s('GitHub & Kolaborasi', '02-github-collab'),
			s('Deployment', '03-deploy'),
		]
	},
	{
		index: 6,
		slug: 'node-express',
		dirName: '06-node-express',
		title: 'Node.js & Express',
		description: 'Setup Node.js, Express API, database, REST CRUD.',
		level: 'Beginner',
		sessions: [
			s('Node.js Setup', '01-node-setup'),
			s('Express API', '02-express-api'),
			s('Database', '03-database'),
			s('REST CRUD', '04-rest-crud'),
		]
	},
	{
		index: 7,
		slug: 'mastra-ai',
		dirName: '07-mastra-ai',
		title: 'Mastra AI Framework',
		description: 'Mastra intro, agen & tools, memori, RAG, workflow.',
		level: 'Beginner',
		sessions: [
			s('Mastra Intro', '01-mastra-intro'),
			s('Agent & Tools', '02-agent-tools'),
			s('Agent Memory', '03-agent-memory'),
			s('Agent RAG', '04-agent-rag'),
			s('Agent Workflows', '05-agent-workflows'),
		]
	},
	{
		index: 8,
		slug: 'project',
		dirName: '08-project',
		title: 'Project — Aplikasi AI Chatbot',
		description: 'Sprint 1-4: bangun aplikasi AI chatbot end-to-end.',
		level: 'Beginner',
		sessions: [
			s('Sprint 1', '01-sprint1'),
			s('Sprint 2', '02-sprint2'),
			s('Sprint 3', '03-sprint3'),
			s('Sprint 4', '04-sprint4'),
		]
	},
	{
		index: 9,
		slug: 'testing',
		dirName: '09-testing',
		title: 'Software Testing',
		description: 'Unit test, integration test, CI/CD pipeline.',
		level: 'Beginner',
		sessions: [
			s('Unit Test', '01-unit-test'),
			s('Integration Test', '02-integration-test'),
			s('CI/CD', '03-ci-cd'),
		]
	},
	{
		index: 10,
		slug: 'design-patterns',
		dirName: '10-design-patterns',
		title: 'Design Patterns',
		description: 'SOLID, creational, structural & behavioral, functional & real-world.',
		level: 'Intermediate',
		sessions: [
			s('SOLID Principles', '01-solid'),
			s('Creational Patterns', '02-creational'),
			s('Structural & Behavioral', '03-structural-behavioral'),
			s('Functional & Real-World', '04-functional-realworld'),
		]
	},
	{
		index: 11,
		slug: 'system-design',
		dirName: '11-system-design',
		title: 'System Design',
		description: 'Arsitektur, desain database, caching & CAP, queue & hosting.',
		level: 'Intermediate',
		sessions: [
			s('Arsitektur', '01-architecture'),
			s('Desain Database', '02-database-design'),
			s('Caching & CAP', '03-caching-cap'),
			s('Queue & Hosting', '04-queue-hosting'),
		]
	},
	{
		index: 12,
		slug: 'ui-ux-design',
		dirName: '12-ui-ux-design',
		title: 'UI/UX Design',
		description: 'Design thinking, wireframe, prototyping, aksesibilitas, portfolio.',
		level: 'Intermediate',
		sessions: [
			s('Design Thinking', '01-design-thinking'),
			s('UI & Wireframe', '02-ui-wireframe'),
			s('Prototyping & Design System', '03-prototyping-design-system'),
			s('Aksesibilitas & Portfolio', '04-accessibility-portfolio'),
		]
	},
	{
		index: 13,
		slug: 'flutter-mobile',
		dirName: '13-flutter-mobile',
		title: 'Flutter Mobile',
		description: 'Dart & widget, layout & state, navigasi & API, Firebase & deploy.',
		level: 'Intermediate',
		sessions: [
			s('Dart & Widget', '01-dart-widget'),
			s('Layout & State', '02-layout-state'),
			s('Navigasi & API', '03-navigation-api'),
			s('Firebase & Deploy', '04-firebase-deploy'),
		]
	},
	{
		index: 14,
		slug: 'cybersecurity',
		dirName: '14-cybersecurity',
		title: 'Cybersecurity',
		description: 'OWASP, injection, XSS, CSRF, auth, CORS, HTTPS, DevSecOps.',
		level: 'Intermediate',
		sessions: [
			s('OWASP & Injection', '01-owasp-injection'),
			s('XSS & CSRF', '02-xss-csrf'),
			s('Auth, CORS & HTTPS', '03-auth-cors-https'),
			s('DevSecOps', '04-devsecops'),
		]
	},
	{
		index: 15,
		slug: 'agile-scrum',
		dirName: '15-agile-scrum',
		title: 'Agile & Scrum',
		description: 'Agile & Scrum dasar, ceremonies & backlog, tools & proyek nyata.',
		level: 'Intermediate',
		sessions: [
			s('Agile & Scrum Basics', '01-agile-scrum-basics'),
			s('Ceremonies & Backlog', '02-ceremonies-backlog'),
			s('Tools & Real Project', '03-tools-real-project'),
		]
	},
	{
		index: 16,
		slug: 'realtime-apps',
		dirName: '16-realtime-apps',
		title: 'Real-Time Applications',
		description: 'WebSocket dasar, Socket.IO, scaling & production.',
		level: 'Intermediate',
		sessions: [
			s('WebSocket Basics', '01-websocket-basics'),
			s('Socket.IO', '02-socketio'),
			s('Scaling & Production', '03-scaling-production'),
		]
	},
	{
		index: 17,
		slug: 'advanced-database',
		dirName: '17-advanced-database',
		title: 'Advanced Database',
		description: 'Indexing & optimasi, transaksi & isolasi, scaling & backup.',
		level: 'Intermediate',
		sessions: [
			s('Indexing & Optimasi', '01-indexing-optimization'),
			s('Transaksi & Isolasi', '02-transactions-isolation'),
			s('Scaling & Backup', '03-scaling-backup'),
		]
	},
	{
		index: 18,
		slug: 'ai-prompt-engineering',
		dirName: '18-ai-prompt-engineering',
		title: 'AI Prompt Engineering',
		description: 'Teknik prompt, prompt untuk kode & production.',
		level: 'Intermediate',
		sessions: [
			s('Teknik Prompt', '01-prompt-techniques'),
			s('Prompt Kode & Production', '02-prompt-code-production'),
			s('System Prompts & Structured Output', '03-system-prompts'),
			s('Prompt Chaining & Multi-Step', '04-prompt-chaining'),
		]
	},
	{
		index: 19,
		slug: 'technical-interview',
		dirName: '19-technical-interview',
		title: 'Technical Interview Prep',
		description: 'Behavioral & CV, DSA & system design, mock & portfolio.',
		level: 'Intermediate',
		sessions: [
			s('Behavioral & CV', '01-behavioral-cv'),
			s('DSA & System Design', '02-dsa-system-design'),
			s('Mock & Portfolio', '03-mock-portfolio'),
			s('System Design Round', '04-system-design-round'),
		]
	},
	{
		index: 20,
		slug: 'frontend-frameworks',
		dirName: '20-frontend-frameworks',
		title: 'Frontend Frameworks (React, Next.js)',
		description: 'React dasar, React hooks, Next.js & framework modern.',
		level: 'Intermediate',
		sessions: [
			s('React Basics', '01-react-basics'),
			s('React Hooks', '02-react-hooks'),
			s('Next.js & Frameworks', '03-nextjs-frameworks'),
		]
	},
	{
		index: 21,
		slug: 'docker',
		dirName: '21-docker',
		title: 'Docker',
		description: 'Docker dasar, Dockerfile & images, Docker Compose, production.',
		level: 'Intermediate',
		sessions: [
			s('Docker Basics', '01-docker-basics'),
			s('Dockerfile & Images', '02-dockerfile-images'),
			s('Docker Compose', '03-docker-compose'),
			s('Docker Production', '04-docker-production'),
		]
	},
	{
		index: 22,
		slug: 'monorepo',
		dirName: '22-monorepo',
		title: 'Monorepo',
		description: 'Monorepo dasar, pnpm workspaces, Nx/Turborepo, CI monorepo.',
		level: 'Intermediate',
		sessions: [
			s('Monorepo Basics', '01-monorepo-basics'),
			s('pnpm Workspaces', '02-pnpm-workspaces'),
			s('Nx & Turborepo', '03-nx-turborepo'),
			s('Monorepo CI', '04-monorepo-ci'),
		]
	},
	{
		index: 23,
		slug: 'system-runtime',
		dirName: '23-system-runtime',
		title: 'System & Runtime',
		description: 'Event loop, async patterns, multithreading, runtime & performa.',
		level: 'Intermediate',
		sessions: [
			s('Event Loop', '01-event-loop'),
			s('Async Patterns', '02-async-patterns'),
			s('Multithreading', '03-multithreading'),
			s('Runtime & Performa', '04-runtime-perf'),
		]
	},
	{
		index: 24,
		slug: 'resilience-patterns',
		dirName: '24-resilience-patterns',
		title: 'Resilience Patterns',
		description: 'Retry & backoff, circuit breaker, timeout & bulkhead, saga & health.',
		level: 'Intermediate',
		sessions: [
			s('Retry & Backoff', '01-retry-backoff'),
			s('Circuit Breaker', '02-circuit-breaker'),
			s('Timeout & Bulkhead', '03-timeout-bulkhead'),
			s('Saga & Health', '04-saga-health'),
		]
	},
	{
		index: 25,
		slug: 'soft-skills',
		dirName: '25-soft-skills',
		title: 'Soft Skills',
		description: 'Komunikasi tim, client handling, manajemen waktu, growth mindset.',
		level: 'Intermediate',
		sessions: [
			s('Komunikasi Tim', '01-team-communication'),
			s('Client Handling', '02-client-handling'),
			s('Manajemen Waktu', '03-time-management'),
			s('Growth Mindset', '04-growth-mindset'),
		]
	},
	{
		index: 26,
		slug: 'pragmatic-programming',
		dirName: '26-pragmatic-programming',
		title: 'Pragmatic Programming',
		description: 'Clean code, naming & comments, refactoring, code review.',
		level: 'Intermediate',
		sessions: [
			s('Clean Code Basics', '01-clean-code-basics'),
			s('Naming & Comments', '02-naming-comments'),
			s('Refactoring & Estimasi', '03-refactoring-estimation'),
			s('Code Review', '04-code-review'),
		]
	},
	{
		index: 27,
		slug: 'linux-terminal',
		dirName: '27-linux-terminal',
		title: 'Linux & Terminal',
		description: 'File system, proses & networking, text processing, shell scripting.',
		level: 'Beginner',
		sessions: [
			s('File System', '01-file-system'),
			s('Proses & Networking', '02-process-networking'),
			s('Text Processing', '03-text-processing'),
			s('Shell Scripting', '04-shell-scripting'),
		]
	},
	{
		index: 28,
		slug: 'rest-api-design',
		dirName: '28-rest-api-design',
		title: 'REST API Design',
		description: 'Prinsip REST, OpenAPI/Swagger, error & pagination, versioning & security.',
		level: 'Intermediate',
		sessions: [
			s('Prinsip REST', '01-rest-principles'),
			s('OpenAPI & Swagger', '02-openapi-swagger'),
			s('Error & Pagination', '03-error-pagination'),
			s('Versioning & Security', '04-versioning-security'),
		]
	},
	{
		index: 29,
		slug: 'cloud-computing',
		dirName: '29-cloud-computing',
		title: 'Cloud Computing',
		description: 'Cloud basics, compute & storage, serverless functions, IaC & deploy.',
		level: 'Intermediate',
		sessions: [
			s('Cloud Basics', '01-cloud-basics'),
			s('Compute & Storage', '02-compute-storage'),
			s('Serverless Functions', '03-serverless-functions'),
			s('IaC & Deploy', '04-iac-deploy'),
		]
	},
	{
		index: 30,
		slug: 'graphql-trpc',
		dirName: '30-graphql-trpc',
		title: 'GraphQL & tRPC',
		description: 'GraphQL dasar & advanced, tRPC, production GraphQL.',
		level: 'Intermediate',
		sessions: [
			s('GraphQL Basics', '01-graphql-basics'),
			s('GraphQL Advanced', '02-graphql-advanced'),
			s('tRPC', '03-trpc'),
			s('Production GraphQL', '04-production-graphql'),
		]
	},
	{
		index: 31,
		slug: 'auth-identity',
		dirName: '31-auth-identity',
		title: 'Authentication & Identity',
		description: 'Password auth, OAuth/OIDC, SSO & MFA, security best practices.',
		level: 'Intermediate',
		sessions: [
			s('Password Auth', '01-password-auth'),
			s('OAuth & OIDC', '02-oauth-oidc'),
			s('SSO & MFA', '03-sso-mfa'),
			s('Security Best Practices', '04-security-best-practices'),
		]
	},
	{
		index: 32,
		slug: 'performance',
		dirName: '32-performance',
		title: 'Web Performance',
		description: 'Web vitals, lazy loading & caching, bundle optimization, Lighthouse CI.',
		level: 'Intermediate',
		sessions: [
			s('Web Vitals', '01-web-vitals'),
			s('Lazy Loading & Caching', '02-lazy-loading-caching'),
			s('Bundle Optimization', '03-bundle-optimization'),
			s('Lighthouse CI', '04-lighthouse-ci'),
		]
	},
	{
		index: 33,
		slug: 'data-visualization',
		dirName: '33-data-visualization',
		title: 'Data Visualization',
		description: 'Chart basics & advanced, D3 intro, dashboard real-world.',
		level: 'Intermediate',
		sessions: [
			s('Chart Basics', '01-chart-basics'),
			s('Chart Advanced', '02-chart-advanced'),
			s('D3 Intro', '03-d3-intro'),
			s('Dashboard Real-World', '04-dashboard-realworld'),
		]
	},
	{
		index: 34,
		slug: 'pwa-offline',
		dirName: '34-pwa-offline',
		title: 'PWA & Offline',
		description: 'Service worker, IndexedDB & offline, PWA manifest, push notifications.',
		level: 'Intermediate',
		sessions: [
			s('Service Worker', '01-service-worker'),
			s('IndexedDB & Offline', '02-indexeddb-offline'),
			s('PWA Manifest', '03-pwa-manifest'),
			s('Push Notifications', '04-push-notifications'),
		]
	},
	{
		index: 35,
		slug: 'html-css-intro',
		dirName: '35-html-css-intro',
		title: 'HTML & CSS Intro',
		description: 'HTML dasar, CSS dasar, CSS layout, form & deploy.',
		level: 'Beginner',
		sessions: [
			s('HTML Dasar', '01-html-dasar'),
			s('CSS Dasar', '02-css-dasar'),
			s('CSS Layout', '03-css-layout'),
			s('Form & Deploy', '04-form-deploy'),
		]
	},
	{
		index: 36,
		slug: 'web-architecture',
		dirName: '36-web-architecture',
		title: 'Web Architecture',
		description: 'Cara kerja web, HTTP, frontend vs backend, hosting & deploy.',
		level: 'Beginner',
		sessions: [
			s('Cara Kerja Web', '01-how-web-works'),
			s('HTTP Basics', '02-http-basics'),
			s('Frontend vs Backend', '03-frontend-vs-backend'),
			s('Hosting & Deploy', '04-hosting-deploy'),
		]
	},
	{
		index: 37,
		slug: 'database-intro',
		dirName: '37-database-intro',
		title: 'Database Intro',
		description: 'Apa itu database, SQL basic, relationships, desain database.',
		level: 'Beginner',
		sessions: [
			s('Apa Itu Database', '01-what-is-database'),
			s('SQL Basics', '02-sql-basics'),
			s('Relationships', '03-relationships'),
			s('Desain Database', '04-database-design'),
		]
	},
	{
		index: 38,
		slug: 'ai-dev-workflow',
		dirName: '38-ai-dev-workflow',
		title: 'AI Developer Workflow',
		description: 'AI coding tools, AI pair programming, AI code review, AI workflow.',
		level: 'Beginner',
		sessions: [
			s('AI Coding Tools', '01-ai-coding-tools'),
			s('AI Pair Programming', '02-ai-pair-programming'),
			s('AI Code Review', '03-ai-code-review'),
			s('AI Workflow', '04-ai-workflow'),
		]
	},
	{
		index: 39,
		slug: 'payment-integration',
		dirName: '39-payment-integration',
		title: 'Payment Integration',
		description: 'Payment basics, Midtrans/Xendit, Stripe webhook, production payment.',
		level: 'Intermediate',
		sessions: [
			s('Payment Basics', '01-payment-basics'),
			s('Midtrans & Xendit', '02-midtrans-xendit'),
			s('Stripe & Webhook', '03-stripe-webhook'),
			s('Production Payment', '04-production-payment'),
		]
	},
	{
		index: 40,
		slug: 'background-jobs',
		dirName: '40-background-jobs',
		title: 'Background Jobs',
		description: 'Queue concepts, BullMQ advanced, real-world queue, production queue.',
		level: 'Advanced',
		sessions: [
			s('Queue Concepts', '01-queue-concepts'),
			s('BullMQ Advanced', '02-bullmq-advanced'),
			s('Real-World Queue', '03-real-world-queue'),
			s('Queue Production', '04-queue-production'),
		]
	},
	{
		index: 41,
		slug: 'monitoring',
		dirName: '41-monitoring',
		title: 'Monitoring & Observability',
		description: 'Structured logging, Sentry error tracking, health check, production monitoring.',
		level: 'Advanced',
		sessions: [
			s('Structured Logging', '01-structured-logging'),
			s('Sentry & Error Tracking', '02-sentry-error-tracking'),
			s('Health Check & Monitoring', '03-health-check-monitoring'),
			s('Production Monitoring', '04-production-monitoring'),
		]
	},
	{
		index: 42,
		slug: 'file-upload',
		dirName: '42-file-upload',
		title: 'File Upload',
		description: 'Upload basics, cloud storage, image optimization, production upload.',
		level: 'Advanced',
		sessions: [
			s('Upload Basics', '01-upload-basics'),
			s('Cloud Storage', '02-cloud-storage'),
			s('Image Optimization', '03-image-optimization'),
			s('Production Upload', '04-production-upload'),
		]
	},
	{
		index: 43,
		slug: 'search-implementation',
		dirName: '43-search-implementation',
		title: 'Search Implementation',
		description: 'PostgreSQL FTS, Meilisearch, client-side search, search architecture.',
		level: 'Advanced',
		sessions: [
			s('PostgreSQL FTS', '01-postgres-fts'),
			s('Meilisearch', '02-meilisearch'),
			s('Client-Side Search', '03-client-side-search'),
			s('Search Architecture', '04-search-architecture'),
		]
	},
	{
		index: 44,
		slug: 'portfolio-branding',
		dirName: '44-portfolio-branding',
		title: 'Portfolio & Personal Branding',
		description: 'GitHub profile, portfolio website, LinkedIn & career, tech community.',
		level: 'Advanced',
		sessions: [
			s('GitHub Profile', '01-github-profile'),
			s('Portfolio Website', '02-portfolio-website'),
			s('LinkedIn & Career', '03-linkedin-career'),
			s('Tech Community', '04-tech-community'),
		]
	},
	{
		index: 45,
		slug: 'internationalization',
		dirName: '45-internationalization',
		title: 'Internationalization (i18n)',
		description: 'i18n concepts, React i18n, RTL & backend, production i18n.',
		level: 'Advanced',
		sessions: [
			s('i18n Concepts', '01-i18n-concepts'),
			s('React i18n', '02-react-i18n'),
			s('RTL & Backend', '03-rtl-backend'),
			s('Production i18n', '04-production-i18n'),
		]
	},
	{
		index: 46,
		slug: 'debugging-devtools',
		dirName: '46-debugging-devtools',
		title: 'Debugging & DevTools',
		description: 'Browser DevTools, VS Code debugger, API debugging, error tracing.',
		level: 'Beginner',
		sessions: [
			s('Browser DevTools', '01-browser-devtools'),
			s('VS Code Debugger', '02-vscode-debugger'),
			s('API Debugging', '03-api-debugging'),
			s('Error Tracing & Logging', '04-error-tracing-logging'),
		]
	},
	{
		index: 47,
		slug: 'team-git-workflow',
		dirName: '47-team-git-workflow',
		title: 'Team Git Workflow',
		description: 'Branching strategy, PR workflow, conflict resolution, GitHub Actions.',
		level: 'Advanced',
		sessions: [
			s('Branching Strategy', '01-branching-strategy'),
			s('PR Workflow', '02-pr-workflow'),
			s('Conflict Resolution', '03-conflict-resolution'),
			s('GitHub Actions', '04-github-actions'),
		]
	},
	{
		index: 48,
		slug: 'portfolio-project-series',
		dirName: '48-portfolio-project-series',
		title: 'Portfolio Project Series',
		description: 'Landing page, CRUD API, fullstack app, AI agent app, production deploy.',
		level: 'Advanced',
		sessions: [
			s('Landing Page', '01-landing-page'),
			s('CRUD API', '02-crud-api'),
			s('Fullstack App', '03-fullstack-app'),
			s('AI Agent App', '04-ai-agent-app'),
			s('Production Deploy', '05-production-deploy'),
		]
	},
	{
		index: 49,
		slug: 'production-ready-code',
		dirName: '49-production-ready-code',
		title: 'Production-Ready Code',
		description: 'Input validation, security hardening, health checks, env config.',
		level: 'Advanced',
		sessions: [
			s('Input Validation', '01-input-validation'),
			s('Security Hardening', '02-security-hardening'),
			s('Health Checks', '03-health-checks'),
			s('Env Config', '04-env-config'),
		]
	},
	{
		index: 50,
		slug: 'microservices-hands-on',
		dirName: '50-microservices-hands-on',
		title: 'Microservices Hands-On',
		description: 'Monolith to micro, Docker multi-service, inter-service comm, API gateway.',
		level: 'Advanced',
		sessions: [
			s('Monolith to Micro', '01-monolith-to-micro'),
			s('Docker Multi-Service', '02-docker-multi-service'),
			s('Inter-Service Comm', '03-inter-service-comm'),
			s('API Gateway', '04-api-gateway'),
		]
	},
	{
		index: 51,
		slug: 'lks-competition-prep',
		dirName: '51-lks-competition-prep',
		title: 'LKS Competition Prep',
		description: 'LKS mapping, strategi, mock projects.',
		level: 'Advanced',
		sessions: [
			s('LKS Mapping', '01-lks-mapping'),
			s('LKS Strategi', '02-lks-strategy'),
			s('LKS Mock Projects', '03-lks-mock-projects'),
		]
	},
	{
		index: 52,
		slug: 'indonesian-tech-ecosystem',
		dirName: '52-indonesian-tech-ecosystem',
		title: 'Indonesian Tech Ecosystem',
		description: 'Freelance & hustle, job search & interview, career growth, tech community.',
		level: 'Advanced',
		sessions: [
			s('Freelance & Hustle', '01-freelance-hustle'),
			s('Job Search & Interview', '02-job-search-interview'),
			s('Career Growth', '03-career-growth'),
			s('Tech Community', '04-tech-community'),
		]
	},
	{
		index: 53,
		slug: 'ai-coding-agents',
		dirName: '53-ai-coding-agents',
		title: 'AI Coding Agents',
		description: 'AI coding tools comparison, multi-agent workflow, coding loop, Hermes mastery.',
		level: 'Advanced',
		sessions: [
			s('AI Coding Tools', '01-ai-coding-tools-compare'),
			s('Multi-Agent Workflow', '02-multi-agent-workflow'),
			s('Coding Loop', '03-coding-loop'),
			s('Hermes Agent Mastery', '04-hermes-agent-mastery'),
		]
	},
	{
		index: 54,
		slug: 'prompt-engineering-dev',
		dirName: '54-prompt-engineering-dev',
		title: 'Prompt Engineering untuk Developer',
		description: 'System prompt design, code generation prompting, prompt patterns, production prompting.',
		level: 'Advanced',
		sessions: [
			s('System Prompt Design', '01-system-prompt-design'),
			s('Code Generation Prompting', '02-code-generation-prompting'),
			s('Prompt Patterns', '03-prompt-patterns'),
			s('Production Prompting', '04-production-prompting'),
		]
	},
	{
		index: 55,
		slug: 'ai-docs-spec',
		dirName: '55-ai-docs-spec',
		title: 'AI Docs & Spec',
		description: 'Tech spec with AI, doc generation, context files, rules files.',
		level: 'Advanced',
		sessions: [
			s('Tech Spec dengan AI', '01-tech-spec-with-ai'),
			s('Doc Generation', '02-doc-generation'),
			s('Context Files', '03-context-files'),
			s('Rules Files', '04-rules-files'),
		]
	},
	{
		index: 56,
		slug: 'advanced-ai-dev',
		dirName: '56-advanced-ai-dev',
		title: 'Advanced AI Development',
		description: 'AI code review pipeline, AI testing strategy, AI security & quality, AI refactoring.',
		level: 'Advanced',
		sessions: [
			s('AI Code Review Pipeline', '01-ai-code-review-pipeline'),
			s('AI Testing Strategy', '02-ai-testing-strategy'),
			s('AI Security & Quality', '03-ai-security-quality'),
			s('AI Refactoring', '04-ai-refactoring'),
		]
	},
];

export function getModuleBySlug(slug: string): Module | undefined {
	return modules.find((m) => m.slug === slug);
}

export function getModuleByDir(dirName: string): Module | undefined {
	return modules.find((m) => m.dirName === dirName);
}
