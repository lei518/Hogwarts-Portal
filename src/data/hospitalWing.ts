import type { StudentService } from "../types/studentServices";

// Standalone from Campus Life's Location entry for the same place on
// purpose - see CLAUDE.md's Student Services section for why.
export const hospitalWingService: StudentService = {
  id: "hospital-wing",
  name: "Hospital Wing",
  category: "Medical",
  description:
    "The school's medical facility, staffed around the clock for injuries, ailments, and the occasional curse gone wrong.",
  location: { name: "Hospital Wing", building: "First Floor, East Wing" },
  hours: { display: "24 hours" },
};

export const matron = { name: "Madam Pomfrey", title: "School Matron" };

export interface HospitalService {
  id: string;
  name: string;
  description: string;
}

export const availableServices: HospitalService[] = [
  {
    id: "general-treatment",
    name: "General Treatment",
    description: "Treatment for common injuries, potion mishaps, and minor curses or hexes.",
  },
  {
    id: "pepper-up-dispensary",
    name: "Pepper-Up Dispensary",
    description: "Cold and flu relief during the winter months.",
  },
  {
    id: "antidote-preparation",
    name: "Antidote Preparation",
    description: "Countermeasures for common poisons and magical creature bites.",
  },
];

export const emergencyCare = {
  description:
    "For emergencies outside a professor's ability to treat, have a fellow student fetch Madam Pomfrey immediately, or send word by the nearest portrait. The Hospital Wing treats emergencies at any hour, day or night.",
};

export interface RecoveryRoom {
  id: string;
  name: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
}

export const recoveryRooms: RecoveryRoom[] = [
  { id: "room-1", name: "Recovery Room 1", capacity: 4, status: "Available" },
  { id: "room-2", name: "Recovery Room 2", capacity: 4, status: "Occupied" },
  { id: "room-3", name: "Quiet Recovery Room", capacity: 1, status: "Available" },
];
