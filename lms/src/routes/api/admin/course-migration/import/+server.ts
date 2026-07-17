import { jsonResponse, getDB } from '$lib/server/d1';

/** POST /api/admin/course-migration/import — import course JSON into current tenant */
export async function POST({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: any;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const targetTenantId = locals.tenant?.id || 'default';

		// Accept multipart file or JSON body
		let payload: any;
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('multipart/form-data')) {
			const form = await request.formData();
			const file = form.get('file');
			if (!file || typeof file === 'string') {
				return jsonResponse({ success: false, error: 'File course diperlukan' }, 400);
			}
			const text = await (file as File).text();
			payload = JSON.parse(text);
		} else {
			payload = await request.json();
		}

		if (!payload.tables || typeof payload.tables !== 'object') {
			return jsonResponse({ success: false, error: 'Format tidak valid — properti "tables" diperlukan' }, 400);
		}

		const tables = payload.tables;

		// Step 1: Collect old → new ID mappings
		type IdMap = Record<string, string>;
		const courseIdMap: IdMap = {};
		const offeringIdMap: IdMap = {};
		const lessonIdMap: IdMap = {};
		const cbIdMap: IdMap = {};
		const qbIdMap: IdMap = {};
		const assessmentIdMap: IdMap = {};
		const assignmentIdMap: IdMap = {};

		function newId(): string {
			// Generate a short unique ID
			const hex = 'abcdef0123456789';
			let id = '';
			for (let i = 0; i < 12; i++) id += hex[Math.floor(Math.random() * 16)];
			return id;
		}

		function remapRow(row: any, idMap: IdMap): any {
			if (row.id && idMap[row.id]) {
				row.id = idMap[row.id];
			}
			if (row.tenant_id) {
				row.tenant_id = targetTenantId;
			}
			return row;
		}

		// Step 2: Remap all IDs with new ones
		const newTables: Record<string, any[]> = {};

		// courses
		if (tables.courses) {
			newTables.courses = tables.courses.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				courseIdMap[oldId] = newIdVal;
				return { ...row, id: newIdVal, tenant_id: targetTenantId };
			});
		}

		// course_offerings
		if (tables.course_offerings) {
			newTables.course_offerings = tables.course_offerings.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				offeringIdMap[oldId] = newIdVal;
				return {
					...row,
					id: newIdVal,
					course_id: row.course_id ? (courseIdMap[row.course_id] || row.course_id) : null,
					tenant_id: targetTenantId,
				};
			});
		}

		// content_blocks
		if (tables.content_blocks) {
			newTables.content_blocks = tables.content_blocks.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				cbIdMap[oldId] = newIdVal;
				return { ...row, id: newIdVal, tenant_id: targetTenantId };
			});
		}

		// lessons
		if (tables.lessons) {
			newTables.lessons = tables.lessons.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				lessonIdMap[oldId] = newIdVal;
				return {
					...row,
					id: newIdVal,
					course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
					content_block_id: row.content_block_id ? (cbIdMap[row.content_block_id] || row.content_block_id) : null,
					tenant_id: targetTenantId,
				};
			});
		}

		// lesson_content_blocks
		if (tables.lesson_content_blocks) {
			newTables.lesson_content_blocks = tables.lesson_content_blocks.map((row: any) => ({
				...row,
				id: row.id || newId(),
				lesson_id: row.lesson_id ? (lessonIdMap[row.lesson_id] || row.lesson_id) : null,
				content_block_id: row.content_block_id ? (cbIdMap[row.content_block_id] || row.content_block_id) : null,
				tenant_id: targetTenantId,
			}));
		}

		// question_bank
		if (tables.question_bank) {
			newTables.question_bank = tables.question_bank.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				qbIdMap[oldId] = newIdVal;
				return {
					...row,
					id: newIdVal,
					course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
					tenant_id: targetTenantId,
				};
			});
		}

		// assessments
		if (tables.assessments) {
			newTables.assessments = tables.assessments.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				assessmentIdMap[oldId] = newIdVal;
				return {
					...row,
					id: newIdVal,
					course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
					content_block_id: row.content_block_id ? (cbIdMap[row.content_block_id] || row.content_block_id) : null,
					tenant_id: targetTenantId,
				};
			});
		}

		// assessment_questions
		if (tables.assessment_questions) {
			newTables.assessment_questions = tables.assessment_questions.map((row: any) => ({
				...row,
				assessment_id: row.assessment_id ? (assessmentIdMap[row.assessment_id] || row.assessment_id) : null,
				question_id: row.question_id ? (qbIdMap[row.question_id] || row.question_id) : null,
			}));
		}

		// assignments
		if (tables.assignments) {
			newTables.assignments = tables.assignments.map((row: any) => {
				const oldId = row.id;
				const newIdVal = newId();
				assignmentIdMap[oldId] = newIdVal;
				return {
					...row,
					id: newIdVal,
					course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
					content_block_id: row.content_block_id ? (cbIdMap[row.content_block_id] || row.content_block_id) : null,
					tenant_id: targetTenantId,
				};
			});
		}

		// prerequisites
		if (tables.prerequisites) {
			newTables.prerequisites = tables.prerequisites.map((row: any) => ({
				...row,
				id: row.id || newId(),
				course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
				prerequisite_id: row.prerequisite_id ? (lessonIdMap[row.prerequisite_id] || row.prerequisite_id) : null,
				dependent_id: row.dependent_id ? (lessonIdMap[row.dependent_id] || row.dependent_id) : null,
				tenant_id: targetTenantId,
			}));
		}

		// calendar_events
		if (tables.calendar_events) {
			newTables.calendar_events = tables.calendar_events.map((row: any) => ({
				...row,
				id: row.id || newId(),
				course_offering_id: row.course_offering_id ? (offeringIdMap[row.course_offering_id] || row.course_offering_id) : null,
				tenant_id: targetTenantId,
			}));
		}

		// Step 3: Insert in dependency order
		const insertOrder = [
			'courses', 'content_blocks', 'course_offerings', 'lessons',
			'lesson_content_blocks', 'question_bank', 'assessments',
			'assessment_questions', 'assignments', 'prerequisites',
			'calendar_events',
		];

		const results: Record<string, { attempted: number; inserted: number; errors: string[] }> = {};
		let totalAttempted = 0;
		let totalInserted = 0;

		for (const tableName of insertOrder) {
			const rows = newTables[tableName];
			if (!rows || rows.length === 0) continue;

			const tableResult = { attempted: 0, inserted: 0, errors: [] as string[] };

			for (const row of rows) {
				tableResult.attempted++;
				totalAttempted++;

				const columns = Object.keys(row);
				const placeholders = columns.map(() => '?').join(', ');
				const values = columns.map((c) => row[c]);
				const colList = columns.map((c) => `"${c}"`).join(', ');

				try {
					const stmt = db
						.prepare(`INSERT OR IGNORE INTO "${tableName}" (${colList}) VALUES (${placeholders})`)
						.bind(...values);
					const res = await stmt.run();
					if (res.meta && typeof res.meta.changes === 'number') {
						tableResult.inserted += res.meta.changes;
						totalInserted += res.meta.changes;
					}
				} catch (e: unknown) {
					const msg = e instanceof Error ? e.message : String(e);
					tableResult.errors.push(msg);
				}
			}

			results[tableName] = tableResult;
		}

		return jsonResponse({
			success: true,
			data: {
				targetTenantId,
				totalAttempted,
				totalInserted,
				details: results,
				offeringNewId: offeringIdMap[Object.keys(offeringIdMap)[0]],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
