import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { getLocation } from "../../data/locations";
import { getAdventureByLocation, type Adventure } from "../../data/adventures";
import { getCourse } from "../../data/courses";
import { initialNpcs } from "../../data/npcs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LocationIllustration } from "../../components/map/LocationIllustration";
import { AdventureSceneModal } from "../../components/adventure/AdventureSceneModal";
import { ProfileField } from "../../components/character/ProfileSection";

// The canonical "everything about this place" page - Campus Map's marker
// click lands here instead of launching gameplay directly. Visiting marks
// the location discovered (a directory entry doesn't need a separate
// "discover" button); starting its story, if it has one, stays a deliberate
// action below.
export function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null);

  const location = locationId ? getLocation(locationId) : undefined;

  useEffect(() => {
    if (!location) return;
    if (!state.character?.discoveredLocations.includes(location.id)) {
      dispatch({ type: "DISCOVER_LOCATION", payload: location.id });
    }
    // Only re-run when the visited location changes, not on every state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.id]);

  if (!state.character) return null;

  if (!location) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Location Not Found</h1>
        <Link to="/map" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Campus Map
        </Link>
      </div>
    );
  }

  const npcsHere = initialNpcs.filter((npc) => npc.locationId === location.id);
  const adventure = getAdventureByLocation(location.id);
  const adventureLocked = adventure ? adventure.requiredYear > state.character.year : false;
  const completedQuestIds = new Set(
    state.character.quests.filter((q) => q.completed).map((q) => q.id)
  );
  const adventureCompleted = adventure
    ? Object.values(adventure.scenes).some(
        (scene) => scene.isEnding && completedQuestIds.has(`${adventure.id}:${scene.id}`)
      )
    : false;

  const relatedCourses = (location.relatedCourseIds ?? [])
    .map((id) => getCourse(id))
    .filter((course) => course !== undefined);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <button
        onClick={() => navigate("/map")}
        className="flex items-center gap-1.5 text-gold hover:text-gold-bright text-xs text-left w-fit"
      >
        <ArrowLeft size={14} />
        Back to Campus Map
      </button>

      <Card as="section" className="overflow-hidden">
        <div className="relative">
          <LocationIllustration locationId={location.id} />
          {npcsHere.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              {npcsHere.map((npc) => (
                <span
                  key={npc.id}
                  className="flex items-center gap-1.5 bg-ink/85 border border-gold/30 rounded-full px-2.5 py-1 text-xs text-parchment backdrop-blur-sm"
                >
                  {npc.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 text-gold-bright mb-3">
            <MapPin size={19} />
          </span>
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-3">{location.name}</h1>
          <p className="text-parchment-dim text-sm leading-relaxed mb-5">{location.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <ProfileField label="Category" value={location.category} />
            <ProfileField label="Availability" value={location.availability} />
            <ProfileField label="Opening Hours" value={location.openingHours} />
          </div>

          {relatedCourses.length > 0 && (
            <div className="mb-4">
              <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">
                Related Courses
              </p>
              <div className="flex flex-wrap gap-2">
                {relatedCourses.map((course) => (
                  <Link key={course!.id} to={`/courses/${course!.id}`}>
                    <Badge className="hover:border-gold hover:text-gold-bright transition-colors cursor-pointer">
                      {course!.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {location.relatedServices && location.relatedServices.length > 0 && (
            <div className="mb-2">
              <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">
                Related Services
              </p>
              <div className="flex flex-wrap gap-2">
                {location.relatedServices.map((service) => (
                  <Badge key={service}>{service}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {npcsHere.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-2">Here now</p>
            <ul className="flex flex-col gap-1">
              {npcsHere.map((npc) => (
                <li key={npc.id} className="text-sm text-parchment">
                  {npc.name} &middot; {npc.role}
                </li>
              ))}
            </ul>
          </div>
        )}

        {adventure && (
          <div className="border-t border-parchment-dim/10 px-6 py-5">
            {adventureLocked ? (
              <p className="text-parchment-dim text-xs flex items-center gap-1.5">
                <Lock size={13} />
                {adventure.title} unlocks at Year {adventure.requiredYear}
              </p>
            ) : (
              <Button variant="secondary" onClick={() => setActiveAdventure(adventure)} className="w-full">
                <Sparkles size={15} />
                {adventure.title}
                {adventureCompleted ? " (Replay)" : ""}
              </Button>
            )}
          </div>
        )}
      </Card>

      {activeAdventure && (
        <AdventureSceneModal adventure={activeAdventure} onClose={() => setActiveAdventure(null)} />
      )}
    </div>
  );
}
