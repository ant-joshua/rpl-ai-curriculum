import { browser } from '$app/environment';

const REMINDER_KEY = 'lms-reminder-schedule';
const STREAK_WARN_DAYS = 3;

export interface ReminderSchedule {
	enabled: boolean;
	time: string; // HH:MM
	days: number[]; // 0-6 (Sun-Sat), empty = every day
	lastNotified?: string; // ISO date
}

export interface StreakInfo {
	streak: number;
	lastActive: string | null;
}

function getSchedule(): ReminderSchedule {
	if (!browser) return { enabled: false, time: '19:00', days: [] };
	try {
		const raw = localStorage.getItem(REMINDER_KEY);
		if (raw) {
			const parsed: Partial<ReminderSchedule> = JSON.parse(raw);
			return {
				enabled: parsed.enabled ?? false,
				time: parsed.time ?? '19:00',
				days: parsed.days ?? [],
				lastNotified: parsed.lastNotified,
			};
		}
	} catch { /* fall through */ }
	return { enabled: false, time: '19:00', days: [] };
}

function saveSchedule(schedule: ReminderSchedule): void {
	if (!browser) return;
	localStorage.setItem(REMINDER_KEY, JSON.stringify(schedule));
}

function getStreakInfo(): StreakInfo {
	if (!browser) return { streak: 0, lastActive: null };
	try {
		const completionKey = 'lms-completion-dates';
		const raw = localStorage.getItem(completionKey);
		if (!raw) return { streak: 0, lastActive: null };
		const dates: string[] = JSON.parse(raw);
		if (dates.length === 0) return { streak: 0, lastActive: null };

		// Sort descending
		dates.sort((a, b) => b.localeCompare(a));

		const lastActive = dates[0];
		const today = new Date().toISOString().split('T')[0];

		// Count streak backwards from last active date
		let streak = 0;
		const checkDate = new Date(lastActive);
		const todayDate = new Date(today);

		// Only count streak if lastActive is today or yesterday
		const diffMs = todayDate.getTime() - checkDate.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays > 1) {
			// Streak broken, count from last active backwards
			// Actually: if lastActivity was more than 1 day ago, streak is 0 or we count
			// For warning: just use lastActive date, compare to today
			return { streak: 0, lastActive };
		}

		// Count consecutive days backwards from lastActive
		const temp = new Date(lastActive);
		while (true) {
			const ds = temp.toISOString().split('T')[0];
			if (dates.includes(ds)) {
				streak++;
				temp.setDate(temp.getDate() - 1);
			} else {
				break;
			}
		}

		return { streak, lastActive };
	} catch {
		return { streak: 0, lastActive: null };
	}
}

function requestPermission(): Promise<boolean> {
	if (!browser || !('Notification' in window)) return Promise.resolve(false);
	if (Notification.permission === 'granted') return Promise.resolve(true);
	if (Notification.permission === 'denied') return Promise.resolve(false);
	return Notification.requestPermission().then(perm => perm === 'granted');
}

function showNotification(title: string, body: string): void {
	if (!browser || !('Notification' in window)) return;
	if (Notification.permission === 'granted') {
		new Notification(title, { body, icon: '/favicon.svg' });
	}
}

function checkReminder(): void {
	if (!browser) return;
	const schedule = getSchedule();
	if (!schedule.enabled) return;

	const now = new Date();
	const currentDay = now.getDay(); // 0=Sun
	const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

	// Check day match
	if (schedule.days.length > 0 && !schedule.days.includes(currentDay)) return;

	// Check time match (within same minute window)
	if (schedule.time !== currentTime) return;

	// Avoid re-notifying on the same date
	const today = now.toISOString().split('T')[0];
	if (schedule.lastNotified === today) return;

	showNotification('Waktu Belajar!', 'Yuk kerjain session hari ini');

	// Update lastNotified
	schedule.lastNotified = today;
	saveSchedule(schedule);

	// Check streak warning
	const streakInfo = getStreakInfo();
	if (streakInfo.lastActive) {
		const lastDate = new Date(streakInfo.lastActive);
		const todayDate = new Date(today);
		const diffMs = todayDate.getTime() - lastDate.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays > STREAK_WARN_DAYS) {
			showNotification(
				'🔥 Streak Warning!',
				`Kamu sudah ${diffDays} hari tidak belajar. Yuk lanjutkan streak!`
			);
		}
	}
}

let intervalId: ReturnType<typeof setInterval> | undefined;

function startReminderCheck(): void {
	if (!browser) return;
	// Request permission on start
	requestPermission();
	if (intervalId) return;
	// Run once immediately, then every 60s
	checkReminder();
	intervalId = setInterval(checkReminder, 60_000);
}

function stopReminderCheck(): void {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = undefined;
	}
}

export const reminders = {
	getSchedule,
	saveSchedule,
	requestPermission,
	showNotification,
	checkReminder,
	startReminderCheck,
	stopReminderCheck,
};
