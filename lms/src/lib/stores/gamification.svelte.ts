import { browser } from '$app/environment';
import { modules, type Module } from './modules';
import { api } from '$lib/utils/api';

const XP_KEY = 'lms-xp';
const BADGES_KEY = 'lms-badges';

export interface UserLevel {
	level: number;
	currentXp: number;
	xpToNext: number;
}

export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlockedAt?: string;
	condition: (stats: UserStats) => boolean;
}

export interface UserStats {
	totalSessions: number;
	completedSessions: number;
	streak: number;
	modulesCompleted: number;
	daysActive: number;
	quizzesPassed: number;
}

// XP constants
const XP_PER_SESSION = 10;
const XP_PER_QUIZ = 25;
const XP_PER_MODULE = 50;
const XP_PER_LEVEL = 100;

function getTotalSessions(): number {
	let count = 0;
	for (const mod of modules) {
		count += mod.sessions.length;
	}
	return count;
}

function getModuleSessions(slug: string, completedCheck: (modSlug: string, sessionId: string) => boolean): number {
	const mod = modules.find(m => m.slug === slug);
	if (!mod) return 0;
	return mod.sessions.filter(s => completedCheck(slug, s.id)).length;
}

const TOTAL_SESSIONS = getTotalSessions();

type CompletedCheckFn = (modSlug: string, sessionId: string) => boolean;

export const predefinedBadges: Badge[] = [
	{
		id: 'first-steps',
		name: 'First Steps',
		description: 'Complete your first session',
		icon: '🚀',
		condition: (s) => s.completedSessions >= 1,
	},
	{
		id: 'streak-3',
		name: 'Streak 3',
		description: '3-day study streak',
		icon: '🔥',
		condition: (s) => s.streak >= 3,
	},
	{
		id: 'streak-7',
		name: 'Streak 7',
		description: '7-day study streak',
		icon: '🔥',
		condition: (s) => s.streak >= 7,
	},
	{
		id: 'streak-30',
		name: 'Streak 30',
		description: '30-day study streak',
		icon: '🔥',
		condition: (s) => s.streak >= 30,
	},
	{
		id: 'bookworm',
		name: 'Bookworm',
		description: 'Complete 10 sessions',
		icon: '📚',
		condition: (s) => s.completedSessions >= 10,
	},
	{
		id: 'scholar',
		name: 'Scholar',
		description: 'Complete 50 sessions',
		icon: '🧠',
		condition: (s) => s.completedSessions >= 50,
	},
	{
		id: 'champion',
		name: 'Champion',
		description: 'Complete 100 sessions',
		icon: '🏆',
		condition: (s) => s.completedSessions >= 100,
	},
	{
		id: 'module-master',
		name: 'Module Master',
		description: 'Complete all sessions in any module',
		icon: '🎯',
		condition: () => {
			// Dynamic check: any module at 100%
			for (const mod of modules) {
				const completedCheck = getCompletedCheckFn();
				if (completedCheck && mod.sessions.length > 0) {
					const done = mod.sessions.filter(s => completedCheck(mod.slug, s.id)).length;
					if (done >= mod.sessions.length) return true;
				}
			}
			return false;
		},
	},
	{
		id: 'speed-learner',
		name: 'Speed Learner',
		description: 'Complete 5 sessions in one day',
		icon: '⚡',
		condition: () => {
			if (!browser) return false;
			const raw = localStorage.getItem('lms-completion-dates');
			if (!raw) return false;
			const dates: string[] = JSON.parse(raw);
			const today = new Date().toISOString().split('T')[0];
			const todayCount = dates.filter(d => d === today).length;
			return todayCount >= 5;
		},
	},
	{
		id: 'persistence',
		name: 'Persistence',
		description: 'Study 7 days in a row',
		icon: '💪',
		condition: (s) => s.daysActive >= 7,
	},
	{
		id: 'quizzer',
		name: 'Quizzer',
		description: 'Pass 10 quizzes',
		icon: '🃏',
		condition: (s) => s.quizzesPassed >= 10,
	},
	{
		id: 'curriculum-complete',
		name: 'Curriculum Complete',
		description: 'Finish all 57 modules',
		icon: '🎓',
		condition: (s) => s.modulesCompleted >= 57,
	},
];

// Store a completed-check function reference for dynamic badge conditions
let _completedCheck: CompletedCheckFn | null = null;

export function setCompletedCheck(fn: CompletedCheckFn): void {
	_completedCheck = fn;
}

function getCompletedCheckFn(): CompletedCheckFn | null {
	return _completedCheck;
}

