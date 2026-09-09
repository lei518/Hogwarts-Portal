import type { ProfessorsRepository } from "./interfaces/repositoryTypes";
import type { Professor } from "../types/resources";
import { listDirectoryProfiles } from "../services/supabase";
import { coursesRepository } from "./coursesRepository";

// Phase 7A - Live Academic Data. The Professor Directory now reads real
// accounts from `profiles` instead of the seeded data/professors.ts array.
// Office hours/bio/research interests are left undefined for a real
// account - no seeded flavor text is fabricated; ProfessorDetail.tsx shows
// a reserved "not yet provided" section instead.
function toProfessor(profile: { userId: string; displayName: string }): Professor {
  return { id: profile.userId, name: profile.displayName, title: "Professor" };
}

export const professorsRepository: ProfessorsRepository = {
  getAll: async () => (await listDirectoryProfiles("professor")).map(toProfessor),
  getById: async (id) => {
    const profiles = await listDirectoryProfiles("professor");
    const match = profiles.find((profile) => profile.userId === id);
    return match ? toProfessor(match) : undefined;
  },
  getCoursesForProfessor: async (professorId) => coursesRepository.getForProfessor(professorId),
};
