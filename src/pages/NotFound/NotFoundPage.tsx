import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { ACTION, BODY, SMALL, TITLE } from "../../lib/type";

/** A page that isn't there: said plainly, set as the legal pages are, with the ways back. */
const COPY = {
  es: { label: "404", title: "Esta página no existe.", text: "Puede que el enlace esté mal escrito o que la página se haya movido.", home: "volver al inicio", work: "ver los proyectos", meta: "Página no encontrada — Fuga Haus" },
  en: { label: "404", title: "This page doesn't exist.", text: "The link may be mistyped, or the page may have moved.", home: "back to the start", work: "see the projects", meta: "Page not found — Fuga Haus" },
  fr: { label: "404", title: "Cette page n'existe pas.", text: "Le lien est peut-être mal écrit, ou la page a été déplacée.", home: "retour à l'accueil", work: "voir les projets", meta: "Page introuvable — Fuga Haus" },
  de: { label: "404", title: "Diese Seite gibt es nicht.", text: "Vielleicht ist der Link falsch geschrieben, oder die Seite ist umgezogen.", home: "zurück zum Start", work: "zu den Projekten", meta: "Seite nicht gefunden — Fuga Haus" },
} as const;

const Way: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className={`${ACTION} group relative inline-block text-ink`}>
    {children}
    <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
    <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
  </Link>
);

export const NotFoundPage: React.FC = () => {
  const { lang } = useI18n();
  const c = COPY[lang as keyof typeof COPY] ?? COPY.es;

  // named as missing in the tab, and kept out of search results
  useEffect(() => {
    document.title = c.meta;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, [c.meta]);

  return (
    <main className="flex min-h-[70vh] items-center px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
      <motion.div variants={rise} initial="hidden" animate="shown" custom={1} className="grid w-full grid-cols-12 gap-x-6">
        <div className="col-span-12 max-w-2xl md:col-span-8 md:col-start-5">
          <p className={`${SMALL} text-graphite`}>{c.label}</p>
          <h1 className={`${TITLE} mt-4 text-ink`}>{c.title}</h1>
          <p className={`${BODY} mt-6 max-w-[44ch] text-graphite`}>{c.text}</p>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
            <Way to="/">{c.home}</Way>
            <Way to="/projects">{c.work}</Way>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
