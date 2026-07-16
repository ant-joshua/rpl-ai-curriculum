<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Loading, EmptyState, Badge } from '$lib/components/ui/index.js';
	import { page } from '$app/stores';

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
</script>

<svelte:head>
	<title>{tryout?.title || 'Detail Try Out'} — Bimbel — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="breadcrumb"><a href="/bimbel/tryout">← Try Out</a></div>

		{#if loading}
			<Loading message="Memuat data..." />
		{:else if error}
			<div class="error-state">{error}</div>
		{:else if tryout}
			<div class="to-header">
				<div>
					<h1>{tryout.title}</h1>
					<p class="subtitle">
						{formatDate(tryout.date)}
						<span class="sep">·</span>
						{tryout.participants} peserta
					</p>
				</div>
			</div>

			<div class="tabs">
				<button class="tab" class:tab--active={activeTab === 'ranking'} onclick={() => activeTab = 'ranking'}>
					🏆 Ranking
				</button>
				<button class="tab" class:tab--active={activeTab === 'analysis'} onclick={() => activeTab = 'analysis'}>
					📊 Analisis Soal
				</button>
			</div>

			{#if activeTab === 'ranking'}
				{#if rankings.length === 0}
					<EmptyState icon="🏆" title="Belum Ada Ranking" description="Belum ada hasil try out." />
				{:else}
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th>Rank</th>
									<th>Nama</th>
									{#each subjects() as subj}
										<th class="col-subject">{subj}</th>
									{/each}
									<th>Total</th>
								</tr>
							</thead>
							<tbody>
								{#each rankings as r}
									<tr class:rank-top3={r.rank <= 3}>
										<td class="col-rank">
											{#if r.rank === 1}🥇
											{:else if r.rank === 2}🥈
											{:else if r.rank === 3}🥉
											{:else}{r.rank}
											{/if}
										</td>
										<td class="col-name">{r.name}</td>
										{#each subjects() as subj}
											<td class="col-score">{r.subjectScores[subj] ?? '-'}</td>
										{/each}
										<td class="col-total"><strong>{r.total}</strong></td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{:else}
				{#if questionStats.length === 0}
					<EmptyState icon="📊" title="Belum Ada Data" description="Belum ada analisis soal." />
				{:else}
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th>No</th>
									<th>Benar</th>
									<th>Total</th>
									<th>Persentase</th>
									<th>Indikator</th>
								</tr>
							</thead>
							<tbody>
								{#each questionStats as q}
									<tr>
										<td class="col-qno">{q.no}</td>
										<td class="col-correct">{q.correct}</td>
										<td class="col-total">{q.total}</td>
										<td class="col-pct">{(q.correctPercent || 0).toFixed(1)}%</td>
										<td class="col-bar">
											<div class="bar-track">
												<div
													class="bar-fill"
													style="width: {q.correctPercent || 0}%"
													class:bar-low={(q.correctPercent || 0) < 40}
													class:bar-mid={(q.correctPercent || 0) >= 40 && (q.correctPercent || 0) < 70}
													class:bar-high={(q.correctPercent || 0) >= 70}
												></div>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
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

	.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); margin-bottom: 16px; }
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase;
		letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border);
		font-weight: 600; background: var(--bg-secondary);
	}
	td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid var(--border-subtle); }
	tr:last-child td { border-bottom: none; }
	tr:hover { background: rgba(255,255,255,0.02); }
	tr.rank-top3 { background: rgba(255,215,0,0.03); }

	.col-rank { width: 50px; font-size: 16px; text-align: center; }
	.col-name { font-weight: 500; min-width: 140px; }
	.col-subject { text-align: center; min-width: 70px; }
	.col-score { text-align: center; color: var(--text-secondary); }
	.col-total { text-align: center; font-weight: 600; }

	.col-qno { width: 50px; text-align: center; }
	.col-correct { text-align: center; }
	.col-pct { text-align: center; font-weight: 600; min-width: 80px; }

	.bar-track { width: 120px; height: 20px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
	.bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; min-width: 2px; }
	.bar-low { background: var(--danger); }
	.bar-mid { background: var(--warning); }
	.bar-high { background: var(--success); }
</style>
