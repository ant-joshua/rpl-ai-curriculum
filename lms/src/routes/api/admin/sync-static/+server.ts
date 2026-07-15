import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { parseMarkdown } from '$lib/utils/markdown';
import { modules } from '$lib/stores/modules';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), '..');

interface SyncResult {
	courses: number;
	offerings: number;
	lessons: number;
	contentBlocks: number;
	errors: string[];
}

export async function POST({ platform, request }: { platform: App.Platform; request: Request }): Promise<Response> {
	try {
		// Admin auth check
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		}
		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Invalid session' }, 401);
		}
		if (session.user.email !== 'midoryai@gmail.com') {
			const db = getDB(platform);
			const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
			if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
				return jsonResponse({ success: false, error: 'Forbidden' }, 403);
			}
		}

		const db = getDB(platform);
		const result: SyncResult = { courses: 0, offerings: 0, lessons: 0, contentBlocks: 0, errors: [] };

		for (const mod of modules) {
			try {
				const readmePath = join(CONTENT_DIR, mod.dirName, 'README.md');
				let courseDescription = mod.description;
				let courseBodyHtml = '';

				if (existsSync(readmePath)) {
					const md = readFileSync(readmePath, 'utf-8');
					courseBodyHtml = parseMarkdown(md);
				}

				// Upsert course
				const courseId = mod.slug;
				const existingCourse = await db.prepare('SELECT id FROM courses WHERE id = ?').bind(courseId).first<any>();

				if (existingCourse) {
					await db.prepare(
						`UPDATE courses SET title = ?, description = ?, level = ?, updated_at = datetime('now') WHERE id = ?`
					).bind(
						mod.title,
						courseDescription,
						mod.level.toLowerCase(),
						courseId
					).run();
				} else {
					await db.prepare(
						`INSERT INTO courses (id, title, slug, description, level, created_at, updated_at)
						 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
					).bind(
						courseId,
						mod.title,
						mod.slug,
						courseDescription,
						mod.level.toLowerCase()
					).run();
				}
				result.courses++;

				// Upsert course_offering
				const offeringId = `${mod.slug}-default`;
				const existingOffering = await db.prepare('SELECT id FROM course_offerings WHERE id = ?').bind(offeringId).first<any>();

				if (existingOffering) {
					await db.prepare(
						`UPDATE course_offerings SET name = ?, status = 'active', updated_at = datetime('now') WHERE id = ?`
					).bind(mod.title, offeringId).run();
				} else {
					await db.prepare(
						`INSERT INTO course_offerings (id, course_id, name, code, status, created_at, updated_at)
						 VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`
					).bind(offeringId, courseId, mod.title, mod.slug.toUpperCase()).run();
				}
				result.offerings++;

				// Create lesson + content blocks tree for each session
				for (let si = 0; si < mod.sessions.length; si++) {
					const sess = mod.sessions[si];
					const sessionPath = join(CONTENT_DIR, mod.dirName, `${sess.id}.md`);
					let bodyHtml = '';
					let bodyText = '';

					if (existsSync(sessionPath)) {
						const md = readFileSync(sessionPath, 'utf-8');
						bodyHtml = parseMarkdown(md);
						bodyText = md; // store raw markdown in body
					}

					// Enable CHECK constraint bypass for 'lesson' type
					await db.prepare(`PRAGMA ignore_check_constraints = ON`).run();

					// 1. Create/update lesson content_block (type='lesson')
					const lessonBlockId = `lesson-${sess.id}`;
					const existingLessonBlock = await db.prepare('SELECT id FROM content_blocks WHERE id = ?').bind(lessonBlockId).first<any>();

					if (existingLessonBlock) {
						await db.prepare(
							`UPDATE content_blocks
							 SET type = 'lesson', title = ?, slug = ?, order_index = ?, duration_min = 30, is_optional = 0, visibility = 'published', body = ?, body_html = ?, course_offering_id = ?, course_id = ?, updated_at = datetime('now')
							 WHERE id = ?`
						).bind(
							sess.title,
							sess.id,
							si,
							bodyText,
							bodyHtml,
							offeringId,
							courseId,
							lessonBlockId
						).run();
					} else {
						await db.prepare(
							`INSERT INTO content_blocks (id, course_offering_id, course_id, type, title, slug, order_index, duration_min, is_optional, visibility, body, body_html, created_at, updated_at)
							 VALUES (?, ?, ?, 'lesson', ?, ?, ?, 30, 0, 'published', ?, ?, datetime('now'), datetime('now'))`
						).bind(
							lessonBlockId,
							offeringId,
							courseId,
							sess.title,
							sess.id,
							si,
							bodyText,
							bodyHtml
						).run();
					}
					result.contentBlocks++;

					// 2. Create/update text content_block (child of lesson block)
					const textBlockId = `cb-${sess.id}`;
					const existingTextBlock = await db.prepare('SELECT id FROM content_blocks WHERE id = ?').bind(textBlockId).first<any>();

					if (existingTextBlock) {
						await db.prepare(
							`UPDATE content_blocks
							 SET type = 'text', title = ?, body = ?, body_html = ?, meta = '{}', order_index = ?, visibility = 'published', parent_id = ?, course_offering_id = ?, course_id = ?, updated_at = datetime('now')
							 WHERE id = ?`
						).bind(
							sess.title,
							bodyText,
							bodyHtml,
							si,
							lessonBlockId,
							offeringId,
							courseId,
							textBlockId
						).run();
					} else {
						await db.prepare(
							`INSERT INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, parent_id, course_offering_id, course_id, created_at, updated_at)
							 VALUES (?, 'text', ?, ?, ?, '{}', ?, 'published', ?, ?, ?, datetime('now'), datetime('now'))`
						).bind(
							textBlockId,
							sess.title,
							bodyText,
							bodyHtml,
							si,
							lessonBlockId,
							offeringId,
							courseId
						).run();
					}
					result.contentBlocks++;

					// 3. Create/update lesson (legacy backward compat)
					const lessonId = `lesson-${sess.id}`;
					const existingLesson = await db.prepare('SELECT id FROM lessons WHERE id = ?').bind(lessonId).first<any>();

					if (existingLesson) {
						await db.prepare(
							`UPDATE lessons
							 SET title = ?, slug = ?, content_block_id = ?, order_index = ?, status = 'published', updated_at = datetime('now')
							 WHERE id = ?`
						).bind(
							sess.title,
							sess.id,
							textBlockId,
							si,
							lessonId
						).run();
					} else {
						await db.prepare(
							`INSERT INTO lessons (id, course_offering_id, content_block_id, title, slug, order_index, duration_minutes, is_optional, status, created_at, updated_at)
							 VALUES (?, ?, ?, ?, ?, ?, 30, 0, 'published', datetime('now'), datetime('now'))`
						).bind(
							lessonId,
							offeringId,
							textBlockId,
							sess.title,
							sess.id,
							si
						).run();
					}
					result.lessons++;
				}
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				result.errors.push(`Module ${mod.slug}: ${msg}`);
			}
		}

		return jsonResponse({ success: true, data: result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
