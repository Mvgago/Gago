import React from "react";

/**
 * The identity of an invented guesthouse on the Galician coast, Ourela ("shore"), built in
 * motion as the example of the strategy and identity discipline: the sign draws itself (a
 * circle, and the sea's line crossing it), the name is written stroke by stroke in monoline
 * letters, then the system opens out: its palette, and the brand at work on a room key, the
 * menu, the signage and a post. A loop of 14 seconds, all in one SVG, so it is sharp at any size.
 */

const T = 14; // seconds a loop lasts
const pc = (s: number) => `${((s / T) * 100).toFixed(2)}%`;

const SAND = "#ece3d4";
const FOAM = "#f7f4ee";
const SEA = "#2f5d62";
const INK = "#1f2a2e";
const CLAY = "#c46a4a";
const MIST = "#a9bfc0";

// Keyframes built from times in seconds, so the timeline reads as a script
const kf = (name: string, stops: [number, string][]) =>
  `@keyframes ${name}{${stops.map(([s, css]) => `${pc(s)}{${css}}`).join("")}}`;
// a stroke drawn between t0 and t1, held, and reset while its scene is out of sight
const draw = (name: string, t0: number, t1: number) =>
  kf(name, [[0, "stroke-dashoffset:1"], [t0, "stroke-dashoffset:1"], [t1, "stroke-dashoffset:0"], [T * 0.97, "stroke-dashoffset:0"], [T, "stroke-dashoffset:1"]]);
// fades in (rising a little) at t0, out at t1
const rise = (name: string, t0: number, t1: number, dy = 18) =>
  kf(name, [
    [0, `opacity:0;transform:translateY(${dy}px)`],
    [t0, `opacity:0;transform:translateY(${dy}px)`],
    [t0 + 0.8, "opacity:1;transform:translateY(0)"],
    [t1, "opacity:1;transform:translateY(0)"],
    [t1 + 0.7, "opacity:0;transform:translateY(0)"],
    [T, "opacity:0;transform:translateY(0)"],
  ]);

// The monoline letters of the name, each in a 100 × 140 box
const LETTERS: Record<string, string> = {
  O: "M50 0 C78 0 100 31 100 70 C100 109 78 140 50 140 C22 140 0 109 0 70 C0 31 22 0 50 0 Z",
  U: "M0 0 V88 C0 117 22 140 50 140 C78 140 100 117 100 88 V0",
  R: "M0 140 V0 H52 C72 0 88 16 88 36 C88 56 72 72 52 72 H0 M48 72 L100 140",
  E: "M100 0 H0 V140 H100 M0 70 H78",
  L: "M0 0 V140 H96",
  A: "M0 140 L50 0 L100 140 M20 88 H80",
};
const NAME = "OURELA";
// where each letter sits, kerned by eye: the open L lets the A in closer
const ADV = [0, 150, 300, 450, 592, 704];

// The sign: a circle, and the sea's line crossing its lower half
const Sign: React.FC<{ r: number; stroke: string; w: number; anim?: [string, string, string] }> = ({ r, stroke, w, anim }) => (
  <g fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round">
    <circle r={r} pathLength={1} strokeDasharray="1 1" transform="rotate(-90)" style={anim ? { animation: `${anim[0]} ${T}s linear infinite` } : { strokeDashoffset: 0 }} />
    <path
      d={`M${-r * 0.82} ${r * 0.28} C${-r * 0.5} ${r * 0.08} ${-r * 0.25} ${r * 0.48} 0 ${r * 0.28} S${r * 0.5} ${r * 0.08} ${r * 0.82} ${r * 0.28}`}
      pathLength={1}
      strokeDasharray="1 1"
      style={anim ? { animation: `${anim[1]} ${T}s linear infinite` } : { strokeDashoffset: 0 }}
    />
    <path
      d={`M${-r * 0.55} ${r * 0.55} C${-r * 0.3} ${r * 0.42} ${-r * 0.15} ${r * 0.68} ${r * 0.05} ${r * 0.55} S${r * 0.38} ${r * 0.42} ${r * 0.55} ${r * 0.55}`}
      pathLength={1}
      strokeDasharray="1 1"
      strokeWidth={w * 0.6}
      style={anim ? { animation: `${anim[2]} ${T}s linear infinite` } : { strokeDashoffset: 0 }}
    />
  </g>
);

