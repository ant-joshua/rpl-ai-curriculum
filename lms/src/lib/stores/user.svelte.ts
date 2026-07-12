import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

const USERNAME_KEY = 'lms-username';
const USER_ID_KEY = 'lms-user-id';

function createUserStore() {
	let username = $state<string>('');
	let userId = $state<string>('');

	function getDeviceId(): string {
		if (!browser) return '';
		let id = localStorage.getItem('device_id');
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem('device_id', id);
		}
		return id;
	}

	// Init from localStorage on client
	if (browser) {
		const stored = localStorage.getItem(USERNAME_KEY);
		if (stored) {
			username = stored;
		}
		const storedId = localStorage.getItem(USER_ID_KEY);
		if (storedId) {
			userId = storedId;
		} else {
			// Use device_id as userId fallback
			userId = getDeviceId();
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
					// Sync with D1
					const deviceId = getDeviceId();
					api('/api/auth/login', {
						method: 'POST',
						body: JSON.stringify({ username: value, device_id: deviceId }),
					}).then(res => {
						if (res.success && res.user) {
							userId = res.user.id;
							localStorage.setItem(USER_ID_KEY, res.user.id);
						}
					});
				} else {
					localStorage.removeItem(USERNAME_KEY);
				}
			}
		},
		get userId() {
			return userId;
		},
		get deviceId() {
			return getDeviceId();
		},
		get isLoggedIn() {
			return username.length > 0;
		},
		logout() {
			username = '';
			userId = '';
			if (browser) {
				localStorage.removeItem(USERNAME_KEY);
				localStorage.removeItem(USER_ID_KEY);
			}
		}
	};
}

export const user = createUserStore();
