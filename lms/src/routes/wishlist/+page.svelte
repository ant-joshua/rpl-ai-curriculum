<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { addToast } from '$lib/stores/toast.svelte';
	import CourseCard from '$lib/components/catalog/CourseCard.svelte';
	import { EmptyState, Spinner } from '$lib/components/ui';

	let items = $state<any[]>([]);
	let loading = $state(true);
	let enrollingId = $state<string | null>(null);
	let isAuthenticated = $state(false);

	onMount(async () => {
		if (!browser) return;
		isAuthenticated = true;
		await loadWishlist();
	});

	async function loadWishlist() {
		loading = true;
		try {
			const res = await fetch('/api/wishlist');
			const json = await res.json();
			if (json.success) items = json.data || [];
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	async function handleWishlist(id: string) {
		try {
			const res = await fetch(`/api/wishlist/${id}/toggle`, { method: 'POST' });
			const json = await res.json();
			if (json.success && !json.data.wishlisted) {
				items = items.filter((i: any) => i.id !== id);
				addToast('Removed from wishlist', 'info');
			}
		} catch { /* ignore */ }
	}

	async function handleEnroll(offeringId: string) {
		enrollingId = offeringId;
		try {
			const res = await fetch('/api/my/enroll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ offeringId }),
			});
			const body = await res.json();
			if (body.success) {
				addToast('Successfully enrolled! 🎉', 'success');
				const { goto } = await import('$app/navigation');
				goto('/my/courses');
			} else {
				addToast(body.error || 'Enrollment failed', 'error');
			}
		} catch {
			addToast('Failed to connect to server', 'error');
		} finally {
			enrollingId = null;
		}
	}

	function toOffering(w: any) {
		return {
			id: w.id,
			name: w.name,
			courseTitle: w.course_title,
			courseSlug: w.course_slug,
			description: w.short_description || '',
			icon: w.course_icon || '📚',
			level: w.level || '',
			category: w.category || '',
			instructorName: null,
			isEnrolled: false,
			enrolledCount: w.enrolled_count || 0,
			maxStudents: null,
			spotsAvailable: true,
			isWishlisted: true,
		};
	}
</script>

<svelte:head>
	<title>Wishlist — RPL AI Curriculum</title>
</svelte:head>

<div class="wishlist-page">
	<nav class="breadcrumb">
		<a href="/" class="bc-link">Beranda</a>
		<span class="bc-sep">/</span>
		<span class="bc-current">Wishlist</span>
	</nav>

	<header class="page-header">
		<h1>❤️ Wishlist Saya</h1>
		<p class="page-subtitle">Kursus yang kamu simpan untuk nanti</p>
	</header>

	{#if loading}
		<div class="loading"><Spinner /> Memuat wishlist...</div>
	{:else if items.length === 0}
		<EmptyState
			icon="heart"
			title="Wishlist kosong"
			description="Klik ikon 🤍 di kartu kursus untuk menyimpannya di sini."
		>
			<a class="browse-link" href="/catalog">Lihat Katalog Kursus →</a>
		</EmptyState>
	{:else}
		<div class="wishlist-grid">
			{#each items as w (w.id)}
				<CourseCard
					offering={toOffering(w)}
					isAuthenticated={true}
					enrollingId={enrollingId}
					onenroll={handleEnroll}
					onwishlist={handleWishlist}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.wishlist-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		font-size: 12px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-muted);
	}

	.bc-link {
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}

	.bc-link:hover {
		color: var(--text-secondary);
	}

	.bc-sep {
		color: var(--text-muted);
		opacity: 0.5;
	}

	.bc-current {
		color: var(--text-secondary);
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		margin: 0 0 4px;
		font-size: 24px;
	}

	.page-subtitle {
		margin: 0;
		color: var(--text-muted);
		font-size: 14px;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-muted);
	}

	.wishlist-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.browse-link {
		display: inline-block;
		margin-top: 12px;
		color: var(--accent);
		font-weight: 600;
		text-decoration: none;
	}

	.browse-link:hover {
		text-decoration: underline;
	}
</style>