// The name in its letters; drawn one after another when animated
const Word: React.FC<{ x: number; y: number; scale: number; stroke: string; w: number; animate?: boolean }> = ({ x, y, scale, stroke, w, animate }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={stroke} strokeWidth={w / scale} strokeLinecap="round" strokeLinejoin="round">
    {NAME.split("").map((ch, i) => (
      <path
        key={i}
        d={LETTERS[ch]}
        transform={`translate(${ADV[i]} 0)`}
        pathLength={1}
        strokeDasharray="1 1"
        style={animate ? { animation: `ou-l${i} ${T}s linear infinite` } : { strokeDashoffset: 0 }}
      />
    ))}
  </g>
);
const WORD_W = ADV[5] + 100; // the name's width at scale 1

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

const css = [
  // scene one: the sign and the name, alone on sand
  draw("ou-c", 0.3, 1.9),
  draw("ou-w1", 1.5, 2.6),
  draw("ou-w2", 1.9, 2.9),
  ...NAME.split("").map((_, i) => draw(`ou-l${i}`, 2.6 + i * 0.32, 3.3 + i * 0.32)),
  rise("ou-tag", 4.6, 6.4, 10),
  kf("ou-one", [[0, "opacity:1"], [6.6, "opacity:1"], [7.3, "opacity:0"], [T * 0.97, "opacity:0"], [T, "opacity:1"]]),
  // scene two: the system, piece by piece
  kf("ou-two", [[0, "opacity:0"], [7.0, "opacity:0"], [7.6, "opacity:1"], [13.2, "opacity:1"], [13.9, "opacity:0"], [T, "opacity:0"]]),
  ...[0, 1, 2, 3, 4].map((i) => rise(`ou-s${i}`, 7.3 + i * 0.14, 13.0, 30)),
  ...[0, 1, 2, 3].map((i) => rise(`ou-t${i}`, 8.0 + i * 0.35, 13.0, 34)),
  rise("ou-head", 7.2, 13.0, 0),
  "@media (prefers-reduced-motion:reduce){.ou *{animation:none!important}.ou .ou-a{opacity:0}.ou .ou-b{opacity:1}}",
].join("");

const anim = (name: string): React.CSSProperties => ({ animation: `${name} ${T}s linear infinite`, transformBox: "fill-box" });

