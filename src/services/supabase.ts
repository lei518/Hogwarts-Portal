import { createClient, FunctionsHttpError } from "@supabase/supabase-js";
import type { GameState, House } from "../types/game";
import { hydrateGameState } from "../utils/character";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

// Authentication Foundation (Phase 6A) - see
// supabase/migrations/0001_add_profile_role_and_active.sql. Phase 5 -
// Campus Services added four operational staff roles, see
// supabase/migrations/0006_campus_services.sql.
//
// Centralized role source of truth (Phase 6 role-system audit): every
// role-typed value in the app - UserRole, AccountRole (types/adminPortal.ts,
// a plain alias of UserRole), PortalRole (components/layout/navItems.ts,
// likewise an alias), dropdown options, RLS-mirrored role checks - derives
// from this one object instead of re-declaring the 7 role strings in
// multiple places, which had drifted before (navItems.ts's PortalRole used
// to be its own hand-typed union). `UserRole` is still the type everything
// imports; `ROLES` exists so call sites can write `ROLES.healer` instead of
// repeating the string literal "healer".
//
// Supabase Edge Functions run in a separate Deno runtime with no access to
// this module (they're deployed independently, not bundled by Vite), so
// supabase/functions/admin-create-account/index.ts necessarily keeps its
// own `ALLOWED_ROLES` array - keep the two in sync by hand when a role is
// added, renamed, or removed. Same reasoning applies to every `check (role
// in (...))` constraint in supabase/schema.sql/migrations - SQL can't
// import a TypeScript const either.
export const ROLES = {
  student: "student",
  professor: "professor",
  admin: "admin",
  librarian: "librarian",
  healer: "healer",
  caretaker: "caretaker",
  deputyHeadmaster: "deputy_headmaster",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

const USER_ROLES: readonly UserRole[] = Object.values(ROLES);

// Defensive, not merely decorative: the DB's own CHECK constraint already
// restricts this column, but a value from the network is still untyped
// until narrowed here - anything unrecognized is treated as "no role"
// rather than trusted as one of the three literals.
function toUserRole(value: string): UserRole | null {
  return (USER_ROLES as string[]).includes(value) ? (value as UserRole) : null;
}

const HOUSES: readonly House[] = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];

function toHouse(value: string | null): House | null {
  return value && (HOUSES as string[]).includes(value) ? (value as House) : null;
}

// University Portal Pivot (Phase 6N) - reuses ProfileAccountStatus (defined
// further below, next to Admin's own account-status Edge Function calls) -
// same three-state column, just read here for a user's own row via the
// existing "own profile" RLS policy, not the privileged admin-list path.
const PROFILE_STATUSES: readonly ProfileAccountStatus[] = ["Active", "Disabled", "Locked"];

function toProfileStatus(value: string): ProfileAccountStatus | null {
  return (PROFILE_STATUSES as readonly string[]).includes(value) ? (value as ProfileAccountStatus) : null;
}

export interface CloudProfile {
  displayName: string;
  role: UserRole | null;
  active: boolean;
  // University Portal Pivot (Phase 6N) - shown read-only on Settings; the
  // richer status a Suspended/Locked account actually has, alongside the
  // simple `active` boolean RoleGate already reads.
  status: ProfileAccountStatus | null;
  // Year-Based Onboarding (Phase 6L) - admin-assigned at account creation;
  // null for professor/admin accounts and for a self-service signup (see
  // supabase/migrations/0003_add_profile_year_and_house.sql's own comment).
  year: number | null;
  house: House | null;
}

export async function fetchCloudSave(userId: string): Promise<GameState | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("saves")
    .select("game_state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return hydrateGameState((data?.game_state as GameState | undefined) ?? null);
}

export async function upsertCloudSave(userId: string, state: GameState): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("saves")
    .upsert({ user_id: userId, game_state: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

const PROFILE_COLUMNS = "display_name, role, active, status, year, house";

function toCloudProfile(data: {
  display_name: string;
  role: string;
  active: boolean;
  status: string;
  year: number | null;
  house: string | null;
}): CloudProfile {
  return {
    displayName: data.display_name,
    role: toUserRole(data.role),
    active: data.active,
    status: toProfileStatus(data.status),
    year: data.year,
    house: toHouse(data.house),
  };
}

export async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toCloudProfile(data);
}

export async function createProfile(userId: string, displayName: string): Promise<CloudProfile> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .insert({ user_id: userId, display_name: displayName })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return toCloudProfile(data);
}

