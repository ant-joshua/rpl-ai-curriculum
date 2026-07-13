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

				// Create lessons + content blocks for each session
				for (let si = 0; si < mod.sessions.length; si++) {
					const sess = mod.sessions[si];
					const sessionPath = join(CONTENT_DIR, mod.dirName, `${sess.id}.md`);
					let bodyHtml = '';
					let bodyText = '';

					if (existsSync(sessionPath)) {
						const md = readFileSync(sessionPath, 'utf-8');
						bodyHtml = parseMarkdown(md);
						bodyText = md; // store raw markdown in body (TipTap-like JSON not available from static files)
					}

					// Create content_block
					const contentBlockId = `cb-${sess.id}`;
					const existingCb = await db.prepare('SELECT id FROM content_blocks WHERE id = ?').bind(contentBlockId).first<any>();

					if (existingCb) {
						await db.prepare(
							`UPDATE content_blocks
							 SET type = 'text', title = ?, body = ?, body_html = ?, meta = '{}', order_index = ?, visibility = 'published', updated_at = datetime('now')
							 WHERE id = ?`
						).bind(
							sess.title,
							bodyText,
							bodyHtml,
							si,
							contentBlockId
						).run();
					} else {
						await db.prepare(
							`INSERT INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at)
							 VALUES (?, 'text', ?, ?, ?, '{}', ?, 'published', datetime('now'), datetime('now'))`
						).bind(
							contentBlockId,
							sess.title,
							bodyText,
							bodyHtml,
							si
						).run();
					}
					result.contentBlocks++;

					// Create lesson
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
							contentBlockId,
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
							contentBlockId,
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
