import { modules } from '$lib/stores/modules';

export function GET() {
  const siteUrl = 'https://lms-syllabus.ant-joshua.my.id';

  const items = modules.map((m) => {
    const sessionsTotal = m.sessions.length;
    return `
    <item>
      <title>${escapeXml(m.title)}</title>
      <link>${siteUrl}/module/${m.slug}</link>
      <guid>${siteUrl}/module/${m.slug}</guid>
      <description>Level: ${m.level} | ${sessionsTotal} sesi — ${escapeXml(m.description)}</description>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>RPL AI Curriculum</title>
  <link>${siteUrl}</link>
  <description>57 Modul Belajar Pengembangan Software Berbasis AI</description>
  <language>id</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${siteUrl}/api/feed" rel="self" type="application/rss+xml"/>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
