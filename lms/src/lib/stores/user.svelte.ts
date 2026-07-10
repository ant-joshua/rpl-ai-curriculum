import { browser } from '$app/environment';

const USERNAME_KEY = 'lms-username';

function createUserStore() {
	let username = $state<string>('');

	// Init from localStorage on client
	if (browser) {
		const stored = localStorage.getItem(USERNAME_KEY);
		if (stored) {
			username = stored;
		}
	}

	return {
		get username() {
			return username;
		},
		set username(value: string) {
			username = value;
			if (browser) {
				if (value) {
					localStorage.setItem(USERNAME_KEY, value);
				} else {
					localStorage.removeItem(USERNAME_KEY);
				}
			}
		},
		get isLoggedIn() {
			return username.length > 0;
		},
		logout() {
			username = '';
			if (browser) {
				localStorage.removeItem(USERNAME_KEY);
			}
		}
	};
}

export const user = createUserStore();
