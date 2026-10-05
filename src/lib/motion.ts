import type { Transition, Variants } from "framer-motion";

/** Long, zero-overshoot deceleration — the house curve. */
export const EASE_HAUS = [0.22, 1, 0.36, 1] as const;
/** Slower, symmetric curve for veils and full-screen surfaces. */
export const EASE_VEIL = [0.65, 0, 0.35, 1] as const;

export const slow: Transition = { duration: 1.4, ease: EASE_HAUS };
export const veil: Transition = { duration: 1.1, ease: EASE_VEIL };

/** Critically damped spring: follows without bouncing. */
export const SPRING_LIGHT = { stiffness: 42, damping: 20, mass: 1 };

/** Text rising into place, staggered: quick enough that a page reads at once. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_HAUS, delay: 0.05 + i * 0.05 },
  }),
};
