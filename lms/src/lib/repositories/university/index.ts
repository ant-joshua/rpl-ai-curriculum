// Barrel: university repositories
// Split from university.repository.ts (was 582 lines / 41 methods)
// Inheritance chain:
//   UniversityFacultiesRepository <- Semesters <- Courses
//   <- Kelas <- KRS <- UniversityRepository (final)
export { UniversityRepository } from './transcript.repository';
export { UniversityFacultiesRepository } from './faculties.repository';
export { UniversitySemestersRepository } from './semesters.repository';
export { UniversityCoursesRepository } from './courses.repository';
export { UniversityKelasRepository } from './kelas.repository';
export { UniversityKRSRepository } from './krs.repository';

export type { FacultyRow, StudyProgramRow } from './faculties.repository';
export type { AcademicSemesterRow } from './semesters.repository';
export type { CourseRow } from './courses.repository';
export type { KelasKuliahRow } from './kelas.repository';
export type { KRSRow, KRSItemRow } from './krs.repository';
export type { TranscriptRecordRow } from './transcript.repository';
