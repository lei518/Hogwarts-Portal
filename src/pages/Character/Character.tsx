import { useNavigate } from "react-router-dom";
import { UserCircle, Wand2, Sparkles, GraduationCap, IdCard } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { houseInfo } from "../../data/sortingQuestions";
import { achievements } from "../../data/achievements";
import { getFullName, formatYearOrdinal, getStudentId } from "../../utils/character";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

// Phase 3 - Profile Cleanup & University Identity System. The Student
// Profile is now a Hogwarts university record, not an RPG character sheet:
// Personal Information (real identity), Academic Information (House/Year/
// Current Courses), and Magical Information (Wand/Patronus, the one part
// of the old "Character" sheet that genuinely fits a Hogwarts university).
// No level/XP/coins/inventory - see CLAUDE.md and the Phase 3 plan.
export function CharacterPage() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { character } = state;
  const { user, profile } = useAuth();
  const { courses, professorsById, loading } = useAcademicData();

  // Year-Based Onboarding (Phase 6L): a signed-in student's Character is
  // synthesized automatically and always gets a house (either from the
  // Sorting Hat, or Admin-assigned for Year 2-7) before ever reaching
  // portal territory - see JourneyGate. `!character.house` staying here is
  // cheap defense against `houseInfo[...]` below crashing on an
  // unexpected null, not a normal code path. `wand` is deliberately NOT
  // required: most students (Year 2-7) never get one, since the Wand
  // Ceremony is Year-1-only - see the "Magical Information" section below,
  // which shows "Not Assigned" instead.
  if (!character || !character.house) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl text-gold-bright mb-4">Profile Still Loading</h1>
        <p className="text-parchment-dim mb-8">
          Your profile is still being set up. Try refreshing, or contact an administrator if
          this persists.
        </p>
      </div>
    );
  }

  const house = houseInfo[character.house];
  const unlockedAchievements = achievements.filter((a) => character.achievements.includes(a.id));
  const currentCourses = courses.filter((course) => course.requiredYear <= character.year);
  const studentId = user ? getStudentId(character, user.id) : "Not yet assigned";
  const enrollmentStatus = profile?.status === "Active" ? "Active Student" : (profile?.status ?? "Unknown");

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Student Information - the page's masthead, not a summary card. */}
      <section
        className="rounded-lg border overflow-hidden shadow-sm shadow-black/20"
        style={{ borderColor: `${house.colors.secondary}55` }}
      >
        <div
          className="px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            background: `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`,
          }}
        >
          <div className="w-24 h-24 rounded-full border-2 border-parchment/40 bg-void/40 flex flex-col items-center justify-center shrink-0">
            <UserCircle size={40} className="text-parchment/60" />
            <p className="text-parchment/50 text-[9px] uppercase tracking-wide mt-1">
              No portrait
            </p>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-parchment/70 text-xs uppercase tracking-[0.2em] mb-1">
              Student Record
            </p>
            <h1 className="text-2xl md:text-3xl font-display text-parchment mb-1">
              {getFullName(character)}
            </h1>
            <p className="text-lg" style={{ color: house.colors.secondary }}>
              {character.house} &middot; {formatYearOrdinal(character.year)} Year
            </p>
          </div>
        </div>

        <div className="bg-void/50 px-6 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
          <ProfileField label="First Name" value={character.firstName} />
          <ProfileField label="Last Name" value={character.lastName} />
          <ProfileField label="Gender" value={formatGender(character.gender)} />
          <ProfileField label="Blood Status" value={character.bloodStatus ?? "Not yet determined"} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProfileSection title="Personal Information" icon={IdCard}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileField label="Full Name" value={getFullName(character)} />
            <ProfileField label="Email" value={user?.email ?? "Not on file"} />
            <ProfileField label="Student ID" value={studentId} />
            <ProfileField label="Enrollment Status" value={enrollmentStatus} />
          </div>
        </ProfileSection>

        <ProfileSection title="Academic Information" icon={GraduationCap}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
            <ProfileField
              label="House"
              value={<span style={{ color: house.colors.secondary }}>{character.house}</span>}
            />
            <ProfileField label="Year" value={`${formatYearOrdinal(character.year)} Year`} />
          </div>
          <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Current Courses</p>
          {loading ? (
            <p className="text-parchment-dim text-sm">Loading courses…</p>
          ) : currentCourses.length === 0 ? (
            <p className="text-parchment-dim text-sm">No courses assigned.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {currentCourses.map((course) => (
                <li key={course.id} className="text-sm text-parchment truncate">
                  {course.name}
                  <span className="text-parchment-dim">
                    {" "}
                    &middot; {course.professorId ? (professorsById.get(course.professorId)?.name ?? "To Be Assigned") : "To Be Assigned"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ProfileSection>

        <ProfileSection title="Magical Information" icon={Wand2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileField
              label="Wand"
              value={
                character.wand ? (
                  <>
                    {character.wand.wood} &middot; {character.wand.core}
                    <span className="block text-parchment-dim text-sm font-body">
                      {character.wand.lengthInches}" &middot; {character.wand.flexibility}
                    </span>
                  </>
                ) : (
                  "Not Assigned"
                )
              }
            />
            <ProfileField
              label="Patronus"
              value={
                character.patronus
                  ? `${character.patronus.icon} ${character.patronus.name}`
                  : "Not Yet Discovered"
              }
            />
          </div>
        </ProfileSection>

        <ProfileSection title="Achievements Summary" icon={Sparkles}>
          <p className="text-parchment text-sm mb-1">
            {unlockedAchievements.length} of {achievements.length} unlocked
          </p>
          {unlockedAchievements.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-parchment-dim text-xs mb-4">
              {unlockedAchievements.slice(-3).map((a) => (
                <span key={a.id} className="flex items-center gap-1.5">
                  <a.icon size={12} className="text-gold/80" />
                  {a.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-parchment-dim text-xs mb-4">No achievements unlocked yet.</p>
          )}
          <Button variant="secondary" onClick={() => navigate("/achievements")}>
            View Achievements
          </Button>
        </ProfileSection>
      </div>
    </div>
  );
}

function formatGender(gender: string): string {
  if (gender === "unspecified") return "Prefer not to say";
  return gender
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}
