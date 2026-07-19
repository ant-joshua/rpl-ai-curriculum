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
	let saving = $state(false);
	let saveError = $state('');

	const VALID_ROLES = ['superadmin', 'admin', 'instructor', 'ta', 'student'];

	const roleColors: Record<string, string> = {
		superadmin: 'var(--color-red, #ef4444)',
		admin: 'var(--color-purple, #4F46E5)',
		instructor: 'var(--color-blue, #3b82f6)',
		ta: 'var(--color-green, #22c55e)',
		student: 'var(--color-gray, #64748b)',
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
			.filter(u => !searchQuery || u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id?.toLowerCase().includes(searchQuery.toLowerCase()))
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
		saveError = '';
	}

	function closeEdit() {
		editUser = null;
	}

	async function saveUser() {
		if (!editUser) return;
		saving = true;
		saveError = '';
		try {
			const body: Record<string, any> = {};
			if (editRole !== editUser.role) body.role = editRole;
			if (editDisplayName !== (editUser.display_name || '')) body.display_name = editDisplayName;
			if (editEmail !== (editUser.email || '')) body.email = editEmail;
			if (editIsActive !== (editUser.is_active !== false)) body.is_active = editIsActive;

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
				closeEdit();
			} else {
				saveError = json.error || 'Failed to save';
			}
		} catch {
			saveError = 'Failed to save';
		} finally {
			saving = false;
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
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
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
			<Button onclick={loadUsers} variant="secondary">{t('common.retry')}</Button>
		</div>
	{:else}
		<div class="toolbar">
			<SearchBar bind:value={searchQuery} placeholder="Cari username atau ID..." />
			<div class="sort-group">
				<span class="sort-label">{t('admin.sort')}</span>
				<Button
					variant={sortBy === 'xp' ? 'primary' : 'secondary'}
					size="sm"
					onclick={() => sortBy = 'xp'}
				>{t('common.xp')}</Button>
				<Button
					variant={sortBy === 'level' ? 'primary' : 'secondary'}
					size="sm"
					onclick={() => sortBy = 'level'}
				>{t('common.level')}</Button>
				<Button
					variant={sortBy === 'sessions' ? 'primary' : 'secondary'}
					size="sm"
					onclick={() => sortBy = 'sessions'}
				>Sessions</Button>
				<Button
					variant={sortBy === 'username' ? 'primary' : 'secondary'}
					size="sm"
					onclick={() => sortBy = 'username'}
				>Name</Button>
			</div>
			<Badge variant="default">{filtered.length} users</Badge>
		</div>

		<Table headers={['Username', 'User ID', 'Level', 'XP', 'Sessions Done', 'Projects Done', 'Role', 'Email', 'Status', 'Joined']}>
			{#each filtered as u}
				<tr onclick={() => openEdit(u)} class="clickable-row">
					<td class="username-cell">
						<span class="avatar">{u.username?.charAt(0)?.toUpperCase() || '?'}</span>
						{u.username || 'anonymous'}
						{#if u.display_name && u.display_name !== u.username}
							<span class="display-name">({u.display_name})</span>
						{/if}
					</td>
					<td class="mono">{u.id?.slice(0, 12)}...</td>
					<td><Badge variant="primary">Lv.{u.level || 1}</Badge></td>
					<td class="xp-cell">{Number(u.xp || 0).toLocaleString()} XP</td>
					<td>{u.completed_sessions || 0}</td>
					<td>{u.completed_projects || 0}</td>
					<td>
						<span class="role-badge" style="background: {roleColors[u.role] || roleColors['student']}20; color: {roleColors[u.role] || roleColors['student']}; border: 1px solid {roleColors[u.role] || roleColors['student']}40;">
							{u.role || 'student'}
						</span>
					</td>
					<td class="mono">{u.email || '-'}</td>
					<td>
						<span class="status-dot" class:active={u.is_active !== false}></span>
					</td>
					<td>{new Date(u.created_at).toLocaleDateString()}</td>
				</tr>
			{/each}
		</Table>
		{#if filtered.length === 0 && !loading}
			<EmptyState message={t('admin.no_users')} />
		{/if}

		<!-- Bulk user creation -->
		<div class="bulk-section">
			<h2>📋 Bulk Create Users</h2>
			<p class="bulk-hint">{t('admin.bulk_hint')}</p>
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
<Modal title="✏️ Edit User" open={!!editUser} onclose={closeEdit}>
	<div class="field">
<Input label="Username" value={editUser?.username || ''} disabled />
	</div>
	<div class="field">
<Input label="Display Name" bind:value={editDisplayName} placeholder="Display name" />
	</div>
	<div class="field">
<Input type="email" label="Email" bind:value={editEmail} placeholder="Email address" />
	</div>
	<div class="field">
<Select label="Role" bind:value={editRole} options={VALID_ROLES.map((role) => ({ value: role, label: role }))} />
	</div>
	<div class="field field-checkbox">
		<label>
			<input type="checkbox" bind:checked={editIsActive} />
			<span>{t('common.active')}</span>
		</label>
	</div>
	{#if saveError}
		<div class="save-error">{saveError}</div>
	{/if}
	{#snippet footer()}
		<Button onclick={closeEdit} variant="secondary">{t('common.cancel')}</Button>
		<Button onclick={saveUser} disabled={saving} variant="primary">
			{saving ? 'Saving...' : 'Save Changes'}
		</Button>
	{/snippet}
</Modal>

<style>
	.users-page { max-width: 1200px; }
	h1 { font-size: 26px; font-weight: 590; }
	.error-state { text-align: center; padding: 60px; color: var(--text-secondary); }

	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

	.toolbar {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.sort-group { display: flex; gap: 4px; align-items: center; }
	.sort-label { font-size: 12px; color: var(--text-secondary); margin-right: 4px; }

	.clickable-row { cursor: pointer; }
	.clickable-row:hover td { background: var(--hover); }
	.mono { font-family: monospace; font-size: 12px; }
	.username-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
	.display-name { color: var(--text-secondary); font-size: 12px; font-weight: 400; }
	.avatar {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 12px; font-weight: 700;
	}
	.xp-cell { font-weight: 600; color: var(--accent); }

	.role-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.status-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-gray, #64748b);
	}
	.status-dot.active {
		background: var(--color-green, #22c55e);
		box-shadow: 0 0 6px var(--color-green, #22c55e);
	}

	/* Bulk section */
	.bulk-section {
		margin-top: 40px;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.bulk-section h2 { font-size: 18px; margin-bottom: 8px; }
	.bulk-hint { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
	.bulk-textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-family: monospace;
		font-size: 13px;
		resize: vertical;
		box-sizing: border-box;
	}
	.bulk-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 10px;
	}
	.bulk-result { font-size: 13px; font-weight: 500; }

	/* Modal fields */
	.field { display: flex; flex-direction: column; gap: 4px; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field-checkbox label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		text-transform: none;
		letter-spacing: normal;
		cursor: pointer;
	}
	.input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 14px;
	}
	.input-disabled {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: 14px;
		opacity: 0.6;
		cursor: not-allowed;
	}
	select.input { cursor: pointer; }
	.save-error {
		padding: 8px 12px;
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.19);
		color: var(--color-red, #ef4444);
		border-radius: 8px;
		font-size: 13px;
	}
</style>