// Admin Account Creation (Phase 6D). Creating another user's Auth account
// and a profiles row for a user_id that isn't the caller's own both
// require service_role - a key this client is never given (see
// supabase/functions/admin-create-account/index.ts's own comment on why).
// This client-side call only ever carries the anon key plus the current
// admin's own session token (functions.invoke forwards it automatically);
// the Edge Function is the actual privileged boundary and re-checks the
// caller is an active admin itself, so nothing here can be trusted to
// "already be gated by RoleGate" - it isn't, by design.
export interface AdminCreateAccountInput {
  displayName: string;
  email: string;
  password: string;
  role: UserRole;
  // Year-Based Onboarding (Phase 6L) - only meaningful for role "student";
  // see the Edge Function's own validation for exactly when each is
  // required/rejected.
  year?: number;
  house?: House;
}

export interface AdminCreateAccountResult {
  userId: string;
  displayName: string;
  role: UserRole;
  year: number | null;
  house: House | null;
}

async function extractFunctionErrorMessage(error: unknown): Promise<string | null> {
  if (!(error instanceof FunctionsHttpError)) return null;
  try {
    const body = await error.context.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

export async function adminCreateAccount(input: AdminCreateAccountInput): Promise<AdminCreateAccountResult> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-create-account", { body: input });
  if (error) {
    const message = (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not create the account.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Account creation did not return a user id.");
  }
  return {
    userId: data.userId,
    displayName: data.displayName,
    role: data.role,
    year: data.year ?? null,
    house: toHouse(data.house ?? null),
  };
}

// Account Status (Phase 6E). Same shape as adminCreateAccount above -
// updating another user's profiles.status requires service_role, so this
// client call only ever carries the anon key + the current admin's own
// session token, and supabase/functions/admin-update-account-status is
// the actual privileged boundary (see its own comment).
export type ProfileAccountStatus = "Active" | "Disabled" | "Locked";

export interface AdminUpdateAccountStatusResult {
  userId: string;
  displayName: string;
  role: UserRole;
  status: ProfileAccountStatus;
}

export async function adminUpdateAccountStatus(
  userId: string,
  status: ProfileAccountStatus
): Promise<AdminUpdateAccountStatusResult> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-update-account-status", {
    body: { userId, status },
  });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not update the account's status.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Status update did not return an account.");
  }
  return { userId: data.userId, displayName: data.displayName, role: data.role, status: data.status };
}

// Administrator-Initiated Password Reset (Phase 6F). Same shape as
// adminCreateAccount/adminUpdateAccountStatus above - setting another
// user's Auth password requires service_role, so this client call only
// ever carries the anon key + the current admin's own session token, and
// supabase/functions/admin-reset-password is the actual privileged
// boundary (see its own comment). Not the "forgot password" email flow -
// the admin chooses the new password directly.
export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-reset-password", {
    body: { userId, newPassword },
  });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not reset the account's password.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Password reset did not return an account.");
  }
}

// Account Deletion (Phase 6G). Same shape as adminCreateAccount/
// adminUpdateAccountStatus/adminResetPassword above - deleting another
// user's Auth account requires service_role, so this client call only
// ever carries the anon key + the current admin's own session token, and
// supabase/functions/admin-delete-account is the actual privileged
// boundary (see its own comment on how it guarantees no orphaned data).
export async function adminDeleteAccount(userId: string): Promise<void> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-delete-account", { body: { userId } });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not delete the account.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Account deletion did not return a confirmation.");
  }
}

// Real Account Listing (Phase 6I). Same shape as the four functions
// above - listing every account is a cross-user read that RLS's "own
// profile" policy blocks for a plain client query, so this requires
// service_role too, and supabase/functions/admin-list-accounts is the
// actual privileged boundary (see its own comment). Replaces the seeded
// adminUserAccounts array as User Administration's account source.
export interface AdminAccountRow {
  userId: string;
  displayName: string;
  role: UserRole;
  status: ProfileAccountStatus;
}

