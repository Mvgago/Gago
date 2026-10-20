import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { artwork, FUGA_SEI_EP } from "../../outils/artwork";
import { EASE_HAUS, EASE_VEIL, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import Footer from "../../components/Footer/Footer";
import { ACTION, BODY, HEADING, SMALL } from "../../lib/type";
import { STUDIO } from "../../i18n/studio";

const pad = (n: number) => String(n).padStart(2, "0");

// three.js comes only with the sound, after the page's own pictures
const Headphones = lazy(() => import("../../components/Lab/Headphones"));

/**
 * The lab is a room apart from the rest of the site: near black, lit low from one side in a cold
 * red that fades into the dark, with a grain over it and the corners falling away, so it feels
 * like a back room the light hardly reaches.
 */
const NIGHT = "#0f0e10";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const NightRoom: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: NIGHT }}>
    <style>{`@keyframes lab-breathe{0%,100%{opacity:.75}50%{opacity:1}}`}</style>
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 55% at 12% 18%, rgba(120,28,36,0.28) 0%, transparent 70%), radial-gradient(50% 60% at 92% 85%, rgba(70,44,92,0.22) 0%, transparent 72%)",
        animation: "lab-breathe 9s ease-in-out infinite",
      }}
    />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
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
          <span className="text-platinum">{t("section.artwork")}</span> — {t("section.artwork.caption")}
        </h1>
      </motion.header>

      {/* A few pieces, and a line on what they are */}
      <section>
        <div className="mb-10 grid grid-cols-12 gap-x-8 md:mb-12">
          <p className={`${SMALL} col-span-12 text-platinum/50 md:col-span-3`}>{s.labArtLabel}</p>
          <p className={`${BODY} col-span-12 mt-3 max-w-[52ch] text-platinum/75 md:col-span-6 md:mt-0`}>{s.labArtText}</p>
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
                style={{ background: "#1a181b" }}
              >
                <img src={plate.url} alt={`${plate.title ?? s.labArtLabel} — Fuga Haus`} loading="lazy" decoding="async" {...protect} style={{ filter: plate.grade }} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.03]" />
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
          <a
            href={FUGA_SEI_EP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fuga Sei — Grimaldi Lines"
            // edge to edge, as the illustrations above, one wide square of the record
            className="group -mx-4 block shrink-0 overflow-hidden sm:-mx-6 md:-ml-8 md:mr-0 md:w-1/2"
          >
            <img
              src={record.url}
              alt="Fuga Sei — Grimaldi Lines (EP)"
              {...protect}
              className="block aspect-square w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.03]"
            />
          </a>
          {/* pointed at, the headphones lift and turn to the visitor, and beside them comes in what
              is playing in them, with a way to listen */}
          <div
            className="group/hp relative z-10 -mt-[30%] ml-[18%] w-[82%] md:-ml-[16%] md:mt-0 md:w-[50%]"
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
  const more = detail && <span className={`${SMALL} text-platinum/50`}>{detail}</span>;

  if (inline) {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-5 gap-y-1 ${centred ? "justify-center text-center" : ""}`}>
        {number}
        {name}
        {more}
        {listen}
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
  const { t } = useI18n();
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
              <Caption index={index} title={plate.title} detail={plate.detail} href={plate.href} centred inline />
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
