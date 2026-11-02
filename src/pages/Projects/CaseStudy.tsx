import { DrawnImage, SAPPHIRE_MARK } from "../../components/Drawn/DrawnImage";
import { CardsConveyor } from "../../components/Cards/CardsConveyor";
import { RevealImage } from "../../components/Drawn/RevealImage";
import { DrawingLoop } from "../../components/Drawn/DrawingLoop";
import React, { Suspense, lazy, useEffect, useState } from "react";
import SocialPhone from "../../components/Social/SocialPhone";
import DevicesFrame from "../../components/Devices/DevicesFrame";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { motion } from "framer-motion";
import { cases, CASE_UI, DISCIPLINE, type Case, type CaseImage } from "../../outils/cases";
import type { Lang } from "../../i18n/strings";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LightWall, MOUNT } from "../../components/Light/LightWall";
import { ACTION, BODY, SMALL, SUBTITLE, TITLE } from "../../lib/type";

/** Work is looked at, not taken: no dragging or saving from the context menu. */
// three.js for the stand viewer loads only on the cases that have one
const StandViewer = lazy(() => import("../../components/Stand/StandViewer"));

const protect = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

/** "All projects": straight back to the projects page, on this same project (not the first) */
const AllProjects: React.FC<{ current: string; lang: Lang }> = ({ current, lang }) => (
  <Link
    to={`/projects?p=${current}`}
    className="group relative -my-2 inline-flex items-center whitespace-nowrap py-2 opacity-80 transition-opacity duration-500 hover:opacity-100"
  >
    <span className="hidden sm:inline">{CASE_UI.all[lang]}</span>
    <span className="sm:hidden">{CASE_UI.count[lang]}</span>
    {/* a hairline under the words, drawn in on hover */}
    <span aria-hidden className="absolute bottom-0.5 left-0 h-px w-full bg-ink/25" />
    <span aria-hidden className="absolute bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
  </Link>
);

/**
 * On to the rest of the work: "next" on the left, then every other project from the next one on, side by side
 * as pictures, each with its name on a small tag; the row runs off the edge and scrolls sideways
 */
const CONTEXT: Record<Lang, string> = { es: "Contexto", en: "Context", fr: "Contexte", de: "Kontext" };

/**
 * The editorial opening (on trial on one case): the work first, edge to edge and large; under it, two columns
 * in a tight grotesque, dark on the pale wall: the idea of the project as a headline on the left, the story and
 * the facts on the right
 */
