<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let offerings: any[] = $state([]);
	let selectedOfferingId = $state('');
	let loadingOfferings = $state(true);

	// Input mode: 'csv' (file upload) or 'paste' (textarea)
	let inputMode = $state<'csv' | 'paste'>('csv');

	// CSV file
	let csvFile: File | null = $state(null);
	let dragOver = $state(false);

	// Paste textarea
	let emailsText = $state('');

	// Preview
	let previewEmails: { email: string; role: string; valid: boolean }[] = $state([]);
	let showPreview = $state(false);

	// Submit
	let submitting = $state(false);
	let submitError = $state('');

	// Results
	let results: { email: string; status: string; reason: string }[] | null = $state(null);
	let resultSummary: { total: number; created: number; skipped: number; errors: number } | null = $state(null);

	onMount(() => {
		if (!browser) return;
		loadOfferings();
	});

	async function loadOfferings() {
		loadingOfferings = true;
		try {
			const res = await fetch('/api/admin/course-offerings');
			const json = await res.json();
			if (json.success) offerings = json.data;
		} catch { /* ignore */ }
		finally { loadingOfferings = false; }
	}

	function handleFileDrop(e: DragEvent) {
		dragOver = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			csvFile = files[0];
			showPreview = false;
			results = null;
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			csvFile = input.files[0];
			showPreview = false;
			results = null;
		}
	}

	function clearFile() {
		csvFile = null;
		showPreview = false;
		results = null;
	}

	function parsePastedEmails(): { email: string; role: string; valid: boolean }[] {
		return emailsText
			.split(/[\n,]+/)
			.map(e => e.trim())
			.filter(e => e.length > 0)
			.map(e => {
				// Support "email,role" format in textarea too
				const parts = e.split(',');
				const email = parts[0].trim();
				const role = parts.length > 1 ? parts[1].trim() : 'student';
				return { email, role, valid: email.includes('@') };
			});
	}

	async function generatePreview() {
		if (inputMode === 'csv' && csvFile) {
			const text = await csvFile.text();
			const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
			if (lines.length === 0) return;
			const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
			const emailIdx = headers.indexOf('email');
			const roleIdx = headers.indexOf('role');
			if (emailIdx === -1) return;
			previewEmails = lines.slice(1).map(line => {
				const fields = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));
				const email = fields[emailIdx] || '';
				const role = roleIdx !== -1 ? fields[roleIdx] || 'student' : 'student';
				return { email, role, valid: email.includes('@') };
			}).filter(e => e.email.length > 0);
			showPreview = true;
		} else if (inputMode === 'paste') {
			previewEmails = parsePastedEmails();
			showPreview = true;
		}
	}

	function hidePreview() {
		showPreview = false;
	}

	async function submitBulk() {
		if (!selectedOfferingId) {
			submitError = 'Please select a course offering';
			return;
		}
		if (inputMode === 'csv' && !csvFile) {
			submitError = 'Please select a CSV file';
			return;
		}
		if (inputMode === 'paste' && !emailsText.trim()) {
			submitError = 'Please paste email addresses';
			return;
		}

		submitting = true;
		submitError = '';
		results = null;
		resultSummary = null;

		try {
			let res: Response;
			if (inputMode === 'csv' && csvFile) {
				const formData = new FormData();
				formData.append('file', csvFile);
				formData.append('offeringId', selectedOfferingId);
				res = await fetch('/api/admin/enrollments/bulk', {
					method: 'POST',
					body: formData,
				});
			} else {
				const emails = parsePastedEmails().filter(e => e.valid).map(e => e.email);
				res = await fetch('/api/admin/enrollments/bulk', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ emails, offeringId: selectedOfferingId }),
				});
			}

			const json = await res.json();
			if (json.success) {
				const d = json.data;
				resultSummary = { total: d.total, created: d.created, skipped: d.skipped, errors: d.errors?.length || 0 };

				// Build per-email results
				const resultList: { email: string; status: string; reason: string }[] = [];
				// Start with created emails
				const createdSet = new Set<string>();
				// We need to reconstruct from the response
				// The enrolled emails
				for (const err of d.errors || []) {
					resultList.push({ email: err.email, status: 'error', reason: err.reason });
				}
				// Put created/skipped before errors
				const enrichedResults: { email: string; status: string; reason: string }[] = [];

				// For CSV mode, reconstruct from the original list
				let inputEmails: string[] = [];
				if (inputMode === 'csv' && csvFile) {
					const text = await csvFile.text();
					inputEmails = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(1)
						.map(line => {
							const fields = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));
							return fields[0];
						}).filter(e => e.includes('@'));
				} else {
					inputEmails = parsePastedEmails().filter(e => e.valid).map(e => e.email);
				}

				const errorMap = new Map(d.errors?.map((e: any) => [e.email, e.reason]) || []);
				// We can't tell which were created vs skipped per-email from the response,
				// so we estimate: non-errors are created if d.created > 0, else skipped
				let createdCount = d.created;
				for (const email of inputEmails) {
					const errReason = errorMap.get(email);
					if (errReason) {
						enrichedResults.push({ email, status: 'error', reason: errReason });
					} else if (createdCount > 0) {
						enrichedResults.push({ email, status: 'created', reason: '' });
						createdCount--;
					} else {
						enrichedResults.push({ email, status: 'skipped', reason: 'Already enrolled' });
					}
				}
				results = enrichedResults;
			} else {
				submitError = json.error || 'Failed to process';
			}
		} catch {
			submitError = 'Network error';
		} finally {
			submitting = false;
		}
	}

	function downloadTemplate() {
		window.open('/api/admin/enrollments/template', '_blank');
	}

	let previewValid = $derived(previewEmails.filter(e => e.valid).length);
	let previewInvalid = $derived(previewEmails.length - previewValid);
