import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';

const timestamps = {
	created_at: text('created_at').default('datetime(\'now\')'),
	updated_at: text('updated_at'),
};

export const schoolLevels = sqliteTable('school_levels', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	educationLevel: text('education_level').default('menengah'),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const gradeLevels = sqliteTable('grade_levels', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	schoolLevelId: text('school_level_id').notNull(),
	name: text('name').notNull(),
	sequence: integer('sequence').notNull(),
	semesterCount: integer('semester_count').default(2),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const majors = sqliteTable('majors', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	name: text('name').notNull(),
	code: text('code'),
	type: text('type').default('umum'),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const classes = sqliteTable('classes', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	gradeLevelId: text('grade_level_id').notNull(),
	majorId: text('major_id'),
	name: text('name').notNull(),
	code: text('code'),
	academicPeriodId: text('academic_period_id'),
	homeroomTeacherId: text('homeroom_teacher_id'),
	room: text('room'),
	shift: text('shift').default('pagi'),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const classMembers = sqliteTable('class_members', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	classId: text('class_id').notNull(),
	userId: text('user_id').notNull(),
	role: text('role').default('student'),
	status: text('status').default('active'),
	nis: text('nis'),
	nisn: text('nisn'),
	joinedAt: text('joined_at').default('datetime(\'now\')'),
	leftAt: text('left_at'),
}, (table) => ({
	classUserUnique: uniqueIndex('idx_class_members_class_user').on(table.classId, table.userId),
}));

export const subjects = sqliteTable('subjects', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	name: text('name').notNull(),
	code: text('code'),
	curriculum: text('curriculum').default('k13'),
	type: text('type').default('wajib'),
	majorId: text('major_id'),
	gradeLevelId: text('grade_level_id'),
	groupName: text('group_name'),
	description: text('description'),
	minHoursPerWeek: integer('min_hours_per_week'),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const kompetensiDasar = sqliteTable('kompetensi_dasar', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	subjectId: text('subject_id').notNull(),
	code: text('code').notNull(),
	type: text('type').notNull(),
	competenceType: text('competence_type').notNull(),
	description: text('description').notNull(),
	gradeLevelId: text('grade_level_id'),
	semester: integer('semester'),
	topics: text('topics'),
	createdAt: text('created_at').default('datetime(\'now\')'),
});

export const classSubjects = sqliteTable('class_subjects', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull().references(() => tenants.id),
	classId: text('class_id').notNull(),
	subjectId: text('subject_id').notNull(),
	teacherId: text('teacher_id').notNull(),
	totalHoursPerWeek: integer('total_hours_per_week'),
	semester: integer('semester').notNull(),
	status: text('status').default('active'),
	kdList: text('kd_list'),
	createdAt: text('created_at').default('datetime(\'now\')'),
}, (table) => ({
	classSubjectSemesterUnique: uniqueIndex('idx_class_subjects_unique').on(table.classId, table.subjectId, table.semester),
}));