export async function adminListAccounts(): Promise<AdminAccountRow[]> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-list-accounts", { method: "GET" });
  if (error) {
    const message = (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not load accounts.";
    throw new Error(message);
  }
  if (!Array.isArray(data?.accounts)) {
    throw new Error("Account listing did not return an account list.");
  }
  return data.accounts;
}

// Phase 7A - Live Academic Data. Everything below reads/writes tables that
// carry no more sensitive data than course/assignment/announcement content,
// so - unlike account creation/status/reset/delete/listing above - these
// are plain client calls governed entirely by RLS (see
// supabase/migrations/0004_academic_live_data.sql), not a privileged
// service_role Edge Function.

// Public Directory read. `active can read active profiles` policy is what
// makes this possible for any signed-in user, not just admins (contrast
// with adminListAccounts above, which stays admin-only via the Edge
// Function). No email - that never leaves auth.users.
export interface DirectoryProfile {
  userId: string;
  displayName: string;
  role: UserRole | null;
  year: number | null;
  house: House | null;
}

export async function listDirectoryProfiles(role?: UserRole): Promise<DirectoryProfile[]> {
  const client = requireClient();
  let query = client.from("profiles").select("user_id, display_name, role, year, house").eq("active", true);
  if (role) query = query.eq("role", role);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    role: toUserRole(row.role),
    year: row.year,
    house: toHouse(row.house),
  }));
}

export interface CourseAssignmentRow {
  courseId: string;
  professorUserId: string | null;
}

export async function listCourseAssignments(): Promise<CourseAssignmentRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("course_professor_assignments").select("course_id, professor_user_id");
  if (error) throw error;
  return (data ?? []).map((row) => ({ courseId: row.course_id, professorUserId: row.professor_user_id }));
}

export async function upsertCourseAssignment(courseId: string, professorUserId: string | null): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("course_professor_assignments")
    .upsert({ course_id: courseId, professor_user_id: professorUserId, assigned_at: new Date().toISOString() });
  if (error) throw error;
}

export type AssignmentItemType = "Assignment" | "Quiz" | "Exam";
export type AssignmentWorkStatus = "Draft" | "Published" | "Archived";

export interface AssignmentRow {
  id: string;
  courseId: string;
  professorUserId: string | null;
  title: string;
  description: string;
  dueDate: string;
  itemType: AssignmentItemType;
  status: AssignmentWorkStatus;
  housePointsReward: number | null;
  maxGrade: number | null;
}

function toAssignmentRow(data: {
  id: string;
  course_id: string;
  professor_user_id: string | null;
  title: string;
  description: string;
  due_date: string;
  item_type: string;
  status: string;
  house_points_reward: number | null;
  max_grade: number | null;
}): AssignmentRow {
  return {
    id: data.id,
    courseId: data.course_id,
    professorUserId: data.professor_user_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    itemType: data.item_type as AssignmentItemType,
    status: data.status as AssignmentWorkStatus,
    housePointsReward: data.house_points_reward,
    maxGrade: data.max_grade,
  };
}

const ASSIGNMENT_COLUMNS =
  "id, course_id, professor_user_id, title, description, due_date, item_type, status, house_points_reward, max_grade";

// RLS already scopes what comes back: Published rows to everyone, plus the
// caller's own (any status) if they're the authoring professor or an
// admin - no client-side filtering needed to keep a Draft private.
export async function listAssignments(): Promise<AssignmentRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("assignments").select(ASSIGNMENT_COLUMNS);
  if (error) throw error;
  return (data ?? []).map(toAssignmentRow);
}

export interface CreateAssignmentInput {
  courseId: string;
  professorUserId: string;
  title: string;
  description: string;
  dueDate: string;
  itemType: AssignmentItemType;
  housePointsReward?: number;
  maxGrade?: number;
}

