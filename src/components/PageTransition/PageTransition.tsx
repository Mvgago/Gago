import React from "react";
import { motion } from "framer-motion";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";

/**
 * Pages exhale in and out: a slow rise and fade, never a slide.
 * Opacity and transform only, so it stays on the compositor.
 */
export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 1.4, ease: EASE_HAUS } }}
    exit={{ opacity: 0, y: -16, transition: { duration: 0.7, ease: EASE_VEIL } }}
  >
    {children}
  </motion.div>
);
