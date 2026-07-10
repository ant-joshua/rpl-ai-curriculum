import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>', '/content/*']
			}
		}),
		alias: {
			$content: '../'
		}
	}
};

export default config;
