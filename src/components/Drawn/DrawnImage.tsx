import React, { useEffect, useRef, useState } from "react";

/**
 * A construction sheet that sketches itself once, the first time it comes into view, like a
 * page of a notebook: light grey pencil lines, slightly loose and overshooting their ends,
 * one starting after another (the grid, the rows, the measures, the stone, the guides of the
 * lettering, the diagonals), some gone over twice. Then the sketch turns into the finished
 * sheet: the original image fades in as the pencil fades out, and it ends untouched.
 */

type Pt = [number, number];
type Stroke = { pts: Pt[] };
export type Drawing = {
  w: number;
  h: number;
  /** the strokes, in the order they are drawn, grouped in waves */
  waves: Stroke[][];
  /** on phones, the window of the sheet to show: its margins trimmed, so it reads larger in the same space */
  phone?: [number, number, number, number];
  /** waves before this one are dashed guides (as on the sheet); from it on, solid strokes */
  solidFrom?: number;
};

// The Sapphire's construction sheet (saphire (4)), measured on the sheet shown 2000 px wide
const k = 2047 / 2000;
const L = (x1: number, y1: number, x2: number, y2: number): Stroke => ({ pts: [[x1 * k, y1 * k], [x2 * k, y2 * k]] });
const P = (pts: Pt[]): Stroke => ({ pts: pts.map(([x, y]) => [x * k, y * k] as Pt) });
export const SAPPHIRE_MARK: Drawing = {
  w: 2047,
  h: 989,
  waves: [
    // the grid: the four columns
    [L(313, 222, 313, 770), L(405, 222, 405, 770), L(760, 222, 760, 770), L(852, 222, 852, 770)],
    // the rows of the reserve area
    [L(248, 264, 925, 264), L(248, 311, 925, 311), L(545, 355, 908, 355), L(650, 448, 925, 448), L(248, 493, 455, 493), L(690, 540, 925, 540), L(555, 633, 908, 633), L(248, 676, 565, 676), L(248, 725, 925, 725)],
    // the measures: down the sides, across the top
    [L(248, 264, 248, 725), L(920, 264, 920, 725), L(313, 214, 405, 214), L(760, 214, 852, 214)],
    // the second sheet: its reserve lines and heights
    [L(1335, 268, 1635, 268), L(1335, 516, 1635, 516), L(1630, 268, 1630, 516), L(1365, 662, 1635, 662), L(1325, 725, 1635, 725), L(1630, 662, 1630, 725)],
    // the lettering's guides: cap height and baseline of each line, on both sheets
    [
      L(395, 476, 775, 476), L(395, 511, 775, 511), L(540, 447, 625, 447), L(540, 461, 625, 461), L(480, 531, 690, 531), L(480, 542, 690, 542),
      L(1222, 379, 1480, 379), L(1222, 404, 1480, 404), L(1222, 680, 1480, 680), L(1222, 703, 1480, 703),
    ],
    // the stone, sketched in its facets
    [
      P([[575, 309], [546, 326], [500, 372], [486, 452], [492, 560], [538, 640], [566, 676], [600, 672], [640, 632], [662, 590], [681, 420], [662, 352], [622, 326], [575, 309]]),
      P([[546, 326], [590, 385], [622, 326]]),
      P([[590, 385], [596, 560], [640, 632]]),
      P([[1330, 272], [1296, 300], [1286, 380], [1300, 470], [1340, 515], [1385, 500], [1414, 430], [1410, 330], [1380, 285], [1330, 272]]),
    ],
    // the two diagonals that cut the stone
    [L(455, 453, 762, 311), L(425, 528, 664, 676), L(1262, 366, 1470, 270), L(1242, 415, 1405, 516)],
  ],
  phone: [170 * k, 160 * k, 1630 * k, 640 * k],
  // the guides dashed, as the sheet draws them; the stone and the diagonals in one stroke
  solidFrom: 5,
};

// timing, in seconds
const STEP = 0.1; // one line starts this long after the one before
const DRAW = 0.6; // a line's own stroke, give or take a little
const FADE = 1.6; // the sketch turning into the finished sheet

// A steady little random, so the sketch is the same every time
const rand = (seed: number) => {
  let t = seed * 9301 + 49297;
  return () => ((t = (t * 9301 + 49297) % 233280) / 233280);
};

// One pencil line: loose, a touch curved, overshooting where it starts and ends
function pencil([a, b]: [Pt, Pt], r: () => number): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len; // along
  const nx = -uy, ny = ux; // across
  const o1 = len * (0.01 + r() * 0.03), o2 = len * (0.01 + r() * 0.03);
  const s: Pt = [a[0] - ux * o1 + nx * (r() - 0.5) * 5, a[1] - uy * o1 + ny * (r() - 0.5) * 5];
  const e: Pt = [b[0] + ux * o2 + nx * (r() - 0.5) * 5, b[1] + uy * o2 + ny * (r() - 0.5) * 5];
  const bow = Math.min(12, len * 0.012) * (r() - 0.5) * 2;
  const c1: Pt = [s[0] + dx / 3 + nx * bow, s[1] + dy / 3 + ny * bow];
  const c2: Pt = [s[0] + (2 * dx) / 3 + nx * bow * 0.6, s[1] + (2 * dy) / 3 + ny * bow * 0.6];
  return `M${s[0].toFixed(1)},${s[1].toFixed(1)} C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${e[0].toFixed(1)},${e[1].toFixed(1)}`;
}