export async function createAssignment(input: CreateAssignmentInput): Promise<AssignmentRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("assignments")
    .insert({
      course_id: input.courseId,
      professor_user_id: input.professorUserId,
      title: input.title,
      description: input.description,
      due_date: input.dueDate,
      item_type: input.itemType,
      house_points_reward: input.housePointsReward ?? null,
      max_grade: input.maxGrade ?? null,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toAssignmentRow(data);
}

export async function updateAssignment(
  id: string,
  updates: Partial<Omit<CreateAssignmentInput, "professorUserId">> & { status?: AssignmentWorkStatus }
): Promise<AssignmentRow> {
  const client = requireClient();
  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.dueDate !== undefined) patch.due_date = updates.dueDate;
  if (updates.itemType !== undefined) patch.item_type = updates.itemType;
  if (updates.housePointsReward !== undefined) patch.house_points_reward = updates.housePointsReward;
  if (updates.maxGrade !== undefined) patch.max_grade = updates.maxGrade;
  if (updates.status !== undefined) patch.status = updates.status;

  const { data, error } = await client
    .from("assignments")
    .update(patch)
    .eq("id", id)
    .select(ASSIGNMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toAssignmentRow(data);
}

// Phase 6 - Communication & Administration System. Real authored/
// published/expiring broadcasts, school-wide or course-scoped - see
// supabase/migrations/0007_announcements_and_service_assignments.sql.
export type AnnouncementType = "General" | "Academic" | "Campus Event" | "Emergency" | "Maintenance";
export type AnnouncementVisibility = "School" | "Course";

export interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  announcementType: AnnouncementType;
  visibility: AnnouncementVisibility;
  courseId: string | null;
  authorUserId: string | null;
  published: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

function toAnnouncementRow(data: {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  visibility: string;
  course_id: string | null;
  author_user_id: string | null;
  published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}): AnnouncementRow {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    announcementType: data.announcement_type as AnnouncementType,
    visibility: data.visibility as AnnouncementVisibility,
    courseId: data.course_id,
    authorUserId: data.author_user_id,
    published: data.published,
    publishedAt: data.published_at,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}

const ANNOUNCEMENT_COLUMNS =
  "id, title, content, announcement_type, visibility, course_id, author_user_id, published, published_at, expires_at, created_at";

// RLS ("view visible announcements") already scopes what comes back: the
// caller's own rows (any status), every row for an admin, or - for anyone
// else - only published/non-expired School rows plus Course rows for a
// course they're enrolled in or teach. No client-side filtering needed.
export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("announcements")
    .select(ANNOUNCEMENT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAnnouncementRow);
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  announcementType: AnnouncementType;
  visibility: AnnouncementVisibility;
  courseId?: string;
  authorUserId: string;
  // Defaults to a draft (false) - an explicit Publish action (see
  // publishAnnouncement below) is what makes a row visible to anyone but
  // its own author/admin.
  published?: boolean;
  expiresAt?: string;
}

// Phase 2 - Real Academic Workflow. Enrollment is a real, queryable fact
// (see supabase/migrations/0005_academic_workflow.sql) instead of an
// implicit "your year matches" client-side check - a student's own
// account upserts its own row (RLS: `student_user_id = auth.uid()`), which
// is what lets `assignments`/`assignment_submissions` RLS actually enforce
// enrollment server-side.
export async function ensureEnrolled(courseId: string, studentUserId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("course_enrollments")
    .upsert(
      { student_user_id: studentUserId, course_id: courseId },
      { onConflict: "student_user_id,course_id", ignoreDuplicates: true }
    );
  if (error) throw error;
}

export interface EnrollmentRow {
  studentUserId: string;
  courseId: string;
}

export async function listEnrollments(): Promise<EnrollmentRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("course_enrollments").select("student_user_id, course_id");
  if (error) throw error;
  return (data ?? []).map((row) => ({ studentUserId: row.student_user_id, courseId: row.course_id }));
}

export type SubmissionStatus = "Submitted" | "Late" | "Graded";

export interface SubmissionRow {
  id: string;
  assignmentId: string;
  studentUserId: string;
  submissionText: string;
  submittedAt: string;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
}

