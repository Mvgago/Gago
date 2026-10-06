import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cases, CASE_UI, DISCIPLINE, type CaseImage } from "../../outils/cases";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LightWall, MOUNT } from "../../components/Light/LightWall";
import { ACTION, BODY, SMALL, SUBTITLE, TITLE } from "../../lib/type";

/** Work is looked at, not taken: no dragging or saving from the context menu. */
const protect = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

/** A long hairline arrow, drawn: it stretches a little towards where it leads on hover */
const Arrow: React.FC<{ back?: boolean }> = ({ back }) => (
  <svg
    aria-hidden
    viewBox="0 0 28 12"
    className={`h-3 w-7 overflow-visible transition-transform duration-500 ease-haus ${
      back ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M0 6h27M22 1.5l5 4.5-5 4.5" />
  </svg>
);

/** One image of the case, rising softly into view */
const Plate: React.FC<{ src: string; className?: string }> = ({ src, className = "" }) => (
  <motion.img
    src={src}
    alt=""
    loading="lazy"
    decoding="async"
    {...protect}
    className={`block h-auto w-full ${className}`}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-8% 0px" }}
    transition={{ duration: 0.9, ease: EASE_HAUS }}
  />
);

/** Images in sequence: full width, or two side by side where marked as a pair */
function rows(images: CaseImage[]): CaseImage[][] {
  const out: CaseImage[][] = [];
  for (let i = 0; i < images.length; i++) {
    if (images[i].pair && images[i + 1]) {
      out.push([images[i], images[i + 1]]);
      i++;
    } else out.push([images[i]]);
  }
  return out;
}

/**
 * A case study, told the same way every time: a short header with the facts,
 * one sentence, the cover at full width, a paragraph on what was done, then the
 * work, large, with little in between — and the next project at the end.
 */
export const CaseStudyPage: React.FC = () => {
  const { slug } = useParams();
  const { lang } = useI18n();
  const index = cases.findIndex((c) => c.slug === slug);
  if (index === -1) return <Navigate to="/projects" replace />;

  const c = cases[index];
  const next = cases[(index + 1) % cases.length];

  return (
    <main className="px-4 pb-16 pt-28 sm:px-6 md:px-8 md:pt-32">
      <LightWall />

      {/* One line: back to the index, where we are, on to the next project */}
      <motion.nav
        variants={rise}
        initial="hidden"
        animate="shown"
        className={`${ACTION} mb-12 flex items-center justify-between gap-6 text-ink md:mb-16`}
      >
        <Link to="/projects" className="group inline-flex items-center gap-3 justify-self-start opacity-80 transition-opacity duration-500 hover:opacity-100">
          <Arrow back />
          {CASE_UI.all[lang]}
        </Link>
        <Link to={`/projects/${next.slug}`} className="group inline-flex items-center gap-3 justify-self-end opacity-80 transition-opacity duration-500 hover:opacity-100">
          <span className="hidden sm:inline">{next.title.toLowerCase()}</span>
          <span className="sm:hidden">{CASE_UI.next[lang]}</span>
          <Arrow />
        </Link>
      </motion.nav>
      {/* Header: number and title, then the facts */}
      <header className="grid gap-y-10 md:grid-cols-12 md:gap-x-8">
        <div className="md:col-span-7">
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className={`${TITLE} text-ink`}
          >
            {c.title}
          </motion.h1>
          <motion.p
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={2}
            className={`${SUBTITLE} mt-8 max-w-[36ch] text-ink`}
          >
            {c.lead[lang]}
          </motion.p>
        </div>

        <motion.dl
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={3}
          className={`${SMALL} grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 self-end text-graphite md:col-span-4 md:col-start-9`}
        >
          <dt>{CASE_UI.client[lang]}</dt>
          <dd className="text-ink">{c.client[lang]}</dd>
          {c.year && (
            <>
              <dt>{CASE_UI.year[lang]}</dt>
              <dd className="tabular-nums text-ink">{c.year}</dd>
            </>
          )}
          <dt>{CASE_UI.scope[lang]}</dt>
          <dd className="text-ink">{c.disciplines.map((d) => DISCIPLINE[d][lang]).join(" · ")}</dd>
          {c.link && (
            <>
              <dt aria-hidden />
              <dd>
                <a
                  href={c.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-1.5 text-ink"
                >
                  <span className="relative">
                    {c.link.label[lang]}
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-ink/30" />
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
                  </span>
                  <span aria-hidden>↗</span>
                </a>
              </dd>
            </>
          )}
        </motion.dl>
      </header>

      {/* The cover, at full width */}
      <motion.figure
        className="-mx-4 mt-16 overflow-hidden sm:-mx-6 md:-mx-8 md:mt-20"
        style={c.coverFit === "contain" ? { background: MOUNT } : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.9, delay: 0.25, ease: EASE_HAUS } }}
      >
        <img
          src={c.cover}
          alt={c.title}
          {...protect}
          className={
            c.coverFit === "contain"
              ? "mx-auto block h-[70vh] max-h-[720px] w-auto py-[6vh]"
              : "block max-h-[88vh] w-full object-cover"
          }
        />
      </motion.figure>

      {/* What was done */}
      <section className="grid py-16 md:grid-cols-12 md:gap-x-8 md:py-24">
        <p className={`${BODY} text-graphite md:col-span-6 md:col-start-7`}>
          {c.body[lang]}
        </p>
      </section>

      {/* The work, large */}
      {c.images.length > 0 && (
        <div className="flex flex-col gap-4 md:gap-6">
          {rows(c.images).map((row, r) =>
            row.length === 2 ? (
              <div key={r} className="grid gap-4 md:grid-cols-2 md:gap-6">
                <Plate src={row[0].src} className="h-full object-cover" />
                <Plate src={row[1].src} className="h-full object-cover" />
              </div>
            ) : (
              <Plate key={r} src={row[0].src} />
            ),
          )}
        </div>
      )}

      {/* The next project */}
      <Link
        to={`/projects/${next.slug}`}
        className="group mt-24 block border-t border-ink/10 pt-10 md:mt-32"
      >
        <span className={`${SMALL} text-graphite`}>{CASE_UI.next[lang]}</span>
        <span className="mt-4 flex items-baseline justify-between gap-6">
          <span className={`${TITLE} text-ink transition-transform duration-700 ease-haus group-hover:translate-x-2`}>
            {next.title}
          </span>
          <span aria-hidden className={`${TITLE} text-ink transition-transform duration-700 ease-haus group-hover:translate-x-2`}>
            →
          </span>
        </span>
      </Link>
    </main>
  );
};