type Mark = { d: string; delay: number; dur: number; faint: boolean; dashed: boolean };
// The whole sketch, line after line; about a third are gone over a second time, more lightly
function sketch(drawing: Drawing): { marks: Mark[]; end: number } {
  const r = rand(7);
  const marks: Mark[] = [];
  let t = 0;
  drawing.waves.forEach((wave, w) => {
    const dashed = drawing.solidFrom !== undefined && w < drawing.solidFrom;
    wave.forEach((st) => {
      const segs = st.pts.slice(1).map((p, i) => [st.pts[i], p] as [Pt, Pt]);
      // a shape (the stone) is drawn as one continuous gesture, a line as one stroke
      const d = segs.map((sg) => pencil(sg, r)).join(" ");
      const dur = DRAW * (0.8 + r() * 0.5) * (segs.length > 1 ? 2.2 : 1);
      marks.push({ d, delay: t, dur, faint: false, dashed });
      // gone over again, more lightly (solid strokes only: two dashed lines read as noise)
      if (!dashed && r() < 0.4) marks.push({ d: segs.map((sg) => pencil(sg, r)).join(" "), delay: t + dur * 0.6, dur: dur * 0.9, faint: true, dashed });
      t += STEP * (0.7 + r() * 0.6) * (segs.length > 1 ? 3 : 1);
    });
    t += STEP * 2; // a breath between one part of the drawing and the next
  });
  const end = Math.max(...marks.map((m) => m.delay + m.dur)) + 0.3;
  return { marks, end };
}

export const DrawnImage: React.FC<{ src: string; alt?: string; drawing: Drawing; className?: string }> = ({ src, alt = "", drawing, className = "" }) => {
  const box = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [width, setWidth] = useState(0);
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const id = useRef(`draw-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    if (still) return () => ro.disconnect();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setGo(true);
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [still]);

  const { marks, end } = React.useMemo(() => sketch(drawing), [drawing]);

  // One drawing, seen through a window of the sheet (the whole of it, or a crop on phones)
  const sheet = (view: [number, number, number, number], key: string, cls: string) => {
    // about one screen pixel, whatever the size the sheet is shown at
    const px = width ? view[2] / width : 2;
    return (
      <svg key={key} viewBox={view.join(" ")} preserveAspectRatio="xMidYMid meet" className={cls} role="img" aria-label={alt}>
        {/* the finished sheet, coming in as the sketch is done */}
        <image
          href={src}
          width={drawing.w}
          height={drawing.h}
          style={{ opacity: still ? 1 : 0, animation: go ? `${id}-in ${FADE}s ease-in-out ${end}s both` : undefined }}
        />
        {/* the pencil: light grey, one line after another, then gone as the sheet arrives */}
        {!still && (
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: go ? `${id}-out ${FADE}s ease-in-out ${end - 0.2}s both` : undefined }}
          >
            {marks.map((m, i) => {
              const draw = go ? `${id}-line ${m.dur.toFixed(2)}s cubic-bezier(.4,0,.3,1) ${m.delay.toFixed(2)}s forwards` : undefined;
              const stroke = m.faint ? "#d6d6d6" : "#bdbdbd";
              const sw = (m.faint ? 0.8 : 1.05) * px;
              if (!m.dashed)
                return <path key={i} d={m.d} stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: 1, animation: draw }} />;
              // a dashed line can't also be drawn by its own dashes: it is uncovered along its
              // length through a mask that is drawn instead
              const mid = `${id}-${key}-m${i}`;
              return (
                <g key={i}>
                  <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width={drawing.w} height={drawing.h}>
                    <path d={m.d} stroke="white" strokeWidth={sw * 6} pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: 1, animation: draw }} />
                  </mask>
                  <path d={m.d} stroke={stroke} strokeWidth={sw} strokeLinecap="butt" strokeDasharray={`${(5 * px).toFixed(2)} ${(3.5 * px).toFixed(2)}`} mask={`url(#${mid})`} />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div ref={box} className={`relative bg-white ${className}`} onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        @keyframes ${id}-line { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes ${id}-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ${id}-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      {/* the same space as any picture in the row: on phones the sheet's margins are trimmed so it reads larger */}
      {drawing.phone && (
        <div className="relative aspect-[16/10] w-full md:hidden">{sheet(drawing.phone, "phone", "absolute inset-0 h-full w-full")}</div>
      )}
      <div className={`relative aspect-[16/10] w-full ${drawing.phone ? "hidden md:block" : ""}`}>
        {sheet([0, 0, drawing.w, drawing.h], "all", "absolute inset-0 h-full w-full")}
      </div>
    </div>
  );
};
