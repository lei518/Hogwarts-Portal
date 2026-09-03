import type { StudentService } from "../types/studentServices";

export const hogsmeadeServicesService: StudentService = {
  id: "hogsmeade-services",
  name: "Hogsmeade Services",
  category: "Campus Access",
  description: "Information and services related to student visits to Hogsmeade village.",
  location: { name: "Hogsmeade Village" },
  hours: { display: "Selected weekends only, during daylight hours" },
};

export const eligibility = {
  description:
    "Open to third-year students and above with a signed permission form on file with their Head of House.",
};

export const visitRequirements: string[] = [
  "Signed parent or guardian permission form on file with your Head of House",
  "Student must be in good standing (see Academic Standing)",
  "Return to the castle grounds by curfew",
];

export const authorizedVisitDays: string[] = [
  "First weekend of term",
  "Halloween weekend",
  "Pre-holiday weekend",
];

export interface ApprovedShop {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const approvedShops: ApprovedShop[] = [
  {
    id: "honeydukes",
    name: "Honeydukes",
    category: "Sweets",
    description: "The village's famous sweet shop, known for chocolate frogs and every-flavour beans.",
  },
  {
    id: "zonkos",
    name: "Zonko's Joke Shop",
    category: "Novelties",
    description: "Practical jokes and magical novelties, popular with students of every year.",
  },
  {
    id: "three-broomsticks",
    name: "Three Broomsticks",
    category: "Dining",
    description: "A warm pub serving butterbeer and hot meals.",
  },
  {
    id: "scrivenshafts",
    name: "Scrivenshaft's Quill Shop",
    category: "Stationery",
    description: "Quills, ink, and parchment for every subject.",
  },
];
