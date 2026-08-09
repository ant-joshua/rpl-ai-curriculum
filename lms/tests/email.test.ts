import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendEmail, send2FAEnabledEmail, send2FADisabledEmail } from '../src/lib/server/email';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('sendEmail', () => {
	it('returns false for empty recipient', async () => {
		const ok = await sendEmail('', 'subj', 'body');
		expect(ok).toBe(false);
	});

	it('POSTs to MailChannels and returns true on ok', async () => {
		const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		const ok = await sendEmail('a@b.c', 'Subject', 'Body text');
		expect(ok).toBe(true);
		const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
		expect(url).toBe('https://api.mailchannels.net/tx/v1/send');
		expect(init.method).toBe('POST');
		const payload = JSON.parse(init.body);
		expect(payload.personalizations[0].to[0].email).toBe('a@b.c');
		expect(payload.from.email).toBe('noreply@rpl-ai-curriculum.com');
		expect(payload.subject).toBe('Subject');
		expect(payload.content[0].value).toBe('Body text');
	});

	it('returns false on non-ok response', async () => {
		vi.stubGlobal('fetch', async () => new Response('fail', { status: 500 }));
		const ok = await sendEmail('a@b.c', 's', 'b');
		expect(ok).toBe(false);
	});

	it('returns false on network error', async () => {
		vi.stubGlobal('fetch', async () => { throw new Error('net down'); });
		const ok = await sendEmail('a@b.c', 's', 'b');
		expect(ok).toBe(false);
	});
});

describe('2FA emails', () => {
	it('send2FAEnabledEmail sends 2FA Enabled subject', async () => {
		const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		await send2FAEnabledEmail('u@x.com');
		const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
		expect(url).toBe('https://api.mailchannels.net/tx/v1/send');
		const payload = JSON.parse(init.body);
		expect(payload.subject).toContain('2FA Enabled');
		expect(payload.personalizations[0].to[0].email).toBe('u@x.com');
	});

	it('send2FADisabledEmail sends 2FA Disabled subject', async () => {
		const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		await send2FADisabledEmail('u@x.com');
		const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
		const payload = JSON.parse(init.body);
		expect(payload.subject).toContain('2FA Disabled');
	});
});