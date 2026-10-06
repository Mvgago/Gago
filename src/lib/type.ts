/**
 * The site's type scale. Every text on the site is one of these, so the same
 * role always has the same size, weight and spacing on every page.
 */

/** The one large line of a screen: the landing's manifesto, the project on view */
export const DISPLAY =
  "font-geo text-[2.5rem] font-light leading-[1.05] tracking-[0.01em] sm:text-[3.2rem] lg:text-[4.4rem] lg:leading-[1.02]";

/** A page's title, and the next project at the end of a case */
export const TITLE = "font-geo text-[2.4rem] font-light leading-none tracking-[0.02em] sm:text-5xl";

/** A statement to read first: the studio's, the contact's */
// Regular weight: a light stroke this size fades into the bright room behind it
export const LEAD = "font-geo text-[1.9rem] font-normal leading-[1.22] tracking-[0.01em] md:text-[2.5rem]";

/** The line under a title: the landing's subtitle, a project's lead */
export const SUBTITLE =
  "font-geo text-[1.3rem] font-light leading-snug tracking-[0.01em] sm:text-[1.5rem] lg:text-[1.9rem]";

/** The title of an item inside a page: a discipline, a step, a piece */
export const HEADING = "font-geo text-[1.2rem] font-light leading-snug tracking-[0.02em]";

/** A page's caption, a project's scope, the list of projects */
export const CAPTION = "font-geo text-base font-normal tracking-[0.04em]";

/** Running text. Regular weight: light strokes at this size fade on the pale wall */
export const BODY = "font-geo text-[15px] font-normal leading-relaxed tracking-[0.02em] md:text-base";

/** Every link or button that does something */
export const ACTION = "font-mono text-[15px] font-normal lowercase tracking-[0.04em] sm:text-[16px]";

/** Labels and facts */
export const SMALL = "font-mono text-[14px] font-normal lowercase tracking-[0.03em]";
