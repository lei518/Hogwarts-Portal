export function CastleSilhouette() {
  return (
    <svg
      viewBox="0 0 1200 420"
      className="absolute bottom-0 left-0 w-full h-auto pointer-events-none select-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="castleFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0805" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b0805" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="rimLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a646" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a646" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* distant hill */}
      <path
        d="M0,300 Q200,260 420,290 T900,270 T1200,300 L1200,420 L0,420 Z"
        fill="#0e0a07"
      />

      {/* castle mass, original silhouette built from simple towers and roofs */}
      <g fill="#0b0805">
        <rect x="120" y="200" width="60" height="160" />
        <polygon points="120,200 150,150 180,200" />

        <rect x="200" y="230" width="90" height="130" />

        <rect x="300" y="150" width="70" height="210" />
        <polygon points="300,150 335,90 370,150" />

        <rect x="390" y="240" width="140" height="120" />
        <rect x="430" y="190" width="60" height="60" />

        <rect x="540" y="120" width="80" height="240" />
        <polygon points="540,120 580,60 620,120" />

        <rect x="630" y="210" width="100" height="150" />

        <rect x="740" y="170" width="55" height="190" />
        <polygon points="740,170 767,120 795,170" />

        <rect x="810" y="250" width="160" height="110" />
        <rect x="860" y="200" width="55" height="60" />

        <rect x="980" y="180" width="65" height="180" />
        <polygon points="980,180 1012,125 1045,180" />

        <rect x="1060" y="240" width="90" height="120" />
      </g>

      {/* window glow, sparse and warm */}
      <g fill="#c9a646" opacity="0.5">
        <rect x="335" y="200" width="6" height="10" />
        <rect x="565" y="170" width="6" height="10" />
        <rect x="655" y="250" width="6" height="10" />
        <rect x="855" y="280" width="6" height="10" />
        <rect x="1000" y="220" width="6" height="10" />
      </g>

      <rect x="0" y="0" width="1200" height="420" fill="url(#rimLight)" opacity="0.4" />
      <rect x="0" y="340" width="1200" height="80" fill="url(#castleFade)" />
    </svg>
  );
}
