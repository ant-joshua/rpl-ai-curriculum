<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules } from '$lib/stores/modules';

	let hasChatHistory = $state(false);

	onMount(() => {
		if (browser) {
			try {
				const raw = localStorage.getItem('lms-tutor-chat');
				hasChatHistory = !!raw && JSON.parse(raw).length > 0;
			} catch {
				hasChatHistory = false;
			}
		}
	});

	function downloadBlob(content: string, filename: string, mime: string) {
		const blob = new Blob([content], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function downloadCsv() {
		const rows: string[][] = [];
		// Header
		rows.push(['Modul', 'Sesi', 'Tipe', 'Status', 'Skor']);

		for (const mod of modules) {
			const modCompleted = progress.getCompletedSessions(mod.slug).length;
			const modTotal = mod.sessions.length;
			// Module summary row
			rows.push([
				mod.title,
				`${modCompleted}/${modTotal} sesi`,
				'Modul',
				modCompleted >= modTotal ? 'Selesai' : 'Dalam Proses',
				`${Math.round((modCompleted / modTotal) * 100)}%`,
			]);
			// Session rows
			for (const sess of mod.sessions) {
				const completed = progress.isSessionCompleted(mod.slug, sess.id);
				rows.push([
					mod.title,
					sess.title,
					'Sesi',
					completed ? 'Selesai' : 'Belum',
					completed ? '100' : '0',
				]);
			}
			// Blank separator
			rows.push([]);
		}

		const csv = rows
			.map((r) =>
				r
					.map((cell) => {
						if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
							return `"${cell.replace(/"/g, '""')}"`;
						}
						return cell;
					})
					.join(',')
			)
			.join('\n');

		// BOM for Excel UTF-8
		const bom = '\uFEFF';
		downloadBlob(bom + csv, 'rpl-progress.csv', 'text/csv;charset=utf-8');
	}

	function downloadJson() {
		const data: Record<string, any> = {
			exportedAt: new Date().toISOString(),
			overall: {
				overallProgressPercent: progress.getOverallProgress(),
				completedModules: progress.completedCount,
				totalModules: modules.length,
				totalSessions: modules.reduce((a, m) => a + m.sessions.length, 0),
			},
			modules: modules.map((mod) => {
				const completedSessions = progress.getCompletedSessions(mod.slug);
				return {
					title: mod.title,
					slug: mod.slug,
					level: mod.level,
					sessions: mod.sessions.map((sess) => ({
						id: sess.id,
						title: sess.title,
						completed: progress.isSessionCompleted(mod.slug, sess.id),
					})),
					sessionsCompleted: completedSessions.length,
					sessionsTotal: mod.sessions.length,
					progressPercent: progress.getModuleProgress(mod.slug),
				};
			}),
			gamification: (() => {
				if (!browser) return null;
				try {
					const rawXp = localStorage.getItem('lms-xp');
					const rawBadges = localStorage.getItem('lms-badges');
					const streak = localStorage.getItem('lms-streak');
					const completionDates = localStorage.getItem('lms-completion-dates');
					return {
						xp: rawXp ? parseInt(rawXp, 10) : 0,
						badges: rawBadges ? JSON.parse(rawBadges) : [],
						streak: streak ? parseInt(streak, 10) : 0,
						completionDates: completionDates ? JSON.parse(completionDates) : [],
					};
				} catch {
					return null;
				}
			})(),
		};

		const json = JSON.stringify(data, null, 2);
		downloadBlob(json, 'rpl-progress.json', 'application/json');
	}

	function downloadChatHistory() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem('lms-tutor-chat');
			if (!raw) return;
			const data = JSON.parse(raw);
			const json = JSON.stringify(data, null, 2);
			downloadBlob(json, 'rpl-tutor-chat.json', 'application/json');
		} catch {
			// silent
		}
	}
</script>

<svelte:head>
	<title>Export — RPL AI Curriculum</title>
</svelte:head>

<div class="export-page">
	<h1>📤 Export Data</h1>

	<div class="card">
		<h2>📊 Export Progress</h2>
		<p class="card-desc">Download kemajuan belajarmu dalam format CSV (Excel) atau JSON.</p>
		<div class="export-actions">
			<button class="export-btn csv" onclick={downloadCsv}>
				<span class="btn-icon">📊</span>
				<span>Download Progress CSV</span>
				<small>.csv — Excel compatible</small>
			</button>
			<button class="export-btn json" onclick={downloadJson}>
				<span class="btn-icon">📄</span>
				<span>Download Progress JSON</span>
				<small>.json — full data</small>
			</button>
		</div>
	</div>

	<div class="card">
		<h2>💬 Export Chat History</h2>
		<p class="card-desc">Download riwayat chat dengan AI Tutor sebagai file JSON.</p>
		{#if hasChatHistory}
			<button class="export-btn chat" onclick={downloadChatHistory}>
				<span class="btn-icon">💬</span>
				<span>Download Chat History</span>
				<small>.json</small>
			</button>
		{:else}
			<div class="empty-state">
				<span class="empty-icon">💭</span>
				<p>Belum ada riwayat chat</p>
				<span class="empty-hint">Mulai chat dengan AI Tutor di halaman Tutor untuk mengumpulkan riwayat.</span>
			</div>
		{/if}
	</div>

	<div class="card note-card">
		<h2>ℹ️ Informasi</h2>
		<ul>
			<li>Data progress diambil dari penyimpanan lokal perangkatmu.</li>
			<li>File CSV bisa dibuka dengan Excel, Google Sheets, atau Numbers.</li>
			<li>File JSON berisi seluruh data progress termasuk XP, badge, dan streak.</li>
			<li>Data bersifat <strong>read-only</strong> — tidak ada data yang dikirim ke server.</li>
		</ul>
	</div>
</div>

<style>
	.export-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
	}

	h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.card-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 16px;
	}

	.export-actions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.export-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 20px 12px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.export-btn:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
		transform: translateY(-2px);
	}
	.export-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
	}
	.export-btn:disabled:hover {
		border-color: var(--border);
		background: var(--bg-secondary);
	}
	.btn-icon { font-size: 28px; }
	.export-btn small {
		font-size: 10px;
		font-weight: 400;
		color: var(--text-secondary);
	}

	.empty-state {
		text-align: center;
		padding: 24px 12px;
		color: var(--text-secondary);
	}
	.empty-icon {
		font-size: 36px;
		display: block;
		margin-bottom: 8px;
	}
	.empty-state p {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.empty-hint {
		font-size: 12px;
		color: var(--text-muted, var(--text-secondary));
	}

	.note-card {
		background: var(--surface);
	}
	.note-card ul {
		margin: 0;
		padding-left: 20px;
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.8;
	}
	.note-card li {
		margin-bottom: 4px;
	}

	.chat {
		grid-column: 1 / -1;
	}
</style>
