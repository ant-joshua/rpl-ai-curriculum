function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

type SupportedLanguage = 'python' | 'java' | 'cpp' | 'js' | 'html';

const SUPPORTED: Record<SupportedLanguage, { runnable: boolean; message: string }> = {
	python: { runnable: true, message: 'Python execution via eval (limited)' },
	java: { runnable: false, message: 'Java compilation requires a backend server — copy code to local IDE' },
	cpp: { runnable: false, message: 'C++ compilation requires a backend server — copy code to local IDE' },
	js: { runnable: true, message: 'JavaScript execution via eval' },
	html: { runnable: true, message: 'HTML rendered in iframe' },
};

export async function POST({ request }: { request: Request }): Promise<Response> {
	try {
		const body: { language?: string; code?: string } = await request.json();
		const lang = (body.language || '').toLowerCase() as SupportedLanguage;
		const code = body.code || '';

		if (!code) {
			return json({ success: false, error: 'code required' }, 400);
		}

		const info = SUPPORTED[lang];
		if (!info) {
			return json({
				success: false,
				error: `Language "${lang}" not supported. Supported: ${Object.keys(SUPPORTED).join(', ')}`,
			}, 400);
		}

		if (!info.runnable) {
			return json({
				success: true,
				runnable: false,
				message: info.message,
				stdout: '',
				stderr: '',
			});
		}

		// For runnable languages (js, python), execute via eval
		try {
			let result: string;

			if (lang === 'js') {
				// Capture console.log output
				const logs: string[] = [];
				const mockConsole = {
					log: (...args: any[]) => logs.push(args.map(String).join(' ')),
					error: (...args: any[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
					warn: (...args: any[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
					info: (...args: any[]) => logs.push('[INFO] ' + args.map(String).join(' ')),
				};

				const fn = new Function('console', code);
				fn(mockConsole);
				result = logs.join('\n');
			} else if (lang === 'python') {
				// Very limited Python-like eval using JavaScript
				// Transform basic Python to JS for simple expressions
				const logs: string[] = [];
				const mockConsole = {
					log: (...args: any[]) => logs.push(args.map(String).join(' ')),
				};

				// Simple Python print statements -> JS console.log
				const jsCode = code
					.replace(/^print\(/gm, 'console.log(')
					.replace(/^print /gm, 'console.log(');

				try {
					const fn = new Function('console', jsCode);
					fn(mockConsole);
					result = logs.join('\n');
				} catch {
					// If transformation fails, run as-is
					const fn = new Function('console', code);
					fn(mockConsole);
					result = logs.join('\n');
				}
			} else {
				result = 'Execution not available for ' + lang;
			}

			return json({
				success: true,
				runnable: true,
				message: info.message,
				stdout: result,
				stderr: '',
			});
		} catch (execError: unknown) {
			const errMsg = execError instanceof Error ? execError.message : String(execError);
			return json({
				success: true,
				runnable: true,
				message: info.message,
				stdout: '',
				stderr: errMsg,
			});
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
