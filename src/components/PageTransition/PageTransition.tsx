import React from "react";
import { motion } from "framer-motion";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";

/**
 * Pages exhale in and out: a soft rise and fade, never a slide — brief, so
 * moving between rooms never makes anyone wait.
 * Opacity and transform only, so it stays on the compositor.
 */
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  /** Fade only, no rise: for full-screen pages, where moving the whole frame reads as a jolt */
  still?: boolean;
}> = ({ children, className, still }) => (
  <motion.div
    className={className}
    // The same long, soft deceleration as the smooth scroll: quick to start, slow to settle
    initial={{ opacity: 0, y: still ? 0 : 24 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_HAUS } }}
    exit={{ opacity: 0, y: still ? 0 : -12, transition: { duration: 0.4, ease: EASE_VEIL } }}
  >
    {children}
  </motion.div>
);
