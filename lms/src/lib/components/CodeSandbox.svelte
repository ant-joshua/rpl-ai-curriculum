<script lang="ts">
	let {
		code = $bindable(''),
		autoRun = true,
		debounceMs = 500,
	}: {
		code?: string;
		autoRun?: boolean;
		debounceMs?: number;
	} = $props();

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let logs = $state<{ type: string; args: string[]; timestamp: number }[]>([]);
	let consoleCollapsed = $state(false);
	let errorCount = $state(0);
	let warnCount = $state(0);

	// Inject console capture script into the code
	function wrapWithCapture(src: string): string {
		const captureScript = `<script>
(function() {
	// Prevent double-injection
	if (window.__consoleCaptured) return;
	window.__consoleCaptured = true;

	const originalConsole = {};
	['log', 'warn', 'error', 'info', 'debug'].forEach(function(method) {
		originalConsole[method] = console[method];
		console[method] = function() {
			var args = Array.prototype.slice.call(arguments);
			var serialized = args.map(function(a) {
				try {
					if (a === null) return 'null';
					if (a === undefined) return 'undefined';
					if (typeof a === 'object') return JSON.stringify(a, null, 2);
					return String(a);
				} catch(e) {
					return '[unserializable]';
				}
			});
			window.parent.postMessage({
				type: 'console:' + method,
				args: serialized,
				timestamp: Date.now()
			}, '*');
			originalConsole[method].apply(console, args);
		};
	});

	// Global error handler
	window.onerror = function(msg, url, line, col, err) {
		var detail = msg;
		if (err && err.stack) detail = err.stack;
		window.parent.postMessage({
			type: 'console:error',
			args: [detail],
			timestamp: Date.now()
		}, '*');
		return false;
	};

	// Unhandled promise rejections
	window.addEventListener('unhandledrejection', function(e) {
		var reason = e.reason;
		var detail = reason && reason.stack ? reason.stack : String(reason || 'Unhandled Promise rejection');
		window.parent.postMessage({
			type: 'console:error',
			args: ['[unhandledrejection] ' + detail],
			timestamp: Date.now()
		}, '*');
	});
})();
<\/script>`;
		return captureScript + '\n' + src;
	}

	function buildSrcdoc(): string {
		return wrapWithCapture(code || '');
	}

	let srcdoc = $derived(buildSrcdoc());

	// Debounced auto-run
	let runTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		// Access code to track reactivity
		const _ = code;
		if (!autoRun) return;
		clearTimeout(runTimer);
		runTimer = setTimeout(() => {
			// Re-render iframe by updating srcdoc key
			iframeKey = Date.now();
		}, debounceMs);
		return () => clearTimeout(runTimer);
	});

	// Manual run
	let iframeKey = $state(0);

	function handleRun() {
		iframeKey = Date.now();
	}

	function handleClearConsole() {
		logs = [];
		errorCount = 0;
		warnCount = 0;
	}

	// Listen for console messages from iframe
	function handleMessage(e: MessageEvent) {
		if (!e.data || typeof e.data.type !== 'string' || !e.data.type.startsWith('console:')) return;
		const method = e.data.type.replace('console:', '') as string;
		logs = [...logs, { type: method, args: e.data.args || [], timestamp: e.data.timestamp || Date.now() }];
		if (method === 'error') errorCount++;
		if (method === 'warn') warnCount++;
		// Auto-expand console on first error
		if (method === 'error' && consoleCollapsed) consoleCollapsed = false;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	});

	function toggleConsole() {
		consoleCollapsed = !consoleCollapsed;
	}

	// Format timestamp for display
	function fmtTime(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleTimeString('id-ID', { hour12: false });
	}

	function logIcon(type: string): string {
		switch(type) {
			case 'error': return '❌';
			case 'warn': return '⚠️';
			case 'info': return 'ℹ️';
			case 'debug': return '🔍';
			default: return '📋';
		}
	}
</script>

