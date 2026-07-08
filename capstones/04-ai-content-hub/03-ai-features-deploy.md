# Sesi 3: AI Features & Deployment — AI Content Hub

> **Durasi:** 2 minggu (Sprint 4) | **Mode:** Individu / Kelompok (maks. 3 orang)

---

## 📋 Ringkasan

Sesi terakhir mencakup implementasi AI writing assistant penuh, SEO optimization untuk artikel, deployment ke production, dan analytics. Mahasiswa akan menyempurnakan fitur AI, mengoptimalkan konten untuk search engine, mendeploy dengan Docker, dan menyiapkan monitoring.

---

## 1. AI Writing Assistant

### 1.1 AI-Assisted Writing Flow

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  User       │────▶│  AI Actions Bar  │────▶│  Mastra      │
│  Menulis    │     │  [Summarize]     │     │  Agent       │
│  Artikel    │     │  [Auto-Tag]      │     │              │
└─────────────┘     │  [Social]        │     └──────┬───────┘
                    │  [Continue Write] │            │
                    └──────────────────┘            ▼
                                            ┌──────────────┐
                                            │  LLM Response │
                                            │  → Update UI  │
                                            └──────────────┘
```

### 1.2 AI Writing Panel Component

```tsx
// src/components/ai/AIActionsPanel.tsx
'use client';
import { useState } from 'react';

