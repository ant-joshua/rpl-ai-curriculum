<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { addToast } from '$lib/stores/toast.svelte';

	type CalEvent = {
		id: string;
		title: string;
		event_type: string;
		start_date: string;
		end_date: string | null;
		description: string | null;
		color: string;
		all_day: number;
	};

	const TYPE_OPTIONS = [
		{ value: 'semester', label: '📚 Semester' },
		{ value: 'holiday', label: '🏖️ Libur' },
		{ value: 'exam', label: '📝 Ujian' },
		{ value: 'event', label: '🎉 Acara' },
		{ value: 'deadline', label: '⏰ Tenggat' },
	];

	const TYPE_COLORS: Record<string, string> = {
		semester: '#4F46E5',
		holiday: '#10B981',
		exam: '#F59E0B',
		event: '#EC4899',
		deadline: '#EF4444',
	};

	let events = $state<CalEvent[]>([]);
	let loading = $state(true);
	let error = $state('');

	let showForm = $state(false);
	let formTitle = $state('');
	let formType = $state('event');
	let formStart = $state('');
	let formEnd = $state('');
	let formDesc = $state('');
	let formColor = $state('#4F46E5');
	let saving = $state(false);

	async function loadEvents() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/academic-calendar');
			const json = await res.json();
			if (json.success) {
				events = json.data || [];
			} else {
				error = json.error || 'Gagal memuat';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (browser) loadEvents();
	});

	function resetForm() {
		formTitle = '';
		formType = 'event';
		formStart = '';
		formEnd = '';
		formDesc = '';
		formColor = TYPE_COLORS['event'];
		showForm = false;
	}

	async function saveEvent() {
		if (!formTitle.trim() || !formStart) {
			error = 'Judul dan tanggal mulai wajib diisi';
			return;
		}
		saving = true;
		error = '';
		try {
			const res = await fetch('/api/admin/academic-calendar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formTitle.trim(),
					event_type: formType,
					start_date: formStart,
					end_date: formEnd || null,
					description: formDesc.trim() || null,
					color: formColor || TYPE_COLORS[formType],
					all_day: true,
				}),
			});
			const json = await res.json();
			if (json.success) {
				addToast('Event kalender ditambahkan');
				resetForm();
				loadEvents();
			} else {
				error = json.error || 'Gagal menyimpan';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			saving = false;
		}
	}

	async function deleteEvent(id: string) {
		if (!confirm('Hapus event ini?')) return;
		try {
			await fetch(`/api/admin/academic-calendar/${id}`, { method: 'DELETE' });
			events = events.filter((e) => e.id !== id);
			addToast('Event dihapus');
		} catch {
			error = 'Gagal menghapus';
		}
	}

	// Group by month
	const grouped = $derived.by(() => {
		const map = new Map<string, CalEvent[]>();
		const sorted = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));
		for (const ev of sorted) {
			const monthKey = ev.start_date.slice(0, 7); // YYYY-MM
			if (!map.has(monthKey)) map.set(monthKey, []);
			map.get(monthKey)!.push(ev);
		}
		return Array.from(map.entries());
	});

	function formatDate(d: string): string {
		return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function monthLabel(key: string): string {
		return new Date(key + '-01T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Academic Calendar — Admin</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>📅 Academic Calendar</h1>
			<p class="subtitle">Kelola libur, ujian, periode semester, dan acara sekolah</p>
		</div>
		<button class="btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? '✕ Tutup' : '＋ Tambah Event'}
		</button>
	</div>

	{#if error}
		<div class="error-state">{error}</div>
	{/if}

	{#if showForm}
		<div class="form-card">
			<h3>Tambah Event</h3>
			<div class="form-grid">
				<div class="form-field">
					<label>Judul *</label>
					<input type="text" placeholder="e.g. UTS Semester Ganjil" bind:value={formTitle} />
				</div>
				<div class="form-field">
					<label>Tipe</label>
					<select bind:value={formType} onchange={() => (formColor = TYPE_COLORS[formType])}>
						{#each TYPE_OPTIONS as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-field">
					<label>Tanggal Mulai *</label>
					<input type="date" bind:value={formStart} />
				</div>
				<div class="form-field">
					<label>Tanggal Selesai (opsional)</label>
					<input type="date" bind:value={formEnd} />
				</div>
				<div class="form-field">
					<label>Warna (opsional)</label>
					<input type="color" bind:value={formColor} style="height:40px;padding:4px;" />
				</div>
			</div>
			<div class="form-field">
				<label>Keterangan (opsional)</label>
				<textarea rows="2" placeholder="Detail event..." bind:value={formDesc}></textarea>
			</div>
			<div class="form-actions">
				<button class="btn-primary" onclick={saveEvent} disabled={saving}>
					{saving ? 'Menyimpan...' : '💾 Simpan Event'}
				</button>
				<button class="btn-secondary" onclick={resetForm}>Batal</button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if events.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🗓️</div>
			<p>Belum ada event. Tambahkan periode semester, libur, atau ujian.</p>
		</div>
	{:else}
		{#each grouped as [monthKey, monthEvents]}
			<div class="month-group">
				<h3 class="month-title">{monthLabel(monthKey)}</h3>
				<div class="event-list">
					{#each monthEvents as ev}
						<div class="event-row" style={`border-left-color: ${ev.color || '#4F46E5'}`}>
							<div class="event-date">
								<span class="event-day">{new Date(ev.start_date + 'T00:00:00').getDate()}</span>
								<span class="event-date-label">{new Date(ev.start_date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}</span>
							</div>
							<div class="event-info">
								<div class="event-title-row">
									<span class="event-title">{ev.title}</span>
									<span class="event-type-badge" style={`background: ${ev.color || '#4F46E5'}18; color: ${ev.color || '#4F46E5'};`}>
										{TYPE_OPTIONS.find((o) => o.value === ev.event_type)?.label || ev.event_type}
									</span>
								</div>
								{#if ev.description}
									<p class="event-desc">{ev.description}</p>
								{/if}
								{#if ev.end_date && ev.end_date !== ev.start_date}
									<span class="event-range">s/d {formatDate(ev.end_date)}</span>
								{/if}
							</div>
							<button class="btn-del" onclick={() => deleteEvent(ev.id)} title="Hapus">🗑️</button>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.page { max-width: 780px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 4px 0 0; }
	.btn-primary {
		padding: 9px 16px; border-radius: 8px; border: none;
		background: var(--accent, #4F46E5); color: #fff; font-weight: 600;
		cursor: pointer; font-family: inherit; font-size: 14px;
	}
	.btn-secondary {
		padding: 9px 16px; border-radius: 8px; border: 1px solid var(--border);
		background: var(--surface); color: var(--text); font-weight: 600;
		cursor: pointer; font-family: inherit; font-size: 14px;
	}
	.error-state { padding: 24px; border-radius: 10px; background: #fee2e2; color: #b91c1c; margin-bottom: 16px; }
	.loading { padding: 40px; text-align: center; color: var(--text-secondary); }

	.form-card {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; padding: 20px; margin-bottom: 24px;
	}
	.form-card h3 { margin: 0 0 14px; font-size: 16px; }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
	@media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
	.form-field { display: flex; flex-direction: column; gap: 5px; }
	.form-field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.form-field input, .form-field select, .form-field textarea {
		padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 14px; font-family: inherit;
	}
	.form-actions { display: flex; gap: 8px; margin-top: 16px; }

	.month-group { margin-bottom: 24px; }
	.month-title { font-size: 16px; font-weight: 700; margin: 0 0 10px; }
	.event-list { display: flex; flex-direction: column; gap: 8px; }
	.event-row {
		display: flex; align-items: center; gap: 14px;
		background: var(--surface); border: 1px solid var(--border);
		border-left: 4px solid #4F46E5; border-radius: 10px; padding: 12px 14px;
	}
	.event-date { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
	.event-day { font-size: 22px; font-weight: 700; line-height: 1.1; }
	.event-date-label { font-size: 11px; text-transform: uppercase; color: var(--text-secondary); }
	.event-info { flex: 1; min-width: 0; }
	.event-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.event-title { font-weight: 600; font-size: 14px; }
	.type-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
	.event-desc { margin: 3px 0 0; font-size: 13px; color: var(--text-secondary); }
	.event-range { font-size: 12px; color: var(--text-tertiary); }
	.btn-del {
		border: none; background: transparent; cursor: pointer;
		font-size: 16px; padding: 6px; border-radius: 6px; opacity: 0.6;
	}
	.btn-del:hover { opacity: 1; background: rgba(239,68,68,0.1); }
	.empty-state { text-align: center; padding: 48px 20px; color: var(--text-secondary); }
	.empty-icon { font-size: 44px; margin-bottom: 10px; }
</style>