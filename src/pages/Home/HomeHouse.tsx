import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";
import { SMALL } from "../../lib/type";
import { useI18n } from "../../i18n/I18n";
import type { Key } from "../../i18n/strings";
import { cases } from "../../outils/cases";
import { reel, TECH } from "../../outils/artwork";
import { EMAIL } from "../../components/Contact/ContactMenu";
import Footer from "../../components/Footer/Footer";

/**
 * Under the landing, the house in two rooms.
 *
 * The cut: going down, the lit room gives way to a paper-white plane that opens from the middle of the
 * screen out to its edges. On the paper, the studio in one line: written in by a passing light, as the
 * page settles, beside a technical sheet.
 *
 * The house: the silver FUGA sculpture (the index's own) rises into the white room and stands there while
 * the four rooms pass one at a time; for each, the letters recompose and a window beside them shows what
 * is inside, with its names. Choosing one steps back from the piece into the room, as the index does.
 *
 * Everything follows the scroll through a critically damped spring, so it glides instead of stepping.
 */

/** Scroll, smoothed: follows closely, settles without overshoot */
const GLIDE = { stiffness: 120, damping: 30, mass: 0.45, restDelta: 0.0005 };

/** The paper room: the brand's platinum, a high window to the upper right, a breath of clay in the far corner */
// (one even tone, the same in every room: the cut's paper and the house's meet without a seam)
const PAPER = "#f3f0eb";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const INK = "#3b3734";
const QUIET = "#8a827b";
const HAIR = "rgba(59,55,52,0.14)";

const Paper: React.FC = () => (
  <>
    <div aria-hidden className="absolute inset-0" style={{ background: PAPER }} />
    <div aria-hidden className="absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
  </>
);

// The writing light: the words are uncovered by a soft edge of light passing left to right, coming into
// focus as it goes; the sheet's lines are ruled in one after another and their words set down after them.
const WRITE_CSS = `
.fh-w,.fh-r{opacity:0}
.fh-on .fh-w{-webkit-mask-image:linear-gradient(100deg,#000 38%,transparent 62%);mask-image:linear-gradient(100deg,#000 38%,transparent 62%);-webkit-mask-size:320% 100%;mask-size:320% 100%;animation:fh-write 2.2s cubic-bezier(.22,1,.36,1) both}
@keyframes fh-write{0%{opacity:0;-webkit-mask-position:100% 0;mask-position:100% 0;filter:blur(10px);transform:translate3d(0,.18em,0)}18%{opacity:1}100%{opacity:1;-webkit-mask-position:0 0;mask-position:0 0;filter:blur(0);transform:none}}
.fh-r{position:relative}
.fh-r::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:${HAIR};transform:scaleX(0);transform-origin:left}
.fh-on .fh-r{animation:fh-in 1s cubic-bezier(.22,1,.36,1) both}
.fh-on .fh-r::before{animation:fh-rule 1.4s cubic-bezier(.65,0,.35,1) both;animation-delay:inherit}
@keyframes fh-in{from{opacity:0;transform:translate3d(10px,0,0)}to{opacity:1;transform:none}}
@keyframes fh-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){.fh-w,.fh-r{opacity:1!important;animation:none!important;-webkit-mask-image:none!important;mask-image:none!important}.fh-r::before{transform:none!important}}
`;

/* ── The cut ─────────────────────────────────────────────────────────── */

