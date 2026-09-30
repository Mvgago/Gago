import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { artwork } from "../../outils/artwork";
import { EASE_HAUS, EASE_VEIL, rise } from "../../lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");

export const ArtworkPage: React.FC = () => {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const total = artwork.length;

  const go = useCallback(
    (step: number) => setState(([i]) => [(i + step + total) % total, step]),
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = artwork[index];

  return (
    <main className="px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
      <header className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.p variants={rise} initial="hidden" animate="shown" className="meta text-graphite">
            02 — experiments &amp; 3d
          </motion.p>
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className="text-satin mt-3 font-display text-[13vw] leading-[0.95] tracking-[-0.03em] md:text-[8vw]"
          >
            artwork
          </motion.h1>
        </div>
        <motion.p variants={rise} initial="hidden" animate="shown" custom={2} className="meta text-graphite">
          use ← → to move through the plates
        </motion.p>
      </header>

      {/* Viewing room */}
      <section className="relative">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[680px] sm:aspect-square md:aspect-[16/10] md:max-w-none">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={current.id}
              src={current.url}
              alt={`Artwork plate ${pad(index + 1)}`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_40px_50px_rgba(40,30,22,0.35)]"
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.98 }),
                center: { opacity: 1, x: 0, scale: 1, transition: { duration: 1.4, ease: EASE_HAUS } },
                exit: (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.8, ease: EASE_VEIL } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
            />
          </AnimatePresence>

          {/* Invisible halves double as navigation on touch and desktop */}
          <button
            type="button"
            aria-label="Previous plate"
            onClick={() => go(-1)}
            className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize"
          />
          <button
            type="button"
            aria-label="Next plate"
            onClick={() => go(1)}
            className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize"
          />
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-4 text-graphite">
          <button type="button" onClick={() => go(-1)} className="meta transition-colors hover:text-ink">
            ← prev
          </button>

          <div className="flex items-center gap-4">
            <span className="meta tabular-nums text-ink">{pad(index + 1)}</span>
            <span className="relative h-px w-24 bg-ink/15 sm:w-40">
              <motion.span
                className="absolute inset-y-0 left-0 bg-ink"
                animate={{ width: `${((index + 1) / total) * 100}%` }}
                transition={{ duration: 1.2, ease: EASE_HAUS }}
              />
            </span>
            <span className="meta tabular-nums">{pad(total)}</span>
          </div>

          <button type="button" onClick={() => go(1)} className="meta transition-colors hover:text-ink">
            next →
          </button>
        </div>
      </section>
    </main>
  );
};
