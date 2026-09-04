import type {
  AdminProfile,
  AdminUserAccount,
  CalendarDraft,
  HousePointAdjustment,
  ResourceRequest,
  ServiceRequest,
} from "../types/adminPortal";

// Admin Portal Foundation - standalone module, seeded data only (see
// CLAUDE.md's Admin Portal section). Not cross-referenced to
// data/professors.ts like ProfessorProfile is to Professor - no Deputy
// Headmistress entry exists in the Professor Directory yet, so this stays
// its own record rather than implying a link that doesn't exist.
//
// Authentication Foundation (Phase 6C): an array, same shape change
// data/professorPortal.ts made in Phase 6B - still one seeded entry, but
// this is what lets a second real administrator account resolve to their
// own (or an honest "not on file") profile instead of always this one.
export const adminProfiles: AdminProfile[] = [
  {
    id: "admin-mcgonagall",
    displayName: "Professor Minerva McGonagall",
    title: "Deputy Headmistress",
    department: "School Administration",
    bio: "Runs the day-to-day administration of the school - enrollment, staffing, and the thousand small decisions that keep Hogwarts running. Famously difficult to catch off guard.",
  },
];

// Illustrative account registry - the one genuinely new owned model this
// milestone. Linked to existing canonical directories by id only
// (data/students.ts, data/professors.ts); no fields are duplicated from
// either.
export const adminUserAccounts: AdminUserAccount[] = [
  { id: "account-harry-potter", displayName: "Harry Potter", role: "student", status: "Active", linkedStudentId: "harry-potter" },
  { id: "account-hermione-granger", displayName: "Hermione Granger", role: "student", status: "Active", linkedStudentId: "hermione-granger" },
  { id: "account-ron-weasley", displayName: "Ron Weasley", role: "student", status: "Active", linkedStudentId: "ron-weasley" },
  { id: "account-draco-malfoy", displayName: "Draco Malfoy", role: "student", status: "Active", linkedStudentId: "draco-malfoy" },
  { id: "account-luna-lovegood", displayName: "Luna Lovegood", role: "student", status: "Suspended", linkedStudentId: "luna-lovegood" },
  { id: "account-new-enrollee", displayName: "Pending Enrollee", role: "student", status: "Pending" },
  { id: "account-snape", displayName: "Professor Severus Snape", role: "professor", status: "Active", linkedProfessorId: "snape" },
  { id: "account-mcgonagall", displayName: "Professor Minerva McGonagall", role: "admin", status: "Active" },
];

// Admin Operations (Phase 4B) - starting seeds for AdminContext's local,
// in-memory state. One array per workflow, matching the four independent
// models in types/adminPortal.ts.
export const serviceRequestSeeds: ServiceRequest[] = [
  {
    id: "service-request-hospital-restock",
    serviceId: "hospital-wing",
    summary: "Restock Skele-Gro and standard potion supplies before Quidditch season.",
    status: "Pending",
    requestedAt: "2026-09-02",
  },
  {
    id: "service-request-library-hours",
    serviceId: "library-services",
    summary: "Extend reading room hours during exam week.",
    status: "Approved",
    requestedAt: "2026-08-28",
  },
  {
    id: "service-request-hogsmeade-shop",
    serviceId: "hogsmeade-services",
    summary: "Add a new approved shop to the Hogsmeade visit list.",
    status: "Rejected",
    requestedAt: "2026-08-20",
  },
];

export const calendarDraftSeeds: CalendarDraft[] = [
  {
    id: "calendar-draft-dueling-club",
    title: "Dueling Club Exhibition",
    date: "2026-09-20",
    category: "School Event",
    description: "An exhibition match to recruit new members.",
    status: "Draft",
  },
  {
    id: "calendar-draft-staff-meeting",
    title: "Staff Planning Day",
    date: "2026-09-14",
    category: "Academic",
    description: "No classes - staff-only planning day.",
    status: "Published",
  },
];

export const housePointAdjustmentSeeds: HousePointAdjustment[] = [
  {
    id: "adjustment-gryffindor-cleanup",
    house: "Gryffindor",
    amount: 15,
    reason: "Organized the trophy room cleanup after the Quidditch pitch incident.",
    adminName: "Professor Minerva McGonagall",
    timestamp: "2026-09-01T10:00:00.000Z",
    reviewed: true,
  },
  {
    id: "adjustment-slytherin-correction",
    house: "Slytherin",
    amount: -5,
    reason: "Correcting a duplicate points entry from last week's Potions class.",
    adminName: "Professor Minerva McGonagall",
    timestamp: "2026-09-03T14:30:00.000Z",
    reviewed: false,
  },
];

export const resourceRequestSeeds: ResourceRequest[] = [
  { id: "resource-request-cauldrons", itemName: "Pewter Cauldrons, Standard Size 2", quantity: 12, status: "Pending", requestedAt: "2026-09-03" },
  { id: "resource-request-parchment", itemName: "Parchment Rolls", quantity: 50, status: "Ordered", requestedAt: "2026-08-29" },
  { id: "resource-request-telescopes", itemName: "Brass Telescopes", quantity: 8, status: "Delivered", requestedAt: "2026-08-15" },
  { id: "resource-request-quills", itemName: "Replacement Quills", quantity: 30, status: "Archived", requestedAt: "2026-07-20" },
];

// Unchanged since Phase 4A - still resolves the one seeded reference
// persona regardless of who's authenticated. Nothing calls this to
// determine session identity anymore (see getAdminProfileByDisplayName
// below); kept for any caller that genuinely wants "the" admin record.
export function getAdminProfile(): AdminProfile {
  return adminProfiles[0];
}

export function getAdminUserAccounts(): AdminUserAccount[] {
  return adminUserAccounts;
}

// Authentication Foundation (Phase 6C) - the lookup AuthenticatedAdminContext
// goes through to resolve the signed-in administrator, same exact-match
// correspondence rule as getProfessorProfileByDisplayName.
export function getAdminProfileByDisplayName(displayName: string): AdminProfile | undefined {
  return adminProfiles.find((profile) => profile.displayName === displayName);
}
