<script lang="ts" context="module">
	export const load = async ({ fetch }) => {
		try {
			const res = await fetch('/api/openapi.json');
			if (!res.ok) throw new Error('Failed to load');
			const spec = await res.json();
			return { spec };
		} catch {
			return { spec: null };
		}
	};
</script>

<script lang="ts">
	let { data } = $props();
	let spec = $state(data.spec);

	function groupByTag(paths: Record<string, any>) {
		const groups: Record<string, any[]> = {};
		if (!paths) return groups;
		for (const [path, methods] of Object.entries(paths)) {
			for (const [method, detail] of Object.entries(methods as Record<string, any>)) {
				const tag = (detail.tags || ['Other'])[0];
				if (!groups[tag]) groups[tag] = [];
				groups[tag].push({ path, method, ...detail as any });
			}
		}
		return groups;
	}

	function methodColor(m: string) {
		const colors: Record<string, string> = { get: 'bg-blue-500', post: 'bg-green-500', put: 'bg-yellow-500', patch: 'bg-orange-500', delete: 'bg-red-500' };
		return colors[m.toLowerCase()] || 'bg-gray-500';
	}

	let groups = $derived(groupByTag(spec?.paths));
</script>

<div class="p-6">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-[var(--text-primary)]">API Documentation</h1>
		<p class="text-[var(--text-muted)] mt-1">
			{spec?.info?.title || 'LMS API'} — {spec?.info?.version || ''}
		</p>
	</div>

	{#if !spec}
		<div class="text-center py-12 text-[var(--text-muted)]">
			<p>API spec not available. Run <code class="text-sm bg-[var(--bg-secondary)] px-2 py-0.5 rounded">npm run generate-api-docs</code></p>
		</div>
	{:else}
		{#each Object.entries(groups) as [tag, endpoints]}
			<div class="mb-8">
				<h2 class="text-lg font-semibold text-[var(--text-primary)] mb-3 capitalize">{tag}</h2>
				<div class="space-y-3">
					{#each endpoints as ep}
						<details class="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
							<summary class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
								<span class="inline-block px-2 py-0.5 rounded text-xs font-bold text-white uppercase {methodColor(ep.method)}">{ep.method}</span>
								<code class="text-sm font-mono text-[var(--text-primary)]">{ep.path}</code>
								<span class="text-sm text-[var(--text-muted)] ml-auto">{ep.summary || ''}</span>
							</summary>
							<div class="px-4 pb-4 pt-2 border-t border-[var(--border)]">
								{#if ep.description}
									<p class="text-sm text-[var(--text-secondary)] mb-4">{ep.description}</p>
								{/if}

								{#if ep.parameters?.length}
									<h4 class="text-sm font-medium text-[var(--text-primary)] mb-2">Parameters</h4>
									<div class="overflow-x-auto mb-4">
										<table class="w-full text-xs">
											<thead class="bg-[var(--bg-secondary)]">
												<tr>
													<th class="px-3 py-1.5 text-left font-medium">Name</th>
													<th class="px-3 py-1.5 text-left font-medium">In</th>
													<th class="px-3 py-1.5 text-left font-medium">Type</th>
													<th class="px-3 py-1.5 text-left font-medium">Required</th>
													<th class="px-3 py-1.5 text-left font-medium">Description</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-[var(--border)]">
												{#each ep.parameters as param}
													<tr>
														<td class="px-3 py-1.5 font-mono">{param.name}</td>
														<td class="px-3 py-1.5 text-[var(--text-muted)]">{param.in}</td>
														<td class="px-3 py-1.5 text-[var(--text-muted)]">{param.schema?.type || 'string'}</td>
														<td class="px-3 py-1.5">{param.required ? 'Yes' : 'No'}</td>
														<td class="px-3 py-1.5 text-[var(--text-muted)]">{param.description || '-'}</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}

								{#if ep.requestBody?.content?.['application/json']?.schema}
									<h4 class="text-sm font-medium text-[var(--text-primary)] mb-2">Request Body</h4>
									<pre class="text-xs bg-[var(--bg-secondary)] p-3 rounded-lg overflow-x-auto mb-4">{JSON.stringify(ep.requestBody.content['application/json'].schema, null, 2)}</pre>
								{/if}

								{#if ep.responses}
									<h4 class="text-sm font-medium text-[var(--text-primary)] mb-2">Responses</h4>
									<div class="space-y-1">
										{#each Object.entries(ep.responses) as [code, resp]}
											<div class="flex gap-2 text-xs">
												<span class="font-mono font-bold {parseInt(code) < 400 ? 'text-green-400' : 'text-red-400'}">{code}</span>
												<span class="text-[var(--text-muted)]">{(resp as any).description || ''}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</details>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