// The editorial opening in two voices, to compare: the site's own (Jura, labels in mono) by default, and a
// tight grotesque with ?grot in the address
const Editorial: React.FC<{ c: Case; lang: Lang }> = ({ c, lang }) => {
  const grot = new URLSearchParams(useLocation().search).has("grot");
  const film = c.video;
  const t = grot
    ? {
        wrap: "font-grot",
        label: "text-[13px] font-medium",
        head: "text-[1.45rem] font-semibold leading-[1.1] tracking-[-0.015em] md:text-[2.1rem]",
        body: "text-[1.15rem] font-normal leading-[1.32] tracking-[-0.01em] md:text-[1.3rem]",
        facts: "text-[14px]",
      }
    : {
        wrap: "font-geo",
        label: SMALL,
        head: "text-[1.45rem] font-medium leading-[1.12] tracking-[0.005em] md:text-[2.1rem]",
        body: "text-[1.1rem] font-normal leading-[1.4] tracking-[0.01em] md:text-[1.25rem]",
        facts: SMALL,
      };
  return (
  <>
    <motion.figure
      className="-mx-4 overflow-hidden sm:-mx-6 md:-mx-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.9, delay: 0.1, ease: EASE_HAUS } }}
    >
      {/* from the top of the page, under the header: the mark sits in the middle, well clear of it */}
      {c.headerImage ? (
        <img src={c.headerImage} alt={c.title} {...protect} className="block aspect-square w-full md:aspect-auto md:h-[86svh] object-cover" />
      ) : c.headerFrame ? (
        <DevicesFrame src={c.headerFrame} title={`${c.title} — 3D`} className="aspect-square w-full md:aspect-auto md:h-[86svh]" />
      ) : c.headerViewer === "stand" ? (
        <Suspense fallback={<div className="aspect-square w-full md:aspect-auto md:h-[86svh]" />}>
          <StandViewer label={CASE_UI.recreation[lang]} className="aspect-square w-full md:aspect-auto md:h-[86svh]" />
        </Suspense>
      ) : c.headerReveal ? (
        // the drawing drawing itself, then the building over it, as on the projects page
        <div className="relative aspect-square w-full md:aspect-auto md:h-[86svh]">
          <DrawingLoop drawing={c.headerReveal} photo={c.cover} className="absolute inset-0" />
        </div>
      ) : c.video ? (
        <video
          src={film}
          aria-label={c.title}
          muted
          loop
          playsInline
          autoPlay
          {...protect}
          onLoadedMetadata={(e) => (e.currentTarget.playbackRate = c.videoSpeed ?? 1.35)}
          className="block aspect-square w-full md:aspect-auto md:h-[86svh] object-cover"
        />
      ) : (
        <img src={c.cover} alt={c.title} {...protect} className="block aspect-square w-full md:aspect-auto md:h-[86svh] object-cover" />
      )}
    </motion.figure>
    <header className={`grid gap-y-10 pb-20 pt-8 text-ink md:grid-cols-12 md:gap-x-10 md:pb-28 md:pt-10 ${t.wrap}`}>
      <motion.div variants={rise} initial="hidden" animate="shown" custom={1} className="md:col-span-6">
        <p className={t.label}>{c.title}</p>
        <h1 className={`mt-3 max-w-[22ch] ${t.head}`}>{(c.statement ?? c.lead)[lang]}</h1>
      </motion.div>
      <motion.div variants={rise} initial="hidden" animate="shown" custom={2} className="md:col-span-6">
        <p className={t.label}>{grot ? CONTEXT[lang] : CONTEXT[lang].toLowerCase()}</p>
        {c.body && <p className={`mt-3 max-w-[50ch] ${t.body}`}>{c.body[lang]}</p>}
        <dl className={`mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-ink/15 pt-4 ${t.facts}`}>
          <dt className="text-ink/55">{c.sector ? CASE_UI.sector[lang] : CASE_UI.client[lang]}</dt>
          <dd>{(c.sector ?? c.client)[lang]}</dd>
          <dt className="text-ink/55">{CASE_UI.scope[lang]}</dt>
          <dd>
            {c.services
              ? c.services.map((s) => (
                  <span key={s.d} className="block">
                    {DISCIPLINE[s.d][lang]} <span className="text-ink/55">— {s.detail[lang]}</span>
                  </span>
                ))
              : c.disciplines.map((d) => DISCIPLINE[d][lang]).join(" · ")}
          </dd>
        </dl>
      </motion.div>
    </header>
  </>
  );
};

// What each project is shown by in that row: the work in motion (the film, the live 3D scene, the drawing
// drawing itself) rather than a still, since motion and 3D are what sets the work apart
// Kept light so the row comes up at once: six-second clips at card size (public/video/previews), each over its
// own first frame, shown the moment the card is drawn; the film or the scene takes over once it can play
const MOVING: Record<string, { video?: string; frame?: string; poster: string } | undefined> = {
  sapphire: { video: "/video/previews/sapphire.mp4?v=2", poster: "/video/previews/sapphire.jpg?v=2" },
  buendia: { frame: "/concepts/buendia-devices/index.html?bare&v=3", poster: "/video/previews/buendia.jpg" },
  // (its 3D scene is framed for a full screen, off-centre for the words beside it: in a card, its 3D character)
  smarthc: { video: "/video/previews/smarthc.mp4", poster: "/video/previews/smarthc.jpg" },
  // (the latte-art film, as on the projects page and the case's opening)
  tolva: { video: "/video/previews/tolva.mp4", poster: "/video/previews/tolva.jpg" },
};

