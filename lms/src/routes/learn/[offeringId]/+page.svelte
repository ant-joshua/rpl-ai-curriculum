<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();

	let offering = $derived(data.offering);
	let course = $derived(data.course);
</script>

<div class="belajar-page">
	<!-- Will show lesson progress or redirect to next lesson -->
	<div class="start-card">
		<div class="card-icon">📖</div>
		<h2>Mulai Belajar</h2>
		<p class="card-desc">Pilih pelajaran dari Silabus atau lanjutkan belajar</p>
		<div class="card-actions">
			<a href="/learn/{offering?.id}/syllabus" class="btn-primary">
				Lihat Silabus
			</a>
			<a href="/learn/{offering?.id}/lessons" class="btn-secondary">
				Lanjutkan Belajar
			</a>
		</div>
	</div>
</div>

<style>
	.belajar-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 16px;
	}

	.start-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 40px 32px;
		text-align: center;
		max-width: 420px;
		width: 100%;
	}

	.card-icon {
		font-size: 56px;
		line-height: 1;
		margin-bottom: 16px;
	}

	h2 {
		font-size: 22px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 8px;
	}

	.card-desc {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 24px;
		line-height: 1.5;
	}

	.card-actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.btn-primary, .btn-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 24px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
	}

	.btn-primary:hover {
		background: var(--accent-secondary);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
	}
</style>
