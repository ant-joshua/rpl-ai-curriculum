import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

export interface StudyGroup {
	id: string;
	name: string;
	path_slug: string;
	description: string | null;
	created_by: string;
	created_at: string;
	member_count?: number;
}

export interface GroupMember {
	id: string;
	group_id: string;
	user_id: string;
	role: string;
	joined_at: string;
	username?: string;
}

export interface GroupMessage {
	id: string;
	group_id: string;
	user_id: string;
	content: string;
	created_at: string;
	username?: string;
}

function createGroupsStore() {
	let groups = $state<StudyGroup[]>([]);
	let messages = $state<GroupMessage[]>([]);
	let currentGroupId = $state<string | null>(null);
	let loading = $state(false);

	async function loadGroups(): Promise<void> {
		loading = true;
		try {
			const res = await api<StudyGroup[]>('/api/groups');
			if (res.success && res.data) {
				groups = res.data;
			}
		} catch { /* ignore */ }
		loading = false;
	}

	async function loadMessages(groupId: string): Promise<void> {
		if (!browser) return;
		currentGroupId = groupId;
		try {
			const res = await api<GroupMessage[]>(`/api/groups/${groupId}/messages`);
			if (res.success && res.data) {
				messages = res.data;
			}
		} catch { /* ignore */ }
	}

	async function sendMessage(groupId: string, content: string): Promise<boolean> {
		try {
			const res = await api(`/api/groups/${groupId}/messages`, {
				method: 'POST',
				body: JSON.stringify({ content }),
			});
			if (res.success) {
				// Reload messages
				await loadMessages(groupId);
				return true;
			}
		} catch { /* ignore */ }
		return false;
	}

	async function createGroup(name: string, pathSlug: string, description: string): Promise<boolean> {
		try {
			const res = await api('/api/groups', {
				method: 'POST',
				body: JSON.stringify({ name, path_slug: pathSlug, description }),
			});
			if (res.success) {
				await loadGroups();
				return true;
			}
		} catch { /* ignore */ }
		return false;
	}

	async function joinGroup(groupId: string): Promise<boolean> {
		try {
			const res = await api(`/api/groups/${groupId}/join`, { method: 'POST' });
			if (res.success) {
				await loadGroups();
				return true;
			}
		} catch { /* ignore */ }
		return false;
	}

	async function leaveGroup(groupId: string): Promise<boolean> {
		try {
			const res = await api(`/api/groups/${groupId}/join`, { method: 'DELETE' });
			if (res.success) {
				await loadGroups();
				return true;
			}
		} catch { /* ignore */ }
		return false;
	}

	return {
		get groups() { return groups; },
		get messages() { return messages; },
		get currentGroupId() { return currentGroupId; },
		get loading() { return loading; },
		loadGroups,
		loadMessages,
		sendMessage,
		createGroup,
		joinGroup,
		leaveGroup,
	};
}

export const groupsStore = createGroupsStore();
