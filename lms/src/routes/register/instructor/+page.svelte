<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let bio = $state('');
	let courseInterests = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!name.trim()) { error = 'Nama wajib diisi'; return; }
		if (!email.trim()) { error = 'Email wajib diisi'; return; }
		if (!password) { error = 'Password wajib diisi'; return; }
		if (password.length < 6) { error = 'Password minimal 6 karakter'; return; }
		if (password !== confirmPassword) { error = 'Password tidak cocok'; return; }

		loading = true;
		try {
			const res = await fetch('/api/auth/register/instructor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					password,
					bio: bio.trim(),
					course_interests: courseInterests.trim(),
				}),
			});
			const json = await res.json();
			if (json.success) {
				success = true;
			} else {
				error = json.error || 'Pendaftaran gagal';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Daftar Instruktur — RPL AI Curriculum</title>
	<meta name="description" content="Daftar sebagai instruktur untuk mengajar kursus AI di RPL AI Curriculum." />
</svelte:head>

<div class="register-page">
	<div class="register-card">
		{#if success}
			<div class="success-state">
				<div class="success-icon">✅</div>
				<h2>Pendaftaran Berhasil!</h2>
				<p>Akun instruktur Anda telah didaftarkan dan sedang menunggu persetujuan admin.</p>
				<p class="success-note">Anda akan menerima notifikasi setelah akun disetujui.</p>
				<a href="/login" class="btn btn-primary btn-lg" style="margin-top: 20px;">
					Login
				</a>
			</div>
		{:else}
			<h1>Daftar Instruktur</h1>
			<p class="subtitle">Bergabunglah sebagai pengajar di RPL AI Curriculum</p>

			<form onsubmit={handleSubmit}>
				{#if error}
					<div class="form-error">{error}</div>
				{/if}

				<div class="form-group">
					<label for="name">Nama Lengkap</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						placeholder="Masukkan nama lengkap"
						required
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="contoh@email.com"
						required
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Minimal 6 karakter"
						required
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="confirmPassword">Konfirmasi Password</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="Ulangi password"
						required
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="bio">Bio / Pengalaman</label>
					<textarea
						id="bio"
						bind:value={bio}
						placeholder="Ceritakan pengalaman mengajar atau latar belakang Anda..."
						rows={4}
						disabled={loading}
					></textarea>
				</div>

				<div class="form-group">
					<label for="courseInterests">Minat Kursus</label>
					<textarea
						id="courseInterests"
						bind:value={courseInterests}
						placeholder="Kursus atau topik apa yang ingin Anda ajarkan?"
						rows={3}
						disabled={loading}
					></textarea>
				</div>

				<button type="submit" class="btn btn-primary btn-lg btn-full" disabled={loading}>
					{loading ? 'Mendaftarkan...' : 'Daftar sebagai Instruktur'}
				</button>

				<p class="login-link">
					Sudah punya akun? <a href="/login">Login</a>
				</p>
			</form>
		{/if}
	</div>
</div>

<style>
	.register-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: var(--bg, #0a0b0c);
	}

	.register-card {
		width: 100%;
		max-width: 480px;
		background: var(--surface, #131415);
		border: 1px solid var(--border, rgba(255,255,255,0.08));
		border-radius: 16px;
		padding: 36px 32px;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
		color: var(--text, #f7f8f8);
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary, #8a8f98);
		margin: 0 0 24px;
	}

	.form-error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		color: #ef4444;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 16px;
	}

	.form-group {
		margin-bottom: 18px;
	}

	.form-group label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary, #8a8f98);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 10px 14px;
		font-size: 14px;
		font-family: inherit;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 8px;
		color: var(--text, #f7f8f8);
		outline: none;
		transition: border-color 0.15s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94,106,210,0.15);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 60px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 590;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s;
		font-family: inherit;
	}
	.btn-primary {
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		color: #fff;
	}
	.btn-primary:hover:not(:disabled) { opacity: 0.85; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-lg { padding: 12px 24px; font-size: 15px; }
	.btn-full { width: 100%; }
	.btn-full + .btn-full { margin-top: 8px; }

	.login-link {
		text-align: center;
		margin-top: 16px;
		font-size: 13px;
		color: var(--text-secondary, #8a8f98);
	}
	.login-link a {
		color: #7170ff;
		text-decoration: none;
	}
	.login-link a:hover { text-decoration: underline; }

	.success-state {
		text-align: center;
		padding: 20px 0;
	}
	.success-icon { font-size: 48px; margin-bottom: 16px; }
	.success-state h2 { margin: 0 0 12px; }
	.success-state p { font-size: 14px; color: var(--text-secondary); margin: 0 0 4px; }
	.success-note { font-size: 13px; margin-top: 8px; }
</style>
