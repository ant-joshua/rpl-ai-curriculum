import { modules } from '$lib/stores/modules';

export function GET() {
  const feed = modules.map((m) => ({
    slug: m.slug,
    title: m.title,
    level: m.level,
    sessions: m.sessions.length,
    description: m.description,
  }));

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
