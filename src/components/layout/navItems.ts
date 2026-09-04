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
  Backpack,
  BookMarked,
  CalendarDays,
  TrendingUp,
  UserSquare,
  Megaphone,
  ScrollText,
  CalendarRange,
  NotebookPen,
  Percent,
  FileText,
  ShieldCheck,
  FileBarChart,
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
} from "lucide-react";
import type { ComponentType } from "react";

type Icon = ComponentType<{ size?: number; className?: string }>;

export interface NavItem {
  path: string;
  label: string;
  icon: Icon;
  /** Shown on the Home Quick Access widget. */
  description: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: Icon;
  items: NavItem[];
}

/**
 * Every portal role (Student today; Professor/Staff later, per CLAUDE.md)
 * gets its own section list here. Sidebar/BottomNav/Home render whichever
 * list is passed in - none of them know about roles or pages directly.
 */
export type PortalRole = "student" | "professor" | "admin";

export const studentNavigation: NavSection[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    items: [
      { path: "/dashboard", label: "Home", icon: Home, description: "Your portal homepage." },
    ],
  },
  {
    id: "my-profile",
    label: "My Profile",
    icon: User,
    items: [
      { path: "/character", label: "My Profile", icon: User, description: "Your identity, house, wand, and stats." },
      { path: "/patronus", label: "Patronus Charm", icon: Sparkles, description: "The Patronus Charm — unlocks in Year 5." },
      { path: "/achievements", label: "Achievements", icon: Award, description: "Track your milestones and unlocks." },
      { path: "/inventory", label: "Inventory", icon: Backpack, description: "Everything you're carrying." },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    items: [
      { path: "/courses", label: "Courses", icon: BookMarked, description: "Your enrolled courses this year." },
      { path: "/schedule", label: "Class Schedule", icon: CalendarDays, description: "Your weekly timetable." },
      { path: "/assignments", label: "Assignments", icon: NotebookPen, description: "Coursework across your courses." },
      { path: "/spells", label: "Spellbook", icon: Wand2, description: "Everything you've learned to cast." },
      { path: "/potions", label: "Potions", icon: FlaskConical, description: "Ingredients, recipes, and your cauldron." },
      { path: "/academic-progress", label: "Academic Progress", icon: TrendingUp, description: "Where you stand in each course." },
      // Grades & Academic Records - standalone module, see CLAUDE.md.
      { path: "/grades", label: "Grades", icon: Percent, description: "Your current grade in each course." },
      { path: "/transcript", label: "Transcript", icon: FileText, description: "Your official academic record." },
      { path: "/academic-standing", label: "Academic Standing", icon: ShieldCheck, description: "A summary of your academic performance." },
      { path: "/semester-summary", label: "Semester Summary", icon: FileBarChart, description: "An end-of-term overview." },
    ],
  },
  {
    id: "campus-life",
    label: "Campus Life",
    icon: Castle,
    items: [
      { path: "/map", label: "Campus Map", icon: MapIcon, description: "See where everyone is, right now." },
      { path: "/house", label: "House Cup", icon: Trophy, description: "Standings for all four houses." },
      { path: "/adventure", label: "Student Planner", icon: ClipboardList, description: "Your objectives, deadlines, and notes." },
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
      { path: "/announcements", label: "School Announcements", icon: Megaphone, description: "Notices from around the castle." },
      { path: "/policies", label: "School Policies", icon: ScrollText, description: "Rules every student agrees to." },
      { path: "/academic-calendar", label: "Academic Calendar", icon: CalendarRange, description: "Term dates, holidays, and exams." },
    ],
  },
  {
    id: "student-services",
    label: "Student Services",
    icon: ConciergeBell,
    items: [
      { path: "/hospital-wing", label: "Hospital Wing", icon: Stethoscope, description: "Medical care, day or night." },
      { path: "/owlery-services", label: "Owlery Services", icon: Bird, description: "Owl Post sending and delivery." },
      { path: "/library-services", label: "Library Services", icon: BookCopy, description: "Loans, reservations, and reading rooms." },
      { path: "/hogsmeade-services", label: "Hogsmeade Services", icon: Store, description: "Village visit eligibility and approved shops." },
      { path: "/lost-and-found", label: "Lost & Found", icon: PackageSearch, description: "Items found around the castle." },
      { path: "/student-support", label: "Student Support", icon: LifeBuoy, description: "Advising, housing, and welfare support." },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { path: "/settings", label: "Settings", icon: Settings, description: "Sound preferences, saves, and resets." },
    ],
  },
];

// Professor Portal Foundation - a second, parallel section list for a
// different role, grouped by professional workflow (Teaching/Engagement)
// rather than Student's life-domain grouping, per CLAUDE.md's Professor
// Portal section. Reuses the exact NavSection shape - Sidebar/BottomNav
// render this the same way they render studentNavigation, via their
// `sections` prop.
export const professorNavigation: NavSection[] = [
  {
    id: "professor-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/professor/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your teaching overview at a glance." },
    ],
  },
  {
    id: "teaching",
    label: "Teaching",
    icon: GraduationCap,
    items: [
      { path: "/professor/courses", label: "My Courses", icon: BookMarked, description: "The sections you teach this year." },
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
      { path: "/professor/grades", label: "Grade Dashboard", icon: Percent, description: "Pending reviews and grading overview." },
      { path: "/professor/grades/gradebook", label: "Gradebook", icon: BookOpen, description: "Every reviewed submission, sortable by course, student, or grade." },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: Megaphone,
    items: [
      { path: "/professor/office-hours", label: "Office Hours", icon: Clock, description: "When and where students can find you." },
      { path: "/professor/announcements", label: "Announcements", icon: Megaphone, description: "Notices you've posted to your students." },
    ],
  },
  {
    id: "professor-profile",
    label: "Profile",
    icon: UserCircle,
    items: [
      { path: "/professor/profile", label: "Profile", icon: UserCircle, description: "Your staff identity and bio." },
    ],
  },
];

// Admin Portal Foundation - a third, parallel section list for a third
// role, grouped by administrative concern (Records/Operations/Insights)
// rather than either Student's life-domain or Professor's workflow
// grouping, per CLAUDE.md's Admin Portal section. Reuses the exact
// NavSection shape - Sidebar/BottomNav render this the same way, via their
// `sections` prop.
export const adminNavigation: NavSection[] = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "A school-wide overview at a glance." },
    ],
  },
  {
    id: "records",
    label: "Records",
    icon: FolderOpen,
    items: [
      { path: "/admin/students", label: "Student Records", icon: Users, description: "Browse the student directory." },
      { path: "/admin/professors", label: "Professor Records", icon: UserSquare, description: "Browse the staff directory and what they teach." },
      { path: "/admin/users", label: "User Administration", icon: UserCog, description: "Accounts, roles, and status." },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Settings2,
    items: [
      { path: "/admin/services", label: "Services Management", icon: ConciergeBell, description: "Review every Student Service." },
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
      { path: "/admin/profile", label: "Profile", icon: UserCircle, description: "Your administrative identity and bio." },
    ],
  },
];

/** Future portals plug in here without touching Sidebar/BottomNav/Home. */
const navigationByRole: Partial<Record<PortalRole, NavSection[]>> = {
  student: studentNavigation,
  professor: professorNavigation,
  admin: adminNavigation,
};

export function getNavigationForRole(role: PortalRole): NavSection[] {
  return navigationByRole[role] ?? [];
}

/** Flattens a section list into a single ordered item list, e.g. for a Quick Access grid. */
export function flattenNavigation(sections: NavSection[]): NavItem[] {
  return sections.flatMap((section) => section.items);
}
