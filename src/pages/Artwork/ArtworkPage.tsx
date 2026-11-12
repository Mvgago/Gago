import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { artwork, FUGA_SEI_EP, reel, TECH } from "../../outils/artwork";
import { EASE_HAUS, EASE_VEIL, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import Footer from "../../components/Footer/Footer";
import { ACTION, BODY, HEADING, SMALL } from "../../lib/type";
import { STUDIO } from "../../i18n/studio";

const pad = (n: number) => String(n).padStart(2, "0");

// three.js comes only with the sound, after the page's own pictures
const Headphones = lazy(() => import("../../components/Lab/Headphones"));

/**
 * The lab is a room apart from the rest of the site: a misty metallic silver, a mid grey with a cool sheen
 * of light drifting across it like fog over brushed metal, with a grain over it and the corners falling away.
 */
const NIGHT = "#c3c5c9";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const NightRoom: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: NIGHT }}>
    <style>{`@keyframes lab-breathe{0%,100%{opacity:.92}50%{opacity:1}}`}</style>
    <div
      className="absolute inset-0"
      style={{
        // the sheen: a broad soft light from above, and a long diagonal band of brighter silver, as fog lit over metal
        background: "radial-gradient(80% 55% at 50% -5%, rgba(244,246,249,0.55) 0%, transparent 100%), linear-gradient(115deg, transparent 20%, rgba(250,251,253,0.3) 42%, rgba(255,255,255,0.18) 50%, transparent 72%), radial-gradient(70% 60% at 85% 100%, rgba(150,156,166,0.3) 0%, transparent 100%)",
        animation: "lab-breathe 9s ease-in-out infinite",
      }}
    />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, transparent 45%, rgba(90,94,102,0.3) 100%)" }} />
    <div className="absolute inset-0 opacity-[0.07] mix-blend-screen" style={{ backgroundImage: GRAIN }} />
  </div>
);


/** Plates are looked at, not taken: no dragging or saving from the context menu. */
const protect = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

/**
 * The reel: every piece mounted round a drum, a real cylinder turning on a level axis. The section holds the
 * screen while it is scrolled through, and the scroll turns the drum: each plate comes round from below, bent
 * to the drum's curve (drawn as fine bands, each set on the cylinder), faces the visitor, and goes over the
 * top; the drum shows above and below it, and through the slits between plates its far side. Plates dim as
 * they turn away. The one in front is named either side on a thread of light, and pressed, opens in the
 * viewer.
 */
