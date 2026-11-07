import React from "react";

/**
 * The identity of an invented guesthouse on the Galician coast, Ourela ("shore"), told in motion as a
 * brand is built, in full-frame scenes with clean cuts rather than objects laid on a table:
 *   1. on the night ground, the sign draws itself (a circle, the sea's line, a finer wave);
 *   2. it rises and the name is written stroke by stroke under it, with its line;
 *   3. the palette sweeps across the frame in tall bands, each named;
 *   4. the voice: "Volver á ourela." large on the sea's colour, the sign vast and faint behind;
 *   5. the brand at work, in a clean row: the room key, the reception plaque, the site on a phone;
 * then the night comes back and it begins again. A loop of 16 seconds in one SVG, sharp at any size,
 * no 3D. The key matter sits in the middle, so a tall phone frame keeps it.
 */

const T = 16;
const pc = (s: number) => `${((s / T) * 100).toFixed(3)}%`;

const NOITE = "#1f2a2e";
const SEA = "#2f5d62";
const CLAY = "#c46a4a";
const MIST = "#a9bfc0";
const FOAM = "#f4f1ec";
const SAND = "#e9e2d6";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

const kf = (name: string, stops: [number, string][]) => `@keyframes ${name}{${stops.map(([s, css]) => `${pc(s)}{${css}}`).join("")}}`;
// a stroke drawn between t0 and t1, then held until the loop ends
const draw = (name: string, t0: number, t1: number) =>
  kf(name, [[0, "stroke-dashoffset:1"], [t0, "stroke-dashoffset:1"], [t1, "stroke-dashoffset:0"], [T, "stroke-dashoffset:0"]]);
// comes up into place at t0 (from dy below), and stays
const up = (name: string, t0: number, dy: number, dur = 0.9) =>
  kf(name, [[0, `opacity:0;transform:translateY(${dy}px)`], [t0, `opacity:0;transform:translateY(${dy}px)`], [t0 + dur, "opacity:1;transform:translateY(0)"], [T, "opacity:1;transform:translateY(0)"]]);
// a scene shown from a to b, cut in and out at once (opacity set hard at each edge: visibility would stay
// visible across the whole stretch either side, as CSS interpolates it)
const span = (name: string, a: number, b: number) => {
  const on = "opacity:1", off = "opacity:0";
  const stops: [number, string][] = a === 0 ? [[0, on]] : [[0, off], [a - 0.01, off], [a, on]];
  if (b < T) stops.push([b, on], [b + 0.01, off], [T, off]);
  else stops.push([T, on]);
  return kf(name, stops);
};
// a band that wipes up into the frame at t0 and up out of it at t1
const band = (name: string, t0: number, t1: number) =>
  kf(name, [[0, "transform:translateY(100%)"], [t0, "transform:translateY(100%)"], [t0 + 0.7, "transform:translateY(0)"], [t1, "transform:translateY(0)"], [t1 + 0.6, "transform:translateY(-100%)"], [T, "transform:translateY(-100%)"]]);
const EASE = "cubic-bezier(.22,1,.36,1)";

// The monoline letters of the name, each in a 100 × 140 box, as on the stationery
const LETTERS: Record<string, string> = {
  O: "M50 0 C78 0 100 31 100 70 C100 109 78 140 50 140 C22 140 0 109 0 70 C0 31 22 0 50 0 Z",
  U: "M0 0 V88 C0 117 22 140 50 140 C78 140 100 117 100 88 V0",
  R: "M0 140 V0 H52 C72 0 88 16 88 36 C88 56 72 72 52 72 H0 M48 72 L100 140",
  E: "M100 0 H0 V140 H100 M0 70 H78",
  L: "M0 0 V140 H96",
  A: "M0 140 L50 0 L100 140 M20 88 H80",
};
const ADV = [0, 150, 300, 450, 592, 704];
const WORD_W = 804;

const Sign: React.FC<{ r: number; stroke: string; w: number; names?: [string, string, string] }> = ({ r, stroke, w, names }) => {
  const a = (n?: string): React.CSSProperties => (n ? { animation: `${n} ${T}s linear infinite` } : {});
  return (
    <g fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round">
      <circle r={r} pathLength={1} strokeDasharray="1 1" transform="rotate(-90)" style={a(names?.[0])} />
      <path d={`M${-r * 0.82} ${r * 0.28} C${-r * 0.5} ${r * 0.08} ${-r * 0.25} ${r * 0.48} 0 ${r * 0.28} S${r * 0.5} ${r * 0.08} ${r * 0.82} ${r * 0.28}`} pathLength={1} strokeDasharray="1 1" style={a(names?.[1])} />
      <path
        d={`M${-r * 0.55} ${r * 0.55} C${-r * 0.3} ${r * 0.42} ${-r * 0.15} ${r * 0.68} ${r * 0.05} ${r * 0.55} S${r * 0.38} ${r * 0.42} ${r * 0.55} ${r * 0.55}`}
        pathLength={1}
        strokeDasharray="1 1"
        strokeWidth={w * 0.6}
        style={a(names?.[2])}
      />
    </g>
  );
};

