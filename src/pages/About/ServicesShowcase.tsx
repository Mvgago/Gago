import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DevicesFrame from "../../components/Devices/DevicesFrame";
import { EASE_HAUS } from "../../lib/motion";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { BODY, SMALL, TITLE } from "../../lib/type";
import type { Studio } from "../../i18n/studio";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18n";

/**
 * What the studio does, shown rather than listed. One discipline after another down the
 * right; on the left a large frame that stays in place and changes, in a slow dissolve, to an
 * example of the discipline being read: a brand in use, a website, a film, a 3D scene. Under
 * each discipline, the cases where it can be seen. On phones each discipline carries its own
 * example above it.
 */

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// Other brands than the cases: an invented Galician cannery's stand, and the stationery of an
// invented guesthouse on the coast
const SCENES = {
  stand: lazy(() => import("../../components/Stand/CanneryStand")),
  stationery: lazy(() => import("../../components/Identity/StationeryScene")),
};

// The scenes' code is fetched as soon as the page is idle, so by the time a discipline is reached
// only the building is left, not the download
if (typeof window !== "undefined") {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
  window.setTimeout(() => idle(() => {
    void import("../../components/Stand/CanneryStand");
    void import("../../components/Identity/StationeryScene");
  }), 1500);
}

type Example ={ img?: string; video?: string; frame?: string; scene?: keyof typeof SCENES; seen: string[]; link?: string };

// the way into the full example, where an example has one
const OPEN: Record<string, string> = { es: "Recorrer la vivienda en 3D", en: "Walk through the home in 3D", fr: "Parcourir le logement en 3D", de: "Die Wohnung in 3D erkunden" };

// A 3D scene is built only once its frame nears the screen (never while hidden at this width)
const SceneInView: React.FC<{ name: keyof typeof SCENES; paused?: boolean; allowed?: boolean }> = ({ name, paused = false, allowed = true }) => {
  const Scene = SCENES[name] as React.ComponentType<{ className?: string; paused?: boolean }>;
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // a whole screen ahead, so a scene is ready before its discipline is reached
    // (on phones and tablets it is let go again once more than a screen away: several scenes held at once
    // ran a phone out of memory and the page reloaded)
    const release = window.matchMedia("(max-width: 1023px)").matches;
    // (half a screen ahead on phones: ready as it arrives, without building it while another still runs)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? setLoad(true) : release && setLoad(false)), { rootMargin: release ? "50% 0px" : "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="pointer-events-none absolute inset-0">
      {load && allowed && (
        <Suspense fallback={null}>
          <Scene className="h-full w-full" paused={paused} />
        </Suspense>
      )}
    </div>
  );
};


// In the order of the disciplines: film, web and interactive 3D, spaces and events, strategy and identity.
// The film stays first: it is light, and it is what the first screen shows before anything is moved.
// The 3D scenes run on their own; the pointer is left to the page so scrolling over them never sticks
const EXAMPLES: Example[] = [
  { video: "/video/audiovisual.mp4", seen: ["sapphire", "buendia"] },
  // the flat of The Sapphire to walk round: a space in 3D, the discipline's first promise
  { frame: "/concepts/sapphire-home/index.html?bare", seen: ["sapphire", "smarthc", "buendia"], link: "/projects/sapphire#vivienda-3d" },
  { scene: "stand", seen: ["smarthc"] },
  { scene: "stationery", seen: ["smarthc", "sapphire", "buendia"] },
];

