import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGS, STRINGS, type Key, type Lang } from "./strings";

/**
 * Site language. On a first visit it follows the browser's language (not the
 * country: a German living in Madrid still reads German); if that is not one
 * of the four, English. A choice made in the selector is remembered.
 */

const STORAGE_KEY = "fugahaus.lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
  } catch {
    // Storage can be blocked (private mode); fall through to the browser language.
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if ((LANGS as readonly string[]).includes(base)) return base as Lang;
  }
  return "en";
}

type I18n = { lang: Lang; setLang: (l: Lang) => void; t: (key: Key) => string };

const I18nContext = createContext<I18n | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Not remembered this time; the page still switches.
    }
  }, []);

  // The page's language, and its description for search engines, follow the visitor.
  // The title is the brand line, the same in every language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", STRINGS[lang]["meta.description"]);
  }, [lang]);

  const value = useMemo<I18n>(() => ({ lang, setLang, t: (key) => STRINGS[lang][key] }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18n => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};
