import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS, type Section } from "./sections";
import { ContactMenu } from "../Contact/ContactMenu";
import { EASE_VEIL } from "../../lib/motion";

type Props = { open: boolean; onClose: () => void };

// three.js only loads when the index is first opened.
const LogoSpace = lazy(() => import("./LogoSpace"));

// Palette: white on white, with the faintest violet in the shadows.
const NAVE = {
  label: "#6e6a76",
  labelOn: "#3b3842",
  hair: "rgba(59, 56, 66, 0.12)",
};

/**
 * The index as the FUGA wordmark in sculpture, in an infinite white studio
 * (real-time 3D, see LogoSpace). Hovering a section recomposes the letters;
 * clicking passes through them into the section. The labels stay flat and
 * razor sharp above the scene.
 */
export const SpatialIndex: React.FC<Props> = ({ open, onClose }) => {
  const [active, setActive] = useState<Section | null>(null);
  const [walking, setWalking] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
    if (!open) {
      setActive(null);
      setWalking(false);
    }
  }, [open]);

  const shown = active ?? SECTIONS[0];


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spatial-index"
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
          className="fixed inset-0 z-40 overflow-hidden bg-[#f3f2f5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.2, ease: EASE_VEIL } }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE_VEIL } }}
        >
          <Suspense fallback={null}>
            <LogoSpace active={active ? SECTIONS.indexOf(active) : null} diving={walking} />
          </Suspense>
          {/* Arrival: inside the flower, light floods everything */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#f7f6f8]"
            initial={{ opacity: 0 }}
            animate={{ opacity: walking ? 1 : 0, transition: { duration: 0.55, delay: walking ? 1.1 : 0 } }}
            onAnimationComplete={() => {
              if (!walking) return;
              navigate(shown.path);
              onClose();
            }}
          />

          {/* Gallery labels: flat, sharp, far apart */}
          <nav
            className="pointer-events-none absolute inset-0"
            onMouseLeave={() => setActive(null)}
            aria-label="Sections"
          >
            {SECTIONS.map((s, i) => (
              <Label
                key={s.path}
                section={s}
                index={i}
                on={active === s}
                dimmed={active !== null && active !== s}
                current={pathname === s.path}
                onHover={() => !walking && setActive(s)}
                onGo={() => {
                  setActive(s);
                  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    navigate(s.path);
                    onClose();
                  } else setWalking(true);
                }}
              />
            ))}
          </nav>

          {/* Footer */}
          <motion.footer
            className="absolute inset-x-4 bottom-8 flex flex-wrap items-center justify-between gap-4 pt-5 font-mono text-[11px] font-light lowercase tracking-[0.12em] sm:inset-x-6 md:inset-x-8 md:bottom-10"
            style={{ color: NAVE.label, borderTop: `1px solid ${NAVE.hair}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: walking ? 0 : 1, transition: { delay: walking ? 0 : 1, duration: walking ? 0.4 : 1 } }}
          >
            <span>fuga haus — index</span>
            <span className="flex items-center gap-3">
              <span>available for projects — {new Date().getFullYear()}</span>
              <span aria-hidden>·</span>
              <ContactMenu />
            </span>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────────── */

// Where each label hangs: left wall, right wall, and low in the centre — around the piece.
const SPOTS = [
  "left-4 top-1/2 -translate-y-1/2 sm:left-6 md:left-8",
  "right-4 top-1/2 -translate-y-1/2 text-right sm:right-6 md:right-8",
  "left-1/2 bottom-[18%] -translate-x-1/2 text-center",
] as const;

type LabelProps = {
  section: Section;
  index: number;
  on: boolean;
  dimmed: boolean;
  current: boolean;
  onHover: () => void;
  onGo: () => void;
};

const Label: React.FC<LabelProps> = ({ section, index, on, dimmed, current, onHover, onGo }) => (
  <motion.a
    href={section.path}
    onClick={(e) => {
      e.preventDefault();
      onGo();
    }}
    onMouseEnter={onHover}
    onFocus={onHover}
    aria-current={current ? "page" : undefined}
    className={`pointer-events-auto absolute block outline-none ${SPOTS[index]}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: dimmed ? 0.35 : 1, transition: { duration: 0.8, delay: dimmed ? 0 : 0.9 + index * 0.15 } }}
  >
    <span className="block font-mono text-[10px] font-extralight tracking-[0.25em]" style={{ color: NAVE.label }}>
      {section.num}
      {current && " · you are here"}
    </span>
    <span
      className="mt-2 block font-geo text-2xl font-light lowercase tracking-[0.18em] transition-colors duration-700 md:text-[1.9vw]"
      style={{ color: on ? NAVE.labelOn : NAVE.label }}
    >
      {section.label}
    </span>
    <span
      className="mt-2 block font-mono text-[10px] font-extralight lowercase tracking-[0.2em] transition-opacity duration-700"
      style={{ color: NAVE.label, opacity: on ? 1 : 0 }}
    >
      {section.caption}
    </span>
  </motion.a>
);
