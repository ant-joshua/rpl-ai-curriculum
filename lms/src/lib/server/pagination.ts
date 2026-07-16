export interface PaginationParams {
	page: number;
	limit: number;
	search?: string;
	offset: number;
}

export function getPaginationParams(url: URL): PaginationParams {
	const rawPage = parseInt(url.searchParams.get('page') || '0');
	const rawLimit = parseInt(url.searchParams.get('limit') || '20');
	// page=0 or limit=0 means return all (backward compat)
	const page = rawPage < 0 ? 0 : rawPage;
	const limit = (rawLimit === 0 || rawPage === 0) ? 0 : Math.min(50, Math.max(1, rawLimit));
	const search = url.searchParams.get('search') || undefined;
	const offset = page > 0 ? (page - 1) * limit : 0;
	return { page, limit, search, offset };
}

export function buildSearchCondition(
	search: string | undefined,
	searchColumns: string[],
	params: unknown[],
	prefix?: string
): string {
	if (!search || searchColumns.length === 0) return '';
	const p = prefix ? `${prefix}.` : '';
	const conditions = searchColumns.map(col => `${p}${col} LIKE ?`);
	searchColumns.forEach(() => params.push(`%${search}%`));
	return conditions.join(' OR ');
}

export interface PaginatedResult<T> {
	rows: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export async function paginatedQuery<T>(
	db: any, // D1Database
	baseQuery: string,
	countQuery: string,
	params: unknown[],
	pagination: PaginationParams
): Promise<PaginatedResult<T>> {
	const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
	const total = countResult?.total || 0;

	// page=0 or limit=0 means return all (backward compat)
	if (pagination.page === 0 || pagination.limit === 0) {
		const rows = await db.prepare(baseQuery + ' ORDER BY created_at DESC').bind(...params).all<T>();
		return { rows: rows.results || [], total, page: 0, limit: 0, totalPages: 1 };
	}

	const sql = `${baseQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
	const rows = await db.prepare(sql).bind(...params, pagination.limit, pagination.offset).all<T>();

	return {
		rows: rows.results || [],
		total,
		page: pagination.page,
		limit: pagination.limit,
		totalPages: Math.ceil(total / pagination.limit),
	};
}