const Word: React.FC<{ x: number; y: number; width: number; stroke: string; w: number; animate?: boolean }> = ({ x, y, width, stroke, w, animate }) => {
  const k = width / WORD_W;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill="none" stroke={stroke} strokeWidth={w / k} strokeLinecap="round" strokeLinejoin="round">
      {"OURELA".split("").map((ch, i) => (
        <path key={i} d={LETTERS[ch]} transform={`translate(${ADV[i]} 0)`} pathLength={1} strokeDasharray="1 1" style={animate ? { animation: `om-l${i} ${T}s linear infinite` } : undefined} />
      ))}
    </g>
  );
};

const PALETTE: [string, string, string][] = [
  [SEA, "mar", FOAM],
  [NOITE, "noite", FOAM],
  [CLAY, "tella", FOAM],
  [MIST, "salitre", NOITE],
  [FOAM, "escuma", NOITE],
];

const css = [
  // 1–2: the sign, then the name
  span("om-s1", 0, 6.7),
  draw("om-c", 0.35, 1.6),
  draw("om-w1", 1.15, 2.0),
  draw("om-w2", 1.45, 2.25),
  kf("om-lift", [[0, "transform:translateY(90px)"], [2.6, "transform:translateY(90px)"], [3.5, "transform:translateY(0)"], [T, "transform:translateY(0)"]]),
  ...ADV.map((_, i) => draw(`om-l${i}`, 3.1 + i * 0.22, 3.75 + i * 0.22)),
  up("om-tag", 4.7, 12),
  // 3: the palette sweeping across
  span("om-s3", 5.9, 10.2),
  ...PALETTE.map((_, i) => band(`om-b${i}`, 6.0 + i * 0.1, 9.25 + i * 0.08)),
  ...PALETTE.map((_, i) => up(`om-n${i}`, 6.75 + i * 0.1, 14, 0.6)),
  // 4: the voice
  span("om-s4", 9.2, 13.2),
  up("om-v1", 9.75, 40, 1.1),
  up("om-v2", 9.95, 40, 1.1),
  up("om-vl", 10.6, 8),
  draw("om-vline", 10.5, 11.6),
  kf("om-big", [[0, "transform:scale(1.08)"], [9.2, "transform:scale(1.08)"], [13.2, "transform:scale(1)"], [T, "transform:scale(1)"]]),
  // 5: the brand at work
  span("om-s5", 12.4, T),
  kf("om-sand", [[0, "transform:translateY(100%)"], [12.4, "transform:translateY(100%)"], [13.1, "transform:translateY(0)"], [T, "transform:translateY(0)"]]),
  ...[0, 1, 2].map((i) => up(`om-k${i}`, 12.95 + i * 0.16, 60, 1)),
  // back to night
  kf("om-night", [[0, "opacity:0"], [15.3, "opacity:0"], [15.95, "opacity:1"], [T, "opacity:1"]]),
  ".om.om-paused *{animation-play-state:paused!important}",
  "@media (prefers-reduced-motion:reduce){.om *{animation:none!important}.om .om-later{display:none}}",
].join("");

const a = (name: string, ease = "linear"): React.CSSProperties => ({ animation: `${name} ${T}s ${ease} infinite`, transformBox: "fill-box", transformOrigin: "center" });

