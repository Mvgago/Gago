import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";
import { cases, CASE_UI, DISCIPLINE } from "../../outils/cases";
import { useI18n } from "../../i18n/I18n";
import type { Lang } from "../../i18n/strings";
import type { CameraMotion } from "../../components/Gallery/CinematicViewer";
import { ACTION, CAPTION, DISPLAY, SMALL } from "../../lib/type";
import smartBrochures from "../../assets/peojects/smart/smart-brochures-wide.jpg";
import buendiaSocialWide from "../../assets/peojects/buendia/buendia-social-wide.jpg";
import DevicesFrame from "../../components/Devices/DevicesFrame";
// three.js / React Three Fiber only load on this page
const CinematicViewer = lazy(() => import("../../components/Gallery/CinematicViewer"));

// One grade for every project, film or still: a touch darker and firmer than the file
const GRADE = "brightness(0.8) contrast(1.08) saturate(0.9)";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * Selected works, one at a time, full-bleed: the project's film or photograph
 * untouched (see CinematicViewer). The site's one dark room, in the same warm
 * graphite as the rest of the house. All the words sit together in one place,
 * bottom left: the project's scope, its title, and the other projects. The type
 * drifts with the camera at slightly different depths, so depth comes from the
 * type, never the picture.
 */

type Work = { slug: string; title: string };

const WORKS: Work[] = [
  { slug: "sapphire", title: "The Sapphire" },
  { slug: "smarthc", title: "Smart Human Capital" },
  { slug: "buendia", title: "Buendía Travel" },
];

// The sector first, so the range of clients shows at a glance, then what was done
const scopeOf = (slug: string, lang: Lang) => {
  const c = cases.find((k) => k.slug === slug);
  const work = (c?.disciplines ?? []).map((d) => DISCIPLINE[d][lang]).join(" · ");
  return c?.sector ? `${c.sector[lang]} — ${work}` : work;
};
// Full-bleed here, so some projects get a larger picture of their own than the case's cover (the
// mascot's cut-out and the site's mockup broke up into jagged edges at this size)
const WIDE: Record<string, string> = { smarthc: smartBrochures, buendia: buendiaSocialWide };
const imageOf = (slug: string) => WIDE[slug] ?? cases.find((c) => c.slug === slug)?.cover ?? "";

// Projects shown as film instead of a still (files in public/video): the full film, a lighter
// one for phones, and the film's own first frame, shown until it plays so nothing jumps
const FILM: Record<string, { src: string; small: string; poster: string; posterSmall: string } | undefined> = {
  sapphire: {
    src: "/video/the-sapphire.mp4",
    small: "/video/the-sapphire-720.mp4",
    poster: "/video/the-sapphire-poster.webp",
    posterSmall: "/video/the-sapphire-poster-720.webp",
  },
};

// Projects shown as a live 3D scene instead (pages in public/concepts, the scene alone)
const SCENE: Record<string, string | undefined> = {
  buendia: "/concepts/buendia-devices/index.html?bare",
  smarthc: "/concepts/smarthc-devices/index.html?bare&room",
};

// The hint's words: scrolling (or a swipe) brings the next project
const NEXT_HINT: Record<Lang, string> = { es: "scroll para el siguiente", en: "scroll for the next", fr: "défilez pour le suivant", de: "scrollen für das nächste" };
const NEXT_HINT_TOUCH: Record<Lang, string> = { es: "desliza para el siguiente", en: "swipe for the next", fr: "glissez pour le suivant", de: "wischen für das nächste" };

/** A layer at a given depth: it follows the camera by `depth` px per unit of drift */
const Layer: React.FC<{
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
}> = ({ mx, my, depth, className = "", children }) => {
  // Whole pixels only: a fractional offset would blur the type
  const x = useTransform(mx, (v) => Math.round(v * depth));
  const y = useTransform(my, (v) => Math.round(-v * depth));
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
};

