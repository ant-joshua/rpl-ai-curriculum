<script lang="ts">
	import { user } from '$lib/stores/user.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let name = $state('');
	let error = $state('');

	onMount(() => {
		if (user.isLoggedIn) {
			name = user.username;
		}
	});

	function handleLogin(e: Event) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) {
			error = 'Silakan masukkan nama kamu';
			addToast('Silakan masukkan nama kamu', 'warning');
			return;
		}
		user.username = trimmed;
		progress.updateStreak();
		addToast('Login berhasil! Selamat datang ' + trimmed, 'success');

		setTimeout(() => {
			window.location.href = '/dashboard';
		}, 50);
	}

	function redirectOAuth(provider: string) {
		window.location.href = `/api/auth/oauth/redirect/${provider}`;
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-icon">📘</div>
		<h1>RPL AI Curriculum</h1>
		<p class="login-desc">Masukkan nama kamu untuk mulai belajar</p>

		<form onsubmit={handleLogin}>
			<input
				type="text"
				bind:value={name}
				placeholder="Nama kamu..."
				class="login-input"
				autocomplete="name"
			/>
			{#if error}
				<p class="login-error">{error}</p>
			{/if}
			<button type="submit" class="login-submit">
				Mulai Belajar
			</button>
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
		</div>

		<p class="reset-link">
			<a href="/reset-password">Lupa Password?</a>
		</p>

		<p class="oauth-note">
			Login via OAuth akan mengirim kamu ke Google/GitHub untuk verifikasi.
			Data kamu aman dan tidak dibagikan.
		</p>
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
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.08);
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
		color: #f7f8f8;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.288px;
	}

	.login-desc {
		color: #8a8f98;
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
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 6px;
		background: transparent;
		color: #f7f8f8;
		font-size: 14px;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		outline: none;
		transition: all 0.15s ease;
	}

	.login-input:focus {
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94,106,210,0.15);
	}

	.login-input::placeholder {
		color: #62666d;
	}

	.login-error {
		font-size: 13px;
		color: #ef4444;
		text-align: left;
	}

	.login-submit {
		width: 100%;
		padding: 10px;
		background: linear-gradient(135deg, #5e6ad2, #7170ff);
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 510;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.login-submit:hover {
		background: linear-gradient(135deg, #7170ff, #828fff);
		box-shadow: 0 2px 12px rgba(94,106,210,0.3);
	}

	.login-submit:active {
		transform: scale(0.98);
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
		background: rgba(255,255,255,0.06);
	}

	.divider-text {
		font-size: 12px;
		color: #62666d;
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
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 6px;
		background: transparent;
		color: #d0d6e0;
		font-size: 13px;
		font-weight: 510;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none !important;
	}

	.oauth-btn:hover {
		background: rgba(255,255,255,0.04);
		border-color: rgba(255,255,255,0.15);
		color: #f7f8f8;
	}

	.oauth-icon {
		font-size: 16px;
	}

	.oauth-note {
		margin-top: 16px;
		font-size: 12px;
		color: #62666d;
		line-height: 1.4;
		font-feature-settings: 'cv01', 'ss03';
	}

	.reset-link {
		margin-top: 16px;
		font-size: 13px;
	}

	.reset-link a {
		color: #7170ff;
		text-decoration: none;
		font-weight: 510;
		font-feature-settings: 'cv01', 'ss03';
	}

	.reset-link a:hover {
		text-decoration: underline;
	}
</style>
