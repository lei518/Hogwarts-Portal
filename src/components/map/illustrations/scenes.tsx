import {
  ArchRow,
  Bookshelves,
  Cauldron,
  DeskRow,
  DomedCeiling,
  FireplaceGlow,
  FishSilhouette,
  GlowingDoorway,
  QuidditchHoops,
  Rooftops,
  ShieldEmblem,
  StarField,
  Telescope,
  TreeCluster,
  Vines,
  WaterRipples,
  WindowGlow,
} from "./shapes";

export function GreatHallScene() {
  return (
    <>
      <StarField color="#e8e4da" opacity={0.6} />
      <ArchRow baseline={200} count={5} color="#e6c568" height={120} />
      <WindowGlow
        points={[
          { x: 55, y: 208 },
          { x: 135, y: 208 },
          { x: 215, y: 208 },
          { x: 295, y: 208 },
          { x: 340, y: 208 },
        ]}
        color="#e6c568"
      />
    </>
  );
}

export function LibraryScene() {
  return (
    <>
      <Bookshelves x={28} y={90} accent="#c9a646" />
      <Bookshelves x={165} y={90} accent="#c9a646" />
      <Bookshelves x={302} y={90} accent="#c9a646" />
      <WindowGlow
        points={[
          { x: 75, y: 155 },
          { x: 205, y: 150 },
          { x: 335, y: 155 },
        ]}
        color="#d9a441"
      />
      <StarField color="#d9a441" opacity={0.45} />
    </>
  );
}

export function CharmsClassroomScene() {
  return (
    <>
      <g fill="#0b0805">
        {[40, 90, 140].map((x, i) => (
          <rect key={i} x={x} y={172} width={16} height={30} rx={2} />
        ))}
      </g>
      <g stroke="#9fb8d9" strokeWidth="1.4" fill="none" opacity="0.8">
        <path d="M250,55 Q272,36 302,52 Q280,70 250,55 Z" />
        <path d="M250,55 Q265,58 275,50" opacity="0.5" />
      </g>
      <WindowGlow
        points={[
          { x: 230, y: 48 },
          { x: 262, y: 42 },
          { x: 294, y: 52 },
          { x: 322, y: 44 },
        ]}
        color="#e6c568"
      />
    </>
  );
}

export function AstronomyTowerScene() {
  return (
    <>
      <StarField color="#b9c9e6" opacity={0.9} />
      <g fill="#0b0805">
        <rect x="150" y="150" width="100" height="70" />
        <rect x="140" y="130" width="120" height="24" rx="3" />
      </g>
      <Telescope x={200} y={150} color="#0b0805" />
    </>
  );
}

export function RoomOfRequirementScene() {
  return (
    <>
      <StarField color="#c9a6e6" opacity={0.25} />
      <GlowingDoorway x={200} y={130} color="#9d7fd4" />
    </>
  );
}

export function RavenclawCommonRoomScene() {
  return (
    <>
      <DomedCeiling cx={200} cy={90} r={110} color="#946b2d" />
      <g fill="#0b0805">
        <ellipse cx="200" cy="180" rx="120" ry="30" />
      </g>
      <WindowGlow
        points={[
          { x: 90, y: 165 },
          { x: 310, y: 165 },
        ]}
        color="#c98f3f"
      />
    </>
  );
}

export function TransfigurationClassroomScene() {
  return (
    <>
      <DeskRow y={180} count={5} color="#0b0805" />
      <g stroke="#8fae6b" strokeWidth="1.5" fill="none" opacity="0.7">
        <rect x="184" y="140" width="32" height="20" rx="3" />
        <path d="M200,140 Q205,120 220,116" strokeDasharray="3 3" />
      </g>
      <circle cx="224" cy="112" r="6" fill="#8fae6b" opacity="0.6" />
    </>
  );
}

export function DadaClassroomScene() {
  return (
    <>
      <ShieldEmblem x={200} y={110} scale={1.3} color="#5c7a7a" />
      <g fill="#0b0805" opacity="0.7">
        <ellipse cx="120" cy="200" rx="26" ry="34" />
        <ellipse cx="290" cy="195" rx="20" ry="30" />
      </g>
    </>
  );
}

