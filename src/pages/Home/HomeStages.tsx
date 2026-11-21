import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";
import { SMALL } from "../../lib/type";
import { useI18n } from "../../i18n/I18n";
import type { Key } from "../../i18n/strings";
import { ContactMenu, EMAIL } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";


/**
 * The landing in three screens that fall into place, one per gesture: the lit room; the cut onto paper,
 * with the studio in one line beside its sheet; and the house's index, four names set large, one picture
 * coming up behind the one pointed at. Each change plays whole, at its own pace, whatever the finger or
 * the wheel does, so it is always smooth. The page itself never scrolls.
 */

/** Sent to go one screen on (the thread at the foot of a screen) */
export const NEXT = "fh:next";

const PAPER = "#f3f0eb";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const INK = "#3b3734";
const QUIET = "#8a827b";
const HAIR = "rgba(59,55,52,0.14)";

/** `inert` as an attribute (React 18 does not know the prop yet): a screen out of view takes no focus or touch */
const inert = (off: boolean) => (off ? ({ inert: "" } as Record<string, string>) : {});

/** How long a change of screen holds the next gesture back */
const HOLD = 1150;

// The writing light: the words uncovered by a soft edge of light passing left to right, coming into focus.
const CSS = `
.fh-w{opacity:0}
.fh-on .fh-w{-webkit-mask-image:linear-gradient(100deg,#000 38%,transparent 62%);mask-image:linear-gradient(100deg,#000 38%,transparent 62%);-webkit-mask-size:320% 100%;mask-size:320% 100%;animation:fh-write 2.2s cubic-bezier(.22,1,.36,1) both}
@keyframes fh-write{0%{opacity:0;-webkit-mask-position:100% 0;mask-position:100% 0;filter:blur(10px);transform:translate3d(0,.18em,0)}18%{opacity:1}100%{opacity:1;-webkit-mask-position:0 0;mask-position:0 0;filter:blur(0);transform:none}}
@keyframes fh-down{0%,18%{transform:translateY(-100%);opacity:0}30%{opacity:1}72%,100%{transform:translateY(100%);opacity:0}}
@media (prefers-reduced-motion:reduce){.fh-w{opacity:1!important;animation:none!important;-webkit-mask-image:none!important;mask-image:none!important}.fh-down{animation:none!important;opacity:.6!important;transform:none!important}}
`;

/** The way down, without a word: a thread hanging from the middle of the foot, a bead of light running down it */
export const Thread: React.FC<{ tone?: "light" | "ink"; delay?: number }> = ({ tone = "light", delay = 2.6 }) => {
  const { t } = useI18n();
  const line = tone === "light" ? "bg-white/25" : "bg-[rgba(59,55,52,0.18)]";
  const bead =
    tone === "light"
      ? "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95) 60%, transparent)"
      : "linear-gradient(to bottom, transparent, rgba(59,55,52,0.85) 60%, transparent)";
  return (
    <button
      type="button"
      aria-label={t("home.scroll")}
      onClick={() => window.dispatchEvent(new Event(NEXT))}
      // (a wide, tall touch target round a hairline)
      className="absolute bottom-0 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-end justify-center outline-none lg:h-20"
    >
      <motion.span
        aria-hidden
        className={`relative block h-5 w-px overflow-hidden sm:h-7 lg:h-12 ${line}`}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: "top" }}
        transition={{ duration: 1.4, ease: EASE_HAUS, delay }}
      >
        <span
          className="fh-down absolute inset-0 block"
          style={{ background: bead, animation: `fh-down 3.2s cubic-bezier(.65,0,.35,1) ${delay + 0.8}s infinite both` }}
        />
      </motion.span>
    </button>
  );
};

/* ── The rooms of the index ─────────────────────────────────────────── */

type Room = { key: "projects" | "artwork" | "studio" | "contact"; num: string; path: string; picture?: string };
const ROOMS: Room[] = [
  { key: "projects", num: "01", path: "/projects", picture: "/posters/sapphire-home-tall.webp" },
  { key: "artwork", num: "02", path: "/artwork", picture: "/lab/claro.webp" },
  { key: "studio", num: "03", path: "/about", picture: "/posters/stationery-tall.webp" },
  { key: "contact", num: "04", path: "/about#contact" },
];

/* ── The screens ─────────────────────────────────────────────────────── */

