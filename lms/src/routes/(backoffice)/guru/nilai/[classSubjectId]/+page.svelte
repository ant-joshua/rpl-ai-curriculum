<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');
	let semesters = $state(['1', '2']);

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('nilai');
			if (idx !== -1 && parts[idx + 1]) {
				classSubjectId = parts[idx + 1];
			}
		}
	});

	onMount(() => {
		if (!browser) return;
		loadClassSubject();
	});

	async function loadClassSubject() {
		if (!classSubjectId) { setTimeout(() => loadClassSubject(), 100); return; }
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/kelas/${classSubjectId}`);
			const json = await res.json();
			if (json.success) classSubject = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal memuat data kelas'; }
		finally { loading = false; }
	}

	function getSemesterLabel(s: string): string {
		return s === '1' ? 'Ganjil' : s === '2' ? 'Genap' : s;
	}

	const subPages = [
		{ href: 'ph', icon: '📝', label: 'Pengetahuan (PH)', desc: 'Input nilai harian per KD' },
		{ href: 'pts', icon: '📄', label: 'PTS', desc: 'Nilai tengah semester' },
		{ href: 'pas', icon: '📋', label: 'PAS', desc: 'Nilai akhir semester' },
		{ href: 'keterampilan', icon: '🔧', label: 'Keterampilan', desc: 'Praktik, produk, proyek, portofolio' },
		{ href: 'sikap', icon: '🌟', label: 'Sikap', desc: 'Spiritual dan sosial' },
		{ href: 'rekap', icon: '📊', label: 'Rekap', desc: 'Rekap akhir nilai' },
	];
</script>

<svelte:head>
	<title>{classSubject?.class_name || 'Loading'} — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat data kelas..." />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if classSubject}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/kelas">← Kelas Saya</a>
				</div>
				<h1>{classSubject.subject_name}</h1>
				<p class="class-meta">
					<span>{classSubject.class_name}</span>
					{#if classSubject.grade_level_name}
						<span class="meta-sep">·</span>
						<span>{classSubject.grade_level_name}</span>
					{/if}
				</p>
			</div>
			<div class="semester-selector">
				<label class="sem-label">Semester:</label>
				<div class="sem-toggle">
					{#each semesters as s}
						<button
							class="sem-btn"
							class:sem-btn--active={selectedSemester === s}
							onclick={() => selectedSemester = s}
						>{getSemesterLabel(s)}</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="subpage-grid">
			{#each subPages as sp}
				<a href={`/guru/nilai/${classSubjectId}/${sp.href}?semester=${selectedSemester}`} class="subpage-card">
					<div class="sp-icon">{sp.icon}</div>
					<div class="sp-body">
						<h3>{sp.label}</h3>
						<p>{sp.desc}</p>
					</div>
					<div class="sp-arrow">→</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 800px; }
	.page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.class-meta { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; gap: 6px; }
	.meta-sep { color: var(--text-quaternary); }

	.semester-selector { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
	.sem-label { font-size: 13px; color: var(--text-secondary); }
	.sem-toggle { display: flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
	.sem-btn {
		padding: 6px 16px;
		font-size: 13px;
		background: transparent;
		border: none;
		border-right: 1px solid var(--border);
		color: var(--text-secondary);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.1s;
	}
	.sem-btn:last-child { border-right: none; }
	.sem-btn:hover { background: rgba(255,255,255,0.04); }
	.sem-btn--active { background: var(--accent); color: white; }
	.sem-btn--active:hover { background: var(--accent-hover); }

	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }

	.subpage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
	}

	.subpage-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s ease;
	}
	.subpage-card:hover {
		border-color: var(--accent);
		background: rgba(94, 106, 210, 0.06);
		transform: translateY(-2px);
	}
	.sp-icon { font-size: 28px; flex-shrink: 0; }
	.sp-body { flex: 1; }
	.sp-body h3 { margin: 0 0 4px; font-size: 15px; }
	.sp-body p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
	.sp-arrow { font-size: 16px; color: var(--text-tertiary); }
	.subpage-card:hover .sp-arrow { color: var(--accent); transform: translateX(4px); }
</style>
