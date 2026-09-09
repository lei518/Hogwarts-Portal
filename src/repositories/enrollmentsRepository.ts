import type { EnrollmentsRepository } from "./interfaces/repositoryTypes";
import { ensureEnrolled, listEnrollments } from "../services/supabase";

// Phase 2 - Real Academic Workflow. The live source of "which courses is
// this student actually enrolled in" - see
// supabase/migrations/0005_academic_workflow.sql. `ensureEnrolled` is
// called once per eligible course when a student's own academic data loads
// (see context/AcademicDataContext.tsx) - idempotent, RLS only lets a
// student enroll themselves.
export const enrollmentsRepository: EnrollmentsRepository = {
  ensureEnrolled: (courseId, studentUserId) => ensureEnrolled(courseId, studentUserId),
  getAll: () => listEnrollments(),
};
