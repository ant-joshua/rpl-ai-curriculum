<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import { browser } from '$app/environment';

	let visible = $state(false);
	let step = $state(0);
	const totalSteps = 4;

	const steps = [
		{
			icon: '🎓',
			title: 'Selamat Datang di RPL AI Curriculum!',
			desc: 'Platform belajar interaktif untuk Rekayasa Perangkat Lunak. Belajar dengan AI Tutor, flashcards, dan learning paths yang terstruktur.',
		},
		{
			icon: '📚',
			title: 'Pilih Learning Path',
			desc: 'Pilih path belajar yang sesuai dengan minatmu — dari web development, mobile, AI, sampai devops. Setiap path punya modul dan session step-by-step.',
		},
		{
			icon: '🧰',
			title: 'Gunakan Tools',
			desc: 'Manfaatkan flashcards untuk review cepat, AI Tutor untuk tanya jawab, dan study planner untuk atur jadwal belajarmu.',
		},
		{
			icon: '📊',
			title: 'Track Progress',
			desc: 'Pantau perkembanganmu lewat dashboard, kumpulkan badges, dan bersaing di leaderboard dengan teman-temanmu!',
		},
	];

	$effect(() => {
		if (!browser) return;
		if (onboarding.isComplete()) return;
		// Show if user is new (no progress)
		const completionKey = 'lms-completion-dates';
		const raw = localStorage.getItem(completionKey);
		let hasNoProgress = true;
		try {
			if (raw) {
				const dates: string[] = JSON.parse(raw);
				hasNoProgress = dates.length === 0;
			}
		} catch { /* no progress */ }
		if (hasNoProgress) {
			visible = true;
		}
	});

	function next() {
		if (step < totalSteps - 1) {
			step++;
		} else {
			finish();
		}
	}

	function finish() {
		onboarding.complete();
		visible = false;
	}

	function skip() {
		onboarding.complete();
		visible = false;
	}
</script>

{#if visible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="onboarding-overlay" transition:fade={{ duration: 200 }}>
		<div
			class="onboarding-modal"
			transition:fly={{ y: 30, duration: 300 }}
		>
			<div class="onboarding-step">
				<div class="step-icon">{steps[step].icon}</div>
				<h2>{steps[step].title}</h2>
				<p>{steps[step].desc}</p>
			</div>

			<div class="onboarding-dots">
				{#each Array(totalSteps) as _, i}
					<button
						class="dot"
						class:active={i === step}
						class:done={i < step}
						onclick={() => { if (i <= step) step = i; }}
						aria-label="Step {i + 1}"
					></button>
				{/each}
			</div>

			<div class="onboarding-actions">
				<button class="skip-btn" onclick={skip}>Lewati</button>
				<button class="next-btn" onclick={next}>
					{step === totalSteps - 1 ? '🚀 Mulai Belajar!' : 'Lanjut →'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.onboarding-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		backdrop-filter: blur(6px);
	}

	.onboarding-modal {
		background: var(--surface, #1e1e2e);
		border: 1px solid var(--border, #333);
		border-radius: 20px;
		padding: 36px;
		width: 90%;
		max-width: 420px;
		text-align: center;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.onboarding-step {
		margin-bottom: 24px;
	}

	.step-icon {
		font-size: 64px;
		margin-bottom: 16px;
		line-height: 1;
	}

	.onboarding-step h2 {
		font-size: 20px;
		font-weight: 700;
		color: var(--text, #e0e0e0);
		margin-bottom: 12px;
	}

	.onboarding-step p {
		font-size: 14px;
		color: var(--text-secondary, #888);
		line-height: 1.6;
		margin: 0;
		max-width: 340px;
		margin-left: auto;
		margin-right: auto;
	}

	.onboarding-dots {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid var(--border, #444);
		background: transparent;
		cursor: pointer;
		padding: 0;
		transition: all 0.2s ease;
	}

	.dot.active {
		background: var(--accent, #6c5ce7);
		border-color: var(--accent, #6c5ce7);
		transform: scale(1.3);
	}

	.dot.done {
		background: var(--accent-dim, rgba(108, 92, 231, 0.3));
		border-color: var(--accent, #6c5ce7);
	}

	.onboarding-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		align-items: center;
	}

	.skip-btn {
		padding: 10px 20px;
		border-radius: 10px;
		border: 1px solid var(--border, #333);
		background: transparent;
		color: var(--text-secondary, #888);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.skip-btn:hover {
		color: var(--text, #e0e0e0);
		border-color: var(--text-secondary, #888);
	}

	.next-btn {
		padding: 10px 24px;
		border-radius: 10px;
		border: none;
		background: var(--accent, #6c5ce7);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.next-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}
</style>
