<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');

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
			const res = await fetch('/api/auth/register/student', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					password,
				}),
			});
			const json = await res.json();
			if (json.success) {
				// Save token to localStorage and redirect to dashboard
				if (browser) {
					localStorage.setItem('token', json.token);
				}
				goto('/dashboard');
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
	<title>{t('register.title')} — RPL AI Curriculum</title>
	<meta name="description" content="Daftar akun untuk mulai belajar di RPL AI Curriculum." />
</svelte:head>

<div class="register-page">
	<div class="register-card">
		<h1>{t('register.title')}</h1>
		<p class="subtitle">{t('register.subtitle')}</p>

		<form onsubmit={handleSubmit}>
			{#if error}
				<div class="form-error">{error}</div>
			{/if}

			<div class="form-group">
				<label for="name">{t('register.fullname')}</label>
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
				<label for="email">{t('register.email')}</label>
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
				<label for="password">{t('register.password')}</label>
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
				<label for="confirmPassword">{t('register.confirm_password')}</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Ulangi password"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" class="btn btn-primary btn-lg btn-full" disabled={loading}>
				{loading ? t('common.loading') : t('register.register_btn')}
			</button>

			<p class="login-link">
				{t('register.have_account')} <a href="/login">{t('register.login_btn')}</a>
			</p>
		</form>
	</div>
</div>

<style>
	.register-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.register-card {
		width: 100%;
		max-width: 480px;
		background: var(--surface, #FFFFFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 16px;
		padding: 36px 32px;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
		color: var(--text, #1a1a2e);
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary, #64748b);
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
		color: var(--text-secondary, #64748b);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input {
		width: 100%;
		padding: 10px 14px;
		font-size: 14px;
		font-family: inherit;
		background: var(--surface, #FFFFFF);
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 8px;
		color: var(--text, #1a1a2e);
		outline: none;
		transition: border-color 0.15s;
	}

	.form-group input:focus {
		border-color: #4F46E5;
		box-shadow: 0 0 0 2px rgba(79,70,229,0.15);
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
		background: #4F46E5;
		color: #fff;
	}
	.btn-primary:hover:not(:disabled) { opacity: 0.85; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-lg { padding: 12px 24px; font-size: 15px; }
	.btn-full { width: 100%; }

	.login-link {
		text-align: center;
		margin-top: 16px;
		font-size: 13px;
		color: var(--text-secondary, #64748b);
	}
	.login-link a {
		color: #4F46E5;
		text-decoration: none;
	}
	.login-link a:hover { text-decoration: underline; }
</style>
