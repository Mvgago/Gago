import React, { useEffect, useRef, useState } from "react";

/**
 * A construction sheet that draws itself once, the first time it comes into view: fine,
 * crisp lines are traced in sequence (the grid, the rows, the measures, the guides of the
 * lettering, the outline of the stone, the diagonals), then the original image fades in over
 * them as they fade away. When it ends, what is on screen is the original image, untouched.
 */

type Pt = [number, number];
type Stroke = { pts: Pt[]; dark?: boolean };
export type Drawing = {
  w: number;
  h: number;
  /** the strokes, in the order they are drawn, grouped in waves */
  waves: Stroke[][];
  /** on phones, the window of the sheet to show: its margins trimmed, so it reads larger in the same space */
  phone?: [number, number, number, number];
};

// The Sapphire's construction sheet (saphire (4)), measured on the sheet shown 2000 px wide
const k = 2047 / 2000;
const L = (x1: number, y1: number, x2: number, y2: number, dark = false): Stroke => ({ pts: [[x1 * k, y1 * k], [x2 * k, y2 * k]], dark });
const P = (pts: Pt[], dark = false): Stroke => ({ pts: pts.map(([x, y]) => [x * k, y * k] as Pt), dark });
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
    [L(455, 453, 762, 311, true), L(425, 528, 664, 676, true), L(1262, 366, 1470, 270, true), L(1242, 415, 1405, 516, true)],
  ],
  phone: [170 * k, 160 * k, 1630 * k, 640 * k],
};

// timing, in seconds
const WAVE = 0.55; // between waves
const LINE = 0.06; // between the lines of one wave
const DRAW = 0.9; // to trace one line
const FADE = 1.4; // the image coming in, the lines going

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

  const last = drawing.waves.length - 1;
  const end = last * WAVE + (drawing.waves[last].length - 1) * LINE + DRAW + 0.2;

  // One drawing, seen through a window of the sheet (the whole of it, or a crop on phones)
  const sheet = (view: [number, number, number, number], key: string, cls: string) => {
    // about one screen pixel, whatever the size the sheet is shown at
    const px = width ? view[2] / width : 2;
    return (
      <svg key={key} viewBox={view.join(" ")} preserveAspectRatio="xMidYMid meet" className={cls} role="img" aria-label={alt}>
        {/* the original, fading in once the lines are drawn */}
        <image
          href={src}
          width={drawing.w}
          height={drawing.h}
          style={{ opacity: still ? 1 : 0, animation: go ? `${id}-in ${FADE}s ease-in-out ${end}s both` : undefined }}
        />
        {/* the lines, crisp, traced one after another, then gone as the image arrives */}
        {!still && (
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: go ? `${id}-out ${FADE}s ease-in-out ${end}s both` : undefined }}
          >
            {drawing.waves.map((wave, w) =>
              wave.map((st, i) => (
                <polyline
                  key={`${w}-${i}`}
                  points={st.pts.map((p) => p.join(",")).join(" ")}
                  stroke={st.dark ? "#3a3a3a" : "#9a9a9a"}
                  strokeWidth={(st.dark ? 1.3 : 1) * px}
                  pathLength={1}
                  strokeDasharray={1}
                  style={{
                    strokeDashoffset: 1,
                    animation: go ? `${id}-line ${DRAW}s cubic-bezier(.55,0,.25,1) ${w * WAVE + i * LINE}s forwards` : undefined,
                  }}
                />
              )),
            )}
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