const OurelaMotion: React.FC<{ className?: string; paused?: boolean }> = ({ className = "", paused = false }) => (
  <svg viewBox="0 0 1600 900" className={`om block h-full w-full ${paused ? "om-paused" : ""} ${className}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ourela, casa de mar: identidad en movimiento">
    <style>{css}</style>
    <rect width="1600" height="900" fill={NOITE} />

    {/* 1–2: the sign draws itself on the night, rises, and the name is written under it */}
    <g style={a("om-s1")}>
      <g style={a("om-lift", EASE)}>
        <g transform="translate(800 330)">
          <Sign r={104} stroke={FOAM} w={6} names={["om-c", "om-w1", "om-w2"]} />
        </g>
      </g>
      <Word x={800 - 210} y={505} width={420} stroke={FOAM} w={5.5} animate />
      <g style={a("om-tag", EASE)}>
        <text x="800" y="712" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="30" fill={MIST}>
          casa de mar · Cedeira
        </text>
      </g>
    </g>

    {/* 3: the palette, tall bands wiping up across the frame, each named at its foot */}
    <g className="om-later" style={a("om-s3")}>
      {PALETTE.map(([bg, name, fg], i) => (
        <g key={name} style={a(`om-b${i}`, EASE)}>
          <rect x={i * 320} y={0} width={322} height={900} fill={bg} />
          <g style={a(`om-n${i}`, EASE)}>
            <text x={i * 320 + 40} y={808} fontFamily={SANS} fontSize="26" letterSpacing="2" fill={fg}>
              {name}
            </text>
            <text x={i * 320 + 40} y={842} fontFamily={SANS} fontSize="14" letterSpacing="2" fill={fg} opacity={0.65}>
              {bg.toUpperCase()}
            </text>
          </g>
        </g>
      ))}
    </g>

    {/* 4: the voice, large on the sea's colour, the sign vast and faint behind it */}
    <g className="om-later" style={a("om-s4")}>
      <rect width="1600" height="900" fill={SEA} />
      <g opacity={0.14}>
        <g style={a("om-big", "ease-out")}>
          <g transform="translate(800 470)">
            <Sign r={520} stroke={FOAM} w={10} />
          </g>
        </g>
      </g>
      <g style={a("om-v1", EASE)}>
        <text x="800" y="420" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="150" fill={FOAM}>
          Volver
        </text>
      </g>
      <g style={a("om-v2", EASE)}>
        <text x="800" y="570" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="150" fill={FOAM}>
          á ourela.
        </text>
      </g>
      <line x1="740" y1="640" x2="860" y2="640" stroke={CLAY} strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={a("om-vline", EASE)} />
      <g style={a("om-vl", EASE)}>
        <text x="800" y="700" textAnchor="middle" fontFamily={SANS} fontSize="16" letterSpacing="5" fill={FOAM} opacity={0.75}>
          A VOZ DA MARCA
        </text>
      </g>
    </g>

    {/* 5: the brand at work, in one clean row on sand */}
    <g className="om-later" style={a("om-s5")}>
      <rect width="1600" height="900" fill={SAND} style={a("om-sand", EASE)} />
      {/* the room key */}
      <g style={a("om-k0", EASE)}>
        <rect x="150" y="270" width="400" height="360" rx="18" fill={NOITE} />
        <g transform="translate(350 395)">
          <Sign r={62} stroke={FOAM} w={4.5} />
        </g>
        <text x="350" y="535" textAnchor="middle" fontFamily={SANS} fontSize="15" letterSpacing="5" fill={FOAM} opacity={0.7}>
          HABITACIÓN
        </text>
        <text x="350" y="595" textAnchor="middle" fontFamily={SERIF} fontSize="52" fill={FOAM}>
          04
        </text>
      </g>
      {/* the site on a phone, in the middle, where a tall frame keeps it */}
      <g style={a("om-k1", EASE)}>
        <rect x="660" y="150" width="280" height="580" rx="38" fill={NOITE} />
        <defs>
          <linearGradient id="om-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MIST} />
            <stop offset="0.6" stopColor={SEA} />
            <stop offset="1" stopColor={NOITE} />
          </linearGradient>
        </defs>
        <rect x="674" y="164" width="252" height="552" rx="28" fill="url(#om-sea)" />
        <g transform="translate(712 210)">
          <Sign r={16} stroke={FOAM} w={2.2} />
        </g>
        <Word x={736} y={203} width={84} stroke={FOAM} w={1.6} />
        <text x="696" y="560" fontFamily={SERIF} fontSize="34" fill={FOAM}>
          Volver
        </text>
        <text x="696" y="600" fontFamily={SERIF} fontSize="34" fill={FOAM}>
          á ourela.
        </text>
        <rect x="696" y="630" width="118" height="38" rx="19" fill={FOAM} />
        <text x="755" y="655" textAnchor="middle" fontFamily={SANS} fontSize="14" letterSpacing="1" fill={NOITE}>
          Reservar
        </text>
      </g>
      {/* the reception plaque: an arch in clay */}
      <g style={a("om-k2", EASE)}>
        <path d="M1050 630 V420 A200 200 0 0 1 1450 420 V630 Z" fill={CLAY} />
        <g transform="translate(1250 420)">
          <Sign r={64} stroke={FOAM} w={4.5} />
        </g>
        <text x="1250" y="548" textAnchor="middle" fontFamily={SANS} fontSize="19" letterSpacing="6" fill={FOAM}>
          RECEPCIÓN
        </text>
        <text x="1250" y="588" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="22" fill={FOAM} opacity={0.85}>
          planta baixa
        </text>
      </g>
    </g>

    {/* the night coming back over everything, so the loop begins again where it started */}
    <rect className="om-later" width="1600" height="900" fill={NOITE} style={a("om-night")} />
  </svg>
);

export default OurelaMotion;
