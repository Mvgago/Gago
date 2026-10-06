/**
 * The site's type scale. Every text on the site is one of these, so the same
 * role always has the same size, weight and spacing on every page.
 */

/** The one large line of a screen: the landing's manifesto, the project on view */
export const DISPLAY =
  "font-geo text-[2.2rem] font-light leading-[1.05] tracking-[0.01em] sm:text-[2.8rem] lg:text-[3.6rem] lg:leading-[1.04]";

/** A page's title, and the next project at the end of a case */
export const TITLE = "font-geo text-[2rem] font-light leading-none tracking-[0.02em] sm:text-[2.5rem]";

/** A statement to read first: the studio's, the contact's */
// Regular weight: a light stroke this size fades into the bright room behind it
export const LEAD = "font-geo text-[1.6rem] font-normal leading-[1.25] tracking-[0.01em] md:text-[2.1rem]";

/** The line under a title: the landing's subtitle, a project's lead */
export const SUBTITLE =
  "font-geo text-[1.15rem] font-light leading-snug tracking-[0.01em] sm:text-[1.3rem] lg:text-[1.55rem]";

/** The title of an item inside a page: a discipline, a step, a piece */
export const HEADING = "font-geo text-[1.1rem] font-light leading-snug tracking-[0.02em]";

/** A page's caption, a project's scope, the list of projects */
export const CAPTION = "font-geo text-[15px] font-normal tracking-[0.04em]";

/** Running text. Regular weight: light strokes at this size fade on the pale wall */
export const BODY = "font-geo text-[15px] font-normal leading-relaxed tracking-[0.02em]";

/** Every link or button that does something */
export const ACTION = "font-mono text-[13px] font-normal lowercase tracking-[0.04em]";

/** Labels and facts */
export const SMALL = "font-mono text-[13px] font-normal lowercase tracking-[0.03em]";
