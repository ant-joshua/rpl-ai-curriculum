<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { page } from '$app/stores';

	let token = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let step = $state<'input' | 'reset'>('input');
	let loading = $state(false);

	onMount(() => {
		// Read token from URL query param
		const url = new URL(window.location.href);
		const t = url.searchParams.get('token');
		if (t) {
			token = t;
			step = 'reset';
		}
	});

	async function handleSendReset(e: Event) {
		e.preventDefault();
		error = '';

		const emailField = (e.target as HTMLFormElement).querySelector('[name="email"]') as HTMLInputElement;
		const email = emailField?.value?.trim();
		if (!email) {
			error = 'Masukkan email kamu';
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const body = await res.json();
			if (body.success) {
				addToast('Link reset password sudah dikirim (cek console/respons untuk link)', 'success');
				if (body.token) {
					// Auto-fill token for MVP convenience
					token = body.token;
					step = 'reset';
				}
			} else {
				error = body.error || 'Gagal mengirim reset link';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function handleResetPassword(e: Event) {
		e.preventDefault();
		error = '';

		if (!token) {
			error = 'Token tidak ditemukan';
			return;
		}

		if (newPassword.length < 6) {
			error = 'Password minimal 6 karakter';
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Password tidak cocok';
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, new_password: newPassword }),
			});
			const body = await res.json();
			if (body.success) {
				addToast('Password berhasil direset! Silakan login.', 'success');
				setTimeout(() => {
					window.location.href = '/login';
				}, 50);
			} else {
				error = body.error || 'Gagal mereset password';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}
</script>

<div class="reset-page">
	<div class="reset-card">
		<div class="reset-icon">{step === 'input' ? '🔑' : '🔐'}</div>
		<h1>Reset Password</h1>

		{#if step === 'input'}
			<p class="reset-desc">Masukkan email kamu untuk menerima link reset password</p>
			<form onsubmit={handleSendReset}>
				<input
					type="email"
					name="email"
					placeholder="Email kamu..."
					class="reset-input"
					autocomplete="email"
					required
				/>
				{#if error}
					<p class="reset-error">{error}</p>
				{/if}
				<button type="submit" class="reset-submit" disabled={loading}>
					{loading ? 'Mengirim...' : 'Kirim Link Reset'}
				</button>
			</form>
		{:else}
			<p class="reset-desc">Masukkan password baru kamu</p>
			<form onsubmit={handleResetPassword}>
				<input
					type="password"
					bind:value={newPassword}
					placeholder="Password baru..."
					class="reset-input"
					autocomplete="new-password"
					minlength={6}
					required
				/>
				<input
					type="password"
					bind:value={confirmPassword}
					placeholder="Konfirmasi password..."
					class="reset-input"
					autocomplete="new-password"
					minlength={6}
					required
				/>
				{#if error}
					<p class="reset-error">{error}</p>
				{/if}
				<button type="submit" class="reset-submit" disabled={loading}>
					{loading ? 'Menyimpan...' : 'Reset Password'}
				</button>
			</form>
		{/if}

		<p class="reset-back">
			<a href="/login">← Kembali ke Login</a>
		</p>
	</div>
</div>

<style>
	.reset-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
	}
	.reset-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 40px 36px;
		text-align: center;
		max-width: 400px;
		width: 100%;
	}
	.reset-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}
	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
	}
	.reset-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 28px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.reset-input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg);
		color: var(--text);
		font-size: 15px;
		outline: none;
		transition: border-color 0.15s ease;
	}
	.reset-input:focus {
		border-color: var(--accent);
	}
	.reset-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}
	.reset-error {
		font-size: 13px;
		color: var(--danger);
		text-align: left;
	}
	.reset-submit {
		width: 100%;
		padding: 12px;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.reset-submit:hover {
		opacity: 0.9;
	}
	.reset-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.reset-back {
		margin-top: 20px;
		font-size: 13px;
	}
	.reset-back a {
		color: var(--accent);
		text-decoration: none;
	}
	.reset-back a:hover {
		text-decoration: underline;
	}
</style>
