<script lang="ts">
	interface EndpointDef {
		method: string;
		path: string;
		description: string;
		response: string;
	}

	let {
		projectSlug = '',
		projectTitle = '',
		techs = [] as string[],
		stepTitle = '',
		stepInstruction = '',
		starterCode = '',
	}: {
		projectSlug?: string;
		projectTitle?: string;
		techs?: string[];
		stepTitle?: string;
		stepInstruction?: string;
		starterCode?: string;
	} = $props();

	let previewMode = $state<'output' | 'instructions'>('output');
	let selectedEndpoint = $state(0);

	// Detect what kind of backend project this is
	let isReactProject = $derived(
		techs.some(t => ['React', 'Vite', 'Chart.js'].includes(t))
	);
	let isNodeProject = $derived(
		techs.some(t => ['Node.js', 'Express', 'SQLite', 'JWT', 'bcrypt', 'Docker'].includes(t))
	);
	let isMastraProject = $derived(
		techs.some(t => t.includes('Mastra') || t.includes('@mastra'))
	);
	let isDockerProject = $derived(
		techs.includes('Docker')
	);

	// Simulated endpoints for REST API projects — use $derived.by for block body
	let endpoints = $derived.by<EndpointDef[]>(() => {
		if (projectSlug === 'rest-api-crud' || (isNodeProject && !isMastraProject && !isDockerProject)) {
			return [
				{ method: 'GET', path: '/api/products', description: 'Ambil semua produk', response: JSON.stringify({ success: true, data: [{ id: 1, name: 'Laptop ThinkPad X1', price: 15000000 }], count: 3 }, null, 2) },
				{ method: 'GET', path: '/api/products/1', description: 'Detail produk by ID', response: JSON.stringify({ success: true, data: { id: 1, name: 'Laptop ThinkPad X1', price: 15000000 } }, null, 2) },
				{ method: 'POST', path: '/api/products', description: 'Tambah produk baru', response: JSON.stringify({ success: true, data: { id: 4, name: 'Produk Baru', price: 50000 } }, null, 2) },
				{ method: 'PUT', path: '/api/products/1', description: 'Update produk', response: JSON.stringify({ success: true, data: { id: 1, name: 'Laptop Updated', price: 14000000 } }, null, 2) },
				{ method: 'DELETE', path: '/api/products/1', description: 'Hapus produk', response: JSON.stringify({ success: true, message: 'Product deleted successfully' }, null, 2) },
			];
		}
		if (projectSlug === 'auth-system') {
			return [
				{ method: 'POST', path: '/api/auth/register', description: 'Register user baru', response: JSON.stringify({ message: 'User registered successfully', user: { id: '123', name: 'User', email: 'user@example.com', role: 'user' } }, null, 2) },
				{ method: 'POST', path: '/api/auth/login', description: 'Login & dapatkan JWT', response: JSON.stringify({ message: 'Login successful', token: 'eyJhbG...NiIs...', user: { id: '123', name: 'User', email: 'user@example.com', role: 'user' } }, null, 2) },
				{ method: 'GET', path: '/api/protected', description: 'Akses protected route (need JWT)', response: JSON.stringify({ message: 'Welcome! You are authenticated', user: { id: '123', role: 'user' } }, null, 2) },
			];
		}
		if (projectSlug === 'mastra-ai-agent' || isMastraProject) {
			return [
				{ method: 'POST', path: '/api/chat', description: 'Kirim pesan ke AI agent', response: JSON.stringify({ message: 'Halo! Saya asisten AI. Ada yang bisa saya bantu?', agentId: 'assistant' }, null, 2) },
				{ method: 'POST', path: '/api/workflow/qa', description: 'Jalankan QA workflow', response: JSON.stringify({ success: true, result: 'Code looks good!', confidence: 0.92 }, null, 2) },
				{ method: 'GET', path: '/api/weather?city=Jakarta', description: 'Tool: cek cuaca', response: JSON.stringify({ city: 'Jakarta', temperature: 32, unit: 'celcius', condition: 'Cerah berawan' }, null, 2) },
			];
		}
		return [];
	});

	let commands = $derived.by<string[]>(() => {
		if (isDockerProject) {
			return [
				'docker build -t my-app .',
				'docker run -p 3000:3000 my-app',
				'# or with Compose:',
				'docker compose up',
			];
		}
		if (isMastraProject) {
			return [
				'cp .env.example .env  # isi API key',
				'npm install',
				'npm run dev',
			];
		}
		if (isReactProject) {
			return [
				'npm install',
				'npm run dev',
				'# Build untuk production:',
				'npm run build',
			];
		}
		return [
			'npm install',
			'node --watch index.js',
			'# atau: npm run dev',
		];
	});

	let projectCommands = $derived.by<string[]>(() => {
		if (isDockerProject) {
			return [
				'# Build Docker image',
				'docker build -t ' + projectSlug + ' .',
				'# Run container',
				'docker run -p 3000:3000 ' + projectSlug,
			];
		}
		if (isMastraProject) {
			return [
				'# 1. Setup environment',
				'npm install',
				'',
				'# 2. Buat file .env dengan API key',
				'echo "OPENAI_API_KEY=sk-..." > .env',
				'',
				'# 3. Jalankan development server',
				'npm run dev',
			];
		}
		if (isReactProject) {
			return [
				'# 1. Install dependencies',
				'npm install',
				'',
				'# 2. Jalankan dev server',
				'npm run dev',
				'# → Buka http://localhost:5173',
				'',
				'# 3. Build untuk production',
				'npm run build',
			];
		}
		return [
			'# 1. Install dependencies',
			'npm install',
			'',
			'# 2. Jalankan server',
			'node index.js',
			'# → Server berjalan di http://localhost:3000',
		];
	});

	function copyCommands() {
		const text = commands.join('\n');
		navigator.clipboard.writeText(text);
	}

	function copyCode() {
		navigator.clipboard.writeText(starterCode);
	}

	let currentEndpoint = $derived(endpoints[selectedEndpoint]);
