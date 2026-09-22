<script lang="ts">
	import { browser } from '$app/environment';
	import { addToast } from '$lib/stores/toast.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let exporting = $state(false);
	let scope = $state('all');
	let format = $state('csv');

	function getToken(): string | null {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
	}

	async function doExport() {
		if (exporting) return;
		exporting = true;
		try {
			const res = await fetch(`/api/my/export?format=${format}&scope=${scope}`, {
				headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
			});
			if (!res.ok) {
				const j = await res.json().catch(() => null);
				addToast(j?.error || 'Export gagal', 'error');
				return;
			}
			const blob = await res.blob();
			const a = document.createElement('a');
			const url = URL.createObjectURL(blob);
			a.href = url;
			a.download = `lms-export-${scope}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			addToast('Export berhasil diunduh!', 'success');
		} catch {
			addToast('Export gagal', 'error');
		} finally {
			exporting = false;
		}
	}
</script>

<svelte:head><title>Export Data — RPL AI</title></svelte:head>

<div class="export-page">
	<h1 class="page-title">📤 Export Data</h1>
	<p class="page-desc">Unduh data belajarmu sebagai arsip — nilai, XP, dan kursus.</p>

	<div class="export-card">
		<div class="field-group">
			<label class="field-label">Cakupan Data</label>
			<select bind:value={scope} class="field-select">
				<option value="all">Semua (nilai + XP + kursus)</option>
				<option value="grades">Nilai saja</option>
				<option value="xp">XP / Gamification saja</option>
				<option value="courses">Kursus / Enrollments saja</option>
			</select>
		</div>

		<div class="field-group">
			<label class="field-label">Format</label>
			<div class="format-row">
				<label class="format-option">
					<input type="radio" bind:group={format} value="csv" />
					<span>📄 CSV</span>
					<small>Bisa dibuka Excel / Spreadsheet</small>
				</label>
				<label class="format-option">
					<input type="radio" bind:group={format} value="json" />
					<span>📦 JSON</span>
					<small>Format terstruktur untuk backup/developer</small>
				</label>
			</div>
		</div>

		<Button variant="primary" onclick={doExport} disabled={exporting}>
			{exporting ? 'Menyiapkan file...' : '⬇️ Unduh Export'}
		</Button>
	</div>

	<div class="export-note">
		💡 Data diambil real-time dari akunmu. File CSV bisa dibuka di Google Sheets / Excel, JSON cocok untuk backup data.
	</div>
</div>

<style>
	.export-page { max-width: 640px; margin: 0 auto; padding: 8px 12px 40px; }
	.page-title { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0 0 24px; }
	.export-card {
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-shadow: none;
	}
	.field-group { display: flex; flex-direction: column; gap: 8px; }
	.field-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
	.field-select {
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 14px;
		background: #fff;
	}
	.format-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.format-option {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 14px;
		border: 2px solid var(--border);
		border-radius: 12px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		transition: border-color 0.15s, background 0.15s;
	}
	.format-option:has(input:checked) {
		border-color: var(--accent);
		background: rgba(79, 70, 229, 0.05);
	}
	.format-option small { font-weight: 400; color: var(--text-muted); font-size: 11px; }
	.export-btn {
		padding: 12px 18px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.export-btn:hover { opacity: 0.9; }
	.export-btn:disabled { opacity: 0.6; cursor: wait; }
	.export-note {
		margin-top: 16px;
		padding: 14px;
		background: rgba(79, 70, 229, 0.06);
		border: 1px solid rgba(var(--accent-rgb), 0.15);
		border-radius: 10px;
		font-size: 13px;
		color: var(--accent);
	}
	@media (max-width: 520px) {
		.format-row { grid-template-columns: 1fr; }
	}
</style>
