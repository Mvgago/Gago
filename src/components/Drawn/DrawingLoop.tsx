import React, { useEffect, useRef } from "react";

/**
 * Full-bleed, for the projects page: a drawing draws itself (as RevealImage, from its order map), holds a
 * moment, and the photograph of the same place comes in softly over it; then the photograph goes, the sheet
 * is blank again and the drawing starts over. Round and round while it is on view.
 */
const K = 24;
const DRAW = 4.5, HOLD = 1.5, FADE = 1.6, PHOTO = 4.4, REST = 0.4;
const CYCLE = DRAW + HOLD + FADE + PHOTO + FADE + REST;
const ease = (p: number) => p * p * (3 - 2 * p);

export const DrawingLoop: React.FC<{
  drawing: { src: string; order: string; w: number; h: number; paper: string };
  photo: string;
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
      if (s < DRAW) { drawn = 1 - Math.pow(1 - s / DRAW, 2.2); shown = 0; }
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
    let left = 3;
    for (const u of [src, order, photo]) {
      const im = new Image();
      im.onload = im.onerror = () => { if (--left === 0) raf = requestAnimationFrame(tick); };
      im.src = u;
    }
    return () => cancelAnimationFrame(raf);
  }, [src, order, photo]);

  return (
    <div className={`overflow-hidden ${className}`} style={{ background: paper }}>
      {/* the drawing is small (a screenshot's worth of pixels): never stretched past its own size, it sits
          centred on its own paper, which runs on to the edges, so it stays sharp on large screens */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
        style={{ maxWidth: w, maxHeight: h }}
        aria-hidden
      >
        <defs>
          <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={w} height={h} colorInterpolationFilters="sRGB">
            <feImage href={order} x="0" y="0" width={w} height={h} preserveAspectRatio="none" result="order" />
            <feColorMatrix ref={matrix} in="order" type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-K} 0 0 0 1`} result="pen" />
            <feComposite in="SourceGraphic" in2="pen" operator="in" result="drawn" />
            <feFlood floodColor={paper} result="paper" />
            <feComposite in="drawn" in2="paper" operator="over" />
          </filter>
        </defs>
        <image href={src} width={w} height={h} filter={`url(#${id})`} />
      </svg>
      <img ref={top} src={photo} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
    </div>
  );
};