</script>

<svelte:head>
	<title>📋 Bulk Enroll — Admin</title>
</svelte:head>

<div class="bulk-enroll-page">
	<div class="page-header">
		<h1>📋 Bulk Enroll Students</h1>
		<div class="header-actions">
			<button onclick={downloadTemplate} class="btn btn-secondary">
				⬇️ Download CSV Template
			</button>
		</div>
	</div>

	<!-- Offering Selector -->
	<div class="card">
		<label for="offering-select" class="card-label">Course Offering</label>
		{#if loadingOfferings}
			<p class="text-secondary">Loading offerings...</p>
		{:else if offerings.length === 0}
			<p class="text-secondary">No course offerings found.</p>
		{:else}
			<select id="offering-select" bind:value={selectedOfferingId} class="select-input">
				<option value="">-- Select offering --</option>
				{#each offerings as o}
					<option value={o.id}>{o.name} ({o.code || 'no code'})</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- Input Mode Toggle -->
	<div class="mode-toggle">
		<button
			class="mode-btn"
			class:active={inputMode === 'csv'}
			onclick={() => { inputMode = 'csv'; showPreview = false; results = null; }}
		>📄 Upload CSV</button>
		<button
			class="mode-btn"
			class:active={inputMode === 'paste'}
			onclick={() => { inputMode = 'paste'; showPreview = false; results = null; }}
		>⌨️ Paste Emails</button>
	</div>

	<!-- CSV Upload Area -->
	{#if inputMode === 'csv'}
		<div class="card">
			{#if !csvFile}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="drop-zone"
					class:drag-over={dragOver}
					ondragover={(e) => { e.preventDefault(); dragOver = true; }}
					ondragleave={() => dragOver = false}
					ondrop={(e) => { e.preventDefault(); handleFileDrop(e); }}
					onclick={() => document.getElementById('csv-input')?.click()}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && document.getElementById('csv-input')?.click()}
				>
					<span class="drop-icon">📂</span>
					<p class="drop-text">Drop CSV file here or click to browse</p>
					<p class="drop-hint">CSV must have an <code>email</code> column</p>
				</div>
				<input
					id="csv-input"
					type="file"
					accept=".csv"
					onchange={handleFileSelect}
					class="file-input-hidden"
				/>
			{:else}
				<div class="file-selected">
					<span class="file-icon">📄</span>
					<div class="file-info">
						<span class="file-name">{csvFile.name}</span>
						<span class="file-size">{(csvFile.size / 1024).toFixed(1)} KB</span>
					</div>
					<button onclick={clearFile} class="btn btn-sm btn-ghost">Remove</button>
				</div>
				<div class="preview-actions">
					<button onclick={generatePreview} class="btn btn-secondary btn-sm">👁️ Preview Emails</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Paste Emails Area -->
	{#if inputMode === 'paste'}
		<div class="card">
			<label for="emails-textarea" class="card-label">Paste Email Addresses</label>
			<p class="hint">One email per line, or comma-separated.</p>
			<textarea
				id="emails-textarea"
				bind:value={emailsText}
				placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
				rows={6}
				class="emails-textarea"
			></textarea>
			<div class="preview-actions">
				<button onclick={generatePreview} disabled={!emailsText.trim()} class="btn btn-secondary btn-sm">
					👁️ Preview Emails
				</button>
			</div>
		</div>
	{/if}

	<!-- Preview Panel -->
	{#if showPreview}
		<div class="card preview-card">
			<div class="preview-header">
				<h3>Preview</h3>
				<button onclick={hidePreview} class="btn btn-sm btn-ghost">✕</button>
			</div>
			<div class="preview-stats">
				<span class="stat valid">{previewValid} valid email(s)</span>
				{#if previewInvalid > 0}
					<span class="stat invalid">{previewInvalid} invalid</span>
				{/if}
				<span class="stat total">{previewEmails.length} total</span>
			</div>
			{#if previewEmails.length > 0}
				<div class="preview-table-wrap">
					<table class="preview-table">
						<thead>
							<tr>
								<th>#</th>
								<th>Email</th>
								<th>Valid</th>
							</tr>
						</thead>
						<tbody>
							{#each previewEmails.slice(0, 50) as entry, i}
								<tr>
									<td>{i + 1}</td>
									<td>{entry.email}</td>
									<td>
										<span class="status-badge" class:valid={entry.valid} class:invalid={!entry.valid}>
											{entry.valid ? '✓' : '✗'}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if previewEmails.length > 50}
					<p class="text-secondary">… and {previewEmails.length - 50} more</p>
				{/if}
			{/if}

			<div class="submit-area">
				<button
					onclick={submitBulk}
					disabled={submitting || !selectedOfferingId || previewValid === 0}
					class="btn btn-primary btn-lg"
				>
					{submitting ? '⏳ Enrolling...' : '🚀 Enroll Students'}
				</button>
				{#if submitError}
					<p class="error-msg">{submitError}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Initial submit button without preview -->
	{#if !showPreview && (inputMode === 'csv' ? csvFile : emailsText.trim())}
		<div class="card submit-card">
			<div class="submit-area">
				<button
					onclick={submitBulk}
					disabled={submitting || !selectedOfferingId}
					class="btn btn-primary btn-lg"
				>
					{submitting ? '⏳ Enrolling...' : '🚀 Enroll Students'}
				</button>
				{#if submitError}
					<p class="error-msg">{submitError}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if resultSummary}
		<div class="card results-card">
			<h2>📊 Results</h2>
			<div class="summary-stats">
				<div class="stat-box total">
					<span class="stat-num">{resultSummary.total}</span>
					<span class="stat-label">Total</span>
				</div>
				<div class="stat-box created">
					<span class="stat-num">{resultSummary.created}</span>
					<span class="stat-label">Enrolled</span>
				</div>
				<div class="stat-box skipped">
					<span class="stat-num">{resultSummary.skipped}</span>
					<span class="stat-label">Skipped</span>
				</div>
				<div class="stat-box errors">
					<span class="stat-num">{(results?.filter(r => r.status === 'error').length) || 0}</span>
					<span class="stat-label">Errors</span>
				</div>
			</div>

			{#if results && results.length > 0}
				<div class="results-table-wrap">
					<table class="results-table">
						<thead>
							<tr>
								<th>#</th>
								<th>Email</th>
								<th>Status</th>
								<th>Details</th>
							</tr>
						</thead>
						<tbody>
							{#each results as r, i}
								<tr>
									<td>{i + 1}</td>
									<td>{r.email}</td>
									<td>
										<span class="result-badge" class:created={r.status === 'created'} class:skipped={r.status === 'skipped'} class:error={r.status === 'error'}>
											{r.status === 'created' ? '✅ Created' : r.status === 'skipped' ? '⏭️ Skipped' : '❌ Error'}
										</span>
									</td>
									<td class="reason-cell">{r.reason || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.bulk-enroll-page {
		max-width: 800px;
	}

	h1 {
		font-size: 26px;
		font-weight: 700;
		margin: 0;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 12px;
	}

	.header-actions {
		display: flex;
		gap: 8px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 16px;
	}

	.card-label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.text-secondary {
		color: var(--text-secondary);
		font-size: 13px;
	}

	.select-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 14px;
	}

	.mode-toggle {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}

	.mode-btn {
		flex: 1;
		padding: 10px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-btn.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.mode-btn:hover:not(.active) {
		background: var(--hover);
	}

	.drop-zone {
		border: 2px dashed var(--border);
		border-radius: 12px;
		padding: 40px 20px;
		text-align: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.drop-zone:hover,
	.drop-zone.drag-over {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.drop-icon {
		font-size: 36px;
		display: block;
		margin-bottom: 8px;
	}

	.drop-text {
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
		margin-bottom: 4px;
	}

	.drop-hint {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.drop-hint code {
		background: var(--bg-secondary);
		padding: 1px 4px;
		border-radius: 3px;
	}

	.file-input-hidden {
		display: none;
	}

	.file-selected {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.file-icon {
		font-size: 28px;
	}

	.file-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.file-name {
		font-size: 14px;
		font-weight: 500;
	}

	.file-size {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.preview-actions {
		margin-top: 12px;
	}

	/* Textarea */
	.emails-textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-family: monospace;
		font-size: 13px;
		resize: vertical;
		box-sizing: border-box;
	}

	.hint {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 8px;
	}

	/* Preview */
	.preview-card {
		border-color: var(--accent);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.preview-header h3 {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
	}

	.preview-stats {
		display: flex;
		gap: 12px;
		margin-bottom: 12px;
	}

	.stat {
		font-size: 12px;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: 6px;
		background: var(--bg-secondary);
	}

	.stat.valid { color: var(--color-green, #2ecc71); }
	.stat.invalid { color: var(--color-red, #e74c3c); }
	.stat.total { color: var(--text-secondary); }

	.preview-table-wrap {
		overflow-x: auto;
		margin-bottom: 12px;
	}

	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.preview-table th {
		text-align: left;
		padding: 8px 10px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 1px solid var(--border);
	}

	.preview-table td {
		padding: 6px 10px;
		border-bottom: 1px solid var(--border);
	}

	.status-badge {
		font-size: 14px;
	}

	/* Submit */
	.submit-area {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}

	.submit-card {
		background: var(--surface);
	}

	.error-msg {
		font-size: 13px;
		color: var(--color-red, #e74c3c);
		background: var(--color-red, #e74c3c)15;
		padding: 6px 10px;
		border-radius: 6px;
	}

	/* Results */
	.results-card h2 {
		font-size: 18px;
		margin: 0 0 16px 0;
	}

	.summary-stats {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.stat-box {
		flex: 1;
		min-width: 100px;
		padding: 16px;
		border-radius: 10px;
		text-align: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
	}

	.stat-box.total { border-color: var(--border); }
	.stat-box.created { border-color: var(--color-green, #2ecc71); background: var(--color-green, #2ecc71)10; }
	.stat-box.skipped { border-color: var(--color-orange, #f39c12); background: var(--color-orange, #f39c12)10; }
	.stat-box.errors { border-color: var(--color-red, #e74c3c); background: var(--color-red, #e74c3c)10; }

	.stat-num {
		font-size: 28px;
		font-weight: 700;
		display: block;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.results-table-wrap {
		overflow-x: auto;
	}

	.results-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.results-table th {
		text-align: left;
		padding: 10px 12px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 1px solid var(--border);
	}

	.results-table td {
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
	}

	.result-badge {
		font-size: 12px;
		font-weight: 500;
	}

	.reason-cell {
		color: var(--text-secondary);
		font-size: 12px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.btn:hover { opacity: 0.85; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-sm { padding: 5px 10px; font-size: 12px; }
	.btn-lg { padding: 12px 24px; font-size: 15px; }
	.btn-primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.btn-secondary {
		background: var(--bg-secondary);
	}
	.btn-ghost {
		background: transparent;
		border-color: transparent;
		color: var(--text-secondary);
	}
	.btn-ghost:hover {
		background: var(--hover);
	}

	@media (max-width: 600px) {
		.summary-stats {
			flex-direction: column;
		}
		.mode-toggle {
			flex-direction: column;
		}
		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
