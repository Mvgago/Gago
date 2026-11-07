import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export type DrumPlate = { id: string; url: string; title?: string; grade?: string; crop?: number; cropAt?: string };

/**
 * The illustrations on a drum turning about a horizontal axis: the piece in front faces the viewer, the
 * ones above and below fold away over the curve. Scrolling turns it, the page held still while it does.
 * Plain CSS 3D (transforms only, on the compositor), so it turns smoothly on any phone.
 */
export const IllustrationDrum: React.FC<{
  plates: DrumPlate[];
  /** how many faces round the drum: the plates repeat until it is full */
  faces?: number;
  label: (plate: DrumPlate, i: number) => string;
  alt: (plate: DrumPlate) => string;
  onOpen: (i: number) => void;
  register?: (i: number, el: HTMLButtonElement | null) => void;
  protect?: React.ImgHTMLAttributes<HTMLImageElement>;
}> = ({ plates, faces = 12, label, alt, onOpen, register, protect }) => {
  const box = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start start", "end end"] });
  // a soft follow of the scroll, so the drum glides rather than steps
  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 });
  const STEP = 360 / faces;
  // one full turn over the held scroll
  const turn = useTransform(eased, [0, 1], [STEP * 0.5, STEP * 0.5 - 360]);
  const ring = useTransform(turn, (a) => `translateZ(calc(var(--r) * -1)) rotateX(${still ? 0 : a}deg)`);

  return (
    <div ref={box} className="relative h-[320svh]">
      <div
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [perspective:950px]"
        // the drum fades into the wall towards its top and bottom
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
        }}
      >
        <motion.div
          className="relative [--h:min(58vw,330px)] [--r:calc(var(--h)*2.15)] [transform-style:preserve-3d] lg:[--h:min(36vw,380px)]"
          style={{ width: "var(--h)", height: "var(--h)", transform: ring, willChange: "transform" }}
        >
          {Array.from({ length: faces }, (_, f) => {
            const k = f % plates.length;
            const plate = plates[k];
            return (
              <button
                key={f}
                ref={f < plates.length ? (n) => register?.(k, n) : undefined}
                type="button"
                tabIndex={f < plates.length ? 0 : -1}
                aria-hidden={f < plates.length ? undefined : true}
                onClick={() => onOpen(k)}
                aria-label={label(plate, k)}
                className="group absolute inset-0 cursor-zoom-in overflow-hidden rounded-[6px] bg-[#33303c] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]"
                style={{ transform: `rotateX(${-f * STEP}deg) translateZ(var(--r))` }}
              >
                <img
                  src={plate.url}
                  alt={f < plates.length ? alt(plate) : ""}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  {...protect}
                  style={{ filter: plate.grade, transform: plate.crop ? `scale(${plate.crop})` : undefined, transformOrigin: plate.cropAt }}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.04]"
                />
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
