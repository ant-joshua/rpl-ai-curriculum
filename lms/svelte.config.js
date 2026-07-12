import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				exclude: ['<all>']
			}
		}),
		alias: {
			$content: '../'
		}
	}
};

export default config;
