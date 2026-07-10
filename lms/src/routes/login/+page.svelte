<script lang="ts">
	import { user } from '$lib/stores/user.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { onMount } from 'svelte';

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
			return;
		}
		user.username = trimmed;
		progress.updateStreak();

		setTimeout(() => {
			window.location.href = '/dashboard';
		}, 50);
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
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 40px 36px;
		text-align: center;
		max-width: 400px;
		width: 100%;
	}

	.login-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.login-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 28px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.login-input {
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

	.login-input:focus {
		border-color: var(--accent);
	}

	.login-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.login-error {
		font-size: 13px;
		color: var(--danger);
		text-align: left;
	}

	.login-submit {
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

	.login-submit:hover {
		opacity: 0.9;
	}
</style>
