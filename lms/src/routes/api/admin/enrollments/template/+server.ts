export async function GET(): Promise<Response> {
	const csv = `email,role
student1@example.com,student
student2@example.com,student
ta@example.com,ta`;

	return new Response(csv, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': 'attachment; filename="bulk-enroll-template.csv"',
		},
	});
}
