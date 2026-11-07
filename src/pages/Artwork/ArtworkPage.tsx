import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { artwork, FUGA_SEI_EP, TECH } from "../../outils/artwork";
import { EASE_HAUS, EASE_VEIL, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import Footer from "../../components/Footer/Footer";
import { ACTION, BODY, HEADING, SMALL } from "../../lib/type";
import { STUDIO } from "../../i18n/studio";

const pad = (n: number) => String(n).padStart(2, "0");

// three.js comes only with the sound, after the page's own pictures
const Headphones = lazy(() => import("../../components/Lab/Headphones"));

/**
 * The lab is a room apart from the rest of the site: its walls a dark cool grey under a pool of lavender, cool
 * where the studio is warm graphite, with a grain over it and the corners falling away.
 */
const NIGHT = "#232227";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const NightRoom: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: NIGHT }}>
    <style>{`@keyframes lab-breathe{0%,100%{opacity:.92}50%{opacity:1}}`}</style>
    <div
      className="absolute inset-0"
      style={{
        // a grey wall, and lavender light gathered in the upper left: its source off the page, so it
        // comes in as a long soft wash with no edge, never a shape, and fades well before the rest
        background:
          "radial-gradient(75% 50% at -5% -10%, rgba(150,134,196,0.3) 0%, rgba(150,134,196,0.12) 45%, transparent 100%), radial-gradient(45% 70% at -10% 20%, rgba(150,134,196,0.12) 0%, transparent 100%)",
        animation: "lab-breathe 9s ease-in-out infinite",
      }}
    />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, transparent 45%, rgba(10,9,14,0.5) 100%)" }} />
    <div className="absolute inset-0 opacity-[0.07] mix-blend-screen" style={{ backgroundImage: GRAIN }} />
  </div>
);


/** Plates are looked at, not taken: no dragging or saving from the context menu. */
const protect = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

