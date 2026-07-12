// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface D1Database {
	prepare(sql: string): D1PreparedStatement;
	dump(): Promise<ArrayBuffer>;
	exec(sql: string): Promise<D1Result>;
	batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface D1PreparedStatement {
	bind(...values: any[]): D1PreparedStatement;
	first(col?: string): Promise<any>;
	run(): Promise<D1Result>;
	all(): Promise<D1Result>;
	raw(): Promise<any[]>;
}

interface D1Result {
	results?: any[];
	success: boolean;
	error?: string;
	meta?: any;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
				env: {
					DB: D1Database;
					ASSETS_BUCKET: R2Bucket;
				};
			}
	}
}

export {};
