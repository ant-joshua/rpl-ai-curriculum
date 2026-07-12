import { browser } from '$app/environment';

export interface AuthUser {
	provider: 'google' | 'github';
	id: string;
	name: string;
	email: string;
	avatar?: string;
	token?: string;
}

const AUTH_KEY = 'lms-auth-user';

function createAuthStore() {
	let authUser = $state<AuthUser | null>(null);

	function loadFromStorage() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(AUTH_KEY);
			if (raw) {
				authUser = JSON.parse(raw);
			}
		} catch {
			localStorage.removeItem(AUTH_KEY);
		}
	}

	function saveToStorage() {
		if (!browser) return;
		if (authUser) {
			localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
		} else {
			localStorage.removeItem(AUTH_KEY);
		}
	}

	// Init from localStorage
	if (browser) {
		loadFromStorage();
	}

	return {
		get authUser() {
			return authUser;
		},
		set authUser(value: AuthUser | null) {
			authUser = value;
			saveToStorage();
		},
		get isLoggedIn() {
			return authUser !== null;
		},
		login(provider: 'google' | 'github') {
			// Coming soon — for now just a no-op placeholder
			console.log(`OAuth login via ${provider} coming soon`);
		},
		logout() {
			authUser = null;
			if (browser) {
				localStorage.removeItem(AUTH_KEY);
			}
		},
		loadFromStorage,
	};
}

export const auth = createAuthStore();
