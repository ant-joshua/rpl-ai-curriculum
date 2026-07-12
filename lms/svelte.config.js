import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				exclude: ['<_app/*>', '<content/*>', '<pdfs/*>', '<build/*>']
			}
		}),
		alias: {
			$content: '../'
		}
	}
};

export default config;
