import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useAnimationControls, useReducedMotion, type Variants } from "framer-motion";
import { Monolith } from "../Monolith/Monolith";
import { SpatialIndex, preloadLogoSpace } from "../SpatialIndex/SpatialIndex";
import { EASE_HAUS, EASE_VEIL } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LanguageSwitch } from "../../i18n/LanguageSwitch";
import { WALL, isLightRoom } from "../Light/LightWall";

// Arriving at the landing from any other page, the corner pieces come in again instead of standing fixed,
// the way the lema does: each one comes down out of its own top edge, as if from behind a mask, and comes
// into focus as it lands; the logo first, then the index, then the language.
// (the 3D logo comes in without the haze: a CSS filter over its WebGL canvas made it flicker on phones)
type Unfold = { delay: number; haze?: boolean };
const UNFOLD: Variants = {
  folded: ({ haze = true }: Unfold) => ({
    y: "-105%",
    opacity: 0,
    ...(haze ? { filter: "blur(6px)" } : {}),
    transition: { duration: 0.35, ease: EASE_VEIL },
  }),
  open: ({ delay, haze = true }: Unfold) => ({
    y: 0,
    opacity: 1,
    ...(haze ? { filter: "blur(0px)" } : {}),
    // (the lema's own timing and curve)
    transition: { duration: 1.4, ease: EASE_HAUS, delay },
    ...(haze ? { transitionEnd: { filter: "none" } } : {}),
  }),
};
/** Sent by the landing once it is on screen: the cue for the corner pieces to come down. */
export const LANDING_IN = "fh:landing-in";
/** The mask's edge: the box's own top and bottom; open at the sides, so nothing is cut but the fall. */
const MASK = "inset(0% -40% 0% -40%)";

