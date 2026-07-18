<script lang="ts">
	import { page } from '$app/stores';
	import { Card, CardContent } from '$lib/components/ui';
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="dash-page">
	<h1>Dashboard</h1>
	<p class="subtitle">{t('admin.welcome')}</p>

	<div class="shortcut-grid">
		<a href="/admin/attendance" class="shortcut">
			<span class="sc-icon">📅</span>
			<span class="sc-label">Attendance</span>
		</a>
		<a href="/admin/gradebook" class="shortcut">
			<span class="sc-icon">🎓</span>
			<span class="sc-label">Gradebook</span>
		</a>
		<a href="/admin/announcements" class="shortcut">
			<span class="sc-icon">📢</span>
			<span class="sc-label">Announcements</span>
		</a>
		<a href="/admin/analytics" class="shortcut">
			<span class="sc-icon">📊</span>
			<span class="sc-label">Analytics</span>
		</a>
		<a href="/admin/enrollments" class="shortcut">
			<span class="sc-icon">📋</span>
			<span class="sc-label">Enrollments</span>
		</a>
		<a href="/admin/exports" class="shortcut">
			<span class="sc-icon">📤</span>
			<span class="sc-label">Exports</span>
		</a>
	</div>
</div>

<style>
	.dash-page { max-width: 800px; }
	h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 28px; }

	.shortcut-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 12px;
	}
	.shortcut {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s;
	}
	.shortcut:hover {
		border-color: var(--accent-dim);
		background: var(--bg-secondary);
		transform: translateY(-2px);
	}
	.sc-icon { font-size: 28px; }
	.sc-label { font-size: 13px; font-weight: 500; }

	@media (max-width: 768px) {
		.shortcut-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
