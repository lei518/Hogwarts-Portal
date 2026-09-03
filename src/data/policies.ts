import type { Policy, PolicyCategory } from "../types/resources";

export const policyCategories: PolicyCategory[] = ["Conduct", "Safety", "Academic", "Access"];

export const policies: Policy[] = [
  {
    id: "code-of-conduct",
    title: "Student Code of Conduct",
    category: "Conduct",
    summary: "The baseline expectations for behavior toward staff, students, and the castle itself.",
    body: "Students are expected to treat staff, fellow students, and the castle's creatures and portraits with respect. Deliberate rule-breaking may result in a loss of house points or detention, at a professor's discretion.",
  },
  {
    id: "curfew-and-common-rooms",
    title: "Curfew & Common Room Hours",
    category: "Conduct",
    summary: "Students must be in their house common room after curfew unless authorized otherwise.",
    body: "Curfew begins at 9:00 PM on weeknights and 11:00 PM on weekends. Prefects and Heads of House may grant exceptions for legitimate academic or extracurricular reasons.",
  },
  {
    id: "forbidden-forest-and-restricted-areas",
    title: "Forbidden Forest & Restricted Areas",
    category: "Safety",
    summary: "The Forbidden Forest and certain areas of the castle are off-limits to students at all times.",
    body: "The Forbidden Forest is forbidden to all students without staff supervision, regardless of year. Other restricted areas are marked accordingly on the Campus Map. Violations are treated as a safety matter, not just a conduct one.",
  },
  {
    id: "hogsmeade-visits",
    title: "Hogsmeade Visit Eligibility",
    category: "Access",
    summary: "Hogsmeade visits are limited to third-year students and above with a signed permission form.",
    body: "Only students in their third year or later may visit Hogsmeade, and only on scheduled weekends. A permission form signed by a parent or guardian must be on file with the Head of House.",
  },
  {
    id: "academic-integrity",
    title: "Academic Integrity",
    category: "Academic",
    summary: "Coursework must be a student's own work; copying or unauthorized magical assistance is not permitted.",
    body: "All coursework, once assignments are introduced, must reflect a student's own understanding. Using an unauthorized charm, potion, or another student's work to complete an assignment is treated as a serious academic offense.",
  },
];

export function getPolicy(id: string): Policy | undefined {
  return policies.find((policy) => policy.id === id);
}
