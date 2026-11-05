import React from "react";

// Fine film grain, as on the landing
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * The studio's light, held still behind the page as it scrolls: the landing's mauve, olive and pale bloom
 * turned low, as in the contact block, a fine grain over it and the corners a shade deeper, so the graphite
 * has depth rather than being a flat wall. It sits behind the routed pages (not inside one), so a page's
 * entrance never carries it along and it never jumps into place as the page settles.
 */
export const StudioLight: React.FC = () => (
  <>
    <div
      className="absolute inset-0"
      style={{
        background: [
          "radial-gradient(60% 55% at 6% 0%, rgba(120, 98, 116, 0.34) 0%, transparent 78%)",
          "radial-gradient(55% 60% at 0% 100%, rgba(150, 146, 110, 0.22) 0%, transparent 75%)",
          "radial-gradient(42% 58% at 94% 36%, rgba(236, 226, 222, 0.11) 0%, transparent 75%)",
          "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(18, 15, 15, 0.38) 100%)",
        ].join(", "),
      }}
    />
    {/* phones: the screen is tall and narrow, so the mauve barely reached the top of it; a wider wash of it
        across the top gives the first screen the depth it has on wide screens */}
    <div
      className="absolute inset-0 sm:hidden"
      style={{ background: "radial-gradient(95% 42% at 18% 0%, rgba(120, 98, 116, 0.42) 0%, rgba(120, 98, 116, 0.16) 55%, transparent 85%)" }}
    />
    {/* (plain, no blend mode: blending a full-screen layer under a scrolling page is heavy on phones) */}
    <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: GRAIN }} />
  </>
);
