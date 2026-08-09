import { describe, it, expect, vi, afterEach } from 'vitest';
import { getClientKey, createSnapTransaction, verifySignature, formatAmount } from '../src/lib/server/midtrans';

afterEach(() => {
	vi.unstubAllGlobals();
});

const prodPlatform = {
	env: { MIDTRANS_IS_PRODUCTION: 'true', MIDTRANS_SERVER_KEY: 'sk-test', MIDTRANS_CLIENT_KEY: 'ck-test' },
} as any;

const sandboxPlatform = {
	env: { MIDTRANS_IS_PRODUCTION: 'false', MIDTRANS_SERVER_KEY: 'sk-test', MIDTRANS_CLIENT_KEY: 'ck' },
} as any;

describe('getClientKey', () => {
	it('returns client key from env', () => {
		expect(getClientKey(prodPlatform)).toBe('ck-test');
	});

	it('returns empty string when missing', () => {
		expect(getClientKey({ env: {} } as any)).toBe('');
	});
});

describe('formatAmount', () => {
	it('rounds to integer', () => {
		expect(formatAmount(15000.4)).toBe(15000);
		expect(formatAmount(15000.6)).toBe(15001);
		expect(formatAmount(0)).toBe(0);
	});
});

describe('verifySignature', () => {
	it('returns placeholder true (async verify in handler)', () => {
		expect(verifySignature(prodPlatform, 'o1', '201', '10000', 'sig')).toBe(true);
	});
});

describe('createSnapTransaction', () => {
	it('posts to prod URL with auth and returns token', async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ token: 'tok-1', redirect_url: 'https://app.midtrans.com/snap/v1/vt-web/tok-1', status_code: '201', status_message: 'Success' }), { status: 201 })
		);
		vi.stubGlobal('fetch', fetchMock);
		const res = await createSnapTransaction(prodPlatform, 'ord-1', 50000, { first_name: 'A', email: 'a@b.c' }, [{ id: 'x1', name: 'Course', price: 50000, quantity: 1 }]);
		expect(res.token).toBe('tok-1');
		expect(res.redirect_url).toContain('tok-1');
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, any];
		expect(url).toBe('https://app.midtrans.com/snap/v1/transactions');
		expect(init.headers.Authorization).toContain('Basic ');
		const payload = JSON.parse(init.body);
		expect(payload.transaction_details.order_id).toBe('ord-1');
		expect(payload.transaction_details.gross_amount).toBe(50000);
		expect(payload.customer_details.email).toBe('a@b.c');
		expect(payload.item_details).toHaveLength(1);
	});

	it('uses sandbox URL when not production', async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ token: 't', redirect_url: 'r', status_code: '200', status_message: 'ok' }), { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		await createSnapTransaction(sandboxPlatform, 'ord-2', 1000);
		const [url] = fetchMock.mock.calls[0] as unknown as [string];
		expect(url).toBe('https://app.sandbox.midtrans.com/snap/v1/transactions');
	});

	it('omits optional customer/items when absent', async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ token: 't', redirect_url: 'r', status_code: '200' }), { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		await createSnapTransaction(sandboxPlatform, 'ord-3', 750);
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, any];
		const payload = JSON.parse(init.body);
		expect(payload.customer_details).toBeUndefined();
		expect(payload.item_details).toBeUndefined();
	});

	it('throws on non-ok response', async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ status_code: '400', status_message: 'Bad request' }), { status: 400 })
		);
		vi.stubGlobal('fetch', fetchMock);
		await expect(createSnapTransaction(sandboxPlatform, 'ord-4', 100)).rejects.toThrow('Bad request');
	});

	it('throws when server key missing', async () => {
		await expect(createSnapTransaction({ env: {} } as any, 'ord-5', 100)).rejects.toThrow('MIDTRANS_SERVER_KEY not configured');
	});
});