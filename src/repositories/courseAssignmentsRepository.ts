import { listCourseAssignments, upsertCourseAssignment, type CourseAssignmentRow } from "../services/supabase";

// Phase 7A - Live Academic Data. The one live source of "who teaches this
// course" - see coursesRepository.ts, which joins this against the seeded
// course catalog. Writes are admin-only (see the RLS policy in
// supabase/migrations/0004_academic_live_data.sql), enforced server-side,
// not just by the Admin page that calls assign().
export const courseAssignmentsRepository = {
  getAll: (): Promise<CourseAssignmentRow[]> => listCourseAssignments(),
  assign: (courseId: string, professorUserId: string | null): Promise<void> =>
    upsertCourseAssignment(courseId, professorUserId),
};
