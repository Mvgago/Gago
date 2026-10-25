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

  // Each time the landing loads, the control invites a touch: a couple of seconds in, waves leave
  // its edge and a light passes through it, twice, then it rests. Opening the index ends it.
  const [seen, setSeen] = useState(false);
  const [invite, setInvite] = useState(false);
  useEffect(() => {
    if (seen || pathname !== "/") return setInvite(false);
    const id = window.setTimeout(() => setInvite(true), 2000);
    return () => window.clearTimeout(id);
  }, [seen, pathname]);
  useEffect(() => {
    if (open) setSeen(true);
  }, [open]);
  const inviting = invite && !open;

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
            (onLight || pathname === "/artwork") && scrolled && !open ? "opacity-100" : "opacity-0"
          }`}
          // Translucent, so light falling on the page behind (as on "info") carries on under it
          style={{ background: pathname === "/artwork" ? "#0f0e10cc" : `${WALL}cc`, borderColor: pathname === "/artwork" ? "rgba(255,255,255,0.06)" : undefined }}
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
          className={`block w-28 transition-opacity md:w-36 ${
            open
              ? "pointer-events-none opacity-0 duration-200"
              : // Phones: the mark is small and its hairline bars fade into the mauve,
                // so it shows at full strength and a touch brighter (no shadow: it muddied the mark).
                "opacity-[0.82] delay-300 duration-700 hover:opacity-100 hover:delay-0 hover:duration-200 max-sm:opacity-100 max-sm:[filter:brightness(1.18)]"
          }`}
        >
          <Suspense fallback={<Monolith tilt={false} tone="warm" reveal={false} />}>
            <Logo3D className="w-full" paused={open} />
          </Suspense>
        </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <LanguageSwitch dark={(pathname === "/projects" || pathname === "/artwork") && !open} />

          <style>{`@keyframes fh-bloom{0%,100%{opacity:0;transform:scale(.9)}35%{opacity:.85;transform:scale(1.15)}70%{opacity:0;transform:scale(1.3)}}@keyframes fh-halo{0%{transform:scale(1);opacity:0}12%{opacity:.75}80%,100%{transform:scale(1.35,1.6);opacity:0}}@keyframes fh-open{0%,100%{letter-spacing:.08em}14%,30%{letter-spacing:.2em}44%{letter-spacing:.08em}}@keyframes fh-sheen{0%,8%{transform:translateX(-110%)}52%,100%{transform:translateX(70%)}}@keyframes fh-nudge{0%,100%{transform:scale(1)}18%{transform:scale(1.025)}40%{transform:scale(1)}}@keyframes fh-draw{0%,55%,100%{width:.625rem}20%,35%{width:1rem}}@media (prefers-reduced-motion:reduce){.fh-invite *{animation:none!important}}`}</style>
          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((v) => !v)}
            onPointerEnter={() => void preloadLogoSpace()}
            onFocus={() => void preloadLogoSpace()}
            aria-expanded={open}
            aria-label={open ? t("index.aria.close") : t("index.aria.open")}
            // Hover, quietly: the graphite lifts a shade lighter, the letters open a touch, the short line grows. No shadow.
            // (smaller on phones, where it took too much of the header)
            className={`group relative flex items-center gap-2.5 rounded-full bg-ink/90 px-3.5 py-2 backdrop-blur-md max-sm:[&_.meta]:text-[11px] sm:gap-3.5 sm:px-5 sm:py-2.5 transition-colors duration-700 ease-haus hover:bg-[#4d4744] focus-visible:outline-offset-2 ${inviting ? "fh-invite will-change-transform" : ""}`}
          >
            {inviting && (
              <>
                {/* two hairline waves leaving the pill's edge */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border border-white/80 shadow-[0_0_14px_rgba(255,255,255,0.35)]" style={{ animation: "fh-halo 4.8s cubic-bezier(.22,1,.36,1) 2" }} />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border border-white/40" style={{ animation: "fh-halo 4.8s cubic-bezier(.22,1,.36,1) .7s 2" }} />
                {/* a band of light passing over the pill */}
                <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute -inset-y-2 left-0 w-[170%] bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,0.06)_30%,rgba(255,255,255,0.32)_50%,rgba(255,255,255,0.06)_70%,transparent_100%)] blur-[2px]" style={{ animation: "fh-sheen 7s cubic-bezier(.45,0,.25,1) 2" }} />
                </span>
              </>
            )}
            <span className={`meta min-w-10 text-left transition-[color,letter-spacing] duration-500 group-hover:tracking-[0.18em] ${tone}`}>{open ? t("index.close") : t("index.open")}</span>
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
                style={inviting ? { animation: "fh-draw 7s cubic-bezier(.65,0,.35,1) 2" } : undefined}
              />
            </span>
          </button>
        </div>
      </motion.header>

      <SpatialIndex open={open} onClose={close} />
    </>
  );
};
