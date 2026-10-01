import React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

// Static film grain, rendered once by the browser and tiled.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Slow, seamless back-and-forth: daylight shifting in a studio. */
const drift = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror",
});

/**
 * Pale vertical reflections, as if the wall were a softly curved sheet of
 * satin metal catching window light. Strongest over the darker lower-left.
 */
// Irregular on purpose: different lengths, starts, widths and a slight lean,
// so they read as reflections rather than a grid.
// Each one breathes on its own clock, so they never glow in unison.
const STREAKS = [
  { left: "4%", top: "28%", bottom: "-6%", width: "9vw", opacity: 0.55, rotate: -1.5, duration: 7, delay: 0 },
  { left: "30%", top: "46%", bottom: "4%", width: "5vw", opacity: 0.35, rotate: 1, duration: 9, delay: 2.5 },
  { left: "63%", top: "38%", bottom: "12%", width: "7vw", opacity: 0.3, rotate: -0.5, duration: 8, delay: 4.5 },
];

// Feathered in both axes: a tall oval glow, brightest in its lower third,
// with no hard edge or centre line anywhere.
const STREAK_FILL =
  "radial-gradient(50% 50% at 50% 62%, rgba(255, 253, 248, 0.85) 0%, rgba(255, 253, 248, 0.4) 35%, rgba(255, 253, 248, 0.1) 70%, transparent 100%)";

/**
 * Fixed studio backdrop modelled on the reference photograph:
 * mauve-lilac shadow top left, cool silver top right, a near-white bloom
 * on the right, sage-olive falling into the lower left, all over a neutral
 * taupe. Everything stays put; the vertical reflections only dim and
 * brighten softly. Only opacity animates.
 */
export const StudioAtmosphere: React.FC = () => {
  const still = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 55% at 0% 100%, rgba(162, 162, 138, 0.9) 0%, rgba(154, 152, 132, 0.45) 45%, transparent 75%),
            radial-gradient(45% 45% at 100% 100%, rgba(233, 231, 234, 0.85) 0%, transparent 80%),
            radial-gradient(55% 50% at 100% 0%, rgba(204, 204, 212, 0.9) 0%, transparent 80%),
            radial-gradient(40% 40% at 50% 100%, rgba(160, 157, 152, 0.55) 0%, transparent 80%),
            linear-gradient(118deg, #6b5f68 0%, #847d83 22%, #a2a0a3 44%, #c6c5c9 64%, #edecef 100%)
          `,
        }}
      />

      {/* Soft grey-mauve shadow in the upper-left corner */}
      <div
        className="absolute -left-[12vw] -top-[14vh] h-[85vh] w-[70vw] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(97, 83, 96, 0.55), transparent)" }}
      />

      {/* Key light: a fixed near-white bloom on the right */}
      <div
        className="absolute left-[80vw] top-[48vh] h-[90vmax] w-[90vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253, 253, 255, 0.7) 0%, rgba(246, 246, 249, 0.32) 30%, rgba(231, 230, 235, 0.08) 62%, transparent 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Vertical reflections over the dark areas */}
      {STREAKS.map((s) => (
        <motion.div
          key={s.left}
          className="absolute will-change-[opacity]"
          style={{
            left: s.left,
            top: s.top,
            bottom: s.bottom,
            width: s.width,
            opacity: s.opacity,
            rotate: s.rotate,
            background: STREAK_FILL,
            filter: "blur(18px)",
            mixBlendMode: "screen",
          }}
          // Fixed in place: the glow only dims and brightens.
          animate={still ? undefined : { opacity: [s.opacity, s.opacity * 0.3] }}
          transition={drift(s.duration, s.delay)}
        />
      ))}

      {/* Grain + a cool, neutral vignette (no brown) */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(140% 110% at 65% 45%, transparent 60%, rgba(48, 40, 50, 0.22) 100%)" }}
      />
    </div>
  );
};