function toSubmissionRow(data: {
  id: string;
  assignment_id: string;
  student_user_id: string;
  submission_text: string;
  submitted_at: string;
  status: string;
  score: number | null;
  max_score: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
}): SubmissionRow {
  return {
    id: data.id,
    assignmentId: data.assignment_id,
    studentUserId: data.student_user_id,
    submissionText: data.submission_text,
    submittedAt: data.submitted_at,
    status: data.status as SubmissionStatus,
    score: data.score,
    maxScore: data.max_score,
    feedback: data.feedback,
    gradedBy: data.graded_by,
    gradedAt: data.graded_at,
  };
}

const SUBMISSION_COLUMNS =
  "id, assignment_id, student_user_id, submission_text, submitted_at, status, score, max_score, feedback, graded_by, graded_at";

// RLS already scopes what comes back: a student's own submissions, or -
// for a professor/admin - every submission for an assignment they teach/
// administer. One method serves both roles correctly with no client-side
// filtering (see the migration's own policy comments).
export async function listSubmissions(): Promise<SubmissionRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("assignment_submissions").select(SUBMISSION_COLUMNS);
  if (error) throw error;
  return (data ?? []).map(toSubmissionRow);
}

export interface CreateSubmissionInput {
  assignmentId: string;
  studentUserId: string;
  submissionText: string;
  status: "Submitted" | "Late";
}

export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("assignment_submissions")
    .insert({
      assignment_id: input.assignmentId,
      student_user_id: input.studentUserId,
      submission_text: input.submissionText,
      status: input.status,
    })
    .select(SUBMISSION_COLUMNS)
    .single();
  if (error) throw error;
  return toSubmissionRow(data);
}

export interface GradeSubmissionInput {
  score: number;
  maxScore: number;
  feedback: string;
  gradedBy: string;
}

