<script lang="ts">
	import { browser } from '$app/environment';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: import('./$types').PageData } = $props();

	let displayName = $state(data.displayName || '');
	let email = $state(data.email || '');
	let avatarUrl = $state(data.avatarUrl || '');
	let role = $state(data.role || 'student');
	let createdAt = $state(data.createdAt || '');
	let enrolledCoursesCount = $state(data.enrolledCoursesCount || 0);
	let lastLogin = $state(data.lastLogin || null);

	let editingName = $state(false);
	let editingAvatar = $state(false);
	let editNameValue = $state(displayName);
	let editAvatarValue = $state(avatarUrl);
	let saving = $state(false);
	let avatarError = $state(false);

	function formatDate(iso: string): string {
		try {
			const d = new Date(iso + 'Z');
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
		} catch { return iso; }
	}

	function timeAgo(iso: string): string {
		try {
			const d = new Date(iso + 'Z');
			const now = new Date();
			const diff = now.getTime() - d.getTime();
			if (diff < 60000) return 'baru saja';
			if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
			if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
		} catch { return iso; }
	}

	function initial(name: string): string {
		return (name || '?').charAt(0).toUpperCase();
	}

	function startEditName() {
		editNameValue = displayName;
		editingName = true;
	}

	function cancelEditName() {
		editingName = false;
	}

	async function saveName() {
		const trimmed = editNameValue.trim();
		if (!trimmed || trimmed === displayName) {
			editingName = false;
			return;
		}
		saving = true;
		try {
			const res = await api('/api/my/profile', {
				method: 'PUT',
				body: JSON.stringify({ displayName: trimmed }),
			});
			if (res.success) {
				displayName = res.data?.displayName || trimmed;
				editingName = false;
				addToast('Nama berhasil diperbarui', 'success');
			} else {
				addToast(res.error || 'Gagal memperbarui nama', 'error');
			}
		} catch {
			addToast('Network error', 'error');
		} finally {
			saving = false;
		}
	}

	function startEditAvatar() {
		editAvatarValue = avatarUrl;
		editingAvatar = true;
		avatarError = false;
	}

	function cancelEditAvatar() {
		editingAvatar = false;
		avatarError = false;
	}

	async function saveAvatar() {
		const trimmed = editAvatarValue.trim();
		if (trimmed === avatarUrl) {
			editingAvatar = false;
			return;
		}
		saving = true;
		try {
			const res = await api('/api/my/profile', {
				method: 'PUT',
				body: JSON.stringify({ avatarUrl: trimmed || '' }),
			});
			if (res.success) {
				avatarUrl = res.data?.avatarUrl || trimmed || '';
				editingAvatar = false;
				avatarError = false;
				addToast('Avatar berhasil diperbarui', 'success');
			} else {
				addToast(res.error || 'Gagal memperbarui avatar', 'error');
			}
		} catch {
			addToast('Network error', 'error');
		} finally {
			saving = false;
		}
	}

	function handleAvatarError() {
		avatarError = true;
	}

	function roleBadge(r: string): string {
		const map: Record<string, string> = {
			student: 'Siswa',
			admin: 'Admin',
			superadmin: 'Super Admin',
			instructor: 'Instruktur',
			ta: 'Asisten',
		};
		return map[r] || r;
	}
</script>

<svelte:head>
	<title>My Profile — RPL AI Curriculum</title>
</svelte:head>

