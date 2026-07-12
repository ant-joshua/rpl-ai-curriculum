import { browser } from '$app/environment';
import { progress } from './progress.svelte';

const CERT_COMPLETED_KEY = 'lms-cert-completed-date';

function createCertificateStore() {
	function isEligible(): boolean {
		if (!browser) return false;
		// Touch reactive progress state so this getter tracks reactivity
		void progress.completedCount;
		return progress.completedCount === progress.totalModules;
	}

	function getCompletedDate(): string | null {
		if (!browser) return null;
		return localStorage.getItem(CERT_COMPLETED_KEY);
	}

	function setCompletedDate(): void {
		if (!browser) return;
		const existing = localStorage.getItem(CERT_COMPLETED_KEY);
		if (existing) return;
		const date = new Date().toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
		localStorage.setItem(CERT_COMPLETED_KEY, date);
	}

	// Check eligibility and persist date if newly eligible
	function checkAndMark(): void {
		if (isEligible()) {
			setCompletedDate();
		}
	}

	return {
		get isEligible() {
			return isEligible();
		},
		get completedDate() {
			return getCompletedDate();
		},
		checkAndMark,
	};
}

export const certificate = createCertificateStore();
