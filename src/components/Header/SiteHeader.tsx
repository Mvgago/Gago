import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Monolith } from "../Monolith/Monolith";
import { SpatialIndex, preloadLogoSpace } from "../SpatialIndex/SpatialIndex";
import { EASE_HAUS } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LanguageSwitch } from "../../i18n/LanguageSwitch";
import { WALL, isLightRoom } from "../Light/LightWall";

// The corner logo is the same 3D model as the index sculpture; the 2D mark stands in while it loads.
const Logo3D = lazy(() => import("../Monolith/Logo3D"));

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  const { t } = useI18n();

  // Any navigation closes the index.
  useEffect(close, [pathname, close]);

  // On the light inner rooms, once the page scrolls, the header takes the wall's
  // colour behind it, so content never shows through under the logo.
  const onLight = isLightRoom(pathname);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Fetch the index sculpture in the background once the landing has settled.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void preloadLogoSpace(), { timeout: 4000 });
    return () => cancel(id);
  }, []);

  // When the index closes, keyboard focus returns to the button that opened it.
  const toggle = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) toggle.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // The index control is the one solid form on the page: a graphite pill with
  // platinum type, so the way in is found at a glance without shouting.
  const tone = "text-platinum";
  const line = "bg-platinum";

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5 md:px-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: EASE_HAUS, delay: 0.4 }}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 border-b border-ink/[0.06] backdrop-blur-md transition-opacity duration-500 ${
            onLight && scrolled && !open ? "opacity-100" : "opacity-0"
          }`}
          // Translucent, so light falling on the page behind (as on "info") carries on under it
          style={{ background: `${WALL}cc` }}
        />
        <div className="relative">
        {/* While the index is open the sculpture is the brand, so the corner becomes a
            second way out: home, balancing the close control on the right. */}
        <Link
          to="/"
          onClick={close}
          tabIndex={open ? undefined : -1}
          aria-hidden={!open}
          aria-label={t("index.home")}
          // The two never share the corner: each one leaves quickly before the other arrives.
          className={`absolute left-0 top-0 flex h-[2.35rem] w-10 items-center text-ink transition-opacity ${
            open
              ? "opacity-100 delay-300 duration-700 hover:opacity-70 hover:delay-0 hover:duration-300"
              : "pointer-events-none opacity-0 duration-150"
          }`}
        >
          {/* "Fg", the wordmark's own F and g in hairline: the brand's sign for home.
              (A lone g, this small, read as a screen icon rather than a letter.) */}
          <svg viewBox="250 678 652 400" className="h-[22px] w-9" fill="none" stroke="currentColor" strokeWidth={28} aria-hidden>
            <path d="M570 695H300A33 33 0 0 0 267 728V976M267 826H570" />
            <path d="M1225 960H985A35 35 0 0 1 950 925V807A35 35 0 0 1 985 772H1225V1025A35 35 0 0 1 1190 1060H935" transform="translate(-340 0)" />
          </svg>
        </Link>

        {/* Corner brand: the 3D wordmark, small, in the brand's satin pearl */}
        <Link
          to="/"
          aria-label="Fuga Haus — home"
          tabIndex={open ? -1 : undefined}
          className={`block w-28 transition-opacity md:w-32 ${
            open
              ? "pointer-events-none opacity-0 duration-200"
              : // Phones: the mark is small and its hairline bars fade into the mauve,
                // so it shows at full strength, a touch brighter, with a soft lift.
                "opacity-[0.82] delay-300 duration-700 hover:opacity-100 hover:delay-0 hover:duration-200 max-sm:opacity-100 max-sm:[filter:brightness(1.18)_drop-shadow(0_1px_5px_rgba(40,32,38,0.35))]"
          }`}
        >
          <Suspense fallback={<Monolith tilt={false} tone="warm" reveal={false} />}>
            <Logo3D className="w-full" paused={open} />
          </Suspense>
        </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <LanguageSwitch />

          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((v) => !v)}
            onPointerEnter={() => void preloadLogoSpace()}
            onFocus={() => void preloadLogoSpace()}
            aria-expanded={open}
            aria-label={open ? t("index.aria.close") : t("index.aria.open")}
            className="group flex items-center gap-3.5 rounded-full bg-ink/90 px-5 py-2.5 shadow-[0_10px_30px_-12px_rgba(40,34,38,0.55)] backdrop-blur-md transition-colors duration-500 hover:bg-ink focus-visible:outline-offset-2"
          >
            <span className={`meta min-w-10 text-left transition-colors duration-700 ${tone}`}>{open ? t("index.close") : t("index.open")}</span>
            <span className="relative block h-2 w-4">
              <span
                className={`absolute right-0 top-0 h-px ${line} transition-all duration-700 ease-haus ${
                  open ? "top-1 w-4 rotate-45" : "w-4"
                }`}
              />
              <span
                className={`absolute bottom-0 right-0 h-px ${line} transition-all duration-700 ease-haus ${
                  open ? "bottom-1 w-4 -rotate-45" : "w-2.5 group-hover:w-4"
                }`}
              />
            </span>
          </button>
        </div>
      </motion.header>

      <SpatialIndex open={open} onClose={close} />
    </>
  );
};