export async function gradeSubmission(id: string, input: GradeSubmissionInput): Promise<SubmissionRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("assignment_submissions")
    .update({
      score: input.score,
      max_score: input.maxScore,
      feedback: input.feedback || null,
      graded_by: input.gradedBy,
      graded_at: new Date().toISOString(),
      status: "Graded",
    })
    .eq("id", id)
    .select(SUBMISSION_COLUMNS)
    .single();
  if (error) throw error;
  return toSubmissionRow(data);
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<AnnouncementRow> {
  const client = requireClient();
  const published = input.published ?? false;
  const { data, error } = await client
    .from("announcements")
    .insert({
      title: input.title,
      content: input.content,
      announcement_type: input.announcementType,
      visibility: input.visibility,
      course_id: input.courseId ?? null,
      author_user_id: input.authorUserId,
      published,
      published_at: published ? new Date().toISOString() : null,
      expires_at: input.expiresAt ?? null,
    })
    .select(ANNOUNCEMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toAnnouncementRow(data);
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  announcementType?: AnnouncementType;
  visibility?: AnnouncementVisibility;
  courseId?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

// Generic partial-patch, same shape as updateAssignment - the "when to
// stamp publishedAt" decision belongs to the repository's publish()/
// unpublish() wrappers, not here.
export async function updateAnnouncement(id: string, updates: UpdateAnnouncementInput): Promise<AnnouncementRow> {
  const client = requireClient();
  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.content !== undefined) patch.content = updates.content;
  if (updates.announcementType !== undefined) patch.announcement_type = updates.announcementType;
  if (updates.visibility !== undefined) patch.visibility = updates.visibility;
  if (updates.courseId !== undefined) patch.course_id = updates.courseId;
  if (updates.published !== undefined) patch.published = updates.published;
  if (updates.publishedAt !== undefined) patch.published_at = updates.publishedAt;
  if (updates.expiresAt !== undefined) patch.expires_at = updates.expiresAt;

  const { data, error } = await client
    .from("announcements")
    .update(patch)
    .eq("id", id)
    .select(ANNOUNCEMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toAnnouncementRow(data);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// Service Administration - which staff account is responsible for each
// campus service, admin-configurable (see
// supabase/migrations/0007_announcements_and_service_assignments.sql)
// instead of hardcoded or absent.
export type ServiceName = "Library" | "Hospital Wing" | "Lost & Found" | "Hogsmeade Permits" | "Owlery Administration";

export interface ServiceAssignmentRow {
  id: string;
  serviceName: ServiceName;
  staffUserId: string | null;
  assignedAt: string;
}

function toServiceAssignmentRow(data: {
  id: string;
  service_name: string;
  staff_user_id: string | null;
  assigned_at: string;
}): ServiceAssignmentRow {
  return {
    id: data.id,
    serviceName: data.service_name as ServiceName,
    staffUserId: data.staff_user_id,
    assignedAt: data.assigned_at,
  };
}

const SERVICE_ASSIGNMENT_COLUMNS = "id, service_name, staff_user_id, assigned_at";

export async function listServiceAssignments(): Promise<ServiceAssignmentRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("service_assignments").select(SERVICE_ASSIGNMENT_COLUMNS);
  if (error) throw error;
  return (data ?? []).map(toServiceAssignmentRow);
}

export async function upsertServiceAssignment(
  serviceName: ServiceName,
  staffUserId: string | null
): Promise<ServiceAssignmentRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("service_assignments")
    .upsert(
      { service_name: serviceName, staff_user_id: staffUserId, assigned_at: new Date().toISOString() },
      { onConflict: "service_name" }
    )
    .select(SERVICE_ASSIGNMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toServiceAssignmentRow(data);
}

// Phase 5 - Campus Services & Resource System. Everything below reads/
// writes the tables added in supabase/migrations/0006_campus_services.sql -
// plain client calls governed by RLS, same pattern as the Phase 7A/Phase 2
// functions above (not a privileged Edge Function; none of this needs
// service_role).

// Owlery - real, cross-account messaging replacing the old per-character
// "Owl Post" local array.
export type MessageType =
  | "Direct Message"
  | "Announcement"
  | "Assignment Notification"
  | "Grade Notification"
  | "Service Update"
  | "Reminder";

export interface MessageRow {
  id: string;
  senderId: string | null;
  receiverId: string;
  subject: string;
  content: string;
  messageType: MessageType;
  relatedService: string | null;
  relatedId: string | null;
  status: "Sent" | "Read";
  createdAt: string;
  readAt: string | null;
}

function toMessageRow(data: {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  subject: string;
  content: string;
  message_type: string;
  related_service: string | null;
  related_id: string | null;
  status: string;
  created_at: string;
  read_at: string | null;
}): MessageRow {
  return {
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    subject: data.subject,
    content: data.content,
    messageType: data.message_type as MessageType,
    relatedService: data.related_service,
    relatedId: data.related_id,
    status: data.status as MessageRow["status"],
    createdAt: data.created_at,
    readAt: data.read_at,
  };
}

const MESSAGE_COLUMNS =
  "id, sender_id, receiver_id, subject, content, message_type, related_service, related_id, status, created_at, read_at";

// RLS ("view own messages") already scopes this to messages where the
// caller is the sender or the receiver - inbox/sent are a client-side
// split of the same one query, not two separate reads.
export async function listMessagesForUser(): Promise<MessageRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toMessageRow);
}

export interface SendMessageInput {
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  messageType: MessageType;
  relatedService?: string;
  relatedId?: string;
}

export async function sendMessage(input: SendMessageInput): Promise<MessageRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("messages")
    .insert({
      sender_id: input.senderId,
      receiver_id: input.receiverId,
      subject: input.subject,
      content: input.content,
      message_type: input.messageType,
      related_service: input.relatedService ?? null,
      related_id: input.relatedId ?? null,
    })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error) throw error;
  return toMessageRow(data);
}

export async function markMessageRead(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("messages")
    .update({ status: "Read", read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllMessagesRead(receiverId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("messages")
    .update({ status: "Read", read_at: new Date().toISOString() })
    .eq("receiver_id", receiverId)
    .eq("status", "Sent");
  if (error) throw error;
}

// Library Services - a real lending catalog (distinct from data/books.ts's
// Resources reading catalog, untouched by this phase).
export interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
}

function toBookRow(data: {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  total_copies: number;
  available_copies: number;
}): BookRow {
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    category: data.category,
    description: data.description,
    totalCopies: data.total_copies,
    availableCopies: data.available_copies,
  };
}

const BOOK_COLUMNS = "id, title, author, category, description, total_copies, available_copies";

export async function listBooks(): Promise<BookRow[]> {
  const client = requireClient();
  const { data, error } = await client.from("books").select(BOOK_COLUMNS).order("title");
  if (error) throw error;
  return (data ?? []).map(toBookRow);
}

export interface CreateBookInput {
  title: string;
  author: string;
  category: string;
  description: string;
  totalCopies: number;
}

export async function createBook(input: CreateBookInput): Promise<BookRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      category: input.category,
      description: input.description,
      total_copies: input.totalCopies,
      available_copies: input.totalCopies,
    })
    .select(BOOK_COLUMNS)
    .single();
  if (error) throw error;
  return toBookRow(data);
}