// bands a plate is cut into, to bend it round the drum: enough that the curve reads smooth, few enough to stay light
const FILL = 0.9; // how much of its share of the drum a plate takes (the rest: the slit between plates)
const Reel: React.FC<{
  plates: typeof artwork;
  onOpen: (i: number) => void;
  buttons: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  label: string;
  /** Wide screens: what is said of the pieces, held at the left while the drum turns */
  aside?: React.ReactNode;
}> = ({ plates, onOpen, buttons, label, aside }) => {
  const { lang } = useI18n();
  const N = plates.length;
  const [BANDS] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 8 : 10));
  const step = (2 * Math.PI) / N; // each plate's share of the drum, in radians
  const section = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  // the labels' words, written straight from the drum's own frame loop, so they always name the plate in front
  const names = useRef<(HTMLSpanElement | null)[]>([]);
  const counts = useRef<(HTMLSpanElement | null)[]>([]); // a full-screen height that holds still while a phone's address bar comes and goes
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [W, setW] = useState(300);
  const [front, setFront] = useState(0);
  const H = W * 1.25;
  const R = H / (step * FILL); // the drum's radius, so a plate's height is its share of the round
  const band = (step * FILL) / BANDS;
  const bandH = 2 * R * Math.tan(band / 2) + 3; // (+3: the bands overlap, so no hairline shows between them)

  // the plate's width, set so the whole drum (with the near perspective below, it stands some 2.7 plates
  // tall) fits the screen with air above and below: from the screen's height, held to most of a phone's
  // width and to 300 px
  // (measured once per width: on a phone the address bar coming and going changes the height on every
  // scroll, and resizing the drum with it made it jump while turning)
  useEffect(() => {
    let lastW = 0;
    const fit = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      setW(Math.round(Math.min(360, window.innerWidth * 0.64, (window.innerHeight - 72) * (window.innerWidth < 768 ? 0.24 : 0.3))));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    let raf = 0;
    let shown = -1;
    // the drum follows the scroll with a soft lag (each frame a part of the way), so it turns smoothly
    // however the scroll arrives: in steps from a wheel, in bursts from a finger
    let turn = -1;
    const target = () => {
      const el = section.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const span = el.offsetHeight - (probe.current?.offsetHeight || window.innerHeight);
      const p = span > 0 ? Math.max(0, Math.min(1, -rect.top / span)) : 0;
      return p * (N - 1) * step; // from the first plate in front to the last
    };
    const tick = () => {
      raf = 0;
      const r = ring.current;
      if (!r) return;
      const goal = target();
      turn = turn < 0 ? goal : turn + (goal - turn) * 0.16;
      if (Math.abs(goal - turn) < 0.0004) turn = goal;
      else raf = requestAnimationFrame(tick);
      r.style.transform = `translateZ(${-R}px) rotateX(${turn}rad)`;
      // each plate dimmed by how far it has turned from the visitor
      cards.current.forEach((c, i) => {
        if (!c) return;
        const a = i * step - turn;
        const facing = Math.max(0, Math.cos(a));
        const lit = 0.35 + 0.65 * facing;
        c.style.setProperty("--shade", (1 - lit).toFixed(3));
        // and faded as they go over the top and under: only the one in front at full strength
        // (as a veil of the wall's own silver over each band, the bands kept opaque: made see-through, the bands' overlaps showed as stripes)
        c.style.setProperty("--veil", Math.min(1, 1.05 * (1 - facing ** 2.5)).toFixed(3));
        const v = c.querySelector("video");
        if (v) {
          if (Math.cos(a) > 0.8) void v.play().catch(() => {});
          else v.pause();
        }
      });
      const f = Math.max(0, Math.min(N - 1, Math.round(turn / step)));
      if (f !== shown) {
        shown = f;
        const pf = plates[f];
        const mk = pf?.tech ? TECH[pf.tech][lang] ?? TECH[pf.tech].es : undefined;
        const num = `${pad(f + 1)} / ${pad(N)}`;
        names.current.forEach((n) => n && (n.textContent = pf?.title ?? ""));
        counts.current.forEach((n, j) => n && (n.textContent = j === 0 && mk ? `${num} · ${mk}` : num));
        setFront(f);
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [N, R, step, plates, lang]);

  const p = plates[front];
  const making = p?.tech ? TECH[p.tech][lang] ?? TECH[p.tech].es : undefined;
  const number = `${pad(front + 1)} / ${pad(N)}`;

  return (
    // a screen and a half of scrolling for each plate, the drum held on screen throughout
    <div ref={section} className="relative -mx-4 sm:-mx-6 md:-mx-8" style={{ height: `calc(${N} * 45svh + 100lvh)` }}>
      <div ref={probe} aria-hidden className="pointer-events-none absolute left-0 top-0 h-[100lvh] w-px opacity-0" />
      {/* (centred in the screen below the header; the perspective held close, in proportion to the drum, so
          it reads as a cylinder and stays compact) */}
      {/* (the frame as tall as the screen can grow, so nothing is ever cut at its foot; inside it, the drum centred
          in the part always visible, between the header and, on a phone, a band left for its label) */}
      {/* (clipped by a clip-path as well: overflow alone let the drum's 3D plates spill past the frame onto the
          section after it; on wide screens its top and foot fade out, so as it scrolls away the plates melt into
          the wall instead of ending on a hard line) */}
      <div className="sticky top-0 h-[100lvh] overflow-hidden md:[mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_84%,transparent)]" style={{ clipPath: "inset(0)" }}>
      <div className="relative flex h-[100svh] items-center justify-center pb-[64px] pt-[64px] md:pb-0 md:pt-[72px]" style={{ perspective: Math.round(R * 0.6) }}>
        {/* wide screens: the words on the pieces, at the left, level with the drum (the drum set a little right of centre to leave them room) */}
        <div className="relative" style={{ width: W, height: H, transformStyle: "preserve-3d" }}>
        {/* wide screens: the words on the pieces just to the drum's left, high, about the top edge of the plate in front */}
        {/* wide screens, to the drum's right: the plate in front shown large, flat and sharp, changing with a
            soft dissolve as the drum turns; pressed, it opens in the viewer */}
        <div className="absolute left-full top-1/2 ml-[6vw] hidden w-[min(26vw,420px)] -translate-y-1/2 md:block">
          <AnimatePresence initial={false}>
            {p && (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => onOpen(front)}
                aria-label={`${p.title ?? label} — ${pad(front + 1)}`}
                className="absolute inset-x-0 top-1/2 block aspect-[4/5] w-full -translate-y-1/2 cursor-zoom-in overflow-hidden rounded-[6px] shadow-[0_40px_80px_-40px_rgba(30,32,36,0.45)]"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_HAUS } }}
                exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE_VEIL } }}
              >
                {p.video ? (
                  <video src={p.video} poster={p.url} muted loop playsInline autoPlay className="h-full w-full object-cover" />
                ) : (
                  <img src={p.url} alt={`${p.title ?? label} — Fuga Haus`} {...protect} style={{ filter: p.grade }} className="h-full w-full object-cover" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
          {/* (holds the column's height for the absolutely placed plates) */}
          <span aria-hidden className="block aspect-[4/5] w-full" />
        </div>        {/* wide screens: one column to the drum's left, as tall as the plate in front: the words on the pieces
            high in it, about the plate's top edge, and halfway down the plate's name, on the column's same left
            edge, its thread running on to the plate */}
        <div className="pointer-events-none absolute inset-y-0 right-full mr-[7vw] hidden w-[min(30ch,22vw)] md:block">
          {aside && <div className="pointer-events-auto absolute inset-x-0 top-0 -translate-y-[60%]">{aside}</div>}
          <span className={`${SMALL} absolute left-0 top-1/2 flex w-[calc(100%+7vw-0.75rem)] -translate-y-1/2 items-center gap-3 whitespace-nowrap`}>
            <span ref={(n) => { names.current[0] = n; }} className="text-platinum/85">{p?.title}</span>
            <span ref={(n) => { counts.current[0] = n; }} className="text-platinum/45">{making ? `${number} · ${making}` : number}</span>
            <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(42,43,47,0), rgba(42,43,47,0.5))" }} />
          </span>
        </div>
        <div ref={ring} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          {plates.map((pl, i) => (
            <button
              key={pl.id}
              ref={(n) => {
                cards.current[i] = n;
                buttons.current[i] = n;
              }}
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`${pl.title ?? label} — ${pad(i + 1)}`}
              className="absolute inset-0 cursor-zoom-in"
              style={{ transformStyle: "preserve-3d", "--shade": 0, "--veil": 0 } as React.CSSProperties}
            >
              {pl.video ? (
                // a moving piece: one flat face, its film
                <span
                  className="absolute inset-0 overflow-hidden rounded-[12px]"
                  style={{ transform: `rotateX(${-i * step}rad) translateZ(${R}px)`, borderRadius: 8 }}
                >
                  <video src={pl.video} poster={pl.url.replace("/lab/", "/lab/sm/")} muted loop playsInline preload="none" className="h-full w-full object-cover" />
                  <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(rgba(195,197,201,var(--veil)), rgba(195,197,201,var(--veil))), rgba(20,22,26,var(--shade))" }} />
                </span>
              ) : (
                Array.from({ length: BANDS }, (_, k) => {
                  const a = i * step + (k - (BANDS - 1) / 2) * band;
                  return (
                    <span
                      key={k}
                      aria-hidden
                      className="absolute left-0 w-full"
                      style={{
                        top: (H - bandH) / 2,
                        height: bandH,
                        transform: `rotateX(${-a}rad) translateZ(${R}px)`,
                        backgroundImage: `linear-gradient(rgba(195,197,201,var(--veil)), rgba(195,197,201,var(--veil))), linear-gradient(rgba(20,22,26,var(--shade)), rgba(20,22,26,var(--shade))), url(${pl.url.replace("/lab/", "/lab/sm/")})`,
                        backgroundSize: `100% 100%, 100% 100%, ${W}px ${H}px`,
                        backgroundPosition: `0 0, 0 0, 0 ${-(k * (H / BANDS)) + (bandH - H / BANDS) / 2}px`,
                        // (no filter per band: on a phone, two hundred filtered bands made the turn stutter)
                        filter: pl.grade,
                        // the plate's corners rounded on its first and last bands
                        borderRadius: k === 0 ? "8px 8px 0 0" : k === BANDS - 1 ? "0 0 8px 8px" : 0,
                      }}
                    />
                  );
                })
              )}
            </button>
          ))}
        </div>
        </div>
        <div className={`${SMALL} pointer-events-none absolute inset-x-0 bottom-[16px] z-10 flex justify-center md:hidden`}>
          <span className="flex gap-4 text-platinum/80">
          <span ref={(n) => { names.current[1] = n; }}>{p?.title}</span>
          <span ref={(n) => { counts.current[1] = n; }} className="text-platinum/45">{number}</span>
          </span>
        </div>
      </div>
      </div>
    </div>
  );
};

