import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Live smoke tests hit the production API — they need a token budget
		// and can 429 under shared CI IPs. Run them only when SMOKE=1.
		testNamePattern: process.env.SMOKE === '1' ? undefined : '^(?!.*API smoke).*',
		testTimeout: 30000,
		hookTimeout: 30000,
		// API smoke tests hit live endpoints — run serially to avoid
		// shared-state races (register unique emails, etc.)
		fileParallelism: false,
		coverage: {
			provider: 'v8',
			include: ['src/lib/server/**', 'src/lib/stores/**'],
			exclude: ['**/*.d.ts', '**/*.svelte.ts'],
		},
	},
});
