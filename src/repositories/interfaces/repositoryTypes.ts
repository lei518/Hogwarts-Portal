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
import type { Assignment, Course, ScheduleEntry, Submission } from "../../types/academics";
import type { Announcement, AnnouncementType, AnnouncementVisibility, CalendarEvent, Professor } from "../../types/resources";
import type { Student } from "../../data/students";
import type { Book } from "../../data/books";
import type {
  ManagedAssignment,
  OfficeHour,
  ProfessorProfile,
  StudentRosterEntry,
  TeachingCourse,
} from "../../types/professorPortal";
import type {
  AccountStatus,
  AdminUserAccount,
  CalendarDraft,
  CreateAccountInput,
  HousePointAdjustment,
  ResourceRequest,
  ServiceRequest,
} from "../../types/adminPortal";
import type {
  BookLoanRow,
  BookRow,
  LostFoundItemRow,
  LostFoundStatus,
  MedicalRequestRow,
  MedicalRequestStatus,
  MessageRow,
  MessageType,
  PermitRow,
  PermitStatus,
  ServiceAssignmentRow,
  ServiceName,
} from "../../services/supabase";

export interface CoursesRepository {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | undefined>;
  // Phase 7A - Live Academic Data. Replaces data/professors.ts's
  // getCoursesForProfessor - courses a professor teaches is now a live
  // course_professor_assignments lookup, not a seeded inverse index.
  getForProfessor(professorUserId: string): Promise<Course[]>;
}

export interface AssignmentsRepository {
  getAll(): Promise<Assignment[]>;
  getById(id: string): Promise<Assignment | undefined>;
  getForCourse(courseId: string): Promise<Assignment[]>;
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

// Phase 6 - Communication & Administration System: real CRUD, not just a
// read-only list - see supabase/migrations/0007_announcements_and_service_assignments.sql.
export interface CreateAnnouncementRepoInput {
  title: string;
  content: string;
  announcementType: AnnouncementType;
  visibility: AnnouncementVisibility;
  courseId?: string;
  authorUserId: string;
  published?: boolean;
  expiresAt?: string;
}

export interface AnnouncementsRepository {
  getAll(): Promise<Announcement[]>;
  getById(id: string): Promise<Announcement | undefined>;
  create(input: CreateAnnouncementRepoInput): Promise<Announcement>;
  update(
    id: string,
    // `courseId` explicitly allows `null` (distinct from omitting the
    // field): switching an announcement from Course to School visibility
    // must clear course_id, not leave a stale value the table's own CHECK
    // constraint would then reject.
    updates: Partial<Omit<CreateAnnouncementRepoInput, "authorUserId" | "courseId">> & { courseId?: string | null }
  ): Promise<Announcement>;
  remove(id: string): Promise<void>;
  publish(id: string): Promise<Announcement>;
  unpublish(id: string): Promise<Announcement>;
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
  // Still used by bridges/GradeBridgeSync.tsx (see that file's own
  // comment) - Phase 7A: getProfile() returns a generic, non-fabricated
  // placeholder now, since professorProfiles no longer exists.
  getProfile(): Promise<ProfessorProfile>;
  getTeachingCourseById(id: string): Promise<TeachingCourse | undefined>;