export type BookLoanStatus = "Borrowed" | "Returned" | "Overdue";

export interface BookLoanRow {
  id: string;
  bookId: string;
  studentId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: BookLoanStatus;
}

function toBookLoanRow(data: {
  id: string;
  book_id: string;
  student_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
}): BookLoanRow {
  return {
    id: data.id,
    bookId: data.book_id,
    studentId: data.student_id,
    borrowedAt: data.borrowed_at,
    dueDate: data.due_date,
    returnedAt: data.returned_at,
    status: data.status as BookLoanStatus,
  };
}

const BOOK_LOAN_COLUMNS = "id, book_id, student_id, borrowed_at, due_date, returned_at, status";
const LOAN_PERIOD_DAYS = 14;

// RLS scopes this to the caller's own loans, or - for a librarian/admin -
// every loan.
export async function listBookLoans(): Promise<BookLoanRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("book_loans")
    .select(BOOK_LOAN_COLUMNS)
    .order("borrowed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toBookLoanRow);
}

// `trg_adjust_book_availability` (see the migration) decrements
// books.available_copies server-side on insert - nothing to do here beyond
// the insert itself.
export async function borrowBook(bookId: string, studentId: string): Promise<BookLoanRow> {
  const client = requireClient();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
  const { data, error } = await client
    .from("book_loans")
    .insert({ book_id: bookId, student_id: studentId, due_date: dueDate.toISOString().slice(0, 10) })
    .select(BOOK_LOAN_COLUMNS)
    .single();
  if (error) throw error;
  return toBookLoanRow(data);
}

// Same trigger restores books.available_copies on this update.
export async function returnBookLoan(id: string): Promise<BookLoanRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("book_loans")
    .update({ returned_at: new Date().toISOString(), status: "Returned" })
    .eq("id", id)
    .select(BOOK_LOAN_COLUMNS)
    .single();
  if (error) throw error;
  return toBookLoanRow(data);
}

// Hospital Wing appointment requests.
export type MedicalRequestStatus = "Pending" | "Approved" | "Completed" | "Rejected";

export interface MedicalRequestRow {
  id: string;
  studentId: string;
  reason: string;
  requestedDate: string;
  status: MedicalRequestStatus;
  assignedStaff: string | null;
  createdAt: string;
}

function toMedicalRequestRow(data: {
  id: string;
  student_id: string;
  reason: string;
  requested_date: string;
  status: string;
  assigned_staff: string | null;
  created_at: string;
}): MedicalRequestRow {
  return {
    id: data.id,
    studentId: data.student_id,
    reason: data.reason,
    requestedDate: data.requested_date,
    status: data.status as MedicalRequestStatus,
    assignedStaff: data.assigned_staff,
    createdAt: data.created_at,
  };
}

const MEDICAL_REQUEST_COLUMNS = "id, student_id, reason, requested_date, status, assigned_staff, created_at";

export async function listMedicalRequests(): Promise<MedicalRequestRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("medical_requests")
    .select(MEDICAL_REQUEST_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toMedicalRequestRow);
}

export async function createMedicalRequest(input: {
  studentId: string;
  reason: string;
  requestedDate: string;
}): Promise<MedicalRequestRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("medical_requests")
    .insert({ student_id: input.studentId, reason: input.reason, requested_date: input.requestedDate })
    .select(MEDICAL_REQUEST_COLUMNS)
    .single();
  if (error) throw error;
  return toMedicalRequestRow(data);
}

