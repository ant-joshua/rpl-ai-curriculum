import { jsonResponse, getDB } from '$lib/server/d1';
import { sendEmail } from '$lib/server/email';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { application_id, action } = body; // action: 'approved' or 'rejected'

		if (!application_id || !action) {
			return jsonResponse({ success: false, error: 'application_id and action required' }, 400);
		}
		if (!['approved', 'rejected'].includes(action)) {
			return jsonResponse({ success: false, error: 'action must be approved or rejected' }, 400);
		}

		// Get application + user email
		const app = await db.prepare(
			'SELECT * FROM instructor_applications WHERE id = ?'
		).bind(application_id).first<any>();

		if (!app) {
			return jsonResponse({ success: false, error: 'Application not found' }, 404);
		}

		const applicant = await db.prepare('SELECT email, display_name FROM users WHERE id = ?')
			.bind(app.user_id).first<{ email: string; display_name: string }>();

		const now = new Date().toISOString();

		// Update application status
		await db.prepare(
			'UPDATE instructor_applications SET status = ?, updated_at = ? WHERE id = ?'
		).bind(action, now, application_id).run();

		if (action === 'approved') {
			// Activate user
			await db.prepare(
				'UPDATE users SET is_active = 1, role = ? WHERE id = ?'
			).bind('instructor', app.user_id).run();

			// If course_offering_id set, assign instructor
			if (app.course_offering_id) {
				await db.prepare(
					'UPDATE course_offerings SET instructor_id = ?, updated_at = ? WHERE id = ?'
				).bind(app.user_id, now, app.course_offering_id).run();
			}
		}

		// Send email notification to applicant
		if (applicant?.email) {
			if (action === 'approved') {
				await sendEmail(
					applicant.email,
					'Application Approved — RPL AI Curriculum',
					`Hi ${applicant.display_name || 'Instructor'},\n\nCongratulations! Your instructor application has been approved.\n\nYou can now log in and start managing your courses.\n\nRPL AI Curriculum`
				);
			} else {
				await sendEmail(
					applicant.email,
					'Application Status — RPL AI Curriculum',
					`Hi ${applicant.display_name || 'Instructor'},\n\nWe're sorry, but your instructor application was not approved at this time.\n\nIf you have questions, please contact support.\n\nRPL AI Curriculum`
				);
			}
		}

		return jsonResponse({ success: true, data: { id: application_id, status: action } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
