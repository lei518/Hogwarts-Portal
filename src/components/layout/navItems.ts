import {
  Home,
  Map as MapIcon,
  Wand2,
  FlaskConical,
  BookOpen,
  Users,
  ClipboardList,
  User,
  Trophy,
  Sparkles,
  Award,
  Settings,
  GraduationCap,
  Castle,
  Landmark,
  BookMarked,
  CalendarDays,
  UserSquare,
  Megaphone,
  ScrollText,
  CalendarRange,
  NotebookPen,
  Percent,
  FileText,
  ConciergeBell,
  Stethoscope,
  Bird,
  BookCopy,
  Store,
  PackageSearch,
  LifeBuoy,
  LayoutDashboard,
  Clock,
  UserCircle,
  ListChecks,
  Archive,
  FolderOpen,
  UserCog,
  Settings2,
  Boxes,
  BarChart3,
  Mail,
  UserCheck,
} from "lucide-react";
import type { ComponentType } from "react";
import type { UserRole } from "../../services/supabase";

type Icon = ComponentType<{ size?: number; className?: string }>;

export interface NavItem {
  path: string;
  label: string;
  icon: Icon;
  /** Shown on the Home Quick Access widget. */
  description: string;
  /**
   * "top": always visible above the collapsible sections (the handful of
   * pages a student/professor/admin reaches for constantly). "bottom":
   * always visible below them (system-level, e.g. Settings). Omit for a
   * normal item that only appears inside its section's collapsible list.
   */
  pinned?: "top" | "bottom";
}

export interface NavSection {
  id: string;
  label: string;
  icon: Icon;
  items: NavItem[];
}

/**
 * Every portal role gets its own section list here. Sidebar/MobileNavDrawer/
 * Home render whichever list is passed in - none of them know about roles
 * or pages directly.
 *
 * Phase 6 role-system audit: this used to be its own hand-typed 7-role
 * union, independent of services/supabase.ts's UserRole - exactly the kind
 * of drift-prone duplicate list that let an Admin Portal role dropdown fall
 * out of sync with the real role set. Now a plain alias, so a role added or
 * renamed in one place is reflected here automatically.
 */
export type PortalRole = UserRole;

