<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user.svelte';
	import { paths } from '$lib/stores/paths';

	let pathSlug = $state('');
	let title = $state('');
	let description = $state('');
	let repoUrl = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');

	onMount(() => {
		if (!user.isLoggedIn) {
			goto('/login');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!pathSlug || !title || !description) {
			errorMsg = 'Harap isi path, judul, dan deskripsi';
			return;
		}
		submitting = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/capstone', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-device-id': user.userId || user.deviceId,
				},
				body: JSON.stringify({
					path_slug: pathSlug,
					title,
					description,
					repo_url: repoUrl || undefined,
				}),
			});
			const data = await res.json();
			if (data.success) {
				goto('/capstone');
			} else {
				errorMsg = data.error || 'Gagal membuat proyek';
			}
		} catch {
			errorMsg = 'Gagal membuat proyek';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="new-capstone">
	<a href="/capstone" class="back-link">&larr; Kembali</a>
	<h1>Buat Project Baru</h1>
	<p class="subtitle">Pilih learning path dan deskripsikan proyek capstone-mu</p>

	<form onsubmit={handleSubmit}>
		<div class="form-group">
			<label for="path">Learning Path</label>
			<select id="path" bind:value={pathSlug} required>
				<option value="">— Pilih Path —</option>
				{#each paths as p}
					<option value={p.slug}>{p.icon} {p.title}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="title">Judul Proyek</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				placeholder="Contoh: Aplikasi Manajemen Tugas dengan AI"
				required
			/>
		</div>

		<div class="form-group">
			<label for="desc">Deskripsi</label>
			<textarea
				id="desc"
				bind:value={description}
				placeholder="Jelaskan proyek yang akan kamu buat — fitur utama, teknologi yang digunakan, dll."
				rows="5"
				required
			></textarea>
		</div>

		<div class="form-group">
			<label for="repo">URL Repository (opsional)</label>
			<input
				id="repo"
				type="url"
				bind:value={repoUrl}
				placeholder="https://github.com/username/repo"
			/>
		</div>

		{#if errorMsg}
			<div class="error-msg">{errorMsg}</div>
		{/if}

		<button type="submit" class="btn-primary" disabled={submitting}>
			{submitting ? 'Menyimpan...' : 'Simpan Project'}
		</button>
	</form>
</div>

<style>
	.new-capstone {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 20px;
		color: var(--accent);
		font-size: 14px;
		text-decoration: none !important;
	}

	.back-link:hover {
		text-decoration: underline !important;
	}

	h1 {
		font-size: 24px;
		color: var(--text);
		margin-bottom: 6px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 28px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.form-group select,
	.form-group input,
	.form-group textarea {
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
		outline: none;
		transition: border-color 0.15s;
	}

	.form-group select:focus,
	.form-group input:focus,
	.form-group textarea:focus {
		border-color: var(--accent);
	}

	.error-msg {
		padding: 10px 14px;
		background: rgba(231, 76, 60, 0.1);
		border: 1px solid rgba(231, 76, 60, 0.3);
		border-radius: 8px;
		color: #ef4444;
		font-size: 13px;
	}

	.btn-primary {
		padding: 12px 24px;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		align-self: flex-start;
	}

	.btn-primary:hover:not(:disabled) { opacity: 0.9; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
