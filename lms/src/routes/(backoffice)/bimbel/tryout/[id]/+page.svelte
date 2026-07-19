<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Skeleton, EmptyState, Badge } from '$lib/components/ui/index.js';
	import { page } from '$app/stores';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	type Ranking = {
		rank: number;
		name: string;
		subjectScores: Record<string, number>;
		total: number;
	};

	type QuestionStat = {
		no: number;
		correct: number;
		total: number;
		correctPercent: number;
	};

	let loading = $state(true);
	let error = $state('');
	let tryout: any = $state(null);
	let rankings: Ranking[] = $state([]);
	let questionStats: QuestionStat[] = $state([]);
	let activeTab = $state<string>('ranking');

	const tryoutId = $derived($page.params.id);

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true; error = '';
		try {
			const [resTO, resRank, resStats] = await Promise.all([
				fetch(`/api/bimbel/tryout/${tryoutId}`),
				fetch(`/api/bimbel/tryout/${tryoutId}/ranking`),
				fetch(`/api/bimbel/tryout/${tryoutId}/analysis`),
			]);
			const [jsonTO, jsonRank, jsonStats] = await Promise.all([
				resTO.json(), resRank.json(), resStats.json(),
			]);
			if (jsonTO.success) tryout = jsonTO.data;
			else { error = jsonTO.error || 'Gagal memuat try out'; return; }
			if (jsonRank.success) rankings = jsonRank.data || [];
			if (jsonStats.success) questionStats = jsonStats.data || [];
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	const subjects = $derived(() => {
		if (rankings.length === 0) return [];
		return Object.keys(rankings[0].subjectScores || {});
	});

	function rankLabel(r: number): string {
		if (r === 1) return '🥇';
		if (r === 2) return '🥈';
		if (r === 3) return '🥉';
		return String(r);
	}

	function barHtml(pct: number): string {
		const cls = pct < 40 ? 'background:var(--danger)' : pct < 70 ? 'background:var(--warning)' : 'background:var(--success)';
		return `<div style="width:120px;height:20px;background:rgba(0,0,0,0.05);border-radius:4px;overflow:hidden"><div style="height:100%;border-radius:4px;min-width:2px;width:${pct}%;${cls}"></div></div>`;
	}

	const rankingColumns = $derived<ColumnDef<any, any>[]>([
		{
			header: t('tryout.col_rank'),
			accessorKey: 'rank',
			cell: ({ getValue }) => {
				const r = getValue() as number;
				return `<span style="font-size:16px;text-align:center">${rankLabel(r)}</span>`;
			}
		},
		{
			header: t('tryout.col_name'),
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:500;min-width:140px">${getValue()}</span>`
		},
		...subjects().map(subj => ({
			header: subj,
			accessorKey: `subjectScores.${subj}`,
			id: `subj_${subj}`,
			cell: ({ row }: { row: any }) => {
				const v = row.original.subjectScores[subj];
				return `<span style="text-align:center;color:var(--text-secondary)">${v ?? '-'}</span>`;
			}
		}) as ColumnDef<any, any>),
		{
			header: t('tryout.col_total'),
			accessorKey: 'total',
			cell: ({ getValue }) => `<span style="text-align:center;font-weight:600">${getValue()}</span>`
		},
	]);

	const analysisColumns: ColumnDef<any, any>[] = [
		{
			header: t('tryout.col_no'),
			accessorKey: 'no',
			cell: ({ getValue }) => `<span style="text-align:center">${getValue()}</span>`
		},
		{
			header: t('tryout.col_correct'),
			accessorKey: 'correct',
			cell: ({ getValue }) => `<span style="text-align:center">${getValue()}</span>`
		},
		{
			header: t('tryout.col_total'),
			accessorKey: 'total',
			cell: ({ getValue }) => `<span style="text-align:center">${getValue()}</span>`
		},
		{
			header: t('tryout.col_percentage'),
			accessorKey: 'correctPercent',
			cell: ({ getValue }) => `<span style="text-align:center;font-weight:600;min-width:80px">${((getValue() as number) || 0).toFixed(1)}%</span>`
		},
		{
			header: t('tryout.col_indicator'),
			accessorKey: 'correctPercent',
			cell: ({ getValue }) => barHtml((getValue() as number) || 0)
		},
	];
</script>

<svelte:head>
	<title>{tryout?.title || t('tryout.detail')} — Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel/tryout">← {t('tryout.breadcrumb')}</a></div>

		{#if loading}
			<Skeleton variant="block" count={1} />
		{:else if error}
			<div class="error-state">{error}</div>
		{:else if tryout}
			<div class="to-header">
				<div>
					<h1>{tryout.title}</h1>
					<p class="subtitle">
						{formatDate(tryout.date)}
						<span class="sep">·</span>
						{tryout.participants} {t('tryout.participants_unit')}
					</p>
				</div>
			</div>

			<div class="tabs">
				<button class="tab" class:tab--active={activeTab === 'ranking'} onclick={() => activeTab = 'ranking'}>
					{t('tryout.ranking_tab')}
				</button>
				<button class="tab" class:tab--active={activeTab === 'analysis'} onclick={() => activeTab = 'analysis'}>
					{t('tryout.analysis_tab')}
				</button>
			</div>

			{#if activeTab === 'ranking'}
				{#if rankings.length === 0}
					<EmptyState icon="🏆" title={t('tryout.no_ranking_title')} description={t('tryout.no_ranking_desc')} />
				{:else}
					<DataTable
						columns={rankingColumns}
						data={rankings}
						showSearch={false}
						showPagination={false}
						emptyMessage={t('tryout.empty_ranking')}
					/>
				{/if}
			{:else}
				{#if questionStats.length === 0}
					<EmptyState icon="📊" title={t('tryout.no_analysis_title')} description={t('tryout.no_analysis_desc')} />
				{:else}
					<DataTable
						columns={analysisColumns}
						data={questionStats}
						showSearch={false}
						showPagination={false}
						emptyMessage={t('tryout.empty_analysis')}
					/>
				{/if}
			{/if}
		{/if}
	</div>
</div>

<style>
	.page { max-width: 960px; }
	.page-header { margin-bottom: 20px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.error-state { padding: 40px; text-align: center; color: var(--danger); }

	.to-header { margin-bottom: 24px; }
	.to-header h1 { font-size: 24px; margin: 0 0 8px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.sep { color: var(--text-quaternary); }

	.tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
	.tab {
		padding: 10px 20px; font-size: 14px; font-weight: 500; color: var(--text-secondary);
		background: transparent; border: none; border-bottom: 2px solid transparent;
		cursor: pointer; font-family: inherit; transition: all 0.15s;
	}
	.tab:hover { color: var(--text); }
	.tab--active { color: var(--accent); border-bottom-color: var(--accent); }
</style>
