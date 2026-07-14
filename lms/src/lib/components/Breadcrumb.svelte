<script lang="ts">
	interface Crumb {
		label: string;
		href?: string;
	}

	let {
		items = [] as Crumb[],
		homeHref = '/' as string,
		homeLabel = '🏠' as string,
	} = $props();
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<ol>
		<li>
			<a href={homeHref} class="home">{homeLabel}</a>
		</li>
		{#each items as crumb, i}
			<li>
				<span class="sep">/</span>
				{#if crumb.href && i < items.length - 1}
					<a href={crumb.href}>{crumb.label}</a>
				{:else}
					<span class="current" aria-current="page">{crumb.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		margin-bottom: 16px;
		font-size: 13px;
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.sep {
		color: var(--text-secondary);
		opacity: 0.5;
	}
	a, .home {
		color: var(--accent);
		text-decoration: none;
		transition: color 0.15s;
	}
	a:hover {
		color: var(--accent-secondary);
		text-decoration: underline;
	}
	.current {
		color: var(--text);
		font-weight: 500;
	}
	.home {
		font-size: 15px;
		line-height: 1;
	}
</style>