export const ArtworkPage: React.FC = () => {
  const { t, lang } = useI18n();
  const s = STUDIO[lang];
  const [open, setOpen] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const plates = useRef<(HTMLButtonElement | null)[]>([]);
  // the studio's own record first, on its own; then every piece, on the reel
  const record = artwork[0];
  const sample = reel;
  const [beforeName, afterName] = s.voice.split("{name}");

  // the page's own ground under everything, so a phone's overscroll never shows the light wall
  useEffect(() => {
    const prev = document.documentElement.style.background;
    document.documentElement.style.background = NIGHT;
    document.body.style.background = NIGHT;
    return () => {
      document.documentElement.style.background = prev;
      document.body.style.background = "";
    };
  }, []);

  const close = useCallback(() => {
    setOpen((i) => {
      if (i !== null) requestAnimationFrame(() => plates.current[i]?.focus({ preventScroll: true }));
      return null;
    });
  }, []);

  return (
    <main className="px-4 pb-24 pt-28 sm:px-6 md:px-8 md:pt-32" style={{ "--color-platinum": "#2a2b2f" } as React.CSSProperties}>
      {/* (the lab's ink: on its pale silver every "platinum" line of type reads as a dark graphite instead) */}
      <NightRoom />

      <motion.header
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={1}
        className={`${SMALL} mb-12 text-platinum/50 md:mb-16`}
      >
        <h1>
          {/* phones: the name of the room alone */}
          <span className="text-platinum">{t("section.artwork")}</span>
          <span className="hidden sm:inline"> — {t("section.artwork.caption")}</span>
        </h1>
      </motion.header>

      {/* the pieces: what they are, then the reel (wide screens: those words held at the drum's left) */}
      {(() => {
        const words = (
          <>
            <p className={`${BODY} max-w-[52ch] text-platinum/75`}>{s.labArtText}</p>
            {/* that they are original and can be had, quietly, with the way to ask */}
            <p className={`${BODY} mt-3 max-w-[52ch] text-platinum/50`}>
              {s.labArtOffer}{" "}
              <Link to="/about#contact" className="pointer-events-auto text-platinum/80 underline decoration-platinum/30 underline-offset-4 transition-colors duration-300 hover:text-platinum">
                {s.labArtCta}
              </Link>
            </p>
          </>
        );
        return (
          <section>
            <div className="mb-2 md:hidden">{words}</div>
            {/* (wide screens: drawn up under the page's heading, so the drum is in view from the start) */}
            {/* (phones: drawn up under the words, so the drum comes straight after them; wide screens: under the heading) */}
            <div className="-mt-[10svh] md:-mt-36">
              <Reel plates={sample} onOpen={setOpen} buttons={plates} label={s.labArtLabel} aside={words} />
            </div>
          </section>
        );
      })()}

      {/* Sound: set the same way as the illustration above it, a line on what it is, then the record */}
      {/* (straight after the drum's screen, never drawn up into it: there the drum's label and lowest plate
          ran over its words) */}
      <section className="relative z-10 mt-4 md:mt-[12vh]">
        <div className="mb-10 grid grid-cols-12 gap-x-8 md:mb-12">
          <p className={`${SMALL} col-span-12 text-platinum/50 md:col-span-3`}>{s.labSoundLabel}</p>
          <div className="col-span-12 mt-3 md:col-span-6 md:mt-0">
            {/* what the studio does in sound; the record itself, and the way to listen, are with the headphones */}
            <p className={`${BODY} max-w-[52ch] text-platinum/75`}>
              {beforeName}
              <span className="text-platinum">Fuga Sei</span>
              {afterName}
            </p>
          </div>
        </div>
        {/* the record, and beside it, leaning in over its edge, a pair of silver headphones in 3D */}
        <div className="relative md:flex md:items-center">
          <RecordSleeve src={record.url} listening={listening} />
          {/* pointed at, the headphones lift and turn to the visitor, and beside them comes in what
              is playing in them, with a way to listen */}
          <div
            className="group/hp relative z-10 -mt-[30%] ml-[18%] w-[82%] md:-ml-[12%] md:mt-0 md:w-[50%]"
            onPointerEnter={(e) => e.pointerType === "mouse" && setListening(true)}
            onPointerLeave={() => setListening(false)}
          >
            <Suspense fallback={null}>
              <Headphones active={listening} className="aspect-square w-full" />
            </Suspense>
            <style>{`@keyframes fh-eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
            <div
              className={`-mt-6 pb-2 transition-[opacity,transform] duration-700 ease-haus md:absolute md:left-[90%] md:top-1/2 md:mt-0 md:w-[15rem] md:-translate-y-1/2 md:pb-0 ${
                listening ? "md:translate-x-0 md:opacity-100" : "md:pointer-events-none md:-translate-x-3 md:opacity-0"
              }`}
            >
              <p className={`${SMALL} text-platinum/50`}>{s.labPlaying}</p>
              <div className="mt-4 flex items-end gap-4">
                {/* a small level meter, moving while the headphones are pointed at */}
                <span aria-hidden className="flex h-7 items-end gap-[3px]">
                  {[0.9, 0.55, 1, 0.7, 0.85].map((h, k) => (
                    <span
                      key={k}
                      className="block w-[3px] origin-bottom rounded-full bg-platinum/80"
                      style={{
                        height: `${h * 100}%`,
                        animation: `fh-eq ${0.7 + k * 0.13}s ease-in-out ${k * 0.09}s infinite`,
                        animationPlayState: listening ? "running" : "paused",
                      }}
                    />
                  ))}
                </span>
                <span>
                  <span className="block font-geo text-[1.35rem] font-normal leading-tight text-platinum">Grimaldi Lines</span>
                  <span className={`${SMALL} mt-1 block text-platinum/60`}>Fuga Sei — EP</span>
                </span>
              </div>
              <a href={FUGA_SEI_EP} target="_blank" rel="noopener noreferrer" className={`${ACTION} group relative mt-6 inline-block text-platinum`}>
                {t("artwork.listen")}
                <span className="absolute -bottom-1.5 left-0 h-px w-full bg-platinum/30" />
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-platinum transition-transform duration-700 ease-haus group-hover:scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Viewer plates={sample} index={open} onClose={close} onMove={setOpen} />
      <div className="mt-28">
        <Footer dark />
      </div>
    </main>
  );
};

/* ────────────────────────────────────────────────────────────────── */
// The CD, drawn as its playing side: the hole, the clear hub with its stacking ring, then the mirror
// out to a thin rim, with the faintest trace of the data rings over it
const CD_BODY = [
  "repeating-radial-gradient(circle, rgba(255,255,255,0.018) 0 1px, rgba(0,0,0,0.01) 1px 2.5px)",
  "radial-gradient(circle, transparent 0 12%, rgba(200,206,216,0.2) 12% 21%, rgba(230,232,238,0.4) 21% 21.8%, rgba(180,186,196,0.22) 21.8% 27%, rgba(110,114,124,0.9) 27% 28%, #a7aab1 28% 70%, #9a9da5 70% 98.6%, #c3c6cc 98.6% 99.4%, rgba(70,72,80,0.9) 99.4% 100%)",
].join(", ");
// the mirror only, where the colours play: from the stacking ring out to the rim
const MIRROR = "radial-gradient(circle, transparent 0 28%, #000 28.5% 98.5%, transparent 99%)";

/**
 * Fuga Sei as a CD of its time, in a clear jewel case. On arrival the disc rolls out from behind the
 * case and settles with a small give. Pointed at (or while the headphones are), it draws out further
 * and starts to turn, gathering speed and running down again as a player does, while the case leans
 * towards the pointer under a gloss that follows it and the disc's colours shift with the angle. On a
 * touch screen it turns slowly while in view.
 */
const RecordSleeve: React.FC<{ src: string; listening: boolean }> = ({ src, listening }) => {
  const box = useRef<HTMLAnchorElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-15% 0px" });
  const inView = useInView(box, { margin: "-10% 0px" });
  const still = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches);
  const playing = hover || listening || (touch && inView);

  // the label's turn, eased up to speed and down to rest
  const turn = useRef({ angle: 0, speed: 0 });
  useAnimationFrame((_, dt) => {
    if (still || !label.current) return;
    const s = turn.current;
    const goal = playing ? (touch && !hover ? 0.035 : 0.07) : 0; // turns a second: slow, unhurried
    s.speed += (goal - s.speed) * Math.min(1, dt / 1100);
    if (s.speed < 0.0005 && !playing) return;
    s.angle = (s.angle + s.speed * 360 * (dt / 1000)) % 360;
    label.current.style.transform = `rotate(${s.angle}deg)`;
  });

  // the sleeve's lean and its gloss, after the pointer
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const gx = useMotionValue(30), gy = useMotionValue(20);
  const gloss = useMotionTemplate`radial-gradient(60% 60% at ${gx}% ${gy}%, rgba(255,255,255,0.16), transparent 70%)`;
  // the disc's colours: a pale spectrum twice round, as a CD splits the light, its bearing following
  // the pointer a little, as when a disc is tilted in the hand
  const light = useSpring(useMotionValue(20), { stiffness: 60, damping: 20 });
  const rainbow = useMotionTemplate`conic-gradient(from ${light}deg, rgba(255,140,200,0) 0%, rgba(255,140,200,0.55) 6%, rgba(255,226,140,0.5) 13%, rgba(150,240,190,0.5) 20%, rgba(130,190,255,0.55) 28%, rgba(200,150,255,0.5) 35%, rgba(200,150,255,0) 43%, rgba(255,140,200,0) 50%, rgba(255,140,200,0.55) 56%, rgba(255,226,140,0.5) 63%, rgba(150,240,190,0.5) 70%, rgba(130,190,255,0.55) 78%, rgba(200,150,255,0.5) 85%, rgba(200,150,255,0) 93%, rgba(255,140,200,0) 100%)`;
  const glint = useMotionTemplate`conic-gradient(from ${light}deg, transparent 0 40%, rgba(255,255,255,0.3) 44%, transparent 47% 90%, rgba(255,255,255,0.24) 94%, transparent 97%)`;
  // the CD's own flash: where a lamp catches the tracks, two narrow wedges of pure spectrum leave the hub
  // on opposite sides, red through violet, each with a white streak at its heart
  const flash = useMotionTemplate`conic-gradient(from ${light}deg, transparent 0 8%, rgba(255,60,60,0.55) 10%, rgba(255,200,60,0.65) 11.5%, rgba(255,255,255,0.85) 12.5%, rgba(80,230,120,0.65) 13.5%, rgba(60,170,255,0.6) 15%, rgba(150,80,255,0.5) 16.5%, transparent 19% 58%, rgba(255,60,60,0.5) 60%, rgba(255,200,60,0.6) 61.5%, rgba(255,255,255,0.8) 62.5%, rgba(80,230,120,0.6) 63.5%, rgba(60,170,255,0.55) 65%, rgba(150,80,255,0.45) 66.5%, transparent 69% 100%)`;
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || still) return;
    const r = e.currentTarget.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    ry.set((u - 0.5) * 10);
    rx.set(-(v - 0.5) * 8);
    gx.set(u * 100);
    gy.set(v * 100);
    light.set(20 + (u - 0.5) * 90 + (v - 0.5) * 30);
  };
  const leave = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
    light.set(20);
  };

  // where the disc stands: inside the case, out at rest, drawn out while playing
  const out = !seen ? "0%" : playing ? "34%" : "22%";

  return (
    <a
      ref={box}
      href={FUGA_SEI_EP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fuga Sei — Grimaldi Lines"
      className="block shrink-0 md:w-1/2"
      style={{ perspective: 1200 }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <motion.div className="relative aspect-square w-[62%] sm:w-[70%] md:w-[80%]" style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        {/* the disc, behind the case, its own size as the booklet's; the colours stay with the light
            (and drift with the pointer) while its small print turns */}
        <motion.div
          aria-hidden
          className="absolute left-[1.5%] top-[1.5%] aspect-square w-[97%] rounded-full shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)]"
          style={{ background: CD_BODY }}
          initial={{ x: "0%", rotate: -40 }}
          animate={{ x: out, rotate: seen ? 0 : -40 }}
          transition={seen && !playing && !hover ? { type: "spring", stiffness: 60, damping: 11, mass: 1, delay: 0.25 } : { type: "spring", stiffness: 70, damping: 16 }}
        >
          <motion.div className="absolute inset-0 rounded-full mix-blend-hard-light" style={{ background: rainbow, WebkitMaskImage: MIRROR, maskImage: MIRROR, opacity: 0.42 }} />
          {/* a hard white catch of the light across the mirror, two opposite blades */}
          <motion.div className="absolute inset-0 rounded-full mix-blend-screen" style={{ background: glint, WebkitMaskImage: MIRROR, maskImage: MIRROR }} />
          {/* the typical CD flash, its wedges fading towards the hub as the real one does */}
          <motion.div
            className="absolute inset-0 rounded-full mix-blend-screen"
            style={{
              background: flash,
              WebkitMaskImage: "radial-gradient(circle, transparent 0 30%, rgba(0,0,0,0.35) 40%, #000 70% 98%, transparent 99%)",
              maskImage: "radial-gradient(circle, transparent 0 30%, rgba(0,0,0,0.35) 40%, #000 70% 98%, transparent 99%)",
            }}
          />
          {/* light across the disc from the upper left and falling off below, so it reads as a round,
              lit object and not a flat grey circle */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(128deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 30%, transparent 50%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.22) 100%)" }}
          />
          <div ref={label} className="absolute inset-0 rounded-full" />
        </motion.div>
        {/* the jewel case, nudged back a little as the disc is drawn out */}
        <motion.div className="absolute inset-0" animate={{ x: playing ? "-2%" : "0%" }} transition={{ type: "spring", stiffness: 70, damping: 16 }}>
          {/* the case's own depth: its edge showing below and to the right, smoked plastic catching a
              little light along its length */}
          <div
            aria-hidden
            className="absolute inset-0 translate-x-[0.5%] translate-y-[0.6%] rounded-[4px]"
            style={{ background: "linear-gradient(135deg, rgba(70,73,82,0.55) 0%, rgba(120,124,134,0.45) 50%, rgba(40,42,48,0.6) 100%)", boxShadow: "inset -1px -1px 0 rgba(255,255,255,0.22)" }}
          />
          {/* the case's shadow; the booklet fills the clear case edge to edge */}
          <div className="absolute inset-0 rounded-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),14px_0_28px_-10px_rgba(0,0,0,0.55)]" />
          <img
            src={src}
            alt="Fuga Sei — Grimaldi Lines (EP)"
            {...protect}
            // a touch dimmer, so the pale booklet doesn't glare in the dark room
            style={{ filter: "none" }}
            className="absolute inset-0 block h-full w-full rounded-[3px] object-cover"
          />
          {/* the hinge down the left: a narrow band of smoked plastic with one fine edge of light */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2.8%] rounded-l-[3px]"
            style={{ background: "linear-gradient(90deg, rgba(30,31,36,0.95) 0%, rgba(74,76,86,0.7) 60%, rgba(255,255,255,0.18) 62%, rgba(36,37,42,0.9) 66%)" }}
          />
          {/* the clear lid over all: a bevelled edge, light on top and left and dark below and right, a long
              soft reflection across it, and a gloss that follows the pointer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[3px] shadow-[inset_2px_2px_0_rgba(255,255,255,0.26),inset_-2px_-2px_0_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_4px_4px_10px_rgba(255,255,255,0.05),inset_-4px_-4px_10px_rgba(0,0,0,0.2)]"
            style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 22%, transparent 40%, transparent 72%, rgba(255,255,255,0.05) 84%, transparent 94%)" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[3px] mix-blend-soft-light transition-opacity duration-700"
            style={{ background: gloss, opacity: hover ? 1 : 0 }}
          />
        </motion.div>
      </motion.div>
    </a>
  );
};

/**
 * A gallery label: the number, and for titled works the title in the site's
 * typeface (the one thing to read), then a mono line of detail and a way to listen.
 */
const Caption: React.FC<{
  index: number;
  title?: string;
  detail?: string;
  href?: string;
  /** In the viewer: centred on one line, between the steps either side */
  centred?: boolean;
  inline?: boolean;
}> = ({ index, title, detail, href, centred, inline }) => {
  const { t } = useI18n();
  const listen = href && (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${ACTION} group/l inline-flex items-center gap-1.5 text-platinum/50 transition-colors duration-500 hover:text-platinum`}
    >
      <span className="relative">
        {t("artwork.listen")}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-platinum transition-transform duration-700 ease-haus group-hover/l:scale-x-100" />
      </span>
    </a>
  );
  const number = <span className={`${SMALL} tabular-nums text-platinum/50`}>{pad(index + 1)}</span>;
  // Untitled plates keep an empty title line, so every number sits on the same baseline
  const name = (
    <span className={`${HEADING} text-platinum`}>
      {title ?? " "}
    </span>
  );
  // the detail, quieter than the name: smaller and fainter, as the small print of a gallery label
  const more = detail && <span className="font-mono text-[11px] lowercase tracking-[0.12em] text-platinum/35">{detail}</span>;

  if (inline) {
    // A label in two lines: the number and the name, and under them, quieter, how it was made
    return (
      <div className={`flex flex-col gap-1.5 ${centred ? "items-center text-center" : ""}`}>
        <div className="flex items-baseline gap-x-4">
          {number}
          {name}
        </div>
        {(more || listen) && (
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
            {more}
            {listen}
          </div>
        )}
      </div>
    );
  }
  // Two columns: the number, then title and detail stacked exactly under each other
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1">
      {number}
      {name}
      {(more || listen) && (
        <div className="col-start-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {more}
          {listen}
        </div>
      )}
    </div>
  );
};

