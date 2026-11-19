import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
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
 * The cut: going down, the thread that hangs from the hero's foot is drawn across the screen, and the lit
 * room opens along it onto a paper-white one. On the paper, one sentence says what the studio is, its
 * words inking in as the page goes down, beside a technical sheet.
 *
 * The house: the silver FUGA sculpture (the index's own) stands in the white room while the four rooms
 * pass one at a time; for each, the letters recompose and a small label beside them shows what is inside,
 * as a museum label would. Choosing one steps back from the piece into the room, as the index does.
 */

/** The paper room: the brand's platinum, a high window to the upper right, a breath of clay in the far corner */
const PAPER = [
  "radial-gradient(70% 60% at 88% 4%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 70%)",
  "radial-gradient(65% 55% at 0% 100%, rgba(116,96,94,0.08) 0%, rgba(116,96,94,0) 75%)",
  "linear-gradient(#f4f1ed, #f1eee9)",
].join(", ");
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const INK = "#3b3734";
const HAIR = "rgba(59,55,52,0.14)";

const Paper: React.FC = () => (
  <>
    <div aria-hidden className="absolute inset-0" style={{ background: PAPER }} />
    <div aria-hidden className="absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
  </>
);

/* ── The cut ─────────────────────────────────────────────────────────── */

/** One word of the sentence, inking in from the paper's own grey as its turn comes */
const Word: React.FC<{ p: MotionValue<number>; from: number; to: number; children: string }> = ({ p, from, to, children }) => {
  const opacity = useTransform(p, [from, to], [0.16, 1]);
  const y = useTransform(p, [from, to], ["0.12em", "0em"]);
  return (
    <motion.span className="inline-block" style={{ opacity, y }}>
      {children}
    </motion.span>
  );
};

/** One line of the sheet, set down a little after the one before */
const Row: React.FC<{ p: MotionValue<number>; at: number; label: string; children: React.ReactNode }> = ({ p, at, label, children }) => {
  const opacity = useTransform(p, [at, at + 0.06], [0, 1]);
  const x = useTransform(p, [at, at + 0.06], [10, 0]);
  const rule = useTransform(p, [at - 0.02, at + 0.08], [0, 1]);
  return (
    <motion.div className="relative grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-3 lg:grid-cols-[9rem_1fr]" style={{ opacity, x }}>
      <motion.span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left" style={{ scaleX: rule, background: HAIR }} />
      <span className="text-[#8a827b]">{label}</span>
      <span style={{ color: INK }}>{children}</span>
    </motion.div>
  );
};

export const Cut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // the thread is drawn across, then the lit room opens along it onto the paper
  const draw = useTransform(p, [0.015, 0.13], [0, 1]);
  const gap = useTransform(p, [0.13, 0.4], [50, 0]);
  const clip = useMotionTemplate`inset(${gap}% 0% ${gap}% 0%)`;
  const upper = useMotionTemplate`${gap}%`;
  const lower = useTransform(gap, (g) => `${100 - g}%`);
  const edge = useTransform(p, [0.13, 0.16, 0.33, 0.4], [1, 1, 0.9, 0]);
  const pre = useTransform(p, [0.0, 0.015, 0.13, 0.135], [0, 1, 1, 0]);
  // the hero steps back as it is closed over
  const heroO = useTransform(p, [0.08, 0.36], [1, 0]);
  const heroY = useTransform(p, [0.08, 0.4], ["0vh", "-4vh"]);

  // once the paper has taken the screen, the page says so, so the header's pearl logo can deepen to read on it
  useMotionValueEvent(p, "change", (v) => {
    if (v >= 0.36) document.documentElement.dataset.paper = "";
    else delete document.documentElement.dataset.paper;
  });
  useEffect(() => () => void delete document.documentElement.dataset.paper, []);

  const words = t("home.statement").split(" ");
  const span = (0.72 - 0.42) / words.length;

  return (
    <div ref={ref} className="relative h-[330svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ opacity: heroO, y: heroY }}>{children}</motion.div>

        {/* the thread across the lit room: one line of light, drawn from the middle out */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
          style={{
            scaleX: draw,
            opacity: pre,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 18%, #fff 50%, rgba(255,255,255,0.95) 82%, transparent)",
            boxShadow: "0 0 14px 1px rgba(255,255,255,0.55)",
          }}
        />

        {/* the paper room, opening along the thread */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <Paper />
          <div className="relative flex h-full flex-col justify-end gap-12 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-5 lg:px-8 lg:pb-14">
            <p className="font-geo text-[2.1rem] font-normal leading-[1.1] tracking-[0.005em] [text-wrap:balance] sm:text-[2.8rem] lg:col-span-8 lg:text-[3.7rem] lg:leading-[1.06]" style={{ color: INK }} aria-label={t("home.statement")}>
              {words.map((w, i) => (
                <React.Fragment key={`${w}-${i}`}>
                  <Word p={p} from={0.42 + i * span} to={0.42 + (i + 2.5) * span}>
                    {w}
                  </Word>{" "}
                </React.Fragment>
              ))}
            </p>
            <div className={`${SMALL} lg:col-span-4 lg:col-start-9`} aria-label="Fuga Haus">
              <Row p={p} at={0.66} label={t("home.motto")}>{t("hero.title").toLowerCase()}</Row>
              <Row p={p} at={0.71} label={t("home.work")}>{t("home.workv")}</Row>
              <Row p={p} at={0.76} label={t("home.status")}>
                {t("availability")} — {new Date().getFullYear()}
              </Row>
              <Row p={p} at={0.81} label={t("home.contact")}>{EMAIL}</Row>
            </div>
          </div>
        </motion.div>

        {/* the two edges of the cut, travelling out to the screen's ends */}
        <motion.span aria-hidden className="pointer-events-none absolute inset-x-0 h-px bg-white" style={{ top: upper, opacity: edge, boxShadow: "0 0 12px rgba(255,255,255,0.6)" }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-x-0 h-px bg-white" style={{ top: lower, opacity: edge, boxShadow: "0 0 12px rgba(255,255,255,0.6)" }} />
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

/** The label beside the piece: a small mounted window onto the room, with its title written under it */
const Label: React.FC<{ room: Room; items: Item[] }> = ({ room, items }) => {
  const { t } = useI18n();
  const still = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (still || items.length < 2) return;
    const id = window.setInterval(() => setN((v) => (v + 1) % items.length), 2200);
    return () => window.clearInterval(id);
  }, [items, still]);
  const item = items[n] ?? items[0];
  return (
    <div className="w-full">
      {/* the mount: a pale card with the picture set in it, as a gallery hangs a small work */}
      <div className="relative aspect-[4/5] w-full bg-[#f9f8f6] p-[6%] shadow-[0_30px_60px_-34px_rgba(59,55,52,0.45),0_0_0_1px_rgba(59,55,52,0.06)]">
        <div className="relative h-full w-full overflow-hidden bg-[#ebe7e2]">
          <AnimatePresence initial={false} mode="popLayout">
            {item.src ? (
              <motion.img
                key={`${room.key}-${item.src}`}
                src={item.src}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "saturate(0.9) contrast(1.03)" }}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE_HAUS } }}
                exit={{ opacity: 0, transition: { duration: 0.8, ease: EASE_VEIL } }}
              />
            ) : (
              <motion.div
                key={`${room.key}-text`}
                className="absolute inset-0 flex items-center justify-center break-all p-3 text-center font-mono text-[10px] lowercase tracking-[0.02em] sm:text-[12px]"
                style={{ color: INK }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
              >
                {EMAIL}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* the label's words: what it is, and what kind of thing, in the small type */}
      <div className={`${SMALL} mt-4 flex items-baseline justify-between gap-3`} style={{ color: INK }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${room.key}-${item.title}`}
            className="min-w-0 truncate"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_HAUS } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {item.title.toLowerCase()}
          </motion.span>
        </AnimatePresence>
        {items.length > 1 && (
          <span className="shrink-0 tabular-nums text-[#8a827b]">
            {String(n + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className={`${SMALL} mt-1 leading-snug text-[#8a827b]`}>{item.detail || t(`section.${room.key}.caption` as Key)}</div>
    </div>
  );
};

/** The way in: the word, and the hairline that opens on hover (the hero's own) */
const Enter: React.FC<{ label: string }> = ({ label }) => (
  <span className="font-mono text-[13px] lowercase tracking-[0.04em] inline-flex items-center gap-4" style={{ color: INK }}>
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
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [at, setAt] = useState(0);
  useMotionValueEvent(p, "change", (v) => setAt(Math.min(ROOMS.length - 1, Math.max(0, Math.floor(v * ROOMS.length * 0.999)))));
  const room = ROOMS[at];

  // the sculpture is only built while the house is near (three.js is heavy, and the header already fetched it)
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "60% 0px" });
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

  const items = useMemo<Record<Room["key"], Item[]>>(
    () => ({
      projects: WORKS.map((slug) => cases.find((c) => c.slug === slug))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({ src: c.thumb ?? c.cover, title: c.title, detail: (c.sector ?? c.client)[lang] })),
      artwork: LAB.map((id) => reel.find((r) => r.id === id))
        .filter((r): r is NonNullable<typeof r> => !!r)
        .map((r) => ({ src: r.url, title: r.title ?? "", detail: r.tech ? TECH[r.tech][lang] ?? "" : t("section.artwork.caption") })),
      studio: [{ src: "/posters/stationery-tall.webp", title: t("section.studio"), detail: t("section.studio.caption") }],
      contact: [{ title: t("section.contact"), detail: `${t("availability")} — ${new Date().getFullYear()}` }],
    }),
    [lang, t],
  );

  // the counter's hairline, filling as the house is walked through
  const fill = useTransform(p, [0, 1], [0, 1]);

  return (
    <div className="relative">
      <div ref={ref} className="relative h-[440svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <Paper />

          {/* the piece */}
          <div className="absolute inset-0">
            {near && (
              <Suspense fallback={null}>
                <LogoSpace active={Math.min(at, 2)} diving={!!leaving} />
              </Suspense>
            )}
          </div>

          {/* the rooms, read down the left wall: the one on view in ink, the others faint */}
          <nav aria-label={t("home.rooms")} className="absolute inset-x-4 bottom-8 sm:inset-x-6 lg:bottom-auto lg:left-8 lg:right-auto lg:top-1/2 lg:-translate-y-1/2">
            <div className={`${SMALL} mb-6 hidden items-center gap-3 text-[#8a827b] lg:flex`}>
              <span>fuga haus</span>
              <span aria-hidden className="relative block h-px w-16" style={{ background: HAIR }}>
                <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, background: INK }} />
              </span>
              <span className="tabular-nums">{room.num}/04</span>
            </div>
            <ul className="hidden flex-col gap-3 lg:flex">
              {ROOMS.map((r, i) => (
                <li key={r.key}>
                  <a
                    href={r.path}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r);
                    }}
                    aria-current={i === at ? "true" : undefined}
                    className="group flex items-baseline gap-4 outline-none"
                  >
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

            {/* phones and tablets: the room on view alone, large, its number and the way in, and the label beside */}
            <div className="flex items-end justify-between gap-5 lg:hidden">
              <div className="min-w-0">
                <div className={`${SMALL} mb-2 flex items-center gap-3 text-[#8a827b]`}>
                  <span className="tabular-nums">{room.num}/04</span>
                  <span aria-hidden className="relative block h-px w-10" style={{ background: HAIR }}>
                    <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, background: INK }} />
                  </span>
                </div>
                <a
                  href={room.path}
                  onClick={(e) => {
                    e.preventDefault();
                    go(room);
                  }}
                  className="group block outline-none"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={room.key}
                      className="block font-geo text-[2.3rem] font-light lowercase leading-none tracking-[0.12em] sm:text-[3rem]"
                      style={{ color: INK }}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_HAUS } }}
                      exit={{ opacity: 0, y: -6, filter: "blur(3px)", transition: { duration: 0.3 } }}
                    >
                      {t(`section.${room.key}` as Key)}
                    </motion.span>
                  </AnimatePresence>
                  <span className={`${SMALL} mt-3 block text-[#8a827b]`}>{t(`section.${room.key}.caption` as Key)}</span>
                  <span className="mt-6 block">
                    <Enter label={t("home.enter")} />
                  </span>
                </a>
              </div>
              <a
                href={room.path}
                onClick={(e) => {
                  e.preventDefault();
                  go(room);
                }}
                className="w-[34vw] max-w-[180px] shrink-0 outline-none"
                aria-label={t(`section.${room.key}` as Key)}
              >
                <Label room={room} items={items[room.key]} />
              </a>
            </div>
          </nav>

          {/* wide screens: the label on the right wall, with the way in under it */}
          <a
            href={room.path}
            onClick={(e) => {
              e.preventDefault();
              go(room);
            }}
            className="group absolute right-8 top-1/2 hidden w-[15vw] min-w-[200px] max-w-[260px] -translate-y-1/2 outline-none lg:block"
            aria-label={t(`section.${room.key}` as Key)}
          >
            <Label room={room} items={items[room.key]} />
            <span className="mt-7 block">
              <Enter label={t("home.enter")} />
            </span>
          </a>

          {/* the light flooding in as the camera steps back */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#f7f6f8]"
            initial={false}
            animate={{ opacity: leaving ? 1 : 0, transition: { duration: 0.55, delay: leaving ? 0.9 : 0 } }}
            onAnimationComplete={() => {
              if (leaving) navigate(leaving.path);
            }}
          />
        </div>
      </div>

      {/* the house's foot, on the same paper */}
      <div className="relative flow-root" style={{ background: "#f1eee9" }}>
        <Footer />
      </div>
    </div>
  );
};