  // Phase 7A - live, synthesized from course_professor_assignments + the
  // course catalog (see professorPortalRepository.ts's own comment);
  // getProfileByDisplayName is gone - identity resolution moved to
  // AuthenticatedProfessorContext reading the real signed-in user id
  // directly, no seeded-persona name match anymore.
  getTeachingCoursesForProfessor(professorId: string): Promise<TeachingCourse[]>;
  getOfficeHoursForProfessor(professorId: string): Promise<OfficeHour[]>;
  getRosterForTeachingCourse(teachingCourseId: string): Promise<StudentRosterEntry[]>;
}

export interface ManagedAssignmentsRepository {
  getAll(): Promise<ManagedAssignment[]>;
  // Phase 7A - genuine writes, persisted to the live `assignments` table
  // (see managedAssignmentsRepository.ts) so a Published assignment reaches
  // a different signed-in student's session, not just this professor's own
  // browser tab.
  create(professorUserId: string, input: Omit<ManagedAssignment, "id" | "status">): Promise<ManagedAssignment>;
  update(id: string, updates: Partial<Omit<ManagedAssignment, "id">>): Promise<ManagedAssignment>;
}

// Phase 2 - Real Academic Workflow. Backed by the live
// `assignment_submissions` table (see repositories/submissionsRepository.ts);
// RLS scopes getAll() to whoever's calling it (a student's own submissions,
// or a professor's/admin's gradeable ones) so one interface serves both
// portals.
export interface SubmissionsRepository {
  getAll(): Promise<Submission[]>;
  submit(input: { assignmentId: string; studentUserId: string; submissionText: string; dueDate: string }): Promise<Submission>;
  grade(id: string, input: { score: number; maxScore: number; feedback: string; gradedBy: string }): Promise<Submission>;
}

export interface EnrollmentsRepository {
  ensureEnrolled(courseId: string, studentUserId: string): Promise<void>;
  getAll(): Promise<{ studentUserId: string; courseId: string }[]>;
}

// Covers exactly what AdminContext seeds its five useState calls from -
// same "only what's consumed" rule as ProfessorPortalRepository above.
export interface AdminRepository {
  getAccounts(): Promise<AdminUserAccount[]>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getCalendarDrafts(): Promise<CalendarDraft[]>;
  getHousePointAdjustments(): Promise<HousePointAdjustment[]>;
  getResourceRequests(): Promise<ResourceRequest[]>;

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

// Phase 5 - Campus Services & Resource System. Owlery replaces the old
// per-character "Owl Post" local array with real cross-account messages
// (see supabase/migrations/0006_campus_services.sql). `listInbox`/
// `listSent` are a client-side split of one RLS-scoped query (own sent +
// own received), not two separate reads.
export interface MessagesRepository {
  listInbox(userId: string): Promise<MessageRow[]>;
  listSent(userId: string): Promise<MessageRow[]>;
  send(input: {
    senderId: string;
    receiverId: string;
    subject: string;
    content: string;
    messageType: MessageType;
    relatedService?: string;
    relatedId?: string;
  }): Promise<MessageRow>;
  markRead(id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

// Library Services - a real borrowing workflow backed by `books`/`book_loans`.
export interface BooksRepository {
  getAll(): Promise<BookRow[]>;
  create(input: { title: string; author: string; category: string; description: string; totalCopies: number }): Promise<BookRow>;
}

export interface LoansRepository {
  getAll(): Promise<BookLoanRow[]>;
  borrow(bookId: string, studentId: string): Promise<BookLoanRow>;
  return(id: string): Promise<BookLoanRow>;
}

// Hospital Wing appointment requests.
export interface MedicalRequestsRepository {
  getAll(): Promise<MedicalRequestRow[]>;
  create(input: { studentId: string; reason: string; requestedDate: string }): Promise<MedicalRequestRow>;
  updateStatus(id: string, status: MedicalRequestStatus, assignedStaff: string): Promise<MedicalRequestRow>;
}

// Hogsmeade visit permits.
export interface PermitsRepository {
  getAll(): Promise<PermitRow[]>;
  create(input: { studentId: string; visitDate: string; reason: string }): Promise<PermitRow>;
  updateStatus(id: string, status: PermitStatus, approvedBy: string): Promise<PermitRow>;
}

// Lost & Found reports.
export interface LostFoundRepository {
  getAll(): Promise<LostFoundItemRow[]>;
  report(input: { reportedBy: string; itemName: string; description: string; locationFound: string }): Promise<LostFoundItemRow>;
  updateStatus(id: string, status: LostFoundStatus, claimedBy?: string): Promise<LostFoundItemRow>;
}

// Phase 6 - Service Administration: which staff account is responsible for
// each campus service, admin-configurable instead of hardcoded or absent.
export interface ServiceAssignmentsRepository {
  getAll(): Promise<ServiceAssignmentRow[]>;
  assign(serviceName: ServiceName, staffUserId: string | null): Promise<ServiceAssignmentRow>;
}
