import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";

/**
 * A drawing that draws itself the first time it is seen. It is a picture, not strokes, so the pen is
 * a map: a grey image where each line's brightness is when the pen reaches it (worked out once,
 * spreading from the building along its lines). An SVG filter shows the lines whose time has come
 * and lays the paper over the rest; once drawn, the plain picture is left.
 */
const K = 24; // how soft the pen's front is: the share of the drawing it spans, inverted
const BLANK = `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-K} 0 0 0 1`;

export const RevealImage: React.FC<{
  src: string;
  /** the order map (any size: it is stretched over the picture) */
  order: string;
  /** the picture's own size, for its proportions */
  w: number;
  h: number;
  /** the paper, laid over the lines not drawn yet */
  paper: string;
  /** seconds */
  duration?: number;
  /** cropped to the pairs' 16:10, like the pictures beside it */
  cover?: boolean;
  /** with cover: where the crop sits, top (0) to bottom (1) */
  focus?: number;
  alt?: string;
}> = ({ src, order, w, h, paper, duration = 4.5, cover = false, focus = 0.5, alt = "" }) => {
  // the 16:10 window over the picture, when cropped
  const cropH = Math.min(h, w / 1.6);
  const view = cover ? `0 ${(focus * (h - cropH)).toFixed(1)} ${w} ${cropH.toFixed(1)}` : `0 0 ${w} ${h}`;
  const box = useRef<HTMLDivElement>(null);
  const matrix = useRef<SVGFEColorMatrixElement>(null);
  const [done, setDone] = useState(false);
  const id = useRef(`reveal-${Math.random().toString(36).slice(2, 8)}`).current;
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (still) return setDone(true);
    const el = box.current;
    if (!el) return;
    let raf = 0;
    let seen = false, ready = false;
    const run = () => {
      if (!seen || !ready) return;
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / (duration * 1000));
        // quick off the mark, easing into the last strokes
        const t = 1 / K + (1 - Math.pow(1 - p, 2.2)) * (1 + 1 / K);
        matrix.current?.setAttribute("values", `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-K} 0 0 0 ${K * t}`);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    };
    // both pictures in hand before the pen moves
    let left = 2;
    for (const u of [src, order]) {
      const im = new Image();
      im.onload = im.onerror = () => { if (--left === 0) { ready = true; run(); } };
      im.src = u;
    }
    // drawn again every time it comes back on screen: once fully out of sight, the sheet is blank again
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.4 && !seen) {
        seen = true;
        // (the blank sheet has to be back in the page before the pen can move on it)
        requestAnimationFrame(run);
      } else if (!e.isIntersecting && seen) {
        seen = false;
        cancelAnimationFrame(raf);
        setDone(false);
      }
    }, { threshold: [0, 0.4] });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [src, order, duration, still]);

  return (
    <motion.div
      ref={box}
      className="w-full"
      onContextMenu={(e) => e.preventDefault()}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE_HAUS }}
    >
      {done ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={cover ? "block aspect-[16/10] w-full object-cover" : "block h-auto w-full"}
          style={cover ? { objectPosition: `50% ${focus * 100}%` } : undefined}
        />
      ) : (
        <svg
          viewBox={view}
          preserveAspectRatio={cover ? "xMidYMid slice" : undefined}
          className={cover ? "block aspect-[16/10] w-full" : "block h-auto w-full"}
          role="img"
          aria-label={alt}
        >
          <defs>
            <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={w} height={h} colorInterpolationFilters="sRGB">
              <feImage href={order} x="0" y="0" width={w} height={h} preserveAspectRatio="none" result="order" />
              {/* alpha = K·(t − when): nothing yet before its time, then in over a short front */}
              <feColorMatrix ref={matrix} in="order" type="matrix" values={BLANK} result="pen" />
              <feComposite in="SourceGraphic" in2="pen" operator="in" result="drawn" />
              <feFlood floodColor={paper} result="paper" />
              <feComposite in="drawn" in2="paper" operator="over" />
            </filter>
          </defs>
          <image href={src} width={w} height={h} filter={`url(#${id})`} />
        </svg>
      )}
    </motion.div>
  );
};