export async function updateMedicalRequestStatus(
  id: string,
  status: MedicalRequestStatus,
  assignedStaff: string
): Promise<MedicalRequestRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("medical_requests")
    .update({ status, assigned_staff: assignedStaff })
    .eq("id", id)
    .select(MEDICAL_REQUEST_COLUMNS)
    .single();
  if (error) throw error;
  return toMedicalRequestRow(data);
}

// Hogsmeade visit permits.
export type PermitStatus = "Pending" | "Approved" | "Rejected";

export interface PermitRow {
  id: string;
  studentId: string;
  visitDate: string;
  reason: string;
  status: PermitStatus;
  approvedBy: string | null;
  createdAt: string;
}

function toPermitRow(data: {
  id: string;
  student_id: string;
  visit_date: string;
  reason: string;
  status: string;
  approved_by: string | null;
  created_at: string;
}): PermitRow {
  return {
    id: data.id,
    studentId: data.student_id,
    visitDate: data.visit_date,
    reason: data.reason,
    status: data.status as PermitStatus,
    approvedBy: data.approved_by,
    createdAt: data.created_at,
  };
}

const PERMIT_COLUMNS = "id, student_id, visit_date, reason, status, approved_by, created_at";

export async function listPermits(): Promise<PermitRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("permits")
    .select(PERMIT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toPermitRow);
}

export async function createPermit(input: {
  studentId: string;
  visitDate: string;
  reason: string;
}): Promise<PermitRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("permits")
    .insert({ student_id: input.studentId, visit_date: input.visitDate, reason: input.reason })
    .select(PERMIT_COLUMNS)
    .single();
  if (error) throw error;
  return toPermitRow(data);
}

export async function updatePermitStatus(
  id: string,
  status: PermitStatus,
  approvedBy: string
): Promise<PermitRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("permits")
    .update({ status, approved_by: approvedBy })
    .eq("id", id)
    .select(PERMIT_COLUMNS)
    .single();
  if (error) throw error;
  return toPermitRow(data);
}

// Lost & Found reports.
export type LostFoundStatus = "Reported" | "Found" | "Claimed";

export interface LostFoundItemRow {
  id: string;
  reportedBy: string | null;
  itemName: string;
  description: string;
  locationFound: string | null;
  status: LostFoundStatus;
  claimedBy: string | null;
  createdAt: string;
}

function toLostFoundItemRow(data: {
  id: string;
  reported_by: string | null;
  item_name: string;
  description: string;
  location_found: string | null;
  status: string;
  claimed_by: string | null;
  created_at: string;
}): LostFoundItemRow {
  return {
    id: data.id,
    reportedBy: data.reported_by,
    itemName: data.item_name,
    description: data.description,
    locationFound: data.location_found,
    status: data.status as LostFoundStatus,
    claimedBy: data.claimed_by,
    createdAt: data.created_at,
  };
}

const LOST_FOUND_COLUMNS = "id, reported_by, item_name, description, location_found, status, claimed_by, created_at";

export async function listLostFoundItems(): Promise<LostFoundItemRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("lost_found_items")
    .select(LOST_FOUND_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toLostFoundItemRow);
}

export async function reportLostItem(input: {
  reportedBy: string;
  itemName: string;
  description: string;
  locationFound: string;
}): Promise<LostFoundItemRow> {
  const client = requireClient();
  const { data, error } = await client
    .from("lost_found_items")
    .insert({
      reported_by: input.reportedBy,
      item_name: input.itemName,
      description: input.description,
      location_found: input.locationFound,
    })
    .select(LOST_FOUND_COLUMNS)
    .single();
  if (error) throw error;
  return toLostFoundItemRow(data);
}

export async function updateLostFoundStatus(
  id: string,
  status: LostFoundStatus,
  claimedBy?: string
): Promise<LostFoundItemRow> {
  const client = requireClient();
  const patch: Record<string, unknown> = { status };
  if (claimedBy !== undefined) patch.claimed_by = claimedBy;
  const { data, error } = await client
    .from("lost_found_items")
    .update(patch)
    .eq("id", id)
    .select(LOST_FOUND_COLUMNS)
    .single();
  if (error) throw error;
  return toLostFoundItemRow(data);
}
