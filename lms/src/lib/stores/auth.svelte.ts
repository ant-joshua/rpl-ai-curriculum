import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

export interface OAuthUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	provider: 'google' | 'github';
}

const AUTH_KEY = 'lms-auth-token';
const AUTH_USER_KEY = 'lms-auth-user';

function createAuthStore() {
	let authUser = $state<OAuthUser | null>(null);
	let authToken = $state<string | null>(null);

	function loadFromStorage() {
		if (!browser) return;
		try {
			const token = localStorage.getItem(AUTH_KEY);
			const raw = localStorage.getItem(AUTH_USER_KEY);
			if (token && raw) {
				authToken = token;
				authUser = JSON.parse(raw);
			}
		} catch {
			localStorage.removeItem(AUTH_KEY);
			localStorage.removeItem(AUTH_USER_KEY);
		}
	}

	function saveToStorage() {
		if (!browser) return;
		if (authToken && authUser) {
			localStorage.setItem(AUTH_KEY, authToken);
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
		} else {
			localStorage.removeItem(AUTH_KEY);
			localStorage.removeItem(AUTH_USER_KEY);
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
		get authToken() {
			return authToken;
		},
		get isLoggedIn() {
			return authUser !== null && authToken !== null;
		},
		/**
		 * Login with OAuth provider. Redirects to the OAuth flow.
		 */
		async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
			if (!browser) return;
			window.location.href = `/api/auth/oauth/redirect/${provider}`;
		},
		/**
		 * Set session from OAuth callback result (token + user).
		 */
		setSession(token: string, user: OAuthUser): void {
			authToken = token;
			authUser = user;
			saveToStorage();
		},
		/**
		 * Logout — clears local state and calls /api/auth/logout.
		 */
		async logout(): Promise<void> {
			if (authToken) {
				try {
					await fetch('/api/auth/logout', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${authToken}`,
						},
					});
				} catch {
					// offline — ignore
				}
			}
			authToken = null;
			authUser = null;
			if (browser) {
				localStorage.removeItem(AUTH_KEY);
				localStorage.removeItem(AUTH_USER_KEY);
				localStorage.removeItem('lms-username');
				localStorage.removeItem('lms-user-id');
			}
		},
		/**
		 * Validate session with server (on app load).
		 */
		async validateSession(): Promise<boolean> {
			if (!authToken) return false;
			try {
				const res = await fetch('/api/auth/me', {
					headers: { 'Authorization': `Bearer ${authToken}` },
				});
				const body = await res.json();
				if (body.success && body.data) {
					authUser = body.data as OAuthUser;
					saveToStorage();
					return true;
				}
				// Session expired
				authToken = null;
				authUser = null;
				saveToStorage();
				return false;
			} catch {
				return false;
			}
		},
		loadFromStorage,
	};
}

export const auth = createAuthStore();
