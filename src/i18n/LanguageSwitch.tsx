import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LANGS } from "./strings";
import { useI18n } from "./I18n";
import { EASE_HAUS } from "../lib/motion";

/**
 * Language selector for the header: at rest only the current code shows.
 * Wide screens: hovering or clicking unfolds the other three to its left,
 * inline. Phones: they drop down in a small list, so the header never crowds.
 */
export const LanguageSwitch: React.FC<{ className?: string; dark?: boolean }> = ({ className = "", dark = false }) => {
  // On a dark page (the projects stage) the visible codes turn pale; the dropdown keeps its light sheet
  const ink = dark ? "text-platinum" : "text-ink";
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const others = LANGS.filter((l) => l !== lang);

  // Hover intent (mouse only): open quickly, close with a little grace.
  const schedule = (next: boolean, delay: number) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (l: (typeof LANGS)[number]) => {
    setLang(l);
    setOpen(false);
  };

  const code = "font-mono text-[13px] font-normal lowercase tracking-[0.1em] transition-colors duration-500";

  return (
    <div
      ref={root}
      className={`relative flex items-center ${className}`}
      role="group"
      aria-label={t("lang.label")}
      onPointerEnter={schedule(true, 80)}
      onPointerLeave={schedule(false, 350)}
    >
      {/* Wide screens: the other codes unfold inline to the left */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="others"
            className="hidden items-center overflow-hidden sm:flex"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_HAUS }}
          >
            <span className="flex items-center gap-2.5 whitespace-nowrap pr-2.5">
              {others.map((l) => (
                <React.Fragment key={l}>
                  <button
                    type="button"
                    lang={l}
                    onClick={() => choose(l)}
                    className={`${code} ${dark ? "text-platinum/70 hover:text-platinum" : "text-ink/75 hover:text-ink"}`}
                  >
                    {l}
                  </button>
                  <span aria-hidden className={dark ? "text-platinum/45" : "text-ink/55"}>
                    ·
                  </span>
                </React.Fragment>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The current language: the only thing visible at rest */}
      <button
        type="button"
        onClick={(e) => {
          // After a hover-open, a mouse click shouldn't fold it straight back.
          if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return setOpen(true);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className={`${code} flex h-9 items-center px-2 ${ink} sm:px-0`}
      >
        {lang}
        <span
          aria-hidden
          className={`ml-1 inline-block ${dark ? "text-platinum/70" : "text-ink/75"} transition-transform duration-500 ease-haus sm:ml-1.5 ${
            open ? "sm:rotate-90" : ""
          } ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* Phones: the other codes drop down in a small list */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="list"
            className="absolute right-0 top-full z-10 mt-1 rounded-md border border-ink/15 bg-[#f8f6f4]/[0.97] py-1 shadow-[0_16px_40px_-16px_rgba(40,32,36,0.4)] sm:hidden"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: EASE_HAUS }}
          >
            {others.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  lang={l}
                  onClick={() => choose(l)}
                  className={`${code} block w-full px-4 py-2 text-left text-ink/80 hover:text-ink`}
                >
                  {l}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
