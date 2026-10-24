import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";
import { useI18n } from "../../i18n/I18n";
import { ACTION, DISPLAY, SMALL, SUBTITLE } from "../../lib/type";

/**
 * Hero as an empty, lit room. The brand lives in the header corner,
 * the centre belongs to the studio light, and a short profile sits
 * low on the left, like a caption on a gallery wall.
 */
export const Home: React.FC = () => {
  const { t } = useI18n();
  // The landing is one screen and nothing more: the page does not scroll here, nor bounce past
  // its edges on phones (which showed the end of the light behind it)
  useEffect(() => {
    const html = document.documentElement;
    const before = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior, body: document.body.style.overscrollBehavior };
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = before.overflow;
      html.style.overscrollBehavior = before.overscroll;
      document.body.style.overscrollBehavior = before.body;
    };
  }, []);
  return (
  <main className="relative flex h-[100svh] w-full select-none flex-col overflow-hidden text-silver sm:min-h-[600px]">
    {/* Portrait screens: the light bloom falls right behind the manifesto, so a soft
        shade gathers under the type to keep the silver legible. */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 lg:hidden"
      style={{
        background:
          "radial-gradient(130% 55% at 0% 72%, rgba(78, 66, 76, 0.55) 0%, rgba(92, 82, 90, 0.3) 45%, transparent 80%)",
      }}
    />

    {/* The centre: intentionally empty. Only light. */}
    <div className="flex-1" aria-hidden />

    <section className="relative flex flex-col gap-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:pb-12">
      {/* Manifesto */}
      <div className="max-w-xl lg:max-w-3xl">
        {/* The lema and the line under it are one way in: both lead to what the studio does.
            They arrive line by line, each rising out of its own edge and coming into focus, then
            the disciplines one after another */}
        <style>{`@keyframes fh-line{from{transform:translateY(105%);opacity:0;filter:blur(6px)}to{transform:none;opacity:1;filter:none}}@keyframes fh-word{from{transform:translateY(8px);opacity:0;filter:blur(4px)}to{transform:none;opacity:1;filter:none}}@media (prefers-reduced-motion:reduce){.fh-manifesto *{animation:none!important}}`}</style>
        <Link to="/about" className="fh-manifesto group block">
          <h1 className={`${DISPLAY} origin-bottom-left transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform group-hover:scale-[1.02] group-focus-visible:scale-[1.02]`}>
            {/* Always two lines, on every screen: the lema reads as one block with the subtitle */}
            {(() => {
              const [first, ...rest] = t("hero.title").split(" ");
              return [first, rest.join(" ")].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <span className="block" style={{ animation: `fh-line 1.4s cubic-bezier(.22,1,.36,1) ${0.9 + i * 0.16}s both` }}>
                    {line}
                  </span>
                </span>
              ));
            })()}
          </h1>
        </Link>

        {/* what the studio does, each word its own way in: straight to that discipline on the studio
            page (identity, web, interactive 3D, film), the words arriving one after another */}
        <p className={`${SUBTITLE} fh-manifesto mt-3 !font-normal text-white [text-wrap:balance] lg:mt-5`}>
          {(() => {
            const parts = t("hero.sub").split("|"), to = [3, 1, 1, 0];
            return parts.map((part, i) => (
              <span key={part} className="inline-block" style={{ animation: `fh-word 1s cubic-bezier(.22,1,.36,1) ${1.5 + i * 0.12}s both` }}>
                {i === parts.length - 1 && <span>{t("hero.and")}&nbsp;</span>}
                <Link
                  to={`/about#disciplina-${to[i]}`}
                  className="group/w relative inline-block transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100 [p:hover_&]:opacity-60"
                >
                  {part}
                  {/* a hairline drawing itself under the word on hover */}
                  <span aria-hidden className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-700 ease-haus group-hover/w:scale-x-100 group-focus-visible/w:scale-x-100" />
                </Link>
                {i < parts.length - 2 ? ",\u00a0" : i === parts.length - 2 ? "\u00a0" : "."}
              </span>
            ));
          })()}
        </p>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12 lg:mt-16">
          <Link
            to="/projects"
            className={`${ACTION} group inline-flex items-center gap-4 text-silver transition-colors duration-500 hover:text-silver focus-visible:text-silver`}
          >
            <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em] group-focus-visible:tracking-[0.12em]">
              {t("hero.cta")}
            </span>
            <span aria-hidden className="relative block h-px w-16 lg:w-20">
              <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:opacity-100 group-hover:scale-x-[1.3] group-focus-visible:scale-x-[1.3]" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Availability and contact: one quiet line, bottom right */}
      <motion.p
        className={`${SMALL} relative flex w-full flex-col items-start gap-1 text-graphite [text-shadow:none] sm:w-auto sm:flex-row sm:items-center sm:gap-3`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 1.8 }}
      >
        {/* the address first; the availability under it leads to the contact form as well */}
        <ContactMenu />
        <span aria-hidden className="hidden sm:inline">·</span>
        <Link to="/about#contact" className="transition-colors duration-300 hover:text-ink">
          {t("availability")} — {new Date().getFullYear()}
        </Link>
        <span aria-hidden className="hidden sm:inline">·</span>
        {/* phones: Instagram in the bottom right corner, apart from the lines on the left */}
        <span className="absolute bottom-0 right-0 sm:static">
          <SocialLinks className="hover:text-ink" />
        </span>
      </motion.p>
    </section>
  </main>
  );
};
