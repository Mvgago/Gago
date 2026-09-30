import React, { useId } from "react";
import { motion, useTransform } from "framer-motion";
import { usePointerLight } from "../Light/PointerLight";
import { EASE_HAUS } from "../../lib/motion";

/**
 * FUGA HAUS wordmark, redrawn as stroked centre-lines from the reference
 * so the letterforms can take a satin-metal material.
 *
 * Each glyph is a single rounded-rectangle bar path; "haus" sits beneath
 * the "u" and runs into the tail of the "g", exactly as in the original.
 */
const VIEWBOX = { x: 230, y: 660, w: 1430, h: 440 };
/** Bar weight. */
const FACE = 35;
/** Polished edge width per side (≈0.5px at header size). */
const RIM = 5;
/** The single highlight: centred where the "u" meets "haus". */
const HIGHLIGHT = { cx: 755, cy: 985, r: 340 };

/** Extra air between "u / haus" and "ga". */
const GAP = 30;

const GLYPHS = [
  // F
  { d: "M570 695H300A33 33 0 0 0 267 728V976M267 826H570", dx: 0 },
  // u
  { d: "M612 755V925A35 35 0 0 0 647 960H860A35 35 0 0 0 895 925V755", dx: 0 },
  // g
  { d: "M1225 960H985A35 35 0 0 1 950 925V807A35 35 0 0 1 985 772H1225V1025A35 35 0 0 1 1190 1060H935", dx: GAP },
  // a
  { d: "M1290 772H1555A35 35 0 0 1 1590 807V965H1335A35 35 0 0 1 1300 930V885A35 35 0 0 1 1335 850H1590", dx: GAP },
];

/**
 * Two finishes for the same metal: warm reflects the studio sweep of the
 * landing; steel matches the cold titanium of the index.
 */
const TONES = {
  warm: { face: ["#b8aca6", "#b1a59e", "#ab9e95", "#a59890", "#a09287"], rim: ["#ddd3cc", "#cfc4ba"], sheen: ["#fffcf8", "#fff6ee"] },
  steel: { face: ["#fafbfc", "#eceff2", "#f6f7f9", "#e3e7eb", "#f0f2f4"], rim: ["#dfe3e7", "#d3d8dd"], sheen: ["#ffffff", "#ffffff"] },
} as const;
export type MonolithTone = keyof typeof TONES;

// Stop colours are CSS properties, so the finish can cross-fade.
const stop = (color: string) => ({ stopColor: color, transition: "stop-color 900ms cubic-bezier(0.22, 1, 0.36, 1)" });

type Props = {
  /** Metal finish. */
  tone?: MonolithTone;
  /** Perspective tilt toward the cursor (only reads well at large sizes). */
  tilt?: boolean;
  /** Draw the letterforms in on mount. */
  reveal?: boolean;
  className?: string;
};

export const Monolith: React.FC<Props> = ({ tone = "warm", tilt = true, reveal = true, className }) => {
  const t = TONES[tone];
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;

  const { nx, ny } = usePointerLight();

  // Architectural tilt: a few degrees at most, like a slab turned to the light.
  const rotateY = useTransform(nx, [-1, 1], tilt ? [-7, 7] : [0, 0]);
  const rotateX = useTransform(ny, [-1, 1], tilt ? [5, -5] : [0, 0]);

  const draw = reveal
    ? {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: {
          pathLength: { duration: 2.4, ease: EASE_HAUS, delay: 0.2 },
          opacity: { duration: 0.6, delay: 0.2 },
        },
      }
    : {};

  const fadeIn = (delay: number) =>
    reveal
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 1.6, ease: EASE_HAUS, delay },
        }
      : {};

  const glyphs = (stroke: string, width: number, animated = true) =>
    GLYPHS.map(({ d, dx }) => (
      <g key={d} transform={dx ? `translate(${dx} 0)` : undefined}>
        {animated ? (
          <motion.path d={d} stroke={stroke} strokeWidth={width} {...draw} />
        ) : (
          <path d={d} stroke={stroke} strokeWidth={width} />
        )}
      </g>
    ));

  const haus = (fill: string) => (
    <text
      x={596}
      y={1073}
      textLength={314}
      lengthAdjust="spacingAndGlyphs"
      fontFamily="Michroma, sans-serif"
      fontSize={92}
      fill={fill}
    >
      haus
    </text>
  );

  return (
    <div className={className} style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, rotateY }} className="will-change-transform">
        <svg
          viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label="Fuga Haus"
        >
          <defs>
            {/* Satin metal in the current finish: an even tonal drift,
                with no light bands of its own so the only highlight is the one below */}
            <linearGradient
              id={id("matte")}
              gradientUnits="userSpaceOnUse"
              x1={VIEWBOX.x}
              y1={VIEWBOX.y}
              x2={VIEWBOX.x + VIEWBOX.w}
              y2={VIEWBOX.y + VIEWBOX.h}
            >
              {t.face.map((color, i) => (
                <stop key={i} offset={i / (t.face.length - 1)} style={stop(color)} />
              ))}
            </linearGradient>

            {/* Polished edge: a step lighter than the face, evenly lit */}
            <linearGradient
              id={id("rim")}
              gradientUnits="userSpaceOnUse"
              x1={VIEWBOX.x}
              y1={VIEWBOX.y}
              x2={VIEWBOX.x + VIEWBOX.w}
              y2={VIEWBOX.y + VIEWBOX.h}
            >
              <stop offset="0" style={stop(t.rim[0])} />
              <stop offset="1" style={stop(t.rim[1])} />
            </linearGradient>

            {/* The one reflection, resting on the "u" and "haus" */}
            <radialGradient
              id={id("sheen")}
              gradientUnits="userSpaceOnUse"
              cx={HIGHLIGHT.cx}
              cy={HIGHLIGHT.cy}
              r={HIGHLIGHT.r}
            >
              <stop offset="0" stopOpacity="0.85" style={stop(t.sheen[0])} />
              <stop offset="0.4" stopOpacity="0.38" style={stop(t.sheen[1])} />
              <stop offset="1" stopOpacity="0" style={stop(t.sheen[1])} />
            </radialGradient>
          </defs>

          <g fill="none" strokeLinecap="butt" strokeLinejoin="miter" shapeRendering="geometricPrecision">
            {glyphs(`url(#${id("rim")})`, FACE + RIM * 2)}
            {glyphs(`url(#${id("matte")})`, FACE)}
            <motion.g {...fadeIn(1.6)}>{glyphs(`url(#${id("sheen")})`, FACE + RIM * 2, false)}</motion.g>
          </g>

          {/* "haus" beneath the u, with a finer edge in proportion to its size */}
          <motion.g {...fadeIn(1.4)} shapeRendering="geometricPrecision">
            <g stroke={`url(#${id("rim")})`} strokeWidth={RIM * 0.7} strokeLinejoin="round" paintOrder="stroke">
              {haus(`url(#${id("matte")})`)}
            </g>
            {haus(`url(#${id("sheen")})`)}
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};
