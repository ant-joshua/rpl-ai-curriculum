<script lang="ts">
	import { Button, Card, Input } from '$lib/components/ui/index.js';
	import { addToast } from '$lib/stores/toast.svelte';

	let pin = $state('');
	let joining = $state(false);

	async function join() {
		if (!/^\d{6}$/.test(pin.trim())) {
			addToast('Masukkan PIN 6 digit', 'error');
			return;
		}
		joining = true;
		try {
			const res = await fetch('/api/my/live-quiz/join', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pin: pin.trim() }),
			});
			const json = await res.json();
			if (json.success && json.quiz) {
				window.location.href = `/live-quiz/${json.quiz.id}`;
			} else {
				addToast(json.error || 'Gagal join', 'error');
			}
		} catch {
			addToast('Gagal join', 'error');
		} finally {
			joining = false;
		}
	}
</script>

<svelte:head><title>Join Live Quiz</title></svelte:head>

<div class="join-page">
	<Card>
		<div class="join-box">
			<div class="logo">⚡</div>
			<h1>Live Quiz</h1>
			<p class="sub">Masukkan PIN dari guru untuk bergabung ke kuis kelas.</p>
			<input
				type="text"
				inputmode="numeric"
				maxlength="6"
				placeholder="PIN 6 digit"
				class="pin-input"
				bind:value={pin}
				onkeydown={(e) => e.key === 'Enter' && join()}
			/>
			<Button onclick={join} disabled={joining} class="join-btn">
				{joining ? 'Menghubungkan…' : 'Gabung'}
			</Button>
			<a href="/" class="back">← Kembali ke Beranda</a>
		</div>
	</Card>
</div>

<style>
	.join-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
	.join-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 28px; text-align: center; max-width: 380px; }
	.logo { font-size: 44px; }
	h1 { margin: 0; font-size: 24px; }
	.sub { margin: 0; color: var(--text-secondary); font-size: 14px; }
	.pin-input { font-size: 32px; letter-spacing: 8px; text-align: center; padding: 14px 16px; border: 2px solid var(--border); border-radius: 12px; width: 100%; font-variant-numeric: tabular-nums; }
	.pin-input:focus { border-color: #4f46e5; outline: none; }
	.join-btn { width: 100%; margin-top: 4px; }
	.back { margin-top: 8px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
	.back:hover { color: var(--text-primary); }
</style>
