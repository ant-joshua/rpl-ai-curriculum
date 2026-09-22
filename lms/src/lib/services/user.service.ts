import { UserRepository, type UserProfileUpdate } from '$lib/repositories/user.repository';

export class UserService {
	private userRepo: UserRepository;

	constructor(platformOrDb: any) {
		this.userRepo = new UserRepository(platformOrDb);
	}

	async getProfile(userId: string) {
		const profile = await this.userRepo.getProfile(userId);
		if (!profile) return null;

		return {
			id: profile.id,
			displayName: profile.display_name || profile.oauth_name || '',
			email: profile.email || '',
			avatarUrl: profile.avatar_url || '',
			role: profile.role || 'student',
			createdAt: profile.created_at || '',
		};
	}

	async updateProfile(userId: string, updates: UserProfileUpdate) {
		const updated = await this.userRepo.updateProfile(userId, updates);
		if (!updated) return null;

		return {
			id: updated.id,
			displayName: updated.display_name || updated.oauth_name || '',
			email: updated.email || '',
			avatarUrl: updated.avatar_url || '',
			role: updated.role || 'student',
			createdAt: updated.created_at || '',
		};
	}
}
