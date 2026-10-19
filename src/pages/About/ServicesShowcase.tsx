import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DevicesFrame from "../../components/Devices/DevicesFrame";
import { EASE_HAUS } from "../../lib/motion";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { BODY, SMALL, TITLE } from "../../lib/type";
import type { Studio } from "../../i18n/studio";
import identityImg from "../../assets/peojects/saphire/saphire (10).jpg";

/**
 * What the studio does, shown rather than listed. One discipline after another down the
 * right; on the left a large frame that stays in place and changes, in a slow dissolve, to an
 * example of the discipline being read: a brand in use, a website, a film, a 3D scene. Under
 * each discipline, the cases where it can be seen. On phones each discipline carries its own
 * example above it.
 */

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

type Example ={ img?: string; video?: string; frame?: string; seen: string[] };

// In the order of the disciplines: audiovisual, web and 3D, spaces and events, strategy and identity.
// The 3D scenes run on their own; the pointer is left to the page so scrolling over them never sticks
const EXAMPLES: Example[] = [
  { video: "/video/audiovisual.mp4", seen: ["sapphire", "buendia"] },
  { frame: "/concepts/smarthc-devices/index.html?bare", seen: ["smarthc", "buendia", "sapphire"] },
  { frame: "/concepts/smarthc-stand/index.html?bare", seen: ["smarthc"] },
  { img: identityImg, seen: ["smarthc", "sapphire", "buendia"] },
];

const Frame: React.FC<{ ex: Example; note?: string }> = ({ ex, note }) => (
  <div className="relative h-full w-full overflow-hidden bg-[#dfe1e2]">
    {ex.img && <img src={ex.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />}
    {ex.video && (
      <>
        <video src={ex.video} muted loop playsInline autoPlay preload="auto" className="absolute inset-0 h-full w-full object-cover" />
        {/* a fine film grain over the footage, as on the projects page: one texture for every shot */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      </>
    )}
    {ex.frame && <DevicesFrame src={ex.frame} title="3D" className="pointer-events-none absolute inset-0 h-full w-full" />}
    {note && (
      <p className={`${SMALL} absolute bottom-3 left-4 normal-case text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]`}>{note}</p>
    )}
  </div>
);


export const ServicesShowcase: React.FC<{ s: Studio }> = ({ s }) => {
  const EX = EXAMPLES;
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
  const lenis = useLenis();
  // A tab brings its discipline to the middle of the screen
  const goTo = (i: number) => {
    const el = items.current[i];
    if (el) scrollToTarget(lenis, el, { offset: -112 }); // level with the held frame, under the header
  };

  return (
    <section className="grid scroll-mt-24 grid-cols-12 gap-x-8">
      <h2 className="sr-only">{s.disciplinesLabel}</h2>

      {/* The frame, held while the disciplines pass (large screens) */}
      <div className="col-span-8 hidden lg:block">
        <div className="sticky top-28">
          {/* the film's own shape, so no shot loses its top or bottom */}
          <div className="relative aspect-video w-full">
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
          {/* The disciplines as tabs under the frame: where we are, and a way straight to any of them */}
          <div className="mt-5 flex items-start gap-3">
            <div className="grid flex-1 grid-cols-4 gap-3">
              {s.disciplines.map((d, i) => (
                <button
                  key={d.title}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`group -mx-2 cursor-pointer rounded-sm px-2 pb-2 text-left outline-none transition-colors duration-500 hover:bg-ink/[0.045] focus-visible:bg-ink/[0.06] ${i === active ? "text-ink" : "text-ink/45 hover:text-ink"}`}
                >
                  <span className="relative block h-px w-full bg-ink/15">
                    <span
                      className={`absolute inset-y-0 left-0 bg-ink transition-[width] duration-700 ease-haus ${
                        i <= active ? "w-full" : "w-0 group-hover:w-full group-hover:bg-ink/50"
                      }`}
                    />
                  </span>
                  <span className={`${SMALL} mt-3 block`}>
                    {String(i + 1).padStart(2, "0")} {d.title.toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The disciplines, about half a screen each on large screens: room for the frame to change */}
      {/* the room below the last keeps the frame held until the last discipline has been read */}
      <div className="col-span-12 lg:col-span-4 lg:pb-[30vh]">
        {s.disciplines.map((d, i) => {
          return (
            <div
              key={d.title}
              data-i={i}
              ref={(el) => (items.current[i] = el)}
              className="flex flex-col justify-center pb-20 lg:min-h-[60vh] lg:pb-0 lg:first:justify-start"
            >
              {/* phones and tablets: the example sits above its discipline */}
              <div className="mb-8 aspect-video w-full lg:hidden">
                {EX[i] && <Frame ex={EX[i]} note={noteFor(i)} />}
              </div>
              <div className={`transition-opacity duration-700 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
                <p className={`${SMALL} text-graphite`}>{String(i + 1).padStart(2, "0")} / {String(s.disciplines.length).padStart(2, "0")}</p>
                <h3 className={`${TITLE} mt-4 text-ink`}>{d.title}</h3>
                <p className={`${BODY} mt-6 max-w-[42ch] text-graphite`}>{d.text}</p>
                {d.list && (
                  <ul className="ml-6 mt-7 max-w-[40ch] border-b border-ink/20 lg:ml-10">
                    {d.list.map((item) => (
                      <li key={item} className={`${BODY} border-t border-ink/20 py-3 text-ink`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {/* on arrival, a plain word that the others follow below */}
                {i === 0 && (
                  <div className={`mt-14 hidden items-center gap-5 transition-opacity duration-700 lg:flex ${active === 0 ? "opacity-100" : "opacity-0"}`}>
                    {/* a mouse, its wheel rolling down, and a line that keeps drawing itself downwards */}
                    <style>{`@keyframes fh-wheel{0%{transform:translateY(0);opacity:0}20%{opacity:1}70%{transform:translateY(9px);opacity:0}100%{opacity:0}}@keyframes fh-draw{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}`}</style>
                    <span aria-hidden className="relative flex h-9 w-[22px] justify-center rounded-full border border-ink/40">
                      <span className="mt-[7px] h-[6px] w-[2px] rounded-full bg-ink" style={{ animation: "fh-wheel 1.8s cubic-bezier(.4,0,.2,1) infinite" }} />
                    </span>
                    <span aria-hidden className="relative h-12 w-px overflow-hidden bg-ink/10">
                      <span className="absolute inset-0 bg-ink/60" style={{ animation: "fh-draw 2.4s cubic-bezier(.65,0,.35,1) infinite" }} />
                    </span>
                    <span className={`${SMALL} text-graphite`}>{s.scrollHint}</span>
                  </div>
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
