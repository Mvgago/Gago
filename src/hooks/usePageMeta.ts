import { useEffect } from "react";
import { useI18n } from "../i18n/I18n";
import { cases } from "../outils/cases";

/**
 * Each page names itself in the browser tab and to search engines: its own title and a line on
 * what it holds, in the language chosen. (Link previews read the defaults in index.html, which
 * crawlers see without running the site.)
 */
const PAGES: Record<string, Record<string, [string, string]>> = {
  "/": {
    es: ["Fuga Haus — Estudio de diseño", "Estudio de diseño independiente: estrategia, identidad, 3D interactivo y diseño web, y vídeo y motion."],
    en: ["Fuga Haus — Design studio", "Independent design studio: strategy, identity, interactive 3D and web design, and film."],
    fr: ["Fuga Haus — Studio de design", "Studio de design indépendant : stratégie, identité, 3D interactive et design web, et vidéo et motion design."],
    de: ["Fuga Haus — Designstudio", "Unabhängiges Designstudio: Strategie, Identität, interaktives 3D und Webdesign sowie Film."],
  },
  "/about": {
    es: ["Estudio — Fuga Haus", "Qué hace el estudio: vídeo y motion, 3D interactivo y diseño web, espacios y eventos, estrategia e identidad."],
    en: ["Studio — Fuga Haus", "What the studio does: film, interactive 3D and web design, spaces and events, strategy and identity."],
    fr: ["Studio — Fuga Haus", "Ce que fait le studio : vidéo et motion design, 3D interactive et design web, espaces et événements, stratégie et identité."],
    de: ["Studio — Fuga Haus", "Was das Studio macht: Film, interaktives 3D und Webdesign, Räume und Events, Strategie und Identität."],
  },
  "/projects": {
    es: ["Proyectos — Fuga Haus", "Proyectos de identidad, web, 3D y comunicación."],
    en: ["Projects — Fuga Haus", "Identity, web, 3D and communication projects."],
    fr: ["Projets — Fuga Haus", "Projets d'identité, web, 3D et communication."],
    de: ["Projekte — Fuga Haus", "Projekte in Identität, Web, 3D und Kommunikation."],
  },
  "/artwork": {
    es: ["Laboratorio — Fuga Haus", "Ilustración, fotografía y sonido: piezas del estudio y Fuga Sei."],
    en: ["Lab — Fuga Haus", "Illustration, photography and sound: the studio's pieces and Fuga Sei."],
    fr: ["Laboratoire — Fuga Haus", "Illustration, photographie et son : les pièces du studio et Fuga Sei."],
    de: ["Labor — Fuga Haus", "Illustration, Fotografie und Klang: Arbeiten des Studios und Fuga Sei."],
  },
  "/privacy": {
    es: ["Privacidad — Fuga Haus", "Cómo trata los datos esta web."],
    en: ["Privacy — Fuga Haus", "How this website handles data."],
    fr: ["Confidentialité — Fuga Haus", "Comment ce site traite les données."],
    de: ["Datenschutz — Fuga Haus", "Wie diese Website mit Daten umgeht."],
  },
  "/legal": {
    es: ["Aviso legal — Fuga Haus", "Titular de la web y condiciones de uso."],
    en: ["Legal notice — Fuga Haus", "Owner of the site and terms of use."],
    fr: ["Mentions légales — Fuga Haus", "Titulaire du site et conditions d'utilisation."],
    de: ["Impressum — Fuga Haus", "Inhaber der Website und Nutzungsbedingungen."],
  },
};

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

export function usePageMeta(pathname: string) {
  const { lang } = useI18n();
  useEffect(() => {
    let title: string, desc: string;
    const slug = pathname.startsWith("/projects/") ? pathname.slice("/projects/".length) : null;
    const c = slug ? cases.find((k) => k.slug === slug) : null;
    if (c) {
      title = `${c.title} — Fuga Haus`;
      desc = (c.body?.[lang as "es"] ?? c.lead[lang as "es"] ?? c.lead.es).slice(0, 160);
    } else {
      const p = PAGES[pathname] ?? PAGES["/"];
      [title, desc] = p[lang] ?? p.es;
    }
    document.title = title;
    document.documentElement.lang = lang;
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", `https://fugahaus.com${pathname}`, "property");
  }, [pathname, lang]);
}
