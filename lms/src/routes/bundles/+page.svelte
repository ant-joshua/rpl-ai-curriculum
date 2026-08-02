<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Card, CardContent, Button, EmptyState, Spinner } from '$lib/components/ui';

	let bundles = $state<any[]>([]);
	let loading = $state(true);
	let enrollingId = $state<string | null>(null);

	onMount(async () => {
		if (!browser) return;
		await loadBundles();
	});

	async function loadBundles() {
		loading = true;
		try {
			const res = await fetch('/api/bundles');
			const json = await res.json();
			if (json.success) bundles = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function enrollBundle(id: string) {
		enrollingId = id;
		try {
			const res = await fetch(`/api/bundles/${id}/enroll`, { method: 'POST' });
			const json = await res.json();
			if (json.success) {
				addToast(`Terdaftar di ${json.data.enrolledCount} kursus! 🎉`, 'success');
				const { goto } = await import('$app/navigation');
				goto('/my/courses');
			} else if (json.error) {
				addToast(json.error, 'error');
			}
		} catch {
			addToast('Gagal daftar bundle', 'error');
		} finally {
			enrollingId = null;
		}
	}

	function formatPrice(n: number): string {
		return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
	}
</script>

<svelte:head>
	<title>Paket Kursus — RPL AI Curriculum</title>
</svelte:head>

<div class="bundles-page">
	<header class="page-header">
		<h1>📦 Paket Kursus</h1>
		<p class="page-subtitle">Gabung beberapa kursus sekaligus dengan harga spesial</p>
	</header>

	{#if loading}
		<div class="loading"><Spinner /> Memuat paket...</div>
	{:else if bundles.length === 0}
		<EmptyState icon="package" title="Belum ada paket" description="Paket kursus akan muncul di sini." />
	{:else}
		<div class="bundle-grid">
			{#each bundles as b}
				<Card class="bundle-card">
					<CardContent>
						<div class="bundle-head">
							<span class="bundle-icon">{b.coverIcon}</span>
							{#if b.discountPct > 0}
								<span class="discount-badge">-{b.discountPct}%</span>
							{/if}
						</div>
						<h2 class="bundle-title">{b.title}</h2>
						{#if b.description}<p class="bundle-desc">{b.description}</p>{/if}

						<div class="bundle-items">
							{#each b.items as it}
								<div class="bundle-item">
									<span class="item-icon">{it.icon}</span>
									<span class="item-name">{it.courseTitle}</span>
									{#if it.isEnrolled}
										<span class="item-enrolled">✓</span>
									{/if}
								</div>
							{/each}
						</div>

						<div class="bundle-price-row">
							{#if b.originalPrice && b.originalPrice > b.price}
								<span class="price-original">{formatPrice(b.originalPrice)}</span>
							{/if}
							<span class="price-now">{formatPrice(b.price)}</span>
						</div>

						<Button
							variant="primary"
							fullWidth
							onclick={() => enrollBundle(b.id)}
							loading={enrollingId === b.id}
							disabled={enrollingId === b.id || b.items.every((i: any) => i.isEnrolled)}
						>
							{b.items.every((i: any) => i.isEnrolled) ? 'Sudah Terdaftar Semua' : b.price > 0 ? 'Beli Paket' : 'Daftar Gratis'}
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.bundles-page { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
	.page-header { margin-bottom: 24px; }
	.page-header h1 { margin: 0 0 4px; font-size: 24px; }
	.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
	.loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
	.bundle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
	.bundle-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.bundle-icon { font-size: 36px; }
	.discount-badge {
		background: #dc2626; color: white; font-size: 12px; font-weight: 700;
		padding: 3px 10px; border-radius: 999px;
	}
	.bundle-title { font-size: 18px; margin: 0 0 4px; }
	.bundle-desc { font-size: 13px; color: var(--text-muted); margin: 0 0 14px; }
	.bundle-items { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
	.bundle-item {
		display: flex; align-items: center; gap: 8px; padding: 6px 10px;
		background: #f8fafc; border-radius: 8px; font-size: 13px;
	}
	.item-icon { font-size: 16px; }
	.item-name { flex: 1; }
	.item-enrolled { color: #16a34a; font-weight: 700; }
	.bundle-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
	.price-original { font-size: 13px; color: var(--text-muted); text-decoration: line-through; }
	.price-now { font-size: 22px; font-weight: 800; color: var(--text); }
</style>