const Frame: React.FC<{ ex: Example; note?: string; paused?: boolean; allowed?: boolean; linkLabel?: string }> = ({ ex, note, paused, allowed = true, linkLabel }) => (
  <div className="relative h-full w-full overflow-hidden bg-[#dfe1e2]">
    {ex.img && <img src={ex.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />}
    {ex.video && (
      <>
        <video src={ex.video} poster="/video/audiovisual-poster.jpg" muted loop playsInline autoPlay preload="auto" className="absolute inset-0 h-full w-full object-cover" />
        {/* a fine film grain over the footage, as on the projects page: one texture for every shot */}
        {/* plain, not blended: a blend over a playing film costs the browser a full repaint every frame */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: GRAIN }} />
      </>
    )}
    {ex.scene && <SceneInView name={ex.scene} paused={paused} allowed={allowed} />}
    {ex.frame && <DevicesFrame src={ex.frame} title="3D" paused={paused} allowed={allowed} className="pointer-events-none absolute inset-0 h-full w-full" />}
    {note && (
      <p className={`${SMALL} absolute bottom-3 left-4 normal-case text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]`}>{note}</p>
    )}
    {/* a way straight into the full example: a quiet pill on frosted glass; on hover the glass clears a
        shade and its edge firms, nothing more */}
    {ex.link && (
      <Link
        to={ex.link}
        // (kept small and faint, so the scene leads; it firms up on hover)
        className={`${SMALL} absolute bottom-3 left-3 inline-flex items-center rounded-full border border-ink/5 bg-white/40 px-3 py-1 !text-[11px] text-ink/70 backdrop-blur-sm transition-[background-color,border-color,color] duration-500 hover:border-ink/20 hover:bg-white/80 hover:text-ink`}
      >
        {linkLabel}
      </Link>
    )}
  </div>
);


