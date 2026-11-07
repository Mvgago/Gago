import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { scrollToTarget, useLenis } from "../SmoothScroll/SmoothScroll";

export type DrumPlate = { id: string; url: string; title?: string; grade?: string; crop?: number; cropAt?: string };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The illustrations on a small see-through drum, set to the right, with their names listed on the left:
 * flat upright cards round a cylinder turning about a horizontal axis, as a watch's crown turns a list.
 * The scroll turns it as the finger moves it; once still, the drum itself settles on the nearest card
 * (the page is never moved under the finger). The card in front stands a touch larger; a tap opens it
 * large over the wheel, without filling the screen. Plain CSS 3D, transforms only.
 */
export const IllustrationDrum: React.FC<{
  plates: DrumPlate[];
  faces?: number;
  title: (plate: DrumPlate, i: number) => string;
  alt: (plate: DrumPlate) => string;
  detail?: (plate: DrumPlate, i: number) => string | undefined;
  register?: (i: number, el: HTMLButtonElement | null) => void;
  protect?: React.ImgHTMLAttributes<HTMLImageElement>;
}> = ({ plates, faces = 8, title, alt, detail, register, protect }) => {
  const box = useRef<HTMLDivElement>(null);
  const still = !!useReducedMotion();
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start start", "end end"] });
  const STEP = 360 / faces;

  // where the drum is headed: the scroll while it moves, the nearest card once it stops
  const target = useMotionValue(0);
  const idle = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = p * (faces - 1);
    target.set(n);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => target.set(Math.round(n)), 120);
  });
  useEffect(() => () => window.clearTimeout(idle.current), []);
  // a quick, damped follow: close on the finger while scrolling, a soft landing on the card
  const turn = useSpring(target, { stiffness: 240, damping: 30, mass: 0.5 });
  const ring = useTransform(turn, (n) => `translateZ(calc(var(--r) * -1)) rotateX(${still ? 0 : -n * STEP}deg)`);

  const [cur, setCur] = useState(0);
  useMotionValueEvent(turn, "change", (n) => {
    const k = (((Math.round(n) % faces) + faces) % faces) % plates.length;
    setCur((c) => (c === k ? c : k));
  });

  const [zoom, setZoom] = useState<number | null>(null);
  // a scroll closes the enlarged piece; so does Escape
  useMotionValueEvent(scrollYProgress, "change", () => zoom !== null && setZoom(null));
  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  // a name in the list turns the drum to its piece
  const goTo = (k: number) => {
    const el = box.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const n = Math.round(turn.get());
    // the nearest face showing that piece
    let best = n, bestD = Infinity;
    for (let f = 0; f < faces; f++) if (f % plates.length === k) {
      const d = Math.abs(f - n);
      if (d < bestD) { bestD = d; best = f; }
    }
    scrollToTarget(lenis, top + (best / (faces - 1)) * span);
  };

  const shown = zoom ?? cur;
  return (
    <div ref={box} className="relative h-[240svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-10">
          {/* the names, the one in front lit */}
          <ol className="flex flex-col gap-3 md:gap-4">
            {plates.map((p, k) => (
              <li key={p.id}>
                <button
                  ref={(n) => register?.(k, n)}
                  type="button"
                  onClick={() => (k === cur ? setZoom(k) : goTo(k))}
                  className={`group flex items-baseline gap-3 text-left transition-[color,opacity] duration-500 ${k === cur ? "text-platinum" : "text-platinum/35 hover:text-platinum/70"}`}
                >
                  <span className="font-mono text-[10px] tracking-[0.15em] md:text-[11px]">{String(k + 1).padStart(2, "0")}</span>
                  <span className="font-geo text-[15px] leading-tight md:text-[1.35rem]">{title(p, k)}</span>
                </button>
              </li>
            ))}
          </ol>

          {/* the drum */}
          <div
            className="relative flex h-[74svh] items-center justify-center [perspective:calc(var(--h)*5)] [--h:min(44vw,38svh)] md:[--h:min(26vw,52svh,420px)]"
            style={{
              width: "calc(var(--h) * 0.8 * 1.25)",
              maskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
            }}
          >
            <motion.div
              className="relative [--r:calc(var(--h)*1.95)] [transform-style:preserve-3d]"
              style={{ width: "calc(var(--h) * 0.8)", height: "var(--h)", transform: ring, willChange: "transform" }}
            >
              {Array.from({ length: faces }, (_, f) => (
                <Card
                  key={f}
                  f={f}
                  step={STEP}
                  turn={turn}
                  still={still}
                  plate={plates[f % plates.length]}
                  onOpen={() => setZoom(f % plates.length)}
                  alt={alt}
                  protect={protect}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* the piece enlarged over the wheel, not filling the screen; a tap anywhere closes it */}
        <AnimatePresence>
          {zoom !== null && (
            <motion.div
              key="zoom"
              className="absolute inset-0 z-10 flex cursor-zoom-out flex-col items-center justify-center bg-[#1c1b20]/70 px-6 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              onClick={() => setZoom(null)}
              role="dialog"
              aria-label={title(plates[shown], shown)}
            >
              <motion.img
                src={plates[shown].url}
                alt={alt(plates[shown])}
                draggable={false}
                {...(protect as object)}
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.6, ease }}
                style={{ filter: plates[shown].grade }}
                className="aspect-[4/5] w-[min(76vw,58svh,520px)] rounded-[12px] object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
              />
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.15 }}
                className="mt-4 text-center font-geo text-[14px] text-platinum/85"
              >
                {title(plates[shown], shown)}
                {detail?.(plates[shown], shown) && <span className="ml-2 font-mono text-[11px] text-platinum/45">{detail(plates[shown], shown)}</span>}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Card: React.FC<{
  f: number;
  step: number;
  turn: MotionValue<number>;
  still: boolean;
  plate: DrumPlate;
  onOpen: () => void;
  alt: (p: DrumPlate) => string;
  protect?: React.ImgHTMLAttributes<HTMLImageElement>;
}> = ({ f, step, turn, still, plate, onOpen, alt, protect }) => {
  // the card in front stands a touch larger than the rest
  const transform = useTransform(turn, (n) => {
    let d = (f - n) % (360 / step);
    const N = 360 / step;
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    const s = still ? 1 : 1 + 0.12 * Math.max(0, 1 - Math.abs(d));
    return `rotateX(${f * step}deg) translateZ(var(--r)) scale(${s})`;
  });
  const img = (shade: boolean) => (
    <img
      src={plate.url}
      alt={shade ? "" : alt(plate)}
      loading="lazy"
      decoding="async"
      draggable={false}
      {...protect}
      style={{
        filter: [plate.grade, shade ? "brightness(0.3) saturate(0.7)" : ""].filter(Boolean).join(" ") || undefined,
        transform: plate.crop ? `scale(${plate.crop})` : undefined,
        transformOrigin: plate.cropAt,
      }}
      className="h-full w-full object-cover"
    />
  );
  return (
    <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform }}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onOpen}
        className="absolute inset-0 cursor-zoom-in overflow-hidden rounded-[8px] bg-[#33303c] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.6)] [backface-visibility:hidden]"
      >
        {img(false)}
      </button>
      {/* its back, glimpsed on the far side through the gaps: in deep shade, and narrower */}
      <div aria-hidden className="absolute inset-x-[12%] inset-y-0 overflow-hidden rounded-[8px] [backface-visibility:hidden]" style={{ transform: "rotateX(180deg)" }}>
        {img(true)}
      </div>
    </motion.div>
  );
};