const OurelaIdentity: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 1600 900" className={`ou block h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ourela, casa de mar: identidad">
    <style>{css}</style>
    <rect width="1600" height="900" fill={SAND} />

    {/* Scene one: the sign draws itself, then the name, then the line under it */}
    <g className="ou-a" style={anim("ou-one")}>
      <g transform="translate(800 330)">
        <Sign r={104} stroke={SEA} w={7} anim={["ou-c", "ou-w1", "ou-w2"]} />
      </g>
      <Word x={800 - (WORD_W * 0.42) / 2} y={505} scale={0.42} stroke={INK} w={6} animate />
      <g style={anim("ou-tag")}>
        <text x="800" y="625" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="30" fill={SEA}>
          casa de mar · Cedeira
        </text>
      </g>
    </g>

    {/* Scene two: the system opened out */}
    <g className="ou-b" style={anim("ou-two")}>
      <rect width="1600" height="900" fill={SAND} />
      {/* the brand, small, at the head of the board */}
      <g style={anim("ou-head")}>
        <g transform="translate(118 132)">
          <Sign r={44} stroke={SEA} w={4.5} />
        </g>
        <Word x={186} y={104} scale={0.2} stroke={INK} w={3.6} />
        <text x="186" y="160" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={SEA}>
          casa de mar
        </text>
      </g>
      {/* the palette, as tall swatches with their names */}
      {[
        [SEA, "mar", FOAM],
        [INK, "noite", FOAM],
        [CLAY, "tella", FOAM],
        [MIST, "salitre", INK],
        [FOAM, "escuma", INK],
      ].map(([bg, name, fg], i) => (
        <g key={name} style={anim(`ou-s${i}`)}>
          <rect x={74 + i * 92} y={232} width={84} height={590} rx={3} fill={bg} stroke={bg === FOAM ? "#d9d1c3" : "none"} />
          <text x={74 + i * 92 + 14} y={800} fontFamily={SANS} fontSize="15" letterSpacing="1.5" fill={fg}>
            {name}
          </text>
          <text x={74 + i * 92 + 14} y={778} fontFamily={SANS} fontSize="11" letterSpacing="1" fill={fg} opacity={0.7}>
            {bg.toUpperCase()}
          </text>
        </g>
      ))}

      {/* the room key */}
      <g style={anim("ou-t0")}>
        <rect x="600" y="80" width="420" height="270" rx="16" fill={INK} />
        <g transform="translate(700 215)">
          <Sign r={52} stroke={FOAM} w={4} />
        </g>
        <text x="790" y="200" fontFamily={SANS} fontSize="15" letterSpacing="4" fill={FOAM} opacity={0.75}>
          HABITACIÓN
        </text>
        <text x="788" y="262" fontFamily={SERIF} fontSize="64" fill={FOAM}>
          04
        </text>
        <rect x="600" y="318" width="420" height="10" fill={CLAY} />
      </g>

      {/* the menu */}
      <g style={anim("ou-t1")}>
        <rect x="1060" y="80" width="466" height="390" rx="4" fill={FOAM} stroke="#ddd5c8" />
        <Word x={1060 + 233 - (WORD_W * 0.12) / 2} y={120} scale={0.12} stroke={INK} w={2.4} />
        <text x="1293" y="178" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="22" fill={SEA}>
          Mesa do mar
        </text>
        <line x1="1253" y1="198" x2="1333" y2="198" stroke={CLAY} strokeWidth="2" />
        {[
          ["Percebes de Cedeira", "28"],
          ["Xoubas á brasa", "14"],
          ["Caldeirada de peixe", "22"],
          ["Filloas de leite", "7"],
        ].map(([dish, price], i) => (
          <g key={dish}>
            <text x="1110" y={258 + i * 52} fontFamily={SERIF} fontSize="21" fill={INK}>
              {dish}
            </text>
            <text x="1476" y={258 + i * 52} textAnchor="end" fontFamily={SANS} fontSize="17" fill={SEA}>
              {price}
            </text>
          </g>
        ))}
      </g>

      {/* the signage: an arched plaque in clay */}
      <g style={anim("ou-t2")}>
        <path d="M600 822 V620 A210 210 0 0 1 1020 620 V822 Z" fill={CLAY} />
        <g transform="translate(810 612)">
          <Sign r={62} stroke={FOAM} w={4.5} />
        </g>
        <text x="810" y="738" textAnchor="middle" fontFamily={SANS} fontSize="20" letterSpacing="6" fill={FOAM}>
          RECEPCIÓN
        </text>
        <text x="810" y="776" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="22" fill={FOAM} opacity={0.85}>
          planta baixa
        </text>
      </g>

      {/* a post: the sea, the sign large and faint, the line */}
      <g style={anim("ou-t3")}>
        <defs>
          <linearGradient id="ou-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MIST} />
            <stop offset="0.55" stopColor={SEA} />
            <stop offset="1" stopColor={INK} />
          </linearGradient>
          <clipPath id="ou-post">
            <rect x="1060" y="510" width="466" height="312" rx="4" />
          </clipPath>
        </defs>
        <rect x="1060" y="510" width="466" height="312" rx="4" fill="url(#ou-sea)" />
        <g clipPath="url(#ou-post)" opacity={0.28}>
          <g transform="translate(1420 700)">
            <Sign r={190} stroke={FOAM} w={6} />
          </g>
        </g>
        <text x="1098" y="740" fontFamily={SERIF} fontSize="40" fill={FOAM}>
          Volver á ourela.
        </text>
        <text x="1100" y="782" fontFamily={SANS} fontSize="15" letterSpacing="3" fill={FOAM} opacity={0.8}>
          @OURELA.CASADEMAR
        </text>
      </g>
    </g>
  </svg>
);

export default OurelaIdentity;