export const ServicesShowcase: React.FC<{ s: Studio }> = ({ s }) => {
  const EX = EXAMPLES;
  const { lang } = useI18n();
  const linkLabel = OPEN[lang] ?? OPEN.es;
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

  // The tabs' hint plays once, the first time they come into view
  const tabs = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const el = tabs.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = window.setTimeout(() => {
        setHint(true);
        timer = window.setTimeout(() => setHint(false), 4800);
      }, 900);
    }, { threshold: 1 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Loading in turn: on arrival only the film plays, with nothing else building beside it. The 3D
  // examples are built one ahead of the reader, once they have begun to scroll through the disciplines
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const go = () => setMoved(true);
    // the film gets a short head start on its own; then the scenes are built, scrolled or not
    const head = window.setTimeout(go, 2500);
    // listened for in the capture phase: the wheel of disciplines stops the wheel before it bubbles
    window.addEventListener("wheel", go, { once: true, passive: true, capture: true });
    window.addEventListener("touchmove", go, { once: true, passive: true, capture: true });
    window.addEventListener("keydown", go, { once: true, capture: true });
    return () => {
      window.clearTimeout(head);
      window.removeEventListener("wheel", go, { capture: true });
      window.removeEventListener("touchmove", go, { capture: true });
      window.removeEventListener("keydown", go, { capture: true });
    };
  }, []);

  // Phones and tablets: each sheet is held under the header, or, if taller than the screen, once
  // its foot is reached, so all of it is read before the next covers it
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const place = () =>
      items.current.forEach((el) => {
        // held as soon as its example, title, text and list are all on screen (what follows the list, the
        // closing invitation, may pass under the next sheet); if those fit, right under the header
        if (!el) return;
        const list = el.querySelector("ul"), end = list ? list.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 24 : el.offsetHeight;
        el.style.top = mq.matches ? "" : `${Math.min(64, window.innerHeight - end)}px`;
      });
    place();
    const ro = new ResizeObserver(place);
    items.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);

  const noteFor = (i: number) => (EX[i].video ? s.videoNote : undefined);
  // The scenes' files fetched ahead, quietly, once the page has loaded and settled (nothing extra on
  // arrival): their code, the home viewer's page and three.js; the home's models (some 12 MB) only on a
  // wide screen or a fast connection, never when the phone asks to save data. Each scene is still built
  // only as it nears the screen, now from files already here
  useEffect(() => {
    let timer = 0;
    const fetchAhead = () => {
      void import("../../components/Stand/CanneryStand");
      void import("../../components/Identity/StationeryScene");
      const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      const roomy = !net?.saveData && (window.matchMedia("(min-width: 1024px)").matches || net?.effectiveType === "4g");
      const files = ["/concepts/sapphire-home/index.html?bare", "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js"];
      if (roomy) files.push(...["bed30.glb", "sofa.glb", "carpet.glb", "dining.glb", "petate.glb", "bed3.glb", "lounger.glb", "fig.glb", "palm.glb", "towel.glb", "sink.glb", "carpet3.glb"].map((f) => `/models/sapphire/${f}`));
      files.forEach((href) => {
        const l = document.createElement("link");
        l.rel = "prefetch";
        l.href = href;
        document.head.appendChild(l);
      });
    };
    const later = () => {
      timer = window.setTimeout(() => {
        const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 500));
        idle(fetchAhead, { timeout: 4000 });
      }, 2000);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", later);
    };
  }, []);

  const lenis = useLenis();
  // A tab brings its discipline to the middle of the screen
  const goTo = (i: number) => {
    const el = items.current[i];
    if (el) scrollToTarget(lenis, el, { offset: -112 }); // level with the held frame, under the header
  };

  // A wheel of disciplines on large screens: within the four, each turn of the wheel, however
  // small, moves the page a whole step, to the next or the previous discipline, level with the
  // frame; the rest of the wheel's spin is held until it has arrived. Past the first or the last
  // the page scrolls freely again
  useEffect(() => {
    if (!lenis) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    let busy = false;
    let quietTimer = 0;
    const targets = () => items.current.filter(Boolean).map((el) => el!.getBoundingClientRect().top + window.scrollY - 112);
    const go = (y: number) => {
      busy = true;
      lenis.scrollTo(y, {
        // eased in and out: it gathers from rest and settles to rest, never a jolt at either end
        duration: 0.8,
        easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        lock: true,
        force: true,
        onComplete: () => window.setTimeout(() => (busy = false), 120),
      });
    };
    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || Math.abs(e.deltaY) < 1) return;
      const t = targets();
      if (!t.length) return;
      const y = window.scrollY, down = e.deltaY > 0;
      const first = t[0], last = t[t.length - 1];
      // outside the run, or leaving it at either end: the page's own scroll
      if (y < first - 40 && !(down && y > first - window.innerHeight * 0.6)) return;
      if (y > last + 40) return;
      const i = t.reduce((best, v, k) => (Math.abs(v - y) < Math.abs(t[best] - y) ? k : best), 0);
      if (down && i === t.length - 1 && Math.abs(y - last) < 40) return;
      if (!down && i === 0 && Math.abs(y - first) < 40) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      // a trackpad's spin keeps sending: one step per gesture, the next once it has gone quiet
      window.clearTimeout(quietTimer);
      const wasQuiet = !busy;
      quietTimer = window.setTimeout(() => (busy = false), 260);
      if (!wasQuiet) return;
      let next: number;
      if (y < first - 40) next = 0;
      else if (down) next = Math.abs(t[i] - y) > 40 && t[i] > y ? i : Math.min(i + 1, t.length - 1);
      else next = Math.abs(t[i] - y) > 40 && t[i] < y ? i : Math.max(i - 1, 0);
      go(t[next]);
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => {
      window.clearTimeout(quietTimer);
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [lenis]);

  return (
    <section id="servicios" className="grid scroll-mt-24 grid-cols-12 gap-x-8">
      <h2 className="sr-only">{s.disciplinesLabel}</h2>

      {/* The frame, held while the disciplines pass (large screens) */}
      {/* a little wider for the text on small laptops, where four columns left the titles cramped */}
      <div className="col-span-7 hidden lg:block xl:col-span-8">
        <div className="sticky top-28">
          {/* the film's own shape, so no shot loses its top or bottom */}
          {/* out to the screen's left edge, as the work bleeds on the case pages */}
          <div className="relative -ml-8 aspect-video w-[calc(100%+2rem)]">
            {/* All four built once and kept: changing discipline is a quick dissolve between ready
                pictures, never a scene rebuilt from nothing. Only the one on view draws */}
            {EX.map((ex, i) => (
              <div
                key={i}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-opacity duration-300 ease-out ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Frame ex={ex} note={noteFor(i)} paused={i !== active} allowed={i === 0 || moved} linkLabel={linkLabel} />
              </div>
            ))}
          </div>
          {/* The disciplines as tabs under the frame: where we are, and a way straight to any of them */}
          <style>{`@keyframes fh-tabhint{0%{transform:scaleX(0);opacity:1}45%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}@keyframes fh-tablift{0%,100%{color:inherit}45%{color:var(--color-ink)}}`}</style>
          <div ref={tabs} className="mt-5 flex items-start gap-3">
            <div className="grid flex-1 grid-cols-4 gap-3">
              {s.disciplines.map((d, i) => (
                <button
                  key={d.title}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`group -mx-2 cursor-pointer rounded-sm px-2 pb-2.5 text-left outline-none transition-colors duration-300 focus-visible:bg-ink/[0.06] ${i === active ? "text-ink" : "text-ink/45 hover:bg-ink/[0.06] hover:text-ink"}`}
                >
                  {/* the one on view: a thicker line, fully drawn; the others thin, drawing on hover */}
                  <span className={`relative block w-full transition-[height] duration-300 ${i === active ? "h-[2px] bg-ink/15" : "h-px bg-ink/15 group-hover:h-[2px]"}`}>
                    {/* the first time the tabs come into view, a light runs along each of the others
                        in turn, twice, and the label lifts with it: a hint that they can be pressed */}
                    {hint && i !== active && (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-full origin-left bg-ink/45"
                        style={{ animation: `fh-tabhint 1.6s cubic-bezier(.65,0,.35,1) ${0.35 * i}s 2 both` }}
                      />
                    )}
                    <span
                      // only the one on view is drawn dark; those already read keep a paler line
                      className={`absolute inset-y-0 left-0 transition-[width,background-color] duration-700 ease-haus ${
                        i === active ? "w-full bg-ink" : i < active ? "w-full bg-ink/30" : "w-0 bg-ink/50 group-hover:w-full"
                      }`}
                    />
                  </span>
                  <span
                    className={`${SMALL} mt-3 flex items-center gap-2`}
                    style={hint && i !== active ? { animation: `fh-tablift 1.6s cubic-bezier(.65,0,.35,1) ${0.35 * i}s 2 both` } : undefined}
                  >
                    {/* a small dot marks the one on view */}
                    <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full bg-ink transition-[opacity,transform,width] duration-500 ${i === active ? "scale-100 opacity-100" : "-mr-2 w-0 scale-0 opacity-0"}`} />
                    <span>
                      {String(i + 1).padStart(2, "0")} {d.title.toLowerCase()}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The disciplines, a screen each on large screens, a hairline between one and the next */}
      {/* on a clean ground of its own, out to the screen's right edge: the room's light stays behind the frame */}
      <div className="relative z-10 col-span-12 lg:col-span-5 lg:-ml-8 lg:-mr-8 lg:bg-[#efeef0] lg:pl-16 lg:pr-8 xl:col-span-4">
        {s.disciplines.map((d, i) => {
          return (
            <div
              key={d.title}
              id={`disciplina-${i}`}
              data-i={i}
              ref={(el) => (items.current[i] = el)}
              // a whole screen each on large screens, its title at the top, level with the frame; a line
              // above each after the first, so it is clear where one ends and the next begins
              // On phones and tablets each is a sheet of its own, a screen tall: held in place once read
              // through, while the next slides up over it, so two disciplines never run together
              className={`sticky -mx-4 flex min-h-[calc(100svh-64px)] flex-col bg-[#efeef0] px-4 pb-8 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:static lg:mx-0 lg:min-h-[calc(100svh-112px)] lg:justify-start lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-8 lg:shadow-none ${i > 0 ? "shadow-[0_-18px_30px_-20px_rgba(0,0,0,0.22)] lg:border-t lg:border-ink/20" : ""}`}
              style={{ zIndex: i + 1 }}
            >
              {/* phones and tablets: the example sits above its discipline, edge to edge */}
              {/* held under the header while its text is read, the text passing beneath it, as the
                  shorter sheets are held whole (those taller than the screen used to let it scroll away) */}
              {/* phones and tablets: the sheet is one screen, the text and its three services at their own height
                  and the example filling whatever room is left above them, so nothing is cut and no gap is left */}
              <div className="max-lg:flex max-lg:flex-1 max-lg:flex-col">
              {/* (never much taller than its own landscape shape, so a film is not cut away at the sides) */}
              <div className="relative -mx-4 mb-6 max-h-[64vw] min-h-[24svh] flex-1 bg-[#efeef0] sm:-mx-6 md:-mx-8 lg:hidden">
                {/* no note over the film here: on a phone it only crowded the picture */}
                {/* (set over the whole box: a height in % inside a flexible box resolves to nothing) */}
                {EX[i] && (
                  <div className="absolute inset-0">
                    <Frame ex={EX[i]} linkLabel={linkLabel} />
                  </div>
                )}
              </div>
              <div className={`transition-opacity duration-700 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
                {/* where we are, as a dial: the number inside a hairline ring, and round it the part of the
                    four already read, drawing itself on as the discipline arrives */}
                {/* phones: the place in the four as a plain figure, the ring took too much room */}
                <p className={`${SMALL} text-graphite lg:hidden`}>
                  {String(i + 1).padStart(2, "0")} / {String(s.disciplines.length).padStart(2, "0")}
                </p>
                <div className="hidden items-center gap-3 lg:flex" aria-label={`${i + 1} / ${s.disciplines.length}`}>
                  <span aria-hidden className="relative grid h-11 w-11 place-items-center">
                    <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
                      <circle cx="22" cy="22" r="20.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink/15" />
                      <circle
                        cx="22"
                        cy="22"
                        r="20.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 1"
                        className="text-ink transition-[stroke-dashoffset] duration-[1100ms] ease-haus"
                        style={{ strokeDashoffset: i === active ? 1 - (i + 1) / s.disciplines.length : 1, transitionDelay: i === active ? "200ms" : "0ms" }}
                      />
                    </svg>
                    {/* the figure alone: both faces dot their zero, and in a ring a 0 read as an 8 */}
                    <span className="font-geo text-[15px] font-normal leading-none text-ink">{i + 1}</span>
                  </span>
                </div>
                {/* as the discipline arrives its title rises word by word out of an unseen mask */}
                <h3 className={`${TITLE} mt-5 text-ink`} aria-label={d.title}>
                  {d.title.split(" ").map((w, k) => (
                    <React.Fragment key={k}>
                      {k > 0 && " "}
                      <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                        <span
                          className={`inline-block transition-transform duration-[900ms] ease-haus ${i === active ? "translate-y-0" : "lg:translate-y-[110%]"}`}
                          style={{ transitionDelay: i === active ? `${120 + k * 90}ms` : "0ms" }}
                        >
                          {w}
                        </span>
                      </span>
                    </React.Fragment>
                  ))}
                </h3>
                <p className={`${BODY} mt-6 max-w-[42ch] text-ink/80`}>{d.text}</p>
              </div>
              </div>
              {/* from here on the frame has let go: the list, and the invitation after the last, are read whole */}
              <div className={`transition-opacity duration-700 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
                {d.list && (
                  // what is delivered, the part to read: larger, in full ink, each with its number
                  // As the discipline arrives its services come in one after another, each line drawing
                  // itself across; on hover a line fills in ink and its words step a touch to the right
                  // (tighter on phones, so each sheet fits under the header whole)
                  <ul className="mt-6 max-w-[44ch] lg:mt-9">
                    {d.list.map((item, k) => {
                      const on = i === active;
                      const delay = on ? `${250 + k * 130}ms` : "0ms";
                      return (
                        <li key={item} className="group/svc relative py-2.5 lg:py-4">
                          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-ink/15" />
                          <span
                            aria-hidden
                            className={`absolute left-0 top-0 h-px origin-left bg-ink/45 transition-transform duration-[900ms] ease-haus group-hover/svc:bg-ink ${on ? "scale-x-100" : "lg:scale-x-0"}`}
                            style={{ transitionDelay: delay, width: "100%" }}
                          />
                          <span
                            className={`flex items-baseline gap-5 transition-[opacity,transform] duration-700 ease-haus ${on ? "translate-y-0 opacity-100" : "lg:translate-y-2 lg:opacity-0"}`}
                            style={{ transitionDelay: delay }}
                          > 
                            <span className="font-geo text-[1.12rem] font-normal leading-snug tracking-[0.01em] text-ink transition-transform duration-500 ease-haus group-hover/svc:translate-x-1.5">
                              {item}
                            </span>
                          </span>
                          {k === d.list!.length - 1 && <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-ink/15" />}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {/* at the end of the four, an invitation that comes in once the last is reached */}
                {i === s.disciplines.length - 1 && (
                  <div className="mt-14">
                    <p className="font-geo text-[1.5rem] font-normal leading-snug text-ink">
                      {s.endTitle.split(" ").map((w, k) => (
                        <React.Fragment key={k}>
                          {k > 0 && " "}
                          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                            <span
                              className={`inline-block transition-transform duration-[900ms] ease-haus ${i === active ? "translate-y-0" : "lg:translate-y-[110%]"}`}
                              style={{ transitionDelay: i === active ? `${700 + k * 90}ms` : "0ms" }}
                            >
                              {w}
                            </span>
                          </span>
                        </React.Fragment>
                      ))}
                    </p>
                    <div
                      className={`mt-6 flex items-center gap-6 transition-[opacity,transform] duration-700 ease-haus ${i === active ? "translate-y-0 opacity-100" : "lg:pointer-events-none lg:translate-y-2 lg:opacity-0"}`}
                      style={{ transitionDelay: i === active ? "1150ms" : "0ms" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          // to the form, as the page's own "let's talk" does: the smooth scroll forced past
                          // the disciplines' wheel (which holds the page while it steps), the native one as a fallback
                          const el = document.getElementById("contact");
                          if (!el) return;
                          if (lenis) { lenis.start(); lenis.scrollTo(el, { offset: window.innerWidth < 640 ? 0 : -96, force: true, duration: 1.2 }); }
                          else el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`${SMALL} cursor-pointer rounded-full border border-ink/25 px-5 py-2.5 text-ink transition-[background-color,border-color] duration-300 hover:border-ink/40 hover:bg-ink/[0.05]`}
                      >
                        {s.endTalk}
                      </button>
                      {/* and beside it, for whoever wants to see before talking: the projects */}
                      <Link to="/projects" className={`${SMALL} group relative text-ink`}>
                        {s.endWork}
                        <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
                        <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
                      </Link>
                    </div>
                  </div>
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
                    <span className={`${SMALL} text-ink/80`}>{s.scrollHint}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>    </section>
  );
};

/**
 * The process as four numbered steps: a hairline draws itself above each as it comes into
 * view, one after another, so the page moves as it is read.
 */
export const ProcessSteps: React.FC<{ steps: { title: string; text: string }[] }> = ({ steps }) => (
  <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-8 2xl:grid-cols-4">
    {steps.map((p, i) => (
      <motion.div
        key={p.title}
        className="relative isolate"
        initial="off"
        whileInView="on"
        viewport={{ once: true, margin: "-12% 0px" }}
      >
        {/* On arrival the four light up one after another, quickly, like the keys of a lit
            keyboard: a soft glow comes up behind each and fades as the next takes it */}
        {/* each time the steps come into view: a pale plate lifts behind the step, its shadow soft,
            and its line lights up in ink, then both settle as the next one lights */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-x-5 -bottom-6 -top-5 -z-10 rounded-xl"
          style={{
            background: "radial-gradient(120% 90% at 50% 30%, #ffffff 0%, #fbfbfd 55%, #f3f3f6 100%)",
            boxShadow: "0 22px 50px -14px rgba(40,38,48,0.32), 0 0 0 1px rgba(40,38,48,0.08), 0 0 60px 6px rgba(255,255,255,0.95)",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 1, 0], transition: { duration: 1.3, delay: 0.15 + i * 0.2, times: [0, 0.18, 0.55, 1], ease: "easeInOut" } }}
          viewport={{ once: false, margin: "-20% 0px" }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-ink"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 1, 0], transition: { duration: 1.3, delay: 0.15 + i * 0.2, times: [0, 0.18, 0.55, 1], ease: "easeInOut" } }}
          viewport={{ once: false, margin: "-20% 0px" }}
        />
        <motion.span
          aria-hidden
          className="block h-px origin-left bg-ink/60"
          variants={{ off: { scaleX: 0 }, on: { scaleX: 1, transition: { duration: 1.1, delay: i * 0.18, ease: EASE_HAUS } } }}
        />
        <motion.div
          variants={{ off: { opacity: 0, y: 12 }, on: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.3 + i * 0.18, ease: EASE_HAUS } } }}
        >
          <p className={`${SMALL} mt-5 text-graphite`}>{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 font-geo text-[1.2rem] font-normal leading-snug tracking-[0.02em] text-ink">{p.title}</h3>
          <p className={`${BODY} mt-3 text-ink/80`}>{p.text}</p>
        </motion.div>
      </motion.div>
    ))}
  </div>
);
