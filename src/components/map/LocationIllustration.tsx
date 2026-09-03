import type { ComponentType } from "react";
import { IllustrationFrame } from "./illustrations/IllustrationFrame";
import {
  AstronomyTowerScene,
  CharmsClassroomScene,
  DadaClassroomScene,
  DungeonsScene,
  ForbiddenForestScene,
  GreatHallScene,
  GreatLakeScene,
  GreenhousesScene,
  GryffindorCommonRoomScene,
  HogsmeadeScene,
  HufflepuffCommonRoomScene,
  LibraryScene,
  QuidditchPitchScene,
  RavenclawCommonRoomScene,
  RoomOfRequirementScene,
  SlytherinCommonRoomScene,
  TransfigurationClassroomScene,
} from "./illustrations/scenes";

interface IllustrationDef {
  Scene: ComponentType;
  from: string;
  to: string;
  accent: string;
}

const illustrations: Record<string, IllustrationDef> = {
  "great-hall": { Scene: GreatHallScene, from: "#2a2013", to: "#130d07", accent: "#e6c568" },
  library: { Scene: LibraryScene, from: "#241c12", to: "#120d08", accent: "#d9a441" },
  "charms-classroom": {
    Scene: CharmsClassroomScene,
    from: "#1c2233",
    to: "#0d0f16",
    accent: "#9fb8d9",
  },
  "astronomy-tower": {
    Scene: AstronomyTowerScene,
    from: "#0d1330",
    to: "#05070f",
    accent: "#b9c9e6",
  },
  "room-of-requirement": {
    Scene: RoomOfRequirementScene,
    from: "#1a1420",
    to: "#0a0710",
    accent: "#9d7fd4",
  },
  "ravenclaw-common-room": {
    Scene: RavenclawCommonRoomScene,
    from: "#101a33",
    to: "#070b16",
    accent: "#946b2d",
  },
  "transfiguration-classroom": {
    Scene: TransfigurationClassroomScene,
    from: "#16211a",
    to: "#0a120c",
    accent: "#8fae6b",
  },
  "dada-classroom": {
    Scene: DadaClassroomScene,
    from: "#16191b",
    to: "#0a0c0d",
    accent: "#5c7a7a",
  },
  "gryffindor-common-room": {
    Scene: GryffindorCommonRoomScene,
    from: "#3a1210",
    to: "#170705",
    accent: "#d3a625",
  },
  "hufflepuff-common-room": {
    Scene: HufflepuffCommonRoomScene,
    from: "#2e2410",
    to: "#150f06",
    accent: "#ecb939",
  },
  "slytherin-common-room": {
    Scene: SlytherinCommonRoomScene,
    from: "#0d2318",
    to: "#06120c",
    accent: "#3f8a5c",
  },
  dungeons: { Scene: DungeonsScene, from: "#1a1a1c", to: "#0a0a0b", accent: "#8b2e2e" },
  greenhouses: {
    Scene: GreenhousesScene,
    from: "#14261a",
    to: "#0a140d",
    accent: "#4f7a5f",
  },
  "quidditch-pitch": {
    Scene: QuidditchPitchScene,
    from: "#16223a",
    to: "#0a101d",
    accent: "#d3a625",
  },
  "forbidden-forest": {
    Scene: ForbiddenForestScene,
    from: "#0c130c",
    to: "#050805",
    accent: "#7a9b5a",
  },
  "great-lake": { Scene: GreatLakeScene, from: "#0c1a24", to: "#050d12", accent: "#a9c4d9" },
  hogsmeade: { Scene: HogsmeadeScene, from: "#241c14", to: "#120d08", accent: "#e0a94a" },
};

export function LocationIllustration({ locationId }: { locationId: string }) {
  const illustration = illustrations[locationId];
  if (!illustration) return null;

  const { Scene, from, to, accent } = illustration;
  return (
    <IllustrationFrame from={from} to={to} accent={accent}>
      <Scene />
    </IllustrationFrame>
  );
}
