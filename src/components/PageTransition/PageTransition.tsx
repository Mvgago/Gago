import React from "react";
import { motion } from "framer-motion";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";

/**
 * Pages exhale in and out: a soft rise and fade, never a slide — brief, so
 * moving between rooms never makes anyone wait.
 * Opacity and transform only, so it stays on the compositor.
 */
export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_HAUS } }}
    exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE_VEIL } }}
  >
    {children}
  </motion.div>
);
