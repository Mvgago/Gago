import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";

// Once, as soon as the text is in view (not later: a phone sheet can be covered before it is far in)
const VIEW = { once: true, margin: "0px 0px -4% 0px" } as const;

type Tag = "span" | "p" | "h2" | "h3" | "li";

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

/**
 * Running text that comes in as a soft, quick wave: its words rise a little and come into focus one after
 * another, so the paragraph is seen to settle rather than stand pasted on the page (word by word, never
 * letter by letter; read whole by screen readers).
 */
export const RevealFlow: React.FC<{ text: string; className?: string; delay?: number; stagger?: number; as?: Tag | "div" }> = ({
  text,
  className,
  delay = 0,
  stagger = 0.014,
  as = "p",
}) => {
  const still = useReducedMotion();
  if (still) return React.createElement(as, { className }, text);
  const M = motion[as] as typeof motion.p;
  // (runs of spaces, as between the services' middle dots, count as one)
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <M className={className} aria-label={text} initial="off" whileInView="on" viewport={VIEW}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <motion.span
            aria-hidden
            className="inline-block"
            variants={{
              off: { opacity: 0, y: "0.4em", filter: "blur(3px)" },
              on: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE_HAUS, delay: delay + i * stagger } },
            }}
          >
            {w}
          </motion.span>
        </React.Fragment>
      ))}
    </M>
  );
};