// The corner logo is the same 3D model as the index sculpture; the 2D mark stands in while it loads.
const Logo3D = lazy(() => import("../Monolith/Logo3D"));

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  const { t } = useI18n();

  const unfold = useAnimationControls();
  const still = useReducedMotion();
  const last = useRef(pathname);
  const folded = useRef(false);
  // the mask is on only while the pieces come in (left on, it would cut the language list and the index's waves)
  const [masked, setMasked] = useState(false);
  useEffect(() => {
    const from = last.current;
    last.current = pathname;
    // left again before the unfolding finished: the pieces simply stand where they belong
    if (pathname !== "/" || from === "/" || still) {
      if (folded.current) void unfold.start("open").then(() => setMasked(false));
      folded.current = false;
      return;
    }
    let gone = false;
    folded.current = true;
    setMasked(true);
    // The pieces come down once the landing is in place and painted, not while it is being built
    // (on a phone, the fall then ran during the busiest moment and stuttered)
    let arrived = false, hidden = false, wait = 0;
    const fall = () => {
      if (gone || !arrived || !hidden) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (gone) return;
          void unfold.start("open").then(() => {
            folded.current = false;
            setMasked(false);
          });
        }),
      );
    };
    const onLanding = () => {
      arrived = true;
      fall();
    };
    window.addEventListener(LANDING_IN, onLanding, { once: true });
    // (never left waiting, should the landing's signal not come)
    wait = window.setTimeout(onLanding, 1400);
    void unfold.start("folded").then(() => {
      hidden = true;
      fall();
    });
    return () => {
      gone = true;
      window.clearTimeout(wait);
      window.removeEventListener(LANDING_IN, onLanding);
    };
  }, [pathname, still, unfold]);

  // Any navigation closes the index.
  useEffect(close, [pathname, close]);

  // On the light inner rooms, once the page scrolls, the header takes the wall's
  // colour behind it, so content never shows through under the logo.
  const onLight = isLightRoom(pathname);
  // phones, everywhere but the landing: a smaller mark and index, so the header keeps out of the page's way;
  // the language too is left out (it stays on the landing, and in the index)
  const compact = pathname !== "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // The 3D logo and the index sculpture wait until the page has loaded and settled: the 2D mark holds
  // the corner meanwhile, so three.js never competes with the first view (on phones it doubled the
  // time before the page could be used)
  const [logo3d, setLogo3d] = useState(false);
  useEffect(() => {
    let id = 0;
    const later = () => {
      id = window.setTimeout(() => {
        setLogo3d(true);
        const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
        idle(() => void preloadLogoSpace(), { timeout: 6000 });
      }, 1800);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", later);
    };
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

  // The index control introduces itself once: the word shows on the first view of the landing, then folds
  // to its sign and stays folded for the rest of the visit, on every page (a visit that begins on another
  // page starts folded). A hover or keyboard focus still brings the word back for a moment.
  const [tucked, setTucked] = useState(() => window.location.pathname !== "/");
  useEffect(() => {
    if (tucked) return;
    if (pathname !== "/") return setTucked(true);
    const id = window.setTimeout(() => setTucked(true), 7000);
    return () => window.clearTimeout(id);
  }, [pathname, tucked]);
  const [near, setNear] = useState(false);
  const shortPill = tucked && !open && !near;

  // When the index closes, keyboard focus returns to the button that opened it.
  const toggle = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) toggle.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // The index control is the one solid form on the page: a graphite pill with
  // platinum type, so the way in is found at a glance without shouting.
  // Folded to its sign, the control turns to glass: a pane of frosted light with the lines in the
  // ink of the type, so it belongs to the airy page instead of sitting on it like a solid tile
  // (on the two dark rooms, a darker glass with pale lines). The invitation plays only while the word shows.
  const glass = shortPill;
  const darkRoom = pathname === "/projects" || pathname === "/artwork" || pathname === "/about";
  const glow = inviting && !glass;
  const tone = "text-platinum";
  const line = glass && !darkRoom ? "bg-ink/80" : "bg-platinum";
  const surface = !glass
    ? "border-transparent bg-ink/90 hover:bg-[#4d4744]"
    : darkRoom
      ? "border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/[0.12]"
      // (no bright rim: over a photograph a white edge read as a frame drawn round it; a faint ink hairline
      // holds the pane instead, on a pale wall and on a picture alike)
      : "border-ink/[0.08] bg-white/[0.32] shadow-[0_6px_18px_-12px_rgba(40,32,36,0.3)] hover:bg-white/[0.45]";

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
          className={`pointer-events-none absolute inset-x-0 top-0 -z-10 transition-opacity duration-500 ${pathname === "/about" ? "bottom-0 border-b backdrop-blur-xl" : "bottom-0 border-b border-ink/[0.06] backdrop-blur-md"} ${
            (onLight || pathname === "/artwork") && scrolled && !open ? "opacity-100" : "opacity-0"
          }`}
          // Translucent, so light falling on the page behind (as on "info") carries on under it
                    // (the studio: nearly solid and heavily blurred, so nothing reads through behind the logo, yet it
                    // takes the tone of the lit wall under it instead of standing a shade darker; closed by a
                    // single faint line of light)
          style={{
            background:
              pathname === "/artwork"
                ? "#232227cc"
                : pathname === "/about"
                  ? "rgba(56,52,50,0.82)"
                  : `${WALL}cc`,
            borderColor: pathname === "/artwork" ? "rgba(255,255,255,0.06)" : pathname === "/about" ? "rgba(244,241,237,0.09)" : undefined,
          }}
        />
        <div className="relative" style={masked ? { clipPath: MASK } : undefined}>
        <motion.div variants={UNFOLD} custom={{ delay: 0, haze: false } satisfies Unfold} animate={unfold}>
        {/* Corner brand: the 3D wordmark, small, in the brand's satin pearl */}
        <Link
          to="/"
          aria-label="Fuga Haus — home"
          tabIndex={open ? -1 : undefined}
                    // One size on every page, the landing's (it also never changes: resizing the 3D canvas cleared it
          // for a frame, and the logo flickered)
          className={`block w-28 md:w-36 transition-opacity ${
            open
              ? "pointer-events-none opacity-0 duration-200"
              : // Phones: the mark is small and its hairline bars fade into the mauve,
                // so it shows at full strength and a touch brighter (no shadow: it muddied the mark).
                "opacity-[0.82] delay-300 duration-700 hover:opacity-100 hover:delay-0 hover:duration-200 max-sm:opacity-100 max-sm:[filter:brightness(1.18)]"
          }`}
        >
          {logo3d ? (
            <Suspense fallback={<Monolith tilt={false} tone="warm" reveal={false} />}>
              <Logo3D className="w-full" paused={open} />
            </Suspense>
          ) : (
            <Monolith tilt={false} tone="warm" reveal={false} />
          )}
        </Link>
        </motion.div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <div className={compact ? "max-sm:hidden" : ""} style={masked ? { clipPath: MASK } : undefined}>
            <motion.div variants={UNFOLD} custom={{ delay: 0.24 } satisfies Unfold} animate={unfold}>
              <LanguageSwitch dark={(pathname === "/projects" || pathname === "/artwork" || pathname === "/about") && !open} />
            </motion.div>
          </div>

          <style>{`@keyframes fh-bloom{0%,100%{opacity:0;transform:scale(.9)}35%{opacity:.85;transform:scale(1.15)}70%{opacity:0;transform:scale(1.3)}}@keyframes fh-halo{0%{transform:scale(1);opacity:0}12%{opacity:.75}80%,100%{transform:scale(1.35,1.6);opacity:0}}@keyframes fh-open{0%,100%{letter-spacing:.08em}14%,30%{letter-spacing:.2em}44%{letter-spacing:.08em}}@keyframes fh-sheen{0%,8%{transform:translateX(-110%)}52%,100%{transform:translateX(70%)}}@keyframes fh-nudge{0%,100%{transform:scale(1)}18%{transform:scale(1.025)}40%{transform:scale(1)}}@keyframes fh-draw{0%,55%,100%{width:.625rem}20%,35%{width:1rem}}@keyframes fh-thread{0%,6%{transform:scaleX(0);opacity:1}30%{transform:scaleX(1);opacity:1}48%,100%{transform:scaleX(1);opacity:0}}@media (prefers-reduced-motion:reduce){.fh-invite *{animation:none!important}}`}</style>
          <div style={masked ? { clipPath: MASK } : undefined}>
          <motion.div variants={UNFOLD} custom={{ delay: 0.12 } satisfies Unfold} animate={unfold}>
          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((v) => !v)}
            onPointerEnter={(e) => {
              void preloadLogoSpace();
              if (e.pointerType === "mouse") setNear(true);
            }}
            onPointerLeave={() => setNear(false)}
            onFocus={(e) => {
              void preloadLogoSpace();
              if (e.currentTarget.matches(":focus-visible")) setNear(true);
            }}
            onBlur={() => setNear(false)}
            aria-expanded={open}
            aria-label={open ? t("index.aria.close") : t("index.aria.open")}
            // Hover, quietly: the graphite lifts a shade lighter, the letters open a touch, the short line grows. No shadow.
            // (smaller on phones, where it took too much of the header)
            // (the gap between word and sign lives inside the word, so it folds away with it; folded, the
            // pill's sides draw in to the height, closing round the sign)
            className={`group relative flex items-center rounded-[0.6rem] border ${surface} py-1.5 backdrop-blur-md backdrop-saturate-150 [&_.meta]:text-[10px] ${shortPill ? "px-2" : "px-2.5"} sm:py-2 sm:[&_.meta]:text-[12px] ${shortPill ? "sm:px-2.5" : "sm:px-4"} transition-[background-color,border-color,box-shadow,padding] duration-700 ease-haus focus-visible:outline-offset-2 ${glow ? "fh-invite will-change-transform" : ""}`}
          >
            {glow && (
              // the site's own motif ("hilando fino"): a single thread of light drawn along the pill's lower
              // edge, left to right, fading out as it reaches the end, while the sign's short line draws out
              <span aria-hidden className="pointer-events-none absolute inset-x-3 -bottom-px h-px overflow-hidden">
                <span
                  className="absolute inset-0 origin-left"
                  style={{
                    background: "linear-gradient(90deg, rgba(244,241,237,0) 0%, rgba(244,241,237,0.9) 45%, rgba(244,241,237,0.35) 85%, rgba(244,241,237,0) 100%)",
                    boxShadow: "0 0 8px rgba(244,241,237,0.45)",
                    animation: "fh-thread 7s cubic-bezier(.65,0,.35,1) 2",
                  }}
                />
              </span>
            )}
            {/* (the word folds to nothing and the gap with it, so the pill closes round the sign) */}
            <motion.span
              aria-hidden
              className="block overflow-hidden whitespace-nowrap"
              initial={false}
              animate={shortPill ? { width: 0, opacity: 0, filter: "blur(4px)" } : { width: "auto", opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: EASE_HAUS, opacity: { duration: shortPill ? 0.4 : 0.8, ease: EASE_HAUS, delay: shortPill ? 0 : 0.15 } }}
            >
              <span className={`meta block min-w-10 pr-2 text-left transition-[color,letter-spacing] duration-500 group-hover:tracking-[0.18em] sm:pr-3 ${tone}`}>{open ? t("index.close") : t("index.open")}</span>
            </motion.span>
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
                style={glow ? { animation: "fh-draw 7s cubic-bezier(.65,0,.35,1) 2" } : undefined}
              />
            </span>
          </button>
          </motion.div>
          </div>
        </div>
      </motion.header>

      <SpatialIndex open={open} onClose={close} />
    </>
  );
};
