import { jsonResponse, getDB } from '$lib/server/d1';

/** POST /api/admin/export-import/backup — create a full tenant backup */
export async function POST({ platform, locals }: { platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const bucket = (platform.env as any).ASSETS_BUCKET;
		if (!bucket) return jsonResponse({ success: false, error: 'R2 bucket tidak dikonfigurasi' }, 500);

		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const tenantName = locals.tenant?.name || 'Default';

		// 1. Get all tables
		const { results: tables } = await db
			.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
			.all() as any;

		if (!tables || tables.length === 0) {
			return jsonResponse({ success: false, error: 'Tidak ada tabel ditemukan' }, 500);
		}

		// 2. Determine which tables have tenant_id column
		const { results: tenantTables } = await db
			.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND sql LIKE '%tenant_id%'`)
			.all() as any;

		const hasTenantId = new Set((tenantTables || []).map((t) => t.name));

		// 3. Export data per table
		const exportData: Record<string, any[]> = {};

		for (const t of tables) {
			const tableName = t.name;
			// Skip internal system tables
			if (tableName.startsWith('sqlite_') || tableName === 'tenants' || tableName === 'tenant_users')
				continue;

			try {
				let rows: any[];
				if (hasTenantId.has(tableName)) {
					const res = await db
						.prepare(`SELECT * FROM "${tableName}" WHERE tenant_id = ?`)
						.bind(tenantId)
						.all<any>();
					rows = res.results || [];
				} else {
					const res = await db.prepare(`SELECT * FROM "${tableName}"`).all<any>();
					rows = res.results || [];
				}
				if (rows.length > 0) exportData[tableName] = rows;
			} catch {
				// Skip tables that fail (e.g. virtual tables, views)
			}
		}

		// 4. Build backup payload
		const backup = {
			exported_at: new Date().toISOString(),
			tenant_id: tenantId,
			tenant_name: tenantName,
			version: 1,
			tables: exportData,
		};

		// 5. Compress with gzip via CompressionStream
		const jsonStr = JSON.stringify(backup);
		const encoder = new TextEncoder();
		const encoded = encoder.encode(jsonStr);
		const compressed = await new Response(
			new Blob([encoded]).stream().pipeThrough(new CompressionStream('gzip'))
		).arrayBuffer();

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const key = `backups/${tenantId}/${timestamp}-backup.json.gz`;

		await bucket.put(key, compressed, {
			httpMetadata: { contentType: 'application/json' },
			customMetadata: {
				tenantId,
				tenantName,
				exportedAt: backup.exported_at,
				tableCount: String(Object.keys(exportData).length),
				rowCount: String(Object.values(exportData).reduce((a, r) => a + r.length, 0)),
			},
		});

		return jsonResponse({
			success: true,
			data: {
				key,
				tenantId,
				exportedAt: backup.exported_at,
				tables: Object.keys(exportData).length,
				rows: Object.values(exportData).reduce((a, r) => a + r.length, 0),
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
