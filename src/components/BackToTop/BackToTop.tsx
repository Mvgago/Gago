import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../i18n/I18n";

/**
 * A quiet way back up: a small outlined circle in the bottom-right corner,
 * shown once the page has been scrolled. Not on the landing, which never scrolls.
 * It sits under the index and the artwork viewer, which cover it when open.
 */
export const BackToTop: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  // Distance from the bottom of the screen: the usual margin, or more once the
  // footer scrolls into view, so the circle rests above it and never covers it.
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const update = () => {
      setShown(window.scrollY > 400);
      const footer = document.querySelector("footer");
      const overlap = footer ? window.innerHeight - footer.getBoundingClientRect().top : 0;
      setLift(Math.max(0, overlap));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      aria-label={t("top")}
      tabIndex={shown ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={lift ? { bottom: lift + 16 } : undefined}
      className={`group fixed bottom-6 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-[#efeef0]/80 text-ink backdrop-blur-md transition-[opacity,transform,border-color] duration-500 ease-haus hover:border-ink sm:right-6 md:bottom-8 md:right-8 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <span aria-hidden className="font-mono text-[15px] transition-transform duration-500 ease-haus group-hover:-translate-y-0.5">
        ↑
      </span>
    </button>
  );
};
