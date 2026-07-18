/**
 * TOTP 2FA utility — Web Crypto API based (CF Workers compatible).
 * Uses HMAC-SHA1 with 30-second window, 6-digit codes.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Uint8Array): string {
	let bits = 0;
	let value = 0;
	let output = '';
	for (let i = 0; i < buf.length; i++) {
		value = (value << 8) | buf[i];
		bits += 8;
		while (bits >= 5) {
			output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
			bits -= 5;
		}
	}
	if (bits > 0) {
		output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
	}
	return output;
}

function base32Decode(encoded: string): Uint8Array {
	const cleaned = encoded.replace(/[^A-Za-z2-7]/g, '').toUpperCase();
	const bytes: number[] = [];
	let bits = 0;
	let value = 0;
	for (let i = 0; i < cleaned.length; i++) {
		const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
		if (idx === -1) continue;
		value = (value << 5) | idx;
		bits += 5;
		if (bits >= 8) {
			bytes.push((value >>> (bits - 8)) & 0xff);
			bits -= 8;
		}
	}
	return new Uint8Array(bytes);
}

/**
 * Generate a random 16-byte TOTP secret, base32-encoded.
 */
export function generateSecret(): string {
	const buf = new Uint8Array(16);
	crypto.getRandomValues(buf);
	return base32Encode(buf);
}

/**
 * Generate TOTP code for given secret at a specific timestamp.
 * Standard: 30s window, 6 digits, HMAC-SHA1.
 */
export async function generateTOTP(secret: string, timestamp: number = Date.now()): Promise<string> {
	const decoded = base32Decode(secret);
	const counter = Math.floor(timestamp / 30000);
	const counterBuf = new ArrayBuffer(8);
	const view = new DataView(counterBuf);
	view.setBigUint64(0, BigInt(counter), false);

	const key = await crypto.subtle.importKey(
		'raw',
		decoded,
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign'],
	);
	const hmac = await crypto.subtle.sign('HMAC', key, counterBuf);
	const hmacArr = new Uint8Array(hmac);
	const offset = hmacArr[hmacArr.length - 1] & 0xf;
	const code =
		((hmacArr[offset] & 0x7f) << 24) |
		((hmacArr[offset + 1] & 0xff) << 16) |
		((hmacArr[offset + 2] & 0xff) << 8) |
		(hmacArr[offset + 3] & 0xff);
	return String(code % 1000000).padStart(6, '0');
}

/**
 * Verify a TOTP token with 1-step skew allowance (±30s).
 */
export async function verifyTOTP(secret: string, token: string): Promise<boolean> {
	if (!secret || !token || token.length !== 6) return false;
	const now = Date.now();
	// Check current, previous, and next 30s windows
	for (let i = -1; i <= 1; i++) {
		const expected = await generateTOTP(secret, now + i * 30000);
		if (expected === token) return true;
	}
	return false;
}

/**
 * Generate an otpauth:// URL for QR code rendering.
 */
export function getOTPAuthURL(secret: string, username: string): string {
	const encodedUser = encodeURIComponent(`RPL AI:${username}`);
	const encodedSecret = encodeURIComponent(secret);
	return `otpauth://totp/${encodedUser}?secret=${encodedSecret}&issuer=RPL%20AI`;
}
