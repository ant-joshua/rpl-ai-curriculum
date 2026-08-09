import { describe, it, expect } from 'vitest';
import { getBearerToken, getTokenFromRequest } from '../src/lib/server/auth';
import { getDeviceId, jsonResponse } from '../src/lib/server/d1';

describe('auth token extraction', () => {
	it('getBearerToken parses Authorization header', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Bearer abc123' } });
		expect(getBearerToken(req)).toBe('abc123');
	});

	it('getBearerToken returns null without Bearer prefix', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Basic abc' } });
		expect(getBearerToken(req)).toBeNull();
	});

	it('getBearerToken returns null on empty header', () => {
		const req = new Request('http://localhost');
		expect(getBearerToken(req)).toBeNull();
	});

	it('getTokenFromRequest prefers cookie over header', () => {
		const req = new Request('http://localhost', {
			headers: { Cookie: 'lms_token=cookie-token; foo=bar', Authorization: 'Bearer header-token' },
		});
		expect(getTokenFromRequest(req)).toBe('cookie-token');
	});

	it('getTokenFromRequest falls back to Bearer', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Bearer header-token' } });
		expect(getTokenFromRequest(req)).toBe('header-token');
	});

	it('getTokenFromRequest returns null with no auth', () => {
		const req = new Request('http://localhost');
		expect(getTokenFromRequest(req)).toBeNull();
	});
});

describe('d1 helpers', () => {
	it('getDeviceId reads x-device-id header', () => {
		const req = new Request('http://localhost', { headers: { 'x-device-id': 'dev-42' } });
		expect(getDeviceId(req)).toBe('dev-42');
	});

	it('jsonResponse serializes body and status', async () => {
		const res = jsonResponse({ success: true, data: 1 }, 201);
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.success).toBe(true);
		expect(body.data).toBe(1);
	});
});