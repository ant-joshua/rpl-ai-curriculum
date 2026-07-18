interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const queryCache = new Map<string, CacheEntry>();

const DEFAULT_TTL = 60_000; // 1 minute

/**
 * Cache-aware D1 query wrapper for `.all()` queries.
 * Returns cached result if fresh, otherwise executes and caches.
 */
export function cachedDbQuery<T = any>(
  db: any,
  sql: string,
  params: unknown[] = [],
  ttl: number = DEFAULT_TTL
): Promise<{ results?: T[] } & any> {
  const key = sql + '|' + JSON.stringify(params);
  const cached = queryCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.data as any);
  }
  return db.prepare(sql).bind(...params).all<T>().then((result: any) => {
    queryCache.set(key, { data: result, expiresAt: Date.now() + ttl });
    return result;
  });
}

/**
 * Cache-aware D1 query wrapper for `.first()` queries.
 */
export function cachedDbFirst<T = any>(
  db: any,
  sql: string,
  params: unknown[] = [],
  ttl: number = DEFAULT_TTL
): Promise<T | null> {
  const key = sql + '|' + JSON.stringify(params) + '|first';
  const cached = queryCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.data as T | null);
  }
  return db.prepare(sql).bind(...params).first<T>().then((result: T | null) => {
    queryCache.set(key, { data: result, expiresAt: Date.now() + ttl });
    return result;
  });
}

/**
 * Invalidate cached queries.
 * - If pattern is provided, only entries whose cache key starts with pattern are removed.
 * - If no pattern, entire cache is cleared.
 */
export function invalidateCache(pattern?: string): void {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.startsWith(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

/**
 * Clear entire cache — same as invalidateCache(). Alias for ergonomics.
 */
export function clearQueryCache(): void {
  queryCache.clear();
}
