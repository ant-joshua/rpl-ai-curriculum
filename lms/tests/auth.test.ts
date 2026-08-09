import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getBearerToken, getTokenFromRequest } from '../src/lib/server/auth.ts';
import { getDeviceId, jsonResponse } from '../src/lib/server/d1.ts';

describe('auth token extraction', () => {
	test('getBearerToken parses Authorization header', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Bearer abc123' } });
		assert.equal(getBearerToken(req), 'abc123');
	});

	test('getBearerToken returns null without Bearer prefix', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Basic abc' } });
		assert.equal(getBearerToken(req), null);
	});

	test('getBearerToken returns null on empty header', () => {
		const req = new Request('http://localhost');
		assert.equal(getBearerToken(req), null);
	});

	test('getTokenFromRequest prefers cookie over header', () => {
		const req = new Request('http://localhost', {
			headers: { Cookie: 'lms_token=cookie-token; foo=bar', Authorization: 'Bearer header-token' },
		});
		assert.equal(getTokenFromRequest(req), 'cookie-token');
	});

	test('getTokenFromRequest falls back to Bearer', () => {
		const req = new Request('http://localhost', { headers: { Authorization: 'Bearer header-token' } });
		assert.equal(getTokenFromRequest(req), 'header-token');
	});

	test('getTokenFromRequest returns null with no auth', () => {
		const req = new Request('http://localhost');
		assert.equal(getTokenFromRequest(req), null);
	});
});

describe('d1 helpers', () => {
	test('getDeviceId reads x-device-id header', () => {
		const req = new Request('http://localhost', { headers: { 'x-device-id': 'dev-42' } });
		assert.equal(getDeviceId(req), 'dev-42');
	});

	test('jsonResponse serializes body and status', async () => {
		const res = jsonResponse({ success: true, data: 1 }, 201);
		assert.equal(res.status, 201);
		const body = await res.json();
		assert.equal(body.success, true);
	});
});