export const studentNavigation: NavSection[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    items: [
      { path: "/dashboard", label: "Home", icon: Home, description: "Your portal homepage.", pinned: "top" },
    ],
  },
  {
    id: "my-profile",
    label: "My Profile",
    icon: User,
    items: [
      { path: "/character", label: "My Profile", icon: User, description: "Your identity, house, wand, and academic record.", pinned: "top" },
      { path: "/patronus", label: "Patronus Charm", icon: Sparkles, description: "The Patronus Charm — unlocks in Year 5." },
      { path: "/achievements", label: "Achievements", icon: Award, description: "Track your milestones and unlocks." },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    items: [
      { path: "/courses", label: "Courses", icon: BookMarked, description: "Your enrolled courses this year.", pinned: "top" },
      { path: "/schedule", label: "Class Schedule", icon: CalendarDays, description: "Your weekly timetable." },
      { path: "/assignments", label: "Assignments", icon: NotebookPen, description: "Coursework across your courses." },
      // Grades & Academic Records - Phase 2 collapsed Academic Progress/
      // Academic Standing/Semester Summary into these two, see CLAUDE.md.
      { path: "/grades", label: "Grades", icon: Percent, description: "Your current grade in each course.", pinned: "top" },
      { path: "/transcript", label: "Transcript", icon: FileText, description: "Your official academic record.", pinned: "top" },
    ],
  },
  {
    id: "campus-life",
    label: "Campus Life",
    icon: Castle,
    items: [
      { path: "/map", label: "Campus Map", icon: MapIcon, description: "See where everyone is, right now." },
      { path: "/house", label: "House Cup", icon: Trophy, description: "Standings for all four houses." },
      { path: "/adventure", label: "Student Planner", icon: ClipboardList, description: "Your objectives, deadlines, and notes.", pinned: "top" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    icon: Landmark,
    items: [
      { path: "/library", label: "Library", icon: BookOpen, description: "Every book the castle has to offer." },
      { path: "/students", label: "Student Directory", icon: Users, description: "Everyone else walking these halls." },
      { path: "/professors", label: "Professor Directory", icon: UserSquare, description: "The staff teaching at Hogwarts." },
      { path: "/announcements", label: "Announcement Board", icon: Megaphone, description: "Notices from around the castle." },
      { path: "/policies", label: "School Policies", icon: ScrollText, description: "Rules every student agrees to." },
      { path: "/academic-calendar", label: "Academic Calendar", icon: CalendarRange, description: "Term dates, holidays, and exams." },
      // Phase 4 - Spell/Potion Archive: reference material, moved out of
      // Academics per the Phase 4 plan.
      { path: "/spells", label: "Spell Archive", icon: Wand2, description: "Search and study Hogwarts spells." },
      { path: "/potions", label: "Potion Archive", icon: FlaskConical, description: "Search and study Hogwarts potions." },
      // Phase 5 - Owlery replaces the old local-only Owl Post with real
      // cross-account messaging; lives in Resources alongside the other
      // information-center pages.
      { path: "/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages across the castle." },
    ],
  },
  {
    id: "student-services",
    label: "Student Services",
    icon: ConciergeBell,
    items: [
      { path: "/owlery-services", label: "Owlery Services", icon: Bird, description: "Owl Post sending and delivery." },
      { path: "/library-services", label: "Library Services", icon: BookCopy, description: "Loans, reservations, and reading rooms." },
      { path: "/student-support", label: "Student Support", icon: LifeBuoy, description: "Advising, housing, and welfare support." },
    ],
  },
  {
    // Phase 5 - Campus Services: the three request -> staff-review
    // workflows (Hospital Wing, Hogsmeade, Lost & Found), split out of
    // Student Services per the task's explicit nav diagram.
    id: "campus-services",
    label: "Campus Services",
    icon: Castle,
    items: [
      { path: "/hospital-wing", label: "Hospital Wing", icon: Stethoscope, description: "Medical care, day or night." },
      { path: "/hogsmeade-services", label: "Hogsmeade Services", icon: Store, description: "Village visit eligibility and approved shops." },
      { path: "/lost-and-found", label: "Lost & Found", icon: PackageSearch, description: "Items found around the castle." },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/settings", label: "Settings", icon: Settings, description: "Sound preferences, saves, and resets.", pinned: "bottom" },
    ],
  },
];

// Professor Portal Foundation - a second, parallel section list for a
// different role, grouped by professional workflow (Teaching/Engagement)
// rather than Student's life-domain grouping, per CLAUDE.md's Professor
// Portal section. Reuses the exact NavSection shape - Sidebar/MobileNavDrawer
// render this the same way they render studentNavigation, via their
// `sections` prop.
export const professorNavigation: NavSection[] = [
  {
    id: "professor-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/professor/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your teaching overview at a glance.", pinned: "top" },
    ],
  },
  {
    id: "teaching",
    label: "Teaching",
    icon: GraduationCap,
    items: [
      { path: "/professor/courses", label: "My Courses", icon: BookMarked, description: "The sections you teach this year.", pinned: "top" },
      { path: "/professor/roster", label: "Student Roster", icon: Users, description: "Everyone enrolled across your sections." },
    ],
  },
  {
    id: "coursework",
    label: "Assignments",
    icon: NotebookPen,
    items: [
      { path: "/professor/assignments", label: "Assignments", icon: NotebookPen, description: "Everything you've assigned, across every section." },
      { path: "/professor/assignments/review", label: "Review Queue", icon: ListChecks, description: "Drafts waiting for your review." },
      { path: "/professor/assignments/archive", label: "Archive", icon: Archive, description: "Past assignments, kept for reference." },
    ],
  },
  {
    id: "grading",
    label: "Grades",
    icon: Percent,
    items: [
      { path: "/professor/grades", label: "Grade Dashboard", icon: Percent, description: "Pending reviews and grading overview.", pinned: "top" },
      { path: "/professor/grades/gradebook", label: "Gradebook", icon: BookOpen, description: "Every reviewed submission, sortable by course, student, or grade." },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: Megaphone,
    items: [
      { path: "/professor/office-hours", label: "Office Hours", icon: Clock, description: "When and where students can find you." },
      { path: "/professor/announcements", label: "Course Announcements", icon: Megaphone, description: "Notices you've posted to your students." },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/professor/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "professor-profile",
    label: "Profile",
    icon: UserCircle,
    items: [
      { path: "/professor/profile", label: "Profile", icon: UserCircle, description: "Your staff identity and bio.", pinned: "bottom" },
    ],
  },
];

// Admin Portal Foundation - a third, parallel section list for a third
// role, grouped by administrative concern (Records/Operations/Insights)
// rather than either Student's life-domain or Professor's workflow
// grouping, per CLAUDE.md's Admin Portal section. Reuses the exact
// NavSection shape - Sidebar/MobileNavDrawer render this the same way, via their
// `sections` prop.
export const adminNavigation: NavSection[] = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "A school-wide overview at a glance.", pinned: "top" },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/admin/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "records",
    label: "Records",
    icon: FolderOpen,
    items: [
      { path: "/admin/students", label: "Student Records", icon: Users, description: "Browse the student directory.", pinned: "top" },
      { path: "/admin/professors", label: "Professor Records", icon: UserSquare, description: "Browse the staff directory and what they teach." },
      { path: "/admin/users", label: "User Administration", icon: UserCog, description: "Accounts, roles, and status.", pinned: "top" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Settings2,
    items: [
      { path: "/admin/course-assignments", label: "Course Assignments", icon: BookOpen, description: "Assign professors to courses." },
      { path: "/admin/services", label: "Services Management", icon: ConciergeBell, description: "Review every Student Service." },
      // Phase 6 - Communication & Administration System.
      { path: "/admin/announcements", label: "Announcement Management", icon: Megaphone, description: "Create, edit, and publish announcements." },
      { path: "/admin/service-administration", label: "Service Administration", icon: UserCheck, description: "Assign staff accounts to campus services." },
      { path: "/admin/calendar", label: "Calendar Management", icon: CalendarRange, description: "Review the Academic Calendar." },
      { path: "/admin/house-cup", label: "House Cup Management", icon: Trophy, description: "Review house standings and awards." },
      { path: "/admin/resources", label: "Resource Management", icon: Boxes, description: "Review the Library and School Policies." },
    ],
  },
  {
    id: "insights",
    label: "Analytics",
    icon: BarChart3,
    items: [
      { path: "/admin/analytics", label: "Analytics", icon: BarChart3, description: "School-wide numbers, computed from existing data." },
    ],
  },
  {
    id: "admin-profile",
    label: "Profile",
    icon: UserCircle,
    items: [
      { path: "/admin/profile", label: "Profile", icon: UserCircle, description: "Your administrative identity and bio.", pinned: "bottom" },
    ],
  },
];

// Phase 5 - Campus Services: four operational staff roles, each scoped to
// one combined dashboard page (view + process requests) per the plan's
// minimal one-page-per-role scope, plus the universal Settings item.
export const librarianNavigation: NavSection[] = [
  {
    id: "librarian-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/librarian/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Manage the catalog and book loans.", pinned: "top" },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/librarian/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "librarian-settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/librarian/settings", label: "Settings", icon: Settings, description: "Account preferences.", pinned: "bottom" },
    ],
  },
];

