import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export type DrumPlate = { id: string; url: string; title?: string; grade?: string; crop?: number; cropAt?: string };

/**
 * The illustrations on a see-through drum turning about a horizontal axis, as a watch's crown turns its
 * list: flat cards round a cylinder, the one in front facing the viewer, those above and below folding
 * away, and through the gaps between them the cards on the far side of the drum, smaller and in shade.
 * Scrolling turns it a card at a time, resting a moment on each. Plain CSS 3D (transforms only), so it
 * turns smoothly on any phone.
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
  // a card at a time: through most of each stretch of scroll the drum rests with a card in front, and it
  // turns to the next in between
  const stepped = useTransform(scrollYProgress, (p) => {
    const x = p * faces;
    const i = Math.floor(x), f = x - i;
    const u = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
    return i + u * u * (3 - 2 * u);
  });
  // and a soft spring over it, so each turn starts and lands gently
  const turnTo = useSpring(stepped, { stiffness: 110, damping: 24, mass: 0.6 });
  const ring = useTransform(turnTo, (n) => `translateZ(calc(var(--r) * -1)) rotateX(${still ? 0 : -n * STEP}deg)`);

  return (
    <div ref={box} className="relative h-[340svh]">
      <div
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [perspective:calc(var(--h)*5.2)] [--h:min(52vw,300px)] lg:[--h:min(30vw,360px)]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        }}
      >
        <motion.div
          className="relative [--r:calc(var(--h)*2.12)] [transform-style:preserve-3d]"
          style={{ width: "var(--h)", height: "var(--h)", transform: ring, willChange: "transform" }}
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
