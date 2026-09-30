import React, { createContext, useContext, useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { SPRING_LIGHT } from "../../lib/motion";

/**
 * One pointer source for the whole site. Values live in MotionValues so
 * the light can follow the cursor at 60fps without re-rendering React.
 *
 * x / y   → smoothed pointer position in px (viewport space)
 * nx / ny → the same position normalised to [-1, 1] from the centre
 */
type PointerLight = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  nx: MotionValue<number>;
  ny: MotionValue<number>;
};

const PointerLightContext = createContext<PointerLight | null>(null);

// Resting key light: upper right, like the reference photograph.
const REST_X = 0.78;
const REST_Y = 0.32;

export const PointerLightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rawX = useMotionValue(typeof window === "undefined" ? 0 : window.innerWidth * REST_X);
  const rawY = useMotionValue(typeof window === "undefined" ? 0 : window.innerHeight * REST_Y);
  const rawNx = useMotionValue(REST_X * 2 - 1);
  const rawNy = useMotionValue(REST_Y * 2 - 1);

  const x = useSpring(rawX, SPRING_LIGHT);
  const y = useSpring(rawY, SPRING_LIGHT);
  const nx = useSpring(rawNx, SPRING_LIGHT);
  const ny = useSpring(rawNy, SPRING_LIGHT);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      rawNx.set((e.clientX / w) * 2 - 1);
      rawNy.set((e.clientY / h) * 2 - 1);
    };

    // When the pointer leaves the window the light drifts back to rest.
    const onLeave = () => {
      rawX.set(window.innerWidth * REST_X);
      rawY.set(window.innerHeight * REST_Y);
      rawNx.set(REST_X * 2 - 1);
      rawNy.set(REST_Y * 2 - 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY, rawNx, rawNy]);

  return (
    <PointerLightContext.Provider value={{ x, y, nx, ny }}>
      {children}
    </PointerLightContext.Provider>
  );
};

export const usePointerLight = (): PointerLight => {
  const ctx = useContext(PointerLightContext);
  if (!ctx) throw new Error("usePointerLight must be used inside <PointerLightProvider>");
  return ctx;
};
