// Barrel: repository aggregator (kept for legacy/compat)
// NOTE: no route imports this file directly — all routes import
// individual repos by path. tutor.repository.ts and bimbel.repository.ts
// were removed as dead code (0 callers).
export { TenantRepository } from './tenant.repository';
export { K13GradeRepository } from './k13-grade.repository';
export { RaporRepository } from './rapor.repository';
export { UniversityRepository } from './university';
export { ReportCardRepository } from './report-card.repository';
