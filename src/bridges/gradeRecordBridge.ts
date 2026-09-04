import type { GradeRecord } from "../types/grades";

// Phase 3D - Grade Management Bridge. `data/grades.ts` reads this plain,
// synchronous snapshot instead of importing ProfessorGradesContext directly
// - the Student Portal stays unaware that context exists, same pattern as
// bridges/assignmentBridge.ts. Kept in sync by bridges/GradeBridgeSync.tsx,
// the only piece of this bridge that touches React Context, and only ever
// contains courses the signed-in Character has been confidently matched to
// (see bridges/gradeBridge.ts's name-match rule) - never another
// student's grade.
export interface BridgedCourseGrade {
  currentGrade: string;
  percentage: number;
}

let bridgedCourseGrades: Record<string, BridgedCourseGrade> = {};

export function setBridgedCourseGrades(next: Record<string, BridgedCourseGrade>): void {
  bridgedCourseGrades = next;
}

// `status`/`remarks` are deliberately left as seeded: one graded assignment
// isn't proof the whole course is "Completed", and inventing new remarks
// text would be fabrication.
export function applyCourseGradeBridge(record: GradeRecord): GradeRecord {
  const bridged = bridgedCourseGrades[record.courseId];
  if (!bridged) return record;
  return { ...record, currentGrade: bridged.currentGrade, percentage: bridged.percentage };
}
