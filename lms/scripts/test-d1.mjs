#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let exitCode = 0;

function check(ok, msg) {
	if (!ok) {
		console.error(`FAIL: ${msg}`);
		exitCode = 1;
	} else {
		console.log(`PASS: ${msg}`);
	}
}

// 1. Check wrangler.toml has D1 binding
const wrangler = readFileSync(resolve(root, 'wrangler.toml'), 'utf-8');
check(wrangler.includes('[[d1_databases]]'), 'wrangler.toml has [[d1_databases]]');
check(wrangler.includes('binding = "DB"'), 'wrangler.toml has DB binding');
check(wrangler.includes('database_name = "rpl-ai-lms-db"'), 'wrangler.toml has database_name');
check(wrangler.includes('database_id = "505dca85-f77a-4d00-a3ae-ce0ce2d91e9a"'), 'wrangler.toml has database_id');

// 2. Check migration file exists
check(existsSync(resolve(root, 'migrations/0001_init.sql')), 'migrations/0001_init.sql exists');

const migration = readFileSync(resolve(root, 'migrations/0001_init.sql'), 'utf-8');
check(migration.includes('CREATE TABLE IF NOT EXISTS users'), 'migration has users table');
check(migration.includes('CREATE TABLE IF NOT EXISTS progress'), 'migration has progress table');
check(migration.includes('CREATE TABLE IF NOT EXISTS bookmarks'), 'migration has bookmarks table');
check(migration.includes('CREATE TABLE IF NOT EXISTS notes'), 'migration has notes table');
check(migration.includes('CREATE TABLE IF NOT EXISTS activity_log'), 'migration has activity_log table');

// 3. Check API route files exist and export named functions
const apiRoutes = [
	{ path: 'src/routes/api/progress/+server.ts', exports: ['GET', 'POST', 'DELETE', 'OPTIONS'] },
	{ path: 'src/routes/api/bookmarks/+server.ts', exports: ['GET', 'POST', 'OPTIONS'] },
	{ path: 'src/routes/api/notes/+server.ts', exports: ['GET', 'POST', 'OPTIONS'] },
	{ path: 'src/routes/api/activity/+server.ts', exports: ['GET', 'POST', 'OPTIONS'] },
	{ path: 'src/routes/api/user/+server.ts', exports: ['GET', 'POST', 'OPTIONS'] },
];

for (const route of apiRoutes) {
	const fullPath = resolve(root, route.path);
	check(existsSync(fullPath), `${route.path} exists`);

	if (existsSync(fullPath)) {
		const content = readFileSync(fullPath, 'utf-8');
		for (const fn of route.exports) {
			check(
				content.includes(`export async function ${fn}`) || content.includes(`export function ${fn}`),
				`${route.path} exports ${fn}`
			);
		}
	}
}

// 4. Check d1 helper
const d1Path = resolve(root, 'src/lib/server/d1.ts');
check(existsSync(d1Path), 'src/lib/server/d1.ts exists');
if (existsSync(d1Path)) {
	const content = readFileSync(d1Path, 'utf-8');
	check(content.includes('getDB'), 'd1.ts exports getDB');
	check(content.includes('getDeviceId'), 'd1.ts exports getDeviceId');
}

// 5. Check api utils
const apiPath = resolve(root, 'src/lib/utils/api.ts');
check(existsSync(apiPath), 'src/lib/utils/api.ts exists');
if (existsSync(apiPath)) {
	const content = readFileSync(apiPath, 'utf-8');
	check(content.includes('export ') && (content.includes('api') || content.includes('getDeviceId')), 'api.ts has exports');
}

// 6. Check app.d.ts has D1 types
const appDTs = readFileSync(resolve(root, 'src/app.d.ts'), 'utf-8');
check(appDTs.includes('interface D1Database'), 'app.d.ts has D1Database interface');
check(appDTs.includes('interface D1PreparedStatement'), 'app.d.ts has D1PreparedStatement interface');
check(appDTs.includes('interface D1Result'), 'app.d.ts has D1Result interface');
check(appDTs.includes('DB: D1Database'), 'app.d.ts has DB in Platform.env');

console.log(`\n${exitCode === 0 ? 'ALL PASS' : 'SOME FAILED'}`);
process.exit(exitCode);
