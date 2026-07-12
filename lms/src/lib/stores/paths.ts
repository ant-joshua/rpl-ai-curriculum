export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  colorEnd: string;
  level: string;
  modules: string[];
  estimatedSessions: number;
  prerequisites?: string[];
}

export const paths: LearningPath[] = [
  {
    slug: 'frontend-web',
    title: 'Frontend Web Developer',
    description: 'Dari HTML/CSS sampai React modern. Kuasai UI, UX, performa, dan PWA.',
    icon: '🎨',
    color: '#3b82f6',
    colorEnd: '#8b5cf6',
    level: 'Beginner → Advanced',
    modules: [
      'web-architecture',
      'html-css-intro',
      'web-basics',
      'js-fundamentals',
      'frontend-frameworks',
      'ui-ux-design',
      'performance',
      'pwa-offline',
      'data-visualization',
      'portfolio-project-series',
    ],
    estimatedSessions: 33,
  },
  {
    slug: 'backend-dev',
    title: 'Backend Developer',
    description: 'Bangun API, database, auth, payment — backend production-ready.',
    icon: '⚙️',
    color: '#22c55e',
    colorEnd: '#06b6d4',
    level: 'Beginner → Advanced',
    modules: [
      'fundamentals',
      'js-fundamentals',
      'typescript',
      'node-express',
      'database-intro',
      'rest-api-design',
      'advanced-database',
      'graphql-trpc',
      'auth-identity',
      'payment-integration',
      'background-jobs',
      'production-ready-code',
    ],
    estimatedSessions: 43,
  },
  {
    slug: 'fullstack',
    title: 'Fullstack Developer',
    description: 'Frontend + Backend + DevOps. Siap bangun aplikasi end-to-end.',
    icon: '🚀',
    color: '#f59e0b',
    colorEnd: '#ef4444',
    level: 'Beginner → Advanced',
    modules: [
      'fundamentals',
      'js-fundamentals',
      'typescript',
      'node-express',
      'database-intro',
      'web-basics',
      'frontend-frameworks',
      'git-deploy',
      'testing',
      'rest-api-design',
      'system-design',
      'docker',
      'production-ready-code',
      'portfolio-project-series',
    ],
    estimatedSessions: 52,
  },
  {
    slug: 'ai-ml-dev',
    title: 'AI / ML Developer',
    description: 'Integrasi AI dalam development — prompt engineering, agents, RAG.',
    icon: '🤖',
    color: '#a855f7',
    colorEnd: '#ec4899',
    level: 'Beginner → Advanced',
    modules: [
      'js-fundamentals',
      'typescript',
      'ai-dev-workflow',
      'ai-prompt-engineering',
      'mastra-ai',
      'ai-coding-agents',
      'prompt-engineering-dev',
      'ai-docs-spec',
      'advanced-ai-dev',
      'project',
    ],
    estimatedSessions: 38,
  },
  {
    slug: 'devops-infra',
    title: 'DevOps & Infrastructure',
    description: 'Linux, Docker, Cloud, CI/CD, monitoring — infrastruktur modern.',
    icon: '🛡️',
    color: '#06b6d4',
    colorEnd: '#3b82f6',
    level: 'Beginner → Advanced',
    modules: [
      'linux-terminal',
      'git-deploy',
      'docker',
      'monorepo',
      'cloud-computing',
      'cybersecurity',
      'monitoring',
      'microservices-hands-on',
      'team-git-workflow',
    ],
    estimatedSessions: 33,
  },
  {
    slug: 'mobile-dev',
    title: 'Mobile Developer (Flutter)',
    description: 'Bangun aplikasi mobile cross-platform dengan Flutter & Dart.',
    icon: '📱',
    color: '#10b981',
    colorEnd: '#059669',
    level: 'Beginner → Advanced',
    modules: [
      'fundamentals',
      'js-fundamentals',
      'flutter-mobile',
      'realtime-apps',
      'rest-api-design',
      'auth-identity',
      'payment-integration',
      'testing',
      'production-ready-code',
    ],
    estimatedSessions: 35,
  },
  {
    slug: 'cs-fundamentals',
    title: 'Computer Science Fundamentals',
    description: 'Algoritma, Design Patterns, System Design — fondasi CS yang solid.',
    icon: '🧠',
    color: '#f97316',
    colorEnd: '#eab308',
    level: 'Intermediate → Advanced',
    prerequisites: ['frontend-web'],
    modules: [
      'algorithms-data-structures',
      'design-patterns',
      'system-runtime',
      'resilience-patterns',
      'system-design',
      'web-architecture',
      'debugging-devtools',
    ],
    estimatedSessions: 29,
  },
  {
    slug: 'career-prep',
    title: 'Career Preparation',
    description: 'Persiapan karir — portfolio, interview, soft skills, tech ecosystem.',
    icon: '💼',
    color: '#8b5cf6',
    colorEnd: '#6366f1',
    level: 'Intermediate → Advanced',
    prerequisites: ['fullstack'],
    modules: [
      'soft-skills',
      'pragmatic-programming',
      'technical-interview',
      'portfolio-branding',
      'indonesian-tech-ecosystem',
      'lks-competition-prep',
      'portfolio-project-series',
    ],
    estimatedSessions: 27,
  },
];

export function getPathBySlug(slug: string): LearningPath | undefined {
  return paths.find(p => p.slug === slug);
}

import { getModuleBySlug } from './modules';

/**
 * Compute path-level progress given a session-completed check function.
 * Call from $derived in components that have access to progress store.
 */
export function computePathProgress(
  pathSlug: string,
  isCompleted: (moduleSlug: string, sessionId: string) => boolean
): { completed: number; total: number; pct: number } {
  const path = paths.find(p => p.slug === pathSlug);
  if (!path) return { completed: 0, total: 0, pct: 0 };
  let completed = 0;
  let total = 0;
  for (const modSlug of path.modules) {
    const mod = getModuleBySlug(modSlug);
    if (!mod) continue;
    for (const sesh of mod.sessions) {
      total++;
      if (isCompleted(modSlug, sesh.id)) completed++;
    }
  }
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

/**
 * Find the first incomplete session across all modules in a path.
 * Returns { moduleSlug, sessionId, sessionTitle, moduleTitle } or null.
 */
export function findNextSession(
  pathSlug: string,
  isCompleted: (moduleSlug: string, sessionId: string) => boolean
): { moduleSlug: string; sessionId: string; sessionTitle: string; moduleTitle: string } | null {
  const path = paths.find(p => p.slug === pathSlug);
  if (!path) return null;
  for (const modSlug of path.modules) {
    const mod = getModuleBySlug(modSlug);
    if (!mod) continue;
    for (const sesh of mod.sessions) {
      if (!isCompleted(modSlug, sesh.id)) {
        return { moduleSlug: modSlug, sessionId: sesh.id, sessionTitle: sesh.title, moduleTitle: mod.title };
      }
    }
  }
  return null;
}
