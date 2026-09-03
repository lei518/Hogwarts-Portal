// Campus Life foundation - see CLAUDE.md's Campus Life section.
import type { House } from "./game";

export type LocationCategory =
  | "Academic"
  | "Residential"
  | "Social"
  | "Recreational"
  | "Outdoors"
  | "Administrative";

export type LocationAvailability = "Open" | "Restricted" | "By Appointment";

// Who or what awarded the points - deliberately a free-text label (not a
// closed union) so Quidditch, a professor, an assignment grade, or any
// future automated system can identify itself without a type change here.
export interface HousePointAward {
  id: string;
  house: House;
  amount: number; // positive = award, negative = deduction
  reason: string;
  awardedBy: string;
  timestamp: string;
}

export interface PersonalNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  text: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

// Not built yet (see CLAUDE.md) - reserved so Library, Hospital Wing,
// Owlery, Great Hall, Common Room, and Hogsmeade can become their own
// discoverable portal services later without a data model change. A
// service optionally points back at the Location it's physically found in.
export interface PortalService {
  id: string;
  name: string;
  description: string;
  locationId?: string;
}