<div class="profile-page">
	<!-- Header -->
	<header class="page-header">
		<a href="/my/dashboard" class="back-link">← Dashboard</a>
		<h1>My Profile</h1>
	</header>

	<!-- Profile Card -->
	<div class="profile-card">
		<div class="profile-main">
			<div class="avatar-section">
				{#if avatarUrl && !avatarError}
					<img
						src={avatarUrl}
						alt="Avatar"
						class="avatar-img"
						onerror={handleAvatarError}
					/>
				{:else}
					<div class="avatar-fallback">{initial(displayName)}</div>
				{/if}
				<button class="edit-avatar-btn" onclick={startEditAvatar} disabled={saving}>
					{avatarUrl ? '🖼️ Ganti' : '➕ Tambah Foto'}
				</button>
			</div>

			<div class="profile-info">
				{#if editingName}
					<div class="inline-edit">
						<input
							type="text"
							bind:value={editNameValue}
							class="edit-input"
							placeholder="Masukkan nama tampilan"
							onkeydown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEditName(); }}
							autofocus
						/>
						<div class="edit-actions">
							<button class="btn btn-primary" onclick={saveName} disabled={saving}>
								{saving ? 'Menyimpan...' : 'Simpan'}
							</button>
							<button class="btn btn-ghost" onclick={cancelEditName}>Batal</button>
						</div>
					</div>
				{:else}
					<div class="name-row">
						<h1 class="profile-name">{displayName || 'Pengguna'}</h1>
						<button class="icon-btn" onclick={startEditName} title="Edit nama">
							✏️
						</button>
					</div>
				{/if}

				<div class="info-row">
					<span class="info-label">Email</span>
					<span class="info-value">{email || '—'}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Role</span>
					<span class="info-value"><span class="role-badge">{roleBadge(role)}</span></span>
				</div>
			</div>
		</div>

		<!-- Avatar edit inline -->
		{#if editingAvatar}
			<div class="avatar-edit-section">
				<label class="avatar-label">URL Avatar</label>
				<div class="avatar-edit-row">
					<input
						type="text"
						bind:value={editAvatarValue}
						class="edit-input"
						placeholder="https://example.com/avatar.jpg"
						onkeydown={(e) => { if (e.key === 'Enter') saveAvatar(); if (e.key === 'Escape') cancelEditAvatar(); }}
					/>
					<div class="edit-actions">
						<button class="btn btn-primary" onclick={saveAvatar} disabled={saving}>
							{saving ? 'Menyimpan...' : 'Simpan'}
						</button>
						<button class="btn btn-ghost" onclick={cancelEditAvatar}>Batal</button>
					</div>
				</div>
				{#if editAvatarValue && !avatarError}
					<div class="avatar-preview">
						<img
							src={editAvatarValue}
							alt="Preview"
							class="preview-img"
							onerror={handleAvatarError}
						/>
						<span class="preview-label">Pratinjau</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Stats Banner -->
	<div class="stats-banner">
		<div class="stat-item">
			<span class="stat-icon">📅</span>
			<div class="stat-body">
				<span class="stat-label">Bergabung</span>
				<span class="stat-value">{createdAt ? formatDate(createdAt) : '—'}</span>
			</div>
		</div>
		<div class="stat-item">
			<span class="stat-icon">🔑</span>
			<div class="stat-body">
				<span class="stat-label">Terakhir Login</span>
				<span class="stat-value">{lastLogin ? timeAgo(lastLogin) : '—'}</span>
			</div>
		</div>
		<div class="stat-item">
			<span class="stat-icon">📚</span>
			<div class="stat-body">
				<span class="stat-label">Course Aktif</span>
				<span class="stat-value">{enrolledCoursesCount} course</span>
			</div>
		</div>
	</div>
</div>

<style>
	.profile-page {
		max-width: 680px;
		margin: 0 auto;
		padding: 24px 16px;
		animation: fadeIn 0.3s ease both;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 22px;
		font-weight: 700;
		margin: 0;
	}

	.back-link {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		text-decoration: none;
		padding: 4px 10px;
		border-radius: 6px;
		background: var(--accent-dim);
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.back-link:hover {
		background: var(--accent);
		color: #fff;
	}

	/* Profile Card */
	.profile-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		margin-bottom: 20px;
	}

	.profile-main {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.avatar-img,
	.avatar-fallback {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-fallback {
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36px;
		font-weight: 700;
	}

	.edit-avatar-btn {
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		border: none;
		padding: 5px 12px;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.edit-avatar-btn:hover:not(:disabled) {
		background: var(--accent);
		color: #fff;
	}

	.edit-avatar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.profile-info {
		flex: 1;
		min-width: 0;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}

	.profile-name {
		font-size: 24px;
		font-weight: 700;
		margin: 0;
	}

	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px;
		border-radius: 6px;
		transition: background 0.15s ease;
		line-height: 1;
	}

	.icon-btn:hover {
		background: var(--hover);
	}

	.info-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
	}

	.info-row:last-of-type {
		border-bottom: none;
	}

	.info-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		min-width: 60px;
	}

	.info-value {
		font-size: 14px;
		color: var(--text);
	}

	.role-badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		background: var(--accent-dim);
		color: var(--accent);
	}

	/* Inline Edit */
	.inline-edit {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 16px;
	}

	.edit-input {
		width: 100%;
		padding: 10px 14px;
		font-size: 16px;
		font-family: inherit;
		background: var(--bg);
		border: 1px solid var(--accent);
		border-radius: 10px;
		color: var(--text);
		outline: none;
		transition: all 0.15s ease;
		box-sizing: border-box;
	}

	.edit-input:focus {
		box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
	}

	.edit-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 8px 18px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		border: none;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-secondary);
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
	}

	.btn-ghost:hover {
		background: var(--hover);
		color: var(--text);
	}

	/* Avatar edit section */
	.avatar-edit-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid var(--border);
	}

	.avatar-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.avatar-edit-row {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.avatar-preview {
		margin-top: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.preview-img {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--accent);
	}

	.preview-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Stats Banner */
	.stats-banner {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.stat-item {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 18px 20px;
		display: flex;
		align-items: center;
		gap: 14px;
		transition: all 0.2s ease;
	}

	.stat-item:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
	}

	.stat-icon {
		font-size: 28px;
		line-height: 1;
	}

	.stat-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.stat-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.profile-main {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.name-row {
			justify-content: center;
		}

		.info-row {
			flex-direction: column;
			align-items: center;
			gap: 4px;
		}

		.stats-banner {
			grid-template-columns: 1fr;
		}

		.profile-card {
			padding: 20px;
		}
	}
</style>
