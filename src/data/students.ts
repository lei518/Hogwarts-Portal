import type { House } from "../types/game";

// Phase 7A - Live Academic Data. No seeded students anymore (see Part 1 -
// the Student Directory now reads real accounts through
// repositories/studentsRepository.ts, which builds this exact shape from
// live profiles). This file keeps only the shared `Student` type and an
// empty array/no-op lookup as a safe fallback for the one remaining legacy
// consumer (components/adventure/AdventureSceneModal.tsx's relationship-
// reward text), which degrades to showing a raw id rather than crashing.
export interface Student {
  id: string;
  name: string;
  house: House | null;
  year: number | null;
}

export const students: Student[] = [];

export function getStudent(id: string): Student | undefined {
  return students.find((student) => student.id === id);
}
