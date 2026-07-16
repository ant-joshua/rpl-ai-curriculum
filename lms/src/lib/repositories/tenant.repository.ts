import { eq } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { tenants } from '$lib/db/schema';

export class TenantRepository {
	constructor(private platform: App.Platform) {}

	async findAll() {
		return getDB(this.platform).select().from(tenants).all();
	}

	async findById(id: string) {
		return getDB(this.platform).select().from(tenants).where(eq(tenants.id, id)).get();
	}

	async findBySlug(slug: string) {
		return getDB(this.platform).select().from(tenants).where(eq(tenants.slug, slug)).get();
	}

	async create(data: {
		name: string;
		slug: string;
		type: string;
		ownerId: string;
		config?: Record<string, any>;
	}) {
		return getDB(this.platform).insert(tenants).values({
			id: crypto.randomUUID(),
			name: data.name,
			slug: data.slug,
			type: data.type,
			ownerId: data.ownerId,
			config: JSON.stringify(data.config || {}),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}).returning().get();
	}

	async update(id: string, data: Partial<{
		name: string;
		slug: string;
		type: string;
		config: string;
		features: string;
		logoUrl: string;
		primaryColor: string;
		isActive: number;
	}>) {
		return getDB(this.platform).update(tenants).set({
			...data,
			updatedAt: new Date().toISOString(),
		}).where(eq(tenants.id, id)).returning().get();
	}

	async deactivate(id: string) {
		return this.update(id, { isActive: 0 });
	}
}
