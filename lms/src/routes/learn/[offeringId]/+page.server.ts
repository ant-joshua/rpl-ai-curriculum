import { redirect } from '@sveltejs/kit';

export async function load({ params }: {
	params: Record<string, string>;
}) {
	// Redirect to syllabus view as the default landing tab
	throw redirect(302, `/learn/${params.offeringId}/syllabus`);
}