export const Stages: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useI18n();
  const still = useReducedMotion();
  const [stage, setStage] = useState(0);
  const at = useRef(0);
  const busy = useRef(false);
  // the claim is written in each time the paper opens from the lit room
  const [written, setWritten] = useState(0);

  const go = useCallback(
    (d: 1 | -1) => {
      const next = Math.min(2, Math.max(0, at.current + d));
      if (next === at.current || busy.current) return;
      // (never while the index or a menu is open over the page)
      if (document.querySelector("[role=dialog]")) return;
      busy.current = true;
      if (at.current === 0 && next === 1) setWritten((w) => w + 1);
      at.current = next;
      setStage(next);
      window.setTimeout(() => (busy.current = false), still ? 150 : HOLD);
    },
    [still],
  );

  // One gesture, one screen: the wheel's run of events (and a trackpad's long glide after it) counts once;
  // a swipe on a phone; the keys; the thread
  useEffect(() => {
    let acc = 0;
    let last = 0;
    let spent = false;
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - last > 300) {
        acc = 0;
        spent = false;
      }
      last = now;
      if (spent) return;
      if (busy.current) {
        spent = true;
        return;
      }
      acc += e.deltaY;
      if (Math.abs(acc) > 28) {
        spent = true;
        go(acc > 0 ? 1 : -1);
      }
    };
    let y0: number | null = null;
    const onStart = (e: TouchEvent) => (y0 = e.touches[0]?.clientY ?? null);
    const onEnd = (e: TouchEvent) => {
      if (y0 === null) return;
      const dy = y0 - (e.changedTouches[0]?.clientY ?? y0);
      y0 = null;
      if (Math.abs(dy) > 40) go(dy > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      }
    };
    const onNext = () => go(1);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener(NEXT, onNext);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(NEXT, onNext);
    };
  }, [go]);

  // on the paper, the page says so: the header's pearl logo deepens to read on the white
  useEffect(() => {
    if (stage >= 1) document.documentElement.dataset.paper = "";
    else delete document.documentElement.dataset.paper;
  }, [stage]);
  useEffect(() => () => void delete document.documentElement.dataset.paper, []);

  const T = (d: number, delay = 0) => ({ duration: still ? 0 : d, ease: EASE_VEIL, delay: still ? 0 : delay });

  // What the studio does, said plainly in two voices: the line large, then what it covers, smaller and in
  // grey (the studio page tells the why, with the fugue; here, only the what)
  const head = t("home.head");
  const sub = t("home.sub");

  return (
    <div className="relative h-[100svh] overflow-hidden sm:min-h-[600px]">
      <style>{CSS}</style>

      {/* 1 — the lit room, stepping back as the paper comes over it */}
      <motion.div
        className="absolute inset-0 will-change-[opacity,transform]"
        animate={stage === 0 ? { opacity: 1, y: "0vh" } : { opacity: 0, y: "-3vh" }}
        transition={stage === 0 ? T(1, 0.35) : T(0.9)}
        aria-hidden={stage !== 0}
        {...inert(stage !== 0)}
      >
        {children}
      </motion.div>

      {/* the paper: one plane, opening from the middle of the screen out to its edges (a scale only) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 origin-center will-change-transform"
        style={{ background: PAPER }}
        initial={false}
        animate={{ scaleY: stage >= 1 ? 1 : 0 }}
        transition={stage >= 1 ? T(1.1) : T(0.95, 0.1)}
      >
        <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      </motion.div>

      {/* 2 — what the studio is */}
      <motion.section
        className="absolute inset-0"
        initial={false}
        animate={stage === 1 ? { opacity: 1, y: "0vh" } : stage === 2 ? { opacity: 0, y: "-5vh" } : { opacity: 0, y: "0vh" }}
        transition={stage === 1 ? T(0.8, 0.2) : T(stage === 2 ? 0.7 : 0.35)}
        aria-hidden={stage !== 1}
        {...inert(stage !== 1)}
      >
        <div key={written} className={written ? "fh-on h-full" : "h-full"}>
          <div className="flex h-full flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
            <h2
              className="fh-w max-w-[16ch] font-geo text-[2.3rem] font-normal leading-[1.08] tracking-[0.005em] [text-wrap:balance] sm:text-[3rem] lg:max-w-[20ch] lg:text-[4.2rem] lg:leading-[1.04]"
              style={{ color: INK, animationDelay: "0.62s" }}
            >
              {head}
            </h2>
            <p
                className="fh-w mt-5 max-w-[40ch] font-geo text-[1.02rem] font-normal leading-[1.5] tracking-[0.01em] sm:text-[1.1rem] lg:mt-7 lg:max-w-[58ch] lg:text-[1.2rem]"
                style={{ color: "#6f6862", animationDelay: "1.15s" }}
              >
                {sub}
              </p>
          </div>
        </div>
        {stage === 1 && <Thread tone="ink" delay={2.4} />}
      </motion.section>

      {/* 3 — the house */}
      <Index on={stage === 2} />
    </div>
  );
};

