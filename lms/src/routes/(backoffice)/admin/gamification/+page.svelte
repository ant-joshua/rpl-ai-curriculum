<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, Alert, Badge, Spinner, Button, Input, Select, Modal, EmptyState } from '$lib/components/ui';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	// Auth
	const token = $derived(browser ? localStorage.getItem('token') || '' : '');
	function authHeaders() {
		return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
	}

	// State
	let loading = $state(true);
	let error = $state('');

	// Tab
	type AdminTab = 'leaderboard' | 'badges' | 'xp-rules' | 'levels' | 'settings';
	let activeTab = $state<AdminTab>('badges');

	// Badges
	let badges: any[] = $state([]);
	let badgeEditModal = $state<any>(null); // null = closed, object = open

	// XP Rules
	let xpRules: any[] = $state([]);
	let xpRuleEditModal = $state<any>(null);

	// Level settings
	let levelSettings = $state({ xpPerLevel: 100, maxLevel: 100 });

	// Leaderboard settings
	let lbSettings = $state({ topCount: 20, periodFilter: 'all', showGlobal: true });

	// Global leaderboard (existing)
	let globalLeaderboard: any[] = $state([]);

	onMount(() => {
		if (!browser) return;
		loadBadges();
		loadXpRules();
		loadSettings();
		loadGlobalLeaderboard();
	});

	// ============= BADGES =============
	async function loadBadges() {
		try {
			const res = await fetch('/api/admin/badges', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) badges = json.data || [];
		} catch { error = 'Gagal memuat badge'; }
	}

	function openNewBadge() {
		badgeEditModal = { id: '', name: '', description: '', icon: '🏆', criteria_type: 'lessons_completed', criteria_value: 1, xp_reward: 0 };
	}
	function openEditBadge(b: any) {
		badgeEditModal = { ...b };
	}
	async function saveBadge() {
		if (!badgeEditModal) return;
		const b = badgeEditModal;
		const isNew = !b.id || !badges.find((x: any) => x.id === b.id);
		try {
			if (isNew) {
				b.id = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
				await fetch('/api/admin/badges', {
					method: 'POST',
					headers: authHeaders(),
					body: JSON.stringify(b),
				});
			} else {
				await fetch(`/api/admin/badges/${b.id}`, {
					method: 'PUT',
					headers: authHeaders(),
					body: JSON.stringify(b),
				});
			}
			badgeEditModal = null;
			await loadBadges();
		} catch (e) { error = 'Gagal menyimpan badge'; }
	}
	async function deleteBadge(id: string) {
		if (!confirm('Hapus badge ini?')) return;
		try {
			await fetch(`/api/admin/badges/${id}`, { method: 'DELETE', headers: authHeaders() });
			await loadBadges();
		} catch { error = 'Gagal menghapus badge'; }
	}

	// ============= XP RULES =============
	async function loadXpRules() {
		try {
			const res = await fetch('/api/admin/gamification/xp-rules', { headers: authHeaders() });
			const json = await res.json();
			if (json.success) xpRules = json.data || [];
		} catch {}
	}

	function openNewXpRule() {
		xpRuleEditModal = { action_type: 'custom', xp_amount: 10, description: '', is_active: true };
	}
	function openEditXpRule(r: any) {
		xpRuleEditModal = { ...r, is_active: r.is_active === 1 || r.is_active === true };
	}
	async function saveXpRule() {
		if (!xpRuleEditModal) return;
		const r = xpRuleEditModal;
		const isNew = !r.id || !xpRules.find((x: any) => x.id === r.id);
		try {
			if (isNew) {
				await fetch('/api/admin/gamification/xp-rules', {
					method: 'POST',
					headers: authHeaders(),
					body: JSON.stringify(r),
				});
			} else {
				await fetch(`/api/admin/gamification/xp-rules/${r.id}`, {
					method: 'PUT',
					headers: authHeaders(),
					body: JSON.stringify(r),
				});
			}
			xpRuleEditModal = null;
			await loadXpRules();
		} catch { error = 'Gagal menyimpan aturan XP'; }
	}
	async function deleteXpRule(id: string) {
		if (!confirm('Hapus aturan XP ini?')) return;
		try {
			await fetch(`/api/admin/gamification/xp-rules/${id}`, { method: 'DELETE', headers: authHeaders() });
			await loadXpRules();
		} catch { error = 'Gagal menghapus aturan XP'; }
	}

	// ============= SETTINGS =============
	async function loadSettings() {
		try {
			const res = await fetch('/api/admin/gamification/settings?key=level_thresholds', { headers: authHeaders() });
			const json = await res.json();
			if (json.success && json.data) {
				const val = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
				levelSettings = { ...levelSettings, ...val };
			}
		} catch {}

		try {
			const res2 = await fetch('/api/admin/gamification/settings?key=leaderboard', { headers: authHeaders() });
			const json2 = await res2.json();
			if (json2.success && json2.data) {
				const val = typeof json2.data.value === 'string' ? JSON.parse(json2.data.value) : json2.data.value;
				lbSettings = { ...lbSettings, ...val };
			}
		} catch {}
	}

	async function saveLevelSettings() {
		try {
			await fetch('/api/admin/gamification/settings?key=level_thresholds', {
				method: 'PUT',
				headers: authHeaders(),
				body: JSON.stringify({ value: levelSettings }),
			});
		} catch { error = 'Gagal menyimpan pengaturan level'; }
	}

	async function saveLbSettings() {
		try {
			await fetch('/api/admin/gamification/settings?key=leaderboard', {
				method: 'PUT',
				headers: authHeaders(),
				body: JSON.stringify({ value: lbSettings }),
			});
		} catch { error = 'Gagal menyimpan pengaturan leaderboard'; }
	}

	// ============= LEADERBOARD =============
	async function loadGlobalLeaderboard() {
		loading = true;
		try {
			const res = await fetch('/api/gamification/leaderboard/global', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const json = await res.json();
			if (json.success) globalLeaderboard = json.data.leaderboard || [];
		} catch {}
		finally { loading = false; }
	}

	function rankBadge(rank: number) {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	function getLevelIcon(level: number) {
		if (level >= 20) return '💎';
		if (level >= 10) return '🏅';
		if (level >= 5) return '⭐';
		return '📌';
	}

	const XP_TYPE_LABELS: Record<string, string> = {
		lesson_complete: 'Menyelesaikan Pelajaran',
		daily_login: 'Login Harian',
		assignment_graded: 'Tugas Dinilai',
		assessment_completed: 'Assessment',
		discussion_post: 'Posting Diskusi',
		streak_milestone: 'Bonus Streak',
		custom: 'Kustom',
	};

	const CRITERIA_LABELS: Record<string, string> = {
		lessons_completed: 'Pelajaran Selesai',
		assessments_passed: 'Assessment Lulus',
		streak_days: 'Hari Streak',
		courses_completed: 'Kursus Selesai',
		discussion_posts: 'Posting Diskusi',
		custom: 'Kustom (XP)',
	};

	// Expose handlers for DataTable inline HTML buttons
	$effect(() => {
		(window as any).__editXpRule = (id: string) => {
			const r = xpRules.find((x: any) => x.id === id);
			if (r) openEditXpRule(r);
		};
		(window as any).__deleteXpRule = deleteXpRule;
		return () => {
			delete (window as any).__editXpRule;
			delete (window as any).__deleteXpRule;
		};
	});

	const xpRuleColumns: ColumnDef<any, any>[] = [
		{
			header: 'Aksi',
			accessorKey: 'action_type',
			cell: ({ getValue }) => {
				const t = getValue() as string;
				return `<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:500;background:rgba(113,112,255,0.12);color:#7170ff">${XP_TYPE_LABELS[t] || t}</span>`;
			}
		},
		{
			header: 'XP',
			accessorKey: 'xp_amount',
			cell: ({ getValue }) => `<span style="font-weight:700;color:var(--accent)">+${getValue()} XP</span>`
		},
		{
			header: 'Deskripsi',
			accessorKey: 'description',
			cell: ({ getValue }) => `<span style="color:var(--text-secondary);font-size:13px">${getValue()}</span>`
		},
		{
			header: 'Status',
			accessorKey: 'is_active',
			cell: ({ getValue }) => {
				const active = getValue() === 1 || getValue() === true;
				const bg = active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';
				const color = active ? '#22c55e' : '#ef4444';
				const label = active ? 'Aktif' : 'Nonaktif';
				return `<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color}">${label}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			enableSorting: false,
			cell: ({ getValue }) => `<button onclick="window.__editXpRule('${getValue()}')" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px 6px;opacity:0.6" title={t('common.edit')}>✏️</button><button onclick="window.__deleteXpRule('${getValue()}')" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px 6px;opacity:0.6" title="Hapus">🗑️</button>`
		}
	];

	const leaderboardColumns: ColumnDef<any, any>[] = [
		{
			header: 'Peringkat',
			accessorKey: 'rank',
			cell: ({ getValue, row }) => {
				const rank = getValue() as number;
				const i = row.index;
				let display = `#${rank}`;
				if (rank === 1) display = '🥇';
				else if (rank === 2) display = '🥈';
				else if (rank === 3) display = '🥉';
				const size = i < 3 ? 'font-size:20px' : 'font-size:16px;font-weight:700;color:var(--text-secondary)';
				return `<span style="${size}">${display}</span>`;
			}
		},
		{
			header: 'Pengguna',
			accessorKey: 'displayName',
			cell: ({ row }) => {
				const e = row.original;
				let html = '<div style="display:flex;align-items:center;gap:10px">';
				if (e.avatarUrl) {
					html += `<img src="${e.avatarUrl}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`;
				} else {
					const initial = (e.displayName || '?').charAt(0).toUpperCase();
					html += `<div style="width:32px;height:32px;border-radius:50%;background:var(--accent-dim);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${initial}</div>`;
				}
				html += `<span style="font-weight:600;color:var(--text)">${e.displayName || e.userId?.slice(0, 12)}</span>`;
				if (e.isCurrentUser) {
					html += `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(113,112,255,0.12);color:#7170ff">Anda</span>`;
				}
				html += '</div>';
				return html;
			}
		},
		{
			header: 'Total XP',
			accessorKey: 'totalXp',
			cell: ({ getValue }) => `<span style="font-weight:700;font-size:15px;color:var(--text)">${(getValue() as number).toLocaleString()}</span> <span style="font-size:11px;color:var(--text-secondary)">XP</span>`
		},
		{
			header: 'Level',
			accessorKey: 'level',
			cell: ({ getValue }) => {
				const lvl = getValue() as number;
				let icon = '📌';
				if (lvl >= 20) icon = '💎';
				else if (lvl >= 10) icon = '🏅';
				else if (lvl >= 5) icon = '⭐';
				return `<span style="font-size:13px;font-weight:600;color:var(--accent)">${icon} Lv.${lvl}</span>`;
			}
		},
		{
			header: 'Streak',
			accessorKey: 'currentStreak',
			cell: ({ getValue }) => {
				const s = getValue() as number;
				return s > 0 ? `🔥 ${s} hari` : '—';
			}
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="gamification-page">
	<div class="header-row">
		<h1>🏆 Gamification</h1>
		<div class="tabs">
			<button class="tab" class:tab--active={activeTab === 'badges'} onclick={() => activeTab = 'badges'}>
				🎖️ Badge
			</button>
			<button class="tab" class:tab--active={activeTab === 'xp-rules'} onclick={() => activeTab = 'xp-rules'}>
				⚡ Aturan XP
			</button>
			<button class="tab" class:tab--active={activeTab === 'levels'} onclick={() => activeTab = 'levels'}>
				📊 Level
			</button>
			<button class="tab" class:tab--active={activeTab === 'leaderboard'} onclick={() => activeTab = 'leaderboard'}>
				🏆 Papan Skor
			</button>
			<button class="tab" class:tab--active={activeTab === 'settings'} onclick={() => activeTab = 'settings'}>
				⚙️ Pengaturan
			</button>
		</div>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- ========== BADGES TAB ========== -->
	{#if activeTab === 'badges'}
		<div class="section-header">
			<h2>🎖️ Daftar Badge</h2>
			<Button variant="primary" onclick={openNewBadge}>+ Badge Baru</Button>
		</div>

		{#if badges.length === 0}
			<EmptyState title="Belum ada badge" description="Buat badge pertama untuk memotivasi siswa" />
		{:else}
			<div class="badge-grid">
				{#each badges as b}
					<Card>
						<CardContent>
							<div class="badge-card" onclick={() => openEditBadge(b)}>
								<div class="badge-icon-large">{b.icon}</div>
								<div class="badge-info">
									<div class="badge-name">{b.name}</div>
									<div class="badge-desc">{b.description}</div>
									<div class="badge-meta">
										<Badge variant="accent">{CRITERIA_LABELS[b.criteria_type] || b.criteria_type}</Badge>
										<span class="badge-criteria-val">≥ {b.criteria_value}</span>
										{#if b.xp_reward > 0}
											<Badge variant="success">+{b.xp_reward} XP</Badge>
										{/if}
									</div>
								</div>
								<button class="delete-btn" onclick={(e) => { e.stopPropagation(); deleteBadge(b.id); }} title={t('common.delete')}>🗑️</button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}

		<!-- Badge Edit Modal -->
		{#if badgeEditModal}
			<div class="modal-overlay" onclick={() => badgeEditModal = null} role="button" tabindex="-1">
				<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog">
					<h3>{badgeEditModal.id && badges.find((x: any) => x.id === badgeEditModal.id) ? 'Edit Badge' : 'Badge Baru'}</h3>
					<div class="form-group">
						<label>{t('common.name')}</label>
						<Input bind:value={badgeEditModal.name} placeholder="Nama badge" />
					</div>
					<div class="form-group">
						<label>{t('common.description')}</label>
						<Input bind:value={badgeEditModal.description} placeholder="Deskripsi badge" />
					</div>
					<div class="form-group">
						<label>Icon (emoji)</label>
						<Input bind:value={badgeEditModal.icon} placeholder="🏆" />
					</div>
					<div class="form-row">
						<div class="form-group">
							<label>Kriteria</label>
							<select class="input" bind:value={badgeEditModal.criteria_type}>
								{#each Object.entries(CRITERIA_LABELS) as [k, v]}
									<option value={k}>{v}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label>Nilai Minimal</label>
							<Input type="number" value={String(badgeEditModal.criteria_value)} oninput={(e) => badgeEditModal.criteria_value = parseInt((e.target as HTMLInputElement).value) || 1} min="1" />
						</div>
					</div>
					<div class="form-group">
						<label>XP Reward (saat badge diklaim)</label>
						<Input type="number" value={String(badgeEditModal.xp_reward)} oninput={(e) => badgeEditModal.xp_reward = parseInt((e.target as HTMLInputElement).value) || 0} min="0" />
					</div>
					<div class="modal-actions">
						<Button variant="ghost" onclick={() => badgeEditModal = null}>{t('common.cancel')}</Button>
						<Button variant="primary" onclick={saveBadge}>{t('common.save')}</Button>
					</div>
				</div>
			</div>
		{/if}

	{:else if activeTab === 'xp-rules'}
		<!-- ========== XP RULES TAB ========== -->
		<div class="section-header">
			<h2>⚡ Aturan XP</h2>
			<Button variant="primary" onclick={openNewXpRule}>+ Aturan Baru</Button>
		</div>

		{#if xpRules.length === 0}
			<EmptyState title="Belum ada aturan XP" description="Aturan default akan digunakan jika tidak dikonfigurasi" />
		{:else}
			<Card>
				<CardContent>
					<DataTable columns={xpRuleColumns} data={xpRules} pageSize={100} showSearch={false} showPagination={false} />
				</CardContent>
			</Card>
		{/if}

		<!-- XP Rule Edit Modal -->
		{#if xpRuleEditModal}
			<div class="modal-overlay" onclick={() => xpRuleEditModal = null} role="button" tabindex="-1">
				<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog">
					<h3>{xpRuleEditModal.id && xpRules.find((x: any) => x.id === xpRuleEditModal.id) ? 'Edit Aturan XP' : 'Aturan XP Baru'}</h3>
					<div class="form-group">
						<label>Tipe Aksi</label>
						<select class="input" bind:value={xpRuleEditModal.action_type}>
							{#each Object.entries(XP_TYPE_LABELS) as [k, v]}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label>Jumlah XP</label>
						<Input type="number" value={String(xpRuleEditModal.xp_amount)} oninput={(e) => xpRuleEditModal.xp_amount = parseInt((e.target as HTMLInputElement).value) || 1} min="1" />
					</div>
					<div class="form-group">
						<label>{t('common.description')}</label>
						<Input bind:value={xpRuleEditModal.description} placeholder={t('common.description')} />
					</div>
					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={xpRuleEditModal.is_active} />
							Aktif
						</label>
					</div>
					<div class="modal-actions">
						<Button variant="ghost" onclick={() => xpRuleEditModal = null}>{t('common.cancel')}</Button>
						<Button variant="primary" onclick={saveXpRule}>{t('common.save')}</Button>
					</div>
				</div>
			</div>
		{/if}

	{:else if activeTab === 'levels'}
		<!-- ========== LEVELS TAB ========== -->
		<div class="section-header">
			<h2>📊 Pengaturan Level</h2>
		</div>
		<Card>
			<CardContent>
				<div class="settings-form">
					<div class="form-group">
						<label>XP per Level</label>
						<p class="form-hint">Jumlah XP yang dibutuhkan untuk naik satu level</p>
						<Input type="number" value={String(levelSettings.xpPerLevel)} oninput={(e) => levelSettings = { ...levelSettings, xpPerLevel: parseInt((e.target as HTMLInputElement).value) || 100 }} min="10" max="10000" />
					</div>
					<div class="form-group">
						<label>Level Maksimal</label>
						<p class="form-hint">Level tertinggi yang dapat dicapai</p>
						<Input type="number" value={String(levelSettings.maxLevel)} oninput={(e) => levelSettings = { ...levelSettings, maxLevel: parseInt((e.target as HTMLInputElement).value) || 100 }} min="1" max="999" />
					</div>
					<Button variant="primary" onclick={saveLevelSettings}>Simpan Pengaturan Level</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Level Preview -->
		<div class="level-preview">
			<h3>Pratinjau Level</h3>
			<div class="level-list">
				{#each Array(Math.min(15, levelSettings.maxLevel || 100)) as _, i}
					{@const lvl = i + 1}
					{@const xpNeeded = lvl * (levelSettings.xpPerLevel || 100)}
					<div class="level-row">
						<span class="level-num">{getLevelIcon(lvl)} Level {lvl}</span>
						<div class="level-bar-track">
							<div class="level-bar-fill" style="width: {Math.min(100, (lvl / (levelSettings.maxLevel || 100)) * 100)}%"></div>
						</div>
						<span class="level-xp">{xpNeeded.toLocaleString()} XP</span>
					</div>
				{/each}
			</div>
		</div>

	{:else if activeTab === 'leaderboard'}
		<!-- ========== GLOBAL LEADERBOARD TAB ========== -->
		<div class="section-header">
			<h2>🏆 Papan Skor Global</h2>
		</div>

		{#if loading}
			<div class="loading"><Spinner /> Memuat leaderboard...</div>
		{:else if globalLeaderboard.length === 0}
			<EmptyState title={t('common.no_data')} description="Ajak siswa untuk mulai belajar dan dapatkan XP!" />
		{:else}
			<Card>
				<CardContent>
					<DataTable columns={leaderboardColumns} data={globalLeaderboard} pageSize={100} showSearch={false} showPagination={false} />
				</CardContent>
			</Card>
		{/if}

	{:else if activeTab === 'settings'}
		<!-- ========== SETTINGS TAB ========== -->
		<div class="section-header">
			<h2>⚙️ Pengaturan Leaderboard</h2>
		</div>
		<Card>
			<CardContent>
				<div class="settings-form">
					<div class="form-group">
						<label>Jumlah Peserta di Papan Skor</label>
						<p class="form-hint">Berapa banyak siswa yang ditampilkan di leaderboard</p>
						<Input type="number" value={String(lbSettings.topCount)} oninput={(e) => lbSettings = { ...lbSettings, topCount: parseInt((e.target as HTMLInputElement).value) || 20 }} min="5" max="100" />
					</div>
					<div class="form-group">
						<label>Filter Periode Default</label>
						<select class="input" bind:value={lbSettings.periodFilter}>
							<option value="all">Semua Waktu</option>
							<option value="daily">Harian</option>
							<option value="weekly">Mingguan</option>
						</select>
					</div>
					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={lbSettings.showGlobal} />
							Tampilkan Leaderboard Global
						</label>
					</div>
					<Button variant="primary" onclick={saveLbSettings}>Simpan Pengaturan</Button>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	.gamification-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; margin-bottom: 0; }
	.header-row { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		overflow-x: auto;
	}
	.tab {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}
	.section-header h2 { font-size: 18px; font-weight: 600; margin: 0; }

	/* Badge Grid */
	.badge-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 12px;
	}
	.badge-card {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		cursor: pointer;
		position: relative;
	}
	.badge-icon-large { font-size: 36px; line-height: 1; flex-shrink: 0; }
	.badge-info { flex: 1; min-width: 0; }
	.badge-name { font-weight: 600; font-size: 15px; color: var(--text); margin-bottom: 2px; }
	.badge-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
	.badge-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
	.badge-criteria-val { font-size: 11px; color: var(--text-secondary); }
	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		opacity: 0.5;
		padding: 4px;
	}
	.delete-btn:hover { opacity: 1; }

	/* XP Rules Table */
	.rules-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.rules-table th {
		text-align: left;
		padding: 10px 12px;
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
	}
	.rules-table td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
	}
	.xp-amount { font-weight: 700; color: var(--accent); }
	.desc-cell { color: var(--text-secondary); font-size: 13px; }
	.action-cell { white-space: nowrap; }
	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px 6px;
		opacity: 0.6;
	}
	.icon-btn:hover { opacity: 1; }

	/* Settings Form */
	.settings-form {
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.form-group { display: flex; flex-direction: column; gap: 4px; }
	.form-group label { font-weight: 600; font-size: 13px; color: var(--text); }
	.form-hint { font-size: 11px; color: var(--text-secondary); margin: 0; }
	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}
	.form-row { display: flex; gap: 12px; }
	.form-row .form-group { flex: 1; }
	.input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
	}
	input[type="checkbox"] { width: 16px; height: 16px; }

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal-content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		max-width: 480px;
		width: 90%;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.modal-content h3 { margin: 0; font-size: 18px; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

	/* Level Preview */
	.level-preview { margin-top: 24px; }
	.level-preview h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
	.level-list { display: flex; flex-direction: column; gap: 6px; }
	.level-row {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}
	.level-num { width: 110px; flex-shrink: 0; }
	.level-bar-track {
		flex: 1;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		overflow: hidden;
	}
	.level-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-light));
		border-radius: 3px;
		transition: width 0.3s;
	}
	.level-xp { width: 80px; text-align: right; color: var(--text-secondary); font-size: 12px; }

	/* Leaderboard Table */
	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.leaderboard-table th {
		text-align: left;
		padding: 10px 12px;
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
	}
	.leaderboard-table td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
	}
	.leaderboard-row:hover { background: var(--hover); }
	.leaderboard-row.highlight {
		background: var(--accent-dim);
		position: relative;
	}
	.col-rank { width: 60px; }
	.rank-badge { font-size: 16px; font-weight: 700; color: var(--text-secondary); }
	.rank-badge.top3 { font-size: 20px; }
	.col-user { min-width: 180px; }
	.user-info { display: flex; align-items: center; gap: 10px; }
	.avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
	.avatar-placeholder {
		width: 32px; height: 32px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-weight: 700; font-size: 14px;
	}
	.display-name { font-weight: 600; color: var(--text); }
	.col-xp { min-width: 100px; }
	.xp-value { font-weight: 700; font-size: 15px; color: var(--text); }
	.xp-label { font-size: 11px; color: var(--text-secondary); margin-left: 2px; }
	.col-level { width: 100px; }
	.level-badge { font-size: 13px; font-weight: 600; color: var(--accent); }
	.col-streak { width: 120px; }
	.streak-value { font-size: 13px; font-weight: 500; }
	.streak-value.dim { color: var(--text-secondary); }

	@media (max-width: 768px) {
		.col-level, .col-streak { display: none; }
		.col-user { min-width: 120px; }
	}
</style>
