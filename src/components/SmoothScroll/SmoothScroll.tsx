import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Smooth, inertial scrolling for the whole site (Lenis).
 *
 * - Wheel and trackpad glide with a soft ease (duration 1.2).
 * - Touch keeps the device's own native scroll (syncTouch: false — the
 *   current name of Lenis's former `smoothTouch` option).
 * - Off for visitors who ask for reduced motion: native scroll stays.
 * - Pauses while something locks the page (the index, the artwork viewer set
 *   `overflow: hidden` on <body>), and resumes when it is released.
 * - Anything marked `data-lenis-prevent` (e.g. the artwork strip, which
 *   scrolls sideways) handles its own wheel.
 *
 * `useLenis()` gives components the instance, to scroll programmatically.
 */

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Scrolls to a position or element: smoothly through Lenis when it runs, natively otherwise. */
export function scrollToTarget(lenis: Lenis | null, target: number | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: opts.immediate, offset: opts.offset ?? 0 });
    return;
  }
  const top =
    typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
  window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
}

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.2,
      // Exponential ease-out: quick to respond, long and soft to settle
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
    });
    setLenis(instance);

    // Follow page locks: stop while <body> has overflow hidden
    const sync = () => (document.body.style.overflow === "hidden" ? instance.stop() : instance.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      mo.disconnect();
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};
