<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { t } from '$lib/stores/i18n';
	import { user } from '$lib/stores/user.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let name = $state('');
	let password = $state('');
	let error = $state('');

	// 2FA challenge state
	let need2fa = $state(false);
	let tempToken = $state('');
	let code = $state('');
	let verifying2fa = $state(false);

	onMount(() => {
		if (user.isLoggedIn) {
			name = user.username;
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) {
			error = 'Silakan masukkan email atau username';
			addToast('Silakan masukkan email atau username', 'warning');
			return;
		}

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: trimmed, password }),
			});
			const data = await res.json();

			if (!data.success) {
				error = data.error || 'Login gagal';
				addToast(error, 'error');
				return;
			}

			if (data.need2fa) {
				// Show 2FA challenge input
				need2fa = true;
				tempToken = data.temp_token;
				error = '';
				return;
			}

			// Normal login — set session
			if (data.token && data.user) {
				auth.setSession(data.token, data.user);
				user.username = trimmed;
				progress.updateStreak();
				addToast('Login berhasil! Selamat datang ' + trimmed, 'success');
				const params = new URLSearchParams(window.location.search);
				const target = params.get('redirect') || (data.user.role === 'parent' ? '/parent' : '/dashboard');
				setTimeout(() => {
					window.location.href = target;
				}, 50);
			}
		} catch {
			error = 'Terjadi gangguan koneksi ke server';
			addToast('Terjadi gangguan koneksi ke server', 'error');
		}
	}

	async function handle2faVerify(e: Event) {
		e.preventDefault();
		const trimmed = code.trim();
		if (!trimmed || trimmed.length !== 6) {
			error = 'Masukkan kode 6 digit dari aplikasi authenticator';
			addToast('Kode 6 digit diperlukan', 'warning');
			return;
		}

		verifying2fa = true;
		error = '';
		try {
			const res = await fetch('/api/auth/2fa/challenge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ temp_token: tempToken, code: trimmed }),
			});
			const data = await res.json();

			if (data.success && data.token && data.user) {
				auth.setSession(data.token, data.user);
				user.username = name;
				progress.updateStreak();
				addToast('Verifikasi 2FA berhasil!', 'success');
				const params = new URLSearchParams(window.location.search);
				const target = params.get('redirect') || (data.user.role === 'parent' ? '/parent' : '/dashboard');
				setTimeout(() => {
					window.location.href = target;
				}, 50);
			} else {
				error = data.error || 'Kode verifikasi salah';
				addToast(error, 'error');
			}
		} catch {
			error = 'Terjadi gangguan koneksi ke server';
			addToast('Terjadi gangguan koneksi ke server', 'error');
		} finally {
			verifying2fa = false;
		}
	}

	function redirectOAuth(provider: string) {
		window.location.href = `/api/auth/oauth/redirect/${provider}`;
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-icon">📘</div>
		<h1>RPL AI Curriculum</h1>

		{#if need2fa}
			<!-- 2FA Challenge -->
			<p class="login-desc">Masukkan kode dari aplikasi authenticator kamu</p>
			<form onsubmit={handle2faVerify}>
				<input
					type="text"
					bind:value={code}
					placeholder="000000"
					maxlength={6}
					class="login-input login-code-input"
					autocomplete="one-time-code"
					inputmode="numeric"
					pattern="[0-9]*"
				/>
				{#if error}
					<p class="login-error">{error}</p>
				{/if}
				<Button type="submit" variant="primary" size="lg" disabled={verifying2fa} class="w-full">
					{verifying2fa ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
				</Button>
			</form>
		{:else}
			<!-- Normal Login -->
			<p class="login-desc">Masukkan email atau username kamu untuk mulai belajar</p>
			<form onsubmit={handleLogin}>
				<input
					type="text"
					bind:value={name}
					placeholder="Email atau username..."
					class="login-input"
					autocomplete="username"
				/>
				<input
					type="password"
					bind:value={password}
					placeholder="Password (opsional)"
					class="login-input"
					autocomplete="current-password"
				/>
				{#if error}
					<p class="login-error">{error}</p>
				{/if}
				<Button type="submit" variant="primary" size="lg" class="w-full">
					Mulai Belajar
				</Button>
			</form>

			<div class="oauth-divider">
				<span class="divider-line"></span>
				<span class="divider-text">atau</span>
				<span class="divider-line"></span>
			</div>

			<div class="oauth-buttons">
				<a href="/api/auth/oauth/redirect/google" class="oauth-btn google" role="button">
					<span class="oauth-icon">🔵</span>
					<span>Login dengan Google</span>
				</a>
				<a href="/api/auth/oauth/redirect/github" class="oauth-btn github" role="button">
					<span class="oauth-icon">🐙</span>
					<span>Login dengan GitHub</span>
				</a>
				<a href="/api/auth/oauth/redirect/microsoft" class="oauth-btn microsoft" role="button">
					<span class="oauth-icon">🪟</span>
					<span>Login dengan Microsoft</span>
				</a>
			</div>

			<p class="reset-link">
				<a href="/reset-password">Lupa Password?</a>
			</p>

			<p class="register-link">
				Belum punya akun? <a href="/register">Daftar</a>
			</p>

			<p class="oauth-note">
				Login via OAuth akan mengirim kamu ke Google/GitHub untuk verifikasi.
				Data kamu aman dan tidak dibagikan.
			</p>
		{/if}
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
	}

	.login-card {
		background: var(--surface, var(--surface));
		border: 1px solid rgba(0,0,0,0.06);
		border-radius: 12px;
		padding: 40px 36px;
		text-align: center;
		max-width: 400px;
		width: 100%;
	}

	.login-icon {
		font-size: 44px;
		margin-bottom: 16px;
		opacity: 0.9;
	}

	h1 {
		font-size: 24px;
		font-weight: 590;
		margin-bottom: 8px;
		color: var(--text);
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.288px;
	}

	.login-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 28px;
		font-feature-settings: 'cv01', 'ss03';
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.login-input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid var(--border, var(--border));
		border-radius: 8px;
		background: var(--surface, var(--surface));
		color: var(--text, var(--text));
		font-size: 14px;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		outline: none;
		transition: all 0.15s ease;
		box-sizing: border-box;
	}

	.login-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.15);
	}

	.login-input::placeholder {
		color: var(--text-muted);
	}

	.login-code-input {
		font-size: 24px;
		text-align: center;
		letter-spacing: 8px;
		font-family: monospace;
	}

	.login-error {
		font-size: 13px;
		color: var(--danger);
		text-align: left;
	}

	.login-submit {
		width: 100%;
		padding: 10px;
		background: var(--accent, var(--accent));
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 510;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.login-submit:hover {
		background: var(--accent-hover, var(--accent-hover));
		box-shadow: 0 2px 12px rgba(79,70,229,0.3);
	}

	.login-submit:active {
		transform: scale(0.98);
	}

	.login-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.oauth-divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 24px 0 16px;
	}

	.divider-line {
		flex: 1;
		height: 1px;
		background: rgba(0,0,0,0.08);
	}

	.divider-text {
		font-size: 12px;
		color: var(--text-muted);
		white-space: nowrap;
		font-feature-settings: 'cv01', 'ss03';
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.oauth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		border: 1px solid var(--border, var(--border));
		border-radius: 8px;
		background: var(--surface, var(--surface));
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 510;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none !important;
	}

	.oauth-btn.microsoft:hover {
		border-color: var(--accent);
		background: rgba(0, 120, 212, 0.04);
	}

	.oauth-btn:hover {
		background: rgba(79,70,229,0.04);
		border-color: var(--accent, var(--accent));
		color: var(--accent, var(--accent));
	}

	.oauth-icon {
		font-size: 16px;
	}

	.register-link {
		margin-top: 16px;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.register-link a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 510;
	}
	.register-link a:hover {
		text-decoration: underline;
	}

	.oauth-note {
		margin-top: 16px;
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.4;
		font-feature-settings: 'cv01', 'ss03';
	}

	.reset-link {
		margin-top: 16px;
		font-size: 13px;
	}

	.reset-link a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 510;
		font-feature-settings: 'cv01', 'ss03';
	}

	.reset-link a:hover {
		text-decoration: underline;
	}
</style>