function createGamificationStore() {
	let xp = $state(0);
	let level = $state(1);
	let unlockedBadges = $state<Badge[]>([]);

	function loadFromStorage(): void {
		if (!browser) return;
		try {
			const rawXp = localStorage.getItem(XP_KEY);
			if (rawXp) {
				xp = parseInt(rawXp, 10) || 0;
			}
			const rawBadges = localStorage.getItem(BADGES_KEY);
			if (rawBadges) {
				const badgeIds: string[] = JSON.parse(rawBadges);
				unlockedBadges = predefinedBadges
					.filter((b) => badgeIds.includes(b.id))
					.map((b) => ({
						...b,
						condition: b.condition, // keep condition ref
					}));
			}
			recalcLevel();
		} catch {
			// ignore
		}
	}

	function saveToStorage(): void {
		if (!browser) return;
		localStorage.setItem(XP_KEY, String(xp));
		localStorage.setItem(
			BADGES_KEY,
			JSON.stringify(unlockedBadges.map((b) => b.id)),
		);
	}

	function recalcLevel(): void {
		level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
	}

	function getLevelProgress(): UserLevel {
		const currentLevel = level;
		const currentLevelXp = (currentLevel - 1) * XP_PER_LEVEL;
		const currentXp = xp - currentLevelXp;
		const xpToNext = currentLevel * XP_PER_LEVEL - xp;
		return {
			level: currentLevel,
			currentXp: Math.max(0, currentXp),
			xpToNext: Math.max(0, xpToNext),
		};
	}

	async function addXp(amount: number): Promise<void> {
		xp += amount;
		const oldLevel = level;
		recalcLevel();
		saveToStorage();

		// Sync to D1
		if (browser) {
			try {
				await api('/api/gamification/award', {
					method: 'POST',
					body: JSON.stringify({ reason: 'lesson_complete', amount }),
				});
			} catch {
				// offline — queued locally
			}
		}
	}

	function isBadgeUnlocked(badgeId: string): boolean {
		return unlockedBadges.some((b) => b.id === badgeId);
	}

	function computeStats(): UserStats {
		if (!browser) {
			return {
				totalSessions: TOTAL_SESSIONS,
				completedSessions: 0,
				streak: 0,
				modulesCompleted: 0,
				daysActive: 0,
				quizzesPassed: 0,
			};
		}
		// Count completed sessions from localStorage
		let completedSessions = 0;
		let modulesCompleted = 0;
		for (const mod of modules) {
			const key = `lms-progress-${mod.slug}`;
			try {
				const raw = localStorage.getItem(key);
				if (raw) {
					const ids: string[] = JSON.parse(raw);
					completedSessions += ids.length;
					if (ids.length >= mod.sessions.length) {
						modulesCompleted++;
					}
				}
			} catch {
				// skip
			}
		}

		const streak = parseInt(localStorage.getItem('lms-streak') || '0', 10);

		// Count active days
		let daysActive = 0;
		try {
			const raw = localStorage.getItem('lms-completion-dates');
			if (raw) {
				const dates: string[] = JSON.parse(raw);
				daysActive = dates.length;
			}
		} catch {
			// ignore
		}

		return {
			totalSessions: TOTAL_SESSIONS,
			completedSessions,
			streak,
			modulesCompleted,
			daysActive,
			quizzesPassed: 0, // quizzes not tracked yet — reserved
		};
	}

	function checkBadges(): string[] {
		const stats = computeStats();
		const newlyUnlocked: string[] = [];

		for (const badge of predefinedBadges) {
			if (isBadgeUnlocked(badge.id)) continue;
			let earned = false;
			try {
				earned = badge.condition(stats);
			} catch {
				// badge condition may throw if deps not ready
			}
			if (earned) {
				const stamped: Badge = {
					...badge,
					unlockedAt: new Date().toISOString(),
				};
				unlockedBadges = [...unlockedBadges, stamped];
				newlyUnlocked.push(badge.id);
			}
		}

		if (newlyUnlocked.length > 0) {
			saveToStorage();
			// Sync badges to API (fire-and-forget)
			if (browser) {
				try {
					fetch('/api/xp', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ xp: 0, badge_ids: newlyUnlocked }),
					});
				} catch {
					// offline — queued locally
				}
			}
		}

		return newlyUnlocked;
	}

	async function fetchFromApi(): Promise<void> {
		if (!browser) return;
		try {
			const res = await api<{ totalXp: number; level: number; streak: { current: number; longest: number } }>('/api/gamification/my-stats');
			if (res.success && res.data) {
				xp = res.data.totalXp;
				recalcLevel();
				saveToStorage();
			}
		} catch {
			// offline — use localStorage
		}
	}

	if (browser) {
		loadFromStorage();
		fetchFromApi();
	}

	return {
		get xp() {
			return xp;
		},
		get level() {
			return level;
		},
		get unlockedBadges() {
			return unlockedBadges;
		},
		get badges() {
			return predefinedBadges;
		},
		getLevelProgress,
		addXp,
		checkBadges,
		loadFromStorage,
		saveToStorage,
		isBadgeUnlocked,
		computeStats,
		fetchFromApi,
		XP_PER_SESSION,
		XP_PER_QUIZ,
		XP_PER_MODULE,
	};
}

export function afterSessionComplete(moduleSlug: string, sessionId: string): void {
	if (!browser) return;

	// get current xp from localStorage
	const rawXp = localStorage.getItem(XP_KEY);
	let currentXp = rawXp ? parseInt(rawXp, 10) || 0 : 0;

	// Add XP for session
	currentXp += XP_PER_SESSION;
	localStorage.setItem(XP_KEY, String(currentXp));

	// Check if module is complete (all sessions done)
	const mod = modules.find((m) => m.slug === moduleSlug);
	if (mod) {
		const key = `lms-progress-${moduleSlug}`;
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				const completedIds: string[] = JSON.parse(raw);
				const allDone = mod.sessions.every((s) => completedIds.includes(s.id));
				if (allDone) {
					currentXp += XP_PER_MODULE;
					localStorage.setItem(XP_KEY, String(currentXp));
				}
			}
		} catch {
			// ignore
		}
	}

	// Recalc level
	const newLevel = Math.max(1, Math.floor(currentXp / XP_PER_LEVEL) + 1);
	localStorage.setItem(XP_KEY, String(currentXp));

	// Reload store state
	gamification.loadFromStorage();
	const newlyUnlocked = gamification.checkBadges();

	// Sync to API (fire-and-forget)
	try {
		fetch('/api/gamification/award', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ reason: 'lesson_complete', reference_type: 'lesson', reference_id: sessionId }),
		});
	} catch {
		// offline — queued locally
	}
}

export const gamification = createGamificationStore();
