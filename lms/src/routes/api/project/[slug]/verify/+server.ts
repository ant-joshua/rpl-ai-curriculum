import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' } });
}

export async function POST({ params, request }: { params: { slug: string }; request: Request }): Promise<Response> {
	try {
		const body = await request.json() as { code: string; stepId: number; expectedElements?: string[] };
		const { code, stepId, expectedElements: clientElements } = body;

		if (!code) {
			return json({ success: false, passed: false, checks: [], message: 'Kode tidak boleh kosong' }, 400);
		}

		// Load project to get expected elements
		const baseUrl = new URL(request.url).origin;
		const projRes = await fetch(`${baseUrl}/content/projects.json`);
		const projects = await projRes.json() as any[];
		const project = projects.find((p: any) => p.slug === params.slug);
		if (!project) {
			return json({ success: false, passed: false, checks: [], message: 'Project tidak ditemukan' }, 404);
		}
		const step = project.steps.find((s: any) => s.id === stepId);
		if (!step) {
			return json({ success: false, passed: false, checks: [], message: 'Step tidak ditemukan' }, 404);
		}

		const expectedElements = step.expectedElements || [];
		const checks = expectedElements.map((el: string) => ({
			element: el,
			found: code.toLowerCase().includes(el.toLowerCase()),
		}));
		const allPassed = checks.every((c: { found: boolean }) => c.found);
		const foundCount = checks.filter((c: { found: boolean }) => c.found).length;

		let message = '';
		if (allPassed) {
			message = '✅ Semua elemen ditemukan! Lanjut ke step berikutnya.';
		} else {
			const missing = checks.filter((c: { found: boolean }) => !c.found).map((c: { element: string }) => c.element);
			message = `❌ Elemen yang belum ada: ${missing.join(', ')}. Cek ${foundCount}/${checks.length} lulus.`;
		}

		return json({ success: true, passed: allPassed, checks, message });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, passed: false, checks: [], message: msg }, 500);
	}
}
