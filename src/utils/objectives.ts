import type { Character } from "../types/character";
import type { Objective } from "../types/objectives";
import { locations } from "../data/locations";
import { getAdventureByLocation } from "../data/adventures";

// Every system that wants to surface a "current objective" implements one
// of these and gets added to `objectiveProviders` below - Home's Current
// Focus widget and the Student Planner both just call getCurrentObjectives
// and render whatever comes back, so neither has to change when a new
// provider (Academics, Events, House Cup, Assignments, Tutorials, ...) is
// added here.
export type ObjectiveProvider = (character: Character) => Objective[];

// Campus Map's contribution: the next unvisited, year-eligible location.
function getExplorationObjectives(character: Character): Objective[] {
  const nextLocation = locations.find((location) => {
    if (character.discoveredLocations.includes(location.id)) return false;
    const adventure = getAdventureByLocation(location.id);
    return !adventure || adventure.requiredYear <= character.year;
  });

  if (!nextLocation) return [];

  return [
    {
      id: `explore:${nextLocation.id}`,
      title: `Visit the ${nextLocation.name}`,
      description: "There's more of the castle waiting for you to explore.",
      source: "Campus Map",
      actionPath: `/map/${nextLocation.id}`,
      actionLabel: "Open Location",
    },
  ];
}

// Add a provider here for each future system, e.g.:
//   const objectiveProviders: ObjectiveProvider[] = [
//     getExplorationObjectives,
//     getAcademicsObjectives,
//     getEventObjectives,
//     getHouseCupObjectives,
//   ];
const objectiveProviders: ObjectiveProvider[] = [getExplorationObjectives];

export function getCurrentObjectives(character: Character): Objective[] {
  return objectiveProviders.flatMap((provider) => provider(character));
}
