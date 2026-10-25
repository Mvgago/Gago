import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

/**
 * Buendía on the projects page, as a place to step into rather than a picture: its destinations as
 * posts, floating at different depths over the one in front, blown up and softened into the room.
 * Every few seconds the posts shuffle and another comes forward; they drift on their own and lean
 * with the pointer, the nearer ones more.
 */

const GREEN = "#7ab561";
const CITIES = [
  { name: "Lisboa", file: "lisboa" },
  { name: "Londres", file: "londres" },
  { name: "Bruselas", file: "bruselas" },
  { name: "Granada", file: "granada" },
  { name: "La Alhambra", file: "leones" },
];
const src = (file: string) => `/concepts/buendia-words/${file}.jpg`;

// Where the posts stand, nearest first: x and y as a share of the frame (the lower left is left to the
// project's name), depth (size, how much it follows the pointer, how sharp), and a lean
const SLOTS = [
  { x: 0.56, y: 0.44, d: 1, r: -3 },
  { x: 0.79, y: 0.3, d: 0.72, r: 6 },
  { x: 0.33, y: 0.27, d: 0.62, r: -7 },
  { x: 0.87, y: 0.56, d: 0.55, r: 4 },
  { x: 0.16, y: 0.5, d: 0.5, r: 8 },
];
const STEP_MS = 3600;

// Buendía's spiral b
const Mark: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 3.5c0 4 0 7.5.4 10.2A5.8 5.8 0 1 0 12.8 7c-2.4 0-4 1.6-4 3.6 0 1.8 1.4 3.1 3.1 3.1 1.6 0 2.7-1.1 2.7-2.5" />
  </svg>
);

const Card: React.FC<{
  city: (typeof CITIES)[number];
  slot: (typeof SLOTS)[number];
  rank: number;
  phase: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  phone: boolean;
}> = ({ city, slot, rank, phase, px, py, phone }) => {
  // the nearer the post, the more it leans with the pointer
  const x = useTransform(px, (v) => v * 46 * slot.d);
  const y = useTransform(py, (v) => v * 30 * slot.d);
  const w = phone ? 44 : 19;
  return (
    <motion.div
      className="absolute"
      style={{ x, y, zIndex: 10 - rank }}
      initial={false}
      animate={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, rotate: slot.r, scale: 0.62 + slot.d * 0.5, filter: `blur(${(1 - slot.d) * 2.4}px) brightness(${0.72 + slot.d * 0.28})` }}
      transition={{ type: "spring", stiffness: 38, damping: 14, mass: 1.1 }}
    >
      {/* drifting on its own, each to its own rhythm */}
      <motion.div
        animate={{ y: [0, -14, 0, 10, 0], rotate: [0, 1.4, 0, -1.2, 0] }}
        transition={{ duration: 9 + phase * 1.7, repeat: Infinity, ease: "easeInOut", delay: phase * 0.6 }}
        style={{ width: `${w}vw`, translateX: "-50%", translateY: "-50%" }}
        className="rounded-[18px] bg-white p-[0.55vw] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),0_12px_30px_-12px_rgba(0,0,0,0.5)] max-sm:p-1.5"
      >
        <div className="relative overflow-hidden rounded-[12px]">
          <img src={src(city.file)} alt="" draggable={false} className="block aspect-[4/5] w-full object-cover" />
          {/* the account, as on its posts */}
          <div className="absolute left-[6%] top-[5%] flex items-center gap-[0.4em] text-[clamp(9px,0.8vw,14px)] font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            <span className="grid place-items-center rounded-full p-[0.25em]" style={{ background: GREEN }}>
              <Mark />
            </span>
            buendia.travel
          </div>
          {/* the green tag, slightly turned */}
          <div
            className="absolute bottom-[7%] left-[6%] -rotate-3 rounded-[4px] px-[0.5em] py-[0.15em] text-[clamp(13px,1.5vw,28px)] font-bold text-white"
            style={{ background: GREEN }}
          >
            {city.name}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const BuendiaScene: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [step, setStep] = useState(0);
  const phone = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  // the shuffle
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  // the pointer, damped
  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 40, damping: 16 }), py = useSpring(rawY, { stiffness: 40, damping: 16 });
  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [rawX, rawY, reduced]);

  // which post stands in which place: each moves one place on at every step
  const rankOf = (i: number) => (i - (step % CITIES.length) + CITIES.length) % CITIES.length;
  const front = CITIES[(step % CITIES.length + CITIES.length) % CITIES.length];
  const bgX = useTransform(px, (v) => v * -18), bgY = useTransform(py, (v) => v * -12);

  return (
    <div className={`overflow-hidden bg-[#1f2a1c] ${className}`}>
      {/* the destination in front, filling the room, softened and tinted with the brand's green */}
      <motion.div className="absolute -inset-[6%]" style={{ x: bgX, y: bgY }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={front.file}
            src={src(front.file)}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "blur(26px) saturate(1.15)" }}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 0.75, scale: 1.04, transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 1.4 } }}
          />
        </AnimatePresence>
      </motion.div>
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(70% 80% at 60% 40%, ${GREEN}33 0%, transparent 60%), linear-gradient(180deg, rgba(20,26,18,0.15) 0%, rgba(20,26,18,0.55) 100%)` }} />
      {CITIES.map((city, i) => {
        const rank = rankOf(i);
        return <Card key={city.file} city={city} slot={SLOTS[rank]} rank={rank} phase={i} px={px} py={py} phone={phone} />;
      })}
    </div>
  );
};

export default BuendiaScene;
