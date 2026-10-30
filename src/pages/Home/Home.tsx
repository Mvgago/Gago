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

    {/* (phones and tablets: the address and icons set well apart below, as the screen's foot, so the
        manifesto sits higher and "see the projects" stands alone as the one thing to do) */}
    <section className="relative flex flex-col gap-[12vh] px-4 pb-5 sm:gap-16 sm:px-6 sm:pb-8 lg:flex-row lg:gap-5 lg:items-end lg:justify-between lg:px-8 lg:pb-8">
      {/* Manifesto */}
      <div className="max-w-xl lg:max-w-3xl">
        {/* The lema and the line under it are one way in: both lead to what the studio does.
            They arrive line by line, each rising out of its own edge and coming into focus, then
            the disciplines one after another */}
        <style>{`@keyframes fh-line{from{transform:translateY(105%);opacity:0;filter:blur(6px)}to{transform:none;opacity:1;filter:none}}@keyframes fh-word{from{transform:translateY(8px);opacity:0;filter:blur(4px)}to{transform:none;opacity:1;filter:none}}@media (prefers-reduced-motion:reduce){.fh-manifesto *{animation:none!important}}`}</style>
        {/* one piece, one way in: the lema and the services under it lead together to the studio's
            services, and lift together on hover */}
        <Link to="/about#servicios" className="fh-manifesto group block origin-bottom-left transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform hover:scale-[1.02] focus-visible:scale-[1.02]">
          {/* Three voices, each its own: the lema, the brightest and largest; the sentence that finishes
              it, smaller but as bright; and the disciplines as quiet labels in the site's small type, apart */}
          <h1 className={`${DISPLAY} !font-normal text-white`}>
            {/* Always two lines, on every screen: the lema reads as one block with the subtitle, broken at
                the space nearest its middle so the two lines carry a like weight */}
            {(() => {
              const title = t("hero.title"), mid = title.length / 2;
              const cut = [...title.matchAll(/ /g)].map((m) => m.index!).reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a), title.indexOf(" "));
              // (a short lema stands whole on one line, in every language: split, a word was left alone)
              const lines = title.length <= 18 ? [title] : [title.slice(0, cut), title.slice(cut + 1)];
              return lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <span className="block" style={{ animation: `fh-line 1.4s cubic-bezier(.22,1,.36,1) ${0.9 + i * 0.16}s both` }}>
                    {line}
                  </span>
                </span>
              ));
            })()}
          </h1>
          {/* who the studio is for: the lema's second half, a sentence of its own that reads on from it */}
          {/* (keyed by its words, so a change of language plays the whole arrival again) */}
          <p key={t("hero.sub")} className={`${SUBTITLE} mt-0 !font-normal text-white [text-wrap:balance]`}>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="block" style={{ animation: "fh-line 1.4s cubic-bezier(.22,1,.36,1) 1.25s both" }}>
                {t("hero.sub")}.
              </span>
            </span>
          </p>
          {/* what the studio does, small and set apart, like the caption under a piece: the disciplines
              in lower case, divided by middle dots, arriving one after another */}
          {/* in the sentence's own type, smaller and quieter: part of the text above, so the mono type is
              left to "ver proyectos" alone, the one thing to do */}
          <p key={t("hero.sub2")} className="mt-3 font-geo text-[15px] font-normal tracking-[0.02em] text-white/60 lg:mt-5 lg:text-[17px]">
            {(() => {
              const parts = t("hero.sub2").split("|");
              return parts.map((part, i) => (
                <span key={part} className="inline-block" style={{ animation: `fh-word 1s cubic-bezier(.22,1,.36,1) ${1.9 + i * 0.12}s both` }}>
                  {part}
                  {i < parts.length - 1 && (
                    <>
                      <span aria-hidden className="px-[0.45em] opacity-60">{"\u00b7"}</span>
                      <span className="sr-only">, </span>
                    </>
                  )}
                </span>
              ));
            })()}
          </p>
        </Link>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12 lg:mt-20">
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
        {/* (not on phones: the address and Instagram are enough down there) */}
        <Link to="/about#contact" className="hidden transition-colors duration-300 hover:text-ink sm:inline">
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
