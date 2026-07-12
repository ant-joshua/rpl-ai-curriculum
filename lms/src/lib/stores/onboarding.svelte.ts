import { browser } from '$app/environment';

const ONBOARDING_KEY = 'lms-onboarding-complete';

function isComplete(): boolean {
	if (!browser) return true;
	try {
		return localStorage.getItem(ONBOARDING_KEY) === 'true';
	} catch {
		return false;
	}
}

function complete(): void {
	if (!browser) return;
	localStorage.setItem(ONBOARDING_KEY, 'true');
}

function reset(): void {
	if (!browser) return;
	localStorage.removeItem(ONBOARDING_KEY);
}

export const onboarding = {
	isComplete,
	complete,
	reset,
};
