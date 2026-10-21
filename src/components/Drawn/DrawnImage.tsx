import React, { useEffect, useRef, useState } from "react";

/**
 * A construction drawing that draws itself once, the first time it comes into view.
 * Nothing is redrawn: the picture's own guide lines are uncovered along their length, one
 * after another, through a mask; then the rest of the picture (the mark, the lettering, the
 * measures) fades in over them. When it ends, what is on screen is the original image, untouched.
 */

type Seg = [number, number, number, number];
export type Drawing = {
  w: number;
  h: number;
  /** the guides, in the order they are drawn, grouped in waves */
  waves: Seg[][];
  /** areas the guides are not uncovered in (the mark and its lettering): they arrive with the rest */
  keepOut?: [number, number, number, number][];
  /** from this wave on, lines are drawn over the keep-out areas, with a finer stroke */
  overFrom?: number;
  /** on phones, the window of the sheet to show: its margins trimmed, so the drawing reads larger in the same space */
  phone?: [number, number, number, number];
};

// The Sapphire's construction sheet (saphire (4)), in the image's own pixels
const k = 2047 / 2000; // measured on the sheet shown at 2000 px wide
const S = (x1: number, y1: number, x2: number, y2: number): Seg => [x1 * k, y1 * k, x2 * k, y2 * k];
export const SAPPHIRE_MARK: Drawing = {
  w: 2047,
  h: 989,
  waves: [
    // the grid: the four columns, then the rows of the reserve area
    [S(313, 222, 313, 770), S(405, 222, 405, 770), S(760, 222, 760, 770), S(852, 222, 852, 770)],
    [S(248, 264, 925, 264), S(248, 311, 925, 311), S(545, 355, 908, 355), S(650, 448, 925, 448), S(248, 493, 455, 493), S(690, 540, 925, 540), S(555, 633, 908, 633), S(248, 676, 565, 676), S(248, 725, 925, 725)],
    // the measures: arrows down the sides and across the top
    [S(248, 262, 248, 727), S(920, 266, 920, 727), S(312, 214, 408, 214), S(757, 214, 855, 214)],
    // the second sheet: the reserve lines and their heights
    [S(1335, 268, 1635, 268), S(1335, 516, 1635, 516), S(1365, 662, 1635, 662), S(1325, 725, 1635, 725), S(1630, 266, 1630, 518), S(1630, 660, 1630, 727)],
    // the two diagonals that cut the stone, on both sheets
    [S(455, 453, 762, 311), S(425, 528, 664, 676), S(1262, 366, 1470, 270), S(1242, 415, 1405, 516)],
  ],
  keepOut: [
    [478 * k, 300 * k, 214 * k, 384 * k],
    [396 * k, 438 * k, 378 * k, 112 * k],
    [1272 * k, 265 * k, 150 * k, 258 * k],
    [1222 * k, 352 * k, 262 * k, 80 * k],
    [1222 * k, 652 * k, 262 * k, 80 * k],
  ],
  overFrom: 4,
  // the drawing without the white margin around it
  phone: [170 * k, 160 * k, 1630 * k, 640 * k],
};

export const DrawnImage: React.FC<{ src: string; alt?: string; drawing: Drawing; className?: string }> = ({ src, alt = "", drawing, className = "" }) => {
  const box = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const id = useRef(`draw-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const el = box.current;
    if (!el || still) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setGo(true);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  // timing: each wave starts a little after the last; within a wave the lines follow closely
  const WAVE = 0.42;
  const LINE = 0.07;
  const DRAW = 0.75;
  const end = (drawing.waves.length - 1) * WAVE + DRAW;
  // One drawing, seen through a window of the sheet (the whole of it, or a crop on phones)
  const sheet = (view: [number, number, number, number], key: string, cls: string, style?: React.CSSProperties) => {
    const mid = `${id}-${key}`;
    return (
      <svg key={key} viewBox={view.join(" ")} preserveAspectRatio="xMidYMid meet" className={cls} style={style} role="img" aria-label={alt}>
        <defs>
          <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width={drawing.w} height={drawing.h}>
            {drawing.waves.map((wave, w) => [
              // the keep-out areas, laid in black just before the lines allowed over them
              w === drawing.overFrom &&
                (drawing.keepOut ?? []).map(([x, y, rw, rh], j) => <rect key={`k${j}`} x={x} y={y} width={rw} height={rh} fill="black" />),
              ...wave.map(([x1, y1, x2, y2], i) => (
                <line
                  key={`${w}-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeWidth={drawing.overFrom !== undefined && w >= drawing.overFrom ? 6 : 14}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  style={{
                    strokeDashoffset: go ? undefined : 1,
                    animation: go ? `${id}-line ${DRAW}s cubic-bezier(.6,0,.2,1) ${w * WAVE + i * LINE}s both` : undefined,
                  }}
                />
              )),
            ])}
            {/* keep-out areas with no lines drawn over them stay covered to the end */}
            {drawing.overFrom === undefined &&
              (drawing.keepOut ?? []).map(([x, y, rw, rh], j) => <rect key={`k${j}`} x={x} y={y} width={rw} height={rh} fill="black" />)}
          </mask>
        </defs>
        {/* the guides, uncovered as they are drawn */}
        <image href={src} width={drawing.w} height={drawing.h} mask={`url(#${mid})`} />
        {/* then everything else: the stone, the lettering, the measures */}
        <image
          href={src}
          width={drawing.w}
          height={drawing.h}
          style={{ opacity: still ? 1 : 0, animation: go ? `${id}-in 1.1s ease-out ${end - 0.2}s both` : undefined }}
        />
      </svg>
    );
  };

  return (
    <div ref={box} className={`relative bg-white ${className}`} onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        @keyframes ${id}-line { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes ${id}-in { from { opacity: 0; } to { opacity: 1; } }
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
