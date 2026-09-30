import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Monolith } from "../Monolith/Monolith";
import { StudioStatus } from "../Meta/Meta";
import { SpatialIndex } from "../SpatialIndex/SpatialIndex";
import { EASE_HAUS } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LanguageSwitch } from "../../i18n/LanguageSwitch";

// The corner logo is the same 3D model as the index sculpture; the 2D mark stands in while it loads.
const Logo3D = lazy(() => import("../Monolith/Logo3D"));

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  const { t } = useI18n();

  // Any navigation closes the index.
  useEffect(close, [pathname, close]);

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
        className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: EASE_HAUS, delay: 0.4 }}
      >
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
              ? "opacity-75 delay-300 duration-700 hover:opacity-100 hover:delay-0 hover:duration-300"
              : "pointer-events-none opacity-0 duration-150"
          }`}
        >
          {/* Hairline house, drawn like the social icons */}
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" aria-hidden>
            <path d="M3.5 11 12 4l8.5 7" />
            <path d="M5.5 9.5V20h13V9.5" />
            <path d="M10 20v-5.5h4V20" />
          </svg>
        </Link>

        {/* Corner brand: the 3D wordmark, small, in the brand's satin pearl */}
        <Link
          to="/"
          aria-label="Fuga Haus — home"
          tabIndex={open ? -1 : undefined}
          className={`block w-24 transition-opacity sm:w-28 md:w-32 ${
            open
              ? "pointer-events-none opacity-0 duration-200"
              : "opacity-[0.82] delay-300 duration-700 hover:opacity-100 hover:delay-0 hover:duration-200"
          }`}
        >
          <Suspense fallback={<Monolith tilt={false} tone="warm" reveal={false} />}>
            <Logo3D className="w-full" paused={open} />
          </Suspense>
        </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <StudioStatus className="hidden text-ink lg:flex" />
          <LanguageSwitch />

          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((v) => !v)}
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
