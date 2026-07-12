import { browser } from '$app/environment';
import { api } from '$lib/utils/api';
import { modules } from './modules';

/**
 * Analyze weak topics from progress data
 */
export function analyzeWeakTopics(
  progress: { getModuleProgress: (slug: string) => number },
  modulesList: typeof modules
): string[] {
  const weak: string[] = [];
  for (const mod of modulesList) {
    const pct = progress.getModuleProgress(mod.slug);
    if (pct > 0 && pct < 50) {
      weak.push(mod.slug);
    }
  }
  return weak;
}

/**
 * Get next recommended modules based on current progress and path
 */
export function getNextModules(
  progress: { isSessionCompleted: (slug: string, sessionId: string) => boolean },
  paths: { slug: string; modules: string[] }[],
  currentPath?: string
): { moduleSlug: string; moduleTitle: string; pathSlug: string; pathTitle: string }[] {
  const suggestions: { moduleSlug: string; moduleTitle: string; pathSlug: string; pathTitle: string }[] = [];

  const pathsToCheck = currentPath
    ? paths.filter(p => p.slug === currentPath)
    : paths;

  for (const path of pathsToCheck) {
    for (const modSlug of path.modules) {
      const mod = modules.find(m => m.slug === modSlug);
      if (!mod) continue;

      // If the module has any incomplete session, suggest it
      const incomplete = mod.sessions.some(s => !progress.isSessionCompleted(modSlug, s.id));
      if (incomplete) {
        suggestions.push({
          moduleSlug: modSlug,
          moduleTitle: mod.title,
          pathSlug: path.slug,
          pathTitle: (path as any).title || path.slug,
        });
        break; // Only suggest first incomplete per path
      }
    }
  }

  return suggestions;
}

/**
 * Fetch AI recommendations from the API
 */
async function getRecommendations(userId?: string): Promise<{
  recommendations: string[];
  weak_topics: string[];
  suggestion: string;
}> {
  if (!browser) return { recommendations: [], weak_topics: [], suggestion: '' };
  try {
    const res = await api<{
      recommendations: string[];
      weak_topics: string[];
      suggestion: string;
    }>('/api/recommendations');
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // offline
  }
  return { recommendations: [], weak_topics: [], suggestion: '' };
}

export { getRecommendations };