/** One plate at a time, alone on the room's light wall, as in a viewing room. */
const Viewer: React.FC<{
  plates: typeof artwork;
  index: number | null;
  onClose: () => void;
  onMove: (i: number) => void;
}> = ({ plates, index, onClose, onMove }) => {
  const { t, lang } = useI18n();
  const total = plates.length;
  const [direction, setDirection] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setDirection(step);
      onMove((index + step + total) % total);
    },
    [index, onMove, total],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go, onClose]);

  // Focus moves into the viewer when it opens
  const isOpen = index !== null;
  useEffect(() => {
    if (isOpen) dialog.current?.focus({ preventScroll: true });
  }, [isOpen]);

  const plate = index === null ? null : plates[index];

  // Rendered on <body>: the page sits in its own layer beneath the site header,
  // and the viewer must cover everything, header included.
  return createPortal(
    <AnimatePresence>
      {plate && index !== null && (
        <motion.div
          key="viewer"
          ref={dialog}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={plate.title ?? `${t("section.artwork")} ${pad(index + 1)}`}
          className="fixed inset-0 z-[60] flex flex-col outline-none"
          style={{ background: NIGHT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE_VEIL } }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE_VEIL } }}
        >
          {/* Close, in the same place and form as the index control */}
          <div className="flex justify-end px-4 pt-4 sm:px-6 sm:pt-5 md:px-8">
            <button
              type="button"
              onClick={onClose}
              className="meta flex items-center gap-3.5 rounded-full bg-platinum/90 px-5 py-2.5 text-[#141215] transition-colors duration-500 hover:bg-platinum"
            >
              {t("index.close")}
              <span aria-hidden className="relative block h-2 w-4">
                <span className="absolute right-0 top-1 h-px w-4 rotate-45 bg-[#141215]" />
                <span className="absolute right-0 top-1 h-px w-4 -rotate-45 bg-[#141215]" />
              </span>
            </button>
          </div>

          {/* The plate; the halves either side step through the series */}
          <div className="relative min-h-0 flex-1 px-4 py-6 sm:px-16 md:px-24">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={plate.id}
                // every piece the same size: the reel's upright 4:5, as large as the room allows
                className="absolute inset-0 m-auto aspect-[4/5] h-auto w-[min(calc(100%-2rem),calc((100vh-11rem)*0.8))] overflow-hidden rounded-[6px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]"
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                  center: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE_HAUS } },
                  exit: (d: number) => ({ opacity: 0, x: d * -30, transition: { duration: 0.45, ease: EASE_VEIL } }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {plate.video ? (
                  <video src={plate.video} poster={plate.url} muted loop playsInline autoPlay className="h-full w-full object-cover" />
                ) : (
                  <img src={plate.url} alt={plate.title ?? ""} {...protect} className="h-full w-full object-cover" />
                )}
              </motion.div>
            </AnimatePresence>
            <button
              type="button"
              aria-label={t("artwork.prev")}
              onClick={() => go(-1)}
              className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize outline-none"
            />
            <button
              type="button"
              aria-label={t("artwork.next")}
              onClick={() => go(1)}
              className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize outline-none"
            />
          </div>

          {/* Label and steps */}
          <div className="flex items-center justify-between gap-4 px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
            <button type="button" onClick={() => go(-1)} className={`${ACTION} -my-3 py-3 text-platinum/50 transition-colors hover:text-platinum`}>
              {t("artwork.prev")}
            </button>
            <div className="min-w-0">
              <Caption index={index} title={plate.title} detail={plate.detail ?? (plate.tech && (TECH[plate.tech][lang] ?? TECH[plate.tech].es))} href={plate.href} centred inline />
            </div>
            <button type="button" onClick={() => go(1)} className={`${ACTION} -my-3 py-3 text-platinum/50 transition-colors hover:text-platinum`}>
              {t("artwork.next")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
