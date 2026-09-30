import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Monolith } from "../Monolith/Monolith";
import { StudioStatus } from "../Meta/Meta";
import { SpatialIndex } from "../SpatialIndex/SpatialIndex";
import { EASE_HAUS } from "../../lib/motion";

// The corner logo is the same 3D model as the index sculpture; the 2D mark stands in while it loads.
const Logo3D = lazy(() => import("../Monolith/Logo3D"));

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);

  // Any navigation closes the index.
  useEffect(close, [pathname, close]);

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
        {/* Corner brand: the 3D wordmark, small, in the brand's satin pearl */}
        <Link
          to="/"
          aria-label="Fuga Haus — home"
          className={`block w-24 transition-opacity duration-700 hover:opacity-100 hover:duration-200 sm:w-28 md:w-32 ${
            open ? "pointer-events-none opacity-0" : "opacity-[0.82]"
          }`}
        >
          <Suspense fallback={<Monolith tilt={false} tone="warm" reveal={false} />}>
            <Logo3D className="w-full" />
          </Suspense>
        </Link>

        <div className="flex items-center gap-8">
          <StudioStatus className="hidden text-ink/80 lg:flex" />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close index" : "Open index"}
            className="group flex items-center gap-3.5 rounded-full bg-ink/90 px-5 py-2.5 shadow-[0_10px_30px_-12px_rgba(40,34,38,0.55)] backdrop-blur-md transition-colors duration-500 hover:bg-ink focus-visible:outline-offset-2"
          >
            <span className={`meta w-10 text-left transition-colors duration-700 ${tone}`}>{open ? "close" : "index"}</span>
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
