import { ProgressRepository } from '$lib/repositories/progress.repository';
import { logActivity } from '$lib/server/analytics';

export class ProgressService {
	private progressRepo: ProgressRepository;
	private platform: any;

	constructor(platformOrDb: any) {
		this.platform = platformOrDb;
		this.progressRepo = new ProgressRepository(platformOrDb);
	}

	async recordProgress(params: {
		userId: string;
		courseOfferingId: string;
		lessonSlug: string;
		completed: boolean;
		timeSpent: number;
	}) {
		const res = await this.progressRepo.upsertProgress(params);

		if (params.completed && this.platform?.env?.DB) {
			await logActivity(
				this.platform,
				params.userId,
				'complete_lesson',
				'lesson',
				params.lessonSlug,
				{ courseOfferingId: params.courseOfferingId, timeSpent: params.timeSpent }
			).catch(() => null);
		}

		return res;
	}

	async getOfferingProgress(userId: string, offeringId: string) {
		return await this.progressRepo.getOfferingProgress(userId, offeringId);
	}
}
