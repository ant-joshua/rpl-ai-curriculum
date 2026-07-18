<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { user } from '$lib/stores/user.svelte';
	import { Input, Textarea, Button } from '$lib/components/ui';

	let showCreateForm = $state(false);
	let newName = $state('');
	let newSlug = $state('');
	let newDesc = $state('');
	let creating = $state(false);
	let createError = $state('');

	function isMember(group: any): boolean {
		return group.is_member > 0;
	}

	onMount(() => {
		groupsStore.loadGroups();
	});

	async function handleCreate() {
		if (!newName.trim() || !newSlug.trim()) return;
		creating = true;
		createError = '';
		const ok = await groupsStore.createGroup(newName.trim(), newSlug.trim(), newDesc.trim());
		creating = false;
		if (ok) {
			showCreateForm = false;
			newName = '';
			newSlug = '';
			newDesc = '';
		} else {
			createError = 'Gagal membuat grup. Coba lagi.';
		}
	}

	async function handleJoin(groupId: string) {
		await groupsStore.joinGroup(groupId);
	}
</script>

<div class="groups-page">
	<h1>👥 Study Groups</h1>
	<p class="subtitle">Belajar bareng teman-teman RPL</p>

	<div class="actions-bar">
		<Button variant="primary" onclick={() => showCreateForm = !showCreateForm}>
			{showCreateForm ? '✕ Batal' : '➕ Buat Grup Baru'}
		</Button>
	</div>

	{#if showCreateForm}
		<div class="create-form">
			<h3>Buat Grup Baru</h3>
			<Input label="Nama Grup" bind:value={newName} placeholder="Nama grup..." />
			<Input label="Path Slug" bind:value={newSlug} placeholder="misal: web-dev" />
			<Textarea label="Deskripsi (opsional)" bind:value={newDesc} placeholder="Deskripsi grup..." />
			{#if createError}
				<p class="form-error">{createError}</p>
			{/if}
			<Button onclick={handleCreate} disabled={creating}>
				{creating ? 'Membuat...' : 'Buat Grup'}
			</Button>
		</div>
	{/if}

	<div class="groups-list">
		{#each groupsStore.groups as group}
			<div class="group-card">
				<div class="group-card-body">
					<h3><a href="/groups/{group.id}">{group.name}</a></h3>
					<p class="group-slug">📁 {group.path_slug}</p>
					{#if group.description}
						<p class="group-desc">{group.description}</p>
					{/if}
					<div class="group-meta">
						<span class="member-count">👥 {group.member_count ?? 0} anggota</span>
					</div>
				</div>
				<div class="group-card-actions">
					{#if user.isLoggedIn}
						{#if isMember(group)}
							<a href="/groups/{group.id}" class="enter-btn">Masuk</a>
						{:else}
							<button class="join-btn" onclick={() => handleJoin(group.id)}>Gabung</button>
						{/if}
					{/if}
				</div>
			</div>
		{:else}
			{#if !groupsStore.loading}
				<p class="empty-state">Belum ada grup. Buat grup baru untuk mulai belajar bersama!</p>
			{/if}
		{/each}
	</div>
</div>

<style>
	.groups-page {
		max-width: 700px;
		margin: 0 auto;
	}
	h1 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.subtitle {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 20px;
	}
	.actions-bar {
		margin-bottom: 16px;
	}
	.create-form {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
	}
	.create-form h3 {
		font-size: 16px;
		margin-bottom: 16px;
	}
	.form-error {
		color: #ef4444;
		font-size: 12px;
		margin-bottom: 8px;
	}
	.groups-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.group-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.group-card-body h3 {
		font-size: 16px;
		font-weight: 600;
	}
	.group-card-body h3 a {
		color: var(--text);
		text-decoration: none;
	}
	.group-card-body h3 a:hover {
		color: var(--accent);
	}
	.group-slug {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 2px 0;
	}
	.group-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 4px 0;
	}
	.group-meta {
		margin-top: 6px;
	}
	.member-count {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.join-btn, .enter-btn {
		padding: 6px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		border: none;
	}
	.join-btn {
		background: var(--accent);
		color: #fff;
	}
	.join-btn:hover {
		opacity: 0.9;
	}
	.enter-btn {
		background: var(--accent-dim);
		color: var(--accent);
		text-decoration: none;
	}
	.enter-btn:hover {
		opacity: 0.9;
	}
	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: var(--text-secondary);
		font-size: 14px;
	}
</style>