export const Cut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, GLIDE);

  // the paper opens from the middle out (a scale only: drawn by the compositor, never repainted)
  const open = useTransform(p, [0.04, 0.44], [0, 1]);
  // the hero steps back as the paper takes the screen
  const heroO = useTransform(p, [0.02, 0.34], [1, 0]);
  const heroY = useTransform(p, [0.02, 0.44], ["0vh", "-3vh"]);

  // the words are written in once, when the paper has opened; they fade back with it going up
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    if (v >= 0.4) {
      setOn(true);
      setShown(true);
    } else if (v < 0.3) setShown(false);
    // once the paper has the screen, the page says so: the header's pearl logo deepens to read on it
    if (v >= 0.36) document.documentElement.dataset.paper = "";
    else delete document.documentElement.dataset.paper;
  });
  useEffect(() => () => void delete document.documentElement.dataset.paper, []);

  const rows: [Key, React.ReactNode][] = [
    ["home.motto", t("hero.title").toLowerCase()],
    ["home.work", t("home.workv")],
    ["home.status", `${t("availability")} — ${new Date().getFullYear()}`],
    ["home.contact", EMAIL],
  ];

  return (
    <div ref={ref} className="relative h-[250svh]">
      <style>{WRITE_CSS}</style>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="will-change-[opacity,transform]" style={{ opacity: heroO, y: heroY }}>
          {children}
        </motion.div>

        <motion.div aria-hidden className="absolute inset-0 origin-center will-change-transform" style={{ scaleY: open }}>
          <Paper />
        </motion.div>

        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-haus ${on ? "fh-on" : ""} ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div className="flex h-full flex-col justify-end gap-12 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-5 lg:px-8 lg:pb-14">
            <div className="lg:col-span-8">
              <p className={`${SMALL} fh-w mb-6 lg:mb-8`} style={{ color: QUIET }}>
                fuga haus <span aria-hidden className="px-1">—</span> {t("home.kicker")}
              </p>
              <h2
                className="fh-w font-geo text-[2.1rem] font-normal leading-[1.1] tracking-[0.005em] [text-wrap:balance] sm:text-[2.8rem] lg:text-[3.6rem] lg:leading-[1.06]"
                style={{ color: INK, animationDelay: "0.18s" }}
              >
                {t("home.statement")}
              </h2>
            </div>
            <div className={`${SMALL} lg:col-span-4 lg:col-start-9`}>
              {rows.map(([label, value], i) => (
                <div
                  key={label}
                  className="fh-r grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-3 lg:grid-cols-[9rem_1fr]"
                  style={{ animationDelay: `${0.9 + i * 0.14}s` }}
                >
                  <span style={{ color: QUIET }}>{t(label)}</span>
                  <span style={{ color: INK }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── The house ───────────────────────────────────────────────────────── */

const LogoSpace = lazy(() => import("../../components/SpatialIndex/LogoSpace"));

type Item = { src?: string; title: string; detail: string };
type Room = { key: "projects" | "artwork" | "studio" | "contact"; num: string; path: string };

const ROOMS: Room[] = [
  { key: "projects", num: "01", path: "/projects" },
  { key: "artwork", num: "02", path: "/artwork" },
  { key: "studio", num: "03", path: "/about" },
  { key: "contact", num: "04", path: "/about#contact" },
];

// the selected works, in the projects page's order
const WORKS = ["sapphire", "buendia", "smarthc", "gracia-prados", "tolva"];
const LAB = ["r01", "r03", "r05", "r07", "r13"];
const caseOf = (slug: string) => cases.find((c) => c.slug === slug);

/**
 * The window beside the piece: the room's pictures one after another, each drawn up out of its lower edge
 * over the last, with no mount and no frame; under it, on wide screens, the names as a short typeset list
 * (the one on view in ink), which can also be pointed at.
 */
const Window: React.FC<{ room: Room; items: Item[]; list?: boolean }> = ({ room, items, list }) => {
  const { t } = useI18n();
  const still = useReducedMotion();
  const [n, setN] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => setN(0), [items]);
  useEffect(() => {
    if (still || held || items.length < 2) return;
    const id = window.setInterval(() => setN((v) => (v + 1) % items.length), 2800);
    return () => window.clearInterval(id);
  }, [items, still, held]);
  const item = items[n] ?? items[0];

  if (room.key === "contact")
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE_HAUS } }}
      >
        <span className="block font-geo text-[13px] font-normal leading-tight sm:text-[1.3rem] lg:text-[1.55vw]" style={{ color: INK }}>
          {EMAIL}
        </span>
        <span className={`${SMALL} mt-3 block`} style={{ color: QUIET }}>
          {t("availability")} — {new Date().getFullYear()}
        </span>
      </motion.div>
    );

  return (
    <div onPointerLeave={() => setHeld(false)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e5df]">
        <AnimatePresence initial={false}>
          <motion.img
            key={`${room.key}-${item.src}`}
            src={item.src}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ filter: "saturate(0.9) contrast(1.03)" }}
            initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.1 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { duration: 1.3, ease: EASE_HAUS, scale: { duration: 2.2, ease: EASE_HAUS } } }}
            exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.7, ease: EASE_VEIL } }}
          />
        </AnimatePresence>
      </div>

      {list ? (
        <>
        {/* what the one on view is, as the line under a picture on a gallery wall */}
        <div className={`${SMALL} mt-3 h-5 overflow-hidden`} style={{ color: QUIET }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${room.key}-${item.detail}`}
              className="block truncate"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_HAUS } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.25 } }}
            >
              {item.detail.toLowerCase()}
            </motion.span>
          </AnimatePresence>
        </div>
        <ul className={`${SMALL} mt-4`}>
          {items.map((it, i) => (
            <li
              key={it.title}
              onPointerEnter={() => {
                setHeld(true);
                setN(i);
              }}
              className="relative flex items-baseline justify-between gap-4 border-t py-[0.55rem] transition-colors duration-500"
              style={{ borderColor: HAIR, color: i === n ? INK : "rgba(59,55,52,0.32)" }}
            >
              <span className="flex min-w-0 flex-1 items-baseline gap-3">
                <span aria-hidden className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{it.title.toLowerCase()}</span>
              </span>

              {/* the one on view: a hairline of ink drawn along its rule while it is shown */}
              {i === n && !still && items.length > 1 && !held && (
                <motion.span
                  key={`${room.key}-${n}`}
                  aria-hidden
                  className="absolute left-0 top-[-1px] h-px w-full origin-left"
                  style={{ background: INK }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1, transition: { duration: 2.8, ease: "linear" } }}
                />
              )}
            </li>
          ))}
        </ul>
        </>
      ) : (
        <div className={`${SMALL} mt-3`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${room.key}-${item.title}`}
              className="block truncate"
              style={{ color: INK }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_HAUS } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              {item.title.toLowerCase()}
            </motion.span>
          </AnimatePresence>
          <span className="mt-0.5 block truncate" style={{ color: QUIET }}>
            {item.detail.toLowerCase()}
          </span>
        </div>
      )}
    </div>
  );
};