const NextStrip: React.FC<{ after: number; shown: Case[]; lang: Lang }> = ({ after, shown, lang }) => {
  const rest = shown.map((_, k) => shown[(after + 1 + k) % shown.length]).slice(0, shown.length - 1);
  // With a mouse, the row is dragged sideways like a phone's; a drag never counts as a click on the card under it
  const row = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !row.current) return;
    drag.current = { x: e.clientX, left: row.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !row.current) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      row.current.setPointerCapture(e.pointerId);
    }
    if (d.moved) row.current.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    // the click that ends a drag is swallowed (once), so letting go never opens a project
    if (d?.moved) row.current?.addEventListener("click", (ev) => ev.preventDefault(), { capture: true, once: true });
  };
  return (
    <nav aria-label={CASE_UI.next[lang]} className="mt-16 border-t border-ink/10 pt-10 md:mt-20">
      <div
        ref={row}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        data-lenis-prevent-wheel
        className="-mx-4 flex cursor-grab select-none gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] active:cursor-grabbing sm:-mx-6 sm:px-6 md:-mx-8 md:px-8"
      >
        <span className={`${SMALL} shrink-0 pt-2 text-ink md:pr-3`}>{CASE_UI.nextShort[lang]}</span>
        {rest.map((k) => (
          <Link
            key={k.slug}
            to={`/projects/${k.slug}`}
            className="group relative aspect-[16/9] w-[78vw] shrink-0 overflow-hidden rounded-[3px] bg-[#ecebe8] sm:w-[46vw] lg:w-[36vw]"
          >
            <span className="pointer-events-none absolute inset-0 transition-transform duration-1000 ease-haus group-hover:scale-[1.03]">
              {MOVING[k.slug] && (
                <img src={MOVING[k.slug]!.poster} alt="" {...protect} className="absolute inset-0 h-full w-full object-cover" />
              )}
              {MOVING[k.slug]?.video ? (
                <video src={MOVING[k.slug]!.video} poster={MOVING[k.slug]!.poster} muted loop playsInline autoPlay preload="auto" aria-label={k.title} className="relative h-full w-full object-cover" />
              ) : MOVING[k.slug]?.frame ? (
                // (built only once the card nears the screen, held still when it leaves)
                <DevicesFrame src={MOVING[k.slug]!.frame!} title={`${k.title} — 3D`} reveal className="h-full w-full" />
              ) : k.headerReveal ? (
                // (the drawing alone here, no photograph after it)
                <DrawingLoop drawing={k.headerReveal} className="absolute inset-0" />
              ) : (
                <img
                  src={k.pick ?? k.thumb ?? k.cover}
                  alt={k.title}
                  loading="lazy"
                  {...protect}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: k.pick ? undefined : k.coverFocus }}
                />
              )}
            </span>
            <span className={`${SMALL} absolute left-2 top-2 rounded-[3px] bg-[#ecebe8]/85 px-2 py-1 text-ink backdrop-blur-sm`}>
              {k.title}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

/** One image of the case, rising softly into view */
/**
 * The case's film, full width, silent and looping, at the same pace as on the
 * projects page so the one continues the other. It fades in on its own first
 * frame (no poster: a still framed differently would jump when the film took over).
 */
const Film: React.FC<{ src: string; title: string; ratio?: string; speed?: number }> = ({
  src,
  title,
  ratio = "16 / 9",
  speed = 1.35,
}) => {
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
        e.currentTarget.defaultPlaybackRate = speed;
        e.currentTarget.playbackRate = speed;
      }}
      // Phones may only start loading once playing: either signal shows it
      onLoadedData={() => setReady(true)}
      onPlaying={() => setReady(true)}
      // Its own proportion, reserved before it loads, so nothing around it moves
      // (The Sapphire's film is graded hot in places: its colour drawn back a little)
      style={{ aspectRatio: ratio, filter: src.includes("sapphire") ? "saturate(0.8)" : undefined }}
      className={`block max-h-[88vh] w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
};

const Plate: React.FC<{ src: string; className?: string; alt?: string }> = ({ src, className = "", alt = "" }) => (
  <motion.img
    src={src}
    alt={alt}
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
  <>
  {/* Phones: no labels, one quiet line (the sector, then what was done), and the link if any */}
  <motion.div variants={rise} initial="hidden" animate="shown" custom={3} // in the story's own typeface and size, so the two read as one piece; colour tells sector from disciplines
    className={`${BODY} lowercase text-graphite sm:hidden ${className}`}>
    <p>
      {/* the sector in full ink, the disciplines after it in grey: told apart without taking more room */}
      <span className="text-ink">{(c.sector ?? c.client)[lang]}</span>
      <span className="text-graphite/75">
        {"\u00a0— "}
        {/* each discipline kept whole, and the dot holds on to it, so no line starts with one */}
        {(c.services ? c.services.map((s) => DISCIPLINE[s.d][lang]) : c.disciplines.map((d) => DISCIPLINE[d][lang]))
          .map((name) => name.replace(/ /g, "\u00a0"))
          .join("\u00a0· ")}
      </span>
    </p>
    {c.link && (
      <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-ink underline decoration-ink/30 underline-offset-4">
        {c.link.label[lang]}
      </a>
    )}
  </motion.div>
  <motion.dl
    variants={rise}
    initial="hidden"
    animate="shown"
    custom={3}
    // Wider screens: labels in their own column
    className={`${SMALL} hidden text-graphite sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:gap-y-3 ${className}`}
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
              <span className="text-graphite/80"> — </span>
              {/* As written: the details are lowercase already, and "3D" keeps its capitals */}
              <span className="normal-case text-graphite/80">{s.detail[lang]}</span>
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
          </a>
        </dd>
      </>
    )}
  </motion.dl>
  </>
);

/** Arriving with a #fragment (a link straight to a piece of the case, such as its 3D viewer): once the
 *  page has come in, it glides there. */
const ScrollToHash: React.FC = () => {
  const { hash } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) scrollToTarget(lenis, el, { offset: -72 });
    }, 900);
    return () => window.clearTimeout(t);
  }, [hash, lenis]);
  return null;
};

export const CaseStudyPage: React.FC = () => {
  const { slug } = useParams();
  const { lang } = useI18n();
  // Hidden cases are neither reachable nor part of the case-to-case navigation
  // In the same order as the projects page
  const ORDER = ["sapphire", "buendia", "smarthc", "gracia-prados", "tolva"];
  const rank = (k: Case) => (ORDER.indexOf(k.slug) + 1 || ORDER.length + 1);
  const shown = cases.filter((c) => !c.hidden).sort((a, b) => rank(a) - rank(b));
  const index = shown.findIndex((c) => c.slug === slug);
  if (index === -1) return <Navigate to="/projects" replace />;

  const c = shown[index];
  // what each picture of the case is, for those who can't see it and for search engines
  const altText = `${c.title} — ${c.client[lang as "es"] ?? c.client.es}`;
  // Cases told the new way (a film, or services in detail) open side by side
  const side = Boolean(c.video || c.services || c.headerViewer || c.headerFrame || c.headerReveal);

  return (
    // (editorial: the work runs up under the header, nothing above it but the logo and the index)
    <main className={`px-4 pb-16 sm:px-6 md:px-8 ${c.layout === "editorial" ? "" : "pt-28 md:pt-32"}`}>
      <ScrollToHash />
      <LightWall />

      {/* One line: back to the index, where we are, on to the next project */}
      {c.layout !== "editorial" && <motion.nav
        variants={rise}
        initial="hidden"
        animate="shown"
        className={`${ACTION} mb-12 flex items-center justify-between gap-6 text-ink md:mb-16`}
      >
        {/* Only the way back to all the projects up here: the way on to the next case is at the foot of the page */}
        <AllProjects current={c.slug} lang={lang} />
      </motion.nav>}
      {c.layout === "editorial" ? <Editorial c={c} lang={lang} /> : (
      <>
      {/* Side by side, the first screen holds everything, whole and still: the words and
          the services on the left, the film or the cover on the right, framed, small enough
          to stay sharp. Otherwise the words come first and the cover follows at full width. */}
      <header className={`grid gap-y-10 ${side ? "lg:grid-cols-12 lg:items-end lg:gap-x-12" : "md:grid-cols-12 md:items-end md:gap-x-8"}`}>
        <div className={side ? "lg:col-span-5" : "md:col-span-7"}>
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
          {/* Beside the media, the story reads in order: who they are, what they needed, what was done */}
          {/* Large screens only: on phones the film or the picture comes first, and these follow it */}
          {side && (
            <div className="hidden lg:block">
              {c.body && (
                <motion.p
                  variants={rise}
                  initial="hidden"
                  animate="shown"
                  custom={3}
                  className={`${BODY} mt-8 max-w-[52ch] text-graphite`}
                >
                  {c.body[lang]}
                </motion.p>
              )}
              <Facts c={c} lang={lang} className={c.body ? "mt-10" : "mt-12"} />
            </div>
          )}
        </div>

        {side ? (
          <motion.figure
            // edge to edge, on phones too
            className="-mx-4 overflow-hidden sm:-mx-6 md:-mx-8 lg:col-span-7 lg:ml-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9, delay: 0.25, ease: EASE_HAUS } }}
          >
            {c.headerReveal ? (
              <RevealImage alt={c.title} {...c.headerReveal} />
            ) : c.headerFrame ? (
              <DevicesFrame src={c.headerFrame} title={`${c.title} — 3D`} className="aspect-[16/10] w-full" />
            ) : c.headerViewer === "stand" ? (
              <Suspense fallback={<div className="aspect-[16/10] w-full" />}>
                <StandViewer label={CASE_UI.recreation[lang]} className="aspect-[16/10] w-full" />
              </Suspense>
            ) : c.video ? (
              <Film src={c.video} title={c.title} ratio="16 / 10" speed={c.videoSpeed} />
            ) : (
              <img
                src={c.cover}
                alt={c.title}
                {...protect}
                className="block aspect-[16/10] max-h-[88vh] w-full object-cover"
                style={{ objectPosition: c.coverFocus }}
              />
            )}
          </motion.figure>
        ) : (
          <Facts c={c} lang={lang} className="self-end md:col-span-4 md:col-start-9" />
        )}
        {/* Phones and tablets: the story and the services under the film or the picture, so it is seen on arriving */}
        {side && (
          <div className="lg:hidden">
            {c.body && <p className={`${BODY} max-w-[52ch] text-graphite`}>{c.body[lang]}</p>}
            <Facts c={c} lang={lang} className={c.body ? "mt-8" : ""} />
          </div>
        )}
      </header>

      {/* The cover, at full width */}
      {!side && (
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
      {c.body && !side ? (
        <section className="grid py-16 md:grid-cols-12 md:gap-x-8 md:py-24">
          <p className={`${BODY} text-graphite md:col-span-6 md:col-start-7`}>{c.body[lang]}</p>
        </section>
      ) : (
        // phones: the same gap after the opening picture as between all the others, so they read as one strip
        <div className={side ? "h-4 md:h-32" : "h-4 md:h-6"} />
      )}
      </>
      )}

      {/* The work, large */}
      {c.images.length > 0 && (
        <div className="-mx-4 flex flex-col gap-4 sm:-mx-6 md:-mx-8 md:gap-6">
          {rows(c.images).map((row, r) =>
            row.length === 2 ? (
              <div key={r} className="grid gap-4 md:grid-cols-2 md:gap-6">
                {/* Every pair the same height: one shape for all, photographs cropped to it,
                    pieces on white shown whole on white */}
                {row.map((img) =>
                  img.viewer === "stand" ? (
                    <Suspense key="stand" fallback={<div className="aspect-[16/10] w-full bg-[#a9b8ba]" />}>
                      <StandViewer label={CASE_UI.recreation[lang]} className="aspect-[16/10] w-full" />
                    </Suspense>
                  ) : img.viewer === "devices" && img.frame ? (
                    <DevicesFrame key={img.frame} src={img.frame} title={`${c.title} — 3D`} className="aspect-[16/10] w-full" />
                  ) : img.cards ? (
                    <CardsConveyor key={img.src} cards={img.cards} alt={altText} className="aspect-[16/10] w-full" />
                  ) : img.draw === "sapphire-mark" ? (
                    <DrawnImage key={img.src} src={img.src} alt={altText} drawing={SAPPHIRE_MARK} className="w-full" />
                  ) : img.reveal ? (
                    <RevealImage key={img.src} src={img.src} alt={altText} {...img.reveal} />
                  ) : img.video ? (
                    <Film key={img.video} src={img.video} title={c.title} ratio="16 / 10" speed={img.videoSpeed} />
                  ) : (
                    <Plate
                      key={img.src}
                      src={img.src}
                      alt={altText}
                      // natural: a pair of the same proportion shown whole, neither cropped nor mounted
                      className={img.fit === "natural" ? "" : `aspect-[16/10] ${img.fit === "contain" ? "bg-white object-contain" : "object-cover"}`}
                    />
                  ),
                )}
              </div>
            ) : row[0].viewer === "stand" ? (
              // The stand to turn round, wide
              <Suspense key={r} fallback={<div className="aspect-[4/5] w-full bg-[#a9b8ba] sm:aspect-[16/10] lg:aspect-[16/8]" />}>
                <StandViewer label={CASE_UI.recreation[lang]} className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[16/8]" />
              </Suspense>
            ) : row[0].viewer === "devices" ? (
              // The interactive product scene, wide: taller on phones so the devices stay large
              <DevicesFrame
                key={r}
                // the home's viewer can be linked to directly (from the studio page)
                id={row[0].frame?.includes("sapphire-home") ? "vivienda-3d" : undefined}
                src={row[0].frame ?? "/concepts/smarthc-devices/index.html?v=3"}
                title={`${c.title} — 3D`}
                // a home to walk round takes the screen: edge to edge and nearly the viewport's height
                className={row[0].frame?.includes("sapphire-home") ? "h-[82svh] min-h-[480px] w-full" : "aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[16/8]"}
              />
            ) : row[0].viewer === "social" && row[0].tiles ? (
              // The brand's social profile in a phone, on a wide band
              <SocialPhone
                key={r}
                tiles={row[0].tiles}
                name={c.title}
                bio={c.lead[lang]}
                avatar={
                  <span className="flex h-full w-full items-center justify-center bg-[#f39200]">
                    <img src="/concepts/smarthc-stand/symbol.png" alt="" className="h-[62%] w-[62%] object-contain" />
                  </span>
                }
                className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[16/8]"
              />
            ) : row[0].href ? (
              // A piece with an interactive version: the still opens it, with a quiet caption
              <a key={r} href={row[0].href} target="_blank" rel="noopener noreferrer" className="group block">
                <Plate src={row[0].src} alt={altText} />
                <span className={`${SMALL} mt-3 flex items-center justify-between gap-4 px-4 text-graphite sm:px-6 md:px-8`}>
                  <span>{CASE_UI.recreation[lang]}</span>
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <span className="relative">
                      {CASE_UI.view3d[lang]}
                      <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
                    </span>
                  </span>
                </span>
              </a>
            ) : row[0].reveal ? (
              <RevealImage key={r} src={row[0].src} alt={altText} {...row[0].reveal} />
            ) : row[0].video ? (
              <div key={r} className={row[0].small ? "mx-auto w-full px-4 sm:px-6 md:w-1/2 md:px-0" : ""}>
                <Film src={row[0].video} title={c.title} ratio="16 / 9" speed={row[0].videoSpeed} />
              </div>
            ) : row[0].small ? (
              <div key={r} className="mx-auto w-full px-4 sm:px-6 md:w-1/2 md:px-0">
                <Plate src={row[0].src} alt={altText} />
              </div>
            ) : (
              <Plate key={r} src={row[0].src} alt={altText} />
            ),
          )}
        </div>
      )}

      {/* Whoever has read this far is the one most likely to write: a quiet invitation, the same on every
          case, then the next project */}
      {(
      <div className="mt-24 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between md:mt-32">
        <p className={`${SUBTITLE} text-ink`}>{CASE_UI.talk[lang]}</p>
        <Link to="/about#contact" className={`${ACTION} group inline-flex items-center gap-4 self-start text-ink`}>
          <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em]">{CASE_UI.talkCta[lang]}</span>
          <span aria-hidden className="relative block h-px w-16">
            <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:scale-x-[1.3] group-hover:opacity-100" />
          </span>
        </Link>
      </div>
      )}

      {/* The projects that follow, in order from the next one: a row of pictures, each named on a small tag */}
      <NextStrip after={index} shown={shown} lang={lang} />
    </main>
  );
};
