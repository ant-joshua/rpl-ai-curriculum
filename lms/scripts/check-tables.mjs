// Quick script to check existing D1 table schemas
// Run: npx wrangler d1 execute rpl-ai-lms-db --remote --file=scripts/check-tables.mjs
// But this is SQL — let's just output SQL queries manually
console.log(`Run these on D1 via:
npx wrangler d1 execute rpl-ai-lms-db --remote --command="PRAGMA table_info(notes)"
npx wrangler d1 execute rpl-ai-lms-db --remote --command="PRAGMA table_info(bookmarks)"
npx wrangler d1 execute rpl-ai-lms-db --remote --command="PRAGMA table_info(progress)"
npx wrangler d1 execute rpl-ai-lms-db --remote --command="SELECT id, name FROM _cf_MIGRATIONS ORDER BY id DESC limit 5"
`);
