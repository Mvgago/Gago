import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useTransform } from "framer-motion";
import { SECTIONS, type Section } from "./sections";
import { Clocks, COORDINATES, StudioStatus } from "../Meta/Meta";
import { usePointerLight } from "../Light/PointerLight";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";

type Props = { open: boolean; onClose: () => void };

/**
 * Full-screen index, laid out like an architectural archive drawer.
 * Hovering a section brings its plates forward and a large hollow title
 * drifts behind them, parallaxing gently against the light.
 */
export const SpatialIndex: React.FC<Props> = ({ open, onClose }) => {
  const [active, setActive] = useState<Section | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setActive(null);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spatial-index"
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
          className="fixed inset-0 z-40 overflow-hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
          transition={{ duration: 1.1, ease: EASE_VEIL }}
        >
          {/* Frosted pearl veil over the studio */}
          <div className="absolute inset-0 bg-[#e7e2dc]/80 backdrop-blur-2xl" />

          <FloatingTitle section={active} />
          <PreviewPlates section={active} />

          <div className="relative flex h-full flex-col px-4 pb-8 pt-20 sm:px-6 md:px-8 md:pb-12">
            {/* Column headings */}
            <motion.div
              className="meta flex justify-between border-b border-ink/15 pb-4 text-graphite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6, duration: 1 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <span>index / archive</span>
              <span className="hidden sm:block">{SECTIONS.length} rooms</span>
            </motion.div>

            <nav className="my-auto" onMouseLeave={() => setActive(null)}>
              <ul>
                {SECTIONS.map((s, i) => {
                  const current = pathname === s.path;
                  const dimmed = active !== null && active !== s;
                  return (
                    <li key={s.path} className="overflow-hidden border-b border-ink/10">
                      <motion.div
                        initial={{ y: "105%" }}
                        animate={{ y: "0%", transition: { duration: 1.3, ease: EASE_HAUS, delay: 0.35 + i * 0.09 } }}
                        exit={{ y: "-105%", transition: { duration: 0.6, ease: EASE_VEIL, delay: i * 0.04 } }}
                      >
                        <Link
                          to={s.path}
                          onClick={onClose}
                          onMouseEnter={() => setActive(s)}
                          onFocus={() => setActive(s)}
                          aria-current={current ? "page" : undefined}
                          className="group flex items-baseline gap-4 py-3 outline-none sm:gap-8 md:py-4"
                        >
                          <span className="meta w-8 shrink-0 text-graphite">{s.num}</span>
                          <span
                            className="font-display text-[11vw] leading-[1.05] tracking-[-0.02em] text-ink transition-[opacity,transform] duration-700 ease-haus group-hover:translate-x-3 sm:text-[8.5vw] md:text-[6.4vw]"
                            style={{ opacity: dimmed ? 0.18 : 1 }}
                          >
                            {s.label}
                          </span>
                          <span
                            className="meta ml-auto hidden text-right text-graphite transition-opacity duration-700 md:block"
                            style={{ opacity: dimmed ? 0.3 : 1 }}
                          >
                            {current ? "— you are here" : s.caption}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.footer
              className="flex flex-col gap-3 border-t border-ink/15 pt-4 text-graphite sm:flex-row sm:items-end sm:justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8, duration: 1 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <div className="flex flex-col gap-1">
                <StudioStatus />
                <span className="meta">{COORDINATES}</span>
              </div>
              <Clocks />
              <a href="mailto:mvgago26@gmail.com" className="meta text-ink transition-opacity hover:opacity-60">
                mvgago26@gmail.com
              </a>
            </motion.footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Giant hollow word drifting behind the list. */
const FloatingTitle: React.FC<{ section: Section | null }> = ({ section }) => {
  const { nx, ny } = usePointerLight();
  const x = useTransform(nx, [-1, 1], [40, -40]);
  const y = useTransform(ny, [-1, 1], [24, -24]);

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
    >
      <AnimatePresence mode="popLayout">
        {section && (
          <motion.span
            key={section.label}
            className="text-hollow select-none whitespace-nowrap font-display text-[26vw] leading-none"
            initial={{ opacity: 0, y: 40, letterSpacing: "0.02em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.2, ease: EASE_HAUS }}
          >
            {section.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Resting offsets for up to three stacked plates.
const PLATES = [
  { right: "9vw", top: "18vh", w: "19vw", rotate: -2.5 },
  { right: "22vw", top: "40vh", w: "14vw", rotate: 1.5 },
  { right: "5vw", top: "52vh", w: "12vw", rotate: 3 },
];

/** Photographic plates that slide forward for the hovered section (desktop only). */
const PreviewPlates: React.FC<{ section: Section | null }> = ({ section }) => {
  const { nx, ny } = usePointerLight();
  const x = useTransform(nx, [-1, 1], [-18, 18]);
  const y = useTransform(ny, [-1, 1], [-12, 12]);

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute inset-0 hidden will-change-transform md:block"
    >
      <AnimatePresence>
        {section &&
          section.previews.map((src, i) => {
            const p = PLATES[i];
            return (
              <motion.figure
                key={`${section.label}-${i}`}
                className="absolute overflow-hidden bg-pearl shadow-[0_30px_60px_-20px_rgba(40,30,22,0.35)]"
                style={{ right: p.right, top: p.top, width: p.w, aspectRatio: i === 0 ? "4 / 5" : "1 / 1" }}
                initial={{ opacity: 0, y: 50, rotate: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: p.rotate,
                  scale: 1,
                  transition: { duration: 1.1, ease: EASE_HAUS, delay: i * 0.08 },
                }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.45, ease: EASE_VEIL } }}
              >
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover grayscale-[0.55] sepia-[0.12]"
                />
              </motion.figure>
            );
          })}
      </AnimatePresence>
    </motion.div>
  );
};
