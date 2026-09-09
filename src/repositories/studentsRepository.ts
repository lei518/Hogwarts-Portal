import type { StudentsRepository } from "./interfaces/repositoryTypes";
import type { Student } from "../data/students";
import { listDirectoryProfiles } from "../services/supabase";

// Phase 7A - Live Academic Data. The Student Directory now reads real
// accounts from `profiles` (via the "authenticated can view active
// profiles" RLS policy - see supabase/migrations/0004_academic_live_data.sql)
// instead of the seeded data/students.ts array. Only real fields are
// carried over - no traits/favoriteSubjects/friends/rivals/bio, since a
// real account has none of those and inventing them would be fabrication.
function toStudent(profile: { userId: string; displayName: string; house: Student["house"]; year: Student["year"] }): Student {
  return { id: profile.userId, name: profile.displayName, house: profile.house, year: profile.year };
}

export const studentsRepository: StudentsRepository = {
  getAll: async () => (await listDirectoryProfiles("student")).map(toStudent),
  getById: async (id) => {
    const profiles = await listDirectoryProfiles("student");
    const match = profiles.find((profile) => profile.userId === id);
    return match ? toStudent(match) : undefined;
  },
};
