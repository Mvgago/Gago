import React, { Suspense, lazy, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";
import { cases, DISCIPLINE } from "../../outils/cases";
import { useI18n } from "../../i18n/I18n";
import type { Lang } from "../../i18n/strings";
import type { CameraMotion } from "../../components/Gallery/CinematicViewer";

// three.js / React Three Fiber only load on this page
const CinematicViewer = lazy(() => import("../../components/Gallery/CinematicViewer"));

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
  { slug: "santa-engracia", title: "Santa Engracia" },
  { slug: "alea", title: "Alea Software" },
];

const scopeOf = (slug: string, lang: Lang) =>
  (cases.find((c) => c.slug === slug)?.disciplines ?? []).map((d) => DISCIPLINE[d][lang]).join(" · ");
const imageOf = (slug: string) => cases.find((c) => c.slug === slug)?.cover ?? "";

// Projects shown as film instead of a still (files in public/video)
const VIDEO: Record<string, string | undefined> = { sapphire: "/video/the-sapphire.mp4" };

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
  const [index, setIndex] = useState(0);
  const active = WORKS[index];

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

      {/* The work, full-bleed */}
      <Suspense fallback={null}>
        <CinematicViewer image={imageOf(active.slug)} video={VIDEO[active.slug]} onMotion={onMotion} className="absolute inset-0" />
      </Suspense>

      {/* A fine grain over the film: it gives the eye texture to rest on, so compression
          softness reads as atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

      {/* A light shade behind the header, and a deeper one under the words, in the same graphite */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(47,43,42,0.5) 0%, rgba(47,43,42,0) 16%, rgba(47,43,42,0) 50%, rgba(47,43,42,0.5) 72%, rgba(47,43,42,0.9) 100%)",
        }}
      />

      {/* Everything that is read, in one place */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-7 px-4 pb-8 sm:px-6 md:px-8 md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_HAUS } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
          >
            {/* The title moves most */}
            <Layer mx={mx} my={my} depth={130}>
              <p className="font-geo text-[15px] font-normal lowercase tracking-[0.04em] text-platinum/70">
                {scopeOf(active.slug, lang)}
              </p>
              <Link
                to={`/projects/${active.slug}`}
                className="pointer-events-auto mt-3 inline-block font-geo text-[2.6rem] font-light leading-none tracking-[0.01em] text-[#f7f4f0] transition-opacity duration-500 hover:opacity-80 md:text-7xl"
              >
                {active.title}
              </Link>
            </Layer>
          </motion.div>
        </AnimatePresence>

        {/* The projects: point at one to bring it on screen, click to open */}
        <Layer mx={mx} my={my} depth={50}>
          <nav
            aria-label={t("section.projects")}
            className="pointer-events-auto flex flex-wrap gap-x-8 gap-y-2 border-t border-platinum/15 pt-4 font-geo text-[15px] font-normal tracking-[0.02em]"
          >
            {WORKS.map((w, i) => (
              <Link
                key={w.slug}
                to={`/projects/${w.slug}`}
                onPointerEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                className={`transition-colors duration-500 ${
                  i === index ? "text-[#f7f4f0]" : "text-platinum/50 hover:text-platinum/85"
                }`}
              >
                {w.title}
              </Link>
            ))}
          </nav>
        </Layer>
      </div>
    </main>
  );
};
