import { browser } from '$app/environment';
import { paths, getPathBySlug, type LearningPath } from './paths';
import { getModuleBySlug } from './modules';

const PLANNER_KEY = 'lms-planner';

export interface StudyPlan {
	id: string;
	pathSlug: string;
	startDate: string;
	targetDate: string;
	dailyTarget: number;
	completedDays: number;
	totalDays: number;
	status: 'active' | 'completed' | 'abandoned';
}

export interface DailySession {
	moduleSlug: string;
	moduleTitle: string;
	sessionId: string;
	sessionTitle: string;
	day: number;
}

function createPlannerStore() {
	let activePlan = $state<StudyPlan | null>(null);

	function loadFromStorage(): void {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(PLANNER_KEY);
			if (raw) {
				const parsed: StudyPlan = JSON.parse(raw);
				if (parsed.status === 'active') {
					activePlan = parsed;
				}
			}
		} catch {
			// ignore
		}
	}

	function saveToStorage(): void {
		if (!browser) return;
		if (activePlan) {
			localStorage.setItem(PLANNER_KEY, JSON.stringify(activePlan));
		} else {
			localStorage.removeItem(PLANNER_KEY);
		}
	}

	function createPlan(pathSlug: string, targetDate: string): StudyPlan {
		const path = getPathBySlug(pathSlug);
		if (!path) throw new Error(`Path not found: ${pathSlug}`);

		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const target = new Date(targetDate);
		const diffTime = target.getTime() - start.getTime();
		const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

		const totalSessions = path.estimatedSessions;
		const dailyTarget = Math.max(1, Math.ceil(totalSessions / totalDays));

		const plan: StudyPlan = {
			id: `plan-${Date.now()}`,
			pathSlug,
			startDate: start.toISOString(),
			targetDate: target.toISOString(),
			dailyTarget,
			completedDays: 0,
			totalDays,
			status: 'active',
		};

		activePlan = plan;
		saveToStorage();
		return plan;
	}

	function abandonPlan(): void {
		if (activePlan) {
			activePlan = { ...activePlan, status: 'abandoned' };
			saveToStorage();
		}
	}

	function completePlan(): void {
		if (activePlan) {
			activePlan = { ...activePlan, status: 'completed' };
			saveToStorage();
		}
	}

	function getActivePlan(): StudyPlan | null {
		return activePlan;
	}

	function getDailySchedule(plan: StudyPlan): DailySession[] {
		const path = getPathBySlug(plan.pathSlug);
		if (!path) return [];

		const now = new Date();
		const start = new Date(plan.startDate);
		const diffMs = now.getTime() - start.getTime();
		const dayIndex = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
		const currentDay = Math.min(dayIndex, plan.totalDays - 1);

		// Gather all sessions in the path
		const allSessions: DailySession[] = [];
		for (const modSlug of path.modules) {
			const mod = getModuleBySlug(modSlug);
			if (!mod) continue;
			for (const ses of mod.sessions) {
				allSessions.push({
					moduleSlug: modSlug,
					moduleTitle: mod.title,
					sessionId: ses.id,
					sessionTitle: ses.title,
					day: 0,
				});
			}
		}

		// Assign sessions to days (round-robin like)
		const todaySessions: DailySession[] = [];
		const sessionsPerDay = plan.dailyTarget;
		const startIdx = currentDay * sessionsPerDay;
		const endIdx = startIdx + sessionsPerDay;

		for (let i = startIdx; i < endIdx && i < allSessions.length; i++) {
			todaySessions.push({ ...allSessions[i], day: currentDay + 1 });
		}

		return todaySessions;
	}

	function getAllSessionsForPlan(plan: StudyPlan): DailySession[] {
		const path = getPathBySlug(plan.pathSlug);
		if (!path) return [];

		const allSessions: DailySession[] = [];
		let day = 1;
		let count = 0;

		for (const modSlug of path.modules) {
			const mod = getModuleBySlug(modSlug);
			if (!mod) continue;
			for (const ses of mod.sessions) {
				allSessions.push({
					moduleSlug: modSlug,
					moduleTitle: mod.title,
					sessionId: ses.id,
					sessionTitle: ses.title,
					day: Math.floor(count / plan.dailyTarget) + 1,
				});
				count++;
			}
		}

		return allSessions;
	}

	function isOnTrack(plan: StudyPlan, completedCheck: (modSlug: string, sessionId: string) => boolean): boolean {
		const now = new Date();
		const start = new Date(plan.startDate);
		const diffMs = now.getTime() - start.getTime();
		const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

		// Expected completed sessions
		const expectedCompleted = daysElapsed * plan.dailyTarget;

		// Actual completed sessions in path
		const path = getPathBySlug(plan.pathSlug);
		if (!path) return false;

		let actualCompleted = 0;
		for (const modSlug of path.modules) {
			const mod = getModuleBySlug(modSlug);
			if (!mod) continue;
			for (const ses of mod.sessions) {
				if (completedCheck(modSlug, ses.id)) {
					actualCompleted++;
				}
			}
		}

		return actualCompleted >= expectedCompleted;
	}

	function getDaysUntilDeadline(plan: StudyPlan): number {
		const now = new Date();
		const target = new Date(plan.targetDate);
		return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
	}

	if (browser) {
		loadFromStorage();
	}

	return {
		get activePlan() {
			return activePlan;
		},
		createPlan,
		abandonPlan,
		completePlan,
		getActivePlan,
		getDailySchedule,
		getAllSessionsForPlan,
		isOnTrack,
		getDaysUntilDeadline,
		loadFromStorage,
		saveToStorage,
	};
}

export const planner = createPlannerStore();
