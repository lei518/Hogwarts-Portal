import type { CalendarDraft, HousePointAdjustment, ResourceRequest, ServiceRequest } from "../types/adminPortal";

// Admin Operations (Phase 4B) - starting seeds for AdminContext's local,
// in-memory state. One array per workflow, matching the four independent
// models in types/adminPortal.ts. Student Services/Admin Operations stay
// out of Phase 7A's scope (not named in the task, and CLAUDE.md already
// documents this module as deliberately standalone) - only the seeded
// *people* are gone (see Part 1): `adminProfiles`/`adminUserAccounts` are
// removed entirely (identity now resolves from the real signed-in account,
// see AuthenticatedAdminContext.tsx; accounts come from the live
// admin-list-accounts Edge Function, see adminRepository.ts), and
// `adminName` below no longer names a specific fabricated administrator.
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
    adminName: "School Administration",
    timestamp: "2026-09-01T10:00:00.000Z",
    reviewed: true,
  },
  {
    id: "adjustment-slytherin-correction",
    house: "Slytherin",
    amount: -5,
    reason: "Correcting a duplicate points entry from last week's Potions class.",
    adminName: "School Administration",
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
