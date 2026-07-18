<script lang="ts">
	import { goto } from '$app/navigation';

	let name = '';
	let slug = '';
	let type = 'lms';
	let email = '';
	let saving = false;
	let error = '';

	const types = [
		{ value: 'lms', label: 'LMS (Course Platform)' },
		{ value: 'academic_k13', label: 'K13 School' },
		{ value: 'university', label: 'University' },
		{ value: 'bimbel', label: 'Bimbel / Tutoring Center' },
		{ value: 'tutor', label: 'Private Tutor' },
		{ value: 'kelompok', label: 'Kelompok Belajar' },
	];

	function generateSlug(val: string) {
		slug = val.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	async function submit(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';
		try {
			const res = await fetch('/api/admin/tenants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, slug, type, email }),
			});
			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Gagal membuat tenant';
				saving = false;
				return;
			}
			const data = await res.json();
			goto(`/admin/tenants/${data.tenant.id}`);
		} catch {
			error = 'Terjadi kesalahan';
			saving = false;
		}
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="page">
	<h1>Buat Tenant Baru</h1>

	<form class="card" on:submit={submit}>
		{#if error}
			<div class="form-error">{error}</div>
		{/if}

		<div class="field">
			<label for="name">Nama Tenant</label>
			<input id="name" type="text" bind:value={name} on:input={() => generateSlug(name)} required placeholder="Cth: SMA Kembang" />
		</div>

		<div class="field">
			<label for="slug">Slug (URL path)</label>
			<div class="slug-preview">/t/<input id="slug" type="text" bind:value={slug} required placeholder="sma-kembang" />/...</div>
		</div>

		<div class="field">
			<label for="type">Tipe Tenant</label>
			<select id="type" bind:value={type}>
				{#each types as t}
					<option value={t.value}>{t.label}</option>
				{/each}
			</select>
		</div>

		<div class="field">
			<label for="email">Email Admin</label>
			<input id="email" type="email" bind:value={email} placeholder="admin@smakembang.sch.id" />
		</div>

		<div class="actions">
			<a href="/admin/tenants" class="btn-cancel">{t('common.cancel')}</a>
			<button type="submit" class="btn-primary" disabled={saving}>
				{saving ? 'Menyimpan...' : 'Buat Tenant'}
			</button>
		</div>
	</form>
</div>

<style>
	.page { padding: 2rem; max-width: 640px; margin: 0 auto; }
	h1 { margin: 0 0 1.5rem; font-size: 1.25rem; color: var(--text-primary); }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
	.field { display: flex; flex-direction: column; gap: 0.4rem; }
	label { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
	input, select { padding: 0.6rem 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-input); color: var(--text-primary); font-size: 0.9rem; }
	input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-alpha); }
	.slug-preview { display: flex; align-items: center; gap: 0.25rem; color: var(--text-secondary); font-size: 0.9rem; }
	.slug-preview input { flex: 1; }
	.form-error { padding: 0.75rem; background: #fef2f2; color: #ef4444; border-radius: 8px; font-size: 0.85rem; }
	.actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
	.btn-primary { padding: 0.6rem 1.2rem; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-cancel { padding: 0.6rem 1.2rem; color: var(--text-secondary); text-decoration: none; border-radius: 8px; font-size: 0.9rem; }
	.btn-cancel:hover { background: var(--bg-code); }
</style>
