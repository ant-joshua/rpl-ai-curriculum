<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Badge, Button, Card, EmptyState, Input, Skeleton, Modal, PageHeader, SearchBar, SearchInput, Select, Table, Textarea } from '$lib/components/ui/index.js';

	let users: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let sortBy = $state<'username' | 'xp' | 'level' | 'sessions'>('xp');

	let editUser: any = $state(null);
	let editRole = $state('');
	let editDisplayName = $state('');
	let editEmail = $state('');
	let editIsActive = $state(true);
	let editPassword = $state('');
	let saving = $state(false);
	let saveError = $state('');
	let saveSuccess = $state('');

	const VALID_ROLES = ['superadmin', 'admin', 'instructor', 'ta', 'student', 'parent'];

	const roleColors: Record<string, string> = {
		superadmin: 'var(--color-red, #ef4444)',
		admin: 'var(--color-purple, #4F46E5)',
		instructor: 'var(--color-blue, #3b82f6)',
		ta: 'var(--color-green, #22c55e)',
		student: 'var(--color-gray, #64748b)',
		parent: 'var(--color-orange, #f97316)',
	};

	onMount(() => {
		if (!browser) return;
		loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/users');
			const json = await res.json();
			if (json.success) users = json.data;
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		users
			.filter(u => !searchQuery || u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => {
				if (sortBy === 'username') return (a.username || '').localeCompare(b.username || '');
				if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
				if (sortBy === 'level') return (b.level || 1) - (a.level || 1);
				return (b.completed_sessions || 0) - (a.completed_sessions || 0);
			})
	);

	function openEdit(user: any) {
		editUser = user;
		editRole = user.role || 'student';
		editDisplayName = user.display_name || '';
		editEmail = user.email || '';
		editIsActive = user.is_active !== false;
		editPassword = '';
		saveError = '';
		saveSuccess = '';
	}

	function closeEdit() {
		editUser = null;
		editPassword = '';
		saveError = '';
		saveSuccess = '';
	}

	async function saveUser() {
		if (!editUser) return;
		saving = true;
		saveError = '';
		saveSuccess = '';
		try {
			const body: Record<string, any> = {};
			if (editRole !== editUser.role) body.role = editRole;
			if (editDisplayName !== (editUser.display_name || '')) body.display_name = editDisplayName;
			if (editEmail !== (editUser.email || '')) body.email = editEmail;
			if (editIsActive !== (editUser.is_active !== false)) body.is_active = editIsActive;
			if (editPassword.trim()) body.password = editPassword;

			if (Object.keys(body).length === 0) {
				closeEdit();
				return;
			}

			const res = await fetch(`/api/admin/users/${editUser.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				const idx = users.findIndex(u => u.id === editUser.id);
				if (idx !== -1) users[idx] = json.data;
				const msgs: string[] = [];
				if (body.password) msgs.push('✅ Password direset');
				if (Object.keys(body).length > 1 || !body.password) msgs.push('✅ Profil disimpan');
				saveSuccess = msgs.join(' · ');
				editPassword = '';
				setTimeout(() => { saveSuccess = ''; }, 3000);
			} else {
				saveError = json.error || 'Failed to save';
			}
		} catch {
			saveError = 'Failed to save';
		} finally {
			saving = false;
		}
	}

	async function deleteUser() {
		if (!editUser) return;
		if (!confirm(`Hapus user "${editUser.username}"? Tindakan ini tidak bisa dibatalkan.`)) return;
		saving = true;
		saveError = '';
		try {
			const res = await fetch(`/api/admin/users/${editUser.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				users = users.filter(u => u.id !== editUser.id);
				closeEdit();
			} else {
				saveError = json.error || 'Failed to delete';
			}
		} catch {
			saveError = 'Failed to delete';
		} finally {
			saving = false;
		}
	}

	async function resetPassword(userId: string, username: string) {
		const newPass = prompt(`Reset password untuk "${username}"\nMasukkan password baru (min 6 karakter):`);
		if (!newPass || newPass.length < 6) {
			if (newPass !== null) alert('Password minimal 6 karakter');
			return;
		}
		try {
			const res = await fetch(`/api/admin/users/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: newPass }),
			});
			const json = await res.json();
			if (json.success) alert(`✅ Password "${username}" berhasil direset`);
			else alert(`❌ ${json.error}`);
		} catch {
			alert('❌ Gagal reset password');
		}
	}

	// Bulk emails state
	let bulkEmails = $state('');
	let bulkSaving = $state(false);
	let bulkResult = $state('');

	async function bulkCreateUsers() {
		if (!bulkEmails.trim()) return;
		bulkSaving = true;
		bulkResult = '';
		try {
			const emails = bulkEmails
				.split(/[\n,]+/)
				.map(e => e.trim())
				.filter(e => e.length > 0 && e.includes('@'));
			const res = await fetch('/api/admin/enrollments/create-users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emails }),
			});
			const json = await res.json();
			if (json.success) {
				bulkResult = `✅ Created ${json.data?.created || 0} user(s).`;
				bulkEmails = '';
				loadUsers();
			} else {
				bulkResult = `❌ ${json.error || 'Failed'}`;
			}
		} catch {
			bulkResult = '❌ Failed';
		} finally {
			bulkSaving = false;
		}
	}
  import { t } from '$lib/stores/i18n';
</script>

<svelte:head>
	<title>User Management — Admin</title>
</svelte:head>

<div class="users-page">
	<PageHeader title="👥 User Management">
		{#snippet action()}
			<Button onclick={loadUsers} variant="secondary" size="sm">🔄 Refresh</Button>
		{/snippet}
	</PageHeader>

	{#if loading}
		<Skeleton variant="block" count={1} />
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<Button onclick={loadUsers} variant="secondary">Retry</Button>
		</div>
	{:else}
		<div class="toolbar">
			<SearchBar bind:value={searchQuery} placeholder="Cari username, email, atau nama..." />
			<div class="sort-group">
				<span class="sort-label">Urutkan:</span>
				<Button variant={sortBy === 'xp' ? 'primary' : 'secondary'} size="sm" onclick={() => sortBy = 'xp'}>XP</Button>
				<Button variant={sortBy === 'level' ? 'primary' : 'secondary'} size="sm" onclick={() => sortBy = 'level'}>Level</Button>
				<Button variant={sortBy === 'sessions' ? 'primary' : 'secondary'} size="sm" onclick={() => sortBy = 'sessions'}>Sessions</Button>
				<Button variant={sortBy === 'username' ? 'primary' : 'secondary'} size="sm" onclick={() => sortBy = 'username'}>Name</Button>
			</div>
			<Badge variant="default">{filtered.length} users</Badge>
		</div>

		<Table headers={['Username', 'User ID', 'Level', 'XP', 'Sessions', 'Projects', 'Role', 'Email', 'Status', 'Joined', 'Actions']}>
			{#each filtered as u}
				<tr>
					<td class="clickable-cell" onclick={() => openEdit(u)}>
						<span class="avatar">{u.username?.charAt(0)?.toUpperCase() || '?'}</span>
						{u.username || 'anonymous'}
						{#if u.display_name && u.display_name !== u.username}
							<span class="display-name">({u.display_name})</span>
						{/if}
					</td>
					<td class="mono clickable-cell" onclick={() => openEdit(u)}>{u.id?.slice(0, 12)}...</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}><Badge variant="primary">Lv.{u.level || 1}</Badge></td>
					<td class="xp-cell clickable-cell" onclick={() => openEdit(u)}>{Number(u.xp || 0).toLocaleString()} XP</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}>{u.completed_sessions || 0}</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}>{u.completed_projects || 0}</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}>
						<span class="role-badge" style="background: {roleColors[u.role] || roleColors['student']}20; color: {roleColors[u.role] || roleColors['student']}; border: 1px solid {roleColors[u.role] || roleColors['student']}40;">
							{u.role || 'student'}
						</span>
					</td>
					<td class="mono clickable-cell" onclick={() => openEdit(u)}>{u.email || '-'}</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}>
						<span class="status-dot" class:active={u.is_active !== false}></span>
					</td>
					<td class="clickable-cell" onclick={() => openEdit(u)}>{new Date(u.created_at).toLocaleDateString()}</td>
					<td>
						<div class="action-btns">
							<button class="icon-btn" title="Edit" onclick={() => openEdit(u)}>✏️</button>
							<button class="icon-btn" title="Reset Password" onclick={() => resetPassword(u.id, u.username)}>🔑</button>
						</div>
					</td>
				</tr>
			{/each}
		</Table>
		{#if filtered.length === 0 && !loading}
			<EmptyState message="Tidak ada user ditemukan" />
		{/if}

		<!-- Bulk user creation -->
		<div class="bulk-section">
			<h2>📋 Bulk Create Users</h2>
			<p class="bulk-hint">Masukkan email satu per baris atau koma. User akan dibuat dengan password default: <code>password123</code></p>
			<Textarea placeholder="user1@example.com&#10;user2@example.com" bind:value={bulkEmails} class="bulk-textarea" />
			<div class="bulk-actions">
				<Button onclick={bulkCreateUsers} disabled={bulkSaving} variant="secondary">
					{bulkSaving ? 'Creating...' : 'Create Users'}
				</Button>
				{#if bulkResult}
					<span class="bulk-result">{bulkResult}</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Edit User Modal -->
{#if editUser}
<Modal title="✏️ Edit User — {editUser.username}" open={!!editUser} onclose={closeEdit}>
	<div class="modal-grid">
		<div class="field">
			<label>Username</label>
			<input class="input-disabled" value={editUser?.username || ''} disabled />
		</div>
		<div class="field">
			<label>User ID</label>
			<input class="input-disabled" value={editUser?.id || ''} disabled />
		</div>
		<div class="field">
			<label>Display Name</label>
			<input class="input" bind:value={editDisplayName} placeholder="Nama tampilan" />
		</div>
		<div class="field">
			<label>Email</label>
			<input class="input" type="email" bind:value={editEmail} placeholder="Email address" />
		</div>
		<div class="field">
			<label>Role</label>
			<select class="input" bind:value={editRole}>
				{#each VALID_ROLES as role}
					<option value={role}>{role}</option>
				{/each}
			</select>
		</div>
		<div class="field">
			<label>Status</label>
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={editIsActive} />
				<span>Active</span>
			</label>
		</div>
	</div>

	<!-- Password Reset Section -->
	<div class="password-section">
		<h3>🔑 Reset Password</h3>
		<p class="password-hint">Kosongkan jika tidak ingin mengubah password</p>
		<div class="field">
			<label>New Password (min 6 chars)</label>
			<input class="input" type="text" bind:value={editPassword} placeholder="Masukkan password baru..." />
		</div>
		{#if editPassword && editPassword.length < 6}
			<span class="password-warn">⚠️ Password minimal 6 karakter</span>
		{/if}
	</div>

	{#if saveError}
		<div class="save-error">{saveError}</div>
	{/if}
	{#if saveSuccess}
		<div class="save-success">{saveSuccess}</div>
	{/if}

	{#snippet footer()}
		<div class="modal-footer">
			<div class="footer-left">
				<button class="danger-link" onclick={deleteUser}>🗑️ Hapus User</button>
			</div>
			<div class="footer-right">
				<Button onclick={closeEdit} variant="secondary">Batal</Button>
				<Button onclick={saveUser} disabled={saving || (editPassword.length > 0 && editPassword.length < 6)} variant="primary">
					{saving ? 'Menyimpan...' : '💾 Simpan'}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
{/if}

<style>
	.users-page { max-width: 1200px; }
	.error-state { text-align: center; padding: 60px; color: var(--text-secondary); }

	.toolbar {
		display: flex; gap: 12px; align-items: center;
		margin-bottom: 16px; flex-wrap: wrap;
	}
	.sort-group { display: flex; gap: 4px; align-items: center; }
	.sort-label { font-size: 12px; color: var(--text-secondary); margin-right: 4px; }

	.clickable-cell { cursor: pointer; }
	.clickable-cell:hover { background: var(--hover); }
	.mono { font-family: monospace; font-size: 12px; }
	.username-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
	.display-name { color: var(--text-secondary); font-size: 12px; font-weight: 400; }
	.avatar {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 12px; font-weight: 700; flex-shrink: 0;
	}
	.xp-cell { font-weight: 600; color: var(--accent); }

	.role-badge {
		display: inline-block; padding: 2px 8px; border-radius: 6px;
		font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
	}

	.status-dot {
		display: inline-block; width: 10px; height: 10px; border-radius: 50%;
		background: var(--color-gray, #64748b);
	}
	.status-dot.active { background: var(--color-green, #22c55e); box-shadow: 0 0 6px var(--color-green, #22c55e); }

	.action-btns { display: flex; gap: 4px; }
	.icon-btn {
		background: none; border: 1px solid transparent; border-radius: 6px;
		padding: 4px 6px; cursor: pointer; font-size: 14px;
		transition: background 0.15s, border-color 0.15s;
	}
	.icon-btn:hover { background: var(--hover); border-color: var(--border); }

	/* Bulk section */
	.bulk-section {
		margin-top: 40px; padding: 20px;
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
	}
	.bulk-section h2 { font-size: 18px; margin-bottom: 8px; }
	.bulk-hint { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
	.bulk-hint code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.bulk-textarea {
		width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-family: monospace; font-size: 13px;
		resize: vertical; box-sizing: border-box;
	}
	.bulk-actions { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
	.bulk-result { font-size: 13px; font-weight: 500; }

	/* Modal */
	.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
	.field { display: flex; flex-direction: column; gap: 4px; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.checkbox-label {
		display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;
		color: var(--text); cursor: pointer; padding-top: 4px;
	}
	.input {
		padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text); font-size: 14px;
	}
	.input-disabled {
		padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--bg-secondary); color: var(--text-secondary); font-size: 14px;
		opacity: 0.6; cursor: not-allowed;
	}
	select.input { cursor: pointer; }

	.password-section {
		padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border);
		border-radius: 10px; margin-bottom: 16px;
	}
	.password-section h3 { font-size: 14px; font-weight: 700; margin: 0 0 4px; }
	.password-hint { font-size: 12px; color: var(--text-secondary); margin: 0 0 10px; }
	.password-warn { font-size: 12px; color: var(--color-orange, #f97316); margin-top: 4px; }

	.save-error {
		padding: 8px 12px; background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.19); color: var(--color-red, #ef4444);
		border-radius: 8px; font-size: 13px;
	}
	.save-success {
		padding: 8px 12px; background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.19); color: var(--color-green, #22c55e);
		border-radius: 8px; font-size: 13px;
	}

	.modal-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; }
	.footer-left { }
	.footer-right { display: flex; gap: 8px; }
	.danger-link {
		background: none; border: none; color: var(--color-red, #ef4444);
		font-size: 13px; font-weight: 500; cursor: pointer; padding: 0;
	}
	.danger-link:hover { text-decoration: underline; }
</style>
