/**
 * Email utility using MailChannels (free, CF Workers native).
 * No API key needed when deployed on Cloudflare Workers/Pages.
 * Falls back silently on failure — email is a non-critical notification.
 */

const FROM_EMAIL = 'noreply@rpl-ai-curriculum.com';
const FROM_NAME = 'RPL AI Curriculum';

export async function sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
	if (!recipient) return false;
	try {
		const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				personalizations: [{ to: [{ email: recipient }] }],
				from: { email: FROM_EMAIL, name: FROM_NAME },
				subject,
				content: [{ type: 'text/plain', value: body }],
			}),
		});
		return res.ok;
	} catch (e) {
		console.error('sendEmail failed:', e);
		return false;
	}
}

export async function send2FAEnabledEmail(email: string): Promise<void> {
	await sendEmail(
		email,
		'2FA Enabled — RPL AI Curriculum',
		`Two-factor authentication (2FA) has been enabled on your account.

If you did not request this change, please secure your account immediately by disabling 2FA and changing your password.

RPL AI Curriculum Security Team`,
	);
}

export async function send2FADisabledEmail(email: string): Promise<void> {
	await sendEmail(
		email,
		'2FA Disabled — RPL AI Curriculum',
		`Two-factor authentication (2FA) has been disabled on your account.

If you did not request this change, please contact support immediately.

RPL AI Curriculum Security Team`,
	);
}