export const healerNavigation: NavSection[] = [
  {
    id: "healer-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/healer/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Review and process medical requests.", pinned: "top" },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/healer/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "healer-settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/healer/settings", label: "Settings", icon: Settings, description: "Account preferences.", pinned: "bottom" },
    ],
  },
];

export const caretakerNavigation: NavSection[] = [
  {
    id: "caretaker-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/caretaker/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Track lost and found items around the castle.", pinned: "top" },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/caretaker/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "caretaker-settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/caretaker/settings", label: "Settings", icon: Settings, description: "Account preferences.", pinned: "bottom" },
    ],
  },
];

export const deputyHeadmasterNavigation: NavSection[] = [
  {
    id: "deputy-headmaster-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/deputy-headmaster/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Review Hogsmeade visit permits.", pinned: "top" },
      // Bug fix - Owlery is a real cross-account inbox; every role needs a
      // reachable nav entry to it, not just students (see App.tsx).
      { path: "/deputy-headmaster/owlery", label: "Owlery", icon: Mail, description: "Send and receive messages.", pinned: "top" },
    ],
  },
  {
    id: "deputy-headmaster-settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/deputy-headmaster/settings", label: "Settings", icon: Settings, description: "Account preferences.", pinned: "bottom" },
    ],
  },
];

/** Future portals plug in here without touching Sidebar/MobileNavDrawer/Home. */
const navigationByRole: Partial<Record<PortalRole, NavSection[]>> = {
  student: studentNavigation,
  professor: professorNavigation,
  admin: adminNavigation,
  librarian: librarianNavigation,
  healer: healerNavigation,
  caretaker: caretakerNavigation,
  deputy_headmaster: deputyHeadmasterNavigation,
};

export function getNavigationForRole(role: PortalRole): NavSection[] {
  return navigationByRole[role] ?? [];
}

/** Flattens a section list into a single ordered item list, e.g. for a Quick Access grid. */
export function flattenNavigation(sections: NavSection[]): NavItem[] {
  return sections.flatMap((section) => section.items);
}

export interface SplitNavigation {
  /** Always-visible, above the collapsible sections - the handful of most-used pages. */
  top: NavItem[];
  /** Always-visible, below the collapsible sections - system-level pages (e.g. Settings). */
  bottom: NavItem[];
  /** Every section with its pinned items removed; a section left with no items is dropped entirely. */
  collapsible: NavSection[];
}

/**
 * Splits a role's section list into the pinned top/bottom rails and the
 * remaining collapsible sections - the one place that shape gets computed,
 * so Sidebar (desktop) and the mobile drawer render identically from it.
 */
export function splitNavigation(sections: NavSection[]): SplitNavigation {
  const top: NavItem[] = [];
  const bottom: NavItem[] = [];
  const collapsible: NavSection[] = [];

  for (const section of sections) {
    const remaining: NavItem[] = [];
    for (const item of section.items) {
      if (item.pinned === "top") top.push(item);
      else if (item.pinned === "bottom") bottom.push(item);
      else remaining.push(item);
    }
    if (remaining.length > 0) {
      collapsible.push({ ...section, items: remaining });
    }
  }

  return { top, bottom, collapsible };
}
