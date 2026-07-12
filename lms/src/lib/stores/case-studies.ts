export interface CaseStudy {
  slug: string;
  title: string;
  company: string;
  description: string;
  moduleSlug?: string;
  level: string;
  filePath: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'cs01-github',
    title: 'GitHub Copilot — Revolusi Coding dengan AI Pair Programming',
    company: 'GitHub (Microsoft)',
    description: 'Bagaimana GitHub mengubah cara jutaan developer menulis kode dengan GitHub Copilot, AI pair programming yang menggunakan LLM untuk code completion, chat, dan review.',
    moduleSlug: 'ai-prompt-engineering',
    level: 'Beginner',
    filePath: 'cs01-github.md',
  },
  {
    slug: 'cs02-google',
    title: 'Google — AI-First Transformation & MLOps at Scale',
    company: 'Google (Alphabet)',
    description: 'Transformasi Google menjadi AI-First Company mulai 2016, MLOps untuk skala miliaran pengguna, teknologi internal seperti Borg, Spanner, dan Pathways.',
    moduleSlug: 'system-design',
    level: 'Intermediate',
    filePath: 'cs02-google.md',
  },
  {
    slug: 'cs03-spotify',
    title: 'Spotify — AI-Driven Recommendation & Agile Engineering Culture',
    company: 'Spotify Technology',
    description: 'Discover Weekly dan sistem rekomendasi AI Spotify, Squad Model agile, Backstage platform, dan engineering culture data-driven.',
    moduleSlug: 'agile-scrum',
    level: 'Beginner',
    filePath: 'cs03-spotify.md',
  },
  {
    slug: 'cs04-netflix',
    title: 'Netflix — AI, Chaos Engineering & CI/CD di Skala Global',
    company: 'Netflix Inc.',
    description: 'Chaos Monkey, microservices di skala global, AI recommendation system, CI/CD pipeline yang melayani 260+ juta subscriber di 190+ negara.',
    moduleSlug: 'resilience-patterns',
    level: 'Intermediate',
    filePath: 'cs04-netflix.md',
  },
  {
    slug: 'cs05-shopify',
    title: 'Shopify — Demokratisasi E-commerce dengan AI & Engineering Excellence',
    company: 'Shopify Inc.',
    description: 'Platform e-commerce yang memberdayakan 1.7+ juta merchant, developer-first platform, AI untuk membantu UMKM bersaing dengan raksasa.',
    moduleSlug: 'web-basics',
    level: 'Beginner',
    filePath: 'cs05-shopify.md',
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getCaseStudyByModule(moduleSlug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.moduleSlug === moduleSlug);
}
