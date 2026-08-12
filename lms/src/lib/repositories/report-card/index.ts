// Report-card repository split — inheritance chain:
// Types > Templates > Batches > Cards > Sections > Comments
export { ReportCardTypes } from './types.repository';
export { ReportCardTemplatesRepository } from './templates.repository';
export { ReportCardBatchesRepository } from './batches.repository';
export { ReportCardCardsRepository } from './cards.repository';
export { ReportCardSectionsRepository } from './sections.repository';
export { ReportCardCommentsRepository } from './comments.repository';
// Backward-compat: ReportCardRepository = most-derived class (Comments)
export { ReportCardCommentsRepository as ReportCardRepository } from './comments.repository';
export type {
	ReportCardTemplate,
	ReportCardTemplateInput,
	ReportCardTemplateUpdate,
	ReportCardBatch,
	ReportCardBatchInput,
	ReportCard,
	ReportCardSection,
	ReportCardSectionInput,
	TeacherComment,
	TeacherCommentInput,
	TeacherCommentUpdate
} from './types.repository';
