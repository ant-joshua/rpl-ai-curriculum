import { modules, type Module } from '$lib/stores/modules';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  path_slug: string | null;
  priority: string;
  active: number;
  created_at: string;
  updated_at: string;
}

// ── Announcements state store ──
let announcements = $state<Announcement[]>([]);

export function getAnnouncements() {
  return announcements;
}

export async function loadAnnouncements(pathSlug?: string) {
  try {
    const params = pathSlug ? `?path_slug=${encodeURIComponent(pathSlug)}` : '';
    const res = await fetch(`/api/announcements${params}`);
    const json = await res.json();
    if (json.success && json.data) {
      announcements = json.data;
    }
  } catch {
    // offline
  }
}

export async function createAnnouncement(title: string, content: string, pathSlug?: string) {
  try {
    const admin = typeof localStorage !== 'undefined' ? localStorage.getItem('lms-admin') : null;
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin': admin || '' },
      body: JSON.stringify({ title, content, path_slug: pathSlug || null }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      announcements = [json.data, ...announcements];
    }
    return json;
  } catch {
    return { success: false, error: 'offline' };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const admin = typeof localStorage !== 'undefined' ? localStorage.getItem('lms-admin') : null;
    const res = await fetch(`/api/announcements`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin': admin || '' },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      announcements = announcements.filter(a => a.id !== id);
    }
    return json;
  } catch {
    return { success: false, error: 'offline' };
  }
}
