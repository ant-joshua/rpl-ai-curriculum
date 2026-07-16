import { sqliteTable, text, integer, uniqueIndex, sql } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').unique().notNull(),
	type: text('type').$type<'lms' | 'academic_k13' | 'university' | 'bimbel' | 'tutor' | 'kelompok'>().notNull(),
	subdomain: text('subdomain').unique(),
	customDomain: text('custom_domain').unique(),
	logoUrl: text('logo_url'),
	primaryColor: text('primary_color').default('#6c5ce7'),
	config: text('config').default('{}'),
	features: text('features').default('{}'),
	isActive: integer('is_active').default(1),
	ownerId: text('owner_id'),
	createdAt: text('created_at').default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const tenantUsers = sqliteTable('tenant_users', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	userId: text('user_id').notNull(),
	role: text('role').notNull(),
	status: text('status').default('active'),
	joinedAt: text('joined_at').default(sql`(datetime('now'))`),
}, (table) => ({
	tenantUserIdx: uniqueIndex('idx_tenant_user').on(table.tenantId, table.userId),
}));
