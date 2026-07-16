-- Migration 0060: Performance indexes for admin list APIs
-- Adds composite indexes on frequently queried columns to support
-- paginated admin list queries with ORDER BY created_at DESC.

CREATE INDEX IF NOT EXISTS idx_users_tenant_role_created ON users(tenant_id, role, created_at);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_offering ON enrollments(user_id, course_offering_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_offering_status ON enrollments(course_offering_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant_created ON enrollments(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_created ON activity_logs(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_tenant_subject_created ON attendance_sessions(tenant_id, class_subject_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_student ON attendance_records(session_id, student_id);

CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_offering_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_offering_order ON lessons(course_offering_id, order_index);

CREATE INDEX IF NOT EXISTS idx_assessments_offering_created ON assessments(course_offering_id, created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment_user ON assessment_submissions(assessment_id, user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_student_created ON invoices(tenant_id, student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_invoice_created ON payments(tenant_id, invoice_id, created_at);
