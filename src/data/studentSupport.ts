import type { StudentService } from "../types/studentServices";

export const studentSupportService: StudentService = {
  id: "student-support",
  name: "Student Support",
  category: "Advising",
  description: "Support services for academic, personal, and welfare matters.",
  location: { name: "Student Support Office", building: "Near the Great Hall" },
  hours: { display: "9:00 AM – 5:00 PM, weekdays" },
};

export interface SupportService {
  id: string;
  name: string;
  description: string;
  contact: string;
}

export const supportServices: SupportService[] = [
  {
    id: "academic-advising",
    name: "Academic Advising",
    description: "Guidance on course selection, course load, and academic planning.",
    contact: "Your Head of House",
  },
  {
    id: "guidance-office",
    name: "Guidance Office",
    description: "General guidance for personal or school-related concerns.",
    contact: "Guidance Office, Ground Floor",
  },
  {
    id: "housing-support",
    name: "Housing Support",
    description: "Support for common room, dormitory, and house-related matters.",
    contact: "Your Head of House",
  },
  {
    id: "student-welfare",
    name: "Student Welfare",
    description: "Confidential support for student wellbeing.",
    contact: "Student Welfare Office, Ground Floor",
  },
];
