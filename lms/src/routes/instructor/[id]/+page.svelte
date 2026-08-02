<script lang="ts">
	import { Card, CardContent, Avatar } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();
	let instructor = $derived(data.instructor);
	let courses = $derived(data.courses || []);

	function parseSocial(links: string): Record<string, string> {
		try { return JSON.parse(links || '{}'); } catch { return {}; }
	}

	function stars(rating: string | null): string {
		if (!rating) return '';
		const full = Math.round(Number(rating));
		return '★'.repeat(full) + '☆'.repeat(5 - full);
	}
</script>

<svelte:head>
	<title>{instructor ? instructor.name : 'Pengajar'} — RPL AI Curriculum</title>
</svelte:head>

{#if !instructor}
	<div class="not-found">
		<h1>Pengajar tidak ditemukan</h1>
		<a href="/catalog" class="back-link">← Kembali ke katalog</a>
	</div>
{:else}
	<div class="instructor-page">
		<!-- Header -->
		<section class="profile-header">
			<Avatar src={instructor.avatarUrl} initials={(instructor.name || '?').charAt(0).toUpperCase()} alt={instructor.name} size="xl" />
			<div class="profile-info">
				<h1>{instructor.name}</h1>
				{#if instructor.headline}
					<p class="headline">{instructor.headline}</p>
				{/if}
				<div class="profile-stats">
					<span class="stat"><strong>{courses.length}</strong> Kursus</span>
					<span class="stat"><strong>{instructor.courseCount}</strong> Total</span>
				</div>
				{#if instructor.website}
					<a class="website" href={instructor.website} target="_blank" rel="noopener">🌐 {instructor.website}</a>
				{/if}
				{#if instructor.socialLinks}
					{@const links = parseSocial(instructor.socialLinks)}
					{#if Object.keys(links).length > 0}
						<div class="social-links">
							{#each Object.entries(links) as [platform, url]}
								<a href={url} target="_blank" rel="noopener" class="social-chip">{platform}</a>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</section>

		<!-- Bio -->
		{#if instructor.bio}
			<section class="bio-section">
				<h2>Tentang Pengajar</h2>
				<Card>
					<CardContent>
						<p class="bio-text">{instructor.bio}</p>
					</CardContent>
				</Card>
			</section>
		{/if}

		<!-- Courses -->
		<section class="courses-section">
			<h2>📚 Kursus</h2>
			{#if courses.length === 0}
				<p class="no-courses">Belum ada kursus aktif.</p>
			{:else}
				<div class="course-grid">
					{#each courses as c}
						<a class="course-card" href="/learn/{c.offeringId}/syllabus">
							<div class="course-icon">{c.icon}</div>
							<div class="course-body">
								<h3>{c.courseTitle}</h3>
								{#if c.name !== c.courseTitle}<p class="course-name">{c.name}</p>{/if}
								<p class="course-desc">{c.description}</p>
								<div class="course-meta">
									{#if c.avgRating}
										<span class="rating">★ {c.avgRating} <small>({c.ratingCount})</small></span>
									{/if}
									<span class="enrolled">👥 {c.enrolledCount}</span>
									<span class="level">{c.level}</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>
	</div>
{/if}

<style>
	.not-found { max-width: 640px; margin: 60px auto; text-align: center; }
	.back-link { color: var(--accent); text-decoration: none; font-weight: 600; }
	.instructor-page { max-width: 860px; margin: 0 auto; padding: 32px 16px; }
	.profile-header { display: flex; gap: 24px; align-items: center; margin-bottom: 28px; }
	.profile-info { flex: 1; }
	.profile-info h1 { margin: 0 0 4px; font-size: 26px; }
	.headline { color: var(--text-secondary); font-size: 15px; margin: 0 0 12px; }
	.profile-stats { display: flex; gap: 20px; margin-bottom: 10px; }
	.stat { font-size: 14px; color: var(--text-muted); }
	.stat strong { color: var(--text); font-size: 16px; }
	.website { display: inline-block; font-size: 13px; color: var(--accent); text-decoration: none; margin-bottom: 8px; }
	.social-links { display: flex; gap: 8px; flex-wrap: wrap; }
	.social-chip {
		padding: 3px 10px; border-radius: 999px; background: #f1f5f9;
		color: #334155; font-size: 12px; font-weight: 600; text-decoration: none;
	}
	.bio-section { margin-bottom: 28px; }
	.bio-section h2, .courses-section h2 { font-size: 18px; margin-bottom: 12px; }
	.bio-text { font-size: 14px; line-height: 1.6; color: var(--text-secondary); margin: 0; white-space: pre-wrap; }
	.no-courses { color: var(--text-muted); }
	.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
	.course-card {
		display: flex; gap: 12px; padding: 16px; background: var(--surface);
		border: 1px solid var(--border); border-radius: 12px; text-decoration: none;
		color: inherit; transition: all 0.2s;
	}
	.course-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
	.course-icon { font-size: 28px; flex-shrink: 0; }
	.course-body { min-width: 0; }
	.course-body h3 { font-size: 15px; margin: 0 0 2px; }
	.course-name { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; }
	.course-desc {
		font-size: 13px; color: var(--text-secondary); margin: 0 0 8px;
		display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
	}
	.course-meta { display: flex; gap: 10px; font-size: 12px; color: var(--text-muted); }
	.rating { color: #f59e0b; font-weight: 600; }
	.level { text-transform: capitalize; background: #f1f5f9; padding: 1px 8px; border-radius: 4px; }
</style>
