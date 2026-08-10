// Barrel: exam scheduler repositories
// Split from exam-scheduler.repository.ts (was 989 lines / 39 methods)
// Inheritance chain preserves `new ExamSchedulerRepository(db, tenantId)` API:
//   ExamTypesRepository <- ExamRoomsRepository <- ExamExamsRepository
//   <- ExamAssignmentsRepository <- ExamParticipantsRepository
//   <- ExamConflictsRepository <- ExamSchedulerRepository
export { ExamSchedulerRepository } from './scheduler.repository';
export { ExamTypesRepository } from './types.repository';
export { ExamRoomsRepository } from './rooms.repository';
export { ExamExamsRepository } from './exams.repository';
export { ExamAssignmentsRepository } from './assignments.repository';
export { ExamParticipantsRepository } from './participants.repository';
export { ExamConflictsRepository } from './conflicts.repository';

export type { ExamType } from './types.repository';
export type { ExamRoom } from './rooms.repository';
export type { Exam } from './exams.repository';
export type { ExamRoomAssignment } from './assignments.repository';
export type { ExamParticipant } from './participants.repository';
export type { ExamConflict, ExamConflictDetail } from './conflicts.repository';
