<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, CardContent, EmptyState, Loading, Select } from '$lib/components/ui';

	let offerings: any[] = $state([]);
	let instructors: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let savingId = $state<string | null>(null);

	onMount(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [offRes, instRes] = await Promise.all([
				fetch('/api/admin/course-offerings'),
				fetch('/api/admin/users/instructors'),
			]);
			const offJson = await offRes.json();
			const instJson = await instRes.json();
			if (offJson.success) offerings = offJson.data || [];
			else error = offJson.error || 'Gagal memuat offering';
			if (instJson.success) instructors = instJson.data || [];
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function assignInstructor(offeringId: string, instructorId: string) {
		savingId = offeringId;
		try {
			const res = await fetch('/api/admin/course-offerings/assign-instructor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ offering_id: offeringId, instructor_id: instructorId }),
			});
			const json = await res.json();
			if (json.success) {
				// Update local state
				offerings = offerings.map(o =>
					o.id === offeringId ? { ...o, instructor_id: instructorId || null } : o
				);
			} else {
				alert(json.error || 'Gagal menetapkan instruktur');
			}
		} catch {
			alert('Gagal terhubung');
		} finally {
			savingId = null;
		}
	}

	function getInstructorName(id: string | null): string {
		if (!id) return '—';
		const inst = instructors.find(i => i.id === id);
		return inst ? inst.name : '—';
	}

	const instructorOptions = $derived([
		{ value: '', label: '— Pilih Instruktur —' },
		...instructors.map(i => ({ value: i.id, label: `${i.name} (${i.email})` })),
	]);
</script>

<svelte:head>
	<title>Course Offerings — Admin</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Course Offerings</h1>
			<p class="subtitle">Atur instruktur untuk setiap course offering</p>
		</div>
		<Button variant="secondary" onclick={loadData}>🔄 Refresh</Button>
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Card>
			<CardContent>
				<div class="error-state">
					<p class="error-text">{error}</p>
					<Button onclick={loadData}>Coba Lagi</Button>
				</div>
			</CardContent>
		</Card>
	{:else if offerings.length === 0}
		<EmptyState icon="📚" title="Tidak ada course offerings" description="Belum ada course offerings yang tersedia." />
	{:else}
		<div class="table-wrapper">
			<table class="offerings-table">
				<thead>
					<tr>
						<th>Nama</th>
						<th>Kode</th>
						<th>Instruktur Saat Ini</th>
						<th>Atur Instruktur</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each offerings as offering}
						<tr>
							<td class="cell-name">{offering.name}</td>
							<td class="cell-code">{offering.code || '—'}</td>
							<td>
								<span class="current-instructor">{getInstructorName(offering.instructor_id)}</span>
							</td>
							<td>
								<div class="assign-cell">
									<select
										class="instructor-select"
										value={offering.instructor_id || ''}
										disabled={savingId === offering.id}
										onchange={(e) => {
											const val = (e.target as HTMLSelectElement).value;
											assignInstructor(offering.id, val);
										}}
									>
										<option value="">— Pilih Instruktur —</option>
										{#each instructors as inst}
											<option
												value={inst.id}
												selected={inst.id === offering.instructor_id}
											>{inst.name} ({inst.email})</option>
										{/each}
									</select>
									{#if savingId === offering.id}
										<span class="saving-indicator">Menyimpan...</span>
									{/if}
								</div>
							</td>
							<td>
								<Badge variant={offering.status === 'active' ? 'success' : offering.status === 'draft' ? 'default' : 'warning'}>
									{offering.status || '—'}
								</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
		flex-wrap: wrap;
	}

	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.error-state {
		text-align: center;
		padding: 20px;
	}

	.error-text {
		color: #ef4444;
		margin-bottom: 12px;
		font-size: 14px;
	}

	.table-wrapper {
		overflow-x: auto;
	}

	.offerings-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.offerings-table th {
		text-align: left;
		padding: 10px 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}

	.offerings-table td {
		padding: 12px;
		border-bottom: 1px solid var(--border);
		color: var(--text);
		vertical-align: middle;
	}

	.cell-name {
		font-weight: 500;
		min-width: 180px;
	}

	.cell-code {
		font-family: monospace;
		font-size: 13px;
		color: var(--text-secondary);
	}

	.current-instructor {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.assign-cell {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.instructor-select {
		padding: 6px 10px;
		font-size: 13px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text);
		outline: none;
		min-width: 200px;
		cursor: pointer;
	}

	.instructor-select:focus {
		border-color: #5e6ad2;
	}

	.instructor-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.saving-indicator {
		font-size: 12px;
		color: var(--accent);
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.instructor-select {
			min-width: 140px;
		}
		.offerings-table {
			font-size: 13px;
		}
	}
</style>
