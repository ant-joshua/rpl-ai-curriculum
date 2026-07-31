<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let message = $state('');
	let token = $state('');

	onMount(async () => {
		token = new URL(window.location.href).searchParams.get('token') || '';
		if (!token) {
			status = 'error';
			message = 'Token verifikasi tidak ditemukan.';
			return;
		}
		try {
			const res = await fetch('/api/auth/verify-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token }),
			});
			const data = await res.json();
			if (data.success) {
				status = 'success';
				message = 'Email berhasil diverifikasi!';
				setTimeout(() => goto('/login'), 2500);
			} else {
				status = 'error';
				message = data.error || 'Verifikasi gagal.';
			}
		} catch {
			status = 'error';
			message = 'Terjadi kesalahan jaringan.';
		}
	});
</script>

<div class="verify-page">
	<div class="verify-card">
		{#if status === 'loading'}
			<div class="spinner"></div>
			<p>Memverifikasi email...</p>
		{:else if status === 'success'}
			<div class="icon success">✅</div>
			<h2>Email Terverifikasi!</h2>
			<p>{message}</p>
			<p class="hint">Mengarahkan ke halaman login...</p>
		{:else}
			<div class="icon error">❌</div>
			<h2>Verifikasi Gagal</h2>
			<p>{message}</p>
			<a href="/login" class="btn">Ke Halaman Login</a>
		{/if}
	</div>
</div>

<style>
	.verify-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		padding: 24px;
	}
	.verify-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 48px 40px;
		max-width: 420px;
		width: 100%;
		text-align: center;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
	}
	.icon { font-size: 48px; margin-bottom: 16px; }
	h2 { margin: 0 0 8px; color: var(--text); }
	p { color: var(--text-secondary); margin: 0 0 16px; }
	.hint { font-size: 13px; opacity: 0.7; }
	.btn {
		display: inline-block;
		background: var(--primary);
		color: #fff;
		padding: 10px 24px;
		border-radius: 10px;
		text-decoration: none;
		font-weight: 600;
		margin-top: 8px;
	}
	.spinner {
		width: 40px; height: 40px;
		border: 3px solid var(--border);
		border-top-color: var(--primary);
		border-radius: 50%;
		margin: 0 auto 16px;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
