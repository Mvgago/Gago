import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";

// Once, as the text comes a little way into view
const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

type Tag = "span" | "p" | "h2" | "h3";

/**
 * Words rising out of their own line and coming into focus, one after another: the lema's arrival on the
 * landing, used for the headings and the statement on the inner pages. Read whole by screen readers.
 */
export const RevealWords: React.FC<{ text: string; className?: string; delay?: number; stagger?: number; as?: Tag }> = ({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as = "span",
}) => {
  const still = useReducedMotion();
  if (still) return React.createElement(as, { className }, text);
  const M = motion[as] as typeof motion.span;
  const words = text.split(" ");
  return (
    <M className={className} aria-label={text} initial="off" whileInView="on" viewport={VIEW}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span aria-hidden className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                off: { y: "105%", opacity: 0, filter: "blur(4px)" },
                on: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE_HAUS, delay: delay + i * stagger } },
              }}
            >
              {w}
            </motion.span>
          </span>
        </React.Fragment>
      ))}
    </M>
  );
};

/** A paragraph or line easing up a touch out of a light haze, after the heading above it. */
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number; as?: Tag | "div" }> = ({
  children,
  className,
  delay = 0,
  as = "div",
}) => {
  const still = useReducedMotion();
  if (still) return React.createElement(as, { className }, children);
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={VIEW}
      transition={{ duration: 1, ease: EASE_HAUS, delay }}
    >
      {children}
    </M>
  );
};
