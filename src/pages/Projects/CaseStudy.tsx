import React, { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cases, CASE_UI, DISCIPLINE, type Case, type CaseImage } from "../../outils/cases";
import type { Lang } from "../../i18n/strings";
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
/**
 * The case's film, full width, silent and looping, at the same pace as on the
 * projects page so the one continues the other. It fades in on its own first
 * frame (no poster: a still framed differently would jump when the film took over).
 */
const Film: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  const [ready, setReady] = useState(false);
  return (
    <video
      src={src}
      aria-label={title}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      onLoadedMetadata={(e) => {
        e.currentTarget.defaultPlaybackRate = 1.35;
        e.currentTarget.playbackRate = 1.35;
      }}
      onLoadedData={() => setReady(true)}
      className={`block aspect-video max-h-[88vh] w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
};

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
/** Who it was for, when, what was done, and any outbound link */
const Facts: React.FC<{ c: Case; lang: Lang; className?: string }> = ({ c, lang, className = "" }) => (
  <motion.dl
    variants={rise}
    initial="hidden"
    animate="shown"
    custom={3}
    className={`${SMALL} grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-graphite ${className}`}
  >
    <dt>{c.sector ? CASE_UI.sector[lang] : CASE_UI.client[lang]}</dt>
    <dd className="text-ink">{(c.sector ?? c.client)[lang]}</dd>
    {c.year && (
      <>
        <dt>{CASE_UI.year[lang]}</dt>
        <dd className="tabular-nums text-ink">{c.year}</dd>
      </>
    )}
    <dt>{CASE_UI.scope[lang]}</dt>
    {c.services ? (
      // Each service on its own line, with what was delivered beside it
      <dd>
        <ul className="flex flex-col gap-1.5">
          {c.services.map((s) => (
            <li key={s.d}>
              <span className="text-ink">{DISCIPLINE[s.d][lang]}</span>
              <span className="text-graphite/80"> — {s.detail[lang]}</span>
            </li>
          ))}
        </ul>
      </dd>
    ) : (
      <dd className="text-ink">{c.disciplines.map((d) => DISCIPLINE[d][lang]).join(" · ")}</dd>
    )}
    {c.link && (
      <>
        <dt aria-hidden />
        <dd>
          <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-1.5 text-ink">
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
);

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
      {/* With a film, the first screen holds everything, whole and still: the words on
          the left, the film framed on the right, small enough to stay sharp. Without one,
          the words come first and the cover follows at full width. */}
      <header className={`grid gap-y-10 md:grid-cols-12 md:items-end md:gap-x-8 ${c.video ? "lg:gap-x-12" : ""}`}>
        <div className={c.video ? "md:col-span-5" : "md:col-span-7"}>
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
            className={`${SUBTITLE} mt-3 max-w-[36ch] text-ink md:mt-4`}
          >
            {c.lead[lang]}
          </motion.p>
          {c.video && <Facts c={c} lang={lang} className="mt-12" />}
        </div>

        {c.video ? (
          <motion.figure
            className="-mx-4 overflow-hidden sm:-mx-6 md:col-span-7 md:ml-0 md:-mr-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9, delay: 0.25, ease: EASE_HAUS } }}
          >
            <Film src={c.video} title={c.title} />
          </motion.figure>
        ) : (
          <Facts c={c} lang={lang} className="self-end md:col-span-4 md:col-start-9" />
        )}
      </header>

      {/* The cover, at full width */}
      {!c.video && (
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
      )}

      {/* What was done; when the lead already tells it, the work follows straight on */}
      {c.body ? (
        <section className="grid py-16 md:grid-cols-12 md:gap-x-8 md:py-24">
          <p className={`${BODY} text-graphite md:col-span-6 md:col-start-7`}>{c.body[lang]}</p>
        </section>
      ) : (
        <div className={c.video ? "h-20 md:h-32" : "h-4 md:h-6"} />
      )}

      {/* The work, large */}
      {c.images.length > 0 && (
        <div className="-mx-4 flex flex-col gap-4 sm:-mx-6 md:-mx-8 md:gap-6">
          {rows(c.images).map((row, r) =>
            row.length === 2 ? (
              <div key={r} className="grid gap-4 md:grid-cols-2 md:gap-6">
                {/* Every pair the same height: one shape for all, photographs cropped to it,
                    pieces on white shown whole on white */}
                {row.map((img) => (
                  <Plate
                    key={img.src}
                    src={img.src}
                    className={`aspect-[16/10] ${img.fit === "contain" ? "bg-white object-contain" : "object-cover"}`}
                  />
                ))}
              </div>
            ) : (
              <Plate key={r} src={row[0].src} />
            ),
          )}
        </div>
      )}

      {/* One line inviting a similar project, to the contact on "info" */}
      {c.cta && (
        <Link
          to="/about#contact"
          className={`${ACTION} group mt-24 inline-flex items-center gap-3 text-ink md:mt-32`}
        >
          <span className="relative">
            {c.cta[lang]}
            <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
            <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
          </span>
          <Arrow />
        </Link>
      )}

      {/* The next project */}
      <Link
        to={`/projects/${next.slug}`}
        className={`group block border-t border-ink/10 pt-10 ${c.cta ? "mt-16 md:mt-20" : "mt-24 md:mt-32"}`}
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
