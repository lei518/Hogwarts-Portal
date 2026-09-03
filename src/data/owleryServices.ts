import type { StudentService } from "../types/studentServices";

export const owleryService: StudentService = {
  id: "owlery",
  name: "Owlery Services",
  category: "Communication",
  description:
    "The Owlery houses the school's owls and serves as the sending point for all outgoing Owl Post.",
  location: { name: "Owlery", building: "West Tower" },
  hours: { display: "24 hours" },
};

export const sendOwlPostInfo = {
  description:
    "Letters and parcels can be sent from any Owlery station - simply attach your message and choose an available owl. For your received messages, visit your Owl Post inbox.",
};

export const incomingMailInfo = {
  description:
    "Incoming mail is sorted each morning and delivered to the Great Hall during breakfast, or directly to the Owlery for parcels too large to carry to the tables.",
};

export interface RegisteredOwl {
  id: string;
  name: string;
  species: string;
  status: "Available" | "On Delivery" | "Resting";
}

export const registeredOwls: RegisteredOwl[] = [
  { id: "owl-1", name: "Errol", species: "Great Grey Owl", status: "Resting" },
  { id: "owl-2", name: "Hedwig", species: "Snowy Owl", status: "On Delivery" },
  { id: "owl-3", name: "Pigwidgeon", species: "Scops Owl", status: "Available" },
  { id: "owl-4", name: "School Owl No. 7", species: "Barn Owl", status: "Available" },
];

export const deliveryInfo = {
  description:
    "Delivery time depends on distance - expect same-day delivery within Hogsmeade and the surrounding area, and up to a few days for further destinations.",
};