interface AIActionsProps {
  title: string;
  content: string;
  onUpdateContent: (newContent: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onTagsGenerated: (tags: string[]) => void;
}

export default function AIActionsPanel({ title, content, onUpdateContent, onUpdateTitle, onTagsGenerated }: AIActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const callAI = async (action: string, body: any) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (error) {
      console.error(`AI ${action} error:`, error);
      alert('Gagal memanggil AI. Coba lagi.');
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleSummarize = async () => {
    const result = await callAI('summarize', { content });
    if (result?.summary) {
      // Insert summary at top of article
      onUpdateContent(`> **Ringkasan:** ${result.summary}\n\n${content}`);
    }
  };

  const handleAutoTag = async () => {
    const result = await callAI('auto-tag', { content, existingTags: [] });
    if (result?.tags) {
      onTagsGenerated(result.tags);
    }
  };

  const handleGenerateSocial = async () => {
    const result = await callAI('social', { title, content });
    if (result?.suggestions) {
      // Open modal showing social posts
      window.alert(`Twitter:\n${result.suggestions[0]?.content}\n\nLinkedIn:\n${result.suggestions[1]?.content}\n\nInstagram:\n${result.suggestions[2]?.content}`);
    }
  };

  const handleContinueWrite = async () => {
    // Generate continuation based on existing content
    const result = await callAI('write', {
      topic: `Lanjutkan artikel dengan judul "${title}"`,
      outline: [content.slice(-500)], // Last 500 chars as context
    });
    if (result?.article?.content) {
      onUpdateContent(content + '\n\n' + result.article.content);
    }
  };

  const actions = [
    { id: 'summarize', label: '✂️ Buat Ringkasan', handler: handleSummarize },
    { id: 'auto-tag', label: '🏷️ Auto-Tag', handler: handleAutoTag },
    { id: 'social', label: '📱 Generate Social Posts', handler: handleGenerateSocial },
    { id: 'continue', label: '✍️ Lanjutkan Menulis', handler: handleContinueWrite },
  ];

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium flex items-center gap-2">🤖 AI Writing Assistant</h3>
      </div>
      <div className="p-3 space-y-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.handler}
            disabled={loading === action.id || !content}
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            {loading === action.id ? '⏳ Memproses...' : action.label}
          </button>
        ))}
      </div>
      <div className="p-3 border-t bg-gray-50">
        <p className="text-xs text-gray-500">
          AI menggunakan GPT-4o. Hasil AI sebaiknya direview sebelum dipublikasikan.
        </p>
      </div>
    </div>
  );
}
```

### 1.3 AI Batch Generate Workflow

Untuk produksi konten massal, implementasi endpoint batch:

```typescript
// src/modules/ai/ai.routes.ts (tambahan)
router.post('/ai/batch-write', authMiddleware, async (req, res) => {
  const { topics } = req.body; // Array of { topic, outline? }

  if (!Array.isArray(topics) || topics.length > 5) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Max 5 topics per batch' },
    });
  }

  const results = [];
  for (const item of topics) {
    try {
      const result = await contentAgent.execute({
        task: 'write article',
        data: { topic: item.topic, outline: item.outline },
        toolChoice: 'writeArticle',
      });

      const article = await prisma.article.create({
        data: {
          user_id: req.user.id,
          title: result.title,
          content: result.content,
          slug: generateSlug(result.title),
          status: 'draft',
        },
      });
      results.push({ success: true, article });
    } catch (error) {
      results.push({ success: false, topic: item.topic, error: 'AI generation failed' });
    }
  }

  res.json({ success: true, data: { total: topics.length, succeeded: results.filter(r => r.success).length, results } });
});
```

---

## 2. SEO Optimization

### 2.1 SEO Metadata untuk Artikel

```tsx
// src/app/articles/[slug]/page.tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import ArticleJsonLd from '@/components/seo/ArticleJsonLd';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { tags: { include: { tag: true } } },
  });

  if (!article) return { title: 'Artikel Tidak Ditemukan' };

  const description = article.summary || article.content.slice(0, 160);
  const keywords = article.tags.map(t => t.tag.name).join(', ');

  return {
    title: `${article.title} | AI Content Hub`,
    description,
    keywords,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.created_at.toISOString(),
      authors: [article.author?.name || 'Author'],
      tags: article.tags.map(t => t.tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, status: 'published' },
    include: { tags: { include: { tag: true } }, author: true },
  });

  if (!article) return <div className="p-8 text-center"><h1>Artikel tidak ditemukan</h1></div>;

  return (
    <>
      <ArticleJsonLd article={article} />
      <article className="max-w-3xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex gap-2 mb-4">
            {article.tags.map(t => (
              <span key={t.tag.id} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {t.tag.name}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Oleh {article.author.name} — {new Date(article.created_at).toLocaleDateString('id-ID', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
          {article.summary && (
            <blockquote className="mt-4 p-4 bg-gray-50 border-l-4 border-blue-500 italic text-gray-700">
              {article.summary}
            </blockquote>
          )}
        </header>
        <div className="prose lg:prose-lg max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
    </>
  );
}
```

### 2.2 JSON-LD Structured Data

```tsx
// src/components/seo/ArticleJsonLd.tsx
export default function ArticleJsonLd({ article }: { article: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.content.slice(0, 160),
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Author',
    },
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    keywords: article.tags?.map((t: any) => t.tag.name).join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 2.3 Sitemap Generator

```tsx
// src/app/sitemap.ts
import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = 'https://content-hub.vercel.app';

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updated_at: true },
  });

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/tags`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ];

  const articlePages = articles.map(article => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
```

---

## 3. Deployment

### 3.1 Docker Configuration

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: contenthub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/contenthub
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

### 3.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-name: ai-content-hub
          vercel-args: '--prod'
```

---

## 4. Analytics

### 4.1 View Tracking

```typescript
// src/middleware/analytics.ts
import { prisma } from '@/lib/prisma';

export async function trackArticleView(articleId: string, ip?: string) {
  // Increment view count (every 24h per IP)
  const today = new Date().toISOString().split('T')[0];
  
  const existing = await prisma.articleView.findFirst({
    where: { article_id: articleId, ip, date: today },
  });

  if (!existing) {
    await prisma.articleView.create({
      data: { article_id: articleId, ip, date: today },
    });
    
    await prisma.article.update({
      where: { id: articleId },
      data: { view_count: { increment: 1 } },
    });
  }
}
```

### 4.2 Dashboard Analytics

```typescript
// src/app/api/dashboard/analytics/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalViews, totalArticles, articlesByDay, topArticles] = await Promise.all([
    // Total views last 30 days
    prisma.articleView.count({
      where: { date: { gte: thirtyDaysAgo.toISOString().split('T')[0] } },
    }),
    // Total published articles
    prisma.article.count({ where: { status: 'published' } }),
    // Views per day (last 7 days)
    prisma.$queryRaw`
      SELECT date, COUNT(*) as views
      FROM article_views
      WHERE date >= NOW() - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date
    `,
    // Top 5 articles by views
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { view_count: 'desc' },
      take: 5,
      select: { title: true, slug: true, view_count: true },
    }),
  ]);

  return Response.json({
    totalViews,
    totalArticles,
    articlesByDay,
    topArticles,
  });
}
```

---

## 5. Latihan

> **Latihan 1:** AI Writing Panel
> Buat komponen AI Actions Panel yang terintegrasi dengan editor artikel. Implementasi 4 aksi: Summarize (tambah ringkasan di atas konten), Auto-Tag (generate tags), Generate Social (tampilkan modal), Continue Write (lanjutkan paragraf).

> **Latihan 2:** SEO Metadata & Open Graph
> Implementasi generateMetadata untuk halaman artikel. Sertakan: title, description, keywords, Open Graph (title, description, type, publishedTime, tags), Twitter card. Validasi dengan Facebook Sharing Debugger.

> **Latihan 3:** JSON-LD Structured Data
> Implementasi komponen ArticleJsonLd yang menyisipkan schema.org/Article JSON-LD di halaman artikel. Validasi dengan Google Rich Results Test. Target: minimal 1 rich result terdeteksi.

> **Latihan 4:** Docker Multi-Stage Build
> Buat Dockerfile multi-stage untuk Next.js app. Stage 1: builder (install dependencies, build). Stage 2: runner (hanya copy .next, node_modules, public). Pastikan image size < 300MB.

> **Latihan 5:** Sitemap & Robots
> Buat sitemap.xml yang mencakup semua published articles dan static pages. Buat robots.txt yang mengizinkan semua crawler. Submit sitemap ke Google Search Console.

> **Latihan 6:** Analytics Dashboard
> Implementasi endpoint analytics yang mengembalikan: total views (30 hari), views per day (7 hari), top 5 articles. Buat halaman dashboard dengan chart sederhana (gunakan Chart.js atau buat CSS chart).

> **Latihan 7:** Deploy & Verify
> Deploy aplikasi ke Vercel. Setup custom domain (opsional). Verifikasi: (a) semua halaman bisa diakses, (b) AI endpoints berfungsi, (c) SEO metadata muncul di view source, (d) sitemap.xml accessible.

---

## 📊 Evaluation Rubric (Sesi 3)

| Kriteria | Bobot | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|-------|---------------|----------|----------|----------|
| **AI Writing Features** | 25% | 4 tools berfungsi, error handling, fallback, batch write | 3 tools berfungsi | 2 tools berfungsi | < 2 tools |
| **SEO Optimization** | 20% | Metadata + OG + JSON-LD + sitemap, Lighthouse ≥90 | Metadata + OG + sitemap | Metadata minimal | Tidak ada SEO |
| **Deployment** | 20% | Docker multi-stage, deployed Vercel, CI/CD hijau | Deployed, Docker ada | Deploy manual | Tidak deploy |
| **Analytics** | 15% | View tracking, dashboard chart, top articles | View tracking, dashboard | View tracking basic | Tidak ada |
| **UI/UX** | 10% | Responsive, loading states, error handling, preview mode | Responsif, loading states | Beberapa halaman tidak rapi | UI berantakan |
| **Code Quality** | 10% | TypeScript strict, modular, error handling, lint clean | TS strict, minor issues | TS loose | JS tanpa type |

---

## 💡 Tips

- **SEO is important**: Artikel tanpa SEO tidak akan ditemukan Google. Prioritaskan metadata dan structured data.
- **Analytics sederhana**: Tidak perlu Google Analytics — cukup simpan view count di database untuk dashboard.
- **Deploy early**: Deploy di minggu 2 agar bisa test AI endpoint di production environment.
- **Rate limit AI**: Tambahkan rate limit 20 request/jam/user untuk AI endpoints agar biaya terkontrol.
- **Content preview**: Pastikan mode preview bisa render markdown dengan benar sebelum publikasi.

---

| [← Sesi 2: Frontend & CMS](02-frontend-cms.md) | [Kembali ke README →](README.md) |
|---|---|
