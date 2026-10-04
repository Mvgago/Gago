import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { artwork } from "../../outils/artwork";
import { EASE_HAUS, EASE_VEIL, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LightWall, MOUNT, WALL } from "../../components/Light/LightWall";

const pad = (n: number) => String(n).padStart(2, "0");


/** Plates are looked at, not taken: no dragging or saving from the context menu. */
const protect = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

export const ArtworkPage: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const plates = useRef<(HTMLButtonElement | null)[]>([]);
  const strip = useRef<HTMLUListElement>(null);
  const { progress, step, drag } = useStrip(strip, open === null);
  const fade = `linear-gradient(to right, ${progress.start ? "#000" : "transparent"} 0, #000 ${
    progress.start ? "0" : "96px"
  }, #000 calc(100% - ${progress.end ? "0px" : "160px"}), ${progress.end ? "#000" : "transparent"} 100%)`;

  const close = useCallback(() => {
    setOpen((i) => {
      // Keyboard focus returns to the plate that was being viewed
      if (i !== null) requestAnimationFrame(() => plates.current[i]?.focus({ preventScroll: true }));
      return null;
    });
  }, []);

  return (
    <main className="px-4 pb-24 pt-28 sm:px-6 md:px-8 md:pt-32">
      <LightWall />

      {/* Header: small, quiet, the work does the talking */}
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <motion.p variants={rise} initial="hidden" animate="shown" className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] text-graphite">
            02
          </motion.p>
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className="mt-3 font-geo text-[2.4rem] font-light lowercase leading-none tracking-[0.04em] text-ink sm:text-5xl"
          >
            {t("section.artwork")}
          </motion.h1>
        </div>
        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={2}
          className="flex flex-col gap-2 md:col-span-5 md:col-start-8 md:items-end md:text-right"
        >
          <p className="font-geo text-base font-normal tracking-[0.04em] text-graphite">{t("section.artwork.caption")}</p>
          <p className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] tabular-nums text-graphite">
            {pad(artwork.length)} {t("artwork.pieces")}
          </p>
        </motion.div>
      </header>

      {/* The strip: identical square frames edge to edge on a white band, like a contact
          sheet, each with its number in the white beneath. It slides sideways.
          (Pieces that are not square are cropped here; the viewer shows them whole.) */}
      <ul
        ref={strip}
        onPointerDown={drag.down}
        onPointerMove={drag.move}
        onPointerUp={drag.up}
        onPointerCancel={drag.up}
        onClickCapture={drag.click}
        aria-label={t("section.artwork")}
        className="flex snap-x snap-mandatory items-start overflow-x-auto border-b border-ink/[0.07] [scrollbar-width:none] sm:snap-none [&::-webkit-scrollbar]:hidden"
        // The strip fades out at an edge while there is more of it that way, instead of a hard cut
        style={{ background: MOUNT, maskImage: fade, WebkitMaskImage: fade }}
      >
        {artwork.map((plate, i) => (
          <motion.li
            key={plate.id}
            className="flex shrink-0 snap-start flex-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, ease: EASE_HAUS, delay: 0.3 + Math.min(i, 5) * 0.1 }}
          >
            <button
              ref={(n) => {
                plates.current[i] = n;
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${plate.title ?? t("section.artwork")} — ${pad(i + 1)}`}
              // The same square frame for every piece
              className="group relative block aspect-square w-[78vw] cursor-zoom-in overflow-hidden outline-offset-[-2px] sm:h-[48vh] sm:w-auto"
            >
              <img
                src={plate.url}
                alt=""
                loading={i < 3 ? "eager" : "lazy"}
                decoding="async"
                {...protect}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.03]"
              />
            </button>
            {/* The label sits in the band under its frame and never widens it */}
            <div className="w-0 min-w-full px-3 pb-[3.5vh]">
              <Caption index={i} title={plate.title} detail={plate.detail} href={plate.href} />
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Steps and progress through the series */}
      <motion.div
        className="mt-10 flex items-center justify-between gap-6 text-graphite"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1.2, delay: 0.9 } }}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={progress.start}
          className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] transition-[color,opacity] duration-500 hover:text-ink disabled:opacity-30"
        >
          ← <span className="hidden sm:inline">{t("artwork.prev")}</span>
        </button>
        <span className="relative h-px max-w-md flex-1 bg-ink/15">
          <span
            className="absolute inset-y-0 bg-ink transition-[left,width] duration-300 ease-out"
            style={{ left: `${progress.from * 100}%`, width: `${(progress.to - progress.from) * 100}%` }}
          />
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={progress.end}
          className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] transition-[color,opacity] duration-500 hover:text-ink disabled:opacity-30"
        >
          <span className="hidden sm:inline">{t("artwork.next")}</span> →
        </button>
      </motion.div>

      <Viewer index={open} onClose={close} onMove={setOpen} />
    </main>
  );
};

/* ────────────────────────────────────────────────────────────────── */

/**
 * The strip's movement: the mouse wheel slides it sideways (and hands the
 * scroll back to the page at either end), a mouse can drag it, and a drag
 * never counts as a click on a plate. Touch keeps the native swipe.
 */
function useStrip(strip: React.RefObject<HTMLUListElement>, enabled: boolean) {
  const [progress, setProgress] = useState({ from: 0, to: 1, start: true, end: false });

  const measure = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress({
      from: el.scrollLeft / el.scrollWidth,
      to: (el.scrollLeft + el.clientWidth) / el.scrollWidth,
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= max - 2,
    });
  }, [strip]);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpads already scroll sideways
      const max = el.scrollWidth - el.clientWidth;
      const atEdge = (e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1);
      if (atEdge) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Images arriving change the strip's length
    el.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));
    measure();
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [strip, measure]);

  // About one plate at a time
  const step = useCallback(
    (dir: number) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.6, behavior: "smooth" }),
    [strip],
  );

  // Arrow keys move the strip while the viewer is closed
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, step]);

  // Mouse drag
  const state = useRef({ down: false, x: 0, left: 0, moved: false });
  const drag = {
    down: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !strip.current) return;
      state.current = { down: true, x: e.clientX, left: strip.current.scrollLeft, moved: false };
    },
    move: (e: React.PointerEvent) => {
      const s = state.current;
      if (!s.down || !strip.current) return;
      const dx = e.clientX - s.x;
      if (!s.moved && Math.abs(dx) > 6) {
        s.moved = true;
        strip.current.setPointerCapture(e.pointerId);
      }
      if (s.moved) strip.current.scrollLeft = s.left - dx;
    },
    up: () => {
      state.current.down = false;
    },
    click: (e: React.MouseEvent) => {
      if (state.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        state.current.moved = false;
      }
    },
  };

  return { progress, step, drag };
}

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
      className="group/l font-mono text-[11px] font-normal lowercase tracking-[0.04em] inline-flex items-center gap-1.5 text-graphite transition-colors duration-500 hover:text-ink"
    >
      <span className="relative">
        {t("artwork.listen")}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover/l:scale-x-100" />
      </span>
      <span aria-hidden>↗</span>
    </a>
  );
  const number = <span className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] tabular-nums text-graphite">{pad(index + 1)}</span>;
  // Untitled plates keep an empty title line, so every number sits on the same baseline
  const name = (
    <span className="font-geo text-[1.05rem] font-light leading-snug tracking-[0.04em] text-ink">
      {title ?? " "}
    </span>
  );
  const more = detail && <span className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] text-graphite">{detail}</span>;

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
  index: number | null;
  onClose: () => void;
  onMove: (i: number) => void;
}> = ({ index, onClose, onMove }) => {
  const { t } = useI18n();
  const total = artwork.length;
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

  const plate = index === null ? null : artwork[index];

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
          style={{ background: WALL }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE_VEIL } }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE_VEIL } }}
        >
          {/* Close, in the same place and form as the index control */}
          <div className="flex justify-end px-4 pt-4 sm:px-6 sm:pt-5 md:px-8">
            <button
              type="button"
              onClick={onClose}
              className="meta flex items-center gap-3.5 rounded-full bg-ink/90 px-5 py-2.5 text-platinum shadow-[0_10px_30px_-12px_rgba(40,34,38,0.55)] transition-colors duration-500 hover:bg-ink"
            >
              {t("index.close")}
              <span aria-hidden className="relative block h-2 w-4">
                <span className="absolute right-0 top-1 h-px w-4 rotate-45 bg-platinum" />
                <span className="absolute right-0 top-1 h-px w-4 -rotate-45 bg-platinum" />
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
                className="absolute inset-x-4 inset-y-6 m-auto max-h-[calc(100%-3rem)] max-w-[calc(100%-2rem)] object-contain shadow-[0_40px_80px_-40px_rgba(40,34,44,0.45)] sm:inset-x-16 sm:max-w-[calc(100%-8rem)] md:inset-x-24 md:max-w-[calc(100%-12rem)]"
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
            <button type="button" onClick={() => go(-1)} className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] text-graphite transition-colors hover:text-ink">
              ← <span className="hidden sm:inline">{t("artwork.prev")}</span>
            </button>
            <div className="min-w-0">
              <Caption index={index} title={plate.title} detail={plate.detail} href={plate.href} centred inline />
            </div>
            <button type="button" onClick={() => go(1)} className="font-mono text-[11px] font-normal lowercase tracking-[0.04em] text-graphite transition-colors hover:text-ink">
              <span className="hidden sm:inline">{t("artwork.next")}</span> →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
