import { CourseRepository } from '$lib/repositories/course.repository';
import { ProgressRepository } from '$lib/repositories/progress.repository';

export class CourseService {
	private courseRepo: CourseRepository;
	private progressRepo: ProgressRepository;

	constructor(platformOrDb: any) {
		this.courseRepo = new CourseRepository(platformOrDb);
		this.progressRepo = new ProgressRepository(platformOrDb);
	}

	async getUserEnrolledCoursesWithProgress(userId: string) {
		const enrollments = await this.courseRepo.getUserEnrolledCourses(userId);
		if (!enrollments || enrollments.length === 0) {
			return [];
		}

		const offeringIds = (enrollments as any[]).map((e: any) => e.course_offering_id);
		const instructors = await this.courseRepo.getOfferingInstructors(offeringIds);
		const instructorMap = new Map<string, any>();
		for (const inst of (instructors as any[])) {
			instructorMap.set(inst.offering_id, { id: inst.instructor_id, name: inst.instructor_name });
		}

		const completedByOffering = await this.progressRepo.getUserProgressByOffering(userId);
		const lessonCountMap = await this.courseRepo.getPublishedLessonCounts();

		return (enrollments as any[]).map((e: any) => {
			const offId = e.course_offering_id;
			const completedSet = completedByOffering.get(offId) || new Set();
			const total = lessonCountMap.get(offId) || 0;
			const completed = completedSet.size;
			const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
			const instructor = instructorMap.get(offId) || null;

			return {
				offeringId: e.offering_id,
				offeringName: e.offering_name,
				offeringCode: e.offering_code,
				offeringStatus: e.offering_status,
				enrollmentStatus: e.enrollment_status,
				enrolledAt: e.enrolled_at,
				startDate: e.start_date,
				endDate: e.end_date,
				course: {
					id: e.course_id,
					title: e.course_title,
					slug: e.course_slug,
					icon: e.course_icon || '📚',
					description: e.course_description,
					category: e.category,
					level: e.level,
				},
				instructor,
				progress: { completed, total, percentage: pct },
			};
		});
	}
}