export const ArtworkPage: React.FC = () => {
  const { t, lang } = useI18n();
  const s = STUDIO[lang];
  const [open, setOpen] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const plates = useRef<(HTMLButtonElement | null)[]>([]);
  // A small sample for now: the studio's own record first, then four pieces
  const record = artwork[0];
  const sample = artwork.slice(1, 5);
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
    <main className="px-4 pb-24 pt-28 sm:px-6 md:px-8 md:pt-32">
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

      {/* A few pieces, and a line on what they are */}
      <section>
        <div className="mb-10 grid grid-cols-12 gap-x-8 md:mb-12">
          {/* no label over it: the line itself says what the pieces are; it keeps the label's
              column empty, so it lines up with the sound below */}
          <div className="col-span-12 md:col-span-6 md:col-start-4">
            <p className={`${BODY} max-w-[52ch] text-platinum/75`}>{s.labArtText}</p>
            {/* that they are original and can be had, quietly, with the way to ask */}
            <p className={`${BODY} mt-3 max-w-[52ch] text-platinum/50`}>
              {s.labArtOffer}{" "}
              <Link to="/about#contact" className="text-platinum/80 underline decoration-platinum/30 underline-offset-4 transition-colors duration-300 hover:text-platinum">
                {s.labArtCta}
              </Link>
            </p>
          </div>
        </div>
        {/* edge to edge, the pieces touching, as one strip */}
        <ul className="-mx-4 grid grid-cols-2 sm:-mx-6 md:-mx-8 md:grid-cols-4">
          {sample.map((plate, i) => (
            <motion.li
              key={plate.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, ease: EASE_HAUS, delay: i * 0.08 }}
            >
              <button
                ref={(n) => {
                  plates.current[i] = n;
                }}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${plate.title ?? t("section.artwork")} — ${pad(i + 1)}`}
                className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden"
                style={{ background: "#33303c" }}
              >
                <img src={plate.url} alt={`${plate.title ?? s.labArtLabel} — Fuga Haus`} loading="lazy" decoding="async" {...protect} style={{ filter: plate.grade, transform: plate.crop ? `scale(${plate.crop})` : undefined, transformOrigin: plate.cropAt }} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.03]" />
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Sound: set the same way as the illustration above it, a line on what it is, then the record */}
      <section className="mt-24 md:mt-32">
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
  "repeating-radial-gradient(circle, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.03) 1px 2.5px)",
  "radial-gradient(circle, transparent 0 12%, rgba(200,206,216,0.2) 12% 21%, rgba(230,232,238,0.4) 21% 21.8%, rgba(180,186,196,0.22) 21.8% 27%, rgba(110,114,124,0.9) 27% 28%, #8f929b 28% 70%, #82858e 70% 98.6%, #aeb1b8 98.6% 99.4%, rgba(70,72,80,0.9) 99.4% 100%)",
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
    const goal = playing ? (touch && !hover ? 0.06 : 0.18) : 0; // turns a second: slow, unhurried
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
  const rainbow = useMotionTemplate`conic-gradient(from ${light}deg, rgba(255,140,200,0.55), rgba(255,226,140,0.5) 8%, rgba(150,240,190,0.5) 16%, rgba(130,190,255,0.55) 25%, rgba(200,150,255,0.5) 33%, rgba(200,205,215,0) 42%, rgba(200,205,215,0) 50%, rgba(255,140,200,0.55) 50%, rgba(255,226,140,0.5) 58%, rgba(150,240,190,0.5) 66%, rgba(130,190,255,0.55) 75%, rgba(200,150,255,0.5) 83%, rgba(200,205,215,0) 92%)`;
  const glint = useMotionTemplate`conic-gradient(from ${light}deg, transparent 0 40%, rgba(255,255,255,0.28) 44%, transparent 47% 90%, rgba(255,255,255,0.22) 94%, transparent 97%)`;
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
  const out = !seen ? "0%" : playing ? "50%" : "30%";

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
      <motion.div className="relative aspect-square w-[78%] md:w-[80%]" style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        {/* the disc, behind the case, its own size as the booklet's; the colours stay with the light
            (and drift with the pointer) while the print on the hub and the data's traces turn */}
        <motion.div
          aria-hidden
          className="absolute left-[1.5%] top-[1.5%] aspect-square w-[97%] rounded-full shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)]"
          style={{ background: CD_BODY }}
          initial={{ x: "0%", rotate: -40 }}
          animate={{ x: out, rotate: seen ? 0 : -40 }}
          transition={seen && !playing && !hover ? { type: "spring", stiffness: 60, damping: 11, mass: 1, delay: 0.25 } : { type: "spring", stiffness: 70, damping: 16 }}
        >
          <motion.div className="absolute inset-0 rounded-full mix-blend-hard-light" style={{ background: rainbow, WebkitMaskImage: MIRROR, maskImage: MIRROR, opacity: 0.6 }} />
          {/* a hard white catch of the light across the mirror, two opposite blades */}
          <motion.div className="absolute inset-0 rounded-full mix-blend-screen" style={{ background: glint, WebkitMaskImage: MIRROR, maskImage: MIRROR }} />
          <div ref={label} className="absolute inset-0 rounded-full">
            {/* the data's faint uneven traces, so the turn can be seen */}
            <div
              className="absolute inset-0 rounded-full opacity-60"
              style={{ background: "conic-gradient(from 0deg, transparent 0 8%, rgba(60,64,74,0.18) 9% 14%, transparent 15% 46%, rgba(60,64,74,0.12) 47% 50%, transparent 51% 78%, rgba(60,64,74,0.15) 79% 83%, transparent 84%)", WebkitMaskImage: "radial-gradient(circle, transparent 0 34%, #000 35% 80%, transparent 81%)", maskImage: "radial-gradient(circle, transparent 0 34%, #000 35% 80%, transparent 81%)" }}
            />
            {/* a nod to the record's name, etched into the mirror as a disc's codes are: a crossing's dashed
                line between two ports, and the title running round the outer edge */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              <defs>
                <path id="fh-cd-ring" d="M100,12 a88,88 0 1,1 -0.01,0" />
              </defs>
              <path d="M41.7 78.8 A62 62 0 0 1 147.5 60.1" fill="none" stroke="rgba(34,38,46,0.42)" strokeWidth="0.7" strokeDasharray="2.2 2" />
              <circle cx="41.7" cy="78.8" r="1.7" fill="none" stroke="rgba(34,38,46,0.5)" strokeWidth="0.6" />
              <circle cx="147.5" cy="60.1" r="1.7" fill="rgba(34,38,46,0.5)" />
              <text fill="rgba(34,38,46,0.42)" fontFamily="JetBrains Mono, monospace" fontSize="4.6" letterSpacing="1.5">
                <textPath href="#fh-cd-ring">GRIMALDI LINES · CROSSING 01 · FUGA SEI · MMXXVI · GRIMALDI LINES · CROSSING 01 · FUGA SEI · MMXXVI ·</textPath>
              </text>
            </svg>
            {/* the hub's moulded print */}
            <span className="absolute left-1/2 top-[23.5%] -translate-x-1/2 font-mono text-[6px] uppercase tracking-[0.3em] text-[#3a3d45]/70">fuga sei</span>
            <span className="absolute bottom-[23.5%] left-1/2 -translate-x-1/2 font-mono text-[6px] uppercase tracking-[0.3em] text-[#3a3d45]/55">grimaldi lines</span>
          </div>
        </motion.div>
        {/* the jewel case, nudged back a little as the disc is drawn out */}
        <motion.div className="absolute inset-0" animate={{ x: playing ? "-2%" : "0%" }} transition={{ type: "spring", stiffness: 70, damping: 16 }}>
          {/* the case's shadow; the booklet fills the clear case edge to edge */}
          <div className="absolute inset-0 rounded-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),14px_0_28px_-10px_rgba(0,0,0,0.55)]" />
          <img
            src={src}
            alt="Fuga Sei — Grimaldi Lines (EP)"
            {...protect}
            // a touch dimmer, so the pale booklet doesn't glare in the dark room
            style={{ filter: "brightness(0.82)" }}
            className="absolute inset-0 block h-full w-full rounded-[3px] object-cover"
          />
          {/* the hinge down the left: a narrow band of smoked plastic with one fine edge of light */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2.8%] rounded-l-[3px]"
            style={{ background: "linear-gradient(90deg, rgba(30,31,36,0.95) 0%, rgba(74,76,86,0.7) 60%, rgba(255,255,255,0.18) 62%, rgba(36,37,42,0.9) 66%)" }}
          />
          {/* the clear lid over all: a hairline edge, a long soft reflection across it, and a gloss that
              follows the pointer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.22)]"
            style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 22%, transparent 40%, transparent 72%, rgba(255,255,255,0.04) 84%, transparent 94%)" }}
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
              <motion.img
                key={plate.id}
                src={plate.url}
                alt={plate.title ?? ""}
                {...protect}
                // every piece the same size: one square, as large as the room allows, the picture filling it
                className="absolute inset-0 m-auto aspect-square h-auto w-[min(calc(100%-2rem),calc(100vh-11rem))] object-cover shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]"
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                  center: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE_HAUS } },
                  exit: (d: number) => ({ opacity: 0, x: d * -30, transition: { duration: 0.45, ease: EASE_VEIL } }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
              />
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
