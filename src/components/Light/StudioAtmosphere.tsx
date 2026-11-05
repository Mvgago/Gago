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
 * taupe. Nothing crosses it: the mauve and the white only breathe, and the
 * vertical reflections dim and brighten. Only transform and opacity animate.
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

      {/* The light is alive without anything moving across it: the mauve and the white only breathe, their
          strength and reach easing up and down on long, different clocks, so they stay melted into the wall */}
      {/* Grey-mauve shadow from the upper left, with real presence: larger and a little deeper, spread wider on
          arrival and gathering over the first seconds, then breathing */}
      <motion.div
        className="absolute -left-[16vw] -top-[18vh] h-[100vh] w-[88vw] will-change-transform"
        initial={still ? false : { x: "10vw", y: "8vh", scale: 1.3 }}
        animate={{ x: "0vw", y: "0vh", scale: 1 }}
        transition={{ duration: 9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(97, 83, 96, 0.7) 0%, rgba(97, 83, 96, 0.42) 45%, rgba(97, 83, 96, 0.14) 75%, transparent 100%)" }}
          animate={still ? undefined : { opacity: [1, 0.8], scale: [1, 1.1] }}
          transition={{ duration: 13, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 9 }}
        />
      </motion.div>

      {/* On arrival the mauve also holds the upper right for the first seconds, then melts away slowly and
          leaves that corner to the light */}
      {!still && (
        <motion.div
          className="absolute -right-[20vw] -top-[22vh] h-[85vh] w-[90vw]"
          style={{ background: "radial-gradient(closest-side, rgba(104, 88, 102, 0.62) 0%, rgba(104, 88, 102, 0.34) 45%, rgba(104, 88, 102, 0.1) 75%, transparent 100%)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 3.5, ease: [0.45, 0, 0.55, 1], delay: 3 }}
        />
      )}

      {/* Key light on the right: a broad, tall wash of near-white rather than a round bloom (its long, soft
          fall-off leaves no edge to read as a shape), breathing on its own clock */}
      <motion.div
        className="absolute left-[82vw] top-[50vh] h-[150vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253, 253, 255, 0.5) 0%, rgba(248, 248, 251, 0.32) 22%, rgba(240, 239, 243, 0.16) 45%, rgba(231, 230, 235, 0.06) 70%, transparent 100%)",
          mixBlendMode: "screen",
        }}
        animate={still ? undefined : { opacity: [1, 0.78] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 4 }}
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
