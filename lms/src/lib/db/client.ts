import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDB(platform: App.Platform) {
	if (!cachedDb) {
		cachedDb = drizzle(platform.env.DB, { schema });
	}
	return cachedDb;
}