<div class="codesandbox">
	<div class="sandbox-toolbar">
		<div class="toolbar-left">
			<button class="toolbar-btn run-btn" onclick={handleRun} title="Jalankan ulang kode">
				▶️ Run
			</button>
			<button class="toolbar-btn" onclick={handleClearConsole} title="Hapus console output">
				🗑️ Clear Console
			</button>
		</div>
		<div class="toolbar-right">
			<button class="toolbar-btn console-toggle" onclick={toggleConsole} title="Toggle console panel">
				<span class="console-badge" class:has-errors={errorCount > 0}>
					📟 Console
					{#if logs.length > 0}
						<span class="badge-count">
							{errorCount > 0 ? `${errorCount} err` : `${logs.length}`}
						</span>
					{/if}
				</span>
				<span class="toggle-arrow">{consoleCollapsed ? '▼' : '▲'}</span>
			</button>
		</div>
	</div>

	<div class="sandbox-preview">
		<iframe
			bind:this={iframeEl}
			class="preview-frame"
			title="Code Preview"
			sandbox="allow-scripts allow-same-origin"
			srcdoc={srcdoc}
		></iframe>
	</div>

	<div class="console-panel" class:collapsed={consoleCollapsed}>
		<div class="console-header">
			<span class="console-title">Console Output</span>
			{#if logs.length > 0}
				<span class="console-count">{logs.length} message{logs.length !== 1 ? 's' : ''}</span>
			{/if}
		</div>
		<div class="console-output">
			{#if logs.length === 0}
				<div class="console-empty">
					<span class="console-empty-icon">📟</span>
					<span>Tidak ada output console. Klik <strong>Run</strong> untuk menjalankan kode.</span>
				</div>
			{:else}
				{#each logs as log, i}
					<div class="console-entry" class:entry-error={log.type === 'error'} class:entry-warn={log.type === 'warn'} class:entry-info={log.type === 'info'}>
						<div class="entry-header">
							<span class="entry-icon">{logIcon(log.type)}</span>
							<span class="entry-type">{log.type.toUpperCase()}</span>
							<span class="entry-time">{fmtTime(log.timestamp)}</span>
						</div>
						{#each log.args as arg}
							<pre class="entry-arg">{arg}</pre>
						{/each}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.codesandbox {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.sandbox-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.4rem 0.75rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.toolbar-left, .toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0.35rem 0.7rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
		white-space: nowrap;
	}

	.toolbar-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.run-btn {
		background: #27ae60;
		color: #fff;
		border-color: #27ae60;
	}

	.run-btn:hover {
		background: #2ecc71;
		border-color: #2ecc71;
		color: #fff;
	}

	.console-toggle {
		border-color: transparent;
	}

	.console-badge {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.badge-count {
		background: var(--border);
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 8px;
		font-weight: 600;
	}

	.has-errors .badge-count {
		background: #c0392b;
		color: #fff;
	}

	.toggle-arrow {
		font-size: 0.65rem;
		color: var(--muted);
	}

	.sandbox-preview {
		flex: 1;
		min-height: 0;
		background: #fff;
		position: relative;
	}

	.preview-frame {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.console-panel {
		border-top: 1px solid var(--border);
		background: #191a1b;
		color: #d4d4d4;
		flex-shrink: 0;
		height: 200px;
		display: flex;
		flex-direction: column;
		transition: height 0.2s ease;
		overflow: hidden;
	}

	.console-panel.collapsed {
		height: 36px;
	}

	.console-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		background: #181825;
		border-bottom: 1px solid #2d3154;
		flex-shrink: 0;
	}

	.console-title {
		font-size: 0.78rem;
		font-weight: 600;
		color: #8b8fa3;
	}

	.console-count {
		font-size: 0.7rem;
		color: #8b8fa3;
		margin-left: auto;
	}

	.console-output {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.78rem;
		line-height: 1.5;
	}

	.console-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.5rem;
		color: #555;
		font-size: 0.82rem;
	}

	.console-empty-icon {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	.console-entry {
		padding: 0.35rem 0.5rem;
		margin-bottom: 2px;
		border-radius: 4px;
		border-left: 3px solid transparent;
	}

	.entry-error {
		background: rgba(231, 76, 60, 0.1);
		border-left-color: #e74c3c;
	}

	.entry-warn {
		background: rgba(241, 196, 15, 0.08);
		border-left-color: #f1c40f;
	}

	.entry-info {
		border-left-color: #3498db;
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.15rem;
	}

	.entry-icon {
		font-size: 0.75rem;
	}

	.entry-type {
		font-size: 0.65rem;
		font-weight: 600;
		color: #8b8fa3;
	}

	.entry-time {
		font-size: 0.65rem;
		color: #555;
		margin-left: auto;
	}

	.entry-arg {
		margin: 0;
		padding: 0.15rem 0 0.15rem 0.25rem;
		white-space: pre-wrap;
		word-break: break-word;
		color: #d4d4d4;
		font-family: inherit;
		font-size: inherit;
	}

	/* Mobile responsive */
	@media (max-width: 767px) {
		.console-panel {
			height: 150px;
		}

		.console-panel.collapsed {
			height: 36px;
		}

		.sandbox-toolbar {
			flex-wrap: wrap;
			padding: 0.35rem 0.5rem;
			gap: 0.3rem;
		}

		.toolbar-btn {
			font-size: 0.72rem;
			padding: 0.3rem 0.5rem;
		}

		.sandbox-preview {
			min-height: 200px;
		}
	}
</style>