/** The way in: the word, and the hairline that opens on hover (the hero's own) */
const Enter: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-4 font-mono text-[13px] lowercase tracking-[0.04em]" style={{ color: INK }}>
    <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em] group-focus-visible:tracking-[0.12em]">{label}</span>
    <span aria-hidden className="relative block h-px w-12">
      <span className="absolute inset-0 origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:scale-x-[1.3] group-hover:opacity-100" />
    </span>
  </span>
);

export const House: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, GLIDE);
  const [at, setAt] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setAt(Math.min(ROOMS.length - 1, Math.max(0, Math.floor(v * ROOMS.length * 0.999)))));
  const room = ROOMS[at];

  // The sculpture's arrival: as the white room comes up, the piece rises into it more slowly than the page
  // and settles from a little further off, so it lands with weight instead of sliding in with the paper
  const { scrollYProgress: arrival } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const a = useSpring(arrival, { stiffness: 60, damping: 22, mass: 0.9, restDelta: 0.0005 });
  const rise = useTransform(a, [0, 1], ["38%", "0%"]);
  const size = useTransform(a, [0, 1], [0.8, 1]);
  const show = useTransform(a, [0.25, 0.9], [0, 1]);

  // the sculpture is built ahead, while the sentence is being read (three.js is heavy; the header already fetched it)
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "160% 0px 60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // stepping into a room: the camera steps back from the piece while the light floods in, then the page changes
  const [leaving, setLeaving] = useState<Room | null>(null);
  const go = (r: Room) => {
    if (leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return navigate(r.path);
    setLeaving(r);
  };
  const link = (r: Room) => ({
    href: r.path,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      go(r);
    },
  });

  const items = useMemo<Record<Room["key"], Item[]>>(() => {
    const work = t("home.workv").split(" · ");
    const pic = (slug: string) => {
      const c = caseOf(slug);
      return c?.thumb ?? c?.cover ?? "";
    };
    return {
      projects: WORKS.map(caseOf)
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({ src: c.thumb ?? c.cover, title: c.title, detail: (c.sector ?? c.client)[lang] })),
      artwork: LAB.map((id) => reel.find((r) => r.id === id))
        .filter((r): r is NonNullable<typeof r> => !!r)
        .map((r) => ({ src: r.url, title: r.title ?? "", detail: r.tech ? (TECH[r.tech][lang] ?? "") : t("section.artwork.caption") })),
      // the studio: what it does, each discipline shown in a piece of its own
      studio: [
        { src: "/posters/stationery-tall.webp", title: work[0], detail: "Ourela" },
        { src: pic("gracia-prados"), title: work[1], detail: "Gracia Prados 14" },
        { src: pic("buendia"), title: work[2], detail: "Buendía Travel" },
        { src: "/lab/club-shy.webp", title: work[3], detail: "Club Shy" },
        { src: "/video/the-sapphire-poster-vertical.webp?v=3", title: work[4], detail: "The Sapphire" },
      ],
      contact: [{ title: t("section.contact"), detail: "" }],
    };
  }, [lang, t]);

  // the counter's hairline, filling as the house is walked through
  const fill = useTransform(p, [0, 1], [0, 1]);

  return (
    <div className="relative">
      <div ref={ref} className="relative h-[440svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <Paper />

          {/* the piece, arriving */}
          <motion.div className="absolute inset-0 will-change-transform" style={{ y: rise, scale: size, opacity: show }}>
            {near && (
              <Suspense fallback={null}>
                <LogoSpace active={Math.min(at, 2)} diving={!!leaving} />
              </Suspense>
            )}
          </motion.div>

          {/* the rooms, read down the left wall: the one on view in ink, the others faint */}
          <nav aria-label={t("home.rooms")} className="absolute inset-x-4 bottom-8 sm:inset-x-6 lg:bottom-auto lg:left-8 lg:right-auto lg:top-1/2 lg:-translate-y-1/2">
            <div className={`${SMALL} mb-6 hidden items-center gap-3 lg:flex`} style={{ color: QUIET }}>
              <span>fuga haus</span>
              <span aria-hidden className="relative block h-px w-16" style={{ background: HAIR }}>
                <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, background: INK }} />
              </span>
              <span className="tabular-nums">{room.num}/04</span>
            </div>
            <ul className="hidden flex-col gap-3 lg:flex">
              {ROOMS.map((r, i) => (
                <li key={r.key}>
                  <a {...link(r)} aria-current={i === at ? "true" : undefined} className="group flex items-baseline gap-4 outline-none">
                    <span className={`${SMALL} tabular-nums transition-colors duration-700`} style={{ color: i === at ? INK : "rgba(59,55,52,0.3)" }}>
                      {r.num}
                    </span>
                    <span
                      className="font-geo text-[2.3vw] font-light lowercase leading-none tracking-[0.16em] transition-[color,letter-spacing] duration-700 ease-haus group-hover:tracking-[0.2em]"
                      style={{ color: i === at ? INK : "rgba(59,55,52,0.22)" }}
                    >
                      {t(`section.${r.key}` as Key)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* phones and tablets: the room on view alone, large, its number and the way in, and the window beside */}
            <div className="flex items-end justify-between gap-5 lg:hidden">
              <div className="min-w-0">
                <div className={`${SMALL} mb-2 flex items-center gap-3`} style={{ color: QUIET }}>
                  <span className="tabular-nums">{room.num}/04</span>
                  <span aria-hidden className="relative block h-px w-10" style={{ background: HAIR }}>
                    <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, background: INK }} />
                  </span>
                </div>
                <a {...link(room)} className="group block outline-none">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={room.key}
                      className="block font-geo text-[2.3rem] font-light lowercase leading-none tracking-[0.12em] sm:text-[3rem]"
                      style={{ color: INK }}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE_HAUS } }}
                      exit={{ opacity: 0, y: -6, filter: "blur(3px)", transition: { duration: 0.35, ease: EASE_VEIL } }}
                    >
                      {t(`section.${room.key}` as Key)}
                    </motion.span>
                  </AnimatePresence>
                  <span className={`${SMALL} mt-3 block`} style={{ color: QUIET }}>
                    {t(`section.${room.key}.caption` as Key)}
                  </span>
                  <span className="mt-6 block">
                    <Enter label={t("home.enter")} />
                  </span>
                </a>
              </div>
              <a {...link(room)} className="w-[36vw] max-w-[190px] shrink-0 outline-none" aria-label={t(`section.${room.key}` as Key)}>
                <Window room={room} items={items[room.key]} />
              </a>
            </div>
          </nav>

          {/* wide screens: the window on the right wall, its names under it, and the way in */}
          <div className="absolute right-8 top-1/2 hidden w-[19vw] min-w-[230px] max-w-[300px] -translate-y-1/2 lg:block">
            <a {...link(room)} className="block outline-none" aria-label={t(`section.${room.key}` as Key)} tabIndex={-1}>
              <Window room={room} items={items[room.key]} list />
            </a>
            <a {...link(room)} className="group mt-7 inline-block outline-none">
              <Enter label={t("home.enter")} />
            </a>
          </div>

          {/* the light flooding in as the camera steps back */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#f7f6f8]"
            initial={false}
            animate={{ opacity: leaving ? 1 : 0, transition: { duration: 0.6, delay: leaving ? 0.9 : 0, ease: EASE_VEIL } }}
            onAnimationComplete={() => {
              if (leaving) navigate(leaving.path);
            }}
          />
        </div>
      </div>

      {/* the house's foot, on the same paper */}
      <div className="relative flow-root" style={{ background: PAPER }}>
        <Footer />
      </div>
    </div>
  );
};