</script>

<div class="server-preview">
	<!-- Tabs: Output / Instructions -->
	<div class="sp-tabs">
		<button
			class="sp-tab"
			class:active={previewMode === 'output'}
			onclick={() => (previewMode = 'output')}
		>
			🚀 Simulated Output
		</button>
		<button
			class="sp-tab"
			class:active={previewMode === 'instructions'}
			onclick={() => (previewMode = 'instructions')}
		>
			📖 Run on Your Machine
		</button>
	</div>

	<div class="sp-content">
		{#if previewMode === 'output'}
			<!-- Simulated Output -->
			<div class="sp-output">
				{#if endpoints.length > 0}
					<div class="endpoint-selector">
						<span class="endpoint-label">Pilih endpoint:</span>
						{#each endpoints as ep, i}
							<button
								class="endpoint-btn"
								class:active={selectedEndpoint === i}
								onclick={() => (selectedEndpoint = i)}
							>
								<span class="endpoint-method" class:method-get={ep.method === 'GET'} class:method-post={ep.method === 'POST'} class:method-put={ep.method === 'PUT'} class:method-delete={ep.method === 'DELETE'}>
									{ep.method}
								</span>
								<span class="endpoint-path">{ep.path}</span>
							</button>
						{/each}
					</div>

					{#if currentEndpoint}
						<div class="endpoint-detail">
							<div class="detail-header">
								<h4>Response Preview</h4>
								<span class="detail-desc">{currentEndpoint.description}</span>
							</div>
							<div class="response-box">
								<div class="response-header">
									<span class="response-method" class:method-get={currentEndpoint.method === 'GET'} class:method-post={currentEndpoint.method === 'POST'} class:method-put={currentEndpoint.method === 'PUT'} class:method-delete={currentEndpoint.method === 'DELETE'}>
										{currentEndpoint.method}
									</span>
									<span class="response-path">http://localhost:3000{currentEndpoint.path}</span>
									<span class="response-status">200 OK</span>
								</div>
								<pre class="response-body"><code>{currentEndpoint.response}</code></pre>
							</div>
						</div>
					{/if}
				{:else}
					<div class="no-endpoints">
						<p>Proyek ini akan menghasilkan output saat dijalankan di mesin lokal.</p>
						<p>Gunakan tab <strong>"Run on Your Machine"</strong> untuk instruksi menjalankan.</p>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Run on Your Machine -->
			<div class="sp-instructions">
				<div class="instruction-section">
					<h4>📋 Cara Menjalankan</h4>
					<pre class="command-block"><code>{#each projectCommands as cmd}<span class="cmd-line">{cmd}</span>
{/each}</code></pre>
					<button class="copy-btn" onclick={copyCommands}>📋 Salin Perintah</button>
				</div>

				{#if isReactProject}
					<div class="instruction-section react-note">
						<h4>⚛️ React Project Note</h4>
						<p>
							Proyek React membutuhkan build tool (Vite) untuk dijalankan.
							Tidak bisa langsung di-preview di browser — jalankan di terminal lokal.
						</p>
						<div class="expected-screenshot">
							<div class="screenshot-placeholder">
								<span class="ss-icon">🖥️</span>
								<span class="ss-label">Expected Output: Dashboard dengan sidebar, stat cards, dan chart</span>
							</div>
						</div>
					</div>
				{/if}

				{#if isDockerProject}
					<div class="instruction-section docker-note">
						<h4>🐳 Docker Note</h4>
						<p>
							Pastikan Docker Desktop / Docker Engine sudah terinstall.
							Gunakan <code>docker build</code> untuk build image,
							lalu <code>docker run</code> untuk menjalankan container.
						</p>
						<div class="expected-screenshot">
							<div class="screenshot-placeholder">
								<span class="ss-icon">🐳</span>
								<span class="ss-label">Expected: Container berjalan di localhost:3000</span>
							</div>
						</div>
					</div>
				{/if}

				{#if isNodeProject && !isDockerProject}
					<div class="instruction-section node-note">
						<h4>📦 Prerequisites</h4>
						<ul>
							<li>Node.js 18+ terinstall</li>
							<li>Terminal / Command Prompt</li>
							<li>Code editor (VS Code recommended)</li>
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.server-preview {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		background: var(--surface);
	}

	.sp-tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
		flex-shrink: 0;
	}

	.sp-tab {
		padding: 0.6rem 1rem;
		background: none;
		border: none;
		color: var(--muted);
		font-size: 0.85rem;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.15s;
		font-family: inherit;
		flex: 1;
		text-align: center;
	}

	.sp-tab.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.sp-tab:hover:not(.active) {
		color: var(--text);
	}

	.sp-content {
		flex: 1;
		overflow-y: auto;
	}

	/* Output tab */
	.sp-output {
		padding: 1rem;
	}

	.endpoint-selector {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.endpoint-label {
		font-size: 0.78rem;
		color: var(--muted);
		font-weight: 600;
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.endpoint-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.82rem;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		transition: all 0.15s;
		text-align: left;
	}

	.endpoint-btn:hover {
		border-color: var(--accent);
		background: var(--hover);
	}

	.endpoint-btn.active {
		border-color: var(--accent);
		background: rgba(108, 92, 231, 0.1);
	}

	.endpoint-method {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		min-width: 52px;
		text-align: center;
	}

	.method-get { background: rgba(52, 152, 219, 0.15); color: #3b82f6; }
	.method-post { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
	.method-put { background: rgba(241, 196, 15, 0.15); color: #f59e0b; }
	.method-delete { background: rgba(231, 76, 60, 0.15); color: #ef4444; }

	.endpoint-path {
		font-size: 0.82rem;
	}

	.endpoint-detail {
		background: #191a1b;
		border-radius: 8px;
		overflow: hidden;
	}

	.detail-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #2d3154;
	}

	.detail-header h4 {
		font-size: 0.85rem;
		margin: 0;
		color: var(--text);
	}

	.detail-desc {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.response-box {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.8rem;
	}

	.response-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #181825;
		border-bottom: 1px solid #2d3154;
	}

	.response-method {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
	}

	.response-path {
		flex: 1;
		color: #8b8fa3;
		font-size: 0.78rem;
	}

	.response-status {
		color: #27ae60;
		font-size: 0.72rem;
		font-weight: 600;
	}

	.response-body {
		padding: 0.75rem 1rem;
		margin: 0;
		color: #d4d4d4;
		overflow-x: auto;
		line-height: 1.5;
	}

	.no-endpoints {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		gap: 0.5rem;
		color: var(--muted);
		text-align: center;
	}

	/* Instructions tab */
	.sp-instructions {
		padding: 1.25rem;
	}

	.instruction-section {
		margin-bottom: 1.5rem;
	}

	.instruction-section h4 {
		font-size: 0.95rem;
		margin: 0 0 0.75rem;
		color: var(--text);
	}

	.instruction-section p {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0 0 0.75rem;
	}

	.command-block {
		background: #191a1b;
		border: 1px solid #2d3154;
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.82rem;
		line-height: 1.7;
		margin: 0 0 0.75rem;
		color: #d4d4d4;
	}

	.command-block code {
		font-family: inherit;
	}

	.cmd-line {
		display: block;
		white-space: pre;
	}

	.copy-btn {
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 0.8rem;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.copy-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.instruction-section ul {
		padding-left: 1.25rem;
		margin: 0;
	}

	.instruction-section li {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.8;
	}

	.instruction-section code {
		background: #191a1b;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		font-family: 'Fira Code', monospace;
		font-size: 0.8rem;
		color: #d4d4d4;
	}

	.expected-screenshot {
		margin-top: 0.75rem;
	}

	.screenshot-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #191a1b;
		border: 2px dashed #2d3154;
		border-radius: 8px;
		gap: 0.75rem;
		color: var(--muted);
	}

	.ss-icon {
		font-size: 2rem;
		opacity: 0.6;
	}

	.ss-label {
		font-size: 0.82rem;
		text-align: center;
	}

	/* Mobile */
	@media (max-width: 767px) {
		.sp-output {
			padding: 0.75rem;
		}

		.sp-instructions {
			padding: 1rem;
		}

		.endpoint-btn {
			font-size: 0.78rem;
			padding: 0.35rem 0.5rem;
		}

		.response-body {
			font-size: 0.72rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
