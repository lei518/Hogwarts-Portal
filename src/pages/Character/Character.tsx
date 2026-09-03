import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  Wand2,
  Sparkles,
  BarChart3,
  GraduationCap,
  Backpack,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { houseInfo } from "../../data/sortingQuestions";
import { achievements } from "../../data/achievements";
import { courses } from "../../data/courses";
import { getCourseStatus, getSpellMasterySummary } from "../../utils/academics";
import { getFullName } from "../../utils/character";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

export function CharacterPage() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { character } = state;

  if (!character || !character.house || !character.wand) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl text-gold-bright mb-4">No character yet</h1>
        <p className="text-parchment-dim mb-8">
          You haven't created a Hogwarts character yet.
        </p>
        <Button onClick={() => navigate("/create-character")}>Begin Journey</Button>
      </div>
    );
  }

  const house = houseInfo[character.house];
  const unlockedAchievements = achievements.filter((a) => character.achievements.includes(a.id));
  const completedCourses = courses.filter(
    (course) => getCourseStatus(character, course) === "Completed"
  ).length;

  // Extensible on purpose: a future stat (Health, Mana, Stamina, Knowledge, ...)
  // is one more entry here, not a layout change.
  const stats: { label: string; value: string }[] = [
    { label: "Level", value: String(character.level) },
    { label: "XP", value: `${character.xp} / ${character.xpToNextLevel}` },
    { label: "Coins", value: String(character.coins) },
  ];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Student Information - the page's masthead, not a summary card. */}
      <section
        className="rounded-sm border overflow-hidden"
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
              {house.emoji} {character.house} &middot; Year {character.year}
            </p>
          </div>
        </div>

        <div className="bg-void/60 px-6 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
          <ProfileField label="First Name" value={character.firstName} />
          <ProfileField label="Last Name" value={character.lastName} />
          <ProfileField label="Gender" value={formatGender(character.gender)} />
          <ProfileField label="Year" value={`Year ${character.year}`} />
          <ProfileField
            label="House"
            value={
              <span style={{ color: house.colors.secondary }}>
                {house.emoji} {character.house}
              </span>
            }
          />
          <ProfileField label="Blood Status" value={character.bloodStatus ?? "Not yet determined"} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProfileSection title="Magical Identity" icon={Wand2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileField
              label="Wand"
              value={
                <>
                  {character.wand.wood} &middot; {character.wand.core}
                  <span className="block text-parchment-dim text-sm font-body">
                    {character.wand.lengthInches}" &middot; {character.wand.flexibility}
                  </span>
                </>
              }
            />
            <ProfileField
              label="Patronus"
              value={
                character.patronus
                  ? `${character.patronus.icon} ${character.patronus.name}`
                  : character.year < 5
                    ? "Unlocks in Year 5"
                    : "Not yet cast"
              }
            />
          </div>
        </ProfileSection>

        <ProfileSection title="Character Statistics" icon={BarChart3}>
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-parchment-dim/20 rounded-sm py-3">
                <p className="text-parchment font-display">{stat.value}</p>
                <p className="text-parchment-dim text-xs uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Academic Summary" icon={GraduationCap}>
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Current Year" value={`Year ${character.year}`} />
            <ProfileField
              label="Current House"
              value={
                <span style={{ color: house.colors.secondary }}>
                  {house.emoji} {character.house}
                </span>
              }
            />
            <ProfileField label="Academic Standing" value="—" />
            <ProfileField label="Completed Classes" value={`${completedCourses} of ${courses.length}`} />
            <ProfileField label="Spell Mastery" value={getSpellMasterySummary(character)} />
          </div>
          <p className="text-parchment-dim text-xs mt-4">
            Academic Standing will appear here once grades and exams are available.
          </p>
        </ProfileSection>

        <ProfileSection title="Inventory Summary" icon={Backpack}>
          <p className="text-parchment text-sm mb-1">
            {character.inventory.length} item{character.inventory.length === 1 ? "" : "s"} carried
          </p>
          {character.inventory.length > 0 ? (
            <p className="text-parchment-dim text-xs mb-4 truncate">
              {character.inventory
                .slice(0, 4)
                .map((item) => item.name)
                .join(", ")}
              {character.inventory.length > 4 ? ", ..." : ""}
            </p>
          ) : (
            <p className="text-parchment-dim text-xs mb-4">Your bag is empty for now.</p>
          )}
          <Button variant="secondary" onClick={() => navigate("/inventory")}>
            View Inventory
          </Button>
        </ProfileSection>

        <ProfileSection title="Achievements Summary" icon={Sparkles}>
          <p className="text-parchment text-sm mb-1">
            {unlockedAchievements.length} of {achievements.length} unlocked
          </p>
          {unlockedAchievements.length > 0 ? (
            <p className="text-parchment-dim text-xs mb-4 truncate">
              {unlockedAchievements
                .slice(-3)
                .map((a) => `${a.emoji} ${a.title}`)
                .join(" · ")}
            </p>
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
