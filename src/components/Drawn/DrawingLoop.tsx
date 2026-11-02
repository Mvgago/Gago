import React, { useEffect, useRef } from "react";
// a sheet of paper, photographed close: laid faintly over the drawing, the grain of a real page
import sheet from "../../assets/textures/paper.jpg.webp";

/**
 * Full-bleed, for the projects page: a drawing draws itself (as RevealImage, from its order map), holds a
 * moment, and the photograph of the same place comes in softly over it; then the photograph goes, the sheet
 * is blank again and the drawing starts over. Round and round while it is on view.
 */
const K = 24;
const DRAW = 4.5, HOLD = 1.5, FADE = 3, PHOTO = 4.4, REST = 0.4;
const CYCLE = DRAW + HOLD + FADE + PHOTO + FADE + REST;
const ease = (p: number) => p * p * (3 - 2 * p);
const INK = 1.55;
// the paper colour through the same gamma, so the ground around the drawing matches its own paper
const inked = (hex: string) =>
  `rgb(${[1, 3, 5].map((i) => Math.round(255 * Math.pow(parseInt(hex.slice(i, i + 2), 16) / 255, INK))).join(",")})`;


export const DrawingLoop: React.FC<{
  drawing: { src: string; order: string; w: number; h: number; paper: string };
  /** Left out, the drawing alone: it draws, holds, fades and draws again */
  photo?: string;
  className?: string;
}> = ({ drawing, photo, className = "" }) => {
  const { src, order, w, h, paper } = drawing;
  const matrix = useRef<SVGFEColorMatrixElement>(null);
  const top = useRef<HTMLImageElement>(null);
  const id = useRef(`loop-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pen = (t: number) => matrix.current?.setAttribute("values", `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-K} 0 0 0 ${K * t}`);
    if (still) { pen(2); return; }
    let raf = 0, t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const s = ((now - t0) / 1000) % CYCLE;
      let drawn: number, shown: number;
      if (!photo) {
        // the drawing alone: drawn, held through what would have been the photograph's time, faded out
        shown = 0;
        drawn = s < DRAW ? 1 - Math.pow(1 - s / DRAW, 2.2)
          : s < CYCLE - REST - FADE ? 1
          : s < CYCLE - REST ? 1 - ease((s - (CYCLE - REST - FADE)) / FADE)
          : 0;
      }
      else if (s < DRAW) { drawn = 1 - Math.pow(1 - s / DRAW, 2.2); shown = 0; }
      else if (s < DRAW + HOLD) { drawn = 1; shown = 0; }
      else if (s < DRAW + HOLD + FADE) { drawn = 1; shown = ease((s - DRAW - HOLD) / FADE); }
      // under the photograph the sheet is wiped, ready to start again
      else if (s < DRAW + HOLD + FADE + PHOTO) { drawn = 0; shown = 1; }
      else if (s < CYCLE - REST) { drawn = 0; shown = 1 - ease((s - DRAW - HOLD - FADE - PHOTO) / FADE); }
      else { drawn = 0; shown = 0; }
      pen(1 / K + drawn * (1 + 1 / K));
      if (top.current) top.current.style.opacity = String(shown);
      raf = requestAnimationFrame(tick);
    };
    // both pictures in hand before the pen moves
    const files = photo ? [src, order, photo] : [src, order];
    let left = files.length;
    for (const u of files) {
      const im = new Image();
      im.onload = im.onerror = () => { if (--left === 0) raf = requestAnimationFrame(tick); };
      im.src = u;
    }
    return () => cancelAnimationFrame(raf);
  }, [src, order, photo]);

  return (
    <div className={`overflow-hidden ${className}`} style={{ background: inked(paper) }}>
      {/* the drawing is small (a screenshot's worth of pixels): hardly scaled, it sits centred on its own
          paper, which runs on to the edges */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
        style={{ maxWidth: w * 1.15, maxHeight: h * 1.15 }}
        aria-hidden
      >
        <defs>
          <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={w} height={h} colorInterpolationFilters="sRGB">
            <feImage href={order} x="0" y="0" width={w} height={h} preserveAspectRatio="none" result="order" />
            <feColorMatrix ref={matrix} in="order" type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-K} 0 0 0 1`} result="pen" />
            <feComposite in="SourceGraphic" in2="pen" operator="in" result="drawn" />
            <feFlood floodColor={paper} result="paper" />
            <feComposite in="drawn" in2="paper" operator="over" />
            {/* the lines deepened (a gamma on the mid tones), the paper all but untouched */}
            <feComponentTransfer>
              <feFuncR type="gamma" exponent={INK} />
              <feFuncG type="gamma" exponent={INK} />
              <feFuncB type="gamma" exponent={INK} />
            </feComponentTransfer>
          </filter>
        </defs>
        <image href={src} width={w} height={h} filter={`url(#${id})`} />
      </svg>
      {/* the paper's grain, faint, multiplied over the drawing and its ground alike */}
      <img
        src={sheet}
        alt=""
        draggable={false}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ mixBlendMode: "multiply", opacity: 0.55, filter: "brightness(1.22) contrast(0.5)" }}
      />
      {/* the photograph barely softened; it is the long dissolve that lets the one pass into the other */}
      {photo && <img
        ref={top}
        src={photo}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0, filter: "saturate(0.88) contrast(0.94) brightness(1.04)" }}
      />}
    </div>
  );
};
