import React, { Suspense, lazy, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";
import { cases } from "../../outils/cases";

// three.js only loads on this page
const SpatialGallery = lazy(() => import("../../components/Gallery/SpatialGallery"));

/**
 * Selected works as a spatial WebGL gallery: the projects float as textured
 * planes in 3D space (see SpatialGallery); over the canvas, a quiet technical
 * HUD — the count, the filters, and the title of the plane under the cursor,
 * synchronised with the 3D raycaster. Click a plane to open its case.
 */

type Category = "INTERACTIVE & WEB3D" | "CGI & SCENOGRAPHY" | "BRAND & DIGITAL SYSTEMS";

type Work = { slug: string; title: string; categories: Category[]; tags: string; year: string };

// Real scope of each project. Year: fill in when known.
const WORKS: Work[] = [
  { slug: "sapphire", title: "The Sapphire", categories: ["BRAND & DIGITAL SYSTEMS", "CGI & SCENOGRAPHY"], tags: "Brand identity / Website / 3D imagery", year: "—" },
  { slug: "smarthc", title: "Smart Human Capital", categories: ["BRAND & DIGITAL SYSTEMS", "CGI & SCENOGRAPHY"], tags: "Brand identity / 3D character / Campaigns", year: "—" },
  { slug: "santa-engracia", title: "Santa Engracia", categories: ["BRAND & DIGITAL SYSTEMS"], tags: "Brand identity / Website", year: "—" },
  { slug: "alea", title: "Alea Software", categories: ["BRAND & DIGITAL SYSTEMS", "INTERACTIVE & WEB3D"], tags: "Product identity / Interface / Launch", year: "—" },
];

const FILTERS = ["ALL", "INTERACTIVE & WEB3D", "CGI & SCENOGRAPHY", "BRAND & DIGITAL SYSTEMS"] as const;
type Filter = (typeof FILTERS)[number];

const pad = (n: number) => String(n).padStart(2, "0");
const HUD = "font-mono text-[11px] uppercase tracking-[0.14em]";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const ProjectsSection: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [hovered, setHovered] = useState<number | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  // Built once: the gallery keeps its scene; filtering only changes visibility
  const items = useMemo(
    () => WORKS.map((w) => ({ slug: w.slug, image: cases.find((c) => c.slug === w.slug)?.cover ?? "" })),
    [],
  );
  const visible = useMemo(() => WORKS.map((w) => filter === "ALL" || w.categories.includes(filter)), [filter]);
  const shownCount = visible.filter(Boolean).length;
  const active = hovered !== null ? WORKS[hovered] : null;

  return (
    <main className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
      {/* The stage */}
      {!noWebGL && (
        <Suspense fallback={null}>
          <SpatialGallery
            items={items}
            visible={visible}
            onHover={setHovered}
            onOpen={(i) => navigate(`/projects/${WORKS[i].slug}`)}
            onUnsupported={() => setNoWebGL(true)}
            className="absolute inset-0"
          />
        </Suspense>
      )}

      {/* Light post-processing in CSS: a soft vignette and fine grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 50% 45%, transparent 55%, rgba(40,38,36,0.18) 100%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 pb-8 pt-28 sm:px-6 md:px-8 md:pb-10 md:pt-32">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className={`${HUD} text-[#2a2826]/50`}>Index — Selected works</p>
            <nav aria-label="Filter" className={`${HUD} pointer-events-auto mt-5 flex flex-wrap gap-x-6 gap-y-2`}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`transition-colors duration-500 ${
                    filter === f ? "text-[#1f1e1d]" : "text-[#2a2826]/40 hover:text-[#2a2826]/75"
                  }`}
                >
                  [ {f} ]
                </button>
              ))}
            </nav>
          </div>
          <p className={`${HUD} shrink-0 tabular-nums text-[#2a2826]/55`}>
            {hovered !== null ? pad(hovered + 1) : "—"} / {pad(shownCount)}
          </p>
        </div>

        {/* The plane under the cursor, named */}
        <div className="flex items-end justify-between gap-6">
          <div className="min-h-[5.5rem]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_HAUS } }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                >
                  <p className={`${HUD} text-[#2a2826]/55`}>{active.tags}</p>
                  <h1 className="mt-2 font-geo text-[2.4rem] font-light leading-none tracking-[-0.01em] text-[#1f1e1d] md:text-6xl">
                    {active.title}
                  </h1>
                </motion.div>
              ) : (
                <motion.div
                  key="rest"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.45 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  <h1 className="font-geo text-[2.4rem] font-light leading-none tracking-[-0.01em] text-[#1f1e1d] md:text-6xl">
                    Projects
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className={`${HUD} hidden text-right text-[#2a2826]/45 md:block`}>
            Hover to explore
            <br />
            Click to open
          </p>
        </div>
      </div>

      {/* For keyboards, screen readers and browsers without WebGL: the same projects as plain links */}
      <nav
        aria-label="Projects"
        className={noWebGL ? "absolute inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-6 md:inset-x-8" : "sr-only"}
      >
        {WORKS.map((w, i) => (
          <Link
            key={w.slug}
            to={`/projects/${w.slug}`}
            className={`block border-b border-[#1f1e1d]/15 py-4 font-geo text-2xl font-light text-[#1f1e1d] ${noWebGL ? "" : "focus:not-sr-only"}`}
          >
            <span className={`${HUD} mr-4 text-[#2a2826]/50`}>{pad(i + 1)}</span>
            {w.title}
          </Link>
        ))}
      </nav>
    </main>
  );
};
