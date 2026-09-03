export interface Npc {
  id: string;
  name: string;
  role: string;
  emoji: string;
  locationId: string;
}

export const initialNpcs: Npc[] = [
  { id: "npc-1", name: "Aria Bellweather", role: "Gryffindor, Year 3", emoji: "🧙", locationId: "great-hall" },
  { id: "npc-2", name: "Corin Ashford", role: "Ravenclaw, Year 4", emoji: "📖", locationId: "library" },
  { id: "npc-3", name: "Wren Thistledown", role: "Hufflepuff, Year 2", emoji: "🌿", locationId: "greenhouses" },
  { id: "npc-4", name: "Silas Voss", role: "Slytherin, Year 5", emoji: "🐍", locationId: "dungeons" },
  { id: "npc-5", name: "Professor Elowen Hart", role: "Charms Professor", emoji: "🪄", locationId: "charms-classroom" },
  { id: "npc-6", name: "Professor Casimir Rowe", role: "Potions Professor", emoji: "🧪", locationId: "dungeons" },
  { id: "npc-7", name: "Marlowe Finch", role: "Gryffindor, Year 3", emoji: "🧹", locationId: "quidditch-pitch" },
  { id: "npc-8", name: "Ione Sharpe", role: "Ravenclaw, Year 3", emoji: "🔭", locationId: "astronomy-tower" },
];

// Locations NPCs are allowed to wander between during simulated movement.
export const wanderableLocationIds = [
  "great-hall",
  "library",
  "greenhouses",
  "dungeons",
  "charms-classroom",
  "transfiguration-classroom",
  "dada-classroom",
  "quidditch-pitch",
  "astronomy-tower",
  "gryffindor-common-room",
  "hufflepuff-common-room",
  "ravenclaw-common-room",
  "slytherin-common-room",
];
