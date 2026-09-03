import { useGame } from "../../context/GameContext";
import { WelcomeWidget } from "../../components/dashboard/widgets/WelcomeWidget";
import { CurrentFocusWidget } from "../../components/dashboard/widgets/CurrentFocusWidget";
import { TodaysScheduleWidget } from "../../components/dashboard/widgets/TodaysScheduleWidget";
import { HouseCupSummaryWidget } from "../../components/dashboard/widgets/HouseCupSummaryWidget";
import { RecentOwlPostWidget } from "../../components/dashboard/widgets/RecentOwlPostWidget";
import { SchoolAnnouncementsWidget } from "../../components/dashboard/widgets/SchoolAnnouncementsWidget";
import { QuickAccessWidget } from "../../components/dashboard/widgets/QuickAccessWidget";

// The portal homepage: composes widgets, owns no data of its own. Adding a
// future widget (Assignments, Grades, Quidditch Season, ...) means writing
// one new widget component and adding one line to the grid below.
export function Dashboard() {
  const { state } = useGame();
  const { character } = state;

  if (!character || !character.house) return null;

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <WelcomeWidget />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrentFocusWidget />
        <TodaysScheduleWidget />
        <HouseCupSummaryWidget />
        <RecentOwlPostWidget />
        <SchoolAnnouncementsWidget />
      </div>

      <QuickAccessWidget />

      <p className="text-parchment-dim text-xs">
        {character.discoveredLocations.length} of 17 locations discovered.
      </p>
    </div>
  );
}