export function GryffindorCommonRoomScene() {
  return (
    <>
      <FireplaceGlow x={200} y={170} color="#e0692e" />
      <g fill="#150705" opacity="0.85">
        <ellipse cx="90" cy="205" rx="34" ry="16" />
        <ellipse cx="310" cy="205" rx="34" ry="16" />
      </g>
    </>
  );
}

export function HufflepuffCommonRoomScene() {
  return (
    <>
      <g fill="#0b0805">
        <path d="M60,220 Q60,120 200,110 Q340,120 340,220 Z" />
      </g>
      <Vines x={90} y={215} height={90} color="#8a9c4a" />
      <Vines x={310} y={215} height={70} color="#8a9c4a" />
      <WindowGlow
        points={[
          { x: 170, y: 165 },
          { x: 225, y: 165 },
        ]}
        color="#ecb939"
      />
    </>
  );
}

export function SlytherinCommonRoomScene() {
  return (
    <>
      <g fill="#0b0805">
        <rect x="130" y="60" width="140" height="90" rx="6" />
      </g>
      <FishSilhouette x={170} y={100} scale={0.9} color="#7fae9e" />
      <FishSilhouette x={230} y={80} scale={0.6} color="#6b9d8a" />
      <FishSilhouette x={200} y={120} scale={0.7} color="#8fae9e" />
      <WaterRipples y={190} color="#2f5a4a" rows={3} />
    </>
  );
}

export function DungeonsScene() {
  return (
    <>
      <ArchRow baseline={210} count={3} color="#5c5c5c" height={130} />
      <Cauldron x={140} y={195} scale={1.3} glow="#6b8f5a" />
      <Cauldron x={260} y={200} scale={1} glow="#8b2e2e" />
    </>
  );
}

export function GreenhousesScene() {
  return (
    <>
      <g stroke="#4f7a5f" strokeWidth="1" fill="none" opacity="0.4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={i * 70} y1="20" x2={i * 70} y2="220" />
        ))}
      </g>
      <TreeCluster baseline={220} color="#2f4a3c" count={5} spread={400} />
      <Vines x={60} y={210} height={110} color="#6b9d5f" />
      <Vines x={340} y={210} height={90} color="#6b9d5f" />
      <WindowGlow
        points={[
          { x: 150, y: 60 },
          { x: 250, y: 60 },
        ]}
        color="#d9a441"
      />
    </>
  );
}

export function QuidditchPitchScene() {
  return (
    <>
      <StarField color="#6f93b8" opacity={0.3} />
      <QuidditchHoops x={90} y={215} color="#d3a625" />
      <QuidditchHoops x={310} y={215} color="#d3a625" />
      <circle cx="200" cy="70" r="4" fill="#d3a625" opacity="0.8" />
    </>
  );
}

export function ForbiddenForestScene() {
  return (
    <>
      <TreeCluster baseline={230} color="#050805" count={11} spread={400} />
      <TreeCluster baseline={215} color="#0b120b" count={8} spread={400} xOffset={20} />
      <circle cx="230" cy="150" r="3" fill="#7a9b5a" opacity="0.55" />
    </>
  );
}

export function GreatLakeScene() {
  return (
    <>
      <StarField color="#a9c4d9" opacity={0.5} />
      <circle cx="200" cy="60" r="18" fill="#dfe8ee" opacity="0.4" />
      <WaterRipples y={140} color="#3a5a6e" rows={6} />
      <ellipse cx="240" cy="200" rx="30" ry="8" fill="#0a1218" opacity="0.6" />
    </>
  );
}

export function HogsmeadeScene() {
  return (
    <>
      <StarField color="#e8e4da" opacity={0.5} />
      <Rooftops baseline={220} count={7} color="#0b0805" />
      <WindowGlow
        points={[
          { x: 35, y: 200 },
          { x: 95, y: 195 },
          { x: 155, y: 200 },
          { x: 220, y: 195 },
          { x: 280, y: 200 },
          { x: 340, y: 195 },
        ]}
        color="#e0a94a"
      />
    </>
  );
}
