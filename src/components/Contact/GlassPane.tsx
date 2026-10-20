import React, { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * A pane of smoked glass with real depth: it leans a few degrees towards the pointer, a soft light
 * slides across its face and along its edge as it turns, and its shadow falls on the wall behind,
 * away from the light.
 */
export const GlassPane: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => {
  const box = useRef<HTMLDivElement>(null);
  // where the pointer is, from -1 to 1 either way of the pane's middle
  const px = useMotionValue(0), py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return; // phones: the glass stays still
    const onMove = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 240);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 240);
      px.set(Math.max(-1, Math.min(1, x)));
      py.set(Math.max(-1, Math.min(1, y)));
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [px, py]);

  // the lean, a few degrees at most
  const rotateY = useTransform(sx, (v) => v * 5);
  const rotateX = useTransform(sy, (v) => -v * 4);
  // the light on the face, where the pointer is; and the edge brightest on that side
  const gx = useTransform(sx, (v) => 50 + v * 45);
  const gy = useTransform(sy, (v) => 50 + v * 45);
  const angle = useTransform([sx, sy], ([x, y]: number[]) => (Math.atan2(y, x) * 180) / Math.PI + 90);
  const face = useMotionTemplate`radial-gradient(55% 45% at ${gx}% ${gy}%, rgba(255,255,255,0.09), transparent 72%)`;
  const edge = useMotionTemplate`linear-gradient(${angle}deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06) 38%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.14))`;
  // the shadow, cast away from the pointer
  const shx = useTransform(sx, (v) => -v * 34);
  const shy = useTransform(sy, (v) => 34 - v * 16);

  return (
    <div ref={box} className={`relative ${className}`} style={{ perspective: 1400 }}>
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-10 bottom-0 top-14 rounded-md bg-black/35 blur-3xl" style={{ x: shx, y: shy }} />
      <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-sm" style={{ background: face }} />
        {/* the edge: a hairline of light round the pane, brighter on the side the light comes from */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm p-px"
          style={{
            background: edge,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default GlassPane;