const Index: React.FC<{ on: boolean }> = ({ on }) => {
  const { t } = useI18n();
  const still = useReducedMotion();
  const [hover, setHover] = useState<Room | null>(null);
  useEffect(() => {
    if (!on) setHover(null);
  }, [on]);

  return (
    <motion.nav
      aria-label={t("home.rooms")}
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: still ? 0 : on ? 0.4 : 0.35, delay: on && !still ? 0.15 : 0 }}
      aria-hidden={!on}
      {...inert(!on)}
    >
      {/* the one picture, behind, for the name pointed at: drawn up out of its lower edge and settling */}
      <div aria-hidden className="pointer-events-none absolute right-[7vw] top-1/2 hidden aspect-[4/5] w-[27vw] max-w-[440px] -translate-y-1/2 lg:block">
        <AnimatePresence>
          {hover && (
            <motion.div
              key={hover.key}
              className="absolute inset-0 overflow-hidden"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease: EASE_HAUS } }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE_VEIL } }}
            >
              {hover.picture ? (
                <motion.img
                  src={hover.picture}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                  style={{ filter: "saturate(0.85) contrast(1.02)" }}
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1, transition: { duration: 2.2, ease: EASE_HAUS } }}
                />
              ) : (
                // the contact has no picture: its address, set where the picture would hang
                <div className="flex h-full w-full flex-col justify-end bg-[#ece8e2] p-8">
                  <span className="font-geo text-[1.6vw] leading-tight" style={{ color: INK }}>
                    {EMAIL}
                  </span>
                  <span className={`${SMALL} mt-3`} style={{ color: QUIET }}>
                    {t("availability")} — {new Date().getFullYear()}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the four names, set large down the left, each rising out of its own line */}
      <ul className="absolute inset-x-4 top-1/2 -translate-y-[56%] sm:inset-x-6 lg:left-8 lg:right-auto" onPointerLeave={() => setHover(null)}>
        {ROOMS.map((r, i) => {
          const dim = hover !== null && hover !== r;
          return (
            <li key={r.key} className="overflow-hidden pb-[0.1em] pr-6">
              <motion.div
                initial={false}
                animate={on ? { y: "0%", opacity: 1, filter: "blur(0px)" } : { y: "105%", opacity: 0, filter: "blur(6px)" }}
                transition={{
                  duration: still ? 0 : on ? 1.2 : 0.4,
                  ease: on ? EASE_HAUS : EASE_VEIL,
                  delay: on && !still ? 0.45 + i * 0.09 : 0,
                }}
              >
                <Link
                  to={r.path}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(r)}
                  onFocus={() => setHover(r)}
                  className="group flex items-baseline gap-4 outline-none sm:gap-6"
                >
                  <span className={`${SMALL} w-6 shrink-0 tabular-nums transition-colors duration-700`} style={{ color: dim ? "rgba(59,55,52,0.25)" : QUIET }}>
                    {r.num}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block font-geo text-[3.1rem] font-light lowercase leading-[1.02] tracking-[0.01em] transition-[color,transform] duration-700 ease-haus group-hover:translate-x-3 sm:text-[4.6rem] lg:text-[6.4vw]"
                      style={{ color: dim ? "rgba(59,55,52,0.22)" : INK }}
                    >
                      {t(`section.${r.key}` as Key)}
                    </span>
                    {/* phones: what is inside, always under the name; wide screens: only for the one pointed at */}
                    <span
                      className={`${SMALL} -mt-1 mb-3 block transition-opacity duration-500 lg:mb-0 lg:mt-1 ${hover === r ? "lg:opacity-100" : "lg:opacity-0"}`}
                      style={{ color: QUIET }}
                    >
                      {t(`section.${r.key}.caption` as Key)}
                    </span>
                  </span>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>

      {/* the foot: the address and the small print, under a hairline */}
      <motion.div
        className={`${SMALL} absolute inset-x-4 bottom-5 flex items-center justify-between gap-3 border-t pt-4 sm:inset-x-6 sm:bottom-8 lg:inset-x-8`}
        style={{ borderColor: HAIR, color: QUIET }}
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={{ duration: still ? 0 : 0.8, delay: on && !still ? 1 : 0 }}
      >
        <span className="flex items-center gap-3">
          <ContactMenu />
          <span aria-hidden className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{t("availability")} — {new Date().getFullYear()}</span>
        </span>
        <span className="flex items-center gap-3">
          <SocialLinks className="hover:text-[#3b3734]" />
          <span aria-hidden>·</span>
          <Link to="/privacy" className="transition-colors duration-300 hover:text-[#3b3734]">
            {t("privacy")}
          </Link>
        </span>
      </motion.div>
    </motion.nav>
  );
};
