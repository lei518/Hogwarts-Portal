import type { StudentService } from "../types/studentServices";

export const lostAndFoundService: StudentService = {
  id: "lost-and-found",
  name: "Lost & Found",
  category: "Lost & Found",
  description: "Items found around the castle grounds are logged here until claimed by their owner.",
  location: { name: "Lost & Found Office", building: "Near the Great Hall" },
  hours: { display: "8:00 AM – 6:00 PM, daily" },
};

export interface LostFoundItem {
  id: string;
  name: string;
  description: string;
  foundLocation: string;
  foundDate: string;
  status: "Unclaimed" | "Claimed";
  claimedBy?: string;
}

export const lostFoundItems: LostFoundItem[] = [
  {
    id: "item-1",
    name: "Silver Locket",
    description: "A small silver locket on a chain, no visible inscription.",
    foundLocation: "Great Hall",
    foundDate: "2026-09-02",
    status: "Unclaimed",
  },
  {
    id: "item-2",
    name: "Charms Textbook",
    description: "First-year Standard Book of Spells, name worn off the cover.",
    foundLocation: "Charms Classroom",
    foundDate: "2026-09-01",
    status: "Unclaimed",
  },
  {
    id: "item-3",
    name: "Single Dragonhide Glove",
    description: "A right-handed dragonhide glove, well used.",
    foundLocation: "Potions Classroom",
    foundDate: "2026-08-29",
    status: "Unclaimed",
  },
  {
    id: "item-4",
    name: "Gryffindor Scarf",
    description: "House scarf, slightly frayed at one end.",
    foundLocation: "Quidditch Pitch",
    foundDate: "2026-08-25",
    status: "Claimed",
    claimedBy: "Returned to owner",
  },
];
