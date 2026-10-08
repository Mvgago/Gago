import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import DevicesFrame from "../../components/Devices/DevicesFrame";
import { cases } from "../../outils/cases";
import { EASE_HAUS } from "../../lib/motion";
import { ACTION, BODY, SMALL, TITLE } from "../../lib/type";
import type { Studio } from "../../i18n/studio";
import identityImg from "../../assets/peojects/saphire/saphire (10).jpg";
import webImg from "../../assets/peojects/buendia/buendia-laptop-web.jpg";

/**
 * What the studio does, shown rather than listed. One discipline after another down the
 * right; on the left a large frame that stays in place and changes, in a slow dissolve, to an
 * example of the discipline being read: a brand in use, a website, a film, a 3D scene. Under
 * each discipline, the cases where it can be seen. On phones each discipline carries its own
 * example above it.
 */

type Example = { img?: string; video?: string; frame?: string; seen: string[] };

// In the order of the disciplines: identity, web, video, interactive 3D
const EXAMPLES: Example[] = [
  { img: identityImg, seen: ["sapphire", "smarthc", "buendia"] },
  { img: webImg, seen: ["buendia", "sapphire"] },
  { video: "/video/interiors.mp4", seen: ["sapphire", "buendia"] },
  // the scene runs on its own; the pointer is left to the page so scrolling over it never sticks
  { frame: "/concepts/smarthc-devices/index.html", seen: ["smarthc", "buendia"] },
];

const titleOf = (slug: string) => cases.find((c) => c.slug === slug && !c.hidden)?.title;

const Frame: React.FC<{ ex: Example; note?: string }> = ({ ex, note }) => (
  <div className="relative h-full w-full overflow-hidden bg-[#dfe1e2]">
    {ex.img && <img src={ex.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />}
    {ex.video && (
      <video src={ex.video} muted loop playsInline autoPlay preload="auto" className="absolute inset-0 h-full w-full object-cover" />
    )}
    {ex.frame && <DevicesFrame src={ex.frame} title="3D" className="pointer-events-none absolute inset-0 h-full w-full" />}
    {note && (
      <p className={`${SMALL} absolute bottom-3 left-4 normal-case text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]`}>{note}</p>
    )}
  </div>
);

// The story-telling work first, then what sets the studio apart, then the foundations
const ORDER = [2, 3, 1, 0]; // video, interactive 3D, web, identity

export const ServicesShowcase: React.FC<{ s: Studio }> = ({ s: studio }) => {
  const s = { ...studio, disciplines: ORDER.map((k) => studio.disciplines[k]).filter(Boolean) };
  const EX = ORDER.map((k) => EXAMPLES[k]);
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLDivElement | null)[]>([]);

  // The discipline crossing the middle of the screen is the one on view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const noteFor = (i: number) => (EX[i].video ? s.videoNote : undefined);

  return (
    <section className="grid scroll-mt-24 grid-cols-12 gap-x-8 border-t border-ink/10 pt-10 md:pt-12">
      <h2 className={`${SMALL} col-span-12 mb-8 text-graphite`}>{s.disciplinesLabel}</h2>

      {/* The frame, held while the disciplines pass (large screens) */}
      <div className="col-span-7 hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[16/10] w-full">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_HAUS } }}
                exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE_HAUS } }}
              >
                <Frame ex={EX[active]} note={noteFor(active)} />
              </motion.div>
            </AnimatePresence>
          </div>
          {/* where we are: one mark per discipline */}
          <div aria-hidden className="mt-4 flex gap-2">
            {s.disciplines.map((_, i) => (
              <span
                key={i}
                className={`h-px flex-1 transition-colors duration-700 ${i === active ? "bg-ink" : "bg-ink/15"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* The disciplines, about half a screen each on large screens: room for the frame to change */}
      <div className="col-span-12 lg:col-span-5">
        {s.disciplines.map((d, i) => {
          const seen = EX[i]?.seen.map((slug) => ({ slug, title: titleOf(slug) })).filter((p) => p.title) ?? [];
          return (
            <div
              key={d.title}
              data-i={i}
              ref={(el) => (items.current[i] = el)}
              className="flex flex-col justify-center pb-20 lg:min-h-[56vh] lg:pb-0 lg:first:justify-start lg:last:min-h-[44vh]"
            >
              {/* phones and tablets: the example sits above its discipline */}
              <div className="mb-8 aspect-[16/10] w-full lg:hidden">
                {EX[i] && <Frame ex={EX[i]} note={noteFor(i)} />}
              </div>
              <div className={`transition-opacity duration-700 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
                <p className={`${SMALL} text-graphite`}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`${TITLE} mt-4 text-ink`}>{d.title}</h3>
                <p className={`${BODY} mt-6 max-w-[42ch] text-graphite`}>{d.text}</p>
                {seen.length > 0 && (
                  <p className={`${ACTION} mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-graphite`}>
                    <span>{s.seenIn}</span>
                    {seen.map((p, k) => (
                      <React.Fragment key={p.slug}>
                        {k > 0 && <span aria-hidden>·</span>}
                        <Link
                          to={`/projects/${p.slug}`}
                          className="text-ink underline decoration-ink/25 underline-offset-[5px] transition-colors duration-500 hover:decoration-ink"
                        >
                          {p.title!.toLowerCase()}
                        </Link>
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/**
 * The process as four numbered steps: a hairline draws itself above each as it comes into
 * view, one after another, so the page moves as it is read.
 */
export const ProcessSteps: React.FC<{ steps: { title: string; text: string }[] }> = ({ steps }) => (
  <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
    {steps.map((p, i) => (
      <motion.div
        key={p.title}
        initial="off"
        whileInView="on"
        viewport={{ once: true, margin: "-12% 0px" }}
      >
        <motion.span
          aria-hidden
          className="block h-px origin-left bg-ink/40"
          variants={{ off: { scaleX: 0 }, on: { scaleX: 1, transition: { duration: 1.1, delay: i * 0.18, ease: EASE_HAUS } } }}
        />
        <motion.div
          variants={{ off: { opacity: 0, y: 12 }, on: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.3 + i * 0.18, ease: EASE_HAUS } } }}
        >
          <p className={`${SMALL} mt-5 text-graphite`}>{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 font-geo text-[1.1rem] font-light leading-snug tracking-[0.02em] text-ink">{p.title}</h3>
          <p className={`${BODY} mt-3 text-graphite`}>{p.text}</p>
        </motion.div>
      </motion.div>
    ))}
  </div>
);
