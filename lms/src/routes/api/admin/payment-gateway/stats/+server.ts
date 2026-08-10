import { json } from '@sveltejs/kit';
import { PaymentStatsRepository } from '$lib/repositories/payment-gateway';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const academicYear = url.searchParams.get('academicYear') || undefined;
		const data = await PaymentStatsRepository.getPaymentStats(platform, tenantId, academicYear);
		return json({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
