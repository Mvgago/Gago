import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS, type Section } from "./sections";
import { ContactMenu } from "../Contact/ContactMenu";
import { SocialLinks } from "../Contact/SocialLinks";
import { EASE_VEIL } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import type { Key } from "../../i18n/strings";

type Props = { open: boolean; onClose: () => void };

// three.js stays out of the first load; the header fetches it quietly once the
// page is idle (or the moment the index button is approached), so the
// sculpture is already there on the first open.
export const preloadLogoSpace = () => import("./LogoSpace");
const LogoSpace = lazy(preloadLogoSpace);

// Palette: brushed steel, with the faintest violet in the shadows.
const NAVE = {
  label: "#5c5864",
  labelOn: "#34313a",
  hair: "rgba(52, 49, 58, 0.16)",
};

// Backdrop: a soft pool of light over cool steel, a faint diagonal sheen like
// brushed metal, and the edges falling slightly darker.
const STEEL = [
  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 48%, transparent 66%)",
  "radial-gradient(120% 90% at 50% 42%, #e2e3e8 0%, #d2d4da 50%, #bfc1c8 100%)",
].join(", ");

/**
 * The index as the FUGA wordmark in sculpture, in an infinite white studio
 * (real-time 3D, see LogoSpace). Hovering a section recomposes the letters;
 * clicking steps back from them into the section. The labels stay flat and
 * razor sharp above the scene.
 */
export const SpatialIndex: React.FC<Props> = ({ open, onClose }) => {
  const [active, setActive] = useState<Section | null>(null);
  const [walking, setWalking] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Keyboard: focus moves into the index, and Tab cycles through the index and
    // the header (language, close) only, never the page hidden behind.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const items = Array.from(
        document.querySelectorAll<HTMLElement>(
          "header a[href], header button, [role=dialog] a[href], [role=dialog] button",
        ),
      ).filter((n) => n.tabIndex >= 0 && n.offsetParent !== null);
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    const focusIn = requestAnimationFrame(() => dialog.current?.focus({ preventScroll: true }));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusIn);
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
          ref={dialog}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={t("index.footer")}
          className="fixed inset-0 z-40 overflow-hidden bg-[#d2d4da] outline-none"
          style={{ backgroundImage: STEEL }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.2, ease: EASE_VEIL } }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE_VEIL } }}
        >
          <Suspense fallback={null}>
            <LogoSpace active={active ? SECTIONS.indexOf(active) : null} diving={walking} />
          </Suspense>
          {/* Arrival: as the camera steps back, light floods everything */}
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
            className="pointer-events-none absolute inset-x-0 top-[47%] flex flex-col items-center gap-7 px-4 sm:top-[50%] sm:gap-9 lg:inset-0 lg:top-0 lg:block lg:px-0"
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
            className="absolute inset-x-4 bottom-6 flex flex-col items-start gap-2 pt-4 font-mono text-[11px] font-light lowercase tracking-[0.12em] sm:inset-x-6 sm:bottom-8 lg:inset-x-8 lg:bottom-10 lg:flex-row lg:items-center lg:justify-end lg:pt-5"
            style={{ color: NAVE.label, borderTop: `1px solid ${NAVE.hair}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: walking ? 0 : 1, transition: { delay: walking ? 0 : 1, duration: walking ? 0.4 : 1 } }}
          >
            <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span>{t("availability")} — {new Date().getFullYear()}</span>
              <span aria-hidden className="hidden sm:inline">·</span>
              <ContactMenu />
              <span aria-hidden className="hidden sm:inline">·</span>
              {/* One line even on phones, so the stacked footer stays short */}
              <span className="flex items-center gap-3">
                <SocialLinks className="hover:text-[#3b3842]" />
                <span aria-hidden>·</span>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/privacy");
                    onClose();
                  }}
                  className="transition-colors duration-500 hover:text-[#3b3842]"
                >
                  {t("privacy")}
                </a>
              </span>
            </span>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────────── */

// Wide screens: the labels hang around the piece — left wall, right wall, low centre.
// Phones and tablets: they stack in one centred column under it (see the nav).
const SPOTS = [
  "lg:absolute lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:text-left",
  "lg:absolute lg:right-8 lg:top-1/2 lg:-translate-y-1/2 lg:text-right",
  "lg:absolute lg:left-1/2 lg:bottom-[18%] lg:-translate-x-1/2 lg:text-center",
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

const Label: React.FC<LabelProps> = ({ section, index, on, dimmed, current, onHover, onGo }) => {
  const { t } = useI18n();
  const key = `section.${section.label}` as Key;
  // The staggered delay is for the labels' entrance only; after that, dimming
  // and relighting between sections must follow the cursor at once.
  const [entered, setEntered] = useState(false);
  return (
  <motion.a
    href={section.path}
    onClick={(e) => {
      e.preventDefault();
      onGo();
    }}
    onMouseEnter={onHover}
    onFocus={onHover}
    aria-current={current ? "page" : undefined}
    className={`pointer-events-auto relative block text-center outline-none ${SPOTS[index]}`}
    initial={{ opacity: 0 }}
    animate={{
      opacity: dimmed ? 0.35 : 1,
      transition: entered ? { duration: 0.3 } : { duration: 0.8, delay: dimmed ? 0 : 0.9 + index * 0.15 },
    }}
    onAnimationComplete={() => setEntered(true)}
  >
    <span className="block font-mono text-[10px] font-extralight tracking-[0.25em]" style={{ color: NAVE.label }}>
      {section.num}
      {current && ` · ${t("index.here")}`}
    </span>
    <span
      className="mt-1.5 block font-geo text-[1.85rem] font-light lowercase leading-none tracking-[0.16em] transition-colors duration-700 sm:text-4xl lg:mt-2 lg:text-[1.9vw] lg:tracking-[0.18em]"
      style={{ color: on ? NAVE.labelOn : NAVE.label }}
    >
      {t(key)}
    </span>
    {/* Caption on hover, wide screens only: phones get just the names */}
    <span
      // Appears promptly with its title; leaves a little more slowly
      className={`mt-2 hidden font-mono text-[10px] font-extralight lowercase tracking-[0.2em] transition-opacity lg:block ${
        on ? "opacity-100 duration-200" : "opacity-0 duration-500"
      }`}
      style={{ color: NAVE.label }}
    >
      {t(`${key}.caption` as Key)}
    </span>
  </motion.a>
  );
};
