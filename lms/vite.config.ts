import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				routes: {
					include: ['/*'],
					exclude: ['<all>']
				}
			})
		})
	],
	resolve: {
		alias: {
			// Redirect 'lowlight' → lowlight/lib/index.js (only createLowlight, no grammar bundles).
			// Bypasses lowlight's package.json "exports" field which only exposes index.js.
			// This avoids bundling 800KB of highlight.js language definitions.
			'lowlight': path.resolve(__dirname, 'node_modules/lowlight/lib/index.js')
		}
	}
});
