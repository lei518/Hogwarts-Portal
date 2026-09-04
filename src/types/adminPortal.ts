import type { House } from "./game";
import type { CalendarEventCategory } from "./resources";

// Admin Portal Foundation - standalone module, seeded data only, mirrors
// the Professor Portal's own launch (see CLAUDE.md). Independent
// interfaces - no nested mega-object, same pattern as
// types/studentServices.ts / types/professorPortal.ts. Everything the
// Admin Portal shows that it doesn't own itself is read, never owned, from
// Student/Professor Portal canonical data - see utils/adminAnalytics.ts.
//
// AdminAuditEntry is still deliberately NOT defined: a unified,
// cross-feature audit log combining every action below is a distinct,
// larger feature nothing here asks for yet. Each Phase 4B model instead
// carries its own timestamp (HousePointAdjustment.timestamp,
// ServiceRequest.requestedAt, ...), which is its own small, honest audit
// trail without a second, generic logging model.

export interface AdminProfile {
  id: string;
  displayName: string;
  title: string;
  department: string;
  bio: string;
}

export type AccountRole = "student" | "professor" | "admin";
export type AccountStatus = "Active" | "Suspended" | "Locked" | "Pending";

// The one genuinely new owned model this milestone: account/role
// administration has no existing home anywhere else in the app. Links to
// existing canonical records by id only, never by duplicating their
// fields - same one-directional-reference convention as
// TeachingCourse.courseId.
export interface AdminUserAccount {
  id: string;
  displayName: string;
  role: AccountRole;
  status: AccountStatus;
  linkedStudentId?: string; // references data/students.ts Student.id
  linkedProfessorId?: string; // references data/professors.ts Professor.id
  // Account Status (Phase 6E). The real Supabase Auth user id (profiles.user_id) -
  // present only for accounts created through the real creation flow
  // (Phase 6D); undefined for the seeded/illustrative accounts, which have
  // no backing Supabase user. AdminContext uses this, not `id`, to know
  // which accounts a real status update can honestly be applied to.
  userId?: string;
}

// Account Creation (Phase 6D). What User Administration's creation form
// collects; not a stored field on AdminUserAccount itself - email lives
// only in Supabase Auth (the actual source of truth for it), never
// duplicated into this local, in-memory model.
export interface CreateAccountInput {
  displayName: string;
  email: string;
  password: string;
  role: AccountRole;
}

// Admin Operations (Phase 4B). Four independent models, one per workflow
// below - each has exactly one page that owns and consumes it, per
// CLAUDE.md's Admin Portal section. All local/session-only state; see
// context/AdminContext.tsx.

export type ServiceRequestStatus = "Pending" | "Approved" | "Rejected";

export interface ServiceRequest {
  id: string;
  serviceId: string; // references a StudentService.id (e.g. data/hospitalWing.ts's "hospital-wing")
  summary: string;
  status: ServiceRequestStatus;
  requestedAt: string; // ISO
}

export type CalendarDraftStatus = "Draft" | "Published";

// Publishing a draft only ever flips this status within the Admin
// session's own ledger - it never writes into data/academicCalendar.ts,
// which stays the Student Portal's sole source of real calendar dates.
export interface CalendarDraft {
  id: string;
  title: string;
  date: string; // ISO "YYYY-MM-DD"
  category: CalendarEventCategory;
  description?: string;
  status: CalendarDraftStatus;
}

// Deliberately separate from the real, Character-owned HousePointAward
// ledger (types/campusLife.ts) - this never touches Character.housePoints,
// per CLAUDE.md's Admin Portal section. `amount` follows the same
// positive-add/negative-remove convention as HousePointAward.
export interface HousePointAdjustment {
  id: string;
  house: House;
  amount: number;
  reason: string;
  adminName: string;
  timestamp: string; // ISO
  reviewed: boolean;
}

export type ResourceRequestStatus = "Pending" | "Ordered" | "Delivered" | "Archived";

export interface ResourceRequest {
  id: string;
  itemName: string;
  quantity: number;
  status: ResourceRequestStatus;
  requestedAt: string; // ISO
}
