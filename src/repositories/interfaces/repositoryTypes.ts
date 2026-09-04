// Phase 5A - Repository Layer. One interface per domain, grouped in this
// single file the same way types/professorPortal.ts and types/adminPortal.ts
// already group several related interfaces together - these are contracts
// only (no logic), so a per-file split would just be ceremony.
//
// Phase 5B: every method here now returns a Promise. Nothing queries a real
// network yet (see repositories/*.ts - each still reads today's seed data,
// synchronously available, just wrapped in `async`), but this is the
// contract Phase 5C's Supabase-backed implementations will satisfy without
// any interface change - only which object gets assigned to the exported
// singleton in repositories/*.ts changes then.
import type { Assignment, Course, ScheduleEntry } from "../../types/academics";
import type { GradeRecord } from "../../types/grades";
import type { Announcement, CalendarEvent, Professor } from "../../types/resources";
import type { Student } from "../../data/students";
import type { Book } from "../../data/books";
import type {
  ManagedAssignment,
  OfficeHour,
  ProfessorAnnouncement,
  ProfessorProfile,
  StudentRosterEntry,
  StudentSubmission,
  TeachingCourse,
} from "../../types/professorPortal";
import type {
  AccountStatus,
  AdminProfile,
  AdminUserAccount,
  CalendarDraft,
  CreateAccountInput,
  HousePointAdjustment,
  ResourceRequest,
  ServiceRequest,
} from "../../types/adminPortal";

export interface CoursesRepository {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | undefined>;
}

export interface AssignmentsRepository {
  getAll(): Promise<Assignment[]>;
  getById(id: string): Promise<Assignment | undefined>;
  getForCourse(courseId: string): Promise<Assignment[]>;
}

export interface GradesRepository {
  getAll(): Promise<GradeRecord[]>;
  getForCourse(courseId: string): Promise<GradeRecord | undefined>;
}

export interface StudentsRepository {
  getAll(): Promise<Student[]>;
  getById(id: string): Promise<Student | undefined>;
}

export interface ProfessorsRepository {
  getAll(): Promise<Professor[]>;
  getById(id: string): Promise<Professor | undefined>;
  getCoursesForProfessor(professorId: string): Promise<Course[]>;
}

export interface AnnouncementsRepository {
  getAll(): Promise<Announcement[]>;
  getById(id: string): Promise<Announcement | undefined>;
}

export interface LibraryRepository {
  getAll(): Promise<Book[]>;
  getById(id: string): Promise<Book | undefined>;
}

export interface CalendarRepository {
  getAll(): Promise<CalendarEvent[]>;
  getById(id: string): Promise<CalendarEvent | undefined>;
}

export interface SchedulesRepository {
  getForYear(year: number): Promise<ScheduleEntry[]>;
}

export interface ProfessorPortalRepository {
  // Unchanged since Phase 5A - bridges/assignmentBridge.ts and
  // bridges/GradeBridgeSync.tsx depend on these two exactly as they are;
  // see professorPortalRepository.ts's own comment on why they resolve the
  // reference persona rather than the authenticated session's professor.
  getProfile(): Promise<ProfessorProfile>;
  getTeachingCourseById(id: string): Promise<TeachingCourse | undefined>;

  // Authentication Foundation (Phase 6B) - the professor-scoped reads
  // AuthenticatedProfessorContext and utils/professorScope.ts's hooks go
  // through, so no Professor page imports data/professorPortal.ts directly.
  getProfileByDisplayName(displayName: string): Promise<ProfessorProfile | undefined>;
  getTeachingCoursesForProfessor(professorId: string): Promise<TeachingCourse[]>;
  getOfficeHoursForProfessor(professorId: string): Promise<OfficeHour[]>;
  getAnnouncementsForProfessor(professorId: string): Promise<ProfessorAnnouncement[]>;
  getRosterForTeachingCourse(teachingCourseId: string): Promise<StudentRosterEntry[]>;
}

export interface ManagedAssignmentsRepository {
  getAll(): Promise<ManagedAssignment[]>;
}

export interface StudentSubmissionsRepository {
  getAll(): Promise<StudentSubmission[]>;
}

// Covers exactly what AdminContext seeds its five useState calls from -
// same "only what's consumed" rule as ProfessorPortalRepository above.
export interface AdminRepository {
  getProfile(): Promise<AdminProfile>;
  getAccounts(): Promise<AdminUserAccount[]>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getCalendarDrafts(): Promise<CalendarDraft[]>;
  getHousePointAdjustments(): Promise<HousePointAdjustment[]>;
  getResourceRequests(): Promise<ResourceRequest[]>;

  // Authentication Foundation (Phase 6C) - the admin-scoped read
  // AuthenticatedAdminContext goes through, mirroring
  // ProfessorPortalRepository.getProfileByDisplayName exactly.
  getProfileByDisplayName(displayName: string): Promise<AdminProfile | undefined>;

  // Account Creation (Phase 6D) - the first real write in this
  // repository. One generic method rather than three near-duplicates
  // (createStudentAccount/createProfessorAccount/createAdminAccount),
  // matching how AccountRole already unifies all three roles as one type
  // everywhere else in this model (AdminUserAccount.role, setAccountStatus).
  // Delegates to services/supabase.ts's adminCreateAccount, which is the
  // only thing in this codebase allowed to talk to the privileged Edge
  // Function - see that file's own comment.
  createAccount(input: CreateAccountInput): Promise<AdminUserAccount>;

  // Account Status (Phase 6E) - one method instead of separate
  // enable()/disable()/lock()/unlock() methods, same "unify by parameter,
  // not by method name" choice createAccount already made over three
  // per-role methods. `accountId` here must be the real Supabase Auth
  // user id (AdminUserAccount.userId), not AdminUserAccount.id - AdminContext
  // resolves that before calling down, since this repository has no
  // account list of its own to look one up from.
  updateAccountStatus(accountId: string, status: AccountStatus): Promise<void>;

  // Administrator-Initiated Password Reset (Phase 6F) - one method, same
  // "accountId here must be the real Supabase Auth user id" contract as
  // updateAccountStatus above; AdminContext resolves it before calling
  // down.
  resetAccountPassword(accountId: string, newPassword: string): Promise<void>;

  // Account Deletion (Phase 6G) - one method, same "accountId here must be
  // the real Supabase Auth user id" contract as updateAccountStatus and
  // resetAccountPassword above; AdminContext resolves it before calling
  // down.
  deleteAccount(accountId: string): Promise<void>;
}
