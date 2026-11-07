import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { scrollToTarget, useLenis } from "../SmoothScroll/SmoothScroll";

export type DrumPlate = { id: string; url: string; title?: string; grade?: string; crop?: number; cropAt?: string };

/**
 * The illustrations on a see-through drum turning about a horizontal axis, as a watch's crown turns its
 * list: flat cards round a cylinder, the one in front facing the viewer, those above and below folding
 * away, and through the gaps between them the cards on the far side of the drum, smaller and in shade.
 * It turns with the scroll as the finger moves it, freely, and once let go it settles on the nearest card,
 * as a clock's hour wheel does. Plain CSS 3D (transforms only), so it turns smoothly on any phone.
 */
export const IllustrationDrum: React.FC<{
  plates: DrumPlate[];
  /** how many cards round the drum: the plates repeat until it is full */
  faces?: number;
  label: (plate: DrumPlate, i: number) => string;
  alt: (plate: DrumPlate) => string;
  caption: (plate: DrumPlate, i: number) => string;
  onOpen: (i: number) => void;
  register?: (i: number, el: HTMLButtonElement | null) => void;
  protect?: React.ImgHTMLAttributes<HTMLImageElement>;
}> = ({ plates, faces = 10, label, alt, caption, onOpen, register, protect }) => {
  const box = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start start", "end end"] });
  const STEP = 360 / faces;
  // the drum follows the scroll directly: no easing of its own, so it never lags the finger
  const turnTo = useTransform(scrollYProgress, (p) => p * faces);
  const ring = useTransform(turnTo, (n) => `translateZ(calc(var(--r) * -1)) rotateX(${still ? 0 : -n * STEP}deg)`);

  // Once let go, it settles on the nearest card. On touch screens the browser's own scroll snapping does
  // it (the snap points below), with the phone's own feel; with the site's smooth wheel scrolling, the
  // wheel is eased onto the card a moment after it stops.
  const lenis = useLenis();
  useEffect(() => {
    if (still) return;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const html = document.documentElement;
    if (touch) {
      const prev = html.style.scrollSnapType;
      html.style.scrollSnapType = "y proximity";
      return () => {
        html.style.scrollSnapType = prev;
      };
    }
    let idle = 0;
    const settle = () => {
      const el = box.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      const y = window.scrollY - top;
      if (y < -4 || y > span + 4) return;
      const step = span / faces;
      const to = top + Math.round(y / step) * step;
      if (Math.abs(to - window.scrollY) > 1) scrollToTarget(lenis, to);
    };
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [faces, lenis, still]);

  return (
    <div ref={box} className="relative h-[340svh]">
      {/* where the wheel rests: a card in front at each */}
      {Array.from({ length: faces + 1 }, (_, k) => (
        <span
          key={k}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px [scroll-snap-align:start]"
          style={{ top: `calc((340svh - 100svh) * ${k / faces})` }}
        />
      ))}
      <div
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [perspective:calc(var(--h)*5.2)] [--h:min(70vw,58svh,340px)] lg:[--h:min(38vw,62svh,440px)]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        }}
      >
        <motion.div
          className="relative [--r:calc(var(--h)*2.12)] [transform-style:preserve-3d]"
          // the cards upright, 4 by 5
          style={{ width: "calc(var(--h) * 0.8)", height: "var(--h)", transform: ring, willChange: "transform" }}
        >
          {Array.from({ length: faces }, (_, f) => {
            const k = f % plates.length;
            const plate = plates[k];
            const first = f < plates.length;
            const img = (shade: boolean) => (
              <img
                src={plate.url}
                alt={first && !shade ? alt(plate) : ""}
                loading="lazy"
                decoding="async"
                draggable={false}
                {...protect}
                style={{
                  filter: [plate.grade, shade ? "brightness(0.42) saturate(0.8)" : ""].filter(Boolean).join(" ") || undefined,
                  transform: plate.crop ? `scale(${plate.crop})` : undefined,
                  transformOrigin: plate.cropAt,
                }}
                className="h-full w-full object-cover"
              />
            );
            return (
              <div
                key={f}
                className="absolute inset-0 [transform-style:preserve-3d]"
                style={{ transform: `rotateX(${f * STEP}deg) translateZ(var(--r))` }}
              >
                {/* the card's face, with its small caption under it */}
                <button
                  ref={first ? (n) => register?.(k, n) : undefined}
                  type="button"
                  tabIndex={first ? 0 : -1}
                  aria-hidden={first ? undefined : true}
                  onClick={() => onOpen(k)}
                  aria-label={label(plate, k)}
                  className="group absolute inset-0 cursor-zoom-in [backface-visibility:hidden]"
                >
                  <span className="block h-full w-full overflow-hidden rounded-[10px] bg-[#33303c] shadow-[0_14px_40px_-18px_rgba(0,0,0,0.55)]">{img(false)}</span>
                  <span className="absolute left-0.5 top-[calc(100%+0.45rem)] whitespace-nowrap text-left font-geo text-[10px] tracking-[0.01em] text-platinum/70">
                    {caption(plate, k)}
                  </span>
                </button>
                {/* its back, seen on the far side of the drum through the gaps: in shade */}
                <div
                  aria-hidden
                  className="absolute inset-0 overflow-hidden rounded-[10px] [backface-visibility:hidden]"
                  style={{ transform: "rotateX(180deg)" }}
                >
                  {img(true)}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