export const ProjectsSection: React.FC = () => {
  const { lang, t } = useI18n();
  // (?p=slug opens on that project: a link can lead straight to it)
  const [index, setIndex] = useState(() => Math.max(0, WORKS.findIndex((w) => w.slug === new URLSearchParams(window.location.search).get("p"))));
  const active = WORKS[index];

  // A project comes on screen only when the pointer rests on its name a moment:
  // sweeping across the list on the way somewhere else changes nothing
  const intent = useRef<number>();
  const pick = (i: number) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setIndex(i), 140);
  };
  const cancelPick = () => window.clearTimeout(intent.current);
  useEffect(() => () => window.clearTimeout(intent.current), []);

  // Scrolling moves on to the next project (and back): the wheel, a swipe, the arrow keys. One step per
  // gesture, then a pause, so a long spin of the wheel never runs through them all; past the last, the first
  // The address follows the project on view, so going back, reloading or sharing the link returns to it
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/projects?p=${WORKS[index].slug}`, { replace: true });
  }, [index, navigate]);

  // A quiet word, the first moments here, that scrolling moves on to the next project; gone once used
  const [hint, setHint] = useState(false);
  const used = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => !used.current && setHint(true), 1400);
    return () => window.clearTimeout(id);
  }, []);
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    let lockedUntil = 0, acc = 0, touchY: number | null = null;
    const step = (dir: number) => {
      const now = performance.now();
      if (now < lockedUntil) return;
      lockedUntil = now + 1100;
      acc = 0;
      used.current = true;
      setHint(false);
      setIndex((i) => (i + dir + WORKS.length) % WORKS.length);
    };
    // A wheel or trackpad keeps sending its spin for a while after the hand stops: after a step, nothing
    // more is taken until the wheel has gone quiet (it ran on and skipped a project)
    let lastWheel = 0, waiting = false;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now(), gap = now - lastWheel;
      lastWheel = now;
      if (waiting) {
        if (gap > 240 && now >= lockedUntil) waiting = false;
        else return;
      }
      acc += e.deltaY;
      if (Math.abs(acc) > 40) {
        step(Math.sign(acc));
        waiting = true;
      }
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) > 50) step(Math.sign(dy));
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(1); }
      else if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // The camera's damped drift, written by the viewer each frame it moves; read by the type layers
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const onMotion = useMemo(
    () => (m: CameraMotion) => {
      mx.set(m.x);
      my.set(m.y);
    },
    [mx, my],
  );

  return (
    // The one dark room of the site: the same warm graphite as the contact block on
    // "info", so it reads as part of the house, not another website
    <main className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#2f2b2a] text-platinum">
      <h1 className="sr-only">{t("section.projects")}</h1>

      {/* The work, full-bleed. Between two projects the picture dips into the room's graphite
          and the next one rises out of it, like a cut in a film: never a hard swap.
          Every project gets the same grade, a touch darker and firmer, so a bright photograph
          and a film sit in the same light. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.slug}
          className="absolute inset-0"
          style={{ filter: GRADE }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.8, ease: EASE_HAUS } }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
        >
          {/* Buendía and SmartHC: their own 3D scenes, full-bleed and running on their own (the pointer is
              left to the page, so scrolling over them still moves on to the next project) */}
          {SCENE[active.slug] ? (
            <div className="pointer-events-none absolute inset-0">
              <DevicesFrame src={SCENE[active.slug]!} title={`${active.title} — 3D`} className="h-full w-full" />
            </div>
          ) : (
            <Suspense fallback={null}>
              <CinematicViewer image={imageOf(active.slug)} film={FILM[active.slug]} onMotion={onMotion} className="absolute inset-0" />
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>

      {/* A fine grain over the film: it gives the eye texture to rest on, so compression
          softness reads as atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

      {/* A light shade behind the header, and a deeper one under the words, in the same graphite */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          // Plus a soft pool of graphite in the top-left corner, so the logo holds even
          // when the film passes through bright sky or haze behind it
          background: [
            "radial-gradient(ellipse 32% 22% at 0% 0%, rgba(47,43,42,0.6) 0%, rgba(47,43,42,0.3) 50%, rgba(47,43,42,0) 100%)",
            "linear-gradient(180deg, rgba(47,43,42,0.5) 0%, rgba(47,43,42,0) 16%, rgba(47,43,42,0) 55%, rgba(47,43,42,0.3) 76%, rgba(47,43,42,0.68) 100%)",
          ].join(", "),
        }}
      />

      {/* The hint, centred high under the header: the words alone, no pill behind them, a soft shadow so
          they read over any picture; gone at the first scroll */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 whitespace-nowrap font-[var(--font-mono)] text-[11px] font-light tracking-[0.08em] text-[#f4f1ec] [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] transition-opacity duration-700 ${
          hint ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex items-center gap-2.5">
          {/* two fine chevrons, one over the other, drifting down: the way the next project comes */}
          <style>{`@keyframes fh-down{0%{transform:translateY(-3px);opacity:0}35%{opacity:1}100%{transform:translateY(4px);opacity:0}}`}</style>
          <svg viewBox="0 0 12 14" className="h-3.5 w-3" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2.5l4 3.5 4-3.5" style={{ animation: "fh-down 1.6s ease-in-out infinite" }} />
            <path d="M2 7.5l4 3.5 4-3.5" style={{ animation: "fh-down 1.6s ease-in-out .25s infinite" }} />
          </svg>
          {(touch ? NEXT_HINT_TOUCH : NEXT_HINT)[lang]}
        </span>
      </div>

      {/* Everything that is read, in one place */}
      {/* The project on view bottom left; the index of all the projects apart, bottom right,
          so the list never reads as part of the project above it */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-8 px-4 pb-8 sm:px-6 md:flex-row md:items-end md:justify-between md:gap-12 md:px-8 md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_HAUS } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
          >
            {/* The words hold still: only the picture behind them follows the pointer */}
            <Layer mx={mx} my={my} depth={0}>
              {/* where we are among the projects: scrolling moves on to the next */}
              <p className={`${SMALL} mb-2 tabular-nums text-platinum/60`}>
                {String(index + 1).padStart(2, "0")} / {String(WORKS.length).padStart(2, "0")}
              </p>
              {/* phones: the name alone over the film; the sector and the work wait for wider screens */}
              <p className={`${CAPTION} hidden lowercase text-platinum/70 sm:block`}>
                {scopeOf(active.slug, lang)}
              </p>
              <Link
                to={`/projects/${active.slug}`}
                className={`${DISPLAY} pointer-events-auto mt-3 inline-block text-[#f7f4f0] transition-opacity duration-500 hover:opacity-80`}
              >
                {active.title}
              </Link>
              {/* a plain way in, so it is clear the name opens the project (on phones above all) */}
              <Link
                to={`/projects/${active.slug}`}
                className={`${ACTION} group pointer-events-auto mt-5 flex w-fit items-center gap-4 text-platinum/85 transition-colors duration-500 hover:text-[#f7f4f0]`}
              >
                <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em]">{CASE_UI.open[lang]}</span>
                <span aria-hidden className="relative block h-px w-16">
                  <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:scale-x-[1.3] group-hover:opacity-100" />
                </span>
              </Link>
            </Layer>
          </motion.div>
        </AnimatePresence>

        {/* The index: point at a project to bring it on screen, click to open */}
        <Layer mx={mx} my={my} depth={0} className="shrink-0">
          {/* phones: the list alone, no rule and no heading over it */}
          <nav aria-label={t("section.projects")} className="pointer-events-auto">
            <p className={`${SMALL} mb-3 hidden text-platinum/50 md:block md:text-right`}>{t("section.projects")}</p>
            <ul className={`${CAPTION} flex flex-col gap-y-2.5 md:items-end`}>
              {WORKS.map((w, i) => (
                <li key={w.slug}>
                  <Link
                    to={`/projects/${w.slug}`}
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={cancelPick}
                    onFocus={() => setIndex(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={`inline-flex items-center gap-3 transition-colors duration-500 ${
                      i === index ? "text-[#f7f4f0]" : "text-platinum/50 hover:text-platinum/85"
                    }`}
                  >
                    {/* The one on view is marked with a short line, drawn in */}
                    <span
                      aria-hidden
                      className={`hidden h-px w-5 origin-right bg-current transition-transform duration-700 ease-haus md:block ${
                        i === index ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                    {w.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Layer>
      </div>
    </main>
  );
};
