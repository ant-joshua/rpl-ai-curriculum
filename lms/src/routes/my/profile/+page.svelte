<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Button, Card, Avatar, StatCard } from '$lib/components/ui';
	import QRCode from 'qrcode';

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

	// 2FA state
	let totpVerified = $state((data as any).totpVerified || false);
	let hasPassword = $state((data as any).hasPassword || false);
	let settingUp2FA = $state(false);
	let totpSecret = $state('');
	let totpAuthUrl = $state('');
	let verifyCode = $state('');
	let verifying2FA = $state(false);
	let disabling2FA = $state(false);
	let disablePassword = $state('');
	let qrCanvas = $state<HTMLCanvasElement | null>(null);
	let setupError = $state('');
	let setupStep = $state<'idle' | 'show_qr' | 'verified'>('idle');
	let recoveryCodes = $state<string[]>([]);
	let showingRecoveryCodes = $state(false);
	let regeneratingCodes = $state(false);

	$effect(() => {
		if (qrCanvas && totpAuthUrl && setupStep === 'show_qr') {
			QRCode.toCanvas(qrCanvas, totpAuthUrl, { width: 200, margin: 2 }, (err: Error | null) => {
				if (err) {
					console.error('QR Code render error:', err);
				}
			});
		}
	});

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

	// 2FA functions
	async function startSetup() {
		setupError = '';
		settingUp2FA = true;
		try {
			const res = await api('/api/auth/2fa/setup');
			if (res.success) {
				totpSecret = (res as any).secret;
				totpAuthUrl = (res as any).otpauth_url;
				recoveryCodes = (res as any).recovery_codes || [];
				showingRecoveryCodes = true;
				setupStep = 'show_qr';
			} else {
				setupError = res.error || 'Gagal memulai setup 2FA';
				addToast(setupError, 'error');
			}
		} catch {
			setupError = 'Network error';
			addToast('Network error', 'error');
		} finally {
			settingUp2FA = false;
		}
	}

	async function verifySetup() {
		const trimmed = verifyCode.trim();
		if (!trimmed || trimmed.length !== 6) {
			addToast('Masukkan kode 6 digit', 'warning');
			return;
		}
		verifying2FA = true;
		setupError = '';
		try {
			const res = await api('/api/auth/2fa/verify', {
				method: 'POST',
				body: JSON.stringify({ code: trimmed }),
			});
			if (res.success) {
				totpVerified = true;
				setupStep = 'verified';
				settingUp2FA = false;
				showingRecoveryCodes = true; // keep showing codes until dismissed
				addToast('2FA berhasil diaktifkan!', 'success');
			} else {
				setupError = res.error || 'Kode verifikasi salah';
				addToast(setupError, 'error');
			}
		} catch {
			setupError = 'Network error';
			addToast('Network error', 'error');
		} finally {
			verifying2FA = false;
		}
	}

	async function disable2FA() {
		const trimmed = disablePassword.trim();
		if (!trimmed) {
			addToast('Masukkan password untuk menonaktifkan 2FA', 'warning');
			return;
		}
		disabling2FA = true;
		setupError = '';
		try {
			const res = await api('/api/auth/2fa/disable', {
				method: 'POST',
				body: JSON.stringify({ password: trimmed }),
			});
			if (res.success) {
				totpVerified = false;
				setupStep = 'idle';
				settingUp2FA = false;
				totpSecret = '';
				totpAuthUrl = '';
				verifyCode = '';
				disablePassword = '';
				recoveryCodes = [];
				showingRecoveryCodes = false;
				addToast('2FA berhasil dinonaktifkan', 'success');
			} else {
				setupError = res.error || 'Gagal menonaktifkan 2FA';
				addToast(setupError, 'error');
			}
		} catch {
			setupError = 'Network error';
			addToast('Network error', 'error');
		} finally {
			disabling2FA = false;
		}
	}

	function cancelSetup() {
		settingUp2FA = false;
		setupStep = 'idle';
		totpSecret = '';
		totpAuthUrl = '';
		verifyCode = '';
		setupError = '';
		recoveryCodes = [];
		showingRecoveryCodes = false;
	}

	function dismissRecoveryCodes() {
		showingRecoveryCodes = false;
		recoveryCodes = [];
	}

	async function regenerateRecoveryCodes() {
		regeneratingCodes = true;
		try {
			const res = await api('/api/auth/2fa/recovery-codes', { method: 'POST' });
			if (res.success) {
				recoveryCodes = (res as any).recovery_codes || [];
				showingRecoveryCodes = true;
				addToast('Kode pemulihan baru telah dibuat!', 'success');
			} else {
				addToast(res.error || 'Gagal membuat kode pemulihan', 'error');
			}
		} catch {
			addToast('Network error', 'error');
		} finally {
			regeneratingCodes = false;
		}
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
	<Card padding="lg">
		<div class="profile-main">
			<div class="avatar-section">
				<Avatar
					src={avatarUrl && !avatarError ? avatarUrl : undefined}
					initials={initial(displayName)}
					alt={displayName}
					size="xl"
				/>
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
							placeholder="Masukkan nama tampilan"
							class="edit-input"
						/>
						<div class="edit-actions">
							<Button onclick={saveName} disabled={saving}>
								{saving ? 'Menyimpan...' : 'Simpan'}
							</Button>
							<Button variant="ghost" onclick={cancelEditName}>Batal</Button>
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
						placeholder="https://example.com/avatar.jpg"
						class="edit-input"
					/>
					<div class="edit-actions">
						<Button onclick={saveAvatar} disabled={saving}>
							{saving ? 'Menyimpan...' : 'Simpan'}
						</Button>
						<Button variant="ghost" onclick={cancelEditAvatar}>Batal</Button>
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
	</Card>

	<!-- Stats Banner -->
	<div class="stats-banner">
 		<StatCard icon="📅" value={createdAt ? formatDate(createdAt) : '—'} label="Bergabung" />
 		<StatCard icon="🔑" value={lastLogin ? timeAgo(lastLogin) : '—'} label="Terakhir Login" />
 		<StatCard icon="📚" value="{enrolledCoursesCount} course" label="Course Aktif" />
	</div>

	<!-- 2FA Section -->
	<div class="fa-section">
		<Card padding="lg">
			<h2 class="fa-section-title">🔐 Keamanan Dua Faktor (2FA)</h2>
			<p class="fa-section-desc">
				Tingkatkan keamanan akun kamu dengan verifikasi dua faktor menggunakan aplikasi authenticator seperti Google Authenticator atau Authy.
			</p>

			{#if !totpVerified}
				<!-- Setup 2FA -->
				{#if !settingUp2FA && setupStep === 'idle'}
					<Button onclick={startSetup} disabled={!hasPassword}>
						Aktifkan 2FA
					</Button>
					{#if !hasPassword}
						<p class="fa-note">Kamu perlu memiliki password untuk mengaktifkan 2FA.</p>
					{/if}
				{/if}

				{#if setupStep === 'show_qr'}
					<div class="fa-setup">
						<p class="fa-setup-step">1. Scan QR code berikut dengan aplikasi authenticator kamu:</p>
						<canvas bind:this={qrCanvas} class="fa-qr-canvas"></canvas>
						<p class="fa-setup-step">2. Atau masukkan kode rahasia ini secara manual:</p>
						<div class="fa-secret-box">
							<code class="fa-secret">{totpSecret}</code>
							<button
								class="fa-copy-btn"
								onclick={() => { navigator.clipboard.writeText(totpSecret); addToast('Kode rahasia disalin', 'info'); }}
							>📋 Salin</button>
						</div>

						{#if showingRecoveryCodes && recoveryCodes.length > 0}
							<div class="fa-recovery-section">
								<p class="fa-setup-step">🔐 Kode Pemulihan (simpan di tempat aman!)</p>
								<p class="fa-recovery-warning">Kode ini hanya ditampilkan sekali. Gunakan untuk masuk jika kehilangan akses ke aplikasi authenticator.</p>
								<div class="fa-recovery-grid">
									{#each recoveryCodes as rc}
										<code class="fa-recovery-code">{rc}</code>
									{/each}
								</div>
								<Button onclick={dismissRecoveryCodes}>Saya sudah menyimpannya</Button>
							</div>
						{/if}

						<p class="fa-setup-step">3. Masukkan kode 6 digit dari aplikasi authenticator untuk verifikasi:</p>
						<div class="fa-verify-row">
							<input
								type="text"
								bind:value={verifyCode}
								placeholder="000000"
								maxlength={6}
								class="fa-code-input"
								onkeydown={(e) => { if (e.key === 'Enter') verifySetup(); }}
							/>
							<Button onclick={verifySetup} disabled={verifying2FA}>
								{verifying2FA ? 'Memverifikasi...' : 'Verifikasi'}
							</Button>
							<Button variant="ghost" onclick={cancelSetup}>Batal</Button>
						</div>
						{#if setupError}
							<p class="fa-error">{setupError}</p>
						{/if}
					</div>
				{/if}

				{#if setupStep === 'verified'}
					<div class="fa-success">
						<p class="fa-success-text">✅ 2FA berhasil diaktifkan!</p>
						{#if showingRecoveryCodes && recoveryCodes.length > 0}
							<div class="fa-recovery-section">
								<p class="fa-setup-step">🔐 Kode Pemulihan</p>
								<p class="fa-recovery-warning">Simpan kode berikut di tempat aman. Kode ini hanya ditampilkan sekali.</p>
								<div class="fa-recovery-grid">
									{#each recoveryCodes as rc}
										<code class="fa-recovery-code">{rc}</code>
									{/each}
								</div>
								<Button onclick={dismissRecoveryCodes}>Saya sudah menyimpannya</Button>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- 2FA Already Active: Disable -->
				<div class="fa-active">
					<p class="fa-active-badge">✅ 2FA aktif</p>

					<!-- Recovery Codes section -->
					<div class="fa-recovery-manage">
						<p class="fa-disable-label">🔐 Kode Pemulihan</p>
						<p class="fa-recovery-desc">Gunakan kode pemulihan untuk masuk jika kehilangan akses ke aplikasi authenticator.</p>
						<Button onclick={regenerateRecoveryCodes} disabled={regeneratingCodes}>
							{regeneratingCodes ? 'Memproses...' : '📋 Tampilkan / Regenerasi Kode Pemulihan'}
						</Button>
						{#if showingRecoveryCodes && recoveryCodes.length > 0}
							<div class="fa-recovery-section">
								<p class="fa-recovery-warning">Kode ini hanya ditampilkan sekali. Simpan di tempat aman.</p>
								<div class="fa-recovery-grid">
									{#each recoveryCodes as rc}
										<code class="fa-recovery-code">{rc}</code>
									{/each}
								</div>
								<Button onclick={dismissRecoveryCodes}>Saya sudah menyimpannya</Button>
							</div>
						{/if}
					</div>

					<div class="fa-disable-section">
						<p class="fa-disable-label">Nonaktifkan 2FA</p>
						<div class="fa-disable-row">
							<input
								type="password"
								bind:value={disablePassword}
								placeholder="Masukkan password"
								class="fa-password-input"
								onkeydown={(e) => { if (e.key === 'Enter') disable2FA(); }}
							/>
							<Button onclick={disable2FA} disabled={disabling2FA} variant="danger">
								{disabling2FA ? 'Menonaktifkan...' : 'Nonaktifkan'}
							</Button>
						</div>
						{#if setupError}
							<p class="fa-error">{setupError}</p>
						{/if}
					</div>
				</div>
			{/if}
		</Card>
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

	.edit-actions {
		display: flex;
		gap: 8px;
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
		margin-top: 20px;
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
	}

	/* 2FA Section */
	.fa-section {
		margin-top: 24px;
	}

	.fa-section-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 8px;
	}

	.fa-section-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 20px;
		line-height: 1.5;
	}

	.fa-note {
		font-size: 12px;
		color: var(--text-secondary);
		margin-top: 8px;
	}

	.fa-setup {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.fa-setup-step {
		font-size: 13px;
		color: var(--text);
		margin: 0;
		font-weight: 500;
	}

	.fa-qr-canvas {
		border-radius: 8px;
		background: #fff;
		padding: 8px;
		align-self: center;
	}

	.fa-secret-box {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 8px 12px;
	}

	.fa-secret {
		font-size: 13px;
		font-family: monospace;
		letter-spacing: 0.5px;
		word-break: break-all;
		color: var(--accent);
	}

	.fa-copy-btn {
		background: var(--accent-dim);
		border: none;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		font-family: inherit;
		white-space: nowrap;
		transition: all 0.15s;
		flex-shrink: 0;
	}

	.fa-copy-btn:hover {
		background: var(--accent);
		color: #fff;
	}

	.fa-verify-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.fa-code-input {
		width: 120px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		font-size: 16px;
		font-family: monospace;
		text-align: center;
		letter-spacing: 4px;
		outline: none;
		transition: border-color 0.15s;
	}

	.fa-code-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(94,106,210,0.15);
	}

	.fa-error {
		font-size: 13px;
		color: #ef4444;
		margin: 4px 0 0;
	}

	.fa-success {
		text-align: center;
		padding: 12px 0;
	}

	.fa-success-text {
		font-size: 16px;
		font-weight: 600;
		color: #22c55e;
	}

	.fa-active {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.fa-active-badge {
		font-size: 15px;
		font-weight: 600;
		color: #22c55e;
		margin: 0;
	}

	.fa-disable-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.fa-disable-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0;
	}

	.fa-disable-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.fa-password-input {
		width: 200px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s;
	}

	.fa-password-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(94,106,210,0.15);
	}

	/* Recovery Codes */
	.fa-recovery-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.fa-recovery-warning {
		font-size: 12px;
		color: #ef4444;
		margin: 0;
		font-weight: 500;
	}

	.fa-recovery-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0;
	}

	.fa-recovery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
	}

	.fa-recovery-code {
		font-size: 13px;
		font-family: monospace;
		background: var(--bg);
		padding: 6px 10px;
		border-radius: 4px;
		letter-spacing: 1px;
		text-align: center;
		color: var(--accent);
		border: 1px solid var(--border);
	}

	.fa-recovery-manage {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px 0;
		border-top: 1px solid var(--border);
	}

	@media (max-width: 480px) {
		.fa-recovery-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
